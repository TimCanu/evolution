'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { UPDATE_GAME_INFO } from '@/src/const/game-events.const'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { PushUpdatePlayerGameInfoData } from '@/src/models/pusher.channels.model'
import { Species } from '@/src/models/species.model'
import { Card } from '@/src/models/card.model'
import { Game } from '@/src/models/game.model'
import { Opponent } from '@/src/models/opponent.model'

interface GameContextProps {
    gameId: string
    game: Game
}

interface GameContextResult {
    amountOfFood: number
    cards: Card[]
    isPlayerFeedingFirst: boolean
    hiddenFoods: number[]
    numberOfFoodEaten: number
    opponents: Opponent[]
    selectedSpecies?: Species
    speciesList: Species[]
    status: PlayerStatus
    updateCards: (cards: Card[]) => void
    updateSelectedSpecies: (species: Species) => void
    updateSpeciesList: (speciesList: Species[]) => void
    updateStatus: (status: PlayerStatus) => void
}

export enum EVOLVING_STAGES {
    ADD_LEFT_SPECIES,
    ADD_RIGHT_SPECIES,
    INCREMENT_SPECIES_SIZE,
    INCREMENT_SPECIES_POPULATION,
    ADD_SPECIES_FEATURE,
}

type PlayerStatus = EVOLVING_STAGES | GameStatus

export const ALL_EVOLVING_STAGE_STEPS = [
    GameStatus.CHOOSING_EVOLVING_ACTION,
    EVOLVING_STAGES.ADD_LEFT_SPECIES,
    EVOLVING_STAGES.ADD_RIGHT_SPECIES,
    EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION,
    EVOLVING_STAGES.INCREMENT_SPECIES_SIZE,
    EVOLVING_STAGES.ADD_SPECIES_FEATURE,
]

const GameContext = createContext<GameContextResult>({} as GameContextResult)

export const GameProvider: FunctionComponent<PropsWithChildren<GameContextProps>> = ({ children, game, gameId }) => {
    const [amountOfFood, setAmountOfFood] = useState(game.amountOfFood)
    const [cards, setCards] = useState<Card[]>(game.player.cards)
    const [isPlayerFeedingFirst, setIsPlayerFeedingFirst] = useState<boolean>(game.player.isFirstPlayerToFeed)
    const [hiddenFoods, setHiddenFoods] = useState<number[]>(game.hiddenFoods)
    const [numberOfFoodEaten, setNumberOfFoodEaten] = useState<number>(game.player.numberOfFoodEaten)
    const [opponents, setOpponents] = useState<Opponent[]>(game.opponents)
    const [selectedSpecies, setSelectedSpecies] = useState<Species | undefined>(undefined)
    const [speciesList, setSpeciesList] = useState<Species[]>(game.player.species)
    const [status, setStatus] = useState<PlayerStatus>(game.player.status)

    useEffect(() => {
        const playerChannel = PusherInstance.getPlayerChannel(gameId, game.player.id)

        playerChannel.bind(UPDATE_GAME_INFO, function (data: PushUpdatePlayerGameInfoData) {
            console.log(data)
            setIsPlayerFeedingFirst(data.game.player.isFirstPlayerToFeed)
            setNumberOfFoodEaten(data.game.player.numberOfFoodEaten)
            setHiddenFoods(data.game.hiddenFoods)
            setAmountOfFood(data.game.amountOfFood)
            setOpponents(data.game.opponents)
            setStatus(data.game.player.status)
            if (data.shouldUpdateCards) {
                setCards(data.game.player.cards)
            }
            if (data.shouldUpdateSpecies) {
                setSpeciesList(data.game.player.species)
            }
        })
    }, [game.player.id, gameId])

    const updateSelectedSpecies = (species: Species): void => {
        setSelectedSpecies(species)
    }

    const updateStatus = (newStatus: PlayerStatus): void => {
        setStatus(newStatus)
    }

    const updateCards = (cards: Card[]): void => {
        setCards(cards)
    }

    const updateSpeciesList = (newSpeciesList: Species[]): void => {
        setSpeciesList(newSpeciesList)
    }

    const res = {
        amountOfFood,
        cards,
        isPlayerFeedingFirst,
        hiddenFoods,
        numberOfFoodEaten,
        opponents,
        selectedSpecies,
        speciesList,
        status,
        updateCards,
        updateSelectedSpecies,
        updateSpeciesList,
        updateStatus,
    }

    return <GameContext.Provider value={res}>{children}</GameContext.Provider>
}

export function useGameContext(): GameContextResult {
    return useContext(GameContext)
}
