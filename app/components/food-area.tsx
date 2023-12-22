import { FC } from 'react'
import { useFoodsContext } from '@/app/providers/foods.provider'

export const FoodArea: FC = () => {
    const { hiddenFoods, amountOfFood } = useFoodsContext()
    return (
        <div className="place-self-center h-64 w-1/3 bg-cyan-500 rounded-[50%] flex flex-row">
            {hiddenFoods.map((_, index) => {
                return <div className="w-10 h-10 bg-sky-800 border mr-5" key={index} />
            })}
            {[...Array(amountOfFood)].map((_, index) => {
                return (
                    <div
                        className=" border border-indigo-600 bg-green-600 rounded-full w-8 h-8 flex justify-center items-center"
                        key={index}
                    />
                )
            })}
        </div>
    )
}
