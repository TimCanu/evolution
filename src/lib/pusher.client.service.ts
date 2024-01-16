import Pusher, { Channel } from 'pusher-js'

export class PusherInstance {
    private static pusher: Pusher
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

    public static getPlayerChannel(gameId: string, playerId: string): Channel {
        const channel = PusherInstance.playerChannels.get(playerId)
        if (!channel) {
            const newChannel = PusherInstance.getPusher().subscribe(`game-${gameId}-player-${playerId}`)
            PusherInstance.playerChannels.set(playerId, newChannel)
            return newChannel
        }
        return channel
    }

    public static unsubscribeToAllChannels(): void {
        PusherInstance.playerChannels.forEach((channel) => {
            PusherInstance.getPusher().unsubscribe(channel.name)
        })
        PusherInstance.playerChannels = new Map<string, Channel>()
    }
}
