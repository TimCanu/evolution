import { Card } from '@/src/models/card'
import { Player } from '@/src/models/player'
import { GameStatus } from '@/src/enums/game.events.enum'

export interface Game {
    nbOfPlayers: number
    remainingCards: Card[]
    opponents: Player[]
    player: Player
    status: GameStatus
}
