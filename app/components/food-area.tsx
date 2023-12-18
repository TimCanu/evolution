import { FC } from 'react'

interface FoodAreaProps {
    foodsAdded: number[]
    amountOfFood: number
}

export const FoodArea: FC<FoodAreaProps> = ({ foodsAdded, amountOfFood }) => {
    return (
        <div className="place-self-center h-64 w-1/3 bg-cyan-500 rounded-[50%] flex flex-row">
            {foodsAdded.map((food, index) => {
                return (
                    <div
                        className="w-10 h-10 bg-sky-800 border mr-5"
                        key={index}
                    />
                )
            })}
            {amountOfFood}
        </div>
    )
}
