import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { feedSpecies } from '@/src/lib/species.service'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'
import { FeedPlantsIcon } from '@/src/components/svg-icons/feed-plants-icon'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { isCarnivore } from '@/src/lib/food.service.server'

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
    const { carnivoreFeedingData, status, updateStatus, updateSelectedSpecies, updateCarnivoreFeedingData } =
        useGameContext()
    const { isEvolvingStage, isFeedingStage } = usePlayerStatus()
    const canActionsBeShown = isEvolvingStage()
    const isCarnivoreFeeding = carnivoreFeedingData.carnivoreId === species.id
    const canBeEaten = carnivoreFeedingData.preyIds.includes(species.id)

    const feedPlantsEater = async (): Promise<void> => {
        await feedSpecies({ gameId, playerId, speciesId: species.id, preyId: undefined })
    }

    const toggleCarnivoreWantingToFeed = async (): Promise<void> => {
        if (carnivoreFeedingData.carnivoreId) {
            updateCarnivoreFeedingData(undefined, [])
        } else {
            updateCarnivoreFeedingData(species.id, species.preyIds)
        }
    }

    const feedCarnivore = async (): Promise<void> => {
        await feedSpecies({ gameId, playerId, speciesId: species.id, preyId: species.id })
    }

    return (
        <li className="flex flex-col self-end">
            <ul className="flex self-center mb-2">
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
            </ul>
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
                    <span
                        className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center"
                        aria-label={`Species at index ${index} size: ${species.size}`}
                    >
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
                    {canBeEaten && (
                        <button
                            className="flex justify-center items-center"
                            aria-label="Eat this species"
                            onClick={feedCarnivore}
                        >
                            Eat
                        </button>
                    )}
                    {isFeedingStage() &&
                        species.foodEaten < species.population &&
                        (isCarnivore(species) ? (
                            species.preyIds.length > 0 ? (
                                <button
                                    className="flex justify-center items-center"
                                    aria-label="Feed this carnivore"
                                    onClick={toggleCarnivoreWantingToFeed}
                                >
                                    {isCarnivoreFeeding ? 'Cancel' : 'Feed'}
                                </button>
                            ) : (
                                <span>Go vegan</span>
                            )
                        ) : (
                            <button
                                className="flex justify-center items-center"
                                aria-label="Feed plants to this species"
                                onClick={feedPlantsEater}
                            >
                                <FeedPlantsIcon />
                            </button>
                        ))}
                    {isFeedingStage() || status === GameStatus.WAITING_FOR_PLAYERS_TO_FEED ? (
                        <span
                            className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center"
                            aria-label={`Species at index ${index} fed population: ${species.foodEaten} / ${species.population}`}
                        >
                            {species.foodEaten} / {species.population}
                        </span>
                    ) : (
                        <span
                            className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center"
                            aria-label={`Species at index ${index} population: ${species.population}`}
                        >
                            {species.population}
                        </span>
                    )}
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
        </li>
    )
}
