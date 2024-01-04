import { FC } from 'react'
import { Card } from '@/src/models/card.model'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'

interface CardProps {
    card: Card
    playCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = ({ card, playCard }) => {
    const { canDiscardCard, isAddingFoodStage } = usePlayerActionsContext()

    return (
        <div className="border border-indigo-600 w-40 h-52 ml-2 flex flex-col hover:mb-4 hover:bg-sky-700 group">
            <span className="mb-auto">{card.name}</span>
            {isAddingFoodStage() && (
                <button
                    className="bg-cyan-500 invisible group-hover:visible"
                    onClick={() => {
                        playCard(card.id)
                    }}
                >
                    Add as food
                </button>
            )}
            {canDiscardCard(card) && (
                <button
                    className="bg-cyan-500 invisible group-hover:visible"
                    onClick={() => {
                        playCard(card.id)
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
