import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Opponent } from '@/src/models/opponent.model'
import { Species } from '@/src/models/species.model'

export interface PushUpdatePlayerCardsData {
    cards: Card[]
}

export interface PushUpdatePlayerStatusData {
    status: GameStatus
}

export interface PushUpdatePlayerOpponentsData {
    opponents: Opponent[]
}

export interface PushUpdatePlayerSpeciesData {
    species: Species[]
}

export interface PushUpdateGameStatusData {
    status: GameStatus
}

export interface PushUpdateFoodData {
    hiddenFoods: number[]
    amountOfFood: number
}
