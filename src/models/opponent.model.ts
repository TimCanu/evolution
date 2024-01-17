import { Species } from '@/src/models/species.model'
import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'

export interface Opponent {
    name: string
    species: Species[]
    cards: Card[]
    isFirstPlayerToFeed: boolean
    status: GameStatus
    numberOfFoodEaten: number
}
