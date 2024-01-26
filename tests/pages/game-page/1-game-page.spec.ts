import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import {
    checkOpponentSpecies,
    checkOpponentStatus,
    checkPlayerInitialLayout,
    createPlayer1,
    createPlayer2,
    finishTurnEvolvingAndWaitForOthersToEvolve,
    finishTurnEvolvingAndWaitForOthersToFeed
} from '@/tests/utils/player.util'
import { addCardAsFood } from '@/tests/utils/cards.util'
import {
    addSpeciesFeature,
    addSpeciesToTheLeft,
    addSpeciesToTheRight,
    feedLastSpecies,
    feedSpecies,
    increaseSpeciesPopulation,
    increaseSpeciesSize
} from '@/tests/utils/species.util'
import { assertNumberOfFoodInWaterPlan, assertNumberOfHiddenFood } from '@/tests/utils/food.util'
import { createGame } from '@/tests/utils/game.util'

test('should be able to play a game round with 2 players', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(11)
    const firstPlayer = createPlayer1()
    const secondPlayer = createPlayer2()
    await createGame(gameId, firstPlayer, secondPlayer, 0)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await checkPlayerInitialLayout(firstPlayerPage, 'Tim', true)
    await expect(firstPlayerPage.getByLabel('You are the first player to feed')).toBeVisible()
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
    await checkOpponentStatus(firstPlayerPage, 1, false, secondPlayer.name)
    await checkOpponentStatus(secondPlayerPage, 0, true, firstPlayer.name)

    await feedSpecies(firstPlayerPage, 0, 1, 0)
    await expect(firstPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await checkOpponentStatus(firstPlayerPage, 1, true, secondPlayer.name)
    await checkOpponentStatus(secondPlayerPage, 1, false, firstPlayer.name)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 4)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 4)

    await feedSpecies(secondPlayerPage, 0, 1, 0)
    await expect(secondPlayerPage.getByText('Waiting for other players to feed')).toBeVisible()
    await checkOpponentStatus(firstPlayerPage, 2, false, secondPlayer.name)
    await checkOpponentStatus(secondPlayerPage, 1, true, firstPlayer.name)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 3)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 3)

    await feedSpecies(firstPlayerPage, 1, 2, 0)
    await expect(firstPlayerPage.getByText('Choose the species you would like to feed')).toBeVisible()
    await checkOpponentStatus(firstPlayerPage, 2, false, secondPlayer.name)
    await checkOpponentStatus(secondPlayerPage, 2, true, firstPlayer.name)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 2)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 2)

    await feedLastSpecies(firstPlayerPage, 1, 2, 1)
    await checkOpponentStatus(firstPlayerPage, 2, false, secondPlayer.name)
    await checkOpponentStatus(secondPlayerPage, 3, false, firstPlayer.name)
    await assertNumberOfFoodInWaterPlan(firstPlayerPage, 1)
    await assertNumberOfFoodInWaterPlan(secondPlayerPage, 1)

    await expect(firstPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()
    await expect(secondPlayerPage.getByText('Discard a card to add food to the water plan')).toBeVisible()

    await expect(firstPlayerPage.getByLabel('The player Tim is the first player to feed')).toBeVisible()
})
