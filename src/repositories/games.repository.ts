import { GameEntity } from '@/src/models/game-entity.model'
import { ObjectId } from 'mongodb'
import { getDb } from '@/src/repositories/shared.repository'
import { Player } from '@/src/models/player.model'
import { Opponent } from '@/src/models/opponent.model'

export const getGameEntity = async (gameId: string): Promise<GameEntity> => {
    const db = await getDb()

    const gameAsDocument = await db
        .collection('games')
        .find({ _id: new ObjectId(gameId) })
        .toArray()

    return JSON.parse(JSON.stringify(gameAsDocument[0]))
}

export const getOpponents = (players: Player[], playerId: string): Opponent[] => {
    return players.reduce((players: Opponent[], player: Player) => {
        if (player.id !== playerId) {
            return [...players, { name: player.name, species: player.species, cards: player.cards }]
        }
        return players
    }, [])
}
