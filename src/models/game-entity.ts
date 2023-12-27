import { Card } from '@/src/models/card'
import { Player } from '@/src/models/player'
import { GameStatus } from '@/src/enums/game.events.enum'

// This is the struct that we have in the database (without the _id)
export interface GameEntity {
    nbOfPlayers: number
    remainingCards: Card[]
    players: Player[]
    status: GameStatus
}
