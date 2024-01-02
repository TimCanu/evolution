'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { UPDATE_GAME_STATUS, UPDATE_PLAYER_STATUS } from '@/src/const/game-events.const'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { PushUpdateGameStatusData, PushUpdatePlayerStatusData } from '@/src/models/pusher.channels.model'

interface PlayerActionsContextResult {
    playerOnGoingAction: PlayerActionsState
    isAddingFoodStage: () => boolean
    isEvolvingStage: () => boolean
    isFeedingStage: () => boolean
    canDiscardCard: () => boolean
    getCardDiscardMessage: () => string
    updatePlayerState: (action: PlayerActionsState) => void
}

interface PlayerActionsContextProps {
    status: GameStatus
    gameId: string
    playerId: string
}

export enum EVOLVING_STAGES {
    ADD_LEFT_SPECIES,
    ADD_RIGHT_SPECIES,
    INCREMENT_SPECIES_SIZE,
    INCREMENT_SPECIES_POPULATION,
    ADD_SPECIES_FEATURE,
}

type ActionState = EVOLVING_STAGES | GameStatus

const ALL_EVOLVING_STAGE_STEPS = [
    GameStatus.CHOOSING_EVOLVING_ACTION,
    EVOLVING_STAGES.ADD_LEFT_SPECIES,
    EVOLVING_STAGES.ADD_RIGHT_SPECIES,
    EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION,
    EVOLVING_STAGES.INCREMENT_SPECIES_SIZE,
    EVOLVING_STAGES.ADD_SPECIES_FEATURE,
]

export interface PlayerActionsState {
    action: ActionState
    speciesId?: string
}

const PlayerActionsContext = createContext<PlayerActionsContextResult>({} as PlayerActionsContextResult)

export const PlayerActionsProvider: FunctionComponent<PropsWithChildren<PlayerActionsContextProps>> = ({
    children,
    status,
    gameId,
    playerId,
}) => {
    const [playerOnGoingAction, setPlayerActions] = useState<PlayerActionsState>({
        action: status,
    })

    useEffect(() => {
        const playerChannel = PusherInstance.getPlayerChannel(gameId, playerId)
        const gameChannel = PusherInstance.getGameChannel(gameId)

        gameChannel.bind(UPDATE_GAME_STATUS, function (data: PushUpdateGameStatusData) {
            setPlayerActions({ action: data.status })
        })

        playerChannel.bind(UPDATE_PLAYER_STATUS, function (data: PushUpdatePlayerStatusData) {
            setPlayerActions({ action: data.status })
        })
    }, [gameId, playerId])

    const updatePlayerState = (action: PlayerActionsState): void => {
        setPlayerActions(action)
    }

    const isAddingFoodStage = (): boolean => {
        return playerOnGoingAction.action === GameStatus.ADDING_FOOD_TO_WATER_PLAN
    }

    const isEvolvingStage = (): boolean => {
        return ALL_EVOLVING_STAGE_STEPS.includes(playerOnGoingAction.action)
    }

    const isFeedingStage = (): boolean => {
        return playerOnGoingAction.action === GameStatus.FEEDING_SPECIES
    }

    const canDiscardCard = (): boolean => {
        return isEvolvingStage() && playerOnGoingAction.action !== GameStatus.CHOOSING_EVOLVING_ACTION
    }

    const getCardDiscardMessage = (): string => {
        switch (playerOnGoingAction.action) {
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
