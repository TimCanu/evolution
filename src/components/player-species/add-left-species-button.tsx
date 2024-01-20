import { FC } from 'react'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { AddNewSpeciesIcon } from '@/src/components/svg-icons/add-new-species-icon'

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
            className="mr-5 self-end focus:animate-bounce"
            aria-label="Add a new species to the left"
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_LEFT_SPECIES)
            }}
        >
            <AddNewSpeciesIcon />
        </button>
    )
}
