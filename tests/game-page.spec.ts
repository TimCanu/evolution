import { test } from '@playwright/test'
import clientPromise from '@/src/lib/mongodb'
import { CreateGameEntity } from '@/src/models/game-entity.model'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { GameStatus } from '@/src/enums/game.events.enum'

test('has button to redirect to create game page', async ({ page }) => {
    const dbClient = await clientPromise
    const db = dbClient.db(process.env.DATABASE_NAME)

    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
    }

    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie2', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
    }

    const game: CreateGameEntity = {
        remainingCards: [],
        nbOfPlayers: 2,
        players: [firstPlayer, secondPlayer],
        hiddenFoods: [],
        amountOfFood: 0,
    }
    const res = await db.collection('games').insertOne(game)
    const { insertedId: gameId } = JSON.parse(JSON.stringify(res))

    await page.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)

    await page.getByText('Tim')
    // await page.getByRole('link', { name: 'Create a game' }).click()
})
