import { PlayerEntity } from '@/src/models/player-entity.model'
import clientPromise from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import { GameEntity } from '@/src/models/game-entity.model'

export const createGame = async (gameId: ObjectId, player1: PlayerEntity, player2: PlayerEntity): Promise<void> => {
    const dbClient = await clientPromise
    const db = dbClient.db(process.env.DATABASE_NAME)
    await db.collection('games').deleteOne({ _id: gameId })

    const game: GameEntity = {
        _id: gameId,
        remainingCards: [],
        nbOfPlayers: 2,
        players: [player1, player2],
        hiddenFoods: [],
        amountOfFood: 0,
        firstPlayerToFeedId: player1.id,
    }
    await db.collection('games').insertOne(game)
}
