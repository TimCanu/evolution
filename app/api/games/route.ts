import { NextResponse } from 'next/server'
import { Feature } from '@/src/models/feature.model'
import { Card } from '@/src/models/card.model'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest } from 'next/server.js'
import { CreateGameEntity } from '@/src/models/game-entity.model'
import { GameStatus } from '@/src/enums/game.events.enum'
import { shuffleCards } from '@/src/lib/card.service.server'
import { getDb } from '@/src/repositories/shared.repository'
import { PlayerEntity } from '@/src/models/player-entity.model'

const NB_OF_CARDS_PER_FEATURE = 11

export const POST = async (request: NextRequest) => {
    try {
        const data: { nbOfPlayers: number; playerName: string } = await request.json()
        const db = await getDb()

        const featuresAsDocuments = await db.collection('features').find({}).toArray()
        const features: Feature[] = JSON.parse(JSON.stringify(featuresAsDocuments))

        const resultingCards = features.reduce((cards: Card[], feature: Feature) => {
            for (let nbOfCard = 0; nbOfCard < NB_OF_CARDS_PER_FEATURE; nbOfCard++) {
                const foodNumber = Math.floor(Math.random() * (8 - -2 + 1) + -2)
                const card: Card = {
                    id: uuidv4(),
                    featureKey: feature.key,
                    foodNumber,
                }
                cards.push(card)
            }
            return cards
        }, [])

        const shuffledCards = shuffleCards(resultingCards)

        const playerId = uuidv4()
        const firstPlayerCards = [...Array(4)].map((_) => {
            const card = shuffledCards.pop()
            if (!card) {
                throw Error('No cards left... Maybe add some more in the DB?')
            }
            return card
        })

        const firstPlayer: PlayerEntity = {
            id: playerId,
            name: data.playerName,
            species: [{ id: uuidv4(), size: 1, population: 1, features: [], foodEaten: 0, preyIds: [] }],
            cards: firstPlayerCards,
            newSpeciesList: [],
            status:
                data.nbOfPlayers === 1 ? GameStatus.ADDING_FOOD_TO_WATER_PLAN : GameStatus.WAITING_FOR_PLAYERS_TO_JOIN,
            numberOfFoodEaten: 0,
        }
        const game: CreateGameEntity = {
            remainingCards: shuffledCards,
            nbOfPlayers: data.nbOfPlayers,
            players: [firstPlayer],
            hiddenFoods: [],
            amountOfFood: 0,
            firstPlayerToFeedId: playerId,
        }

        const res = await db.collection('games').insertOne(game)
        const { insertedId } = JSON.parse(JSON.stringify(res))
        return NextResponse.json({ gameId: insertedId, playerId }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
