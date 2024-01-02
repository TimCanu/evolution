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
} from '@/src/lib/pusher.server.service'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'

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

        const playerToUpdateExists = game.players.some((player) => player.id === params.playerId)
        if (!playerToUpdateExists) {
            console.error(`Player with id ${params.playerId} does not exists in game with id ${params.gameId}`)
            return NextResponse.error()
        }

        data.player.species.forEach((species) => {
            if (species.features.length > 3) {
                console.error(
                    `ERROR: Species features > 3 ||| Species ID=${species.id}, Player ID=${params.playerId}, Game ID=${params.gameId}`
                )
                return NextResponse.error()
            }
            if (species.size > 6) {
                console.error(
                    `ERROR: Species size > 6 ||| Species ID=${species.id}, Player ID=${params.playerId}, Game ID=${params.gameId}`
                )
                return NextResponse.error()
            }
            if (species.population > 6) {
                console.error(
                    `ERROR: Species population > 6 ||| Species ID=${species.id}, Player ID=${params.playerId}, Game ID=${params.gameId}`
                )
                return NextResponse.error()
            }
            if (species.population < 1 || species.size < 1) {
                console.error(
                    `ERROR: Other species error ||| Species ID=${species.id}, Player ID=${params.playerId}, Game ID=${params.gameId}`
                )
                return NextResponse.error()
            }
        })

        const playerToUpdate = data.player

        const haveAllPlayersFinishedEvolving = game.players.every((player) => {
            return (
                player.id === playerToUpdate.id || player.status === GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING
            )
        })

        playerToUpdate.status = haveAllPlayersFinishedEvolving
            ? GameStatus.FEEDING_SPECIES
            : GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING

        const playersUpdated = game.players.map((player) => {
            if (player.id === playerToUpdate.id) {
                return {
                    ...player,
                    species: playerToUpdate.species,
                    status: playerToUpdate.status,
                    cards: playerToUpdate.cards,
                }
            }
            if (haveAllPlayersFinishedEvolving) {
                return { ...player, status: GameStatus.FEEDING_SPECIES }
            }
            return player
        })

        const hiddenFoodsUpdated = haveAllPlayersFinishedEvolving ? [] : game.hiddenFoods
        const amountOfFoodUpdated = !haveAllPlayersFinishedEvolving
            ? game.amountOfFood
            : game.hiddenFoods.reduce((previousValue, currentAmountOfFoods) => {
                  return previousValue + currentAmountOfFoods
              }, game.amountOfFood)

        const db = await getDb()
        await db.collection('games').updateOne(
            { _id: new ObjectId(params.gameId) },
            {
                $set: {
                    hiddenFoods: hiddenFoodsUpdated,
                    amountOfFood: amountOfFoodUpdated,
                    players: playersUpdated,
                },
            }
        )

        const events: PusherEvent<PusherEventBase>[] = []
        if (haveAllPlayersFinishedEvolving) {
            events.push(buildUpdateGameStatusEvent(params.gameId, GameStatus.FEEDING_SPECIES))
            playersUpdated.forEach((player) => {
                const playerOpponents = getOpponents(playersUpdated, player.id)
                const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                events.push(event)
            })
            events.push(
                buildUpdateFoodEvent(params.gameId, {
                    hiddenFoods: hiddenFoodsUpdated,
                    amountOfFood: amountOfFoodUpdated,
                })
            )
            await pusherServer.triggerBatch(events)
        }

        return NextResponse.json({ gameStatus: playerToUpdate.status }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
