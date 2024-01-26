import Link from 'next/link'

const linkClasses =
    'w-96 text-center px-4 py-1 text-4xl text-zinc-300 font-semibold rounded-lg border-4 border-zinc-300 hover:text-slate-950 hover:bg-zinc-300 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 basis-1/4 shrink'

export default function Home({ params }: { params: { lang: string } }) {
    return (
        <div className="flex flex-col h-screen justify-center">
            <div className="flex flex-col gap-4 items-center">
                <Link href={`/${params.lang}/games/create`} className={linkClasses}>
                    Create a game
                </Link>
                <Link href={`/${params.lang}/games/join`} className={linkClasses}>
                    Join a game
                </Link>
            </div>
        </div>
    )
}
