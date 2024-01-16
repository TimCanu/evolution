import { UPDATE_GAME_INFO } from '@/src/const/game-events.const'
import { PusherEvent, PusherEventBase, PushUpdatePlayerGameInfoData } from '@/src/models/pusher.channels.model'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { getGame } from '@/src/lib/game.service'
import pusherServer from '@/src/lib/pusher-server'

const buildUpdateGameEvent = (
    gameId: string,
    playerId: string,
    data: PushUpdatePlayerGameInfoData
): PusherEvent<PushUpdatePlayerGameInfoData> => {
    return {
        channel: `game-${gameId}-player-${playerId}`,
        name: UPDATE_GAME_INFO,
        data,
    }
}

export const sendUpdateGameEvents = async (
    gameId: string,
    players: PlayerEntity[],
    shouldUpdateSpecies: boolean,
    shouldUpdateCards: boolean
): Promise<void> => {
    const events: PusherEvent<PusherEventBase>[] = []
    for (const player of players) {
        const game = await getGame(gameId, player.id)
        events.push(
            buildUpdateGameEvent(gameId, player.id, {
                game,
                shouldUpdateSpecies,
                shouldUpdateCards,
            })
        )
    }
    await pusherServer.triggerBatch(events)
}
