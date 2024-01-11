import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { GameStatus } from '@/src/enums/game.events.enum'
import { expect, Page } from '@playwright/test'
import { Card } from '@/src/models/card.model'
import { assertNumberOfCards, getCardToDiscard } from '@/tests/utils/cards.util'

export const assertNumberOfSpecies = async (page: Page, numberOfSpecies: number): Promise<void> => {
    await expect(page.getByTestId(/species-*/)).toHaveCount(numberOfSpecies)
}

export const addSpeciesToTheLeft = async (
    page: Page,
    numberOfSpecies: number,
    numberOfCards: number,
    card: Card
): Promise<void> => {
    await assertNumberOfSpecies(page, numberOfSpecies)
    await assertNumberOfCards(page, numberOfCards)

    await page.getByRole('button', { name: 'Add a new species to the left' }).click()
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
