import { Game } from '@/src/models/game.model'

export const createGame = async ({
    nbOfPlayers,
    playerName
}: {
    nbOfPlayers: number
    playerName: string
}): Promise<{ gameId: string; playerId: string }> => {
    const res = await fetch('http://localhost:3000/api/games', {
        next: { revalidate: 0 },
        method: 'POST',
        body: JSON.stringify({ nbOfPlayers, playerName })
    })
    return res.json()
}

export const joinGame = async ({
    playerName,
    gameId
}: {
    playerName: string
    gameId: string
}): Promise<{ playerId: string }> => {
    const res = await fetch(`http://localhost:3000/api/games/${gameId}/join`, {
        next: { revalidate: 0 },
        method: 'POST',
        body: JSON.stringify({ playerName })
    })
    return res.json()
}
