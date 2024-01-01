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
    computeNumberOfFood: () => void
    decrementFood: () => void
}

const FoodsContext = createContext<FoodsContextResult>({} as FoodsContextResult)

export const FoodsProvider: FunctionComponent<PropsWithChildren<FoodsContextProps>> = ({
    children,
    initialAmountOfFood,
    initialHiddenFoods,
    gameId,
}) => {
    const { updatePlayerState } = usePlayerActionsContext()
    const [hiddenFoods, setHiddenFoods] = useState<number[]>(initialHiddenFoods)
    const [amountOfFood, setAmountOfFood] = useState(initialAmountOfFood)

    const channel = useMemo(() => PusherInstance.getGameChannel(gameId), [gameId])

    channel.bind(UPDATE_FOOD_STATUS, function (data: PushUpdateFoodData) {
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

    const decrementFood = (): void => {
        const newAmountOfFood = amountOfFood - 1
        setAmountOfFood(newAmountOfFood)
    }

    const res = {
        amountOfFood,
        hiddenFoods,
        computeNumberOfFood,
        decrementFood,
    }

    return <FoodsContext.Provider value={res}>{children}</FoodsContext.Provider>
}

export function useFoodsContext(): FoodsContextResult {
    return useContext(FoodsContext)
}
