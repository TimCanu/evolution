import { expect, test } from '@playwright/test'
import { ObjectId } from 'mongodb'
import {
    checkOpponentSpecies,
    checkOpponentStatus,
    checkPlayerInitialLayout,
    createPlayer1,
    createPlayer2,
    finishTurnEvolvingAndWaitForOthersToEvolve,
    finishTurnEvolvingAndWaitForOthersToFeed,
} from '@/tests/utils/player.util'
import { addCardAsFood } from '@/tests/utils/cards.util'
import {
    addSpeciesFeature,
    addSpeciesToTheLeft,
    addSpeciesToTheRight,
    feedLastSpecies,
    feedSpecies,
    increaseSpeciesPopulation,
    increaseSpeciesSize,
} from '@/tests/utils/species.util'
import { assertNumberOfFoodInWaterPlan, assertNumberOfHiddenFood } from '@/tests/utils/food.util'
import { createGame } from '@/tests/utils/game.util'
import { GameStatus } from '@/src/enums/game.events.enum'
import { PlayerEntity } from '@/src/models/player-entity.model'
import { FeatureKey } from '@/src/enums/feature-key.enum'
import { Feature } from '@/src/models/feature.model'

test('Fertile card should increase population when there is food left', async ({ page: firstPlayerPage }) => {
    const gameId = ObjectId.createFromTime(2)
    const fertileFeature: Feature = {
        cardId: 'fertileCardId',
        name: 'Fertile',
        key: FeatureKey.FERTILE,
        description: 'Fertile card description',
    }
    const firstPlayer: PlayerEntity = {
        id: 'player1',
        name: 'Aude',
        species: [
            {
                id: 'player1Species1',
                size: 1,
                population: 1,
                features: [fertileFeature],
                foodEaten: 0,
                preyIds: [],
            },
        ],
        cards: [],
        status: GameStatus.CHOOSING_EVOLVING_ACTION,
        newSpeciesList: [],
        numberOfFoodEaten: 0,
    }
    const secondPlayer: PlayerEntity = {
        id: 'player2',
        name: 'Tim',
        species: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        cards: [],
        status: GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING,
        newSpeciesList: [{ id: 'player2Species1', size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
        numberOfFoodEaten: 0,
    }
    await createGame(gameId, firstPlayer, secondPlayer, 10)

    await firstPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${firstPlayer.id}`)
    const secondPlayerPage = await firstPlayerPage.context().newPage()
    await secondPlayerPage.goto(`http://localhost:3000/games/${gameId}?playerId=${secondPlayer.id}`)

    await expect(firstPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await expect(secondPlayerPage.getByLabel(`Species at index 0 population: 1`)).toBeVisible()
    await firstPlayerPage.getByRole('button', { name: 'Finish turn' }).click()

    await expect(secondPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 1`)).toBeVisible()
    await expect(firstPlayerPage.getByLabel(`Species at index 0 fed population: 0 / 2`)).toBeVisible()
})
