import { Game } from '@/app/pages/game'
import { SpeciesProvider } from '@/app/providers/species.provider'
import { PlayerActionsProvider } from '@/app/providers/player-actions.provider'
import { CardsProvider } from '@/app/providers/cards.provider'
import { FoodsProvider } from '@/app/providers/foods.provider'
import { getCards } from '@/app/lib/cards.service'

export default async function Home() {
    const cards = await getCards()

    return (
        <PlayerActionsProvider>
            <CardsProvider cards={cards}>
                <SpeciesProvider>
                    <FoodsProvider>
                        <Game />
                    </FoodsProvider>
                </SpeciesProvider>
            </CardsProvider>
        </PlayerActionsProvider>
    )
}
