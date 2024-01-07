'use client'
import { createGame } from '@/src/lib/game.service'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function Home() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const nbOfPlayers = Number(event.currentTarget.nbPlayers.value)
        const playerName = String(event.currentTarget.playerName.value)
        try {
            const { gameId, playerId } = await createGame({ nbOfPlayers, playerName })
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
                    disabled={isLoading}
                    type="submit"
                    className="w-96 text-center px-4 py-1 text-4xl text-zinc-300 font-semibold rounded-lg border-4 border-zinc-300 hover:text-slate-950 hover:bg-zinc-300 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 basis-1/4 shrink"
                >
                    New game
                </button>
            </form>
            {isLoading &&
                <div className="flex mt-10 text-2xl justify-center items-center">
                    <svg aria-hidden="true" role="status"
                         className="inline mr-2 w-6 h-6 animate-spin"
                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"></path>
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="#52525b"></path>
                    </svg>
                    Creating game...
                </div>
            }
        </div>
    )
}
