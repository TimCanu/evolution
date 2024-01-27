import { FeatureKey } from '@/src/enums/feature-key.enum'
import i18next from 'i18next'

export const getFeatureDescription = (featureKey: FeatureKey): string => {
    switch (featureKey) {
        case FeatureKey.LONG_NECK:
            return i18next.t('long-neck-description')
        case FeatureKey.FERTILE:
            return i18next.t('fertile-description')
        case FeatureKey.FORAGER:
            return i18next.t('forager-description')
        case FeatureKey.CARNIVORE:
            return i18next.t('carnivore-description')
        case FeatureKey.CLIMBING:
            return i18next.t('climbing-description')
        case FeatureKey.DIGGER:
            return i18next.t('digger-description')
        case FeatureKey.HERD:
            return i18next.t('herd-description')
        default:
            return ''
    }
}

export const getFeatureName = (featureKey: FeatureKey): string => {
    switch (featureKey) {
        case FeatureKey.LONG_NECK:
            return i18next.t('long-neck-name')
        case FeatureKey.FERTILE:
            return i18next.t('fertile-name')
        case FeatureKey.FORAGER:
            return i18next.t('forager-name')
        case FeatureKey.CARNIVORE:
            return i18next.t('carnivore-name')
        case FeatureKey.CLIMBING:
            return i18next.t('climbing-name')
        case FeatureKey.DIGGER:
            return i18next.t('digger-name')
        case FeatureKey.HERD:
            return i18next.t('herd-name')
        default:
            return ''
    }
}
