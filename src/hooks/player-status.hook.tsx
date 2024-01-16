'use client'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Card } from '@/src/models/card.model'
import { ALL_EVOLVING_STAGE_STEPS, EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'

interface PlayerStatusResult {
    isAddingFoodStage: () => boolean
    isEvolvingStage: () => boolean
    isFeedingStage: () => boolean
    canDiscardCard: (card: Card) => boolean
    getCardDiscardMessage: () => string
}

export const usePlayerStatus = (): PlayerStatusResult => {
    const { status, selectedSpecies } = useGameContext()

    const isAddingFoodStage = (): boolean => {
        return status === GameStatus.ADDING_FOOD_TO_WATER_PLAN
    }

    const isEvolvingStage = (): boolean => {
        return ALL_EVOLVING_STAGE_STEPS.includes(status)
    }

    const isFeedingStage = (): boolean => {
        return status === GameStatus.FEEDING_SPECIES
    }

    const canDiscardCard = (card: Card): boolean => {
        if (status === EVOLVING_STAGES.ADD_SPECIES_FEATURE && selectedSpecies) {
            return !selectedSpecies.features.some((feature) => feature.key === card.featureKey)
        }
        return isEvolvingStage() && status !== GameStatus.CHOOSING_EVOLVING_ACTION
    }

    const getCardDiscardMessage = (): string => {
        switch (status) {
            case EVOLVING_STAGES.ADD_LEFT_SPECIES:
                return 'Choose the species to add to the left'
            case EVOLVING_STAGES.ADD_RIGHT_SPECIES:
                return 'Choose the species to add to the right'
            case GameStatus.CHOOSING_EVOLVING_ACTION:
                return 'Choose an action to evolve your species or finish your turn'
            case GameStatus.ADDING_FOOD_TO_WATER_PLAN:
                return 'Discard a card to add food to the water plan'
            case EVOLVING_STAGES.INCREMENT_SPECIES_SIZE:
                return 'Discard a card to increase the selected species size'
            case EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION:
                return 'Discard a card to increase the selected species population'
            case EVOLVING_STAGES.ADD_SPECIES_FEATURE:
                return 'Choose the card to add as a feature for the selected species'
            case GameStatus.FEEDING_SPECIES:
                return 'Choose the species you would like to feed'
            case GameStatus.WAITING_FOR_PLAYERS_TO_JOIN:
                return 'Waiting for other players to join'
            case GameStatus.WAITING_FOR_PLAYERS_TO_FEED:
                return 'Waiting for other players to feed'
            case GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING:
                return 'Waiting for other players to finish evolving'
            default:
                console.warn(`Adding an action message has not been supported for the action ${status} `)
                return ''
        }
    }

    return {
        canDiscardCard,
        getCardDiscardMessage,
        isAddingFoodStage,
        isEvolvingStage,
        isFeedingStage,
    }
}
