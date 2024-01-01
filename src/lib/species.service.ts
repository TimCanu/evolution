import { GameStatus } from '@/src/enums/game.events.enum'

export const feedSpecies = async ({
    gameId,
    playerId,
    speciesId,
}: {
    gameId: string
    playerId: string
    speciesId: string
}): Promise<{ gameStatus: GameStatus }> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/players/${playerId}/species/${speciesId}/feed`, {
        next: { revalidate: 0 },
        method: 'POST',
    })
    return res.json()
}
