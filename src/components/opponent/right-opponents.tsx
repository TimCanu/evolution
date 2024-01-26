import { OpponentLayout } from '@/src/components/opponent/opponent-layout'
import { FC } from 'react'
import { Opponent } from '@/src/models/opponent.model'
import { useTranslationClient } from '@/src/i18n/i18n.client'

interface RightOpponentsProps {
    opponents: Opponent[]
}

export const RightOpponents: FC<RightOpponentsProps> = ({ opponents }) => {
    const { t } = useTranslationClient()
    if (opponents.length <= 1) {
        return null
    }

    const getOpponents = (): Opponent[] => {
        if (opponents.length === 2) {
            return [opponents[1]]
        }
        return opponents.filter((opponent, index) => index >= 2)
    }

    const opponentsOnTheRight = getOpponents()

    return (
        <ul
            aria-label={t('right-opponents')}
            className="mt-1 row-span-1 flex flex-col gap-4 w-full items-center justify-around"
        >
            {opponentsOnTheRight.map((opponent, index) => {
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
