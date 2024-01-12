import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { EVOLVING_STAGES, usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { feedSpecies } from '@/src/lib/species.service'
import { GameStatus } from '@/src/enums/game.events.enum'

interface CardProps {
    canShowAddSpeciesLeftButton: boolean
    canShowAddSpeciesRightButton: boolean
    gameId: string
    index: number
    playerId: string
    species: Species
}

export const SpeciesLayout: FC<CardProps> = ({
    canShowAddSpeciesLeftButton,
    canShowAddSpeciesRightButton,
    index,
    gameId,
    playerId,
    species,
}) => {
    const { updatePlayerState, isEvolvingStage, isFeedingStage, playerOnGoingAction } = usePlayerActionsContext()
    const canActionsBeShown = isEvolvingStage()

    const feed = async (): Promise<void> => {
        await feedSpecies({ gameId, playerId, speciesId: species.id })
    }

    return (
        <div className="flex flex-col self-end">
            <div className="flex self-center mb-2">
                {species.features.map((feature, featureIndex) => {
                    return (
                        <FeatureLayout
                            key={featureIndex}
                            speciesIndex={index}
                            featureIndex={featureIndex}
                            feature={feature}
                            speciesId={species.id}
                        />
                    )
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
                        Add a new species to the left
                    </button>
                )}
                {canActionsBeShown && species.size < 6 && (
                    <button
                        className="mb-5 mx-2"
                        aria-label={`Increase size of species at position ${index + 1}`}
                        onClick={() => {
                            updatePlayerState({
                                action: EVOLVING_STAGES.INCREMENT_SPECIES_SIZE,
                                species,
                            })
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="32"
                            height="32"
                            viewBox="0 0 30 30"
                            fill="#FA5252"
                        >
                            <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z"></path>
                        </svg>
                    </button>
                )}
                <div
                    data-testid={`species-${index}`}
                    className="border border-indigo-600 mb-5 w-28 flex flex-row justify-between items-center"
                >
                    <span className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center">
                        {species.size}
                    </span>
                    {canActionsBeShown && species.features.length < 3 && (
                        <button
                            className="flex justify-center items-center"
                            aria-label={`Add feature to species at position ${index + 1}`}
                            onClick={() => {
                                updatePlayerState({
                                    action: EVOLVING_STAGES.ADD_SPECIES_FEATURE,
                                    species,
                                })
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="32"
                                height="32"
                                viewBox="0 0 50 50"
                                fill="#737373"
                            >
                                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z"></path>
                            </svg>
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
                        {isFeedingStage() || playerOnGoingAction.action === GameStatus.WAITING_FOR_PLAYERS_TO_FEED ? (
                            <>
                                {species.foodEaten} / {species.population}
                            </>
                        ) : (
                            <> {species.population}</>
                        )}
                    </span>
                </div>
                {canActionsBeShown && species.population < 6 && (
                    <button
                        className="mb-5 mx-2"
                        aria-label={`Increase population of species at position ${index + 1}`}
                        onClick={() =>
                            updatePlayerState({
                                action: EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION,
                                species,
                            })
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="32"
                            height="32"
                            viewBox="0 0 30 30"
                            fill="#12B886"
                        >
                            <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z"></path>
                        </svg>
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
                        Add a new species to the right
                    </button>
                )}
            </div>
        </div>
    )
}
