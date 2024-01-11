import { expect, test } from '@playwright/test'
import clientPromise from '@/src/lib/mongodb'
import { GameEntity } from '@/src/models/game-entity.model'
import { ObjectId } from 'mongodb'
import {
    hoverCard,
    checkFirstPlayerInitialLayout,
    createPlayer1,
    createPlayer2,
    addCardAsFood,
} from '@/tests/utils/player.util'

test('should be able to play a game round with 2 players', async ({ page: firstPlayerPage }) => {
    const dbClient = await clientPromise
    const db = dbClient.db(process.env.DATABASE_NAME)
    const gameId = ObjectId.createFromTime(1)
    await db.collection('games').deleteOne({ _id: gameId })

    const firstPlayer = createPlayer1()
    const secondPlayer = createPlayer2()

    const game: GameEntity = {
        _id: gameId,
        remainingCards: [],
        nbOfPlayers: 2,
        players: [firstPlayer, secondPlayer],
        hiddenFoods: [],
        amountOfFood: 0,
        firstPlayerToFeedId: firstPlayer.id,
    }
    await db.collection('games').insertOne(game)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await checkFirstPlayerInitialLayout(firstPlayerPage)

    await expect(secondPlayerPage.getByText('Aude')).toBeVisible()
    await expect(secondPlayerPage.getByAltText('The player Aude is the first player to feed')).toBeVisible()
    await expect(secondPlayerPage.getByTestId('card-3')).toBeVisible()
    await expect(secondPlayerPage.getByTestId('card-4')).not.toBeAttached()
    await expect(secondPlayerPage.getByText('Discard a card to add food to')).toBeVisible()

    await hoverCard(firstPlayerPage, firstPlayer.cards[0])

    await expect(secondPlayerPage.getByTestId('hidden-food-0')).not.toBeAttached()
    await addCardAsFood(firstPlayerPage, 1, 0, 4)
    await expect(secondPlayerPage.getByTestId('hidden-food-0')).toBeVisible()

    await firstPlayerPage.getByRole('button', { name: 'Add a new species to the left' }).click()
    await expect(firstPlayerPage.getByRole('button', { name: 'Discard card' })).toBeHidden()
    await firstPlayerPage.getByText('Fertile card description').hover()

    await expect(firstPlayerPage.getByRole('button', { name: 'Discard card' })).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-0')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-1')).not.toBeAttached()
    await firstPlayerPage.getByRole('button', { name: 'Discard card' }).click()

    await expect(firstPlayerPage.getByRole('button', { name: 'Increase size of species at position 1' })).toBeVisible()
    await expect(
        firstPlayerPage.getByRole('button', { name: 'Increase population of species at position 1' })
    ).toBeVisible()
    await expect(firstPlayerPage.getByRole('button', { name: 'Add feature to species at position 1' })).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-1')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('card-1')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('card-2')).not.toBeAttached()
    await firstPlayerPage.getByRole('button', { name: 'Increase size of species at position 1' }).click()

    await expect(firstPlayerPage.getByRole('button', { name: 'Discard card' })).toBeHidden()
    await firstPlayerPage.getByText('Forager card description').hover()
    await expect(firstPlayerPage.getByRole('button', { name: 'Discard card' })).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-1')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('species-2')).not.toBeAttached()
    await firstPlayerPage.getByRole('button', { name: 'Discard card' }).click()

    await expect(firstPlayerPage.getByTestId('species-0')).toHaveText('2 1')
    await expect(firstPlayerPage.getByTestId('species-2')).not.toBeAttached()
    await expect(firstPlayerPage.getByTestId('card-0')).toBeVisible()
    await expect(firstPlayerPage.getByTestId('card-1')).not.toBeAttached()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(firstPlayerPage.getByRole('button', { name: 'Finish turn' })).not.toBeAttached()
    await expect(
        firstPlayerPage.getByRole('button', { name: 'Increase size of species at position 1' })
    ).not.toBeAttached()
    await expect(
        firstPlayerPage.getByRole('button', { name: 'Increase population of species at position 1' })
    ).not.toBeAttached()
    await expect(
        firstPlayerPage.getByRole('button', { name: 'Add feature to species at position 1' })
    ).not.toBeAttached()
    await expect(firstPlayerPage.getByRole('button', { name: 'Add a new species to the left' })).not.toBeAttached()
    await expect(firstPlayerPage.getByRole('button', { name: 'Add a new species to the right' })).not.toBeAttached()
    await expect(firstPlayerPage.getByText('Waiting for other players to finish evolving')).toBeVisible()
})
