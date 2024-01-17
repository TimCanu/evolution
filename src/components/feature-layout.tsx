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
        <li
            data-testid={`s-${speciesIndex}-feature-${featureIndex}`}
            className="border border-indigo-600 w-24 h-36 ml-2 flex flex-col"
        >
            <h1 className="mb-auto flex justify-between">
                {feature.name}
                {isEvolvingStage() && (
                    <button
                        aria-label={`Remove feature ${feature.name} at species with index ${speciesIndex}`}
                        className="h-6 w-6"
                        onClick={() => {
                            removeFeature(speciesId, feature.cardId)
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                            <path opacity="0.15"
                                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                  fill="#000000" />
                            <path
                                d="M16 8L8 16M8.00001 8L16 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                )}
            </h1>
            <p>{feature.description}</p>
        </li>
    )
}
