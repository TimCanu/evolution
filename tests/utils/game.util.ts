import { PlayerEntity } from '@/src/models/player-entity.model'
import clientPromise from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import { GameEntity } from '@/src/models/game-entity.model'
import { buildCarnivoreCard, buildFertileCard, buildForagerCard, buildLongNeckCard } from '@/tests/utils/cards.util'

export const createGame = async (
    gameId: ObjectId,
    player1: PlayerEntity,
    player2: PlayerEntity,
    amountOfFood: number
): Promise<void> => {
    const dbClient = await clientPromise
    const db = dbClient.db(process.env.DATABASE_NAME)
    await db.collection('games').deleteOne({ _id: gameId })

    const game: GameEntity = {
        _id: gameId,
        remainingCards: [
            buildLongNeckCard('secondPlayerCard9', 1),
            buildFertileCard('secondPlayerCard8', 1),
            buildForagerCard('secondPlayerCard7', 1),
            buildForagerCard('secondPlayerCard6', 1),
            buildCarnivoreCard('secondPlayerCard5', 1),
            buildLongNeckCard('firstPlayerCard9', 4),
            buildFertileCard('firstPlayerCard8', 3),
            buildFertileCard('firstPlayerCard7', 3),
            buildForagerCard('firstPlayerCard6', 2),
            buildCarnivoreCard('firstPlayerCard5', -1)
        ],
        nbOfPlayers: 2,
        players: [player1, player2],
        hiddenFoods: [],
        amountOfFood: amountOfFood,
        firstPlayerToFeedId: player1.id
    }
    await db.collection('games').insertOne(game)
}
