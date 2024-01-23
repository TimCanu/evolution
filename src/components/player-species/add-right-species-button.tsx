import { FC } from 'react'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { AddNewSpeciesIcon } from '@/src/components/svg-icons/add-new-species-icon'

interface AddRightSpeciesButtonProps {
    canShowAddSpeciesRightButton: boolean
}

export const AddRightSpeciesButton: FC<AddRightSpeciesButtonProps> = ({ canShowAddSpeciesRightButton }) => {
    const { updateStatus, status } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()
    if (!isEvolvingStage() || !canShowAddSpeciesRightButton) {
        return null
    }

    const isAnimated = status === EVOLVING_STAGES.ADD_RIGHT_SPECIES

    return (
        <button
            className={`ml-5 self-end ${isAnimated ? 'animate-bounce' : ''}`}
            aria-label="Add a new species to the right"
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_RIGHT_SPECIES)
            }}
        >
            <AddNewSpeciesIcon />
        </button>
    )
}
