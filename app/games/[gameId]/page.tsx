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
    const playerId = searchParams.playerId

    if (!playerId) {
        throw Error('Player ID must be provided')
    }

    return (
        <PlayerActionsProvider status={game.player.status} gameId={params.gameId} playerId={playerId}>
            <CardsProvider cards={game.player.cards} gameId={params.gameId} playerId={playerId}>
                <SpeciesProvider speciesInitialData={game.player.species}>
                    <FoodsProvider
                        initialAmountOfFood={game.amountOfFood}
                        initialHiddenFoods={game.hiddenFoods}
                        gameId={params.gameId}
                    >
                        <OpponentsProvider opponents={game.opponents} gameId={params.gameId} playerId={playerId}>
                            <Game game={game} />
                        </OpponentsProvider>
                    </FoodsProvider>
                </SpeciesProvider>
            </CardsProvider>
        </PlayerActionsProvider>
    )
}
