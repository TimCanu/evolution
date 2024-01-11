import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { GameStatus } from '@/src/enums/game.events.enum'
import { expect, Page } from '@playwright/test'
import { Card } from '@/src/models/card.model'

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
    await expect(firstPlayerPage.getByText('Tim')).toBeVisible()
    await expect(firstPlayerPage.getByAltText('You are the first player to feed')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('card-3')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('card-4')).not.toBeAttached()
    await expect(firstPlayerPage.getByTestId('species-0')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-0')).toHaveText('1 1')
    await expect(firstPlayerPage.getByTestId('species-1')).not.toBeAttached()
    await expect(firstPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
}

export const hoverCard = async (page: Page, card: Card): Promise<void> => {
    await expect(page.getByRole('button', { name: 'Add as food' })).toBeHidden()
    await page.getByText(`${card.name}Add as food${card.description}`).hover()
    await expect(page.getByRole('button', { name: 'Add as food' })).toBeVisible()
}

export const addCardAsFood = async (
    page: Page,
    numberOfSpecies: number,
    numberOfAddedFood: number,
    numberOfCards: number
): Promise<void> => {
    await expect(page.getByTestId(`hidden-food-${numberOfAddedFood}`)).not.toBeAttached()

    await page.getByRole('button', { name: 'Add as food' }).click()

    await expect(page.getByTestId(`hidden-food-${numberOfAddedFood}`)).toBeVisible()
    await expect(page.getByText('Choose an action to evolve your species or finish your turn')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Finish turn' })).toBeVisible()
    await expect(
        page.getByRole('button', { name: `Increase size of species at position ${numberOfSpecies}` })
    ).toBeVisible()
    await expect(
        page.getByRole('button', { name: `Increase population of species at position ${numberOfSpecies}` })
    ).toBeVisible()
    await expect(
        page.getByRole('button', { name: `Add feature to species at position ${numberOfSpecies}` })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add a new species to the left' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add a new species to the right' })).toBeVisible()
    await expect(page.getByTestId(`card-${numberOfCards - 2}`)).toBeVisible()
    await expect(page.getByTestId(`card-${numberOfCards - 1}`)).not.toBeAttached()
}
