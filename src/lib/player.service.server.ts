import { Player } from '@/src/models/player.model'
import { GameEntity } from '@/src/models/game-entity.model'

export const getPlayer = (game: GameEntity, playerId: string): Player => {
    const player = game.players.find((player) => player.id === playerId)
    if (!player) {
        console.error(`Player with id ${playerId} does not exists in game with id ${game._id.toString()}`)
        throw Error()
    }
    return player
}
