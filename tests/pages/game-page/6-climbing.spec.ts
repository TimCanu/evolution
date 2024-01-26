import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import { createGame } from '@/tests/utils/game.util'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'

test("Carnivore can't eat a species with Climbing feature", async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(61)
    const carnivoreFeature: Feature = {
        cardId: 'carnivoreCardId',
        name: 'Carnivore',
        key: FeatureKey.CARNIVORE,
        description: 'Carnivore description',
    }
    const climbingFeature: Feature = {
        cardId: 'climbingCardId',
        name: 'Climbing',
        key: FeatureKey.CLIMBING,
        description: 'Climbing description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Specie1',
                size: 4,
                population: 2,
                features: [carnivoreFeature],
                foodEaten: 0,
                preyIds: [],
            },
            {
                id: 'player1Specie2',
                size: 4,
                population: 2,
                features: [],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [
            { id: 'player2Specie1', size: 2, population: 4, features: [climbingFeature], foodEaten: 0, preyIds: [] },
        ],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            { id: 'player2Specie1', size: 2, population: 4, features: [climbingFeature], foodEaten: 0, preyIds: [] },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 2")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 4")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByText("Go vegan")).toBeVisible()
})

test('Carnivore can eat a species with Climbing feature', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(62)
    const carnivoreFeature: Feature = {
        cardId: 'carnivoreCardId',
        name: 'Carnivore',
        key: FeatureKey.CARNIVORE,
        description: 'Carnivore description',
    }
    const climbingFeature: Feature = {
        cardId: 'climbingCardId',
        name: 'Climbing',
        key: FeatureKey.CLIMBING,
        description: 'Climbing description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Specie1',
                size: 4,
                population: 2,
                features: [carnivoreFeature, climbingFeature],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [
            { id: 'player2Specie1', size: 2, population: 4, features: [climbingFeature], foodEaten: 0, preyIds: [] },
        ],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            { id: 'player2Specie1', size: 2, population: 4, features: [climbingFeature], foodEaten: 0, preyIds: [] },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 2")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 4")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/4")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 size: 2")).toBeVisible()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' }).click()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/3")).toBeVisible()
})
