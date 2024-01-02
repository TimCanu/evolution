'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { UPDATE_OPPONENT_STATUS } from '@/src/const/game-events.const'
import { Opponent } from '@/src/models/opponent.model'
import { PushUpdatePlayerOpponentsData } from '@/src/models/pusher.channels.model'

interface OpponentsContextResult {
    opponents: Opponent[]
}

interface OpponentsContextProps {
    opponents: Opponent[]
    gameId: string
    playerId: string
}

const OpponentsContext = createContext<OpponentsContextResult>({} as OpponentsContextResult)

export const OpponentsProvider: FunctionComponent<PropsWithChildren<OpponentsContextProps>> = ({
                                                                                                   children,
                                                                                                   opponents: opponentsData,
                                                                                                   gameId,
                                                                                                   playerId,
                                                                                               }) => {
    const [opponents, setOpponents] = useState<Opponent[]>(opponentsData)

    useEffect(() => {
        const channel = PusherInstance.getPlayerChannel(gameId, playerId)

        channel.bind(UPDATE_OPPONENT_STATUS, async function(data: PushUpdatePlayerOpponentsData) {
            setOpponents(data.opponents)
        })
    }, [gameId, playerId])

    const res = {
        opponents,
    }

    return <OpponentsContext.Provider value={res}>{children}</OpponentsContext.Provider>
}

export function useOpponentsContext(): OpponentsContextResult {
    return useContext(OpponentsContext)
}
