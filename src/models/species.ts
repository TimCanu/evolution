import { Feature } from '@/src/models/feature'

export interface Species {
    id: string
    size: number
    population: number
    features: Feature[]
}
