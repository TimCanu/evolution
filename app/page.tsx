import { Game } from '@/app/pages/game'
import { SpeciesProvider } from '@/app/providers/species.provider'
import { PlayerActionsProvider } from '@/app/providers/player-actions.provider'
import { CardsProvider } from '@/app/providers/cards.provider'
import { FoodsProvider } from '@/app/providers/foods.provider'

export default function Home() {
    return (
        <PlayerActionsProvider>
            <CardsProvider>
                <SpeciesProvider>
                    <FoodsProvider>
                        <Game />
                    </FoodsProvider>
                </SpeciesProvider>
            </CardsProvider>
        </PlayerActionsProvider>
    )
}
