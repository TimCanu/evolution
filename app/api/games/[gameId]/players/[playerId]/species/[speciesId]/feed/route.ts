import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity, getOpponents } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { GameStatus } from '@/src/enums/game.events.enum'
import {
    buildUpdateFoodEvent,
    buildUpdateOpponentsEvent,
    buildUpdatePlayerCardsEvent,
    buildUpdatePlayerSpeciesEvent,
    buildUpdatePlayerStatusEvent,
} from '@/src/lib/pusher.server.service'
import { Species } from '@/src/models/species.model'
import { PusherEvent, PusherEventBase } from '@/src/models/pusher.channels.model'
import pusherServer from '@/src/lib/pusher-server'
import { getPlayer } from '@/src/lib/player.service.server'
import { Card } from '@/src/models/card.model'
import { computeEndOfFeedingStageData } from '@/src/lib/food.service.server'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'

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

        const playerToUpdate: PlayerEntity = getPlayer(game, params.playerId)
        const speciesToUpdate = getSpecies(game._id.toString(), playerToUpdate, params.speciesId)

        checkThatSpeciesCanEat(params.gameId, params.playerId, speciesToUpdate, game.amountOfFood)
        let newAmountOfFood = game.amountOfFood - 1

        if (
            speciesToUpdate.features.some((feature) => feature.key === FeatureKey.FORAGER) &&
            speciesToUpdate.population > speciesToUpdate.foodEaten + 1 &&
            game.amountOfFood > 1
        ) {
            speciesToUpdate.foodEaten += 2
            newAmountOfFood = newAmountOfFood - 1
            playerToUpdate.numberOfFoodEaten += 2
        } else {
            speciesToUpdate.foodEaten++
            playerToUpdate.numberOfFoodEaten += 1
        }

        const noMoreFoodAvailable = newAmountOfFood <= 0
        const haveAllPlayersFinishedFeeding =
            hasPlayerFinishedFeeding(playerToUpdate) &&
            game.players.every((player) => player.id === playerToUpdate.id || hasPlayerFinishedFeeding(player))
        const endFeedingStage = noMoreFoodAvailable || haveAllPlayersFinishedFeeding

        const playerUpdated: PlayerEntity = {
            ...playerToUpdate,
            species: computedSpeciesUpdated(playerToUpdate.species, speciesToUpdate),
            status: computePlayerStatus(endFeedingStage),
        }
        const playersUpdated = computePlayersStatus(endFeedingStage, game.players, playerUpdated)

        const events: PusherEvent<PusherEventBase>[] = []
        if (endFeedingStage) {
            const endOfFeedingStageData = computeEndOfFeedingStageData(
                playersUpdated,
                game.remainingCards,
                game.firstPlayerToFeedId
            )

            await updateGameInDb(
                params.gameId,
                newAmountOfFood,
                endOfFeedingStageData.players,
                endOfFeedingStageData.remainingCards,
                endOfFeedingStageData.firstPlayerToFeedId
            )

            endOfFeedingStageData.players.forEach((player) => {
                const playerOpponents = getOpponents(
                    endOfFeedingStageData.players,
                    player.id,
                    endOfFeedingStageData.firstPlayerToFeedId
                )
                const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                events.push(event)
                events.push(
                    buildUpdatePlayerStatusEvent(
                        params.gameId,
                        player.id,
                        GameStatus.ADDING_FOOD_TO_WATER_PLAN,
                        endOfFeedingStageData.firstPlayerToFeedId,
                        player.numberOfFoodEaten
                    )
                )
                events.push(buildUpdatePlayerSpeciesEvent(params.gameId, player.id, { species: player.species }))
                events.push(buildUpdatePlayerCardsEvent(params.gameId, player.id, player.cards))
            })
        } else {
            await updateGameInDb(
                params.gameId,
                newAmountOfFood,
                playersUpdated,
                game.remainingCards,
                game.firstPlayerToFeedId
            )

            playersUpdated.forEach((player) => {
                const playerOpponents = getOpponents(playersUpdated, player.id, game.firstPlayerToFeedId)
                const event = buildUpdateOpponentsEvent(params.gameId, player.id, playerOpponents)
                events.push(event)
                events.push(
                    buildUpdatePlayerStatusEvent(
                        params.gameId,
                        player.id,
                        player.status,
                        game.firstPlayerToFeedId,
                        player.numberOfFoodEaten
                    )
                )
                events.push(buildUpdatePlayerSpeciesEvent(params.gameId, player.id, { species: player.species }))
            })
        }

        events.push(
            buildUpdateFoodEvent(params.gameId, { hiddenFoods: game.hiddenFoods, amountOfFood: newAmountOfFood })
        )
        await pusherServer.triggerBatch(events)

        return NextResponse.json(null, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.error()
    }
}

const hasPlayerFinishedFeeding = (player: PlayerEntity): boolean => {
    return player.species.every((species) => species.foodEaten === species.population)
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

const computePlayersStatus = (
    endFeedingStage: boolean,
    players: PlayerEntity[],
    playerCurrentlyFeeding: PlayerEntity
): PlayerEntity[] => {
    if (endFeedingStage) {
        return players.map((player) => {
            if (player.id === playerCurrentlyFeeding.id) {
                return { ...playerCurrentlyFeeding, status: GameStatus.ADDING_FOOD_TO_WATER_PLAN }
            }
            return { ...player, status: GameStatus.ADDING_FOOD_TO_WATER_PLAN }
        })
    }
    const nextPlayerToFeedId = getNextPlayerToFeedId(players, playerCurrentlyFeeding.id)
    return players.map((player) => {
        if (player.id === nextPlayerToFeedId) {
            if (player.id === playerCurrentlyFeeding.id) {
                return { ...playerCurrentlyFeeding, status: GameStatus.FEEDING_SPECIES }
            }
            return { ...player, status: GameStatus.FEEDING_SPECIES }
        }
        if (player.id === playerCurrentlyFeeding.id) {
            return playerCurrentlyFeeding
        }
        return player
    })
}

const getNextPlayerToFeedId = (players: PlayerEntity[], lastPlayerToFeedId: string): string => {
    const playerCurrentlyFeedingIndex = players.findIndex((player) => player.id === lastPlayerToFeedId)
    const nextPlayerFeedingIndex =
        playerCurrentlyFeedingIndex + 1 === players.length ? 0 : playerCurrentlyFeedingIndex + 1
    const nextPlayerFeeding = players[nextPlayerFeedingIndex]
    if (hasPlayerFinishedFeeding(nextPlayerFeeding)) {
        return getNextPlayerToFeedId(players, nextPlayerFeeding.id)
    }
    return nextPlayerFeeding.id
}

const computePlayerStatus = (endFeedingStage: boolean): GameStatus => {
    if (endFeedingStage) {
        return GameStatus.ADDING_FOOD_TO_WATER_PLAN
    }
    return GameStatus.WAITING_FOR_PLAYERS_TO_FEED
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
