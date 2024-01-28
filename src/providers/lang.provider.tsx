'use client'
import { createContext, FunctionComponent, PropsWithChildren, useContext } from 'react'
import { UseTranslationResponse } from 'react-i18next'
import { useTranslationClient } from '@/src/i18n/i18n.client'
import { useParams } from 'next/navigation'

interface LangContextResult {
    translationHook: UseTranslationResponse<'translation', undefined>
}

const LangContext = createContext<LangContextResult>({} as LangContextResult)

export const LangProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const params = useParams<{ lang: string }>()
    const translationHook = useTranslationClient(params.lang)

    return <LangContext.Provider value={{ translationHook }}>{children}</LangContext.Provider>
}

export function useLangContext(): LangContextResult {
    return useContext(LangContext)
}
