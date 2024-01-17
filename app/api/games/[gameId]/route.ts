import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { getGame } from '@/src/lib/game.service.server'

export const GET = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const playerId: string = String(request.nextUrl.searchParams.get('playerId'))

        const game = await getGame(params.gameId, playerId)
        return NextResponse.json(game, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}
