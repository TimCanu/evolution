import { FC } from 'react'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { AddNewSpeciesIcon } from '@/src/components/svg-icons/add-new-species-icon'
import { useLangContext } from '@/src/providers/lang.provider'

export const AddRightSpeciesButton: FC = () => {
    const {
        translationHook: { t }
    } = useLangContext()
    const { updateStatus, status } = useGameContext()
    const { isEvolvingStage } = usePlayerStatus()
    if (!isEvolvingStage()) {
        return null
    }

    const isAnimated = status === EVOLVING_STAGES.ADD_RIGHT_SPECIES

    return (
        <button
            type="button"
            className={`ml-5 self-end ${isAnimated ? 'animate-bounce' : ''}`}
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_RIGHT_SPECIES)
            }}
        >
            <AddNewSpeciesIcon ariaLabel={t('add-species-right')} />
        </button>
    )
}
