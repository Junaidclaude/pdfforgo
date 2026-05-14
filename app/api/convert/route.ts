import { NextRequest, NextResponse } from 'next/server'

const CC_API_KEY = process.env.CLOUDCONVERT_API_KEY

// Supported conversion pairs — inputFormats lists all accepted file extensions
const ALLOWED: Record<string, { inputFormats: string[]; outputFormat: string }> = {
  'pdf-to-word':  { inputFormats: ['pdf'],                outputFormat: 'docx' },
  'word-to-pdf':  { inputFormats: ['docx', 'doc'],        outputFormat: 'pdf'  },
  'html-to-pdf':  { inputFormats: ['html', 'htm'],        outputFormat: 'pdf'  },
  'excel-to-pdf': { inputFormats: ['xlsx', 'xls', 'csv'], outputFormat: 'pdf'  },
}

export async function POST(req: NextRequest) {
  if (!CC_API_KEY) {
    return NextResponse.json({ error: 'Conversion service not configured.' }, { status: 503 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Must be multipart/form-data.' }, { status: 400 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Could not parse form data.' }, { status: 400 })
  }

  const tool = formData.get('tool') as string
  const file = formData.get('file') as File | null

  if (!tool || !ALLOWED[tool]) {
    return NextResponse.json({ error: 'Invalid conversion type.' }, { status: 400 })
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  // Vercel request body limit ~4.5MB
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 4 MB on the free plan.' }, { status: 413 })
  }

  const { inputFormats, outputFormat } = ALLOWED[tool]

  // Derive input format from the file's actual extension, validated against allowed list
  const fileExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const inputFormat = inputFormats.includes(fileExt) ? fileExt : inputFormats[0]

  try {
    // 1. Create a CloudConvert job
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'upload-file': {
            operation: 'import/upload',
          },
          'convert-file': {
            operation: 'convert',
            input: 'upload-file',
            input_format: inputFormat,
            output_format: outputFormat,
          },
          'export-file': {
            operation: 'export/url',
            input: 'convert-file',
          },
        },
      }),
    })

    if (!jobRes.ok) {
      const err = await jobRes.text()
      console.error('CloudConvert job creation failed:', err)
      return NextResponse.json({ error: 'Conversion service error. Please try again.' }, { status: 502 })
    }

    const job = await jobRes.json()
    const uploadTask = job.data.tasks.find((t: { name: string }) => t.name === 'upload-file')
    if (!uploadTask) {
      return NextResponse.json({ error: 'Upload task not found.' }, { status: 502 })
    }

    // 2. Upload the file
    const uploadUrl: string = uploadTask.result.form.url
    const uploadParams: Record<string, string> = uploadTask.result.form.parameters

    const uploadForm = new FormData()
    Object.entries(uploadParams).forEach(([k, v]) => uploadForm.append(k, v))
    uploadForm.append('file', file)

    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm })
    if (!uploadRes.ok) {
      console.error('CloudConvert upload failed:', await uploadRes.text())
      return NextResponse.json({ error: 'File upload failed. Please try again.' }, { status: 502 })
    }

    // 3. Poll for job completion (max 60s, 2s interval)
    const jobId: string = job.data.id
    let outputUrl: string | null = null
    let outputFileName: string | null = null

    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((r) => setTimeout(r, 2000))

      const statusRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${CC_API_KEY}` },
      })
      const statusData = await statusRes.json()
      const status: string = statusData.data.status

      if (status === 'error') {
        return NextResponse.json({ error: 'Conversion failed. The file may be unsupported or corrupted.' }, { status: 422 })
      }

      if (status === 'finished') {
        const exportTask = statusData.data.tasks.find((t: { name: string }) => t.name === 'export-file')
        const fileResult = exportTask?.result?.files?.[0]
        outputUrl = fileResult?.url ?? null
        outputFileName = fileResult?.filename ?? null
        break
      }
    }

    if (!outputUrl) {
      return NextResponse.json({ error: 'Conversion timed out. Please try a smaller file.' }, { status: 504 })
    }

    // 4. Fetch the converted file and stream it back
    const fileRes = await fetch(outputUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Could not retrieve converted file.' }, { status: 502 })
    }

    const fileBuffer = await fileRes.arrayBuffer()
    const MIME_MAP: Record<string, string> = {
      pdf:  'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    const mimeType = MIME_MAP[outputFormat] ?? 'application/octet-stream'
    const downloadName = outputFileName ?? `converted.${outputFormat}`

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    })
  } catch (err) {
    console.error('Conversion error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
