import { Species } from '@/src/models/species.model'
import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'

export interface Player {
    id: string
    name: string
    species: Species[]
    cards: Card[]
    status: GameStatus
    isFirstPlayerToFeed: boolean
}
