import React, { FC } from 'react'
import { Card } from '@/src/models/card.model'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import Image from 'next/image'
import { getCardImage } from '@/src/lib/card.service.client'

interface CardProps {
    card: Card
    playCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = ({ card, playCard }) => {
    const { canDiscardCard, isAddingFoodStage } = usePlayerActionsContext()

    const cardImage = getCardImage(card)

    return (
        <div className="border border-indigo-600 w-40 h-52 ml-2 flex flex-col hover:mb-4 hover:bg-sky-700 group">
            <span className="mb-auto">{card.name}</span>
            <div className="relative self-center">
                {cardImage && <Image src={cardImage} alt="" height={85} />}
                {(isAddingFoodStage() || canDiscardCard(card)) && (
                    <button
                        className="bg-cyan-500 invisible group-hover:visible h-1/2 absolute top-1/4 left-2 right-2 rounded-md"
                        onClick={() => {
                            playCard(card.id)
                        }}
                    >
                        {isAddingFoodStage() && <>Add as food</>}
                        {canDiscardCard(card) && <>Discard card</>}
                    </button>
                )}
            </div>
            <span className="text-xs max-h-[64px]">{card.description}</span>
            <span className="self-end border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {card.foodNumber}
            </span>
        </div>
    )
}
