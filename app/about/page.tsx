import type { Metadata } from 'next'
import Link from 'next/link'
import { TOOLS } from '@/lib/tools'

export const metadata: Metadata = {
  title: 'About PDFForge',
  description: 'Why PDFForge exists, and how it approaches privacy for browser-based PDF and image tools.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6">About PDFForge</h1>

      <div className="space-y-6 text-sm md:text-base text-ink leading-relaxed">
        <p className="text-mute">
          PDFForge started from a simple frustration: most free online PDF tools require uploading your
          file to a stranger&apos;s server, sitting through an account signup, or dodging a watermark on
          the result. For a lot of everyday tasks — merging two PDFs, compressing an image, removing a
          background — none of that should be necessary.
        </p>
        <p className="text-mute">
          Most tools on this site run entirely in your browser. The PDF or image you drop in never leaves
          your device — there&apos;s no server round-trip to wait on, and no upload to worry about. That&apos;s
          possible because modern browsers, via JavaScript and WebAssembly, can do surprisingly heavy
          lifting: parsing PDF structure, running AI models for background removal and face detection, and
          rendering canvases for image editing, all client-side.
        </p>
        <p className="text-mute">
          A handful of tools — converting to and from Word, Excel, and HTML — need a real document
          rendering engine that can&apos;t run in a browser tab. For those specific tools, your file is sent
          over HTTPS to a conversion provider and deleted immediately after your result is ready. We&apos;re
          upfront about which tools work which way — you can check any tool&apos;s FAQ section for specifics.
        </p>
        <p className="text-mute">
          PDFForge is free to use, with {TOOLS.length} tools spanning PDF editing, image editing, and a
          growing set of video/social utilities. It&apos;s funded by non-intrusive display ads, with an
          optional Pro plan for people who want unlimited daily use.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/all-tools" className="btn-royal">Browse all tools</Link>
        <Link href="/contact" className="btn-ghost">Get in touch</Link>
      </div>
    </div>
  )
}
