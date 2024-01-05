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
    buildUpdateGameStatusEvent,
    buildUpdateOpponentsEvent,
    buildUpdatePlayerCardsEvent,
    buildUpdatePlayerSpeciesEvent,
} from '@/src/lib/pusher.server.service'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'
import { Species } from '@/src/models/species.model'
import { checkPlayerExists } from '@/src/lib/player.service.server'
import { computeEndOfFeedingStageData } from '@/src/lib/food.service.server'
import { Card } from '@/src/models/card.model'

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
                return playerToUpdate
            }
            return player
        })

        const haveAllPlayersFinishedEvolving = players.every(
            (player) => player.status === GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING
        )

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
            return NextResponse.json({ gameStatus: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING }, { status: 200 })
        }

        const newGameStatus = await updateDataForSwitchingToNextStage(
            params.gameId,
            players,
            game.hiddenFoods,
            game.amountOfFood,
            game.remainingCards
        )

        return NextResponse.json({ gameStatus: newGameStatus }, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const updateDataForSwitchingToNextStage = async (
    gameId: string,
    players: Player[],
    hiddenFoods: number[],
    amountOfFood: number,
    remainingCards: Card[]
): Promise<GameStatus> => {
    const { playersUpdated, amountOfFoodUpdated } = computeDataForFeedingStage(players, hiddenFoods, amountOfFood)
    const haveAllPlayersFed = playersUpdated.every((player) =>
        player.species.every((species) => species.population === species.foodEaten)
    )

    if (haveAllPlayersFed) {
        const playersWithNewStatus = players.map((player) => ({
            ...player,
            status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
        }))
        const endOfFeedingStageData = computeEndOfFeedingStageData(playersWithNewStatus, remainingCards)
        await updateDataForSwitchingToStage(
            gameId,
            endOfFeedingStageData.players,
            amountOfFoodUpdated,
            GameStatus.ADDING_FOOD_TO_WATER_PLAN,
            remainingCards
        )
        return GameStatus.ADDING_FOOD_TO_WATER_PLAN
    }
    await updateDataForSwitchingToStage(
        gameId,
        playersUpdated,
        amountOfFoodUpdated,
        GameStatus.FEEDING_SPECIES,
        remainingCards
    )
    return GameStatus.FEEDING_SPECIES
}

const updateDataForSwitchingToStage = async (
    gameId: string,
    players: Player[],
    amountOfFood: number,
    gameStatus: GameStatus,
    remainingCards: Card[]
): Promise<void> => {
    const db = await getDb()
    await db.collection('games').updateOne(
        { _id: new ObjectId(gameId) },
        {
            $set: {
                hiddenFoods: [],
                amountOfFood: amountOfFood,
                players: players,
                remainingCards,
            },
        }
    )

    const events: PusherEvent<PusherEventBase>[] = []
    events.push(
        buildUpdateFoodEvent(gameId, {
            hiddenFoods: [],
            amountOfFood: amountOfFood,
        })
    )
    events.push(buildUpdateGameStatusEvent(gameId, gameStatus))
    players.forEach((player) => {
        const playerOpponents = getOpponents(players, player.id)
        const updateOpponentsEvent = buildUpdateOpponentsEvent(gameId, player.id, playerOpponents)
        const updateSpeciesEvent = buildUpdatePlayerSpeciesEvent(gameId, player.id, {
            species: player.species,
        })
        events.push(updateOpponentsEvent)
        events.push(updateSpeciesEvent)
        events.push(buildUpdatePlayerCardsEvent(gameId, player.id, player.cards))
    })
    await pusherServer.triggerBatch(events)
}

const computeDataForFeedingStage = (
    players: Player[],
    hiddenFoods: number[],
    amountOfFood: number
): {
    playersUpdated: Player[]
    amountOfFoodUpdated: number
} => {
    const playersUpdated = players.map((player) => {
        const playerUpdatedWithSpecialActions = applySpecialCardAction(player)
        return { ...playerUpdatedWithSpecialActions, status: GameStatus.FEEDING_SPECIES }
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

const applySpecialCardAction = (player: Player): Player => {
    player.species = applyLongNeckActions(player.species)
    return player
}

const applyLongNeckActions = (speciesList: Species[]): Species[] => {
    return speciesList.map((species) => {
        if (species.features.some((feature) => feature.key === FeatureKey.LONG_NECK)) {
            species.foodEaten = 1
        }
        return species
    })
}
