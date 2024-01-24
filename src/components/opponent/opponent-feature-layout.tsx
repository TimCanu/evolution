import React, { FC } from 'react'
import { Feature } from '@/src/models/feature.model'
import Image from 'next/image'
import { getCardImage, getFeatureImage } from '@/src/lib/card.service.client'

interface OpponentFeatureLayoutProps {
    feature: Feature
}

export const OpponentFeatureLayout: FC<OpponentFeatureLayoutProps> = ({ feature }) => {
    const featureImage = getFeatureImage(feature.key)
    const cardImage = getCardImage(feature.key)

    return (
        <li className="mx-1 group-has-[div:hover]:mx-0 delay-0 group-has-[div:hover]:delay-300 z-10">
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
