'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { Species } from '@/src/models/species.model'
import { v4 as uuidv4 } from 'uuid'
import { Feature } from '@/src/models/feature.model'
import { Card } from '@/src/models/card.model'
import { EVOLVING_STAGES, usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { UPDATE_PLAYER_SPECIES } from '@/src/const/game-events.const'
import { PushUpdatePlayerSpeciesData } from '@/src/models/pusher.channels.model'

interface SpeciesContextResult {
    speciesList: Species[]
    playEvolvingAction: (card: Card) => void
    removeFeature: (speciesId: string, featureId: string) => void
}

interface SpeciesContextProps {
    speciesInitialData: Species[]
    gameId: string
    playerId: string
}

const SpeciesContext = createContext<SpeciesContextResult>({} as SpeciesContextResult)

export const SpeciesProvider: FunctionComponent<PropsWithChildren<SpeciesContextProps>> = ({
                                                                                               children,
                                                                                               speciesInitialData,
                                                                                               gameId,
                                                                                               playerId,
                                                                                           }) => {
    const { playerOnGoingAction, updatePlayerState } = usePlayerActionsContext()
    const [speciesList, setSpeciesList] = useState<Species[]>(speciesInitialData)

    useEffect(() => {
        const channel = PusherInstance.getPlayerChannel(gameId, playerId)
        channel.bind(UPDATE_PLAYER_SPECIES, async function(data: PushUpdatePlayerSpeciesData) {
            setSpeciesList(data.species)
        })
    }, [gameId, playerId])

    const getSpecies = (speciesId: string): Species => {
        const speciesToReturn = speciesList.find((species) => species.id === speciesId)
        if (!speciesToReturn) {
            throw Error(`Could not find any species with id ${speciesId}`)
        }
        return speciesToReturn
    }

    const getSpeciesForOnGoingAction = (): Species => {
        if (!playerOnGoingAction.speciesId) {
            throw Error('Cannot get species for on going action as no species id has been saved')
        }
        return getSpecies(playerOnGoingAction.speciesId)
    }

    const updateSpecies = (speciesToUpdate: Species): void => {
        const newSpecies = speciesList.map((species) => {
            if (species.id !== speciesToUpdate.id) {
                return species
            }
            return speciesToUpdate
        })
        setSpeciesList(newSpecies)
    }

    const removeFeature = (speciesId: string, featureId: string): void => {
        const speciesToUpdate = getSpecies(speciesId)
        const newFeatures = speciesToUpdate.features.filter((feature) => feature.id !== featureId)
        updateSpecies({ ...speciesToUpdate, features: newFeatures })
    }

    const incrementSpeciesSize = (): void => {
        const speciesToUpdate = getSpeciesForOnGoingAction()
        const speciesUpdated = { ...speciesToUpdate, size: speciesToUpdate.size + 1 }
        updateSpecies(speciesUpdated)
        updatePlayerState({ action: GameStatus.CHOOSING_EVOLVING_ACTION })
    }

    const incrementSpeciesPopulation = (): void => {
        const speciesToUpdate = getSpeciesForOnGoingAction()
        const speciesUpdated = { ...speciesToUpdate, population: speciesToUpdate.population + 1 }
        updateSpecies(speciesUpdated)
        updatePlayerState({ action: GameStatus.CHOOSING_EVOLVING_ACTION })
    }

    const addSpeciesToTheLeft = (): void => {
        const newSpecies: Species = {
            size: 1,
            population: 1,
            id: uuidv4(),
            features: [],
            foodEaten: 0,
        }
        setSpeciesList([newSpecies, ...speciesList])
        updatePlayerState({ action: GameStatus.CHOOSING_EVOLVING_ACTION })
    }

    const addSpeciesToTheRight = (): void => {
        const newSpecies: Species = {
            size: 1,
            population: 1,
            id: uuidv4(),
            features: [],
            foodEaten: 0,
        }
        setSpeciesList([...speciesList, newSpecies])
        updatePlayerState({ action: GameStatus.CHOOSING_EVOLVING_ACTION })
    }

    const addSpeciesFeature = (card: Card): void => {
        const feature: Feature = {
            id: card.id,
            name: card.name,
            description: card.description,
        }
        const specieToUpdate = getSpeciesForOnGoingAction()
        const specieUpdated = { ...specieToUpdate, features: [...specieToUpdate.features, feature] }
        updateSpecies(specieUpdated)
        updatePlayerState({ action: GameStatus.CHOOSING_EVOLVING_ACTION })
    }

    const playEvolvingAction = (card: Card): void => {
        switch (playerOnGoingAction.action) {
            case EVOLVING_STAGES.ADD_SPECIES_FEATURE:
                addSpeciesFeature(card)
                break
            case EVOLVING_STAGES.ADD_LEFT_SPECIES:
                addSpeciesToTheLeft()
                break
            case EVOLVING_STAGES.ADD_RIGHT_SPECIES:
                addSpeciesToTheRight()
                break
            case EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION:
                incrementSpeciesPopulation()
                break
            case EVOLVING_STAGES.INCREMENT_SPECIES_SIZE:
                incrementSpeciesSize()
                break
            default:
                throw Error(`Action ${playerOnGoingAction.action} is not supported`)
        }
    }

    const res = {
        speciesList,
        playEvolvingAction,
        removeFeature,
    }

    return <SpeciesContext.Provider value={res}>{children}</SpeciesContext.Provider>
}

export function useSpeciesContext(): SpeciesContextResult {
    return useContext(SpeciesContext)
}
