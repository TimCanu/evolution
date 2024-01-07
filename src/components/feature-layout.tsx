import { FC } from 'react'
import { Feature } from '@/src/models/feature.model'
import { useSpeciesContext } from '@/src/providers/species.provider'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'

interface CardProps {
    feature: Feature
    speciesId: string
}

export const FeatureLayout: FC<CardProps> = ({ feature, speciesId }) => {
    const { removeFeature } = useSpeciesContext()
    const { isEvolvingStage } = usePlayerActionsContext()

    return (
        <div className="border border-indigo-600 w-24 h-36 ml-2 flex flex-col">
            <div className="mb-auto flex justify-between">
                <span>{feature.name}</span>
                {isEvolvingStage() && (
                    <button
                        className="border-l border-b border-indigo-600 h-6 w-6"
                        onClick={() => {
                            removeFeature(speciesId, feature.cardId)
                        }}
                    >
                        X
                    </button>
                )}
            </div>
            <span>{feature.description}</span>
        </div>
    )
}
