'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react'
import { ActionState, usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { Player } from '@/src/models/player'

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

    const res = {
        opponents,
    }

    return <OpponentsContext.Provider value={res}>{children}</OpponentsContext.Provider>
}

export function useOpponentsContext(): OpponentsContextResult {
    return useContext(OpponentsContext)
}
