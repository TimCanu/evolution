'use client'

import { Game } from '@/app/pages/game'
import { SpeciesProvider } from '@/app/providers/species.provider'

export default function Home() {
    return (
        <SpeciesProvider>
            <Game />
        </SpeciesProvider>
    )
}
