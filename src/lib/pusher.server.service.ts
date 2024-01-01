import pusherServer from '@/src/lib/pusher-server'
import {
    UPDATE_FOOD_STATUS,
    UPDATE_GAME_STATUS,
    UPDATE_OPPONENT_STATUS,
    UPDATE_PLAYER_CARDS,
    UPDATE_PLAYER_STATUS,
} from '@/src/const/game-events.const'
import { Card } from '@/src/models/card.model'
import {
    PushUpdateFoodData,
    PushUpdateGameStatusData,
    PushUpdatePlayerCardsData,
    PushUpdatePlayerOpponentsData,
    PushUpdatePlayerStatusData,
} from '@/src/models/pusher.channels.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Opponent } from '@/src/models/opponent.model'
import { getOpponents } from '@/src/repositories/games.repository'
import { Player } from '@/src/models/player.model'


const updatePlayerCards = async (channelId: string, data: PushUpdatePlayerCardsData): Promise<void> => {
    await pusherServer.trigger(channelId, UPDATE_PLAYER_CARDS, data)
}

const updatePlayerOpponents = async (channelId: string, data: PushUpdatePlayerOpponentsData): Promise<void> => {
    await pusherServer.trigger(channelId, UPDATE_OPPONENT_STATUS, data)
}

const updatePlayerStatus = async (channelId: string, data: PushUpdatePlayerStatusData): Promise<void> => {
    await pusherServer.trigger(channelId, UPDATE_PLAYER_STATUS, data)
}

const updateGameStatus = async (channelId: string, data: PushUpdateGameStatusData): Promise<void> => {
    await pusherServer.trigger(channelId, UPDATE_GAME_STATUS, data)
}

const updateFoods = async (channelId: string, data: PushUpdateFoodData): Promise<void> => {
    await pusherServer.trigger(channelId, UPDATE_FOOD_STATUS, data)
}

export const pushNewCardsToPlayer = async (gameId: string, playerId: string, cards: Card[]): Promise<void> => {
    await updatePlayerCards(`game-${gameId}-player-${playerId}`, { cards })
}

export const pushNewStatusToPlayer = async (gameId: string, playerId: string, status: GameStatus): Promise<void> => {
    await updatePlayerStatus(`game-${gameId}-player-${playerId}`, { status })
}

const pushUpdatedOpponentsToPlayer = async (gameId: string, playerId: string, opponents: Opponent[]): Promise<void> => {
    await updatePlayerOpponents(`game-${gameId}-player-${playerId}`, { opponents })
}

export const pushUpdatedOpponents = async (gameId: string, players: Player[], playerIdsToNotify: string[]): Promise<void> => {
    for (const playerId of playerIdsToNotify) {
        const playerOpponents = getOpponents(players, playerId)
        await pushUpdatedOpponentsToPlayer(gameId, playerId, playerOpponents)
    }
}

export const pushNewGameStatus = async (gameId: string, status: GameStatus): Promise<void> => {
    await updateGameStatus(`game-${gameId}`, { status })
}

export const pushNewFood = async (gameId: string, data: PushUpdateFoodData): Promise<void> => {
    await updateFoods(`game-${gameId}`, data)
}
