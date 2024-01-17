import { Game } from '@/src/components/game'
import { getGame } from '@/src/lib/game.service.server'
import { GameProvider } from '@/src/providers/game.provider'

export default async function Home({
    params,
    searchParams,
}: {
    params: { gameId: string }
    searchParams: { playerId: string }
}) {
    const game = await getGame(params.gameId, searchParams.playerId)
    const playerId = searchParams.playerId

    if (!playerId) {
        throw Error('Player ID must be provided')
    }

    return (
        <GameProvider gameId={params.gameId} game={game}>
            <Game game={game} />
        </GameProvider>
    )
}
