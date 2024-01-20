import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { feedSpecies } from '@/src/lib/species.service'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { FeedSpeciesButton } from '@/src/components/player-species/feed-species-button'
import { AddLeftSpeciesButton } from '@/src/components/player-species/add-left-species-button'

interface IncreaseSpeciesSizeButtonProps {
    index: number
    species: Species
}

export const IncreaseSpeciesSizeButton: FC<IncreaseSpeciesSizeButtonProps> = ({ index, species }) => {
    const { updateStatus, updateSelectedSpecies } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()

    if (!isEvolvingStage() || species.size >= 6) {
        return null
    }

    return (
        <button
            className="mb-5 mx-2"
            aria-label={`Increase size of species at position ${index + 1}`}
            onClick={() => {
                updateSelectedSpecies(species)
                updateStatus(EVOLVING_STAGES.INCREMENT_SPECIES_SIZE)
            }}
        >
            <PlusIcon colorHex="#FA5252" />
        </button>
    )
}
