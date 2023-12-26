import { Card } from '@/src/models/card'
import { Player } from '@/src/models/player'

export interface Game {
    nbOfPlayers: number
    remainingCards: Card[]
    opponents: Player[]
    player: Player
}
