import {
    UPDATE_FOOD_STATUS,
    UPDATE_OPPONENT_STATUS,
    UPDATE_PLAYER_CARDS,
    UPDATE_PLAYER_SPECIES,
    UPDATE_PLAYER_STATUS,
} from '@/src/const/game-events.const'
import { Card } from '@/src/models/card.model'
import {
    PusherEvent,
    PushUpdateFoodData,
    PushUpdatePlayerCardsData,
    PushUpdatePlayerOpponentsData,
    PushUpdatePlayerSpeciesData,
    PushUpdatePlayerStatusData,
} from '@/src/models/pusher.channels.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Opponent } from '@/src/models/opponent.model'

export const buildUpdatePlayerCardsEvent = (
    gameId: string,
    playerId: string,
    cards: Card[]
): PusherEvent<PushUpdatePlayerCardsData> => {
    return {
        channel: `game-${gameId}-player-${playerId}`,
        name: UPDATE_PLAYER_CARDS,
        data: { cards },
    }
}

export const buildUpdateOpponentsEvent = (
    gameId: string,
    playerId: string,
    opponents: Opponent[]
): PusherEvent<PushUpdatePlayerOpponentsData> => {
    return {
        channel: `game-${gameId}-player-${playerId}`,
        name: UPDATE_OPPONENT_STATUS,
        data: { opponents },
    }
}

export const buildUpdateFoodEvent = (gameId: string, data: PushUpdateFoodData): PusherEvent<PushUpdateFoodData> => {
    return {
        channel: `game-${gameId}`,
        name: UPDATE_FOOD_STATUS,
        data,
    }
}

export const buildUpdatePlayerSpeciesEvent = (
    gameId: string,
    playerId: string,
    data: PushUpdatePlayerSpeciesData
): PusherEvent<PushUpdatePlayerSpeciesData> => {
    return {
        channel: `game-${gameId}-player-${playerId}`,
        name: UPDATE_PLAYER_SPECIES,
        data,
    }
}

export const buildUpdatePlayerStatusEvent = (
    gameId: string,
    playerId: string,
    status: GameStatus,
    playerFeedingFirstId: string
): PusherEvent<PushUpdatePlayerStatusData> => {
    const isFeedingFirst = playerId === playerFeedingFirstId
    return {
        channel: `game-${gameId}-player-${playerId}`,
        name: UPDATE_PLAYER_STATUS,
        data: { status, isFeedingFirst },
    }
}
