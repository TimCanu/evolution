export const feedSpecies = async ({
    gameId,
    playerId,
    speciesId,
    preyId,
}: {
    gameId: string
    playerId: string
    speciesId: string
    preyId: string | undefined
}): Promise<void> => {
    const res = await fetch(
        `http://localhost:3000/api/games/${gameId}/players/${playerId}/species/${speciesId}/feed?preyId=${preyId}`,
        {
            next: { revalidate: 0 },
            method: 'POST',
        }
    )
    return res.json()
}
