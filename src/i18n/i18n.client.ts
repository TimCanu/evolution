'use client'

import i18next from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cookieName, getOptions, languages } from './settings'
import { useCookies } from 'react-cookie'
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

export function useTranslation(lng: string) {
    const [cookies, setCookie] = useCookies([cookieName])
    const translationHook = useTranslationOrg('translation')
    const runsOnServerSide = typeof window === 'undefined'

    const [activeLng, setActiveLng] = useState(translationHook.i18n.resolvedLanguage)

    useEffect(() => {
        if (runsOnServerSide || activeLng === translationHook.i18n.resolvedLanguage) {
            return
        }
        setActiveLng(translationHook.i18n.resolvedLanguage)
    }, [activeLng, runsOnServerSide, translationHook.i18n.resolvedLanguage])

    useEffect(() => {
        if (!runsOnServerSide && translationHook.i18n.resolvedLanguage !== lng) {
            translationHook.i18n.changeLanguage(lng).then(() => {
                setActiveLng(lng)
            })
            console.log('changing lang')
        }
    }, [lng, runsOnServerSide, translationHook.i18n])

    useEffect(() => {
        if (runsOnServerSide || cookies.i18next === lng) {
            return
        }
        setCookie(cookieName, lng, { path: '/' })
    }, [lng, cookies.i18next, setCookie, runsOnServerSide])

    return translationHook
}
