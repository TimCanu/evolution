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
    const currentPlayerIndex = players.findIndex(player => player.id === playerId)
    const playersToPlayBefore = players.filter((player, index) => index < currentPlayerIndex)
    const playersToPlayAfter = players.filter((player, index) => index > currentPlayerIndex)
    const opponentsInCorrectOrder = [...playersToPlayAfter, ...playersToPlayBefore]
    return opponentsInCorrectOrder.map(player => {
        const isFirstPlayerToFeed = player.id === firstPlayerToFeedId
        return {
            name: player.name,
            species: player.species,
            cards: player.cards,
            isFirstPlayerToFeed,
            status: player.status,
            numberOfFoodEaten: player.numberOfFoodEaten,
        }
    })
}
