import { Game } from '@/src/components/game'
import { SpeciesProvider } from '@/src/providers/species.provider'
import { PlayerActionsProvider } from '@/src/providers/player-actions.provider'
import { CardsProvider } from '@/src/providers/cards.provider'
import { FoodsProvider } from '@/src/providers/foods.provider'
import { getGame } from '@/src/lib/game.service'
import { OpponentsProvider } from '@/src/providers/opponents.provider'

export default async function Home({
    params,
    searchParams,
}: {
    params: { gameId: string }
    searchParams: { playerId: string }
}) {
    const game = await getGame(params.gameId, searchParams.playerId)

    return (
        <PlayerActionsProvider>
            <CardsProvider cards={game.remainingCards}>
                <SpeciesProvider>
                    <FoodsProvider>
                        <OpponentsProvider opponents={game.opponents}>
                            <Game />
                        </OpponentsProvider>
                    </FoodsProvider>
                </SpeciesProvider>
            </CardsProvider>
        </PlayerActionsProvider>
    )
}
