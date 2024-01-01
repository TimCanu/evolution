'use client'

import { OpponentLayout } from '@/src/components/opponent-layout'
import { FoodArea } from '@/src/components/food-area'
import { CardLayout } from '@/src/components/card-layout'
import { SpeciesLayout } from '@/src/components/species-layout'
import { useSpeciesContext } from '@/src/providers/species.provider'
import { usePlayerActionsContext } from '@/src/providers/player-actions.provider'
import { useCardsContext } from '@/src/providers/cards.provider'
import { useOpponentsContext } from '@/src/providers/opponents.provider'
import { useParams, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { addFood } from '@/src/lib/foods.service'
import { updatePlayer } from '@/src/lib/player.service'
import { Game as GameModel } from '@/src/models/game.model'
import { Player } from '@/src/models/player.model'
import { useFoodsContext } from '../providers/foods.provider'
import { GameStatus } from '../enums/game.events.enum'

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
    const { opponents } = useOpponentsContext()
    const { isAddingFoodStage, isEvolvingStage, isFeedingStage, getCardDiscardMessage, updatePlayerState } =
        usePlayerActionsContext()
    const { speciesList, playEvolvingAction } = useSpeciesContext()
    const { cards, getCard, removeCard } = useCardsContext()
    const { hiddenFoods } = useFoodsContext()

    const playCard = async (cardId: string): Promise<void> => {
        const card = getCard(cardId)
        if (isAddingFoodStage()) {
            await addFood({ gameId, playerId, cardId })
        } else if (isEvolvingStage()) {
            playEvolvingAction(card)
        } else if (isFeedingStage()) {
            console.log('Action is not supported yet')
        }
        removeCard(cardId)
    }

    const finishEvolvingStage = async (): Promise<void> => {
        const player: Player = { ...game.player, species: speciesList, cards }
        const { gameStatus } = await updatePlayer({ gameId, player })
        updatePlayerState({ action: gameStatus })
        if (hiddenFoods.length <= 0) {
            updatePlayerState({ action: GameStatus.ADDING_FOOD_TO_WATER_PLAN })
        }
    }

    return (
        <div className="grid grid-rows-4 min-h-[100vh] max-h-[100vh]">
            <div className="mt-1 row-span-1 flex flex-row justify-around">
                {opponents.map((opponent, index) => {
                    return <OpponentLayout key={index} name={opponent.name} />
                })}
            </div>
            <div className="flex justify-center row-span-1">
                <FoodArea />
            </div>
            <div className="mb-1 row-span-2 flex flex-col self-end h-full justify-end">
                <div className="flex flex-row justify-center ">
                    {speciesList.map((species, index) => {
                        const isFirstSpecies = index === 0
                        const isLastSpecies = index === speciesList.length - 1
                        return (
                            <SpeciesLayout
                                key={index}
                                canShowAddSpeciesLeftButton={isFirstSpecies}
                                canShowAddSpeciesRightButton={isLastSpecies}
                                species={species}
                                gameId={gameId}
                                playerId={playerId}
                            />
                        )
                    })}
                </div>
                {isEvolvingStage() && (
                    <button
                        className="my-4 bg-cyan-500 border bg-color-white w-36 self-center"
                        onClick={finishEvolvingStage}
                    >
                        Finish turn
                    </button>
                )}
                <p className="self-center ">{getCardDiscardMessage()}</p>
                <div className="flex flex-row justify-center h-56 items-end">
                    {cards.map((card, index) => {
                        return <CardLayout key={index} card={card} playCard={playCard} />
                    })}
                </div>
            </div>
        </div>
    )
}
