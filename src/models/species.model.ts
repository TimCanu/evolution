import { Feature } from '@/src/models/feature.model'

export interface Species {
    id: string
    size: number
    population: number
    foodEaten: number
    features: Feature[]
}
