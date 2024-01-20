import React, { FC } from 'react'
import { Feature } from '@/src/models/feature.model'
import { useSpecies } from '@/src/hooks/species.hook'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import Image from 'next/image'
import { getFeatureImage } from '@/src/lib/card.service.client'

interface CardProps {
    feature: Feature
    speciesId: string
    speciesIndex: number
    featureIndex: number
}

export const FeatureLayout: FC<CardProps> = ({ feature, speciesId, speciesIndex, featureIndex }) => {
    const { removeFeature } = useSpecies()
    const { isEvolvingStage } = usePlayerStatus()

    const cardImage = getFeatureImage(feature.key)

    return (
        <li data-testid={`s-${speciesIndex}-feature-${featureIndex}`} className="mx-1 relative">
            {isEvolvingStage() && (
                <button
                    aria-label={`Remove feature ${feature.name} at species with index ${speciesIndex}`}
                    className="h-6 w-6 absolute justify-center -bottom-0 inset-x-1.5 bg-black rounded-full"
                    onClick={() => {
                        removeFeature(speciesId, feature.cardId)
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                        <path
                            opacity="0.15"
                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            fill="#000000"
                        />
                        <path
                            d="M16 8L8 16M8.00001 8L16 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
            <Image src={cardImage} alt={`${feature.name}: ${feature.description}`} height={74} />
        </li>
    )
}
