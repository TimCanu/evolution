import Pusher, { Channel } from 'pusher-js'

export class PusherInstance {
    private static channels: Map<string, Channel> = new Map<string, Channel>()

    private constructor() {}

    public static getChannel(gameId: string): Channel {
        const channel = PusherInstance.channels.get(gameId)
        if (!channel) {
            const pusher = new Pusher('74ece9a39852df583f3d', {
                cluster: 'eu',
            })
            const newChannel = pusher.subscribe(`game-${gameId}`)
            PusherInstance.channels.set(gameId, newChannel)
            return newChannel
        }

        return channel
    }
}
