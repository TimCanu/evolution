import clientPromise from '../../../lib/mongodb'
import { NextResponse } from 'next/server'
import { Game } from '@/app/models/game'
import { NextRequest } from 'next/server.js'
import { ObjectId } from 'mongodb'

export const GET = async (_: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const game: Game = JSON.parse(JSON.stringify(gameAsDocument[0]))

        return NextResponse.json(game, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
