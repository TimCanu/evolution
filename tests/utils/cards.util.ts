import { expect, Locator, Page } from '@playwright/test'
import { Card } from '@/src/models/card.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { getFeatureName } from '@/src/lib/feature.service.client'

export const getCardToAddAsFood = async (page: Page, card: Card): Promise<Locator> => {
    const cardName = getFeatureName(card.featureKey)
    return page.getByRole('button', { name: `Use the card ${cardName} to add ${card.foodNumber} to the water plan` })
}

export const getCardToDiscard = async (page: Page, card: Card): Promise<Locator> => {
    const cardName = getFeatureName(card.featureKey)
    return page.getByRole('button', { name: `Discard the card ${cardName}` })
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
        featureKey: FeatureKey.LONG_NECK,
        foodNumber,
    }
}
export const buildFertileCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        featureKey: FeatureKey.FERTILE,
        foodNumber,
    }
}

export const buildForagerCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        featureKey: FeatureKey.FORAGER,
        foodNumber,
    }
}

export const buildCarnivoreCard = (id: string, foodNumber: number): Card => {
    return {
        id,
        featureKey: FeatureKey.CARNIVORE,
        foodNumber,
    }
}
