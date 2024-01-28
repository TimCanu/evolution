'use client'

import i18next from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cookieName, defaultNS, getOptions, languages } from './settings'
import LanguageDetector from 'i18next-browser-languagedetector'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

if (!i18next.isInitialized) {
    i18next
        .use(initReactI18next)
        .use(LanguageDetector)
        .use(resourcesToBackend((language: string) => import(`./locales/${language}/${defaultNS}.json`)))
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
    const [cookies, setCookie] = useCookies([cookieName])
    const translationHook = useTranslationOrg(defaultNS)
    const { i18n } = translationHook
    const runsOnServerSide = typeof window === 'undefined'

    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage)

    if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
        i18n.changeLanguage(lng)
    }

    useEffect(() => {
        if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
            return
        }
        if (activeLng !== i18n.resolvedLanguage) {
            setActiveLng(i18n.resolvedLanguage)
        }
        if (lng && i18n.resolvedLanguage !== lng) {
            i18n.changeLanguage(lng)
        }
        if (cookies.i18next !== lng) {
            setCookie(cookieName, lng, { path: '/' })
        }
    }, [activeLng, cookies.i18next, i18n, lng, runsOnServerSide, setCookie])

    return translationHook
}
