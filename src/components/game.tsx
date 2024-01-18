'use client'

import { OpponentLayout } from '@/src/components/opponent-layout'
import { FoodArea } from '@/src/components/food-area'
import { CardLayout } from '@/src/components/card-layout'
import { SpeciesLayout } from '@/src/components/species-layout'
import { useSpecies } from '@/src/hooks/species.hook'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { useCards } from '@/src/hooks/cards.hook'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { addFood } from '@/src/lib/foods.service'
import { updatePlayer } from '@/src/lib/player.service.client'
import { Game as GameModel } from '@/src/models/game.model'
import { Player } from '@/src/models/player.model'
import { GameStatus } from '../enums/game.events.enum'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import playerTurnDino from '../assets/images/player-turn-dyno.png'
import Image from 'next/image'
import { useGameContext } from '@/src/providers/game.provider'

interface GameProps {
    game: GameModel
}

export function Game({ game }: GameProps) {
    const searchParams = useSearchParams()
    const { gameId } = useParams<{ gameId: string }>()
    const playerId = useMemo(() => searchParams.get('playerId'), [searchParams])

    if (!playerId) {
        throw Error('Player ID must be provided')
    }
    const {
        cards,
        hiddenFoods,
        isPlayerFeedingFirst,
        numberOfFoodEaten,
        opponents,
        speciesList,
        updateCards,
        updateStatus,
    } = useGameContext()
    const { isAddingFoodStage, isEvolvingStage, isFeedingStage, getCardDiscardMessage } = usePlayerStatus()
    const { playEvolvingAction } = useSpecies()
    const { getCard, removeCard } = useCards()

    const playCard = async (cardId: string): Promise<void> => {
        const card = getCard(cardId)
        if (isAddingFoodStage()) {
            const { status, cards: cardsUpdated } = await addFood({ gameId, playerId, cardId })
            updateStatus(status)
            updateCards(cardsUpdated)
        } else if (isEvolvingStage()) {
            playEvolvingAction(card)
        } else if (isFeedingStage()) {
            console.log('Action is not supported yet')
        }
        removeCard(cardId)
    }

    const finishEvolvingStage = async (): Promise<void> => {
        const player: Player = { ...game.player, species: speciesList, cards }
        await updatePlayer({ gameId, player })
    }

    useEffect(() => {
        return () => {
            PusherInstance.unsubscribeToAllChannels()
        }
    }, [gameId, playerId])

    return (
        <div className="grid grid-rows-4 min-h-[100vh] max-h-[100vh]">
            <ul aria-label="Opponents" className="mt-1 row-span-1 flex flex-row justify-around">
                {opponents.map((opponent, index) => {
                    return <OpponentLayout key={index} opponentIndex={index} opponent={opponent} />
                })}
            </ul>
            <div className="flex justify-center row-span-1">
                <FoodArea />
            </div>
            <div className="mb-1 row-span-2 flex flex-col self-end h-full justify-end">
                <ul className="flex flex-row justify-center ">
                    {speciesList.map((species, index) => {
                        const isFirstSpecies = index === 0
                        const isLastSpecies = index === speciesList.length - 1
                        return (
                            <SpeciesLayout
                                key={index}
                                index={index}
                                canShowAddSpeciesLeftButton={isFirstSpecies}
                                canShowAddSpeciesRightButton={isLastSpecies}
                                species={species}
                                gameId={gameId}
                                playerId={playerId}
                            />
                        )
                    })}
                </ul>
                {isEvolvingStage() && (
                    <button
                        className="my-4 bg-cyan-500 border bg-color-white w-36 self-center"
                        onClick={finishEvolvingStage}
                    >
                        Finish turn
                    </button>
                )}
                <div role="status" className="self-center flex">
                    {isPlayerFeedingFirst && (
                        <Image src={playerTurnDino} alt="You are the first player to feed" height={48} width={48} />
                    )}
                    <p className="flex flex-col">
                        <span>{getCardDiscardMessage()}</span>
                        <span>Your number of points: {numberOfFoodEaten}</span>
                    </p>
                </div>
                <ul className="flex flex-row justify-center h-56 items-end">
                    {cards.map((card, index) => {
                        return <CardLayout key={index} index={index} card={card} playCard={playCard} />
                    })}
                </ul>
            </div>
        </div>
    )
}
