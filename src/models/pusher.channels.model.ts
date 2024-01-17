import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Opponent } from '@/src/models/opponent.model'
import { Species } from '@/src/models/species.model'
import { Game } from '@/src/models/game.model'

export interface PusherEventBase {}

export interface PusherEvent<E extends PusherEventBase> {
    channel: string
    name: string
    data: E
}

export interface PushUpdatePlayerCardsData extends PusherEventBase {
    cards: Card[]
}

export interface PushUpdatePlayerStatusData extends PusherEventBase {
    status: GameStatus
    isFeedingFirst: boolean
    numberOfFoodEaten: number
}

export interface PushUpdatePlayerGameInfoData extends PusherEventBase {
    game: Game
    shouldUpdateCards: boolean
    shouldUpdateSpecies: boolean
}

export interface PushUpdatePlayerOpponentsData extends PusherEventBase {
    opponents: Opponent[]
}

export interface PushUpdatePlayerSpeciesData extends PusherEventBase {
    species: Species[]
}

export interface PushUpdateFoodData extends PusherEventBase {
    hiddenFoods: number[]
    amountOfFood: number
}
