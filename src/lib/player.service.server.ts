import { GameEntity } from '@/src/models/game-entity.model'
import { PlayerEntity } from '@/src/models/player-entity.model'

export const getPlayer = (game: GameEntity, playerId: string): PlayerEntity => {
    const player = game.players.find((player) => player.id === playerId)
    if (!player) {
        throw Error(`Player with id ${playerId} does not exists in game with id ${game._id.toString()}`)
    }
    return player
}

export const checkPlayerExists = (game: GameEntity, playerId: string): void => {
    const playerExists = game.players.some((player) => player.id === playerId)
    if (!playerExists) {
        throw Error(`Player with id ${playerId} does not exists in game with id ${game._id.toString()}`)
    }
}
