'use client'

import { OpponentLayout } from '@/app/components/opponent-layout'
import opponentsData from '../data/opponents.json'
import cardsData from '../data/cards.json'
import { Opponent } from '@/app/models/opponent'
import { FoodArea } from '@/app/components/food-area'
import { CardLayout } from '@/app/components/card-layout'
import { Card } from '@/app/models/card'
import { useState } from 'react'
import { SpeciesLayout } from '@/app/components/species-layout'
import { useSpeciesContext } from '@/app/providers/species.provider'
import { ActionState, usePlayerActionsContext } from '@/app/providers/player-actions.provider'

export function Game() {
    const opponents: Opponent[] = opponentsData

    const { isAddingFoodStage, isEvolvingStage, isFeedingStage, getCardDiscardMessage, updatePlayerState } =
        usePlayerActionsContext()

    const { speciesList, playEvolvingAction } = useSpeciesContext()

    const [cards, setCards] = useState<Card[]>(cardsData)
    const [foods, setFoods] = useState<number[]>([])
    const [amountOfFood, setAmountOfFood] = useState(0)

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
        updatePlayerState({ action: ActionState.CHOOSING_EVOLVING_ACTION })
    }

    const removeCard = (cardId: string): void => {
        const card = cards.find((card) => card.id === cardId)
        if (!card) {
            throw Error(`Could not find any card with id ${cardId}`)
        }
        if (isAddingFoodStage()) {
            addFood(cardId)
        } else if (isEvolvingStage()) {
            playEvolvingAction(card)
        } else if (isFeedingStage()) {
            console.log('Action is not supported yet')
        }
        removeCardFromState(cardId)
    }

    const computeNumberOfFood = (): void => {
        const newAmountOfFood = foods.reduce((previousValue, currentAmountOfFoods) => {
            return previousValue + currentAmountOfFoods
        }, amountOfFood)
        setAmountOfFood(newAmountOfFood > 0 ? newAmountOfFood : 0)
        setFoods([])
        updatePlayerState({ action: ActionState.FEEDING })
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
                    {speciesList.map((species, index) => {
                        const isFirstSpecies = index === 0
                        const isLastSpecies = index === speciesList.length - 1
                        return (
                            <SpeciesLayout
                                key={index}
                                canShowAddSpeciesLeftButton={isFirstSpecies}
                                canShowAddSpeciesRightButton={isLastSpecies}
                                species={species}
                            />
                        )
                    })}
                </div>
                {isEvolvingStage() && (
                    <button
                        className="my-4 bg-cyan-500 border bg-color-white w-36 self-center"
                        onClick={computeNumberOfFood}
                    >
                        Finish turn
                    </button>
                )}
                <p className="self-center ">{getCardDiscardMessage()}</p>
                <div className="flex flex-row justify-center h-56 items-end">
                    {cards.map((card, index) => {
                        return <CardLayout key={index} card={card} removeCard={removeCard} />
                    })}
                </div>
            </div>
        </div>
    )
}
