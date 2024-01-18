import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'
import { Species } from '@/src/models/species.model'
import { checkPlayerExists, getPlayer } from '@/src/lib/player.service.server'
import {
    computeEndOfFeedingStageData,
    getNextPlayerToFeedId,
    hasPlayerFinishedFeeding,
} from '@/src/lib/food.service.server'
import { Card } from '@/src/models/card.model'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { sendUpdateGameEvents } from '@/src/lib/pusher.server.service'

export const PUT = async (
    request: NextRequest,
    {
        params,
    }: {
        params: { gameId: string; playerId: string }
    }
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
            (player) => player.status === GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING
        )

        const playerIds = players.map((player) => player.id)
        console.log('toto')

        if (!haveAllPlayersFinishedEvolving) {
            const db = await getDb()
            await db.collection('games').updateOne(
                { _id: new ObjectId(params.gameId) },
                {
                    $set: {
                        players: players,
                    },
                }
            )
            await sendUpdateGameEvents(params.gameId, playerIds, false, false)
            return NextResponse.json(null, { status: 200 })
        }

        const { playersUpdated, amountOfFoodUpdated, haveAllPlayersFed } = computeDataForFeedingStage(
            players,
            game.hiddenFoods,
            game.amountOfFood,
            game.firstPlayerToFeedId
        )

        if (haveAllPlayersFed) {
            await updateDataForAddingFoodStage(
                params.gameId,
                playersUpdated,
                amountOfFoodUpdated,
                game.remainingCards,
                game.firstPlayerToFeedId
            )
            return
        }

        await updateDataForFeedingStage(params.gameId, amountOfFoodUpdated, playersUpdated)
        await sendUpdateGameEvents(params.gameId, playerIds, true, true)

        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const updateDataForFeedingStage = async (
    gameId: string,
    amountOfFood: number,
    players: PlayerEntity[]
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
        }
    )
}

const updateDataForAddingFoodStage = async (
    gameId: string,
    players: PlayerEntity[],
    amountOfFood: number,
    remainingCards: Card[],
    firstPlayerToFeedId: string
): Promise<void> => {
    const playersWithNewStatus = players.map((player) => ({
        ...player,
        status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
    }))
    const endOfFeedingStageData = computeEndOfFeedingStageData(
        playersWithNewStatus,
        remainingCards,
        firstPlayerToFeedId
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
        }
    )
}

const computeDataForFeedingStage = (
    players: PlayerEntity[],
    hiddenFoods: number[],
    amountOfFood: number,
    firstPlayerToFeedId: string
): {
    playersUpdated: PlayerEntity[]
    amountOfFoodUpdated: number
    haveAllPlayersFed: boolean
} => {
    const playersUpdated = computePlayersForFeedingStage(players, amountOfFood, firstPlayerToFeedId)

    const amountOfFoodUpdated = hiddenFoods.reduce((previousValue, currentAmountOfFoods) => {
        return previousValue + currentAmountOfFoods
    }, amountOfFood)

    const haveAllPlayersFed = playersUpdated.every((player) =>
        player.species.every((species) => species.population === species.foodEaten)
    )
    if (haveAllPlayersFed) {
        return { playersUpdated, amountOfFoodUpdated, haveAllPlayersFed: true }
    }

    const firstPlayerToFeed = playersUpdated.find((player) => player.id === firstPlayerToFeedId)
    if (!firstPlayerToFeed) {
        throw Error(`Could not find any player with id ${firstPlayerToFeedId}`)
    }

    if (!hasPlayerFinishedFeeding(firstPlayerToFeed)) {
        return { playersUpdated, amountOfFoodUpdated, haveAllPlayersFed: false }
    }

    const nextPlayerToFeedId = getNextPlayerToFeedId(playersUpdated, firstPlayerToFeedId)
    const playersToReturn = playersUpdated.map((player) => {
        if (player.id === nextPlayerToFeedId) {
            return { ...player, status: GameStatus.FEEDING_SPECIES }
        }
        return player
    })

    return { playersUpdated: playersToReturn, amountOfFoodUpdated, haveAllPlayersFed: false }
}

const computePlayersForFeedingStage = (
    players: PlayerEntity[],
    amountOfFood: number,
    nextPlayerToFeed: string
): PlayerEntity[] => {
    return players.map((player) => {
        const playerUpdatedWithSpecialActions = applySpecialCardAction(player, amountOfFood)
        const status =
            player.id === nextPlayerToFeed && !hasPlayerFinishedFeeding(playerUpdatedWithSpecialActions)
                ? GameStatus.FEEDING_SPECIES
                : GameStatus.WAITING_FOR_PLAYERS_TO_FEED
        return { ...playerUpdatedWithSpecialActions, status }
    })
}

const checkForIncorrectActions = (gameId: string, playerId: string, speciesList: Species[]): void => {
    speciesList.forEach((species) => {
        if (species.features.length > 3) {
            throw Error(
                `ERROR: Species features > 3 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`
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
                `ERROR: Species size > 6 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`
            )
        }
        if (species.population > 6) {
            throw Error(
                `ERROR: Species population > 6 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`
            )
        }
        if (species.population < 1 || species.size < 1) {
            throw Error(
                `ERROR: Other species error ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`
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

const applyLongNeckActions = (speciesList: Species[]): { fedSpecies: Species[]; numberOfFoodEaten: number } => {
    let numberOfFoodEaten = 0
    const fedSpecies = speciesList.map((species) => {
        if (species.features.some((feature) => feature.key === FeatureKey.LONG_NECK)) {
            species.foodEaten = 1
            numberOfFoodEaten++
            if (species.features.some((feature) => feature.key === FeatureKey.FORAGER)) {
                species.foodEaten = 2
                numberOfFoodEaten++
            }
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
