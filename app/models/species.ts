import { Feature } from '@/app/models/feature'

export interface Species {
    id: string
    size: number
    population: number
    features: Feature[]
}
