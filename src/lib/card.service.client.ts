import { StaticImageData } from 'next/image'
import longNeck from '../assets/images/long-neck.jpg'
import longNeckFeature from '../assets/images/long-neck-feature.jpg'
import fertile from '../assets/images/fertile.jpg'
import fertileFeature from '../assets/images/fertile-feature.jpg'
import forager from '../assets/images/forager.jpg'
import foragerFeature from '../assets/images/forager-feature.jpg'
import carnivore from '../assets/images/carnivore.jpg'
import carnivoreFeature from '../assets/images/carnivore-feature.jpg'
import missingImage from '../assets/images/missing-image.jpg'
import { FeatureKey } from '@/src/enums/feature-key.enum'

export const getCardImage = (featureKey: FeatureKey): StaticImageData => {
    switch (featureKey) {
        case FeatureKey.LONG_NECK:
            return longNeck
        case FeatureKey.FERTILE:
            return fertile
        case FeatureKey.FORAGER:
            return forager
        case FeatureKey.CARNIVORE:
            return carnivore
        default:
            return missingImage
    }
}

export const getFeatureImage = (featureKey: FeatureKey): StaticImageData => {
    switch (featureKey) {
        case FeatureKey.LONG_NECK:
            return longNeckFeature
        case FeatureKey.FERTILE:
            return fertileFeature
        case FeatureKey.FORAGER:
            return foragerFeature
        case FeatureKey.CARNIVORE:
            return carnivoreFeature
        default:
            return missingImage
    }
}
