'use client'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Card } from '@/src/models/card.model'
import { ALL_EVOLVING_STAGE_STEPS, EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { useLangContext } from '@/src/providers/lang.provider'

interface PlayerStatusResult {
    isAddingFoodStage: () => boolean
    isEvolvingStage: () => boolean
    isFeedingStage: () => boolean
    canDiscardCard: (card: Card) => boolean
    getCardDiscardMessage: () => string
}

export const usePlayerStatus = (): PlayerStatusResult => {
    const {
        translationHook: { t }
    } = useLangContext()
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
                return t('choose-species-add-left')
            case EVOLVING_STAGES.ADD_RIGHT_SPECIES:
                return t('choose-species-add-right')
            case GameStatus.CHOOSING_EVOLVING_ACTION:
                return t('choose-action-or-finish')
            case GameStatus.ADDING_FOOD_TO_WATER_PLAN:
                return t('discard-card-to-add-food')
            case EVOLVING_STAGES.INCREMENT_SPECIES_SIZE:
                return t('discard-card-to-increase-size')
            case EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION:
                return t('discard-card-to-increase-population')
            case EVOLVING_STAGES.ADD_SPECIES_FEATURE:
                return t('choose-card-to-add-as-feature')
            case GameStatus.FEEDING_SPECIES:
                return t('choose-species-to-feed')
            case GameStatus.WAITING_FOR_PLAYERS_TO_JOIN:
                return t('waiting-for-other-players-to-join')
            case GameStatus.WAITING_FOR_PLAYERS_TO_FEED:
                return t('waiting-for-other-players-to-feed')
            case GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING:
                return t('waiting-for-other-players-to-evolve')
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
        isFeedingStage
    }
}
