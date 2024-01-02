import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { GameStatus } from '@/src/enums/game.events.enum'
import {
    buildUpdateFoodEvent,
    buildUpdateGameStatusEvent,
    buildUpdateOpponentsEvent,
    buildUpdatePlayerCardsEvent,
    buildUpdatePlayerSpeciesEvent,
} from '@/src/lib/pusher.server.service'
import { Player } from '@/src/models/player.model'
import { Species } from '@/src/models/species.model'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { getPlayer } from '@/src/lib/player.service.server'
import { v4 as uuidv4 } from 'uuid'
import { Card } from '@/src/models/card.model'

export const POST = async (
    _: NextRequest,
    {
        params,
    }: {
        params: { gameId: string; playerId: string; speciesId: string }
    }
) => {
    try {
        const game: GameEntity = await getGameEntity(params.gameId)

        const playerToUpdate: Player = getPlayer(game, params.playerId)
        const speciesToUpdate = getSpecies(game._id.toString(), playerToUpdate, params.speciesId)

        checkThatSpeciesCanEat(params.gameId, params.playerId, speciesToUpdate, game.amountOfFood)

        speciesToUpdate.foodEaten++

        const newAmountOfFood = game.amountOfFood - 1
        const noMoreFoodAvailable = newAmountOfFood <= 0
        const hasCurrentPlayerFinishedFeeding = hasPlayerFinishedFeeding(playerToUpdate)
        const haveAllPlayersFinishedFeeding =
            hasCurrentPlayerFinishedFeeding &&
            game.players.every((player) => player.id === playerToUpdate.id || hasPlayerFinishedFeeding(player))
        const endFeedingStage = noMoreFoodAvailable || haveAllPlayersFinishedFeeding

        const playerUpdated: Player = {
            ...playerToUpdate,
            species: computedSpeciesUpdated(playerToUpdate.species, speciesToUpdate),
            status: computePlayerStatus(endFeedingStage, hasCurrentPlayerFinishedFeeding),
        }
        const playersUpdated = computePlayersStatus(endFeedingStage, game.players, playerUpdated)

        const events: PusherEvent<PusherEventBase>[] = []
        if (endFeedingStage) {
            const endOfFeedingStageData = computeEndOfFeedingStageData(playersUpdated, game.remainingCards)

            await updateGameInDb(
                params.gameId,
                newAmountOfFood,
                endOfFeedingStageData.players,
                endOfFeedingStageData.remainingCards
            )

            events.push(buildUpdateGameStatusEvent(params.gameId, GameStatus.ADDING_FOOD_TO_WATER_PLAN))
            endOfFeedingStageData.players.forEach((player) => {
                const playerOpponents = getOpponents(endOfFeedingStageData.players, player.id)
                const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                events.push(event)
                events.push(buildUpdatePlayerSpeciesEvent(params.gameId, player.id, { species: player.species }))
                events.push(buildUpdatePlayerCardsEvent(params.gameId, player.id, player.cards))
            })
        } else {
            await updateGameInDb(params.gameId, newAmountOfFood, playersUpdated, game.remainingCards)

            playersUpdated
                .filter((player) => player.id !== playerToUpdate.id)
                .forEach((player) => {
                    const playerOpponents = getOpponents(playersUpdated, player.id)
                    const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                    events.push(event)
                })
            playersUpdated.forEach((player) => {
                events.push(buildUpdatePlayerSpeciesEvent(params.gameId, player.id, { species: player.species }))
            })
        }

        events.push(
            buildUpdateFoodEvent(params.gameId, { hiddenFoods: game.hiddenFoods, amountOfFood: newAmountOfFood })
        )
        await pusherServer.triggerBatch(events)

        return NextResponse.json({ gameStatus: playerUpdated.status }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}

const computeEndOfFeedingStageData = (
    players: Player[],
    cards: Card[]
): {
    players: Player[]
    remainingCards: Card[]
} => {
    const playersUpdated = players.map((player: Player) => {
        player.species = computeSpeciesPopulation(player.species)
        if (player.species.length === 0) {
            player.species = [{ id: uuidv4(), size: 1, population: 1, foodEaten: 0, features: [] }]
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
        return player
    })
    return { players: playersUpdated, remainingCards: cards }
}

const hasPlayerFinishedFeeding = (player: Player): boolean => {
    return player.species.every((species) => species.foodEaten === species.population)
}

const updateGameInDb = async (
    gameId: string,
    newAmountOfFood: number,
    playersUpdated: Player[],
    remainingCards: Card[]
): Promise<void> => {
    const db = await getDb()
    await db.collection('games').updateOne(
        { _id: new ObjectId(gameId) },
        {
            $set: {
                amountOfFood: newAmountOfFood,
                players: playersUpdated,
                remainingCards: remainingCards,
            },
        }
    )
}

const computeSpeciesPopulation = (species: Species[]): Species[] => {
    return species.reduce((speciesUpdated: Species[], species: Species) => {
        if (species.foodEaten === 0) {
            return speciesUpdated
        }
        return [...speciesUpdated, { ...species, population: species.foodEaten, foodEaten: 0 }]
    }, [])
}

const computePlayersStatus = (
    endFeedingStage: boolean,
    players: Player[],
    playerCurrentlyFeeding: Player
): Player[] => {
    return players.map((player) => {
        if (player.id === playerCurrentlyFeeding.id) {
            return playerCurrentlyFeeding
        }
        if (endFeedingStage) {
            return { ...player, status: GameStatus.ADDING_FOOD_TO_WATER_PLAN }
        }
        return player
    })
}

const computePlayerStatus = (endFeedingStage: boolean, hasPlayerFinishedFeeding: boolean): GameStatus => {
    if (endFeedingStage) {
        return GameStatus.ADDING_FOOD_TO_WATER_PLAN
    }
    if (hasPlayerFinishedFeeding) {
        return GameStatus.WAITING_FOR_PLAYERS_TO_FEED
    }
    return GameStatus.FEEDING_SPECIES
}

const checkThatSpeciesCanEat = (
    gameId: string,
    playerId: string,
    species: Species,
    amountOfFoodRemaining: number
): void => {
    if (species.foodEaten >= species.population) {
        console.error(`Species has already eaten | Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`)
        throw Error()
    }
    if (amountOfFoodRemaining <= 0) {
        console.error(`Species has no food left | Species ID=${species.id}, Player ID=${playerId}, Game ID=${gameId}`)
        throw Error()
    }
}

const computedSpeciesUpdated = (speciesList: Species[], speciesToUpdate: Species): Species[] => {
    return speciesList.map((species) => {
        if (species.id === speciesToUpdate.id) {
            return speciesToUpdate
        }
        return species
    })
}

const getSpecies = (gameId: string, player: Player, speciesId: string): Species => {
    const species = player.species.find((species) => species.id === speciesId)
    if (!species) {
        console.error(
            `Species with id ${speciesId} in player with id ${player.id} does not exists in game with id ${gameId}`
        )
        throw Error()
    }
    return species
}
