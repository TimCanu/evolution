import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { feedSpecies } from '@/src/lib/species.service'
import { FeedPlantsIcon } from '@/src/components/svg-icons/feed-plants-icon'
import { useGameContext } from '@/src/providers/game.provider'
import { FeedCarnivoreButton } from '@/src/components/player-species/feed-carnivore-button'
import { FeedMeatIcon } from '@/src/components/svg-icons/feed-meat-icon'
import { isCarnivore } from '@/src/lib/food.service.server'

interface FeedPlantsButtonProps {
    gameId: string
    playerId: string
    species: Species
}

export const FeedPlantsButton: FC<FeedPlantsButtonProps> = ({ gameId, playerId, species }) => {
    if (isCarnivore(species) || species.foodEaten >= species.population) {
        return null
    }

    const feedPlantsEater = async (): Promise<void> => {
        await feedSpecies({ gameId, playerId, speciesId: species.id, preyId: undefined })
    }

    return (
        <button
            className="flex justify-center items-center"
            aria-label="Feed plants to this species"
            onClick={feedPlantsEater}
        >
            <FeedPlantsIcon />
        </button>
    )
}
