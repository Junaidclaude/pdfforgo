import { NextResponse } from 'next/server'

// Generated from the same env var the AdSense script tag in app/layout.tsx
// reads, so ads.txt automatically stays in sync — set NEXT_PUBLIC_ADSENSE_PUB_ID
// once in Vercel and both update together with no further code changes.
export async function GET() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID // e.g. "ca-pub-1234567890123456"

  if (!pubId) {
    return new NextResponse('', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  const numericId = pubId.replace(/^ca-/, '') // Google's ads.txt format wants "pub-XXXX", not "ca-pub-XXXX"
  const body = `google.com, ${numericId}, DIRECT, f08c47fec0942fa0\n`

  return new NextResponse(body, { status: 200, headers: { 'Content-Type': 'text/plain' } })
}
