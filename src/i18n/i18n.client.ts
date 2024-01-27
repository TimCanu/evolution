'use client'

import i18next from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions, languages } from './settings'
import { useEffect, useState } from 'react'

if (!i18next.isInitialized) {
    i18next
        .use(initReactI18next)
        .use(resourcesToBackend((language: string) => import(`./locales/${language}/translation.json`)))
        .init({
            ...getOptions(),
            lng: undefined, // let detect the language on client side
            detection: {
                order: ['path', 'htmlTag', 'cookie', 'navigator']
            },
            preload: languages
        })
}

export function useTranslationClient(lng?: string) {
    const translationHook = useTranslationOrg('translation')
    const runsOnServerSide = typeof window === 'undefined'

    const [activeLng, setActiveLng] = useState(lng ?? translationHook.i18n.resolvedLanguage)

    useEffect(() => {
        if (runsOnServerSide || !lng) {
            return
        }
        if (translationHook.i18n.isInitialized){
            if (translationHook.i18n.resolvedLanguage !== lng) {
                console.log(lng)
                translationHook.i18n.changeLanguage(lng).then(() => {
                    setActiveLng(lng)
                })
            }
        }
    }, [lng, runsOnServerSide, translationHook.i18n, translationHook.i18n.isInitialized])

    return translationHook
}
