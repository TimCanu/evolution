import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'
import { OpponentFeatureLayout } from '@/src/components/opponent-feature-layout'
import { GameStatus } from '@/src/enums/game.events.enum'
import playerTurnDino from '../assets/images/player-turn-dyno.png'
import Image from 'next/image'

interface OpponentLayoutProps {
    opponent: Opponent
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ opponent }) => {
    return (
        <div className="border border-indigo-600 w-80 h-44 ml-5 text-center">
            <div className="flex gap-4">
                {opponent.isFirstPlayerToFeed && <Image src={playerTurnDino} alt="" height={35} />}
                <div className="mb-2">
                    {opponent.name} {opponent.status === GameStatus.FEEDING_SPECIES && <> - Is feeding</>}
                </div>
            </div>

            <div className="flex justify-around">
                {opponent.species.map((species, index) => {
                    return (
                        <div key={index} className="flex flex-col w-36">
                            <div className="flex justify-around">
                                <div className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center">
                                    {species.size}
                                </div>
                                <div className="border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                                    {species.population}
                                </div>
                            </div>
                            <div>
                                {species.features.map((feature, index) => {
                                    return <OpponentFeatureLayout key={index} feature={feature} />
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
