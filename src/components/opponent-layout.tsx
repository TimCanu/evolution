import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerTurnDinoIcon } from '@/src/components/svg-icons/player-turn-icon'
import { OpponentSpeciesLayout } from '@/src/components/opponent-species-layout'

interface OpponentLayoutProps {
    opponent: Opponent
    opponentIndex: number
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ opponent, opponentIndex }) => {
    return (
        <li className="border border-indigo-600 w-80 h-44 ml-5 text-center">
            <h1 className="mx-4 flex justify-between mb-2">
                {opponent.isFirstPlayerToFeed && (
                    <PlayerTurnDinoIcon ariaLabel={`The player ${opponent.name} is the first player to feed`} />
                )}
                <span aria-label={`Opponent's at index ${opponentIndex} name is ${opponent.name}`}>
                    {opponent.name}
                </span>
                <span role="status" className="mx-4">
                    Number of points: {opponent.numberOfFoodEaten}{' '}
                    {opponent.status === GameStatus.FEEDING_SPECIES && <> - Is feeding</>}
                </span>
            </h1>

            <ul className="flex justify-around">
                {opponent.species.map((species, speciesIndex) => {
                    return (
                        <OpponentSpeciesLayout
                            key={speciesIndex}
                            species={species}
                            speciesIndex={speciesIndex}
                            opponentIndex={opponentIndex}
                        />
                    )
                })}
            </ul>
        </li>
    )
}
