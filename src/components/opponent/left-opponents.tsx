import { OpponentLayout } from '@/src/components/opponent/opponent-layout'
import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'

interface LeftOpponentsProps {
    opponents: Opponent[]
}

export const LeftOpponents: FC<LeftOpponentsProps> = ({ opponents }) => {
    if (opponents.length <= 1) {
        return null
    }

    const getOpponents = (): Opponent[] => {
        if (opponents.length === 2) {
            return [opponents[0]]
        }
        return opponents.filter((opponent, index) => index < 2)
    }

    const opponentsOnTheLeft = getOpponents()

    return (
        <ul
            aria-label="Opponents on the left"
            className="mt-1 row-span-1 flex flex-col-reverse gap-4 w-full items-center justify-around"
        >
            {opponentsOnTheLeft.map((opponent, index) => {
                return (
                    <OpponentLayout
                        key={`${opponent.name}-${opponent.isFirstPlayerToFeed}`}
                        opponentIndex={index}
                        opponent={opponent}
                    />
                )
            })}
        </ul>
    )
}
