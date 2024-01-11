import { test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import {
    checkFirstPlayerInitialLayout,
    checkSecondPlayerInitialLayout,
    createPlayer1,
    createPlayer2,
    finishTurnEvolving,
} from '@/tests/utils/player.util'
import { addCardAsFood } from '@/tests/utils/cards.util'
import { addSpeciesToTheLeft, increaseSpeciesSize } from '@/tests/utils/species.util'
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
    await finishTurnEvolving(firstPlayerPage)
})
