import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { feedSpecies } from '@/src/lib/species.service'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'
import { FeedPlantsIcon } from '@/src/components/svg-icons/feed-plants-icon'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'

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
    const { updateStatus, status, updateSelectedSpecies } = useGameContext()
    const { isEvolvingStage, isFeedingStage } = usePlayerStatus()
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
                            updateStatus(EVOLVING_STAGES.ADD_LEFT_SPECIES)
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
                            updateSelectedSpecies(species)
                            updateStatus(EVOLVING_STAGES.INCREMENT_SPECIES_SIZE)
                        }}
                    >
                        <PlusIcon colorHex="#FA5252" />
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
                                updateSelectedSpecies(species)
                                updateStatus(EVOLVING_STAGES.ADD_SPECIES_FEATURE)
                            }}
                        >
                            <PlusIcon colorHex="#737373" />
                        </button>
                    )}
                    {isFeedingStage() && species.foodEaten < species.population && (
                        <button
                            className="flex justify-center items-center"
                            aria-label="Feed plants to this species"
                            onClick={feed}
                        >
                            <FeedPlantsIcon />
                        </button>
                    )}

                    <span className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                        {isFeedingStage() || status === GameStatus.WAITING_FOR_PLAYERS_TO_FEED ? (
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
                        onClick={() => {
                            updateSelectedSpecies(species)
                            updateStatus(EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION)
                        }}
                    >
                        <PlusIcon colorHex="#12B886" />
                    </button>
                )}
                {canActionsBeShown && canShowAddSpeciesRightButton && (
                    <button
                        className="mb-5 border border-indigo-600 w-28"
                        onClick={() => {
                            updateStatus(EVOLVING_STAGES.ADD_RIGHT_SPECIES)
                        }}
                    >
                        Add a new species to the right
                    </button>
                )}
            </div>
        </div>
    )
}
