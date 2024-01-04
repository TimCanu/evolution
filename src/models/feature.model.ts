import { FeatureKey } from '@/src/enums/feature-key.enum'

export interface Feature {
    cardId: string
    key: FeatureKey
    name: string
    description: string
}
