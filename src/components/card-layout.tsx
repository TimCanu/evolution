import React, { FC, KeyboardEventHandler } from 'react'
import { Card } from '@/src/models/card.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import Image from 'next/image'
import { useGameContext } from '@/src/providers/game.provider'
import { GameStatus } from '@/src/enums/game.events.enum'
import { useTranslationClient } from '@/src/i18n/i18n.client'
import { getCardImage } from '@/src/lib/card-images.service.client'
import { getFeatureDescription, getFeatureName } from '@/src/lib/feature.service.client'

interface CardProps {
    card: Card
    index: number
    playCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = ({ card, index, playCard }) => {
    const { t } = useTranslationClient()
    const { canDiscardCard, isAddingFoodStage, isFeedingStage } = usePlayerStatus()
    const { status } = useGameContext()

    const cardImage = getCardImage(card.featureKey)
    const cardName = getFeatureName(card.featureKey)
    const cardDescription = getFeatureDescription(card.featureKey)

    const canDiscard = canDiscardCard(card)
    const isClickable = isAddingFoodStage() || canDiscardCard(card)
    const bgColor =
        isClickable || isFeedingStage() || status === GameStatus.CHOOSING_EVOLVING_ACTION
            ? 'bg-amber-900 '
            : 'bg-gray-500 '

    const selectCard = (): void => {
        if (isClickable) {
            playCard(card.id)
        }
    }

    const onCardKeyPress = (event: React.KeyboardEvent<HTMLLIElement>): void => {
        if (event.key === 'Enter') {
            selectCard()
        }
    }

    const getAriaLabel = (): string => {
        if (isAddingFoodStage()) {
            return t('add-card-as-food', { name: cardName, foodNumber: card.foodNumber })
        }
        if (canDiscard) {
            return t('discard-card', { name: cardName })
        }
        return `${cardName}: ${cardDescription}`
    }

    return (
        <li
            aria-label={getAriaLabel()}
            data-testid={`card-${index}`}
            className={`${isClickable ? 'cursor-pointer ' : 'cursor-auto '}
             ${bgColor} bg-opacity-75 rounded-md border w-32 ml-2 h-full flex flex-col group`}
            onClick={selectCard}
            onKeyDown={onCardKeyPress}
        >
            <h1 className="mb-2 self-center flex w-full justify-between pl-2 group-hover:hidden">
                {cardName}
                <p className="self-end mb-0 mt-auto bg-green-900 h-auto rounded w-8 flex justify-center items-center">
                    {card.foodNumber}
                </p>
            </h1>
            <Image
                className="self-center mb-1 group-hover:hidden"
                src={cardImage}
                alt={`${cardName}: ${cardDescription}`}
                height={60}
            />
            <p className="hidden text-[12px] my-1 mx-1 text-center group-hover:flex h-full justify-center items-center ">
                {cardDescription}
            </p>
        </li>
    )
}
