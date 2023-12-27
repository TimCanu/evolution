import { Player } from '@/src/models/player'

export const getOpponents = async (gameId: string, playerId: string): Promise<Player[]> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/opponents?playerId=${playerId}`, {
        next: { revalidate: 0 },
    })
    return res.json()
}

export const getPlayer = async (gameId: string, playerId: string): Promise<Player> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/players/${playerId}`, {
        next: { revalidate: 0 },
    })
    return res.json()
}
