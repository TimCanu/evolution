import { NextResponse } from 'next/server'
import { Game } from '@/src/models/game.model'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { Opponent } from '@/src/models/opponent.model'

export const GET = async (request: NextRequest, { params }: { params: { gameId: string } }) => {
    try {
        const playerId: string = String(request.nextUrl.searchParams.get('playerId'))

        const gameEntity: GameEntity = await getGameEntity(params.gameId)

        const player = gameEntity.players.find((player) => player.id === playerId)

        if (!player) {
            console.error(`Player with id ${playerId} could not be found in game with id ${params.gameId}`)
            return NextResponse.error()
        }

        const opponents: Opponent[] = getOpponents(gameEntity.players, playerId, gameEntity.firstPlayerToFeedId)

        const game: Game = {
            hiddenFoods: gameEntity.hiddenFoods,
            amountOfFood: gameEntity.amountOfFood,
            opponents,
            player: {
                id: player.id,
                name: player.name,
                species: player.species,
                cards: player.cards,
                status: player.status,
                isFirstPlayerToFeed: player.id === gameEntity.firstPlayerToFeedId,
                numberOfFoodEaten: player.numberOfFoodEaten
            },
        }
        return NextResponse.json(game, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
