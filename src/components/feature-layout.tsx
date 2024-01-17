import { FC } from 'react'
import { Feature } from '@/src/models/feature.model'
import { useSpecies } from '@/src/hooks/species.hook'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'

interface CardProps {
    feature: Feature
    speciesId: string
    speciesIndex: number
    featureIndex: number
}

export const FeatureLayout: FC<CardProps> = ({ feature, speciesId, speciesIndex, featureIndex }) => {
    const { removeFeature } = useSpecies()
    const { isEvolvingStage } = usePlayerStatus()

    return (
        <div
            data-testid={`s-${speciesIndex}-feature-${featureIndex}`}
            className="border border-indigo-600 w-24 h-36 ml-2 flex flex-col"
        >
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
