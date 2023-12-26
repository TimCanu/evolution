'use client'
import { createGame } from '@/app/lib/game.service'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    const startNewGame = async () => {
        const { gameId } = await createGame()
        router.push(`/games/${gameId}`)
    }

    return <button onClick={startNewGame}>New game</button>
}
