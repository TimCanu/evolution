'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { Player } from '@/src/models/player'
import { PusherInstance } from '@/src/lib/pusher.service'
import { useParams, useSearchParams } from 'next/navigation'
import { PLAYER_STATUS } from '@/src/const/game-events.const'
import { getOpponents } from '@/src/lib/players.service'

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
    const [opponents, setOpponents] = useState<Player[]>(opponentsData)

    const searchParams = useSearchParams()
    const { gameId } = useParams<{ gameId: string }>()
    const playerId = useMemo(() => searchParams.get('playerId'), [searchParams])

    if (!playerId) {
        throw Error('Player ID must be provided')
    }

    const channel = useMemo(() => PusherInstance.getChannel(gameId), [gameId])

    channel.bind(PLAYER_STATUS, async function (data: { playerId: string }) {
        if (data.playerId !== playerId) {
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
