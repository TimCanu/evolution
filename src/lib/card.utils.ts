import { Card } from '@/src/models/card.model'

// This method has been copied from
// https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
export const shuffleCards = (cards: Card[]): Card[] => {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = cards[i]
        cards[i] = cards[j]
        cards[j] = temp
    }
    return cards
}
