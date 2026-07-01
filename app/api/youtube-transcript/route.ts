import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

interface CaptionTrack {
  baseUrl: string
  languageCode: string
  kind?: string
  name?: { simpleText?: string }
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  try {
    const u = new URL(trimmed)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const m = u.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // not a URL — fall through
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { url, lang } = await req.json()
    const videoId = extractVideoId(typeof url === 'string' ? url : '')
    if (!videoId) {
      return NextResponse.json({ error: 'Could not find a valid YouTube video ID in that link.' }, { status: 400 })
    }

    // The watch page hands out a fresh INNERTUBE_API_KEY per request — the
    // player endpoint rejects requests made without one (returns a generic
    // "Video unavailable" regardless of the actual video).
    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US' },
    })
    if (!watchRes.ok) {
      return NextResponse.json({ error: 'Could not reach YouTube. Try again in a moment.' }, { status: 502 })
    }
    const watchHtml = await watchRes.text()
    const apiKeyMatch = watchHtml.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/)
    if (!apiKeyMatch) {
      return NextResponse.json({ error: 'This video is unavailable or private.' }, { status: 422 })
    }

    // The ANDROID client isn't gated behind a PO token for caption tracks,
    // unlike the plain WEB client. Send the same headers a real Android app
    // would (User-Agent + X-YouTube-Client-*) — without them the request
    // looks like a bare API call rather than app traffic, which is more
    // likely to get bot-challenged from datacenter IPs.
    const ANDROID_UA = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip'
    const playerRes = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKeyMatch[1]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': ANDROID_UA,
        'X-YouTube-Client-Name': '3',
        'X-YouTube-Client-Version': '20.10.38',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId,
      }),
    })
    if (!playerRes.ok) {
      return NextResponse.json({ error: 'Could not reach YouTube. Try again in a moment.' }, { status: 502 })
    }
    const data = await playerRes.json()

    const status = data?.playabilityStatus?.status
    const reason: string | undefined = data?.playabilityStatus?.reason
    if (status && status !== 'OK') {
      // YouTube occasionally bot-challenges requests from cloud/datacenter
      // IPs (not tied to a specific video) — surface that plainly instead
      // of YouTube's generic "Sign in to confirm you're not a bot" text.
      const botChallenged = /sign in to confirm/i.test(reason || '')
      return NextResponse.json(
        {
          error: botChallenged
            ? 'YouTube is temporarily rate-limiting requests from this server. Please try again in a few minutes.'
            : reason || 'This video is unavailable.',
        },
        { status: botChallenged ? 429 : 422 }
      )
    }

    const tracks: CaptionTrack[] | undefined = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ error: 'No captions are available for this video.' }, { status: 404 })
    }

    const availableLanguages = tracks.map((t) => ({
      languageCode: t.languageCode,
      name: t.name?.simpleText || t.languageCode,
      auto: t.kind === 'asr',
    }))

    const selected =
      (lang && tracks.find((t) => t.languageCode === lang)) ||
      tracks.find((t) => t.languageCode?.startsWith('en') && t.kind !== 'asr') ||
      tracks.find((t) => t.languageCode?.startsWith('en')) ||
      tracks[0]

    const captionUrl = selected.baseUrl.includes('fmt=')
      ? selected.baseUrl.replace(/fmt=[^&]+/, 'fmt=json3')
      : `${selected.baseUrl}&fmt=json3`

    const capRes = await fetch(captionUrl, { headers: { 'User-Agent': USER_AGENT } })
    if (!capRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch the caption track.' }, { status: 502 })
    }
    const capData = await capRes.json()

    const events: Array<{ tStartMs?: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }> =
      capData.events || []

    const transcript = events
      .filter((e) => e.segs && e.segs.length)
      .map((e) => ({
        start: (e.tStartMs ?? 0) / 1000,
        duration: (e.dDurationMs ?? 0) / 1000,
        text: e.segs!.map((s) => s.utf8 || '').join('').replace(/\n/g, ' ').trim(),
      }))
      .filter((e) => e.text.length > 0)

    if (transcript.length === 0) {
      return NextResponse.json({ error: 'The caption track for this video was empty.' }, { status: 404 })
    }

    return NextResponse.json({
      videoId,
      title: data?.videoDetails?.title || '',
      author: data?.videoDetails?.author || '',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      availableLanguages,
      selectedLanguage: selected.languageCode,
      transcript,
    })
  } catch (err) {
    console.error('[youtube-transcript]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 })
  }
}
