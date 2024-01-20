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
            className="h-16 border border-indigo-600 w-36 self-center mr-5"
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_LEFT_SPECIES)
            }}
        >
            Add a new species to the left
        </button>
    )
}
