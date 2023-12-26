import { Card } from '@/src/models/card'
import { Player } from '@/src/models/player'

export interface Game {
    id?: string
    nbOfPlayers: number
    cards: Card[]
    players: Player[]
}
