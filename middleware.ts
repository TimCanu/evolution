import { NextRequest } from 'next/server.js'
import { languages } from '@/src/i18n/settings'

export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl
    const pathnameHasLocale = languages.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect if there is no locale
    const locale = 'en'
    request.nextUrl.pathname = `/${locale}${pathname}`
    return Response.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        // Optional: only run on root (/) URL
        '/'
    ],
}