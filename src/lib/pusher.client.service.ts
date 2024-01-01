import Pusher, { Channel } from 'pusher-js'

export class PusherInstance {
    private static gameChannels: Map<string, Channel> = new Map<string, Channel>()
    private static playerChannels: Map<string, Channel> = new Map<string, Channel>()

    private constructor() {
    }

    public static getGameChannel(gameId: string): Channel {
        const channel = PusherInstance.gameChannels.get(gameId)
        if (!channel) {
            const pusher = new Pusher('74ece9a39852df583f3d', {
                cluster: 'eu',
            })
            const newChannel = pusher.subscribe(`game-${gameId}`)
            PusherInstance.gameChannels.set(gameId, newChannel)
            return newChannel
        }

        return channel
    }

    public static getPlayerChannel(gameId: string, playerId: string): Channel {
        const channel = PusherInstance.playerChannels.get(playerId)
        if (!channel) {
            const pusher = new Pusher('74ece9a39852df583f3d', {
                cluster: 'eu',
            })
            const newChannel = pusher.subscribe(`game-${gameId}-player-${playerId}`)
            PusherInstance.playerChannels.set(playerId, newChannel)
            return newChannel
        }

        return channel
    }
}
