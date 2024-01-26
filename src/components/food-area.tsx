import { FC } from 'react'
import VersoCard from '@/src/assets/images/verso.jpg'
import Image from 'next/image'
import { useGameContext } from '@/src/providers/game.provider'
import { FoodIcon } from '@/src/components/svg-icons/food-icon'
import FoodAreaImg from '@/src/assets/images/foodArea.png'

export const FoodArea: FC = () => {
    const { hiddenFoods, amountOfFood } = useGameContext()
    return (
        <div className="flex justify-center w-full">
            <div className="self-center">
                {hiddenFoods.map((_, index) => {
                    return (
                        // biome-ignore lint: Here it is ok to base the key on the index
                        <div data-testid={`hidden-food-${index}`} className="mb-3 mr-2" key={index}>
                            <Image src={VersoCard} alt="Hidden Card" height={60} width={50} />
                        </div>
                    )
                })}
            </div>
            <div className="relative min-w-52 max-h-[80%]">
                <Image
                    src={FoodAreaImg}
                    alt={`Number of food on the food area: ${amountOfFood}`}
                    sizes="100vw"
                    style={{
                        width: '100%',
                        height: '80%',
                    }}
                />
                <div className="max-h-full flex absolute top-1/4 flex-wrap ml-10 mr-16">
                    {amountOfFood > 0 &&
                        [...Array(amountOfFood)].map((_, index) => { // biome-ignore lint: Here it is ok to base the key on the index
                            return <FoodIcon width="15%" height="15%" data-testid="food-element" key={index} />
                        })}
                </div>
            </div>
        </div>
    )
}
