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
            <div className="relative">
                <Image
                    src={FoodAreaImg}
                    alt={`Number of food on the food area: ${amountOfFood}`}
                    sizes="100vw"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
                <div className="max-h-full flex absolute top-1/4 flex-wrap ml-10 mr-16">
                    {amountOfFood > 0 &&
                        [...Array(amountOfFood)].map((_, index) => {
                            return (
                                <>
                                    <div data-testid="food-element" key={index} />
                                    <Image
                                        src={FoodPlantImg}
                                        alt=""
                                        sizes="7vw"
                                        style={{
                                            width: '20%',
                                        }}
                                    />
                                </>
                            )
                        })}
                </div>
            </div>
        </>
    )
}
