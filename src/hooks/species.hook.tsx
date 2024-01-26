'use client'
import { Species } from '@/src/models/species.model'
import { v4 as uuidv4 } from 'uuid'
import { Feature } from '@/src/models/feature.model'
import { Card } from '@/src/models/card.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'

interface SpeciesResult {
    playEvolvingAction: (card: Card) => void
    removeFeature: (speciesId: string, featureId: string) => void
}

export const useSpecies = (): SpeciesResult => {
    const { speciesList, selectedSpecies, status, updateSpeciesList, updateStatus } = useGameContext()

    const getSpecies = (speciesId: string): Species => {
        const speciesToReturn = speciesList.find((species) => species.id === speciesId)
        if (!speciesToReturn) {
            throw Error(`Could not find any species with id ${speciesId}`)
        }
        return speciesToReturn
    }

    const getSpeciesForOnGoingAction = (): Species => {
        if (!selectedSpecies) {
            throw Error('Cannot get species for on going action as no species id has been saved')
        }
        return getSpecies(selectedSpecies.id)
    }

    const updateSpecies = (speciesToUpdate: Species): void => {
        const newSpecies = speciesList.map((species) => {
            if (species.id !== speciesToUpdate.id) {
                return species
            }
            return speciesToUpdate
        })
        updateSpeciesList(newSpecies)
    }

    const removeFeature = (speciesId: string, featureId: string): void => {
        const speciesToUpdate = getSpecies(speciesId)
        const newFeatures = speciesToUpdate.features.filter((feature) => feature.cardId !== featureId)
        updateSpecies({ ...speciesToUpdate, features: newFeatures })
    }

    const incrementSpeciesSize = (): void => {
        const speciesToUpdate = getSpeciesForOnGoingAction()
        const speciesUpdated = { ...speciesToUpdate, size: speciesToUpdate.size + 1 }
        updateSpecies(speciesUpdated)
        updateStatus(GameStatus.CHOOSING_EVOLVING_ACTION)
    }

    const incrementSpeciesPopulation = (): void => {
        const speciesToUpdate = getSpeciesForOnGoingAction()
        const speciesUpdated = { ...speciesToUpdate, population: speciesToUpdate.population + 1 }
        updateSpecies(speciesUpdated)
        updateStatus(GameStatus.CHOOSING_EVOLVING_ACTION)
    }

    const addSpeciesToTheLeft = (): void => {
        const newSpecies: Species = {
            size: 1,
            population: 1,
            id: uuidv4(),
            features: [],
            foodEaten: 0
        }
        updateSpeciesList([newSpecies, ...speciesList])
        updateStatus(GameStatus.CHOOSING_EVOLVING_ACTION)
    }

    const addSpeciesToTheRight = (): void => {
        const newSpecies: Species = {
            size: 1,
            population: 1,
            id: uuidv4(),
            features: [],
            foodEaten: 0
        }
        updateSpeciesList([...speciesList, newSpecies])
        updateStatus(GameStatus.CHOOSING_EVOLVING_ACTION)
    }

    const addSpeciesFeature = (card: Card): void => {
        const feature: Feature = {
            key: card.featureKey,
            cardId: card.id,
            name: card.name,
            description: card.description
        }
        const specieToUpdate = getSpeciesForOnGoingAction()
        const specieUpdated = { ...specieToUpdate, features: [...specieToUpdate.features, feature] }
        updateSpecies(specieUpdated)
        updateStatus(GameStatus.CHOOSING_EVOLVING_ACTION)
    }

    const playEvolvingAction = (card: Card): void => {
        switch (status) {
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
                throw Error(`Action ${status} is not supported`)
        }
    }

    return {
        playEvolvingAction,
        removeFeature
    }
}
