'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { Card } from '@/src/models/card'
import { PusherInstance } from '@/src/lib/pusher.service'
import { PLAYER_STATUS } from '@/src/const/game-events.const'
import { getPlayer } from '@/src/lib/players.service'

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

    const channel = useMemo(() => PusherInstance.getChannel(gameId), [gameId])

    channel.bind(PLAYER_STATUS, async function (data: { playerId: string }) {
        if (data.playerId === playerId) {
            const player = await getPlayer(gameId, playerId)
            setCards(player.cards)
        }
    })

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
