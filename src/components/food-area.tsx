import { FC } from 'react'
import { useFoodsContext } from '@/src/providers/foods.provider'
import FoodAreaImg from '@/src/assets/images/foodArea.png'
import Image from 'next/image'

export const FoodArea: FC = () => {
    const { hiddenFoods, amountOfFood } = useFoodsContext()
    return (
        <div className="relative self-center">
            <Image src={FoodAreaImg} alt="" height={150} />
            <div className="place-self-center flex flex-row absolute top-1/2 left-1/4 right-1/4 rounded-md">
                {hiddenFoods.map((_, index) => {
                    return <div data-testid={`hidden-food-${index}`} className="w-10 h-10 bg-sky-800 border mr-5" key={index} />
                })}
                {amountOfFood > 0 &&
                    [...Array(amountOfFood)].map((_, index) => {
                        return (
                            <div
                                data-testid="food-element"
                                className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center"
                                key={index}
                            />
                        )
                    })}
            </div>
        </div>
    )
}
