import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions } from '@/src/i18n/settings'

const initI18next = async (lng = "en") => {
    const i18nInstance = createInstance()
    await i18nInstance
        .use(initReactI18next)
        .use(resourcesToBackend((language: string) => import(`./locales/${language}/translation.json`)))
        .init(getOptions(lng))
    return i18nInstance
}

export async function useTranslation(lng: string) {
    const i18nextInstance = await initI18next(lng)
    return {
        t: i18nextInstance.getFixedT(lng,'translation'),
        i18n: i18nextInstance
    }
}