import { Card } from '@/src/models/card.model'
import { Player } from '@/src/models/player.model'
import { ObjectId } from 'mongodb'

export interface CreateGameEntity {
    nbOfPlayers: number
    remainingCards: Card[]
    players: Player[]
    hiddenFoods: number[]
    amountOfFood: number
}

// This is the struct that we have in the database
export interface GameEntity extends CreateGameEntity {
    _id: ObjectId
}