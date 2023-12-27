import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import { GameEntity } from '@/src/models/game-entity'
import { Player } from '@/src/models/player'
import { GameStatus } from '@/src/enums/game.events.enum'
import pusherServ from '@/src/lib/pusher-serv'
import { FOOD_STATUS, GAME_STATUS, PLAYER_STATUS } from '@/src/const/game-events.const'

export const POST = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const data: { playerId: string; cardId: string } = await request.json()
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const game: GameEntity = JSON.parse(JSON.stringify(gameAsDocument[0]))

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

        const gameStatus =
            game.nbOfPlayers === hiddenFoods.length
                ? GameStatus.CHOOSING_EVOLVING_ACTION
                : GameStatus.WAITING_FOR_PLAYERS_TO_ADD_FOOD

        const cardsUpdated = playerToUpdate.cards.filter((card) => card.id !== data.cardId)
        const playerUpdated: Player = {
            ...playerToUpdate,
            cards: cardsUpdated,
            status: GameStatus.WAITING_FOR_PLAYERS_TO_ADD_FOOD,
        }
        const playersUpdated: Player[] = game.players.map((player) => {
            if (gameStatus === GameStatus.CHOOSING_EVOLVING_ACTION) {
                player.status = gameStatus
            }
            if (player.id === playerToUpdate.id) {
                return playerUpdated
            }
            return player
        })

        await db
            .collection('games')
            .updateOne({ _id: new ObjectId(params.gameId) }, { $set: { players: playersUpdated, hiddenFoods } })

        if (gameStatus === GameStatus.CHOOSING_EVOLVING_ACTION) {
            await pusherServ.trigger(`game-${params.gameId}`, GAME_STATUS, { gameStatus })
        }
        await pusherServ.trigger(`game-${params.gameId}`, PLAYER_STATUS, { playerId: data.playerId })
        await pusherServ.trigger(`game-${params.gameId}`, FOOD_STATUS, {
            hiddenFoods,
            amountOfFood: game.amountOfFood,
        })
        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
