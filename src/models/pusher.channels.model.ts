import { Game } from '@/src/models/game.model'

export interface PushUpdatePlayerGameInfoData {
    game: Game
    shouldUpdateCards: boolean
    shouldUpdateSpecies: boolean
}

export interface PushUpdatePlayerGameInfo {
    channel: string
    name: string
    data: PushUpdatePlayerGameInfoData
}
