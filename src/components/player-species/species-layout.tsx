import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { FeatureLayout } from '@/src/components/feature-layout'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { GameStatus } from '@/src/enums/game.events.enum'
import { useGameContext } from '@/src/providers/game.provider'
import { FeedSpeciesButton } from '@/src/components/player-species/feed-species-button'
import { AddLeftSpeciesButton } from '@/src/components/player-species/add-left-species-button'
import { IncreaseSpeciesSizeButton } from '@/src/components/player-species/increase-species-size-button'
import { AddSpeciesFeatureButton } from '@/src/components/player-species/add-species-features-button'
import { IncreaseSpeciesPopulationButton } from '@/src/components/player-species/increase-species-population-button'
import { AddRightSpeciesButton } from '@/src/components/player-species/add-right-species-button'

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
                <AddLeftSpeciesButton canShowAddSpeciesLeftButton={canShowAddSpeciesLeftButton} />
                <IncreaseSpeciesSizeButton index={index} species={species} />
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
                    <AddSpeciesFeatureButton index={index} species={species} />
                    <FeedSpeciesButton index={index} gameId={gameId} playerId={playerId} species={species} />
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
                <IncreaseSpeciesPopulationButton index={index} species={species} />
                <AddRightSpeciesButton canShowAddSpeciesRightButton={canShowAddSpeciesRightButton} />
            </div>
        </li>
    )
}
