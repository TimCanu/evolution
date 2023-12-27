export const addFood = async ({
    gameId,
    playerId,
    cardId,
}: {
    gameId: string
    playerId: string
    cardId: string
}): Promise<void> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/addFood`, {
        next: { revalidate: 0 },
        method: 'POST',
        body: JSON.stringify({ playerId, cardId }),
    })
    return res.json()
}
