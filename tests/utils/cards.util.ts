import { expect, Locator, Page } from '@playwright/test'
import { Card } from '@/src/models/card.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'

export const getCardToAddAsFood = async (page: Page, card: Card): Promise<Locator> => {
    return page.getByRole('button', { name: `Use the card ${card.name} to add ${card.foodNumber} to the water plan` })
}

export const getCardToDiscard = async (page: Page, card: Card): Promise<Locator> => {
    return page.getByRole('button', { name: `Discard the card ${card.name}` })
}

export const assertNumberOfCards = async (page: Page, numberOfCards: number): Promise<void> => {
    await expect(page.getByTestId(/card-*/)).toHaveCount(numberOfCards)
}

export const addCardAsFood = async (
    page: Page,
    numberOfSpecies: number,
    numberOfAddedFood: number,
    numberOfCards: number,
    card: Card
): Promise<void> => {
    await expect(page.getByRole('button', { name: 'Add as food' })).toBeHidden()

    const cardToAdd = await getCardToAddAsFood(page, card)
    await expect(cardToAdd).toBeVisible()
    await expect(page.getByTestId(`hidden-food-${numberOfAddedFood}`)).not.toBeAttached()

    await cardToAdd.click()
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
    await assertNumberOfCards(page, numberOfCards - 1)
}

export const buildLongNeckCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Long neck',
        featureKey: FeatureKey.LONG_NECK,
        description: 'Long neck card description',
        foodNumber,
    }
}
export const buildFertileCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Fertile',
        featureKey: FeatureKey.FERTILE,
        description: 'Fertile card description',
        foodNumber,
    }
}

export const buildForagerCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Forager',
        featureKey: FeatureKey.FORAGER,
        description: 'Forager card description',
        foodNumber,
    }
}

export const buildCarnivoreCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Carnivore',
        featureKey: FeatureKey.CARNIVORE,
        description: 'Carnivore card description',
        foodNumber,
    }
}

export const buildClimbingCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Climbing',
        featureKey: FeatureKey.CLIMBING,
        description: 'Climbing card description',
        foodNumber,
    }
}

export const buildDiggerCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Digger',
        featureKey: FeatureKey.DIGGER,
        description: 'Digger card description',
        foodNumber,
    }
}

export const buildHerdCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        name: 'Herd',
        featureKey: FeatureKey.HERD,
        description: 'Herd card description',
        foodNumber,
    }
}
