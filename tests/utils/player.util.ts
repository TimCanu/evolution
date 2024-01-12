import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { GameStatus } from '@/src/enums/game.events.enum'
import { expect, Page } from '@playwright/test'
import { assertNumberOfCards } from '@/tests/utils/cards.util'
import { assertNumberOfSpecies } from '@/tests/utils/species.util'
import { assertNumberOfHiddenFood } from '@/tests/utils/food.util'

export const createPlayer1 = (): PlayerEntity => {
    return {
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
                description: 'Forager card description',
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
}

export const createPlayer2 = (): PlayerEntity => {
    return {
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
                description: 'Forager card description',
                foodNumber: 1,
            },
            {
                id: 'secondPlayerCard4',
                name: 'Carnivore',
                featureKey: FeatureKey.CARNIVORE,
                description: 'Carnivore card description',
                foodNumber: 1,
            },
        ],
        status: GameStatus.ADDING_FOOD_TO_WATER_PLAN,
    }
}

export const checkFirstPlayerInitialLayout = async (firstPlayerPage: Page): Promise<void> => {
    await assertNumberOfCards(firstPlayerPage, 4)
    await assertNumberOfSpecies(firstPlayerPage, 1)
    await assertNumberOfHiddenFood(firstPlayerPage, 0)
    await expect(firstPlayerPage.getByText('Tim')).toBeVisible()
    await expect(firstPlayerPage.getByAltText('You are the first player to feed')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-0')).toHaveText('1 1')
    await expect(firstPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
}

export const checkSecondPlayerInitialLayout = async (secondPlayerPage: Page): Promise<void> => {
    await assertNumberOfCards(secondPlayerPage, 4)
    await assertNumberOfSpecies(secondPlayerPage, 1)
    await assertNumberOfHiddenFood(secondPlayerPage, 0)
    await expect(secondPlayerPage.getByText('Aude')).toBeVisible()
    await expect(secondPlayerPage.getByAltText('The player Aude is the first player to feed')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
}

const finishTurnEvolving = async (page: Page): Promise<void> => {
    await page.getByRole('button', { name: 'Finish turn' }).click()

    await expect(page.getByRole('button', { name: 'Finish turn' })).not.toBeAttached()
    await expect(page.getByRole('button', { name: /Increase size of species at position */ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Increase population of species at position */ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Add feature to species at position */ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add a new species to the left' })).not.toBeAttached()
    await expect(page.getByRole('button', { name: 'Add a new species to the right' })).not.toBeAttached()
}

export const finishTurnEvolvingAndWaitForOthersToEvolve = async (page: Page): Promise<void> => {
    await finishTurnEvolving(page)
    await expect(page.getByText('Waiting for other players to finish evolving')).toBeVisible()
}

export const finishTurnEvolvingAndWaitForOthersToFeed = async (page: Page): Promise<void> => {
    await finishTurnEvolving(page)
    await expect(page.getByText('Waiting for other players to feed')).toBeVisible()
}
