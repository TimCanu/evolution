import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react'

interface PlayerActionsContextResult {
    playerOnGoingAction: PlayerActionsState
    isAddingFoodStage: () => boolean
    isEvolvingStage: () => boolean
    isFeedingStage: () => boolean
    canDiscardCard: () => boolean
    getCardDiscardMessage: () => string
    updatePlayerState: (action: PlayerActionsState) => void
}

export enum ActionState {
    ADDING_FOOD_TO_WATER_PLAN,
    CHOOSING_EVOLVING_ACTION,
    ADD_LEFT_SPECIES,
    ADD_RIGHT_SPECIES,
    INCREMENT_SPECIES_SIZE,
    INCREMENT_SPECIES_POPULATION,
    ADD_SPECIES_FEATURE,
    FEEDING,
}

const ALL_EVOLVING_STAGE_STEPS = [
    ActionState.CHOOSING_EVOLVING_ACTION,
    ActionState.ADD_LEFT_SPECIES,
    ActionState.ADD_RIGHT_SPECIES,
    ActionState.INCREMENT_SPECIES_POPULATION,
    ActionState.INCREMENT_SPECIES_SIZE,
    ActionState.ADD_SPECIES_FEATURE,
]

export interface PlayerActionsState {
    action: ActionState
    speciesId?: string
}

const PlayerActionsContext = createContext<PlayerActionsContextResult>({} as PlayerActionsContextResult)

export const PlayerActionsProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const [playerOnGoingAction, setPlayerActions] = useState<PlayerActionsState>({
        action: ActionState.ADDING_FOOD_TO_WATER_PLAN,
    })

    const updatePlayerState = (action: PlayerActionsState): void => {
        setPlayerActions(action)
    }

    const isAddingFoodStage = (): boolean => {
        return playerOnGoingAction.action === ActionState.ADDING_FOOD_TO_WATER_PLAN
    }

    const isEvolvingStage = (): boolean => {
        return ALL_EVOLVING_STAGE_STEPS.includes(playerOnGoingAction.action)
    }

    const isFeedingStage = (): boolean => {
        return playerOnGoingAction.action === ActionState.FEEDING
    }

    const canDiscardCard = (): boolean => {
        return isEvolvingStage() && playerOnGoingAction.action !== ActionState.CHOOSING_EVOLVING_ACTION
    }

    const getCardDiscardMessage = (): string => {
        switch (playerOnGoingAction.action) {
            case ActionState.ADD_LEFT_SPECIES:
                return 'Choose the species to add to the left'
            case ActionState.ADD_RIGHT_SPECIES:
                return 'Choose the species to add to the right'
            case ActionState.CHOOSING_EVOLVING_ACTION:
                return 'Choose an action to evolve your species or finish your turn'
            case ActionState.ADDING_FOOD_TO_WATER_PLAN:
                return 'Discard a card to add food to the water plan'
            case ActionState.INCREMENT_SPECIES_SIZE:
                return 'Discard a card to increase the selected species size'
            case ActionState.INCREMENT_SPECIES_POPULATION:
                return 'Discard a card to increase the selected species population'
            case ActionState.ADD_SPECIES_FEATURE:
                return 'Choose the card to add as a feature for the selected species'
            case ActionState.FEEDING:
                return 'Choose the species you would like to feed'
            default:
                console.warn(
                    `Adding an action message has not been supported for the action ${playerOnGoingAction.action} `
                )
                return ''
        }
    }

    const res = {
        playerOnGoingAction,
        canDiscardCard,
        getCardDiscardMessage,
        isAddingFoodStage,
        isEvolvingStage,
        isFeedingStage,
        updatePlayerState,
    }

    return <PlayerActionsContext.Provider value={res}>{children}</PlayerActionsContext.Provider>
}

export function usePlayerActionsContext(): PlayerActionsContextResult {
    return useContext(PlayerActionsContext)
}
