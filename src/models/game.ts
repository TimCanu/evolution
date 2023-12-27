import { Player } from '@/src/models/player'
import { GameStatus } from '@/src/enums/game.events.enum'

export interface Game {
    opponents: Player[]
    player: Player
    hiddenFoods: number[]
    amountOfFood: number
}
