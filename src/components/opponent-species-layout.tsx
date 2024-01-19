import { FC } from 'react'
import { OpponentFeatureLayout } from '@/src/components/opponent-feature-layout'
import { useGameContext } from '@/src/providers/game.provider'
import { feedSpecies } from '@/src/lib/species.service'
import { FeedMeatIcon } from '@/src/components/svg-icons/feed-meat-icon'
import { Species } from '@/src/models/species.model'

interface OpponentLayoutProps {
    opponentIndex: number
    speciesIndex: number
    species: Species
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ opponentIndex, speciesIndex, species }) => {
    const { carnivoreFeedingData, gameId, playerId } = useGameContext()
    const canBeEaten = carnivoreFeedingData.preyIds.includes(species.id)

    const feedCarnivore = async (): Promise<void> => {
        if (!carnivoreFeedingData.carnivoreId) {
            throw Error('Carnivore id is not defined!')
        }
        await feedSpecies({
            gameId,
            playerId,
            speciesId: carnivoreFeedingData.carnivoreId,
            preyId: species.id,
        })
    }
    return (
        <li key={speciesIndex} className="flex flex-col w-36">
            <p className="flex justify-around mb-2">
                <span
                    aria-label={`Species at index ${speciesIndex} of opponent at index ${opponentIndex} size: ${species.size}`}
                    className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center"
                >
                    {species.size}
                </span>
                {canBeEaten && (
                    <button
                        className="w-8"
                        aria-label={`Eat the species at index ${speciesIndex} of opponent at index ${opponentIndex}`}
                        onClick={feedCarnivore}
                    >
                        <FeedMeatIcon />
                    </button>
                )}
                <span
                    aria-label={`Species at index ${speciesIndex} of opponent at index ${opponentIndex} population: ${species.population}`}
                    className="border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center"
                >
                    {species.population}
                </span>
            </p>
            <ul>
                {species.features.map((feature, index) => {
                    return (
                        <OpponentFeatureLayout
                            key={index}
                            opponentIndex={opponentIndex}
                            speciesIndex={speciesIndex}
                            index={index}
                            feature={feature}
                        />
                    )
                })}
            </ul>
        </li>
    )
}
