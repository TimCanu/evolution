import { FC } from 'react'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'

interface AddRightSpeciesButtonProps {
    canShowAddSpeciesRightButton: boolean
}

export const AddRightSpeciesButton: FC<AddRightSpeciesButtonProps> = ({ canShowAddSpeciesRightButton }) => {
    const { updateStatus } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()
    if (!isEvolvingStage() || !canShowAddSpeciesRightButton) {
        return null
    }

    return (
        <button
            className="ml-5 border border-indigo-600 w-36 self-center"
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_RIGHT_SPECIES)
            }}
        >
            Add a new species to the right
        </button>
    )
}
