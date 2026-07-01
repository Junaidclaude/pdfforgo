import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Auth is optional: without Clerk keys configured, skip auth entirely
// instead of crashing every request.
const clerkEnabled = !!(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
