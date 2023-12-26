import { NextResponse } from 'next/server'
import { Feature } from '@/app/models/feature'
import { Card } from '@/app/models/card'
import { v4 as uuidv4 } from 'uuid'
import { Game } from '@/app/models/game'
import { NextRequest } from 'next/server.js'
import clientPromise from '@/app/lib/mongodb'

const NB_OF_CARDS_PER_FEATURE = 2

export const POST = async (request: NextRequest) => {
    try {
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const featuresAsDocuments = await db.collection('features').find({}).toArray()
        const features: Feature[] = JSON.parse(JSON.stringify(featuresAsDocuments))

        const resultingCards = features.reduce((cards: Card[], feature: Feature) => {
            for (let nbOfCard = 0; nbOfCard < NB_OF_CARDS_PER_FEATURE; nbOfCard++) {
                const foodNumber = Math.floor(Math.random() * (8 - -2 + 1) + -2)
                const card: Card = { id: uuidv4(), name: feature.name, description: feature.description, foodNumber }
                cards.push(card)
            }
            return cards
        }, [])

        const game: Game = { cards: resultingCards }

        const res = await db.collection('games').insertOne(game)
        const { insertedId } = JSON.parse(JSON.stringify(res))
        return NextResponse.json({ gameId: insertedId }, { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
