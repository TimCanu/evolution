import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react'
import { Species } from '@/app/models/species'
import speciesData from '@/app/data/species.json'
import { v4 as uuidv4 } from 'uuid'
import { Feature } from '@/app/models/feature'
import { Card } from '@/app/models/card'

interface SpeciesContextResult {
    species: Species[]
    isAddingSpeciesToTheLeft: boolean
    isAddingSpeciesToTheRight: boolean
    speciesIdToAddFeature?: string
    speciesIdToIncrementSize?: string
    speciesIdToIncrementPopulation?: string
    updateSpecies: (speciesToUpdate: Species) => void
    incrementSize: () => void
    incrementPopulation: () => void
    addSpeciesToTheLeft: () => void
    addSpeciesToTheRight: () => void
    addSpeciesFeature: (card: Card) => void
    updateSpeciesOnGoingAction: (speciesActionState: SpeciesActionState) => void
}

export enum ActionState {
    NOTHING,
    ADD_LEFT,
    ADD_RIGHT,
    INCREMENT_SIZE,
    INCREMENT_POPULATION,
    ADD_FEATURE,
}

export interface SpeciesActionState {
    action: ActionState
    specieId?: string
}

const SpeciesContext = createContext<SpeciesContextResult>({} as SpeciesContextResult)

export const SpeciesProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const [speciesAction, setSpeciesAction] = useState<SpeciesActionState>({
        action: ActionState.NOTHING,
    })
    const [species, setSpecies] = useState<Species[]>(speciesData)

    const updateSpeciesOnGoingAction = (speciesActionState: SpeciesActionState): void => {
        setSpeciesAction(speciesActionState)
    }

    const resetActionState = (): void => {
        setSpeciesAction({
            action: ActionState.NOTHING,
        })
    }

    const updateSpecies = (speciesToUpdate: Species): void => {
        const newSpecies = species.map((specie) => {
            if (specie.id !== speciesToUpdate.id) {
                return specie
            }
            return speciesToUpdate
        })
        setSpecies(newSpecies)
    }

    const incrementSize = (): void => {
        const newSpeciesList = species.map((specie) => {
            if (specie.id !== speciesAction.specieId) {
                return specie
            }
            return { ...specie, size: specie.size + 1 }
        })
        setSpecies(newSpeciesList)
        resetActionState()
    }

    const incrementPopulation = (): void => {
        const newSpeciesList = species.map((specie) => {
            if (specie.id !== speciesAction.specieId) {
                return specie
            }
            return { ...specie, population: specie.population + 1 }
        })
        setSpecies(newSpeciesList)
        resetActionState()
    }

    const addSpeciesToTheLeft = (): void => {
        const newSpecies: Species = {
            size: 1,
            population: 1,
            id: uuidv4(),
            features: [],
        }
        setSpecies([newSpecies, ...species])
        resetActionState()
    }

    const addSpeciesToTheRight = (): void => {
        const newSpecies: Species = {
            size: 1,
            population: 1,
            id: uuidv4(),
            features: [],
        }
        setSpecies([...species, newSpecies])
        resetActionState()
    }

    const addSpeciesFeature = (card: Card): void => {
        const feature: Feature = {
            id: card.id,
            name: card.name,
            description: card.description,
        }
        const newSpecies = species.map((specie) => {
            if (specie.id !== speciesAction.specieId) {
                return specie
            }
            return { ...specie, features: [...specie.features, feature] }
        })
        setSpecies(newSpecies)
        resetActionState()
    }

    const getSpecieId = (action: ActionState): string | undefined => {
        if (speciesAction.action === action) {
            return speciesAction.specieId
        }
        return undefined
    }

    const res = {
        species,
        isAddingSpeciesToTheLeft: speciesAction.action === ActionState.ADD_LEFT,
        isAddingSpeciesToTheRight: speciesAction.action === ActionState.ADD_RIGHT,
        speciesIdToAddFeature: getSpecieId(ActionState.ADD_FEATURE),
        speciesIdToIncrementSize: getSpecieId(ActionState.INCREMENT_SIZE),
        speciesIdToIncrementPopulation: getSpecieId(ActionState.INCREMENT_POPULATION),
        updateSpecies,
        addSpeciesToTheRight,
        addSpeciesFeature,
        addSpeciesToTheLeft,
        incrementPopulation,
        incrementSize,
        updateSpeciesOnGoingAction,
    }

    return <SpeciesContext.Provider value={res}>{children}</SpeciesContext.Provider>
}

export function useSpeciesContext(): SpeciesContextResult {
    return useContext(SpeciesContext)
}
