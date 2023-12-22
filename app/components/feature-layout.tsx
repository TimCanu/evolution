import { FC } from 'react'
import { Feature } from '@/app/models/feature'
import { useSpeciesContext } from '@/app/providers/species.provider'
import { usePlayerActionsContext } from '@/app/providers/player-actions.provider'

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
                            removeFeature(speciesId, feature.id)
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
