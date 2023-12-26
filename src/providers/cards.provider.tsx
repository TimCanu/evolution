'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react'
import { Card } from '@/src/models/card'

interface CardsContextResult {
    cards: Card[]
    getCard: (cardId: string) => Card
    removeCard: (cardId: string) => void
}

interface CardsContextProps {
    cards: Card[]
}

const CardsContext = createContext<CardsContextResult>({} as CardsContextResult)

export const CardsProvider: FunctionComponent<PropsWithChildren<CardsContextProps>> = ({
    children,
    cards: cardsData,
}) => {
    const [cards, setCards] = useState<Card[]>(cardsData)

    const removeCard = (cardId: string): void => {
        const updatedCards = cards.filter((card) => card.id !== cardId)
        setCards(updatedCards)
    }

    const getCard = (cardId: string): Card => {
        const card = cards.find((card) => card.id === cardId)
        if (!card) {
            throw Error(`Could not find any card with id ${cardId}`)
        }
        return card
    }

    const res = {
        cards,
        getCard,
        removeCard,
    }

    return <CardsContext.Provider value={res}>{children}</CardsContext.Provider>
}

export function useCardsContext(): CardsContextResult {
    return useContext(CardsContext)
}
