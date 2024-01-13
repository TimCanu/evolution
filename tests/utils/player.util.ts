import { PlayerEntity } from '@/src/models/player-entity.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { expect, Page } from '@playwright/test'
import {
    assertNumberOfCards,
    buildCarnivoreCard,
    buildFertileCard,
    buildForagerCard,
    buildLongNeckCard,
} from '@/tests/utils/cards.util'
import { assertNumberOfSpecies } from '@/tests/utils/species.util'
import { assertNumberOfHiddenFood } from '@/tests/utils/food.util'

export const createPlayer1 = (): PlayerEntity => {
    return {
        id: 'player1',
        name: 'Aude',
        species: [{ id: 'specie1', size: 1, population: 1, features: [], foodEaten: 0 }],
        cards: [
            buildLongNeckCard('firstPlayerCard1', 4),
            buildFertileCard('firstPlayerCard2', 3),
            buildForagerCard('firstPlayerCard3', 2),
            buildCarnivoreCard('firstPlayerCard4', -1),
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
            buildLongNeckCard('secondPlayerCard1', 1),
            buildFertileCard('secondPlayerCard2', 1),
            buildForagerCard('secondPlayerCard3', 1),
            buildCarnivoreCard('secondPlayerCard4', 1),
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
    await expect(page.getByTestId('species-0').getByText('0 / 1')).toBeVisible()
    await expect(page.getByTestId('species-1').getByText('0 / 1')).toBeVisible()
}
