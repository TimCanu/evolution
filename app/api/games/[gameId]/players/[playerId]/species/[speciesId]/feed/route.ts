import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { GameStatus } from '@/src/enums/game.events.enum'
import { Species } from '@/src/models/species.model'
import { getPlayer } from '@/src/lib/player.service.server'
import { Card } from '@/src/models/card.model'
import {
    checkThatCarnivoreCanEat,
    computeEndOfFeedingStageData,
    computePlayersForFeedingRound,
    getPlayersThatCanFeedIds,
    hasPlayerFinishedFeeding,
    isCarnivore,
} from '@/src/lib/food.service.server'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { sendUpdateGameEvents } from '@/src/lib/pusher.server.service'

export const POST = async (
    request: NextRequest,
    {
        params,
    }: {
        params: { gameId: string; playerId: string; speciesId: string }
    }
) => {
    try {
        const game: GameEntity = await getGameEntity(params.gameId)
        const preyId = request.nextUrl.searchParams.get('preyId')

        const playerFeeding: PlayerEntity = getPlayer(params.gameId, game.players, params.playerId)
        const speciesFeeding = getSpecies(params.gameId, playerFeeding, params.speciesId)

        const { players, amountOfFood } = feedSpecies(
            params.gameId,
            playerFeeding,
            speciesFeeding,
            game.players,
            game.amountOfFood,
            preyId
        )

        const playerIds = players.map((player) => player.id)
        const haveAllPlayersFinishedFeeding = players.every((player) => hasPlayerFinishedFeeding(player))

        if (haveAllPlayersFinishedFeeding) {
            await updateDataForAddingFoodStage(
                params.gameId,
                amountOfFood,
                players,
                playerIds,
                game.remainingCards,
                game.firstPlayerToFeedId
            )
            return NextResponse.json(null, { status: 200 })
        }

        const playersThatCanStillFeedIds = getPlayersThatCanFeedIds(amountOfFood, players)
        const noFoodLeft = playersThatCanStillFeedIds.length === 0

        if (noFoodLeft) {
            await updateDataForAddingFoodStage(
                params.gameId,
                amountOfFood,
                players,
                playerIds,
                game.remainingCards,
                game.firstPlayerToFeedId
            )
            return NextResponse.json(null, { status: 200 })
        }

        const playersComputedForNextRound = computePlayersForFeedingRound(
            players,
            playerFeeding.id,
            playersThatCanStillFeedIds
        )

        await updateGameInDb(
            params.gameId,
            amountOfFood,
            playersComputedForNextRound,
            game.remainingCards,
            game.firstPlayerToFeedId
        )

        await sendUpdateGameEvents(params.gameId, playerIds, true, true)
        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const updateDataForAddingFoodStage = async (
    gameId: string,
    amountOfFood: number,
    players: PlayerEntity[],
    playerIds: string[],
    remainingCards: Card[],
    firstPlayerToFeedId: string
): Promise<void> => {
    const endOfFeedingStageData = computeEndOfFeedingStageData(players, remainingCards, firstPlayerToFeedId)

    await updateGameInDb(
        gameId,
        amountOfFood,
        endOfFeedingStageData.players,
        endOfFeedingStageData.remainingCards,
        endOfFeedingStageData.firstPlayerToFeedId
    )
    await sendUpdateGameEvents(gameId, playerIds, true, true)
}

const updateGameInDb = async (
    gameId: string,
    newAmountOfFood: number,
    playersUpdated: PlayerEntity[],
    remainingCards: Card[],
    firstPlayerToFeedId: string
): Promise<void> => {
    const db = await getDb()
    await db.collection('games').updateOne(
        { _id: new ObjectId(gameId) },
        {
            $set: {
                amountOfFood: newAmountOfFood,
                players: playersUpdated,
                remainingCards: remainingCards,
                firstPlayerToFeedId,
            },
        }
    )
}

const checkThatPlantsEaterCanEat = (species: Species, amountOfFoodRemaining: number): void => {
    if (species.foodEaten >= species.population) {
        throw Error(`Species has already eaten | Species ID=${species.id}`)
    }
    if (amountOfFoodRemaining <= 0) {
        throw Error(`Species has no food left | Species ID=${species.id}`)
    }
}

const getSpecies = (gameId: string, player: PlayerEntity, speciesId: string): Species => {
    const species = player.species.find((species) => species.id === speciesId)
    if (!species) {
        console.error(
            `Species with id ${speciesId} in player with id ${player.id} does not exists in game with id ${gameId}`
        )
        throw Error()
    }
    return species
}

const getSpeciesFromPlayers = (gameId: string, players: PlayerEntity[], speciesId: string): Species => {
    for (const player of players) {
        for (const species of player.species) {
            if (species.id === speciesId) {
                return species
            }
        }
    }
    throw Error(`Species with id ${speciesId} does not exists in game with id ${gameId}`)
}

const feedSpecies = (
    gameId: string,
    playerFeeding: PlayerEntity,
    speciesFeeding: Species,
    players: PlayerEntity[],
    amountOfFood: number,
    preyId: string | null
): {
    players: PlayerEntity[]
    amountOfFood: number
} => {
    const playersUpdated = feedCarnivore(gameId, playerFeeding, speciesFeeding, players, preyId)
    return feedPlantBasedSpecies(playerFeeding, speciesFeeding, amountOfFood, playersUpdated)
}

const feedCarnivore = (
    gameId: string,
    playerFeeding: PlayerEntity,
    speciesFeeding: Species,
    players: PlayerEntity[],
    preyId: string | null
): PlayerEntity[] => {
    const isSpeciesToFeedCarnivore = !!preyId && isCarnivore(speciesFeeding)
    if (!isSpeciesToFeedCarnivore) {
        return players
    }
    const prey = getSpeciesFromPlayers(gameId, players, preyId)
    checkThatCarnivoreCanEat(speciesFeeding, prey)
    const foodGainedFromEating = prey.size
    if (speciesFeeding.foodEaten + foodGainedFromEating <= speciesFeeding.population) {
        speciesFeeding.foodEaten += foodGainedFromEating
        playerFeeding.numberOfFoodEaten += foodGainedFromEating
    } else {
        const maximumFoodThatCanBeEaten = speciesFeeding.population - speciesFeeding.foodEaten
        speciesFeeding.foodEaten += maximumFoodThatCanBeEaten
        playerFeeding.numberOfFoodEaten += maximumFoodThatCanBeEaten
    }
    playerFeeding.status = GameStatus.WAITING_FOR_PLAYERS_TO_FEED
    prey.population--
    if (prey.population < prey.foodEaten) {
        prey.foodEaten = prey.population
    }
    return players.map((player) => {
        if (player.species.some((species) => species.id === speciesFeeding.id)) {
            const speciesListUpdated = player.species.map((species) => {
                if (species.id === speciesFeeding.id) {
                    return speciesFeeding
                }
                return species
            })
            return { ...playerFeeding, species: speciesListUpdated }
        }
        if (player.species.some((species) => species.id === prey.id)) {
            if (prey.population <= 0) {
                const speciesListUpdated = player.species.reduce((speciesList: Species[], species) => {
                    if (species.id !== prey.id) {
                        speciesList.push(species)
                    }
                    return speciesList
                }, [])
                return { ...player, species: speciesListUpdated }
            }
            const speciesListUpdated = player.species.map((species) => {
                if (species.id === prey.id) {
                    return prey
                }
                return species
            })
            return { ...player, species: speciesListUpdated }
        }
        return player
    })
}

const feedPlantBasedSpecies = (
    playerFeeding: PlayerEntity,
    speciesFeeding: Species,
    amountOfFood: number,
    players: PlayerEntity[]
): {
    players: PlayerEntity[]
    amountOfFood: number
} => {
    if (isCarnivore(speciesFeeding)) {
        return { players, amountOfFood }
    }
    checkThatPlantsEaterCanEat(speciesFeeding, amountOfFood)
    speciesFeeding.foodEaten++
    playerFeeding.numberOfFoodEaten++
    amountOfFood--
    if (isForagerThatCanFeed(speciesFeeding, amountOfFood)) {
        speciesFeeding.foodEaten++
        playerFeeding.numberOfFoodEaten++
        amountOfFood--
    }
    playerFeeding.status = GameStatus.WAITING_FOR_PLAYERS_TO_FEED
    const playersUpdated = players.map((player) => {
        if (player.id === playerFeeding.id) {
            const speciesUpdated = playerFeeding.species.map((species) => {
                if (species.id === speciesFeeding.id) {
                    return speciesFeeding
                }
                return species
            })
            return { ...playerFeeding, species: speciesUpdated }
        }
        return player
    })
    return { players: playersUpdated, amountOfFood }
}

const isForagerThatCanFeed = (species: Species, amountOfFood: number): boolean => {
    return (
        species.features.some((feature) => feature.key === FeatureKey.FORAGER) &&
        species.population > species.foodEaten + 1 &&
        amountOfFood > 1
    )
}
