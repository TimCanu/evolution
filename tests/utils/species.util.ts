import { expect, Page } from '@playwright/test'
import { Card } from '@/src/models/card.model'
import { assertNumberOfCards, getCardToDiscard } from '@/tests/utils/cards.util'

export const assertNumberOfSpecies = async (page: Page, numberOfSpecies: number): Promise<void> => {
    await expect(page.getByTestId(/species-*/)).toHaveCount(numberOfSpecies)
}

export const assertSpeciesFoodEaten = async (
    page: Page,
    speciesIndex: number,
    population: number,
    foodEaten: number
): Promise<void> => {
    await expect(page.getByTestId(`species-${speciesIndex}`).getByText(`${foodEaten} / ${population}`)).toBeVisible()
}

export const assertNumberOfFeatures = async (
    page: Page,
    numberOfFeatures: number,
    speciesIndex: number
): Promise<void> => {
    const regex = new RegExp('s-' + speciesIndex + '-feature-*')
    await expect(page.getByTestId(regex)).toHaveCount(numberOfFeatures)
}

const addSpecies = async (
    page: Page,
    numberOfSpecies: number,
    numberOfCards: number,
    card: Card,
    buttonLabel: string
): Promise<void> => {
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards)

    await page.getByRole('button', { name: buttonLabel }).click()
    await expect(page.getByRole('button', { name: 'Discard card' })).toBeHidden()

    const cardToHover = await getCardToDiscard(page, card)
    await cardToHover.hover()
    await page.getByRole('button', { name: 'Discard card' }).click()

    await expect(page.getByRole('button', { name: 'Discard card' })).not.toBeVisible()
    await assertNumberOfSpecies(page, numberOfSpecies + 1)
    await assertNumberOfCards(page, numberOfCards - 1)
    await expect(page.getByRole('button', { name: 'Increase size of species at position 1' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Increase population of species at position 1' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add feature to species at position 1' })).toBeVisible()
}

export const addSpeciesToTheLeft = async (
    page: Page,
    numberOfSpecies: number,
    numberOfCards: number,
    card: Card
): Promise<void> => {
    await addSpecies(page, numberOfSpecies, numberOfCards, card, 'Add a new species to the left')
}

export const addSpeciesToTheRight = async (
    page: Page,
    numberOfSpecies: number,
    numberOfCards: number,
    card: Card
): Promise<void> => {
    await addSpecies(page, numberOfSpecies, numberOfCards, card, 'Add a new species to the right')
}

export const addSpeciesFeature = async (
    page: Page,
    speciesIndex: number,
    numberOfSpecies: number,
    numberOfCards: number,
    featureToAdd: Card
): Promise<void> => {
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards)
    await assertNumberOfFeatures(page, 0, speciesIndex)
    await page.getByRole('button', { name: `Add feature to species at position ${speciesIndex + 1}` }).click()
    await expect(page.getByRole('button', { name: 'Discard card' })).toBeHidden()

    const cardToHover = await getCardToDiscard(page, featureToAdd)
    await cardToHover.hover()

    await page.getByRole('button', { name: 'Discard card' }).click()

    await expect(page.getByRole('button', { name: 'Discard card' })).not.toBeVisible()
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards - 1)
    await expect(page.getByTestId(`species-${speciesIndex}`)).toHaveText('1 1')
    await assertNumberOfFeatures(page, 1, speciesIndex)
}

export const increaseSpeciesSize = async (
    page: Page,
    speciesIndex: number,
    numberOfSpecies: number,
    numberOfCards: number,
    cardToDiscard: Card
): Promise<void> => {
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards)
    await page.getByRole('button', { name: `Increase size of species at position ${speciesIndex + 1}` }).click()
    await expect(page.getByRole('button', { name: 'Discard card' })).toBeHidden()

    const cardToHover = await getCardToDiscard(page, cardToDiscard)
    await cardToHover.hover()

    await page.getByRole('button', { name: 'Discard card' }).click()

    await expect(page.getByRole('button', { name: 'Discard card' })).not.toBeVisible()
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards - 1)
    await expect(page.getByTestId(`species-${speciesIndex}`)).toHaveText('2 1')
}

export const increaseSpeciesPopulation = async (
    page: Page,
    speciesIndex: number,
    numberOfSpecies: number,
    numberOfCards: number,
    cardToDiscard: Card
): Promise<void> => {
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards)
    await page.getByRole('button', { name: `Increase population of species at position ${speciesIndex + 1}` }).click()
    await expect(page.getByRole('button', { name: 'Discard card' })).toBeHidden()

    const cardToHover = await getCardToDiscard(page, cardToDiscard)
    await cardToHover.hover()

    await page.getByRole('button', { name: 'Discard card' }).click()

    await expect(page.getByRole('button', { name: 'Discard card' })).not.toBeVisible()
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards - 1)
    await expect(page.getByTestId(`species-${speciesIndex}`)).toHaveText('2 2')
}

export const feedSpecies = async (
    page: Page,
    speciesIndex: number,
    numberOfSpeciesNotFed: number,
    speciesPopulation: number,
    speciesFoodEaten: number
): Promise<void> => {
    await assertSpeciesFoodEaten(page, speciesIndex, speciesPopulation, speciesFoodEaten)
    await expect(page.getByText('Choose the species you would like to feed')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Feed plants to this species' })).toHaveCount(numberOfSpeciesNotFed)
    await page.getByTestId(`species-${speciesIndex}`).getByRole('button', { name: 'Feed plants to this species' }).click()
    await assertSpeciesFoodEaten(page, speciesIndex, speciesPopulation, speciesFoodEaten + 1)
}

export const feedLastSpecies = async (
    page: Page,
    speciesIndex: number,
    numberOfSpeciesNotFed: number,
    speciesPopulation: number,
    speciesFoodEaten: number
): Promise<void> => {
    await assertSpeciesFoodEaten(page, speciesIndex, speciesPopulation, speciesFoodEaten)
    await expect(page.getByText('Choose the species you would like to feed')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Feed plants to this species' })).toHaveCount(numberOfSpeciesNotFed)
    await page.getByTestId(`species-${speciesIndex}`).getByRole('button', { name: 'Feed plants to this species' }).click()
}
