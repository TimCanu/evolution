import { FeatureKey } from '@/src/enums/feature-key.enum'

export interface Card {
    id: string
    featureKey: FeatureKey
    foodNumber: number
}
