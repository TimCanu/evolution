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
    buildUpdatePlayerSpeciesEvent,
} from '@/src/lib/pusher.server.service'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'
import { Species } from '@/src/models/species.model'
import { checkPlayerExists } from '@/src/lib/player.service.server'

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

        const players = game.players.map(player => {
            if (player.id === playerToUpdate.id) {
                return playerToUpdate
            }
            return player
        })

        const haveAllPlayersFinishedEvolving = players.every((player) => player.status === GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING)

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
            return NextResponse.json({ gameStatus: playerToUpdate.status }, { status: 200 })
        }

        await updateDataForSwitchingToFeedingStage(params.gameId, players, game.hiddenFoods, game.amountOfFood)

        return NextResponse.json({ gameStatus: playerToUpdate.status }, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const updateDataForSwitchingToFeedingStage = async (gameId: string, players: Player[], hiddenFoods: number[], amountOfFood: number): Promise<void> => {
    const { playersUpdated, amountOfFoodUpdated } = computeDataForFeedingStage(players, hiddenFoods, amountOfFood)
    const hiddenFoodsUpdated: number[] = []

    const db = await getDb()
    await db.collection('games').updateOne(
        { _id: new ObjectId(gameId) },
        {
            $set: {
                hiddenFoods: hiddenFoodsUpdated,
                amountOfFood: amountOfFoodUpdated,
                players: playersUpdated,
            },
        },
    )

    const events: PusherEvent<PusherEventBase>[] = []

    events.push(buildUpdateGameStatusEvent(gameId, GameStatus.FEEDING_SPECIES))
    playersUpdated.forEach((player) => {
        const playerOpponents = getOpponents(playersUpdated, player.id)
        const updateOpponentsEvent = buildUpdateOpponentsEvent(gameId, player.id, playerOpponents)
        const updateSpeciesEvent = buildUpdatePlayerSpeciesEvent(gameId, player.id, {
            species: player.species,
        })
        events.push(updateOpponentsEvent)
        events.push(updateSpeciesEvent)
    })
    events.push(
        buildUpdateFoodEvent(gameId, {
            hiddenFoods: hiddenFoodsUpdated,
            amountOfFood: amountOfFoodUpdated,
        }),
    )
    await pusherServer.triggerBatch(events)
}

const computeDataForFeedingStage = (players: Player[], hiddenFoods: number[], amountOfFood: number): {
    playersUpdated: Player[],
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
            throw Error(`ERROR: Species features > 3 ||| Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`)
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
