import { Species } from '@/src/models/species'
import { Card } from '@/src/models/card'

export interface Player {
    id?: string
    name: string
    species: Species[]
    cards: Card[]
}
