import { GameEntity } from '@/src/models/game-entity.model'
import { ObjectId } from 'mongodb'
import { getDb } from '@/src/repositories/shared.repository'
import { Opponent } from '@/src/models/opponent.model'
import { PlayerEntity } from '@/src/models/player-entity.model'

export const getGameEntity = async (gameId: string): Promise<GameEntity> => {
    const db = await getDb()

    const gameAsDocument = await db
        .collection('games')
        .find({ _id: new ObjectId(gameId) })
        .toArray()

    return JSON.parse(JSON.stringify(gameAsDocument[0]))
}

export const getOpponents = (players: PlayerEntity[], playerId: string, firstPlayerToFeedId: string): Opponent[] => {
    return players.reduce((opponents: Opponent[], player: PlayerEntity) => {
        if (player.id !== playerId) {
            const isFirstPlayerToFeed = player.id === firstPlayerToFeedId
            return [
                ...opponents,
                {
                    name: player.name,
                    species: player.species,
                    cards: player.cards,
                    isFirstPlayerToFeed,
                    status: player.status,
                },
            ]
        }
        return opponents
    }, [])
}
