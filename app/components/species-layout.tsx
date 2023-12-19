'use client'
import { FC } from 'react'
import { Card } from './../models/card'

interface CardProps {
    id: string
    size: number
    population: number
    incrementSize: (id: string) => void
    showAddSizeButton: boolean
    incrementPopulation: (id: string) => void
    showAddPopulationButton: boolean
}

export const SpeciesLayout: FC<CardProps> = ({
    id,
    size,
    population,
    incrementSize,
    showAddSizeButton,
    incrementPopulation,
    showAddPopulationButton,
}) => {
    return (
        <>
            {showAddSizeButton && size < 6 && (
                <button className="mb-5" onClick={() => incrementSize(id)}>
                    +
                </button>
            )}
            <div className="border border-indigo-600 mb-5 w-20 h-8 ml-2 flex flex-row justify-between">
                <span className="border border-indigo-600 bg-orange-600	rounded-full w-8 h-8 flex justify-center items-center">
                    {size}
                </span>
                <span className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                    {population}
                </span>
            </div>
            {showAddPopulationButton && population < 6 && (
                <button
                    className="mb-5"
                    onClick={() => incrementPopulation(id)}
                >
                    +
                </button>
            )}
        </>
    )
}
