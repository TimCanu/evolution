import { OpponentLayout } from '@/src/components/opponent/opponent-layout'
import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'

interface OpponentInTheMiddleProps {
    opponents: Opponent[]
}

export const MiddleOpponent: FC<OpponentInTheMiddleProps> = ({ opponents }) => {
    if (opponents.length > 1 || opponents.length === 0) {
        return null
    }

    return (
        <ul className="self-center">
            <OpponentLayout opponentIndex={0} opponent={opponents[0]} />
        </ul>
    )
}
