'use client'

import { v4 as uuidv4 } from 'uuid'
import { OpponentLayout } from '@/app/components/opponent-layout'
import opponentsData from './data/opponents.json'
import cardsData from './data/cards.json'
import speciesData from './data/species.json'
import { Opponent } from '@/app/models/opponent'
import { FoodArea } from '@/app/components/food-area'
import { CardLayout } from '@/app/components/card-layout'
import { Card } from '@/app/models/card'
import { useState } from 'react'
import { Species } from '@/app/models/species'
import { SpeciesLayout } from '@/app/components/species-layout'

export default function Home() {
    const opponents: Opponent[] = opponentsData

    const [cards, setCards] = useState<Card[]>(cardsData)
    const [species, setSpecies] = useState<Species[]>(speciesData)
    const [foods, setFoods] = useState<number[]>([])
    const [amountOfFood, setAmountOfFood] = useState(0)
    const [isAddingSpeciesToTheLeft, setIsAddingSpeciesToTheLeft] =
        useState(false)
    const [isAddingSpeciesToTheRight, setIsAddingSpeciesToTheRight] =
        useState(false)
    const [speciesIdToIncrementSize, setSpeciesIdToIncrementSize] = useState<
        string | null
    >(null)
    const [speciesIdToIncrementPopulation, setSpeciesIdToIncrementPopulation] =
        useState<string | null>(null)

    const hasAddedFood = (): boolean => {
        return foods.length > 0
    }

    const removeCardFromState = (cardId: string): void => {
        const updatedCards = cards.filter((card) => card.id !== cardId)
        setCards(updatedCards)
    }

    const addFood = (cardId: string): void => {
        const foodNumber = cards.find((card) => card.id === cardId)?.foodNumber
        if (!foodNumber) {
            throw Error('Food number is undefined')
        }
        setFoods([...foods, foodNumber])
    }

    const incrementSize = (): void => {
        const newSpeciesList = species.map((specie) => {
            if (specie.id !== speciesIdToIncrementSize) {
                return specie
            }
            return { ...specie, size: specie.size + 1 }
        })
        setSpecies(newSpeciesList)
        setSpeciesIdToIncrementSize(null)
    }

    const incrementPopulation = (): void => {
        const newSpeciesList = species.map((specie) => {
            if (specie.id !== speciesIdToIncrementPopulation) {
                return specie
            }
            return { ...specie, population: specie.population + 1 }
        })
        setSpecies(newSpeciesList)
        setSpeciesIdToIncrementPopulation(null)
    }

    const addSpeciesToTheLeft = (): void => {
        const newSpecies: Species = { size: 1, population: 1, id: uuidv4() }
        setSpecies([newSpecies, ...species])
        setIsAddingSpeciesToTheLeft(false)
    }

    const addSpeciesToTheRight = (): void => {
        const newSpecies: Species = { size: 1, population: 1, id: uuidv4() }
        setSpecies([newSpecies, ...species])
        setIsAddingSpeciesToTheLeft(false)
    }

    const removeCard = (cardId: string): void => {
        if (!hasAddedFood()) {
            addFood(cardId)
        } else if (speciesIdToIncrementSize) {
            incrementSize()
        } else if (speciesIdToIncrementPopulation) {
            incrementPopulation()
        } else if (isAddingSpeciesToTheLeft) {
            addSpeciesToTheLeft()
        } else if (isAddingSpeciesToTheRight) {
            addSpeciesToTheRight()
        } else {
            throw Error('Action is not supported')
        }
        removeCardFromState(cardId)
    }

    const computeNumberOfFood = (): void => {
        const newAmountOfFood = foods.reduce(
            (previousValue, currentAmountOfFoods) => {
                return previousValue + currentAmountOfFoods
            },
            amountOfFood
        )
        setAmountOfFood(newAmountOfFood > 0 ? newAmountOfFood : 0)
        setFoods([])
    }

    const showDiscardCardMessage = (): boolean => {
        return (
            !!speciesIdToIncrementSize ||
            !!speciesIdToIncrementPopulation ||
            isAddingSpeciesToTheLeft ||
            isAddingSpeciesToTheRight
        )
    }

    return (
        <div className="grid grid-rows-4 min-h-[100vh] max-h-[100vh]">
            <div className="mt-1 row-span-1 flex flex-row justify-around">
                {opponents.map((opponent, index) => {
                    return <OpponentLayout key={index} name={opponent.name} />
                })}
            </div>
            <div className="flex justify-center row-span-1">
                <FoodArea amountOfFood={amountOfFood} foodsAdded={foods} />
            </div>
            <div className="mb-1 row-span-2 flex flex-col self-end h-full justify-end">
                <div className="flex flex-row justify-center ">
                    {species.map((specie, index) => {
                        const isFirstSpecies = index === 0
                        const isLastSpecies = index === species.length - 1
                        return (
                            <SpeciesLayout
                                key={index}
                                canShowAddSpeciesLeftButton={isFirstSpecies}
                                canShowAddSpeciesRightButton={isLastSpecies}
                                id={specie.id}
                                size={specie.size}
                                population={specie.population}
                                isEditable={hasAddedFood()}
                                addSpeciesOnTheLeft={() => {
                                    setIsAddingSpeciesToTheLeft(true)
                                }}
                                addSpeciesOnTheRight={() => {
                                    setIsAddingSpeciesToTheRight(true)
                                }}
                                incrementSize={(specieId: string) => {
                                    setSpeciesIdToIncrementSize(specieId)
                                }}
                                incrementPopulation={(specieId: string) => {
                                    setSpeciesIdToIncrementPopulation(specieId)
                                }}
                            />
                        )
                    })}
                </div>
                {hasAddedFood() && (
                    <button
                        className="my-4 bg-cyan-500 border bg-color-white w-36 self-center"
                        onClick={computeNumberOfFood}
                    >
                        Finish turn
                    </button>
                )}
                {showDiscardCardMessage() && (
                    <p className="self-center ">Choose the card to discard</p>
                )}
                <div className="flex flex-row justify-center h-56 items-end">
                    {cards.map((card, index) => {
                        return (
                            <CardLayout
                                key={index}
                                id={card.id}
                                name={card.name}
                                description={card.description}
                                foodNumber={card.foodNumber}
                                showAddFoodButton={!hasAddedFood()}
                                removeCard={removeCard}
                                showDiscardCard={showDiscardCardMessage()}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
