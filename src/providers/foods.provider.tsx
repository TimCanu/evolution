'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { GameStatus } from '@/src/enums/game.events.enum'
import { useParams, useSearchParams } from 'next/navigation'
import { PusherInstance } from '@/src/lib/pusher.service'
import { FOOD_STATUS } from '@/src/const/game-events.const'

interface FoodsContextProps {
    initialAmountOfFood: number
    initialHiddenFoods: number[]
}

interface FoodsContextResult {
    amountOfFood: number
    hiddenFoods: number[]
    computeNumberOfFood: () => void
}

const FoodsContext = createContext<FoodsContextResult>({} as FoodsContextResult)

export const FoodsProvider: FunctionComponent<PropsWithChildren<FoodsContextProps>> = ({
    children,
    initialAmountOfFood,
    initialHiddenFoods,
}) => {
    const { updatePlayerState } = usePlayerActionsContext()
    const [hiddenFoods, setHiddenFoods] = useState<number[]>(initialHiddenFoods)
    const [amountOfFood, setAmountOfFood] = useState(initialAmountOfFood)

    const searchParams = useSearchParams()
    const { gameId } = useParams<{ gameId: string }>()
    const playerId = useMemo(() => searchParams.get('playerId'), [searchParams])

    if (!playerId) {
        throw Error('Player ID must be provided')
    }

    const channel = useMemo(() => PusherInstance.getChannel(gameId), [gameId])

    channel.bind(FOOD_STATUS, function (data: { hiddenFoods: number[]; amountOfFood: number }) {
        setHiddenFoods(data.hiddenFoods)
        setAmountOfFood(data.amountOfFood)
    })

    const computeNumberOfFood = (): void => {
        const newAmountOfFood = hiddenFoods.reduce((previousValue, currentAmountOfFoods) => {
            return previousValue + currentAmountOfFoods
        }, amountOfFood)
        setAmountOfFood(newAmountOfFood > 0 ? newAmountOfFood : 0)
        setHiddenFoods([])
        updatePlayerState({ action: GameStatus.FEEDING_SPECIES })
    }

    const res = {
        amountOfFood,
        hiddenFoods,
        computeNumberOfFood,
    }

    return <FoodsContext.Provider value={res}>{children}</FoodsContext.Provider>
}

export function useFoodsContext(): FoodsContextResult {
    return useContext(FoodsContext)
}
