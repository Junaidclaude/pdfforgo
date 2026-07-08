import type { Metadata } from 'next'
import EditVideoTool from './EditVideoTool'

export const metadata: Metadata = {
  title: 'Edit Video — Trim, Cut, Merge & Add Transitions | PDFForge',
  description: 'Edit videos online for free. Trim clips, adjust speed, set volume, rotate, merge multiple videos, and add smooth transitions — 100% in your browser, nothing uploaded.',
  alternates: { canonical: 'https://pdfforge.io/edit-video' },
}

export default function EditVideoPage() {
  return (
    <main className="min-h-screen bg-surface py-8">
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <h1 className="font-display text-3xl font-bold text-ink mb-1">Edit Video</h1>
        <p className="text-mute text-base">
          Trim, cut, merge clips, adjust speed &amp; volume, rotate, and add transitions — 100% in your browser.
        </p>
      </div>
      <EditVideoTool />
    </main>
  )
}
