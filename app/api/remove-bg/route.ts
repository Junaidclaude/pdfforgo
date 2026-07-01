import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Image too large. Max size is 20 MB.' }, { status: 413 })

    const arrayBuffer = await file.arrayBuffer()

    const { removeBackground } = await import('@imgly/background-removal-node')

    // Pass a Blob with the correct MIME type — if we pass a raw Buffer the library
    // wraps it as new Blob([buffer]) with type="" and sharp throws "Unsupported format"
    const mimeType = file.type || 'image/jpeg'
    const blob = new Blob([arrayBuffer], { type: mimeType })

    // publicPath defaults to the local node_modules dist dir, but Vercel's
    // build-time file tracer doesn't bundle the model chunks (they're loaded
    // by hash name computed at runtime, not a traceable require()/import) —
    // fetch them from IMG.LY's CDN instead. Must match the installed
    // @imgly/background-removal-node version (see package.json).
    const resultBlob = await removeBackground(blob, {
      model: 'medium',
      publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/',
    })

    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer())

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[remove-bg]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 })
  }
}
