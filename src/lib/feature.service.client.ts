import { FeatureKey } from '@/src/enums/feature-key.enum'

export const getFeatureDescription = (featureKey: FeatureKey): string => {
    switch (featureKey) {
        case FeatureKey.LONG_NECK:
            return 'Before revealing food cards, pick one food from the food stash (not the water plan).'
        case FeatureKey.FERTILE:
            return 'Before revealing food cards, this species population increases by one if there is food left in the water plan.'
        case FeatureKey.FORAGER:
            return 'Each time this species eats one or more Plants, it takes 1 additional Plant from the same source.'
        case FeatureKey.CARNIVORE:
            return 'This species must attack other species for food and it can never eat Plants.'
        case FeatureKey.CLIMBING:
            return 'A carnivore must have the Climbing feature to attack it.'
        case FeatureKey.DIGGER:
            return "This species can't be attacked if its food number equals its population."
        case FeatureKey.HERD:
            return 'A carnivore must have a superior population to attack it.'
        default:
            return ''
    }
}

export const getFeatureName = (featureKey: FeatureKey): string => {
    switch (featureKey) {
        case FeatureKey.LONG_NECK:
            return 'Long neck'
        case FeatureKey.FERTILE:
            return 'Fertile'
        case FeatureKey.FORAGER:
            return 'Forager'
        case FeatureKey.CARNIVORE:
            return 'Carnivore'
        case FeatureKey.CLIMBING:
            return 'Climbing'
        case FeatureKey.DIGGER:
            return 'Digger'
        case FeatureKey.HERD:
            return 'Herd'
        default:
            return ''
    }
}
