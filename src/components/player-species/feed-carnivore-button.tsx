import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { useGameContext } from '@/src/providers/game.provider'
import { isCarnivore } from '@/src/lib/food.service.server'

interface FeedCarnivoreButtonProps {
    index: number
    species: Species
}

export const FeedCarnivoreButton: FC<FeedCarnivoreButtonProps> = ({ index, species }) => {
    const { carnivoreFeedingData, updateCarnivoreFeedingData } = useGameContext()

    if (!isCarnivore(species)) {
        return null
    }

    const isCarnivoreFeeding = carnivoreFeedingData.carnivoreId === species.id

    const toggleCarnivoreWantingToFeed = async (): Promise<void> => {
        if (carnivoreFeedingData.carnivoreId) {
            updateCarnivoreFeedingData(undefined, [])
        } else {
            updateCarnivoreFeedingData(species.id, species.preyIds)
        }
    }

    const ariaLabel = isCarnivoreFeeding ? 'Cancel feeding of the carnivore' : `Feed carnivore at index ${index}`
    const label = isCarnivoreFeeding ? 'Cancel' : 'Feed'

    return (
        <>
            {species.preyIds.length > 0 ? (
                <button
                    className="flex justify-center items-center"
                    aria-label={ariaLabel}
                    onClick={toggleCarnivoreWantingToFeed}
                >
                    {label}
                </button>
            ) : (
                <span>Go vegan</span>
            )}
        </>
    )
}
