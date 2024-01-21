import { FC } from 'react'
import FoodSpecies from '@/src/assets/images/water-lily.png'
import Image from 'next/image'

export const FeedPlantsIcon: FC = () => {
    return <Image src={FoodSpecies} alt="" height={30} width={30} />
}
