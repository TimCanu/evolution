import { Card } from '@/app/models/card'

export const getCards = async (): Promise<Card[]> => {
    const res = await fetch('http://localhost:3000/api/cards', { next: { revalidate: 1 } })
    return await res.json()
}
