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
        newSpeciesList: [],
        numberOfFoodEaten: 0,
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
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
}

export const checkPlayerInitialLayout = async (
    page: Page,
    opponentName: string,
    isFirstPlayerToFeed: boolean
): Promise<void> => {
    await assertNumberOfCards(page, 4)
    await assertNumberOfSpecies(page, 1)
    await assertNumberOfHiddenFood(page, 0)

    const opponent = page.getByRole('list').nth(0).getByRole('listitem').nth(0)
    await expect(
        opponent.getByRole('heading').getByLabel(`Opponent's at index ${0} name is ${opponentName}`)
    ).toHaveText(opponentName)
    if (isFirstPlayerToFeed) {
        await expect(opponent.getByRole('heading').getByRole('img')).not.toBeAttached()
    } else {
        await expect(
            opponent
                .getByRole('heading')
                .getByRole('img', { name: `The player ${opponentName} is the first player to feed` })
        ).toBeVisible()
    }
    await expect(opponent.getByRole('status')).toHaveText('Number of points: 0')
    await checkOpponentSpecies(page, 0, 0, 1, 1)
    await expect(page.getByText('Discard a card to add food to the water plan')).toBeVisible()
}

export const checkOpponentStatus = async (page: Page, numberOfPoints: number, isFeeding: boolean): Promise<void> => {
    await expect(page.getByRole('list').nth(0).getByRole('listitem').nth(0).getByRole('status')).toHaveText(
        `Number of points: ${numberOfPoints}${isFeeding ? ' - Is feeding' : ''}`
    )
}

export const checkOpponentSpecies = async (
    page: Page,
    opponentIndex: number,
    speciesIndex: number,
    speciesSize: number,
    speciesPopulation: number
): Promise<void> => {
    await expect(
        page.getByLabel(`Species at index ${speciesIndex} of opponent at index ${opponentIndex} size: ${speciesSize}`)
    ).toHaveText(speciesSize.toString())
    await expect(
        page.getByLabel(
            `Species at index ${speciesIndex} of opponent at index ${opponentIndex} population: ${speciesPopulation}`
        )
    ).toHaveText(speciesPopulation.toString())
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
    await expect(page.getByTestId('species-1').getByText('1 / 1')).toBeVisible()
}
