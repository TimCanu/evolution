import { Card } from '@/src/models/card.model'
import { ObjectId } from 'mongodb'
import { PlayerEntity } from '@/src/models/player-entity.model'

export interface CreateGameEntity {
    nbOfPlayers: number
    remainingCards: Card[]
    players: PlayerEntity[]
    hiddenFoods: number[]
    amountOfFood: number
    firstPlayerToFeedId: string
}

// This is the struct that we have in the database
export interface GameEntity extends CreateGameEntity {
    _id: ObjectId
}
