'use client'
import { createGame } from '@/src/lib/game.service'
import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'

export default function Home() {
    const router = useRouter()

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nbOfPlayers = Number(event.currentTarget.nbPlayers.value)
        const playerName = String(event.currentTarget.playerName.value)
        const { gameId, playerId } = await createGame({ nbOfPlayers, playerName })
        router.push(`/games/${gameId}?playerId=${playerId}`)
    }

    return (
        <div className="flex flex-col h-screen justify-center items-center">
            <form onSubmit={onSubmit} className="flex flex-col gap-4 justify-center">
                <div className="flex flex-row gap-4 text-xl justify-between">
                    <label htmlFor="playerName">Your name:</label>
                    <input type="text" name="playerName" className="text-black w-40" />
                </div>
                <div className="flex flex-row gap-4 text-xl justify-between">
                    <label htmlFor="nbPlayers">Number of players:</label>
                    <input
                        type="number"
                        name="nbPlayers"
                        min="1"
                        max="6"
                        defaultValue="1"
                        className="text-black w-40"
                    />
                </div>
                <button
                    type="submit"
                    className="w-96 text-center px-4 py-1 text-4xl text-zinc-300 font-semibold rounded-lg border-4 border-zinc-300 hover:text-slate-950 hover:bg-zinc-300 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 basis-1/4 shrink"
                >
                    New game
                </button>
            </form>
        </div>
    )
}
