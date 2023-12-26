import clientPromise from '@/src/lib/mongodb'
import { NextResponse } from 'next/server'
import { Game } from '@/src/models/game'
import { NextRequest } from 'next/server.js'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { Player } from '@/src/models/player'

export const GET = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const playerId: string = String(request.nextUrl.searchParams.get('playerId'))
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const game: Game = JSON.parse(JSON.stringify(gameAsDocument[0]))

        const doesPlayerExists = !!game.players.find((player) => player.id === playerId)

        if (!doesPlayerExists) {
            return NextResponse.error()
        }

        const playersWithoutOtherPlayersInfo: Player[] = game.players.map((player) => {
            if (player.id !== playerId) {
                return { ...player, id: undefined }
            }
            return player
        })

        const gameWithoutOtherPlayersInfo = { ...game, players: playersWithoutOtherPlayersInfo }
        return NextResponse.json(gameWithoutOtherPlayersInfo, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}

export const PUT = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const data: { playerName: string } = await request.json()
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const gameAsDocument = await db
            .collection('games')
            .find({ _id: new ObjectId(params.gameId) })
            .toArray()

        const game: Game = JSON.parse(JSON.stringify(gameAsDocument[0]))

        if (game.nbOfPlayers === game.players.length) {
            return NextResponse.error()
        }

        const playerId = uuidv4()
        const playersUpdated = [...game.players, { id: playerId, name: data.playerName }]

        await db
            .collection('games')
            .updateOne({ _id: new ObjectId(params.gameId) }, { $set: { players: playersUpdated } })
        return NextResponse.json({ playerId }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
