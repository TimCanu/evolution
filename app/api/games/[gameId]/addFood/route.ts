import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player'
import { GameStatus } from '@/src/enums/game.events.enum'
import pusherServer from '@/src/lib/pusher-server'
import { FOOD_STATUS, GAME_STATUS, PLAYER_STATUS } from '@/src/const/game-events.const'
import { getGameEntity } from '@/src/repositories/games.repository'
import { GameEntity } from '@/src/models/game-entity'
import { getDb } from '@/src/repositories/shared.repository'

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

        const gameStatus =
            game.nbOfPlayers === hiddenFoods.length
                ? GameStatus.CHOOSING_EVOLVING_ACTION
                : GameStatus.WAITING_FOR_PLAYERS_TO_ADD_FOOD

        const cardsUpdated = playerToUpdate.cards.filter((card) => card.id !== data.cardId)
        const playerUpdated: Player = {
            ...playerToUpdate,
            cards: cardsUpdated,
            status:
                gameStatus === GameStatus.CHOOSING_EVOLVING_ACTION
                    ? gameStatus
                    : GameStatus.WAITING_FOR_PLAYERS_TO_ADD_FOOD,
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

        const db = await getDb()
        await db
            .collection('games')
            .updateOne({ _id: new ObjectId(params.gameId) }, { $set: { players: playersUpdated, hiddenFoods } })

        if (gameStatus === GameStatus.CHOOSING_EVOLVING_ACTION) {
            await pusherServer.trigger(`game-${params.gameId}`, GAME_STATUS, { gameStatus })
        }
        await pusherServer.trigger(`game-${params.gameId}`, PLAYER_STATUS, { playerId: data.playerId })
        await pusherServer.trigger(`game-${params.gameId}`, FOOD_STATUS, {
            hiddenFoods,
            amountOfFood: game.amountOfFood,
        })
        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
