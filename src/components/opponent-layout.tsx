import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'
import { OpponentFeatureLayout } from '@/src/components/opponent-feature-layout'

interface OpponentLayoutProps {
    opponent: Opponent
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ opponent }) => {
    return <div className="border border-indigo-600 w-80 h-44 ml-5 text-center">
        <div className="mb-2">{opponent.name}</div>

        <div className="flex justify-around">
            {opponent.species.map((species, index) => {
                return (
                    <div key={index} className="flex flex-col w-36">
                        <div className="flex justify-around">
                            <div
                                className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center">
                                {species.size}
                            </div>
                            <div
                                className="border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
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
}
