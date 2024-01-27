import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { useLangContext } from '@/src/providers/lang.provider'

interface AddSpeciesFeatureButtonProps {
    index: number
    species: Species
}

export const AddSpeciesFeatureButton: FC<AddSpeciesFeatureButtonProps> = ({ index, species }) => {
    const {
        translationHook: { t }
    } = useLangContext()
    const { updateStatus, updateSelectedSpecies, status, selectedSpecies } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()

    if (!isEvolvingStage() || species.features.length >= 3) {
        return null
    }

    const isAnimated =
        selectedSpecies && status === EVOLVING_STAGES.ADD_SPECIES_FEATURE && selectedSpecies.id === species.id

    return (
        <button
            type="button"
            className={`flex justify-center items-center w-8 text-white bg-gray-500 border-x border-y border-white rounded-full ${
                isAnimated ? 'animate-bounce' : ''
            }`}
            onClick={() => {
                updateSelectedSpecies(species)
                updateStatus(EVOLVING_STAGES.ADD_SPECIES_FEATURE)
            }}
        >
            <PlusIcon ariaLabel={t('add-feature', { position: index + 1 })} />
        </button>
    )
}
