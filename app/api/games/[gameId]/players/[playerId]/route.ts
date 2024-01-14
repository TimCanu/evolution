import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import {
    buildUpdateFoodEvent,
    buildUpdateOpponentsEvent,
    buildUpdatePlayerCardsEvent,
    buildUpdatePlayerSpeciesEvent,
    buildUpdatePlayerStatusEvent,
} from '@/src/lib/pusher.server.service'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'
import { Species } from '@/src/models/species.model'
import { checkPlayerExists } from '@/src/lib/player.service.server'
import { computeEndOfFeedingStageData } from '@/src/lib/food.service.server'
import { Card } from '@/src/models/card.model'
import { PlayerEntity } from '@/src/models/player-entity.model'

export const PUT = async (
    request: NextRequest,
    {
        params,
    }: {
        params: { gameId: string; playerId: string }
    },
) => {
    try {
        const data: { player: Player } = await request.json()
        const game: GameEntity = await getGameEntity(params.gameId)

        checkPlayerExists(game, params.playerId)
        checkForIncorrectActions(params.gameId, params.playerId, data.player.species)

        const playerToUpdate = data.player
        playerToUpdate.status = GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING

        const players = game.players.map((player) => {
            if (player.id === playerToUpdate.id) {
                return { ...playerToUpdate, newSpeciesList: playerToUpdate.species, species: player.species }
            }
            return player
        })

        const haveAllPlayersFinishedEvolving = players.every(
            (player) => player.status === GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        )

        if (!haveAllPlayersFinishedEvolving) {
            const db = await getDb()
            await db.collection('games').updateOne(
                { _id: new ObjectId(params.gameId) },
                {
                    $set: {
                        players: players,
                    },
                },
            )
            await pusherServer.triggerBatch([
                buildUpdatePlayerStatusEvent(
                    params.gameId,
                    playerToUpdate.id,
                    playerToUpdate.status,
                    game.firstPlayerToFeedId,
                    playerToUpdate.numberOfFoodEaten
                ),
            ])
            return NextResponse.json(null, { status: 200 })
        }

        const { playersUpdated, amountOfFoodUpdated } = computeDataForFeedingStage(
            players,
            game.hiddenFoods,
            game.amountOfFood,
            game.firstPlayerToFeedId,
        )
        const haveAllPlayersFed = playersUpdated.every((player) =>
            player.species.every((species) => species.population === species.foodEaten),
        )

        if (haveAllPlayersFed) {
            await updateDataForAddingFoodStage(
                params.gameId,
                playersUpdated,
                amountOfFoodUpdated,
                game.remainingCards,
                game.firstPlayerToFeedId,
            )
            return
        }

        await updateDataForFeedingStage(params.gameId, amountOfFoodUpdated, playersUpdated, game.firstPlayerToFeedId)

        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const updateDataForFeedingStage = async (
    gameId: string,
    amountOfFood: number,
    players: PlayerEntity[],
    firstPlayerToFeedId: string,
): Promise<void> => {
    const db = await getDb()
    await db.collection('games').updateOne(
        { _id: new ObjectId(gameId) },
        {
            $set: {
                hiddenFoods: [],
                amountOfFood,
                players,
            },
        },
    )
    await notifyUsersOfNewData(gameId, players, amountOfFood, firstPlayerToFeedId)
}

const updateDataForAddingFoodStage = async (
    gameId: string,
    players: PlayerEntity[],
    amountOfFood: number,
    remainingCards: Card[],
    firstPlayerToFeedId: string,
): Promise<void> => {
    const playersWithNewStatus = players.map((player) => ({
        ...player,
        status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
    }))
    const endOfFeedingStageData = computeEndOfFeedingStageData(
        playersWithNewStatus,
        remainingCards,
        firstPlayerToFeedId,
    )

    const db = await getDb()
    await db.collection('games').updateOne(
        { _id: new ObjectId(gameId) },
        {
            $set: {
                hiddenFoods: [],
                amountOfFood: amountOfFood,
                players: endOfFeedingStageData.players,
                firstPlayerToFeedId: endOfFeedingStageData.firstPlayerToFeedId,
            },
        },
    )
    await notifyUsersOfNewData(gameId, endOfFeedingStageData.players, amountOfFood, firstPlayerToFeedId)
}

const notifyUsersOfNewData = async (
    gameId: string,
    players: PlayerEntity[],
    amountOfFood: number,
    firstPlayerToFeedId: string,
): Promise<void> => {
    const events: PusherEvent<PusherEventBase>[] = []
    events.push(
        buildUpdateFoodEvent(gameId, {
            hiddenFoods: [],
            amountOfFood: amountOfFood,
        }),
    )
    players.forEach((player) => {
        const playerOpponents = getOpponents(players, player.id, firstPlayerToFeedId)
        const updateOpponentsEvent = buildUpdateOpponentsEvent(gameId, player.id, playerOpponents)
        const updateSpeciesEvent = buildUpdatePlayerSpeciesEvent(gameId, player.id, {
            species: player.species,
        })
        events.push(buildUpdatePlayerStatusEvent(gameId, player.id, player.status, firstPlayerToFeedId, player.numberOfFoodEaten))
        events.push(updateOpponentsEvent)
        events.push(updateSpeciesEvent)
        events.push(buildUpdatePlayerCardsEvent(gameId, player.id, player.cards))
    })
    await pusherServer.triggerBatch(events)
}

const computeDataForFeedingStage = (
    players: PlayerEntity[],
    hiddenFoods: number[],
    amountOfFood: number,
    firstPlayerToFeedId: string,
): {
    playersUpdated: PlayerEntity[]
    amountOfFoodUpdated: number
} => {
    const playersUpdated = players.map((player) => {
        const playerUpdatedWithSpecialActions = applySpecialCardAction(player, amountOfFood)
        const status =
            player.id === firstPlayerToFeedId ? GameStatus.FEEDING_SPECIES : GameStatus.WAITING_FOR_PLAYERS_TO_FEED
        return { ...playerUpdatedWithSpecialActions, status }
    })
    const amountOfFoodUpdated = hiddenFoods.reduce((previousValue, currentAmountOfFoods) => {
        return previousValue + currentAmountOfFoods
    }, amountOfFood)

    return { playersUpdated, amountOfFoodUpdated }
}

const checkForIncorrectActions = (gameId: string, playerId: string, speciesList: Species[]): void => {
    speciesList.forEach((species) => {
        if (species.features.length > 3) {
            throw Error(
                `ERROR: Species features > 3 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`,
            )
        }
        species.features.reduce((previousFeatureKeys: FeatureKey[], feature: Feature) => {
            if (previousFeatureKeys.includes(feature.key)) {
                throw Error('Cannot add twice a feature to the same species')
            }
            return [...previousFeatureKeys, feature.key]
        }, [])
        if (species.size > 6) {
            throw Error(
                `ERROR: Species size > 6 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`,
            )
        }
        if (species.population > 6) {
            throw Error(
                `ERROR: Species population > 6 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`,
            )
        }
        if (species.population < 1 || species.size < 1) {
            throw Error(
                `ERROR: Other species error ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`,
            )
        }
    })
}

const applySpecialCardAction = (player: PlayerEntity, amountOfFood: number): PlayerEntity => {
    const longNeckActionsAppliedData = applyLongNeckActions(player.newSpeciesList)
    player.species = longNeckActionsAppliedData.fedSpecies
    player.numberOfFoodEaten += longNeckActionsAppliedData.numberOfFoodEaten
    if (amountOfFood > 0) {
        player.species = applyFertileActions(player.species)
    }
    player.newSpeciesList = []
    return player
}

const applyLongNeckActions = (speciesList: Species[]): { fedSpecies: Species[], numberOfFoodEaten: number } => {
    let numberOfFoodEaten = 0
    const fedSpecies = speciesList.map((species) => {
        if (species.features.some((feature) => feature.key === FeatureKey.LONG_NECK)) {
            species.foodEaten = 1
            numberOfFoodEaten++
        }
        return species
    })
    return { fedSpecies, numberOfFoodEaten }
}

const applyFertileActions = (speciesList: Species[]): Species[] => {
    return speciesList.map((species) => {
        if (species.population < 6 && species.features.some((feature) => feature.key === FeatureKey.FERTILE)) {
            species.population++
        }
        return species
    })
}
