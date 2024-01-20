import { FC } from 'react'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'

interface AddLeftSpeciesButtonProps {
    canShowAddSpeciesLeftButton: boolean
}

export const AddLeftSpeciesButton: FC<AddLeftSpeciesButtonProps> = ({ canShowAddSpeciesLeftButton }) => {
    const { isEvolvingStage } = usePlayerStatus()
    const { updateStatus } = useGameContext()

    if (!isEvolvingStage() || !canShowAddSpeciesLeftButton) {
        return null
    }

    return (
        <button
            className="mb-5 border border-indigo-600 w-28"
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_LEFT_SPECIES)
            }}
        >
            Add a new species to the left
        </button>
    )
}
