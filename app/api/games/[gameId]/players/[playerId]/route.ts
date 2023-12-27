import { NextRequest, NextResponse } from 'next/server'
import { GameEntity } from '@/src/models/game-entity'
import { getGameEntity } from '@/src/repositories/games.repository'

export const GET = async (_: NextRequest, { params }: { params: { gameId: string; playerId: string } }) => {
    try {
        const gameEntity: GameEntity = await getGameEntity(params.gameId)

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
