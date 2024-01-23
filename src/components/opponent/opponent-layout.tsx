import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerTurnDinoIcon } from '@/src/components/svg-icons/player-turn-icon'
import { OpponentSpeciesLayout } from '@/src/components/opponent/opponent-species-layout'
import Image from 'next/image'
import PouchImg from '@/src/assets/images/pouch.png'
import { PlayerEatingIcon } from '@/src/components/svg-icons/player-eating-icon'

interface OpponentLayoutProps {
    opponent: Opponent
    opponentIndex: number
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ opponent, opponentIndex }) => {
    return (
        <li className="border border-white-600 rounded-md w-fit h-48 ml-5 text-center">
            <h1 className="mx-2 flex justify-between h-10 mt-1">
                <span
                    className="text-lg text-amber-900 font-bold mx-1"
                    aria-label={`Opponent's at index ${opponentIndex} name is ${opponent.name}`}
                >
                    {opponent.name}
                </span>

                <span role="status" className="flex">
                    <div className="relative self-center place-self-end w-8">
                        <Image
                            src={PouchImg}
                            alt={`${opponent.name} number of points: ${opponent.numberOfFoodEaten}`}
                        />
                        <span className="absolute text-xs bottom-1 start-2 border rounded-full w-4 h-4 text-center">
                            {opponent.numberOfFoodEaten}
                        </span>
                    </div>
                    {opponent.isFirstPlayerToFeed && (
                        <PlayerTurnDinoIcon ariaLabel={`The player ${opponent.name} is the first player to feed`} />
                    )}
                    {/*Number of points: {opponent.numberOfFoodEaten}{' '}*/}
                    {opponent.status === GameStatus.FEEDING_SPECIES && (
                        <div className="w-8 h-8">
                            <PlayerEatingIcon />
                        </div>
                    )}
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
