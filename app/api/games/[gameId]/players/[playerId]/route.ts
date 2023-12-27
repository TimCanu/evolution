import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import { GameEntity } from '@/src/models/game-entity'

export const GET = async (_: NextRequest, { params }: { params: { gameId: string; playerId: string } }) => {
    try {
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const gameEntity: GameEntity = JSON.parse(JSON.stringify(gameAsDocument[0]))

        const player = gameEntity.players.find((player) => player.id === params.playerId)

        if (!player) {
            console.error(`Could not find any player with id ${params.playerId} in game with id ${params.gameId}`)
            return NextResponse.error()
        }

        return NextResponse.json(player, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
