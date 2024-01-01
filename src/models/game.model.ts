import { Player } from '@/src/models/player.model'
import { Opponent } from '@/src/models/opponent.model'

export interface Game {
    opponents: Opponent[]
    player: Player
    hiddenFoods: number[]
    amountOfFood: number
}
