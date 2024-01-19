import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import { createGame } from '@/tests/utils/game.util'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'

test('Forager card should increase fed population by two', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(51)
    const foragerFeature: Feature = {
        cardId: 'foragerCardId',
        name: 'Forager',
        key: FeatureKey.FORAGER,
        description: 'Forager description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Species1',
                size: 1,
                population: 3,
                features: [foragerFeature],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        cards: [],
        status: GameStatus.FEEDING_SPECIES,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FEED,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 3`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 1`)).toBeVisible()

    await firstPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).click()
    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 2 / 3`)).toBeVisible()

    await secondPlayerPage.getByRole('button', { name: 'Feed plants to this species' }).click()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 1 / 1`)).toBeVisible()
})
