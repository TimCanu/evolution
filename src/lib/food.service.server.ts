import { Card } from '@/src/models/card.model'
import { v4 as uuidv4 } from 'uuid'
import { Species } from '@/src/models/species.model'
import { PlayerEntity } from '@/src/models/player-entity.model'

export const computeEndOfFeedingStageData = (
    players: PlayerEntity[],
    cards: Card[],
    firstPlayerToFeedId: string
): {
    players: PlayerEntity[]
    remainingCards: Card[]
    firstPlayerToFeedId: string
} => {
    const playersUpdated = players.map((player: PlayerEntity) => {
        player.species = computeSpeciesPopulation(player.species)
        if (player.species.length === 0) {
            player.species = [{ id: uuidv4(), size: 1, population: 1, foodEaten: 0, features: [] }]
        }
        const numberOfCardsToAdd = player.species.length + 3
        player.cards = player.cards.concat(
            [...Array(numberOfCardsToAdd)].map((_) => {
                const card = cards.pop()
                if (!card) {
                    throw Error('No cards left... Maybe add some more in the DB?')
                }
                return card
            })
        )
        return player
    })
    const firstPlayerToFeedIndex = playersUpdated.findIndex((player) => player.id === firstPlayerToFeedId)
    const newFirstPlayerToFeedId =
        firstPlayerToFeedIndex === playersUpdated.length - 1
            ? playersUpdated[0].id
            : playersUpdated[firstPlayerToFeedIndex + 1].id

    return { players: playersUpdated, remainingCards: cards, firstPlayerToFeedId: newFirstPlayerToFeedId }
}

const computeSpeciesPopulation = (species: Species[]): Species[] => {
    return species.reduce((speciesUpdated: Species[], species: Species) => {
        if (species.foodEaten === 0) {
            return speciesUpdated
        }
        return [...speciesUpdated, { ...species, population: species.foodEaten, foodEaten: 0 }]
    }, [])
}
