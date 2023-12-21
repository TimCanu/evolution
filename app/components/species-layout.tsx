import { FC } from 'react'

interface CardProps {
    canShowAddSpeciesLeftButton: boolean
    canShowAddSpeciesRightButton: boolean
    id: string
    size: number
    population: number
    isEditable: boolean
    addSpeciesOnTheLeft: () => void
    addSpeciesOnTheRight: () => void
    incrementPopulation: (id: string) => void
    incrementSize: (id: string) => void
}

export const SpeciesLayout: FC<CardProps> = ({
    canShowAddSpeciesLeftButton = false,
    canShowAddSpeciesRightButton = false,
    id,
    size,
    population,
    isEditable = false,
    addSpeciesOnTheLeft,
    addSpeciesOnTheRight,
    incrementSize,
    incrementPopulation,
}) => {
    return (
        <>
            {isEditable && canShowAddSpeciesLeftButton && (
                <button
                    className="mb-5 border border-indigo-600"
                    onClick={addSpeciesOnTheLeft}
                >
                    Add a new specie here
                </button>
            )}
            {isEditable && size < 6 && (
                <button className="mb-5 mx-2" onClick={() => incrementSize(id)}>
                    +
                </button>
            )}
            <div className="border border-indigo-600 mb-5 w-20 h-8 flex flex-row justify-between">
                <span className="border border-indigo-600 bg-orange-600	rounded-full w-8 h-8 flex justify-center items-center">
                    {size}
                </span>
                <span className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center">
                    {population}
                </span>
            </div>
            {isEditable && population < 6 && (
                <button
                    className="mb-5 mx-2"
                    onClick={() => incrementPopulation(id)}
                >
                    +
                </button>
            )}
            {isEditable && canShowAddSpeciesRightButton && (
                <button
                    className="mb-5 border border-indigo-600"
                    onClick={addSpeciesOnTheRight}
                >
                    Add a new specie here
                </button>
            )}
        </>
    )
}
