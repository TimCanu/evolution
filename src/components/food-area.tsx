import { FC } from 'react'
import { useGameContext } from '@/src/providers/game.provider'

export const FoodArea: FC = () => {
    const { hiddenFoods, amountOfFood } = useGameContext()
    return (
        <div className="place-self-center h-64 w-1/3 bg-cyan-500 rounded-[50%] flex flex-row">
            {hiddenFoods.map((_, index) => {
                return (
                    <div
                        data-testid={`hidden-food-${index}`}
                        className="w-10 h-10 bg-sky-800 border mr-5"
                        key={index}
                    />
                )
            })}
            {amountOfFood > 0 &&
                [...Array(amountOfFood)].map((_, index) => {
                    return (
                        <div
                            data-testid="food-element"
                            className="border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center"
                            key={index}
                        />
                    )
                })}
        </div>
    )
}
