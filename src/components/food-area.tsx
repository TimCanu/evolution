import { FC } from 'react'
import FoodAreaImg from '@/src/assets/images/foodArea.png'
import FoodPlantImg from '@/src/assets/images/water-lily.png'
import VersoCard from '@/src/assets/images/verso.jpg'
import Image from 'next/image'
import { useGameContext } from '@/src/providers/game.provider'

export const FoodArea: FC = () => {
    const { hiddenFoods, amountOfFood } = useGameContext()
    return (
        <>
            <div className="self-center">
                {hiddenFoods.map((_, index) => {
                    return (
                        <div data-testid={`hidden-food-${index}`} className="mb-3 mr-2" key={index}>
                            <Image src={VersoCard} alt="Hidden Card" height={60} width={50} />
                        </div>
                    )
                })}
            </div>
            <div className="relative self-center top-10">
                <Image
                    src={FoodAreaImg}
                    alt={`Number of food on the food area: ${amountOfFood}`}
                    height={360}
                    width={360}
                />
                <div className="place-self-center flex flex-row absolute top-1/4 left-[5rem] right-[5rem] flex-wrap rounded-md">
                    {amountOfFood > 0 &&
                        [...Array(amountOfFood)].map((_, index) => {
                            return (
                                <>
                                    <div data-testid="food-element" key={index} />
                                    <Image src={FoodPlantImg} alt="" height={35} width={35} />
                                </>
                            )
                        })}
                </div>
            </div>
        </>
    )
}
