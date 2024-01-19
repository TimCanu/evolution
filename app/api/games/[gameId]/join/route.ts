import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { GameEntity } from '@/src/models/game-entity.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { getGameEntity } from '@/src/repositories/games.repository'
import { getDb } from '@/src/repositories/shared.repository'
import { sendUpdateGameEvents } from '@/src/lib/pusher.server.service'
import { PlayerEntity } from '@/src/models/player-entity.model'

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

        const newPlayer: PlayerEntity = {
            id: playerId,
            name: data.playerName,
            species: [{ id: uuidv4(), size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
            cards: newPlayerCards,
            status: GameStatus.WAITING_FOR_PLAYERS_TO_JOIN,
            newSpeciesList: [],
            numberOfFoodEaten: 0,
        }

        const areAllPlayersConnected = game.nbOfPlayers === game.players.length + 1

        const playersUpdated = [...game.players, newPlayer].map((player) => {
            if (areAllPlayersConnected) {
                return { ...player, status: GameStatus.ADDING_FOOD_TO_WATER_PLAN }
            }
            return player
        })

        const firstPlayerToFeedId = areAllPlayersConnected
            ? playersUpdated[Math.floor(Math.random() * game.nbOfPlayers)].id
            : ''

        const db = await getDb()
        await db.collection('games').updateOne(
            { _id: new ObjectId(params.gameId) },
            {
                $set: {
                    players: playersUpdated,
                    remainingCards: gameCards,
                    firstPlayerToFeedId,
                },
            }
        )
        const playerIds = playersUpdated.map((player) => player.id)
        await sendUpdateGameEvents(params.gameId, playerIds, true, true)

        return NextResponse.json({ playerId }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
