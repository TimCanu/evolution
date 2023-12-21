import { FC } from 'react'
import { Species } from '@/app/models/species'
import { FeatureLayout } from '@/app/components/feature-layout'
import { ActionState, useSpeciesContext } from '@/app/providers/species.provider'

interface CardProps {
    canRemoveSpecieFeature: boolean
    canShowAddSpeciesLeftButton: boolean
    canShowAddSpeciesRightButton: boolean
    isEditable: boolean
    species: Species
}

export const SpeciesLayout: FC<CardProps> = ({
    canRemoveSpecieFeature,
    canShowAddSpeciesLeftButton,
    canShowAddSpeciesRightButton,
    isEditable,
    species,
}) => {
    const { updateSpecies, updateSpeciesOnGoingAction } = useSpeciesContext()

    const removeFeature = (featureId: string) => {
        const newFeatures = species.features.filter((feature) => feature.id !== featureId)
        updateSpecies({ ...species, features: newFeatures })
    }

    return (
        <div className="flex flex-col self-end">
            <div className="flex self-center mb-2">
                {species.features.map((feature, index) => {
                    return (
                        <FeatureLayout
                            key={index}
                            canRemoveSpecieFeature={canRemoveSpecieFeature}
                            feature={feature}
                            removeFeature={removeFeature}
                        />
                    )
                })}
            </div>
            <div className="flex">
                {isEditable && canShowAddSpeciesLeftButton && (
                    <button
                        className="mb-5 border border-indigo-600 w-28"
                        onClick={() => {
                            updateSpeciesOnGoingAction({
                                action: ActionState.ADD_LEFT,
                            })
                        }}
                    >
                        Add a new specie here
                    </button>
                )}
                {isEditable && species.size < 6 && (
                    <button
                        className="mb-5 mx-2"
                        onClick={() => {
                            updateSpeciesOnGoingAction({
                                action: ActionState.INCREMENT_SIZE,
                                specieId: species.id,
                            })
                        }}
                    >
                        +
                    </button>
                )}
                <div className="border border-indigo-600 mb-5 w-28 flex flex-row justify-between items-center">
                    <span className="border border-indigo-600 bg-orange-600	rounded-full w-8 h-8 flex justify-center items-center">
                        {species.size}
                    </span>
                    {isEditable && species.features.length < 3 && (
                        <button
                            className="border border-indigo-600 bg-stone-600 rounded-full w-8 h-8 flex justify-center items-center"
                            onClick={() => {
                                updateSpeciesOnGoingAction({
                                    action: ActionState.ADD_FEATURE,
                                    specieId: species.id,
                                })
                            }}
                        >
                            +
                        </button>
                    )}
                    <span className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                        {species.population}
                    </span>
                </div>
                {isEditable && species.population < 6 && (
                    <button
                        className="mb-5 mx-2"
                        onClick={() =>
                            updateSpeciesOnGoingAction({
                                action: ActionState.INCREMENT_POPULATION,
                                specieId: species.id,
                            })
                        }
                    >
                        +
                    </button>
                )}
                {isEditable && canShowAddSpeciesRightButton && (
                    <button
                        className="mb-5 border border-indigo-600 w-28"
                        onClick={() => {
                            updateSpeciesOnGoingAction({
                                action: ActionState.ADD_RIGHT,
                            })
                        }}
                    >
                        Add a new specie here
                    </button>
                )}
            </div>
        </div>
    )
}
