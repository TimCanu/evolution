import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import {
    buildUpdateOpponentsEvent,
    buildUpdateFoodEvent,
    buildUpdateGameStatusEvent,
    buildUpdatePlayerCardsEvent,
    buildUpdatePlayerStatusEvent,
} from '@/src/lib/pusher.server.service'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'

export const POST = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const data: { playerId: string; cardId: string } = await request.json()

        const game: GameEntity = await getGameEntity(params.gameId)

        const playerToUpdate = game.players.find((player) => player.id === data.playerId)
        if (!playerToUpdate) {
            console.error(`Player with id ${data.playerId} does not exists in game with id ${params.gameId}`)
            return NextResponse.error()
        }
        const cardPlayedAsFood = playerToUpdate.cards.find((card) => card.id === data.cardId)
        if (!cardPlayedAsFood) {
            console.error(
                `Player with id ${data.playerId} does not have a card with id ${data.cardId} in game with id ${params.gameId}`
            )
            return NextResponse.error()
        }

        const foodNumber = cardPlayedAsFood.foodNumber
        const hiddenFoods = [...game.hiddenFoods, foodNumber]

        const hasEveryPlayersAddedFood = game.nbOfPlayers === hiddenFoods.length

        const cardsUpdated = playerToUpdate.cards.filter((card) => card.id !== data.cardId)
        const playerUpdated: Player = {
            ...playerToUpdate,
            cards: cardsUpdated,
            status: hasEveryPlayersAddedFood
                ? GameStatus.CHOOSING_EVOLVING_ACTION
                : GameStatus.WAITING_FOR_PLAYERS_TO_ADD_FOOD,
        }
        const playersUpdated: Player[] = game.players.map((player) => {
            if (hasEveryPlayersAddedFood) {
                player.status = GameStatus.CHOOSING_EVOLVING_ACTION
            }
            if (player.id === playerToUpdate.id) {
                return playerUpdated
            }
            return player
        })

        const db = await getDb()
        await db
            .collection('games')
            .updateOne({ _id: new ObjectId(params.gameId) }, { $set: { players: playersUpdated, hiddenFoods } })

        const events: PusherEvent<PusherEventBase>[] = []
        if (hasEveryPlayersAddedFood) {
            events.push(buildUpdateGameStatusEvent(params.gameId, GameStatus.CHOOSING_EVOLVING_ACTION))
        } else {
            events.push(buildUpdatePlayerStatusEvent(params.gameId, data.playerId, GameStatus.CHOOSING_EVOLVING_ACTION))
        }
        events.push(buildUpdatePlayerCardsEvent(params.gameId, data.playerId, playerUpdated.cards))
        playersUpdated
            .filter((player) => player.id !== data.playerId)
            .forEach((player) => {
                const playerOpponents = getOpponents(playersUpdated, player.id)
                const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                events.push(event)
            })
        events.push(buildUpdateFoodEvent(params.gameId, { hiddenFoods, amountOfFood: game.amountOfFood }))

        await pusherServer.triggerBatch(events)

        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
