import { GameEntity } from '@/src/models/game-entity'
import { ObjectId } from 'mongodb'
import { getDb } from '@/src/repositories/shared.repository'
import { Player } from '@/src/models/player'

export const getGameEntity = async (gameId: string): Promise<GameEntity> => {
    const db = await getDb()

    const gameAsDocument = await db
        .collection('games')
        .find({ _id: new ObjectId(gameId) })
        .toArray()

    return JSON.parse(JSON.stringify(gameAsDocument[0]))
}

export const getGameOpponents = (game: GameEntity, playerId: string): Player[] => {
    return game.players.reduce((players: Player[], player: Player) => {
        if (player.id !== playerId) {
            return [...players, { ...player, id: undefined }]
        }
        return players
    }, [])
}
