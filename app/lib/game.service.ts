import { Game } from '@/app/models/game'

export const createGame = async (): Promise<{ gameId: string }> => {
    const res = await fetch('http://localhost:3000/api/games', { next: { revalidate: 0 }, method: 'POST' })
    return res.json()
}

export const getGame = async (gameId: string): Promise<Game> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}`, { next: { revalidate: 0 } })
    return res.json()
}
