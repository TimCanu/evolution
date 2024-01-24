import { FC } from 'react'
import VersoCard from '@/src/assets/images/verso.jpg'
import Image from 'next/image'
import { useGameContext } from '@/src/providers/game.provider'
import { FoodAreaIcon } from '@/src/components/svg-icons/food-area-icon'
import { FoodIcon } from '@/src/components/svg-icons/food-icon'

export const FoodArea: FC = () => {
    const { hiddenFoods, amountOfFood } = useGameContext()
    return (
        <div className="flex justify-center w-full">
            <div className="self-center">
                {hiddenFoods.map((_, index) => {
                    return (
                        <div data-testid={`hidden-food-${index}`} className="mb-3 mr-2" key={index}>
                            <Image src={VersoCard} alt="Hidden Card" height={60} width={50} />
                        </div>
                    )
                })}
            </div>
            <div className="relative min-w-52 max-h-[80%]">
                <FoodAreaIcon amountOfFood={amountOfFood} />
                <div className="max-h-full flex absolute top-1/4 flex-wrap ml-10 mr-16">
                    {amountOfFood > 0 &&
                        [...Array(amountOfFood)].map((_, index) => {
                            return (
                                <FoodIcon width="15%" height="15%" data-testid="food-element" key={index} />
                            )
                        })}
                </div>
            </div>
        </div>
    )
}
