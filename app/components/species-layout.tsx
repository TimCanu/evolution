'use client'
import {FC} from "react";
import { Card } from "./../models/card"


interface CardProps {
    size: number
    population: number
}

export const SpeciesLayout: FC<CardProps> = ({size, population}) => {
    return (
        <div className="border border-indigo-600 mb-5 w-20 h-8 ml-2 flex flex-row justify-between">
            <span className="border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {size}
            </span>
            <span className=" border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {population}
            </span>
        </div>
    )
}
