import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'

interface IncreaseSpeciesPopulationButtonProps {
    index: number
    species: Species
}

export const IncreaseSpeciesPopulationButton: FC<IncreaseSpeciesPopulationButtonProps> = ({ index, species }) => {
    const { updateStatus, updateSelectedSpecies } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()

    if (!isEvolvingStage() || species.population >= 6) {
        return null
    }

    return (
        <button
            className="mb-5 mx-2"
            aria-label={`Increase population of species at position ${index + 1}`}
            onClick={() => {
                updateSelectedSpecies(species)
                updateStatus(EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION)
            }}
        >
            <PlusIcon colorHex="#12B886" />
        </button>
    )
}
