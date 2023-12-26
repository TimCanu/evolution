'use client'

import { OpponentLayout } from '@/src/components/opponent-layout'
import opponentsData from '../data/opponents.json'
import { Opponent } from '@/src/models/opponent'
import { FoodArea } from '@/src/components/food-area'
import { CardLayout } from '@/src/components/card-layout'
import { SpeciesLayout } from '@/src/components/species-layout'
import { useSpeciesContext } from '@/src/providers/species.provider'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { useCardsContext } from '@/src/providers/cards.provider'
import { useFoodsContext } from '@/src/providers/foods.provider'

export function Game() {
    const opponents: Opponent[] = opponentsData

    const { isAddingFoodStage, isEvolvingStage, isFeedingStage, getCardDiscardMessage } = usePlayerActionsContext()
    const { speciesList, playEvolvingAction } = useSpeciesContext()
    const { cards, getCard, removeCard } = useCardsContext()
    const { addFood, computeNumberOfFood } = useFoodsContext()

    const playCard = (cardId: string): void => {
        const card = getCard(cardId)
        if (isAddingFoodStage()) {
            addFood(card.foodNumber)
        } else if (isEvolvingStage()) {
            playEvolvingAction(card)
        } else if (isFeedingStage()) {
            console.log('Action is not supported yet')
        }
        removeCard(cardId)
    }

    return (
        <div className="grid grid-rows-4 min-h-[100vh] max-h-[100vh]">
            <div className="mt-1 row-span-1 flex flex-row justify-around">
                {opponents.map((opponent, index) => {
                    return <OpponentLayout key={index} name={opponent.name} />
                })}
            </div>
            <div className="flex justify-center row-span-1">
                <FoodArea />
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
                        return <CardLayout key={index} card={card} playCard={playCard} />
                    })}
                </div>
            </div>
        </div>
    )
}
