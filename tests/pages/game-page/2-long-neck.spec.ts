import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import { createGame } from '@/tests/utils/game.util'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'

test('Long neck card should increase fed population by one when finishing turn', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(21)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Species1',
                size: 1,
                population: 1,
                features: [longNeckFeature],
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
        species: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/1")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 1/1")).toBeVisible()
})

test('Should skip feeding stage when all players are fed through long neck', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(22)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Species1',
                size: 1,
                population: 1,
                features: [longNeckFeature],
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
        species: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            {
                id: 'player2Species1',
                size: 1,
                population: 1,
                features: [longNeckFeature],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(firstPlayerPage.getByRole('img', { name: 'Your number of points: 1' })).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(secondPlayerPage.getByRole('img', { name: 'Your number of points: 1' })).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
})

test('Should skip feeding stage for first player to feed when already fed through long neck', async ({
    page: firstPlayerPage,
}) => {
    const gameId = ObjectId.createFromTime(23)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Species1',
                size: 1,
                population: 1,
                features: [longNeckFeature],
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
        species: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await expect(secondPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
})

test('Long neck and forager cards should increase fed population by two when finishing turn', async ({
    page: firstPlayerPage,
}) => {
    const gameId = ObjectId.createFromTime(24)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const foragerFeature: Feature = {
        cardId: 'foragerCardId',
        name: 'Forager',
        key: FeatureKey.FORAGER,
        description: 'Forager description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Specie1',
                size: 1,
                population: 3,
                features: [longNeckFeature, foragerFeature],
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
        species: [{ id: 'player2Specie1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            {
                id: 'player2Specie1',
                size: 1,
                population: 1,
                features: [longNeckFeature, foragerFeature],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 3")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 2/3")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 1/1")).toBeVisible()
})

test('Long neck should not work with carnivore feature', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(25)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const carnivoreFeature: Feature = {
        cardId: 'carnivoreCardId',
        name: 'Carnivore',
        key: FeatureKey.CARNIVORE,
        description: 'Carnivore description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Specie1',
                size: 2,
                population: 3,
                features: [longNeckFeature, carnivoreFeature],
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
        species: [{ id: 'player2Specie1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            {
                id: 'player2Specie1',
                size: 1,
                population: 1,
                features: [longNeckFeature],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 3")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 0/3")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 1/1")).toBeVisible()
})
