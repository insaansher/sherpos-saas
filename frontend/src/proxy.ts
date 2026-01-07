import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')
    const { pathname } = request.nextUrl

    // Protected Routes
    const isProtectedRoute =
        pathname.startsWith('/app') ||
        pathname.startsWith('/pos') ||
        pathname.startsWith('/admin')

    // Public Routes (Auth)
    const isAuthRoute =
        pathname === '/login' ||
        pathname === '/register'

    // 1. Missing Token on Protected Route -> Login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        // Optional: Add ?from=... for better UX later
        return NextResponse.redirect(loginUrl)
    }

    // 2. Token present on Auth Route -> Redirect to App (simplest assumption)
    // We don't know the role here easily (JWT is valid?), so we let the client-side AuthGate check role.
    // But strictly speaking, if they have a token, they shouldn't be seeing login page.
    /* 
    if (isAuthRoute && token) {
       return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
    */
    // Commented out to avoid redirect loops if token is invalid/expired. 
    // Let client AuthGate handle invalid tokens (it redirects to login clearing state).

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
