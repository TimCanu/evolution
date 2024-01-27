import { NextRequest } from 'next/server.js'
import { cookieName, languages } from '@/src/i18n/settings'
import acceptLanguage from 'accept-language'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl
    const pathnameHasLocale = languages.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    const referer = request.headers.get('referer')
    if (referer) {
        const refererUrl = new URL(referer)
        const lngInReferer = languages.find((lang) => refererUrl.pathname.startsWith(`/${lang}`))
        const response = NextResponse.next()
        if (lngInReferer) {
            response.cookies.set(cookieName, lngInReferer)
        }
        return response
    }

    if (pathnameHasLocale) {
        return
    }

    let locale = 'en'
    if (request.cookies.has(cookieName)) {
        const newLocale =acceptLanguage.get(request.cookies.get(cookieName)?.value)
        locale = newLocale ?? locale
    }
    if (!locale){
        const newLocale = acceptLanguage.get(request.headers.get('Accept-Language'))
        locale = newLocale ?? locale
    }

    request.nextUrl.pathname = `/${locale}${pathname}`
    return Response.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ],
}