import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'
import { OpponentFeatureLayout } from '@/src/components/opponent-feature-layout'
import { GameStatus } from '@/src/enums/game.events.enum'
import playerTurnDino from '../assets/images/player-turn-dyno.png'
import Image from 'next/image'

interface OpponentLayoutProps {
    opponent: Opponent
    opponentIndex: number
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ opponent, opponentIndex }) => {
    return (
        <li className="border border-indigo-600 w-80 h-44 ml-5 text-center">
            <h1 className="mx-4 flex justify-between mb-2">
                {opponent.isFirstPlayerToFeed && (
                    <Image
                        src={playerTurnDino}
                        alt={`The player ${opponent.name} is the first player to feed`}
                        height={20}
                    />
                )}
                <span
                    aria-label={`Opponent's at index ${opponentIndex} name is ${opponent.name}`}>{opponent.name}</span>
                <span role="status"
                      className="mx-4">Number of points: {opponent.numberOfFoodEaten} {opponent.status === GameStatus.FEEDING_SPECIES && <> -
                    Is feeding</>}</span>
            </h1>

            <ul className="flex justify-around">
                {opponent.species.map((species, speciesIndex) => {
                    return (
                        <li key={speciesIndex}
                            className="flex flex-col w-36">
                            <p className="flex justify-around mb-2">
                                <span
                                    aria-label={`Species at index ${speciesIndex} of opponent at index ${opponentIndex} size: ${species.size}`}
                                    className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center">
                                    {species.size}
                                </span>
                                <span
                                    aria-label={`Species at index ${speciesIndex} of opponent at index ${opponentIndex} population: ${species.population}`}
                                    className="border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                                    {species.population}
                                </span>
                            </p>
                            <ul>
                                {species.features.map((feature, index) => {
                                    return <OpponentFeatureLayout key={index} opponentIndex={opponentIndex}
                                                                  speciesIndex={speciesIndex} index={index}
                                                                  feature={feature} />
                                })}
                            </ul>
                        </li>
                    )
                })}
            </ul>
        </li>
    )
}
