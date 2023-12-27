import clientPromise from '@/src/lib/mongodb'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { Player } from '@/src/models/player'
import { GameEntity } from '@/src/models/game-entity'
import pusherServ from '@/src/lib/pusher-serv'
import { GameStatus } from '@/src/enums/game.events.enum'
import { GAME_STATUS, OPPONENTS_STATUS } from '@/src/const/game-events.const'

export const POST = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const data: { playerName: string } = await request.json()
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const game: GameEntity = JSON.parse(JSON.stringify(gameAsDocument[0]))

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
        }

        const playersUpdated = [...game.players, newPlayer]

        const gameStatus =
            game.nbOfPlayers === playersUpdated.length
                ? GameStatus.ADDING_FOOD_TO_WATER_PLAN
                : GameStatus.WAITING_FOR_PLAYERS_TO_JOIN

        await db
            .collection('games')
            .updateOne(
                { _id: new ObjectId(params.gameId) },
                { $set: { players: playersUpdated, status: gameStatus, remainingCards: gameCards } }
            )

        await pusherServ.trigger(`game-${params.gameId}`, GAME_STATUS, { gameStatus })
        await pusherServ.trigger(`game-${params.gameId}`, OPPONENTS_STATUS, { refresh: true })
        return NextResponse.json({ playerId }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
