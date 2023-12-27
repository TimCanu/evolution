'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react'
import { Species } from '@/src/models/species'
import speciesData from '@/src/data/species.json'
import { v4 as uuidv4 } from 'uuid'
import { Feature } from '@/src/models/feature'
import { Card } from '@/src/models/card'
import { EVOLVING_STAGES, usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { GameStatus } from '@/src/enums/game.events.enum'

interface SpeciesContextResult {
    speciesList: Species[]
    playEvolvingAction: (card: Card) => void
    removeFeature: (speciesId: string, featureId: string) => void
}

const SpeciesContext = createContext<SpeciesContextResult>({} as SpeciesContextResult)

export const SpeciesProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const { playerOnGoingAction, updatePlayerState } = usePlayerActionsContext()
    const [speciesList, setSpeciesList] = useState<Species[]>(speciesData)

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
