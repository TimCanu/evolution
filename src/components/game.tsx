'use client'

import { FoodArea } from '@/src/components/food-area'
import { CardLayout } from '@/src/components/card-layout'
import { SpeciesLayout } from '@/src/components/player-species/species-layout'
import { useSpecies } from '@/src/hooks/species.hook'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { useCards } from '@/src/hooks/cards.hook'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { addFood } from '@/src/lib/foods.service'
import { updatePlayer } from '@/src/lib/player.service.client'
import { Game as GameModel } from '@/src/models/game.model'
import { Player } from '@/src/models/player.model'
import { PusherInstance } from '@/src/lib/pusher.client.service'
import { useGameContext } from '@/src/providers/game.provider'
import { PlayerTurnDinoIcon } from '@/src/components/svg-icons/player-turn-icon'
import PouchImg from '@/src/assets/images/pouch.png'
import Image from 'next/image'
import { GameStatus } from '@/src/enums/game.events.enum'
import { AddLeftSpeciesButton } from '@/src/components/player-species/add-left-species-button'
import { AddRightSpeciesButton } from '@/src/components/player-species/add-right-species-button'
import { LeftOpponents } from '@/src/components/opponent/left-opponents'
import { RightOpponents } from '@/src/components/opponent/right-opponents'
import { MiddleOpponent } from '@/src/components/opponent/middle-opponent'
import { useTranslationClient } from '@/src/i18n/i18n.client'

interface GameProps {
    game: GameModel
}

export function Game({ game }: GameProps) {
    const { t } = useTranslationClient()
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
        updateStatus
    } = useGameContext()
    const { isAddingFoodStage, isEvolvingStage, isFeedingStage, getCardDiscardMessage } = usePlayerStatus()
    const { playEvolvingAction } = useSpecies()
    const { getCard, removeCard } = useCards()

    const playCard = async (cardId: string): Promise<void> => {
        const card = getCard(cardId)
        if (isAddingFoodStage()) {
            updateStatus(GameStatus.CHOOSING_EVOLVING_ACTION)
            const { status, cards: cardsUpdated } = await addFood({ gameId, playerId, cardId })
            updateStatus(status)
            updateCards(cardsUpdated)
        } else if (isEvolvingStage()) {
            updateStatus(GameStatus.WAITING_FOR_PLAYERS_TO_FINISH_EVOLVING)
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
    })

    const opponentsDisplay = opponents.length === 1 ? 'flex-col' : 'flex-row'

    return (
        <div className="grid grid-rows-2 overflow-hidden min-h-[100vh] max-h-[100vh]">
            <div className={`flex ${opponentsDisplay} justify-between mr-4`}>
                <LeftOpponents opponents={opponents} />
                <MiddleOpponent opponents={opponents} />
                <FoodArea />
                <RightOpponents opponents={opponents} />
            </div>
            <div className="mb-1 row-span-2 flex flex-col self-end h-full justify-end">
                <div className="flex self-center">
                    <AddLeftSpeciesButton />
                    <ul className="flex flex-row justify-center ">
                        {speciesList.map((species, index) => {
                            return (
                                <SpeciesLayout
                                    key={species.id}
                                    index={index}
                                    species={species}
                                    gameId={gameId}
                                    playerId={playerId}
                                />
                            )
                        })}
                    </ul>
                    <AddRightSpeciesButton />
                </div>
                {isEvolvingStage() && (
                    <button
                        type="button"
                        className="my-3 bg-teal-500 rounded w-36 self-center"
                        onClick={finishEvolvingStage}
                    >
                        Finish turn
                    </button>
                )}
                <div role="status" className="self-center flex">
                    {isPlayerFeedingFirst && <PlayerTurnDinoIcon ariaLabel={t('player-is-first-to-feed')} />}
                    <p className="flex flex-col">
                        <span>{getCardDiscardMessage()}</span>
                    </p>
                </div>
                <div className="flex justify-center">
                    <div>
                        <ul className="flex flex-row justify-center h-32 items-end">
                            {cards.map((card, index) => {
                                return <CardLayout key={card.id} index={index} card={card} playCard={playCard} />
                            })}
                        </ul>
                    </div>
                    <div className="relative self-center place-self-end w-16">
                        <Image src={PouchImg} alt={t('player-number-of-points', { numberOfFoodEaten })} />
                        <span className="absolute bottom-3 start-5 border rounded-full w-6 h-6 text-center">
                            {numberOfFoodEaten}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
