import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { GameStatus } from '@/src/enums/game.events.enum'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { FeedSpeciesButton } from '@/src/components/player-species/feed-species-button'
import { AddLeftSpeciesButton } from '@/src/components/player-species/add-left-species-button'
import { IncreaseSpeciesSizeButton } from '@/src/components/player-species/increase-species-size-button'
import { AddSpeciesFeatureButton } from '@/src/components/player-species/add-species-features-button'
import { IncreaseSpeciesPopulationButton } from '@/src/components/player-species/increase-species-population-button'

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
            className="mb-5 border border-indigo-600 w-28"
            onClick={() => {
                updateStatus(EVOLVING_STAGES.ADD_RIGHT_SPECIES)
            }}
        >
            Add a new species to the right
        </button>
    )
}
