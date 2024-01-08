import { Species } from '@/src/models/species.model'
import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'

export interface PlayerEntity {
    id: string
    name: string
    species: Species[]
    cards: Card[]
    status: GameStatus
}
