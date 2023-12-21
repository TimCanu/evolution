import { FC } from 'react'
import { Feature } from '@/app/models/feature'

interface CardProps {
    canRemoveSpecieFeature: boolean
    feature: Feature
    removeFeature: (featureId: string) => void
}

export const FeatureLayout: FC<CardProps> = ({ canRemoveSpecieFeature, feature, removeFeature }) => {
    return (
        <div className="border border-indigo-600 w-24 h-36 ml-2 flex flex-col">
            <div className="mb-auto flex justify-between">
                <span>{feature.name}</span>
                {canRemoveSpecieFeature && (
                    <button
                        className="border-l border-b border-indigo-600 h-6 w-6"
                        onClick={() => {
                            removeFeature(feature.id)
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
