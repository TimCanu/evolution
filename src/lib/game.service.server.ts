import { Game } from '@/src/models/game.model'
import { GameEntity } from '@/src/models/game-entity.model'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { Opponent } from '@/src/models/opponent.model'

const getGame = async (gameId: string, playerId: string): Promise<Game> => {
    const gameEntity: GameEntity = await getGameEntity(gameId)
    const player = gameEntity.players.find((player) => player.id === playerId)

    if (!player) {
        throw Error(`Player with id ${playerId} could not be found in game with id ${gameId}`)
    }

    const opponents: Opponent[] = getOpponents(gameEntity.players, playerId, gameEntity.firstPlayerToFeedId)

    return {
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
            numberOfFoodEaten: player.numberOfFoodEaten,
        },
    }
}
