'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { Card } from '@/src/models/card.model'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { UPDATE_PLAYER_CARDS } from '@/src/const/game-events.const'
import { PushUpdatePlayerCardsData } from '@/src/models/pusher.channels.model'

interface CardsContextResult {
    cards: Card[]
    getCard: (cardId: string) => Card
    removeCard: (cardId: string) => void
}

interface CardsContextProps {
    cards: Card[]
    gameId: string
    playerId: string
}

const CardsContext = createContext<CardsContextResult>({} as CardsContextResult)

export const CardsProvider: FunctionComponent<PropsWithChildren<CardsContextProps>> = ({
    children,
    cards: cardsData,
    gameId,
    playerId,
}) => {
    const [cards, setCards] = useState<Card[]>(cardsData)

    useEffect(() => {
        const channel = PusherInstance.getPlayerChannel(gameId, playerId)
        channel.bind(UPDATE_PLAYER_CARDS, async function (data: PushUpdatePlayerCardsData) {
            setCards(data.cards)
        })
    }, [gameId, playerId])

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
