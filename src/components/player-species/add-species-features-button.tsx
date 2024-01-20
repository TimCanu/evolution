import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'

interface AddSpeciesFeatureButtonProps {
    index: number
    species: Species
}

export const AddSpeciesFeatureButton: FC<AddSpeciesFeatureButtonProps> = ({ index, species }) => {
    const { updateStatus, updateSelectedSpecies } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()

    if (!isEvolvingStage() || species.features.length >= 3) {
        return null
    }

    return (
        <button
            className="flex justify-center items-center"
            aria-label={`Add feature to species at position ${index + 1}`}
            onClick={() => {
                updateSelectedSpecies(species)
                updateStatus(EVOLVING_STAGES.ADD_SPECIES_FEATURE)
            }}
        >
            <PlusIcon colorHex="#737373" />
        </button>
    )
}
