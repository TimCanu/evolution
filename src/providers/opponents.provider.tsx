'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { Player } from '@/src/models/player'
import { PusherInstance } from '@/src/lib/pusher.service'
import { useParams, useSearchParams } from 'next/navigation'
import { OPPONENTS_STATUS } from '@/src/const/game-events.const'
import { getOpponents } from '@/src/lib/opponents.service'

interface OpponentsContextResult {
    opponents: Player[]
}

interface OpponentsContextProps {
    opponents: Player[]
}

const OpponentsContext = createContext<OpponentsContextResult>({} as OpponentsContextResult)

export const OpponentsProvider: FunctionComponent<PropsWithChildren<OpponentsContextProps>> = ({
    children,
    opponents: opponentsData,
}) => {
    const { gameId } = useParams<{ gameId: string }>()
    const searchParams = useSearchParams()

    const [opponents, setOpponents] = useState<Player[]>(opponentsData)

    const playerId = useMemo(() => searchParams.get('playerId'), [searchParams])

    if (!playerId) {
        throw Error('Player ID must be provided')
    }

    const channel = useMemo(() => PusherInstance.getChannel(gameId), [gameId])

    channel.bind(OPPONENTS_STATUS, async function (data: { refresh: boolean }) {
        if (data.refresh) {
            const refreshedOpponents = await getOpponents(gameId, playerId)
            setOpponents(refreshedOpponents)
        }
    })

    const res = {
        opponents,
    }

    return <OpponentsContext.Provider value={res}>{children}</OpponentsContext.Provider>
}

export function useOpponentsContext(): OpponentsContextResult {
    return useContext(OpponentsContext)
}
