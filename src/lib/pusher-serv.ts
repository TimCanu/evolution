import Pusher from 'pusher'

const conf = {
    appId: String(process.env.PUSHER_APP_ID),
    key: String(process.env.PUSHER_KEY),
    secret: String(process.env.PUSHER_SECRET),
    cluster: String(process.env.PUSHER_CLUSTER),
}
let pusherServ: Pusher
if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithPusher = global as typeof globalThis & {
        _pusherServ?: Pusher
    }

    if (!globalWithPusher._pusherServ) {
        globalWithPusher._pusherServ = new Pusher(conf)
    }
    pusherServ = globalWithPusher._pusherServ
} else {
    // In production mode, it's best to not use a global variable.
    pusherServ = new Pusher(conf)
}

export default pusherServ
