import {OpponentLayout} from "@/app/components/opponent-layout"
import opponentsData from './data/opponents.json'
import cardsData from './data/cards.json'
import {Opponent} from "@/app/models/opponent";
import {FoodArea} from "@/app/components/food-area";
import {CardLayout} from "@/app/components/card-layout";
import {Card} from "@/app/models/card";

export default function Home() {
    const opponents: Opponent[] = opponentsData
    const cards: Card[] = cardsData

    return (
        <div className="grid grid-rows-3">
            <div className="mt-1 flex flex-row justify-around">
                {opponents.map((opponent, index) => {
                    return <OpponentLayout key={index} name={opponent.name}/>
                })}
            </div>
            <div className="flex justify-center">
                <FoodArea/>
            </div>
            <div className="mb-1 flex flex-row self-end justify-center">
                {cards.map((card, index) => {
                    return <CardLayout
                        key={index}
                        name={card.name}
                        description={card.description}
                        foodNumber={card.foodNumber}
                    />
                })}
            </div>
        </div>
    )
}
