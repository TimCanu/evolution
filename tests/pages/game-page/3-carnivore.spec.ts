import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import { createGame } from '@/tests/utils/game.util'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'

test('Carnivore should increase fed population by the size of the specie eaten', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(31)
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
                size: 6,
                population: 5,
                features: [carnivoreFeature],
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
        species: [],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Specie1', size: 3, population: 4, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 6")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 0/5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 6")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/4")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 size: 3")).toBeVisible()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await expect(
        firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' })
    ).toBeVisible()

    await firstPlayerPage.getByRole('img', { name: 'Cancel feeding of the carnivore' }).click()
    await expect(
        firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' })
    ).not.toBeAttached()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 3/5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/3")).toBeVisible()

    await secondPlayerPage.getByRole('button', { name: 'Feed plants to species at index 0' }).click()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 1/3")).toBeVisible()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 5/5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 1/2")).toBeVisible()
})

test('Carnivore should die when cannot eat', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(32)
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
                size: 1,
                population: 5,
                features: [carnivoreFeature],
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
        species: [],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Specie1', size: 3, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 0/5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/1")).toBeVisible()

    await secondPlayerPage.getByRole('button', { name: 'Feed plants to species at index 0' }).click()
    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(firstPlayerPage.getByRole('img', { name: 'Your number of points: 0' })).toBeVisible()
    await expect(secondPlayerPage.getByRole('img', { name: 'Your number of points: 1' })).toBeVisible()
    await expect(firstPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
})

test('Carnivore should be able to eat own player species', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(33)
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
                population: 5,
                features: [carnivoreFeature],
                foodEaten: 0,
                preyIds: [],
            },
            { id: 'player1Specie2', size: 1, population: 6, features: [], foodEaten: 0, preyIds: [] },
        ],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Specie1', size: 3, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 1 population: 6")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 0/5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 1 fed population: 0/6")).toBeVisible()
    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()

    await expect(firstPlayerPage.getByRole('img', { name: 'Eat your own species at index 1' })).toBeVisible()
    await firstPlayerPage.getByRole('img', { name: 'Cancel feeding of the carnivore' }).click()

    await expect(firstPlayerPage.getByRole('img', { name: 'Eat your own species at index 1' })).not.toBeAttached()
    await expect(firstPlayerPage.getByRole('button', { name: 'Feed plants to species at index 1' })).toBeVisible()
    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat your own species at index 1' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 1/5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 1 fed population: 0/5")).toBeVisible()
})

test('Carnivore should be able to kill an opponent species', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(34)
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
                size: 6,
                population: 5,
                features: [carnivoreFeature],
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
        species: [{ id: 'player2Specie1', size: 3, population: 2, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Specie1', size: 3, population: 2, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 6")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 2")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 size: 3")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 3/5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/1")).toBeVisible()

    await secondPlayerPage.getByRole('button', { name: 'Feed plants to species at index 0' }).click()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 1/1")).toBeVisible()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 size: 1")).toBeVisible()
})

test('should skip feeding stage when all species are carnivores that cannot feed', async ({
    page: firstPlayerPage,
}) => {
    const gameId = ObjectId.createFromTime(35)
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
                size: 1,
                population: 5,
                features: [carnivoreFeature],
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
            { id: 'player2Specie1', size: 1, population: 3, features: [carnivoreFeature], foodEaten: 0, preyIds: [] },
        ],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            { id: 'player2Specie1', size: 1, population: 3, features: [carnivoreFeature], foodEaten: 0, preyIds: [] },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 3")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 size: 1")).toBeVisible()
    await expect(firstPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
})

test('Carnivore should see "Go vegan" when cannot eat', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(36)
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
                size: 1,
                population: 5,
                features: [carnivoreFeature],
                foodEaten: 0,
                preyIds: [],
            },
            {
                id: 'player1Specie2',
                size: 3,
                population: 5,
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
        species: [],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Specie1', size: 3, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel("Species at index 0 population: 5")).toBeVisible()
    await expect(firstPlayerPage.getByLabel("Species at index 0 size: 1")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByText("Go vegan")).toBeVisible()
})

test('Carnivore cannot eat a species that it just killed', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(37)
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
                size: 6,
                population: 5,
                features: [carnivoreFeature],
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
            {
                id: 'player2Specie1',
                size: 1,
                population: 1,
                features: [],
                foodEaten: 0,
                preyIds: [],
            },
            { id: 'player2Specie2', size: 1, population: 3, features: [], foodEaten: 0, preyIds: [] },
        ],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            {
                id: 'player2Specie1',
                size: 1,
                population: 1,
                features: [],
                foodEaten: 0,
                preyIds: [],
            },
            { id: 'player2Specie2', size: 1, population: 3, features: [], foodEaten: 0, preyIds: [] },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(secondPlayerPage.getByLabel("Species at index 0 population: 1")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 1 population: 3")).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await firstPlayerPage.getByRole('img', { name: 'Feed carnivore at index 0' }).click()
    await firstPlayerPage.getByRole('img', { name: 'Eat the species at index 0 of opponent at index 0' }).click()

    await expect(firstPlayerPage.getByLabel("Species at index 0 fed population: 1/5")).toBeVisible()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 0/3")).toBeVisible()

    await secondPlayerPage.getByRole('button', { name: 'Feed plants to species at index 0' }).click()
    await expect(secondPlayerPage.getByLabel("Species at index 0 fed population: 1/3")).toBeVisible()
})
