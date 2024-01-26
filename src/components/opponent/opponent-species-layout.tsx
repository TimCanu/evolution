import { FC } from 'react'
import { OpponentFeatureLayout } from '@/src/components/opponent/opponent-feature-layout'
import { useGameContext } from '@/src/providers/game.provider'
import { feedSpecies } from '@/src/lib/species.service'
import { FeedMeatIcon } from '@/src/components/svg-icons/feed-meat-icon'
import { Species } from '@/src/models/species.model'
import { useTranslationClient } from '@/src/i18n/i18n.client'

interface OpponentLayoutProps {
    opponentIndex: number
    speciesIndex: number
    species: Species
}

export const OpponentSpeciesLayout: FC<OpponentLayoutProps> = ({ opponentIndex, speciesIndex, species }) => {
    const { t } = useTranslationClient()
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
            preyId: species.id
        })
    }
    return (
        <li key={speciesIndex} className="flex flex-col w-36">
            <p className="flex justify-between border mb-1 w-32 flex-row items-center min-w-32 self-center bg-amber-900 rounded-md h-14">
                <span
                    aria-label={t('opponent-species-size', { speciesIndex, opponentIndex, size: species.size })}
                    className="border border-indigo-600 bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center ml-2"
                >
                    {species.size}
                </span>
                {canBeEaten && (
                    <button type="button" className="w-8" onClick={feedCarnivore}>
                        <FeedMeatIcon ariaLabel={t('opponent-eat-species', { speciesIndex, opponentIndex })} />
                    </button>
                )}
                <span
                    aria-label={t('opponent-species-population', {
                        speciesIndex,
                        opponentIndex,
                        population: species.population
                    })}
                    className="border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center mr-2"
                >
                    {species.population}
                </span>
            </p>
            <ul className="flex self-center mb-1 group">
                {species.features.map((feature, index) => {
                    return <OpponentFeatureLayout key={feature.key} feature={feature} />
                })}
            </ul>
        </li>
    )
}
