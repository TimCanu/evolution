'use client'
import { Card } from '@/src/models/card.model'
import { useGameContext } from '@/src/providers/game.provider'

interface CardsResult {
    getCard: (cardId: string) => Card
    removeCard: (cardId: string) => void
}

export const useCards = (): CardsResult => {
    const { cards, updateCards } = useGameContext()

    const removeCard = (cardId: string): void => {
        const updatedCards = cards.filter((card) => card.id !== cardId)
        updateCards(updatedCards)
    }

    const getCard = (cardId: string): Card => {
        const card = cards.find((card) => card.id === cardId)
        if (!card) {
            throw Error(`Could not find any card with id ${cardId}`)
        }
        return card
    }

    return {
        getCard,
        removeCard
    }
}
