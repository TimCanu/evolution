import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import {
    buildUpdateFoodEvent,
    buildUpdateOpponentsEvent,
    buildUpdatePlayerCardsEvent,
} from '@/src/lib/pusher.server.service'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { Card } from '@/src/models/card.model'
import { getPlayer } from '@/src/lib/player.service.server'

export const POST = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const data: { playerId: string; cardId: string } = await request.json()

        const game: GameEntity = await getGameEntity(params.gameId)
        const playerToUpdate: Player = getPlayer(game, data.playerId)
        const cardPlayedAsFood = getCard(game._id.toString(), playerToUpdate, data.cardId)

        const hiddenFoods = [...game.hiddenFoods, cardPlayedAsFood.foodNumber]

        const playerUpdated: Player = {
            ...playerToUpdate,
            cards: playerToUpdate.cards.filter((card) => card.id !== data.cardId),
            status: GameStatus.CHOOSING_EVOLVING_ACTION,
        }
        const playersUpdated: Player[] = game.players.map((player) => {
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
        events.push(buildUpdateFoodEvent(params.gameId, { hiddenFoods, amountOfFood: game.amountOfFood }))

        await pusherServer.triggerBatch(events)

        return NextResponse.json(
            { status: GameStatus.CHOOSING_EVOLVING_ACTION, cards: playerUpdated.cards },
            { status: 200 }
        )
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const getCard = (gameId: string, player: Player, cardId: string): Card => {
    const card = player.cards.find((card) => card.id === cardId)
    if (!card) {
        console.error(`Player with id ${player.id} does not have a card with id ${cardId} in game with id ${gameId}`)
        throw Error()
    }
    return card
}
