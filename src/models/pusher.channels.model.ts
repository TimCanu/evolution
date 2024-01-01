import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Opponent } from '@/src/models/opponent.model'

export interface PushUpdatePlayerCardsData {
    cards: Card[]
}

export interface PushUpdatePlayerStatusData {
    status: GameStatus
}

export interface PushUpdatePlayerOpponentsData {
    opponents: Opponent[]
}

export interface PushUpdateGameStatusData {
    status: GameStatus
}

export interface PushUpdateFoodData {
    hiddenFoods: number[],
    amountOfFood: number,
}