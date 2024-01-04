import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { EVOLVING_STAGES, usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { feedSpecies } from '@/src/lib/species.service'

interface CardProps {
    canShowAddSpeciesLeftButton: boolean
    canShowAddSpeciesRightButton: boolean
    gameId: string
    playerId: string
    species: Species
}

export const SpeciesLayout: FC<CardProps> = ({
    canShowAddSpeciesLeftButton,
    canShowAddSpeciesRightButton,
    gameId,
    playerId,
    species,
}) => {
    const { updatePlayerState, isEvolvingStage, isFeedingStage } = usePlayerActionsContext()
    const canActionsBeShown = isEvolvingStage()

    const feed = async (): Promise<void> => {
        const { gameStatus } = await feedSpecies({ gameId, playerId, speciesId: species.id })
        updatePlayerState({ action: gameStatus })
    }

    return (
        <div className="flex flex-col self-end">
            <div className="flex self-center mb-2">
                {species.features.map((feature, index) => {
                    return <FeatureLayout key={index} feature={feature} speciesId={species.id} />
                })}
            </div>
            <div className="flex">
                {canActionsBeShown && canShowAddSpeciesLeftButton && (
                    <button
                        className="mb-5 border border-indigo-600 w-28"
                        onClick={() => {
                            updatePlayerState({
                                action: EVOLVING_STAGES.ADD_LEFT_SPECIES,
                            })
                        }}
                    >
                        Add a new species here
                    </button>
                )}
                {canActionsBeShown && species.size < 6 && (
                    <button
                        className="mb-5 mx-2"
                        onClick={() => {
                            updatePlayerState({
                                action: EVOLVING_STAGES.INCREMENT_SPECIES_SIZE,
                                species,
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
                    {canActionsBeShown && species.features.length < 3 && (
                        <button
                            className="border border-indigo-600 bg-stone-600 rounded-full w-8 h-8 flex justify-center items-center"
                            onClick={() => {
                                updatePlayerState({
                                    action: EVOLVING_STAGES.ADD_SPECIES_FEATURE,
                                    species,
                                })
                            }}
                        >
                            +
                        </button>
                    )}
                    {isFeedingStage() && species.foodEaten < species.population && (
                        <button
                            className="border border-indigo-600 bg-amber-400 rounded-full w-8 h-8 flex justify-center items-center"
                            onClick={feed}
                        >
                            FEED
                        </button>
                    )}

                    <span className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                        {isFeedingStage() && (
                            <>
                                {species.foodEaten} / {species.population}
                            </>
                        )}
                        {!isFeedingStage() && <> {species.population}</>}
                    </span>
                </div>
                {canActionsBeShown && species.population < 6 && (
                    <button
                        className="mb-5 mx-2"
                        onClick={() =>
                            updatePlayerState({
                                action: EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION,
                                species,
                            })
                        }
                    >
                        +
                    </button>
                )}
                {canActionsBeShown && canShowAddSpeciesRightButton && (
                    <button
                        className="mb-5 border border-indigo-600 w-28"
                        onClick={() => {
                            updatePlayerState({
                                action: EVOLVING_STAGES.ADD_RIGHT_SPECIES,
                            })
                        }}
                    >
                        Add a new species here
                    </button>
                )}
            </div>
        </div>
    )
}
