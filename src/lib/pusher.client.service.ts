import Pusher, { Channel } from 'pusher-js'

export class PusherInstance {
    private static pusher: Pusher
    private static gameChannels: Map<string, Channel> = new Map<string, Channel>()
    private static playerChannels: Map<string, Channel> = new Map<string, Channel>()

    private constructor() {}

    public static getPusher(): Pusher {
        if (!PusherInstance.pusher) {
            PusherInstance.pusher = new Pusher('74ece9a39852df583f3d', {
                cluster: 'eu',
            })
        }
        return PusherInstance.pusher
    }

    public static getGameChannel(gameId: string): Channel {
        const channel = PusherInstance.gameChannels.get(gameId)
        if (!channel) {
            const newChannel = PusherInstance.getPusher().subscribe(`game-${gameId}`)
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
            const newChannel = PusherInstance.getPusher().subscribe(`game-${gameId}-player-${playerId}`)
            PusherInstance.playerChannels.set(playerId, newChannel)
            return newChannel
        }
        return channel
    }

    public static unsubscribeToAllChannels(): void {
        PusherInstance.gameChannels.forEach((channel) => {
            PusherInstance.getPusher().unsubscribe(channel.name)
        })
        PusherInstance.playerChannels.forEach((channel) => {
            PusherInstance.getPusher().unsubscribe(channel.name)
        })
        PusherInstance.gameChannels = new Map<string, Channel>()
        PusherInstance.playerChannels = new Map<string, Channel>()
    }
}
