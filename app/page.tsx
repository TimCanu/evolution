'use client'

import {OpponentLayout} from "@/app/components/opponent-layout"
import opponentsData from './data/opponents.json'
import cardsData from './data/cards.json'
import {Opponent} from "@/app/models/opponent";
import {FoodArea} from "@/app/components/food-area";
import {CardLayout} from "@/app/components/card-layout";
import {Card} from "@/app/models/card";
import { useState } from "react";

export default function Home() {
    const opponents: Opponent[] = opponentsData
  
    const [cards, setCards] = useState<Card[]>(cardsData)

    const [foods, setFoods] = useState<number[]>([])

    const removeCard = (cardId: string): void => {
      const updatedCards = cards.filter(card => card.id !== cardId)
      const foodNumber = cards.find(card => card.id === cardId)?.foodNumber
      if(!foodNumber){
        throw Error("Food number is undefined")
      }
      setCards(updatedCards)
      setFoods([...foods, foodNumber])
    }
    
    return (
        <div className="grid grid-rows-3">
            <div className="mt-1 flex flex-row justify-around">
                {opponents.map((opponent, index) => {
                    return <OpponentLayout key={index} name={opponent.name}/>
                })}
            </div>
            <div className="flex justify-center">
                <FoodArea foodsAdded={foods}/>
            </div>
            <div className="mb-1 flex flex-row self-end justify-center h-full items-end">
                {cards.map((card, index) => {
                    return <CardLayout
                        key={index}
                        id={card.id}
                        name={card.name}
                        description={card.description}
                        foodNumber={card.foodNumber}
                        removeCard={removeCard}
                    />
                })}
            </div>
        </div>
    )
}
