'use client'
import { joinGame } from '@/src/lib/game.service'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import LoadingSpinner from '@/src/components/loading'

export default function Home() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const gameId = String(event.currentTarget.gameId.value)
        const playerName = String(event.currentTarget.playerName.value)
        try {
            const { playerId } = await joinGame({ playerName, gameId })
            router.push(`/games/${gameId}?playerId=${playerId}`)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen justify-center items-center">
            <form onSubmit={onSubmit} className="flex flex-col gap-4 justify-center">
                <div className="flex flex-row gap-4 text-xl justify-between">
                    <label htmlFor="playerName">Your name:</label>
                    <input type="text" name="playerName" className="text-black w-48" />
                </div>
                <div className="flex flex-row gap-4 text-xl justify-between">
                    <label htmlFor="gameId">Game code:</label>
                    <input type="text" name="gameId" className="text-black w-48" />
                </div>
                <button
                    type="submit"
                    className="w-96 text-center px-4 py-1 text-4xl text-zinc-300 font-semibold rounded-lg border-4 border-zinc-300 hover:text-slate-950 hover:bg-zinc-300 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 basis-1/4 shrink"
                >
                    Join game
                </button>
            </form>
            {isLoading && <LoadingSpinner label="Joining game..."></LoadingSpinner>}
        </div>
    )
}
