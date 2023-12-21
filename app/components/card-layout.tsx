import { FC } from 'react'
import { Card } from '@/app/models/card'

interface CardProps {
    card: Card
    showAddFoodButton: boolean
    showDiscardCard: boolean
    removeCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = ({ card, showAddFoodButton, removeCard, showDiscardCard }) => {
    return (
        <div className="border border-indigo-600 w-40 h-52 ml-2 flex flex-col hover:mb-4 hover:bg-sky-700 group">
            <span className="mb-auto">{card.name}</span>
            {showAddFoodButton && (
                <button
                    className="bg-cyan-500 invisible group-hover:visible"
                    onClick={() => {
                        removeCard(card.id)
                    }}
                >
                    Add as food
                </button>
            )}
            {showDiscardCard && (
                <button
                    className="bg-cyan-500 invisible group-hover:visible"
                    onClick={() => {
                        removeCard(card.id)
                    }}
                >
                    Discard card
                </button>
            )}
            <span>{card.description}</span>
            <span className="self-end border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {card.foodNumber}
            </span>
        </div>
    )
}
