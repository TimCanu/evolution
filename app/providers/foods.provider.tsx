'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react'
import { ActionState, usePlayerActionsContext } from '@/app/providers/player-actions.provider'

interface FoodsContextResult {
    amountOfFood: number
    hiddenFoods: number[]
    addFood: (foodNumber: number) => void
    computeNumberOfFood: () => void
}

const FoodsContext = createContext<FoodsContextResult>({} as FoodsContextResult)

export const FoodsProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const { updatePlayerState } = usePlayerActionsContext()
    const [hiddenFoods, setHiddenFoods] = useState<number[]>([])
    const [amountOfFood, setAmountOfFood] = useState(0)

    const addFood = (foodNumber: number): void => {
        setHiddenFoods([...hiddenFoods, foodNumber])
        updatePlayerState({ action: ActionState.CHOOSING_EVOLVING_ACTION })
    }

    const computeNumberOfFood = (): void => {
        const newAmountOfFood = hiddenFoods.reduce((previousValue, currentAmountOfFoods) => {
            return previousValue + currentAmountOfFoods
        }, amountOfFood)
        setAmountOfFood(newAmountOfFood > 0 ? newAmountOfFood : 0)
        setHiddenFoods([])
        updatePlayerState({ action: ActionState.FEEDING })
    }

    const res = {
        amountOfFood,
        hiddenFoods,
        addFood,
        computeNumberOfFood,
    }

    return <FoodsContext.Provider value={res}>{children}</FoodsContext.Provider>
}

export function useFoodsContext(): FoodsContextResult {
    return useContext(FoodsContext)
}
