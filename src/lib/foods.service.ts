import { GameStatus } from '@/src/enums/game.events.enum'
import { Card } from '@/src/models/card.model'

export const addFood = async ({
    gameId,
    playerId,
    cardId,
}: {
    gameId: string
    playerId: string
    cardId: string
}): Promise<{ status: GameStatus; cards: Card[] }> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/addFood`, {
        next: { revalidate: 0 },
        method: 'POST',
        body: JSON.stringify({ playerId, cardId }),
    })
    return res.json()
}
