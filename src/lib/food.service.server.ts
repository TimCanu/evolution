import { Card } from '@/src/models/card.model'
import { v4 as uuidv4 } from 'uuid'
import { Species } from '@/src/models/species.model'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { FeatureKey } from '@/src/enums/feature-key.enum'

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
            player.species = [{ id: uuidv4(), size: 1, population: 1, foodEaten: 0, features: [], preyIds: [] }]
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
        player.status = GameStatus.ADDING_FOOD_TO_WATER_PLAN
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

export const getNextPlayerToFeedId = (
    players: PlayerEntity[],
    lastPlayerToFeedId: string,
    playersThatCanStillFeedIds: string[]
): string => {
    const playerCurrentlyFeedingIndex = players.findIndex((player) => player.id === lastPlayerToFeedId)
    const nextPlayerFeedingIndex =
        playerCurrentlyFeedingIndex + 1 === players.length ? 0 : playerCurrentlyFeedingIndex + 1
    const nextPlayerFeeding = players[nextPlayerFeedingIndex]
    if (!playersThatCanStillFeedIds.includes(nextPlayerFeeding.id)) {
        return getNextPlayerToFeedId(players, nextPlayerFeeding.id, playersThatCanStillFeedIds)
    }
    return nextPlayerFeeding.id
}

export const hasPlayerFinishedFeeding = (player: PlayerEntity): boolean => {
    return player.species.every((species) => species.foodEaten === species.population)
}

export const getPlayersThatCanFeedIds = (amountOfFood: number, players: PlayerEntity[]): string[] => {
    const isTherePlantsLeft = amountOfFood > 0

    const allCarnivores: Species[] = players
        .map((player) => {
            return player.species.filter((species) => {
                return species.features.some((feature) => feature.key === FeatureKey.CARNIVORE)
            })
        })
        .flat()

    const carnivoresThatCanFeed = allCarnivores.filter((carnivore) => {
        return players.some((player) => {
            return player.species.some((species) => {
                return canCarnivoreEatSpecies(carnivore, species)
            })
        })
    })

    const plantEatersThatCanFeed: Species[] = isTherePlantsLeft
        ? players
              .map((player) => {
                  return player.species.filter((species) => {
                      return (
                          species.features.every((feature) => feature.key !== FeatureKey.CARNIVORE) &&
                          species.foodEaten < species.population
                      )
                  })
              })
              .flat()
        : []

    const speciesThatCanFeed = [...carnivoresThatCanFeed, ...plantEatersThatCanFeed]
    const speciesThatCanFeedIds = speciesThatCanFeed.map((species) => species.id)
    const playersThatCanFeed = players.filter((player) => {
        return player.species.some((species) => speciesThatCanFeedIds.includes(species.id))
    })
    return playersThatCanFeed.map((player) => player.id)
}

const canCarnivoreEatSpecies = (speciesFeeding: Species, speciesToEat: Species): boolean => {
    try {
        checkThatCarnivoreCanEat(speciesFeeding, speciesToEat)
        return true
    } catch (e) {
        return false
    }
}

export const checkThatCarnivoreCanEat = (carnivore: Species, prey: Species): void => {
    const canCarnivoreClimb = carnivore.features.some((feature) => feature.key === FeatureKey.CLIMBING)
    const canPreyClimb = prey.features.some((feature) => feature.key === FeatureKey.CLIMBING)

    if (carnivore.foodEaten >= carnivore.population) {
        throw Error(`Species has already eaten | Species ID=${carnivore.id}`)
    }
    if (!canCarnivoreClimb && canPreyClimb) {
        throw Error(`Carnivore cannot eat this species because it protect by climbing card`)
    }
    if(prey.features.some((feature) => feature.key === FeatureKey.DIGGER) && prey.foodEaten === prey.population){
        throw Error(`Carnivore cannot eat this species because it is protected by the digger`)
    }
    if (carnivore.id === prey.id) {
        throw Error(`Carnivore cannot eat themselves`)
    }
    if (carnivore.size <= prey.size) {
        throw Error(
            `Cannot eat a species that has a size equal or superior to yours (${carnivore.size} <= ${prey.size}`
        )
    }
}

const computeSpeciesPreys = (speciesList: Species[], players: PlayerEntity[]): Species[] => {
    return speciesList.map((species) => {
        if (!isCarnivore(species)) {
            return species
        }
        species.preyIds = players.reduce((speciesIds: string[], player) => {
            player.species.forEach((potentialPrey) => {
                if (canCarnivoreEatSpecies(species, potentialPrey)) {
                    speciesIds.push(potentialPrey.id)
                }
            })
            return speciesIds
        }, [])
        return species
    })
}

export const isCarnivore = (species: Species): boolean => {
    return species.features.some((feature) => feature.key === FeatureKey.CARNIVORE)
}

export const computePlayersForFirstFeedingRound = (
    players: PlayerEntity[],
    playerThatShouldFeedNext: string,
    playersThatCanFeed: string[]
): PlayerEntity[] => {
    if (playersThatCanFeed.includes(playerThatShouldFeedNext)) {
        return players.map((player) => {
            if (player.id === playerThatShouldFeedNext) {
                player.species = computeSpeciesPreys(player.species, players)
                player.status = GameStatus.FEEDING_SPECIES
                return { ...player, status: GameStatus.FEEDING_SPECIES }
            }
            return { ...player, status: GameStatus.WAITING_FOR_PLAYERS_TO_FEED }
        })
    }
    const playerToFeedId = getNextPlayerToFeedId(players, playerThatShouldFeedNext, playersThatCanFeed)
    return players.map((player) => {
        if (player.id === playerToFeedId) {
            player.species = computeSpeciesPreys(player.species, players)
            player.status = GameStatus.FEEDING_SPECIES
            return { ...player, status: GameStatus.FEEDING_SPECIES }
        }
        return { ...player, status: GameStatus.WAITING_FOR_PLAYERS_TO_FEED }
    })
}

export const computePlayersForNextFeedingRound = (
    players: PlayerEntity[],
    playerThatJustFed: string,
    playersThatCanFeed: string[]
): PlayerEntity[] => {
    const playerToFeedId = getNextPlayerToFeedId(players, playerThatJustFed, playersThatCanFeed)
    return players.map((player) => {
        if (player.id === playerToFeedId) {
            player.species = computeSpeciesPreys(player.species, players)
            player.status = GameStatus.FEEDING_SPECIES
            return { ...player, status: GameStatus.FEEDING_SPECIES }
        }
        return { ...player, status: GameStatus.WAITING_FOR_PLAYERS_TO_FEED }
    })
}
