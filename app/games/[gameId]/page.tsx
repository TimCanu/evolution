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
        <PlayerActionsProvider status={game.player.status}>
            <CardsProvider cards={game.player.cards}>
                <SpeciesProvider speciesInitialData={game.player.species}>
                    <FoodsProvider initialAmountOfFood={game.amountOfFood} initialHiddenFoods={game.hiddenFoods}>
                        <OpponentsProvider opponents={game.opponents}>
                            <Game />
                        </OpponentsProvider>
                    </FoodsProvider>
                </SpeciesProvider>
            </CardsProvider>
        </PlayerActionsProvider>
    )
}
