import {OpponentLayout} from "@/app/components/opponent-layout"
import opponentsData from './data/opponents.json'
import {Opponent} from "@/app/models/opponent";

export default function Home() {

    const opponents: Opponent[] = opponentsData
    return (
        <div className="flex flex-row">
            {opponents.map((opponent, index) => {
                return <OpponentLayout key={index} name={opponent.name}/>
            })}
        </div>
    )
}
