import { FeatureKey } from '@/src/enums/feature-key.enum'

export interface Card {
    id: string
    featureKey: FeatureKey
    name: string
    description: string
    foodNumber: number
}
