import Pusher from 'pusher-js'

let pusherClient: Pusher
if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithPusher = global as typeof globalThis & {
        _pusherClient?: Pusher
    }

    if (!globalWithPusher._pusherClient) {
        globalWithPusher._pusherClient = new Pusher('74ece9a39852df583f3d', {
            cluster: 'eu',
        })
    }
    pusherClient = globalWithPusher._pusherClient
} else {
    // In production mode, it's best to not use a global variable.
    pusherClient = new Pusher('74ece9a39852df583f3d', {
        cluster: 'eu',
    })
}

export default pusherClient
