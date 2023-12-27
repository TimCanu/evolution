import { Opponent } from '@/src/models/opponent'

export const getOpponents = async (gameId: string, playerId: string): Promise<Opponent[]> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/opponents?playerId=${playerId}`, {
        next: { revalidate: 0 },
    })
    return res.json()
}
