import React, { FC } from 'react'
import { Feature } from '@/src/models/feature.model'
import { useSpecies } from '@/src/hooks/species.hook'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import Image from 'next/image'
import { getCardImage, getFeatureImage } from '@/src/lib/card.service.client'

interface CardProps {
    feature: Feature
    speciesId: string
    speciesIndex: number
    featureIndex: number
}

export const FeatureLayout: FC<CardProps> = ({ feature, speciesId, speciesIndex, featureIndex }) => {
    const { removeFeature } = useSpecies()
    const { isEvolvingStage } = usePlayerStatus()

    const featureImage = getFeatureImage(feature.key)
    const cardImage = getCardImage(feature.key)

    return (
        <li
            data-testid={`s-${speciesIndex}-feature-${featureIndex}`}
            className="mx-1 relative group-has-[div:hover]:mx-0 delay-0 group-has-[div:hover]:delay-300"
        >
            {isEvolvingStage() && (
                <button
                    type="button"
                    className="visible h-6 w-6 absolute justify-center -top-6 inset-x-1.5 bg-black rounded-full group-has-[div:hover]:invisible group-has-[div:hover]:delay-300 group-has-[div:hover]:w-0 delay-0"
                    onClick={() => {
                        removeFeature(speciesId, feature.cardId)
                    }}
                >
                    <svg role="img" aria-label={`Remove feature ${feature.name} at species with index ${speciesIndex}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
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
            <div className="group/feature-image">
                <Image
                    src={featureImage}
                    alt={`${feature.name}: ${feature.description}`}
                    height={74}
                    className="group-has-[div:hover]:invisible group-has-[div:hover]:delay-300 group-has-[div:hover]:w-0 delay-0"
                />
                <div className="invisible h-0 w-0 rounded-md group-hover/feature-image:border bg-amber-900 group-hover/feature-image:delay-300 delay-0 group-hover/feature-image:w-32 group-hover/feature-image:h-52 group-hover/feature-image:visible flex flex-col">
                    <h1 className="mb-2 self-center">{feature.name}</h1>
                    <div className="relative self-center border-4 border-transparent">
                        <Image src={cardImage} alt="" height={80} />
                    </div>
                    <p className="text-xs max-h-[64px] text-center">{feature.description}</p>
                </div>
            </div>
        </li>
    )
}
