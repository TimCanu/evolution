import { NextResponse } from 'next/server'
import { Game } from '@/src/models/game'
import { NextRequest } from 'next/server.js'
import { Player } from '@/src/models/player'
import { GameEntity } from '@/src/models/game-entity'
import { getGameEntity, getGameOpponents } from '@/src/repositories/games.repository'

export const GET = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const playerId: string = String(request.nextUrl.searchParams.get('playerId'))

        const gameEntity: GameEntity = await getGameEntity(params.gameId)

        const player = gameEntity.players.find((player) => player.id === playerId)

        if (!player) {
            console.error(`Player with id ${playerId} could not be found in game with id ${params.gameId}`)
            return NextResponse.error()
        }

        const opponents: Player[] = getGameOpponents(gameEntity, playerId)

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
