import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { GameStatus } from '@/src/enums/game.events.enum'
import {
    buildUpdateFoodEvent,
    buildUpdateGameStatusEvent,
    buildUpdateOpponentsEvent,
    buildUpdatePlayerSpeciesEvent,
} from '@/src/lib/pusher.server.service'
import { Player } from '@/src/models/player.model'
import { Species } from '@/src/models/species.model'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'

export const POST = async (
    _: NextRequest,
    {
        params,
    }: {
        params: { gameId: string; playerId: string; speciesId: string }
    }
) => {
    try {
        const game: GameEntity = await getGameEntity(params.gameId)

        const playerToUpdate = game.players.find((player) => player.id === params.playerId)
        if (!playerToUpdate) {
            console.error(`Player with id ${params.playerId} does not exists in game with id ${params.gameId}`)
            return NextResponse.error()
        }
        const speciesToUpdate = playerToUpdate.species.find((species) => species.id === params.speciesId)
        if (!speciesToUpdate) {
            console.error(
                `Species with id ${params.speciesId} in player with id ${params.playerId} does not exists in game with id ${params.gameId}`
            )
            return NextResponse.error()
        }

        if (speciesToUpdate.foodEaten >= speciesToUpdate.population) {
            console.error(
                `Species with id ${params.speciesId} in player with id ${params.playerId} in game with id ${params.gameId} has already eaten`
            )
            return NextResponse.error()
        }

        if (game.amountOfFood <= 0) {
            console.error(
                `Species with id ${params.speciesId} in player with id ${params.playerId} in game with id ${params.gameId} cannot eat as there is no food left`
            )
            return NextResponse.error()
        }

        speciesToUpdate.foodEaten++
        const newAmountOfFood = game.amountOfFood - 1

        const noMoreFoodAvailable = newAmountOfFood <= 0

        const playerSpeciesUpdated = playerToUpdate.species.map((species) => {
            if (species.id === speciesToUpdate.id) {
                return speciesToUpdate
            }
            return species
        })

        const hasPlayerFinishedFeeding = playerSpeciesUpdated.every(
            (species) => species.foodEaten === species.population
        )

        const haveAllPlayersFinishedFeeding =
            hasPlayerFinishedFeeding &&
            game.players.every((player) => {
                return (
                    player.id === playerToUpdate.id ||
                    player.species.every((species) => species.foodEaten === species.population)
                )
            })

        const playerUpdatedStatus =
            noMoreFoodAvailable || haveAllPlayersFinishedFeeding
                ? GameStatus.ADDING_FOOD_TO_WATER_PLAN
                : hasPlayerFinishedFeeding
                  ? GameStatus.WAITING_FOR_PLAYERS_TO_FEED
                  : GameStatus.FEEDING_SPECIES

        const playerUpdated = { ...playerToUpdate, species: playerSpeciesUpdated, status: playerUpdatedStatus }
        const playersUpdated = game.players.map((player) => {
            if (player.id === playerUpdated.id) {
                return playerUpdated
            }
            if (noMoreFoodAvailable || haveAllPlayersFinishedFeeding) {
                return { ...player, status: GameStatus.ADDING_FOOD_TO_WATER_PLAN }
            }
            return player
        })

        const db = await getDb()

        const events: PusherEvent<PusherEventBase>[] = []
        if (noMoreFoodAvailable || haveAllPlayersFinishedFeeding) {
            const playersWithSpeciesPopComputed = playersUpdated.map((player: Player) => {
                player.species = player.species.reduce((speciesUpdated: Species[], species: Species) => {
                    if (species.foodEaten === 0) {
                        return speciesUpdated
                    }
                    return [...speciesUpdated, { ...species, population: species.foodEaten, foodEaten: 0 }]
                }, [])
                return player
            })

            await db.collection('games').updateOne(
                { _id: new ObjectId(params.gameId) },
                {
                    $set: {
                        amountOfFood: newAmountOfFood,
                        players: playersWithSpeciesPopComputed,
                    },
                }
            )

            events.push(buildUpdateGameStatusEvent(params.gameId, GameStatus.ADDING_FOOD_TO_WATER_PLAN))
            playersWithSpeciesPopComputed.forEach((player) => {
                const playerOpponents = getOpponents(playersWithSpeciesPopComputed, player.id)
                const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                events.push(event)
                events.push(buildUpdatePlayerSpeciesEvent(params.gameId, player.id, { species: player.species }))
            })
        } else {
            await db.collection('games').updateOne(
                { _id: new ObjectId(params.gameId) },
                {
                    $set: {
                        amountOfFood: newAmountOfFood,
                        players: playersUpdated,
                    },
                }
            )

            playersUpdated
                .filter((player) => player.id !== playerToUpdate.id)
                .forEach((player) => {
                    const playerOpponents = getOpponents(playersUpdated, player.id)
                    const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                    events.push(event)
                })
            playersUpdated.forEach((player) => {
                events.push(buildUpdatePlayerSpeciesEvent(params.gameId, player.id, { species: player.species }))
            })
        }

        events.push(
            buildUpdateFoodEvent(params.gameId, {
                hiddenFoods: game.hiddenFoods,
                amountOfFood: newAmountOfFood,
            })
        )
        await pusherServer.triggerBatch(events)

        return NextResponse.json({ gameStatus: playerUpdated.status }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
