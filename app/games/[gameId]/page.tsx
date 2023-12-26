import { Game } from '@/app/components/game'
import { SpeciesProvider } from '@/app/providers/species.provider'
import { PlayerActionsProvider } from '@/app/providers/player-actions.provider'
import { CardsProvider } from '@/app/providers/cards.provider'
import { FoodsProvider } from '@/app/providers/foods.provider'
import { getGame } from '@/app/lib/game.service'

export default async function Home({ params }: { params: { gameId: string } }) {
    const game = await getGame(params.gameId)

    return (
        <PlayerActionsProvider>
            <CardsProvider cards={game.cards}>
                <SpeciesProvider>
                    <FoodsProvider>
                        <Game />
                    </FoodsProvider>
                </SpeciesProvider>
            </CardsProvider>
        </PlayerActionsProvider>
    )
}
