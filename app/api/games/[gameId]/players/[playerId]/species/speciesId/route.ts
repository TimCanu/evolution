import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server.js'
import { GameEntity } from '@/src/models/game-entity.model'
import { getDb } from '@/src/repositories/shared.repository'
import { getGameEntity } from '@/src/repositories/games.repository'
import { ObjectId } from 'mongodb'
import { Player } from '@/src/models/player.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { pushNewFood, pushNewGameStatus, pushUpdatedOpponents } from '@/src/lib/pusher.server.service'

export const POST = async (
    request: NextRequest,
    {
        params,
    }: {
        params: { gameId: string; playerId: string, speciesId: string }
    }
) => {
    try {
        const game: GameEntity = await getGameEntity(params.gameId)

        const playerToUpdate = game.players.find((player) => player.id === params.playerId)
        if (!playerToUpdate) {
            console.error(`Player with id ${params.playerId} does not exists in game with id ${params.gameId}`)
            return NextResponse.error()
        }
        const speciesToUpdate = playerToUpdate.species.find((species) => species.id === params.speciesId)
        if (!speciesToUpdate) {
            console.error(`Species with id ${params.speciesId} in player with id ${params.playerId} does not exists in game with id ${params.gameId}`)
            return NextResponse.error()
        }

        if(speciesToUpdate.foodEaten >= speciesToUpdate.population) {
            console.error(`Species with id ${params.speciesId} in player with id ${params.playerId} in game with id ${params.gameId} has already eaten`)
            return NextResponse.error()
        }

        if(game.amountOfFood<=0){
            console.error(`Species with id ${params.speciesId} in player with id ${params.playerId} in game with id ${params.gameId} cannot eat as there is no food left`)
            return NextResponse.error()
        }

        speciesToUpdate.foodEaten++
        const newAmountOfFood = game.amountOfFood - 1

        const noFoodAvailable = newAmountOfFood <= 0

        const playerSpeciesUpdated = playerToUpdate.species.map(species => {
            if(species.id === speciesToUpdate.id) {
                return speciesToUpdate
            }
            return species
        })

        const playerUpdatedStatus = noFoodAvailable ? GameStatus.ADDING_FOOD_TO_WATER_PLAN : GameStatus.FEEDING_SPECIES 
        const playerUpdated = { ...playerToUpdate, species: playerSpeciesUpdated, status: playerUpdatedStatus}
        const playersUpdated = game.players.map(player => {
            if(player.id === playerUpdated.id){
                return playerUpdated
            }
            if(noFoodAvailable){
               return {...player, status: GameStatus.ADDING_FOOD_TO_WATER_PLAN} 
            }
            return player
        })


        const db = await getDb()
        await db.collection('games').updateOne(
            { _id: new ObjectId(params.gameId) },
            {
                $set: {
                    amountOfFood: newAmountOfFood,
                    players: playersUpdated,
                },
            }
        )

        if (haveAllPlayersFinishedEvolving) {
            await pushNewGameStatus(params.gameId, GameStatus.FEEDING_SPECIES)
            const playerIdsToNotify = playersUpdated.map((player) => player.id)
            await pushUpdatedOpponents(params.gameId, playersUpdated, playerIdsToNotify)
            await pushNewFood(params.gameId, { hiddenFoods: hiddenFoodsUpdated, amountOfFood: amountOfFoodUpdated })
        }

        return NextResponse.json({ gameStatus: playerToUpdate.status }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
