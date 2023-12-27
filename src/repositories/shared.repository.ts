import clientPromise from '@/src/lib/mongodb'
import { Db } from 'mongodb'

export const getDb = async (): Promise<Db> => {
    const client = await clientPromise
    return client.db(process.env.DATABASE_NAME)
}
