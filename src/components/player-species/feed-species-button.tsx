import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { feedSpecies } from '@/src/lib/species.service'
import { useGameContext } from '@/src/providers/game.provider'
import { FeedCarnivoreButton } from '@/src/components/player-species/feed-carnivore-button'
import { FeedMeatIcon } from '@/src/components/svg-icons/feed-meat-icon'
import { FeedPlantsButton } from '@/src/components/player-species/feed-plants-button'

interface FeedSpeciesButtonProps {
    gameId: string
    index: number
    playerId: string
    species: Species
}

export const FeedSpeciesButton: FC<FeedSpeciesButtonProps> = ({ index, gameId, playerId, species }) => {
    const { carnivoreFeedingData } = useGameContext()
    const { isFeedingStage } = usePlayerStatus()

    if (!isFeedingStage || species.foodEaten >= species.population) {
        return null
    }

    const canBeEaten = carnivoreFeedingData.preyIds.includes(species.id)

    const feedCarnivore = async (): Promise<void> => {
        if (!carnivoreFeedingData.carnivoreId) {
            throw Error('Carnivore ID should be defined')
        }
        await feedSpecies({ gameId, playerId, speciesId: carnivoreFeedingData.carnivoreId, preyId: species.id })
    }

    return (
        <>
            <FeedCarnivoreButton index={index} species={species} />
            {canBeEaten ? (
                <button className="w-8" aria-label={`Eat your own species at index ${index}`} onClick={feedCarnivore}>
                    <FeedMeatIcon />
                </button>
            ) : (
                <FeedPlantsButton species={species} gameId={gameId} playerId={playerId} />
            )}
        </>
    )
}
