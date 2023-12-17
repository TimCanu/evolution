'use client'
import {FC} from "react";


interface CardProps {
    id: string
    name: string
    description: string
    foodNumber: number
    showAddFoodButton: boolean
    removeCard: (cardId: string) => void
}

export const CardLayout: FC<CardProps> = (
    {
        id,
        name,
        description,
        foodNumber,
        showAddFoodButton,
        removeCard
    }
) => {
    const addFood = () => {
        removeCard(id)
    }

    return (
        <div className="border border-indigo-600 w-40 h-52 ml-2 flex flex-col hover:mb-4 hover:bg-sky-700 group">
            <span className="mb-auto">
                {name}
            </span>
            {showAddFoodButton &&
                <button className="bg-cyan-500 invisible group-hover:visible" onClick={addFood}>
                    Add as food
                </button>
            }
            <span>
                {description}
            </span>
            <span className="self-end border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {foodNumber}
            </span>
        </div>
    )
}
