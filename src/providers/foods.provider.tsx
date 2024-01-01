'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { UPDATE_FOOD_STATUS } from '@/src/const/game-events.const'
import { PushUpdateFoodData } from '@/src/models/pusher.channels.model'

interface FoodsContextProps {
    initialAmountOfFood: number
    initialHiddenFoods: number[]
    gameId: string
}

interface FoodsContextResult {
    amountOfFood: number
    hiddenFoods: number[]
}

const FoodsContext = createContext<FoodsContextResult>({} as FoodsContextResult)

export const FoodsProvider: FunctionComponent<PropsWithChildren<FoodsContextProps>> = ({
    children,
    initialAmountOfFood,
    initialHiddenFoods,
    gameId,
}) => {
    const [hiddenFoods, setHiddenFoods] = useState<number[]>(initialHiddenFoods)
    const [amountOfFood, setAmountOfFood] = useState(initialAmountOfFood)

    const channel = useMemo(() => PusherInstance.getGameChannel(gameId), [gameId])

    channel.bind(UPDATE_FOOD_STATUS, function (data: PushUpdateFoodData) {
        setHiddenFoods(data.hiddenFoods)
        setAmountOfFood(data.amountOfFood)
    })

    const res = {
        amountOfFood,
        hiddenFoods,
    }

    return <FoodsContext.Provider value={res}>{children}</FoodsContext.Provider>
}

export function useFoodsContext(): FoodsContextResult {
    return useContext(FoodsContext)
}
