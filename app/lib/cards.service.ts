import { Card } from '@/app/models/card'

export const getCards = async (): Promise<Card[]> => {
    // We get the data from the route we created and we make the cache last for only 1s
    const res = await fetch('http://localhost:3000/api/cards', { next: { revalidate: 1 } })
    return await res.json()
}
