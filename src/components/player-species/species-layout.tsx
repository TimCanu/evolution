import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { GameStatus } from '@/src/enums/game.events.enum'
import { useGameContext } from '@/src/providers/game.provider'
import { FeedSpeciesButton } from '@/src/components/player-species/feed-species-button'
import { AddLeftSpeciesButton } from '@/src/components/player-species/add-left-species-button'
import { AddSpeciesFeatureButton } from '@/src/components/player-species/add-species-features-button'
import { AddRightSpeciesButton } from '@/src/components/player-species/add-right-species-button'
import { SpeciesSizeElement } from '@/src/components/player-species/species-size-element'
import { SpeciesPopulationElement } from '@/src/components/player-species/species-population-element'

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
    const { status } = useGameContext()
    const { isFeedingStage } = usePlayerStatus()

    return (
        <article className="flex self-end">
            <AddLeftSpeciesButton canShowAddSpeciesLeftButton={canShowAddSpeciesLeftButton} />
            <li className="flex flex-col min-w-32 mx-2">
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
                <div
                    data-testid={`species-${index}`}
                    className="border mb-1 w-32 flex flex-row justify-between items-center min-w-32 self-center bg-amber-900 rounded-md h-10"
                >
                    <SpeciesSizeElement index={index} species={species} />
                    <AddSpeciesFeatureButton index={index} species={species} />
                    <FeedSpeciesButton index={index} gameId={gameId} playerId={playerId} species={species} />
                    {isFeedingStage() || status === GameStatus.WAITING_FOR_PLAYERS_TO_FEED ? (
                        <span
                            className=" border bg-green-600 rounded-full w-8 h-8 flex justify-center items-center mr-1"
                            aria-label={`Species at index ${index} fed population: ${species.foodEaten}/${species.population}`}
                        >
                            {species.foodEaten}/{species.population}
                        </span>
                    ) : (
                        <SpeciesPopulationElement species={species} index={index} />
                    )}
                </div>
            </li>
            <AddRightSpeciesButton canShowAddSpeciesRightButton={canShowAddSpeciesRightButton} />
        </article>
    )
}
