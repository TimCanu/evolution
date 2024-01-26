import { UPDATE_GAME_INFO } from '@/src/const/game-events.const'
import { PushUpdatePlayerGameInfo, PushUpdatePlayerGameInfoData } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { GameEntity } from '@/src/models/game-entity.model'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { Opponent } from '@/src/models/opponent.model'
import { Game } from '@/src/models/game.model'

const buildUpdateGameEvent = (
    gameId: string,
    playerId: string,
    data: PushUpdatePlayerGameInfoData,
): PushUpdatePlayerGameInfo => {
    return {
        channel: `game-${gameId}-player-${playerId}`,
        name: UPDATE_GAME_INFO,
        data,
    }
}

export const sendUpdateGameEvents = async (
    gameId: string,
    playersId: string[],
    shouldUpdateSpecies: boolean,
    shouldUpdateCards: boolean,
): Promise<void> => {
    const gameEntity: GameEntity = await getGameEntity(gameId)

    const events: PushUpdatePlayerGameInfo[] = playersId.map((playerId) => {
        const player = gameEntity.players.find((player) => player.id === playerId)
        if (!player) {
            throw Error(`Player with id ${playerId} could not be found in game with id ${gameId}`)
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
                numberOfFoodEaten: player.numberOfFoodEaten,
            },
        }
        return buildUpdateGameEvent(gameId, player.id, {
            game,
            shouldUpdateSpecies,
            shouldUpdateCards,
        })
    })
    await pusherServer.triggerBatch(events)
}
