import clientPromise from '@/src/lib/mongodb'
import { NextResponse } from 'next/server'
import { Game } from '@/src/models/game'
import { NextRequest } from 'next/server.js'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player'
import { GameEntity } from '@/src/models/game-entity'

export const GET = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const playerId: string = String(request.nextUrl.searchParams.get('playerId'))
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const gameEntity: GameEntity = JSON.parse(JSON.stringify(gameAsDocument[0]))

        const player = gameEntity.players.find((player) => player.id === playerId)

        if (!player) {
            return NextResponse.error()
        }

        const opponents: Player[] = gameEntity.players.reduce((opponents: Player[], player: Player) => {
            if (player.id !== playerId) {
                return [...opponents, { ...player, id: undefined }]
            }
            return opponents
        }, [])

        const game: Game = {
            hiddenFoods: gameEntity.hiddenFoods,
            amountOfFood: gameEntity.amountOfFood,
            opponents,
            player,
        }
        return NextResponse.json(game, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
