import { Player } from '@/src/models/player.model'
import { GameStatus } from '@/src/enums/game.events.enum'

export const updatePlayer = async ({ gameId, player }: { gameId: string; player: Player }): Promise<void> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/players/${player.id}`, {
        next: { revalidate: 0 },
        method: 'PUT',
        body: JSON.stringify({ player }),
    })
    return res.json()
}
