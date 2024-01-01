import { Species } from '@/src/models/species.model'
import { Card } from '@/src/models/card.model'

export interface Opponent {
    name: string
    species: Species[]
    cards: Card[]
}
