import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '')

    const { pathname } = request.nextUrl

    // Public paths that don't require authentication
    const publicPaths = ['/', '/login', '/signup']
    const isPublicPath = publicPaths.includes(pathname)

    // If trying to access protected route without token, redirect to login
    if (!isPublicPath && !token) {
        // Check if token exists in localStorage would need client-side check
        // For now, we'll let the AuthContext handle this
        return NextResponse.next()
    }

    // If logged in and trying to access login/signup, redirect to dashboard
    // This would need to be handled client-side with role checking

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
