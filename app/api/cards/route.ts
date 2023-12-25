import clientPromise from '../../lib/mongodb'
import { NextResponse } from 'next/server'

export const GET = async () => {
    try {
        const client = await clientPromise
        const db = client.db(process.env.DATABASE_NAME)

        const features = await db.collection('features').find({}).toArray()

        return NextResponse.json(JSON.parse(JSON.stringify(features)), { status: 200 })
    } catch (e) {
        console.error(e)
    }
}
