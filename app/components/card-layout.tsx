import { FC } from 'react'
import { Card } from '@/app/models/card'
import { usePlayerActionsContext } from '@/app/providers/player-actions.provider'

interface CardProps {
    card: Card
    removeCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = ({ card, removeCard }) => {
    const { canDiscardCard, isAddingFoodStage } = usePlayerActionsContext()

    return (
        <div className="border border-indigo-600 w-40 h-52 ml-2 flex flex-col hover:mb-4 hover:bg-sky-700 group">
            <span className="mb-auto">{card.name}</span>
            {isAddingFoodStage() && (
                <button
                    className="bg-cyan-500 invisible group-hover:visible"
                    onClick={() => {
                        removeCard(card.id)
                    }}
                >
                    Add as food
                </button>
            )}
            {canDiscardCard() && (
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
