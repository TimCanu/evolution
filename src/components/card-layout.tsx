import React, { FC } from 'react'
import { Card } from '@/src/models/card.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import Image from 'next/image'
import { getCardImage } from '@/src/lib/card.service.client'
import { useGameContext } from '@/src/providers/game.provider'
import { GameStatus } from '@/src/enums/game.events.enum'

interface CardProps {
    card: Card
    index: number
    playCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = ({ card, index, playCard }) => {
    const { canDiscardCard, isAddingFoodStage, isFeedingStage } = usePlayerStatus()
    const { status } = useGameContext()

    const cardImage = getCardImage(card.featureKey)

    const canDiscard = canDiscardCard(card)
    const isClickable = isAddingFoodStage() || canDiscardCard(card)
    const bgColor =
        isClickable || isFeedingStage() || status === GameStatus.CHOOSING_EVOLVING_ACTION
            ? 'bg-amber-900'
            : 'bg-gray-500'

    const onCardClick = (): void => {
        if (isClickable) {
            playCard(card.id)
        }
    }
    const getAriaLabel = (): string => {
        if (isAddingFoodStage()) {
            return `Use the card ${card.name} to add ${card.foodNumber} to the water plan`
        }
        if (canDiscard) {
            return `Discard the card ${card.name}`
        }
        return `${card.name}: ${card.description}`
    }

    return (
        <li
            role="button"
            aria-label={getAriaLabel()}
            data-testid={`card-${index}`}
            className={`${
                isClickable ? 'cursor-pointer' : 'cursor-auto'
            } ${bgColor} bg-opacity-75 rounded-md border w-32 ml-2 h-full flex flex-col hover:h-auto group hover:scale-150 hover:mb-11`}
            onClick={onCardClick}
        >
            <h1 className="mb-2 self-center flex w-full justify-between pl-2">
                {card.name}
                <p className="self-end mb-0 mt-auto bg-green-900 h-auto rounded w-8 flex justify-center items-center">
                    {card.foodNumber}
                </p>
            </h1>
            <Image className="self-center mb-1" src={cardImage} alt={`${card.name}: ${card.description}`} height={60} />
            <p className="invisible text-[9px] h-0 text-center group-hover:visible group-hover:h-14">
                {card.description}
            </p>
        </li>
    )
}
