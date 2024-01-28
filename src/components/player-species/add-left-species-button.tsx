import { FC } from 'react'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { AddNewSpeciesIcon } from '@/src/components/svg-icons/add-new-species-icon'
import { useLangContext } from '@/src/providers/lang.provider'

export const AddLeftSpeciesButton: FC = () => {
    const {
        translationHook: { t }
    } = useLangContext()
    const { isEvolvingStage } = usePlayerStatus()
    const { updateStatus, status } = useGameContext()

    if (!isEvolvingStage()) {
        return null
    }

    const isAnimated = status === EVOLVING_STAGES.ADD_LEFT_SPECIES

    return (
        <button
            type="button"
            className={`mr-5 self-end ${isAnimated ? 'animate-bounce' : ''}`}
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_LEFT_SPECIES)
            }}
        >
            <AddNewSpeciesIcon ariaLabel={t('add-species-left')} />
        </button>
    )
}
