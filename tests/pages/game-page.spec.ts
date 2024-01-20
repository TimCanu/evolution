import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import {
    checkOpponentSpecies,
    checkOpponentStatus,
    checkPlayerInitialLayout,
    createPlayer1,
    createPlayer2,
    finishTurnEvolvingAndWaitForOthersToEvolve,
    finishTurnEvolvingAndWaitForOthersToFeed,
} from '@/tests/utils/player.util'
import {
    addCardAsFood,
    buildCarnivoreCard,
    buildFertileCard,
    buildForagerCard,
    buildLongNeckCard,
} from '@/tests/utils/cards.util'
import {
    addSpeciesFeature,
    addSpeciesToTheLeft,
    addSpeciesToTheRight,
    feedLastSpecies,
    feedSpecies,
    increaseSpeciesPopulation,
    increaseSpeciesSize,
} from '@/tests/utils/species.util'
import { assertNumberOfFoodInWaterPlan, assertNumberOfHiddenFood } from '@/tests/utils/food.util'
import { createGame } from '@/tests/utils/game.util'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'

test('should be able to play a game round with 2 players', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(1)
    const firstPlayer = createPlayer1()
    const secondPlayer = createPlayer2()
    await createGame(gameId, firstPlayer, secondPlayer, 0)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await checkPlayerInitialLayout(firstPlayerPage, 'Tim', true)
    await checkPlayerInitialLayout(secondPlayerPage, 'Aude', false)

    await addCardAsFood(firstPlayerPage, 1, 0, 4, firstPlayer.cards[0])
    await assertNumberOfHiddenFood(secondPlayerPage, 1)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 0)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 0)

    await addSpeciesToTheLeft(firstPlayerPage, 1, 3, firstPlayer.cards[1])
    await increaseSpeciesSize(firstPlayerPage, 1, 2, 2, firstPlayer.cards[2])
    await increaseSpeciesPopulation(firstPlayerPage, 1, 2, 1, firstPlayer.cards[3])
    await finishTurnEvolvingAndWaitForOthersToEvolve(firstPlayerPage)
    await checkOpponentSpecies(secondPlayerPage, 0, 0, 1, 1)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 0)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 0)

    await addCardAsFood(secondPlayerPage, 1, 1, 4, secondPlayer.cards[3])
    await assertNumberOfHiddenFood(firstPlayerPage, 2)

    await addSpeciesToTheRight(secondPlayerPage, 1, 3, secondPlayer.cards[1])
    await addSpeciesFeature(secondPlayerPage, 1, 2, 2, secondPlayer.cards[0])
    await finishTurnEvolvingAndWaitForOthersToFeed(secondPlayerPage)
    await checkOpponentSpecies(secondPlayerPage, 0, 0, 1, 1)
    await checkOpponentSpecies(secondPlayerPage, 0, 1, 2, 2)
    await checkOpponentSpecies(firstPlayerPage, 0, 0, 1, 1)
    await checkOpponentSpecies(firstPlayerPage, 0, 1, 1, 1)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 5)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 5)
    await checkOpponentStatus(firstPlayerPage, 1, false)
    await checkOpponentStatus(secondPlayerPage, 0, true)

    await feedSpecies(firstPlayerPage, 0, 2, 1, 0)
    await expect(firstPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await checkOpponentStatus(firstPlayerPage, 1, true)
    await checkOpponentStatus(secondPlayerPage, 1, false)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 4)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 4)

    await feedSpecies(secondPlayerPage, 0, 1, 1, 0)
    await expect(secondPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await checkOpponentStatus(firstPlayerPage, 2, false)
    await checkOpponentStatus(secondPlayerPage, 1, true)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 3)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 3)

    await feedSpecies(firstPlayerPage, 1, 1, 2, 0)
    await expect(firstPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
    await checkOpponentStatus(firstPlayerPage, 2, false)
    await checkOpponentStatus(secondPlayerPage, 2, true)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 2)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 2)

    await feedLastSpecies(firstPlayerPage, 1, 1, 2, 1)
    await checkOpponentStatus(firstPlayerPage, 2, false)
    await checkOpponentStatus(secondPlayerPage, 3, false)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 1)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 1)

    await expect(firstPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to')).toBeVisible()

    await expect(firstPlayerPage.getByAltText('The player Tim is the first player to feed')).toBeVisible()
})

test('Fertile card should increase population when there is food left', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(2)
    const fertileFeature: Feature = {
        cardId: 'fertileCardId',
        name: 'Fertile',
        key: FeatureKey.FERTILE,
        description: 'Fertile card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [fertileFeature], foodEaten: 0 }],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 1`)).toBeVisible()
    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 2`)).toBeVisible()
})

test('Long neck card should increase fed population by one when finishing turn', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(3)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [longNeckFeature], foodEaten: 0 }],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 1`)).toBeVisible()
    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 1 / 1`)).toBeVisible()
})

test('Forager card should increase fed population by two', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(4)
    const foragerFeature: Feature = {
        cardId: 'foragerCardId',
        name: 'Forager',
        key: FeatureKey.FORAGER,
        description: 'Forager description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 3, features: [foragerFeature], foodEaten: 0 }],
        cards: [],
        status: GameStatus.FEEDING_SPECIES,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FEED,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 3`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 1`)).toBeVisible()

    await firstPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).click()
    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 2 / 3`)).toBeVisible()

    await secondPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).click()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 1 / 1`)).toBeVisible()
})

test('Should skip feeding stage when all players are fed through long neck', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(5)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [longNeckFeature], foodEaten: 0 }],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'specie1', size: 1, population: 1, features: [longNeckFeature], foodEaten: 0 }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(firstPlayerPage.getByText('Your number of points: 1')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(secondPlayerPage.getByText('Your number of points: 1')).toBeVisible()
    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
})

test('Should skip feeding stage for first player to feed when already fed through long neck', async ({
    page: firstPlayerPage,
}) => {
    const gameId = ObjectId.createFromTime(6)
    const longNeckFeature: Feature = {
        cardId: 'longNeckCardId',
        name: 'Long neck',
        key: FeatureKey.LONG_NECK,
        description: 'Long card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [longNeckFeature], foodEaten: 0 }],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await expect(secondPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
})

test('Long neck and forager cards should increase fed population by two when finishing turn', async ({
    page: firstPlayerPage,
}) => {
    const gameId = ObjectId.createFromTime(6)
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
        species: [{ id: 'specie1', size: 1, population: 3, features: [longNeckFeature, foragerFeature], foodEaten: 0 }],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [
            { id: 'specie1', size: 1, population: 1, features: [longNeckFeature, foragerFeature], foodEaten: 0 },
        ],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 3`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 2 / 3`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 1 / 1`)).toBeVisible()
})
