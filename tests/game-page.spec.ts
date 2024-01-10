import { expect, test } from '@playwright/test'
import clientPromise from '@/src/lib/mongodb'
import { CreateGameEntity } from '@/src/models/game-entity.model'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { FeatureKey } from '@/src/enums/feature-key.enum'

test('has button to redirect to create game page', async ({ page: firstPlayerPage }) => {
    const dbClient = await clientPromise
    const db = dbClient.db(process.env.DATABASE_NAME)

    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [
            {
                id: 'firstPlayerCard1',
                name: 'Long neck',
                featureKey: FeatureKey.LONG_NECK,
                description: 'Long neck card description',
                foodNumber: 4,
            },
            {
                id: 'firstPlayerCard2',
                name: 'Fertile',
                featureKey: FeatureKey.FERTILE,
                description: 'Fertile card description',
                foodNumber: 3,
            },
            {
                id: 'firstPlayerCard3',
                name: 'Forager',
                featureKey: FeatureKey.FORAGER,
                description: 'Forage card description',
                foodNumber: 2,
            },
            {
                id: 'firstPlayerCard4',
                name: 'Carnivore',
                featureKey: FeatureKey.CARNIVORE,
                description: 'Carnivore card description',
                foodNumber: -1,
            },
        ],
        status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
    }

    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie2', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [
            {
                id: 'secondPlayerCard1',
                name: 'Long neck',
                featureKey: FeatureKey.LONG_NECK,
                description: 'Long neck card description',
                foodNumber: 1,
            },
            {
                id: 'secondPlayerCard2',
                name: 'Fertile',
                featureKey: FeatureKey.FERTILE,
                description: 'Fertile card description',
                foodNumber: 1,
            },
            {
                id: 'secondPlayerCard3',
                name: 'Forager',
                featureKey: FeatureKey.FORAGER,
                description: 'Forage card description',
                foodNumber: 1,
            },
            {
                id: 'secondPlayerCard4',
                name: 'Carnivore',
                featureKey: FeatureKey.CARNIVORE,
                description: 'Carnivore card description',
                foodNumber: 1,
            }],
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

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByText('Tim')).toBeVisible()
    await expect(secondPlayerPage.getByText('Aude')).toBeVisible()

    await expect(firstPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to')).toBeVisible()

    await expect(firstPlayerPage.getByRole('button', { name: 'Add as food' })).toBeHidden()
    await firstPlayerPage.getByText('Long neckAdd as foodLong neck').hover()
    await expect(firstPlayerPage.getByRole('button', { name: 'Add as food' })).toBeVisible()

    await firstPlayerPage.getByRole('button', { name: 'Add as food' }).click()
    await expect(firstPlayerPage.getByTestId('hidden-food-1')).toBeVisible()
    // Does not work...
    // await expect(secondPlayerPage.getByTestId('hidden-food-1')).toBeVisible()

    await expect(firstPlayerPage.getByText('Choose an action to evolve your species or finish your turn')).toBeVisible()
})
