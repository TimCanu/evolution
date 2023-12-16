'use client'
import {FC} from "react";
import { Card } from "./../models/card"


interface CardProps {
    id:string
    name: string
    description: string
    foodNumber: number
    removeCard: (cardId:string) => void
}

export const CardLayout: FC<CardProps> = ({id, name, description, foodNumber, removeCard}) => {
    const addFood = () => {
        removeCard(id)

    }
    return (
        <div className="border border-indigo-600 w-64 h-64 ml-5 flex flex-col hover:h-72 hover:bg-sky-700 group">
            <span className="mb-auto">
                {name}
            </span>
            <button className="bg-cyan-500 invisible group-hover:visible" onClick={addFood}>
                Add as food
            </button>
            <span>
                {description}
            </span>
            <span className="self-end border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {foodNumber}
            </span>
        </div>
    )
}
