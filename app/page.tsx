'use client'

import { Game } from '@/app/pages/game'
import { SpeciesProvider } from '@/app/providers/species.provider'
import { PlayerActionsProvider } from '@/app/providers/player-actions.provider'

export default function Home() {
    return (
        <PlayerActionsProvider>
            <SpeciesProvider>
                <Game />
            </SpeciesProvider>
        </PlayerActionsProvider>
    )
}
