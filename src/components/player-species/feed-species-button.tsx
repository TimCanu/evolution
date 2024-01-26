import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { feedSpecies } from '@/src/lib/species.service'
import { useGameContext } from '@/src/providers/game.provider'
import { FeedMeatIcon } from '@/src/components/svg-icons/feed-meat-icon'
import { isCarnivore } from '@/src/lib/food.service.server'
import { CarnivoreWaitingIcon } from '@/src/components/svg-icons/carnivore-waiting-icon'
import { CarnivoreAttackingIcon } from '@/src/components/svg-icons/carnivore-attacking-icon'
import { GameStatus } from '@/src/enums/game.events.enum'
import { FoodIcon } from '@/src/components/svg-icons/food-icon'
import { useTranslationClient } from '@/src/i18n/i18n.client'

interface FeedSpeciesButtonProps {
    gameId: string
    index: number
    playerId: string
    species: Species
}

export const FeedSpeciesButton: FC<FeedSpeciesButtonProps> = ({ index, gameId, playerId, species }) => {
    const { t } = useTranslationClient()
    const { carnivoreFeedingData, updateStatus } = useGameContext()
    const { isFeedingStage } = usePlayerStatus()

    if (!isFeedingStage()) {
        return null
    }

    const canBeEaten = carnivoreFeedingData.preyIds.includes(species.id)

    const feedCarnivore = async (): Promise<void> => {
        if (!carnivoreFeedingData.carnivoreId) {
            throw Error('Carnivore ID should be defined')
        }
        updateStatus(GameStatus.WAITING_FOR_PLAYERS_TO_FEED)
        await feedSpecies({ gameId, playerId, speciesId: carnivoreFeedingData.carnivoreId, preyId: species.id })
    }

    return (
        <>
            <FeedCarnivoreButton index={index} species={species} />
            {canBeEaten ? (
                <button type="button" className="w-8" onClick={feedCarnivore}>
                    <FeedMeatIcon ariaLabel={t('eat-own-species', { index })} />
                </button>
            ) : (
                <FeedPlantsButton species={species} gameId={gameId} playerId={playerId} index={index} />
            )}
        </>
    )
}

interface FeedCarnivoreButtonProps {
    index: number
    species: Species
}

const FeedCarnivoreButton: FC<FeedCarnivoreButtonProps> = ({ index, species }) => {
    const { t } = useTranslationClient()
    const { carnivoreFeedingData, updateCarnivoreFeedingData } = useGameContext()

    const isCurrentlyFeeding = carnivoreFeedingData.carnivoreId === species.id
    const isAnotherCarnivoreFeeding = !!carnivoreFeedingData.carnivoreId && !isCurrentlyFeeding
    if (!isCarnivore(species) || species.foodEaten >= species.population || isAnotherCarnivoreFeeding) {
        return null
    }

    const toggleCarnivoreWantingToFeed = async (): Promise<void> => {
        if (carnivoreFeedingData.carnivoreId === species.id) {
            updateCarnivoreFeedingData(undefined, [])
        } else {
            updateCarnivoreFeedingData(species.id, species.preyIds)
        }
    }

    return (
        <>
            {species.preyIds.length > 0 ? (
                <button type="button" className="w-8" onClick={toggleCarnivoreWantingToFeed}>
                    {isCurrentlyFeeding ? (
                        <CarnivoreWaitingIcon ariaLabel={t('carnivore-feeding-cancel')} />
                    ) : (
                        <CarnivoreAttackingIcon ariaLabel={t('feed-carnivore', { index })} />
                    )}
                </button>
            ) : (
                <span>{t('go-vegan')}</span>
            )}
        </>
    )
}

interface FeedPlantsButtonProps {
    gameId: string
    playerId: string
    species: Species
    index: number
}

const FeedPlantsButton: FC<FeedPlantsButtonProps> = ({ gameId, playerId, species, index }) => {
    const { t } = useTranslationClient()
    if (isCarnivore(species) || species.foodEaten >= species.population) {
        return null
    }

    const feedPlantsEater = async (): Promise<void> => {
        await feedSpecies({ gameId, playerId, speciesId: species.id, preyId: undefined })
    }

    return (
        <button
            type="button"
            className="flex justify-center items-center"
            aria-label={t('feed-plant', { index })}
            onClick={feedPlantsEater}
        >
            <FoodIcon width="32px" height="32px" />
        </button>
    )
}
