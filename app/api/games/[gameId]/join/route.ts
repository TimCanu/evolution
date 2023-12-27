import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { Player } from '@/src/models/player'
import { GameEntity } from '@/src/models/game-entity'
import pusherServer from '@/src/lib/pusher-server'
import { GameStatus } from '@/src/enums/game.events.enum'
import { GAME_STATUS, PLAYER_STATUS } from '@/src/const/game-events.const'
import { getGameEntity } from '@/src/repositories/games.repository'
import { getDb } from '@/src/repositories/shared.repository'

export const POST = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const data: { playerName: string } = await request.json()

        const game: GameEntity = await getGameEntity(params.gameId)

        if (game.nbOfPlayers === game.players.length) {
            console.error('The players list is already full')
            return NextResponse.error()
        }

        const gameCards = game.remainingCards

        const playerId = uuidv4()
        const newPlayerCards = [...Array(4)].map((_) => {
            const card = gameCards.pop()
            if (!card) {
                throw Error('No cards left... Maybe add some more in the DB?')
            }
            return card
        })

        const newPlayer: Player = {
            id: playerId,
            name: data.playerName,
            species: [{ id: uuidv4(), size: 1, population: 1, features: [] }],
            cards: newPlayerCards,
            status: GameStatus.WAITING_FOR_PLAYERS_TO_JOIN,
        }

        const gameStatus =
            game.nbOfPlayers === game.players.length + 1
                ? GameStatus.ADDING_FOOD_TO_WATER_PLAN
                : GameStatus.WAITING_FOR_PLAYERS_TO_JOIN

        const playersUpdated = [...game.players, newPlayer].map((player) => {
            if (gameStatus === GameStatus.ADDING_FOOD_TO_WATER_PLAN) {
                return { ...player, status: gameStatus }
            }
            return player
        })

        const db = await getDb()
        await db
            .collection('games')
            .updateOne(
                { _id: new ObjectId(params.gameId) },
                { $set: { players: playersUpdated, remainingCards: gameCards } }
            )

        if (gameStatus === GameStatus.ADDING_FOOD_TO_WATER_PLAN) {
            await pusherServer.trigger(`game-${params.gameId}`, GAME_STATUS, { gameStatus })
        }
        await pusherServer.trigger(`game-${params.gameId}`, PLAYER_STATUS, { playerId })
        return NextResponse.json({ playerId }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
