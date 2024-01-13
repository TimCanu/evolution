import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import {
    checkFirstPlayerInitialLayout,
    checkSecondPlayerInitialLayout,
    createPlayer1,
    createPlayer2,
    finishTurnEvolvingAndWaitForOthersToEvolve,
    finishTurnEvolvingAndWaitForOthersToFeed,
} from '@/tests/utils/player.util'
import { addCardAsFood } from '@/tests/utils/cards.util'
import {
    addSpeciesFeature,
    addSpeciesToTheLeft,
    addSpeciesToTheRight, feedSpecies,
    increaseSpeciesPopulation,
    increaseSpeciesSize,
} from '@/tests/utils/species.util'
import { assertNumberOfHiddenFood } from '@/tests/utils/food.util'
import { createGame } from '@/tests/utils/game.util'

test('should be able to play a game round with 2 players', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(1)
    const firstPlayer = createPlayer1()
    const secondPlayer = createPlayer2()
    await createGame(gameId, firstPlayer, secondPlayer)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await checkFirstPlayerInitialLayout(firstPlayerPage)
    await checkSecondPlayerInitialLayout(secondPlayerPage)

    await addCardAsFood(firstPlayerPage, 1, 0, 4, firstPlayer.cards[0])
    await assertNumberOfHiddenFood(secondPlayerPage, 1)

    await addSpeciesToTheLeft(firstPlayerPage, 1, 3, firstPlayer.cards[1])
    await increaseSpeciesSize(firstPlayerPage, 1, 2, 2, firstPlayer.cards[2])
    await increaseSpeciesPopulation(firstPlayerPage, 1, 2, 1, firstPlayer.cards[3])
    await finishTurnEvolvingAndWaitForOthersToEvolve(firstPlayerPage)

    await addCardAsFood(secondPlayerPage, 1, 1, 4, secondPlayer.cards[3])
    await assertNumberOfHiddenFood(firstPlayerPage, 2)

    await addSpeciesToTheRight(secondPlayerPage, 1, 3, secondPlayer.cards[1])
    await addSpeciesFeature(secondPlayerPage, 1, 2, 2, secondPlayer.cards[0])
    await finishTurnEvolvingAndWaitForOthersToFeed(secondPlayerPage)


    await expect(firstPlayerPage.getByTestId('species-1').getByText('0 / 2')).toBeVisible()
    await feedSpecies(firstPlayerPage, 0, 2, 1,0)


    await expect(secondPlayerPage.getByTestId('species-0').getByText('0 / 1')).toBeVisible()
    await expect(firstPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await feedSpecies(secondPlayerPage, 1, 2, 1,0)


    await expect(secondPlayerPage.getByTestId('species-0').getByText('0 / 1')).toBeVisible()
    await expect(secondPlayerPage.getByTestId('species-1').getByText('1 / 1')).toBeVisible()
    await expect(firstPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
    await expect(secondPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await expect(firstPlayerPage.getByRole('button', { name: 'Feed plants to this species' })).toHaveCount(1)
    await firstPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).click()
    await expect(firstPlayerPage.getByTestId('species-1').getByText('0 / 2')).toBeVisible()
    // await feedSpecies(firstPlayerPage, 0, 2, 2,0)


    await expect(firstPlayerPage.getByTestId('species-0').getByText('1 / 1')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-1').getByText('1 / 2')).toBeVisible()
    await expect(firstPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await expect(secondPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
    await expect(secondPlayerPage.getByRole('button', { name: 'Feed plants to this species' })).toHaveCount(1)
    await secondPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).nth(0).click()


    await expect(secondPlayerPage.getByTestId('species-0').getByText('1 / 1')).toBeVisible()
    await expect(secondPlayerPage.getByTestId('species-1').getByText('1 / 1')).toBeVisible()
    await expect(firstPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
    await expect(secondPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await expect(firstPlayerPage.getByRole('button', { name: 'Feed plants to this species' })).toHaveCount(1)
    await firstPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).click()

    await expect(firstPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to')).toBeVisible()
})
