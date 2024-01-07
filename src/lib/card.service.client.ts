import { Card } from '@/src/models/card.model'
import { StaticImageData } from 'next/image'
import longNeck from '../assets/images/long-neck.jpg'
import fertile from '../assets/images/fertile.jpg'
import missingImage from '../assets/images/missing-image.jpg'
import { FeatureKey } from '@/src/enums/feature-key.enum'

export const getCardImage = (card: Card): StaticImageData => {
    switch (card.featureKey) {
        case FeatureKey.LONG_NECK:
            return longNeck
        case FeatureKey.FERTILE:
            return fertile
        default:
            return missingImage
    }
}
