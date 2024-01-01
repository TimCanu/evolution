'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { GameStatus } from '@/src/enums/game.events.enum'
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
    decrementFood: () => void
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
    const { updatePlayerState } = usePlayerActionsContext()

    const channel = useMemo(() => PusherInstance.getGameChannel(gameId), [gameId])

    channel.bind(UPDATE_FOOD_STATUS, function (data: PushUpdateFoodData) {
        setHiddenFoods(data.hiddenFoods)
        setAmountOfFood(data.amountOfFood)
    })

    const decrementFood = (): void => {
        const newAmountOfFood = amountOfFood - 1
        setAmountOfFood(newAmountOfFood)

        if (newAmountOfFood === 0) {
            updatePlayerState({ action: GameStatus.ADDING_FOOD_TO_WATER_PLAN })
        }
    }

    const res = {
        amountOfFood,
        hiddenFoods,
        decrementFood,
    }

    return <FoodsContext.Provider value={res}>{children}</FoodsContext.Provider>
}

export function useFoodsContext(): FoodsContextResult {
    return useContext(FoodsContext)
}
