import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const SignPdfTool = dynamic(() => import('./SignPdfTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Sign PDF – Add Your Signature to a PDF Free Online',
  description:
    'Sign a PDF by drawing, typing, or uploading your signature, then drag it into place. Runs entirely in your browser — no upload, no signup, no watermark.',
  alternates: { canonical: '/sign-pdf' },
  openGraph: {
    title: 'Sign PDF – Add Your Signature Free | PDFForge',
    description: 'Draw, type, or upload a signature and place it on your PDF, 100% browser-based. Free, no signup.',
    url: '/sign-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign PDF – Free Online | PDFForge',
    description: 'Sign a PDF in your browser. Draw, type, or upload your signature. No signup.',
  },
}

const RELATED_SLUGS = ['fill-pdf-form', 'pdf-editor', 'protect-pdf']

export default function SignPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-4 text-xs text-blue-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            Runs 100% in your browser · Private · Free
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Sign a <span className="text-blue-600">PDF</span> Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Draw, type, or upload your signature, then drag it exactly where it needs to go. No account, no upload, no watermark.
          </p>
        </div>
      </section>

      <SignPdfTool />

      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">How to Sign a PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-blue-600 text-lg">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-mute text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">What Kind of &quot;Signing&quot; This Is</h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              This tool does exactly what it looks like: it places an image of your signature — drawn,
              typed in a script font, or uploaded — onto the page of your PDF, at the position you drag it
              to. That covers the vast majority of real-world &quot;sign this and send it back&quot;
              situations: a lease, a form, an internal document, anything where you just need your mark on
              the page.
            </p>
            <p>
              What it deliberately doesn&apos;t do is provide the legal infrastructure behind services like
              DocuSign or Adobe Sign — identity verification, a tamper-evident audit trail, timestamped
              consent records, or multi-party signing requests where each signer gets a tracked link. If
              you&apos;re dealing with a contract that specifically requires that kind of legally-binding
              e-signature workflow, this isn&apos;t a substitute for it.
            </p>
            <p>
              For everything else — the common case — it&apos;s faster than printing, signing, and
              re-scanning a document. You can add the same signature to multiple pages, resize it to fit,
              and download a finished PDF in seconds.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-ink mb-2 text-base">{f.q}</h3>
                <p className="text-mute text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">You Might Also Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-blue-300 transition-all hover:-translate-y-1 block">
                <p className="font-display font-bold text-ink group-hover:text-blue-600 transition-colors">{tool.name}</p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4"><AdSlot position="footer" /></div>
    </>
  )
}

const HOW_TO_STEPS = [
  { title: 'Upload your PDF', body: 'Drop your PDF onto the tool. Nothing is uploaded — it\'s read straight into your browser.' },
  { title: 'Create your signature', body: 'Draw it with your mouse or trackpad, type your name in a script font, or upload an image of your signature.' },
  { title: 'Place and download', body: 'Drag your signature onto the page, resize it to fit, then download the signed PDF.' },
]

const FAQS = [
  { q: 'Is this a legally-binding e-signature?', a: 'It places a signature image onto your PDF, which covers most everyday signing needs. It doesn\'t provide identity verification, audit trails, or the legal infrastructure of services built specifically for legally-binding e-signatures — for contracts that require that, use a dedicated e-signature service instead.' },
  { q: 'Can I sign multiple pages?', a: 'Yes. Navigate to any page and click "Add to Page" to place your signature there — you can add it to as many pages as you need.' },
  { q: 'Can I resize or reposition my signature after placing it?', a: 'Yes. Click and drag a placed signature to move it, or drag the small handle in its bottom-right corner to resize it, before downloading.' },
  { q: 'What image format should I upload for my signature?', a: 'A PNG with a transparent background works best, since it won\'t show a white box around your signature. A JPG works too, just with a visible white background.' },
  { q: 'Is my PDF uploaded anywhere?', a: 'No. Your PDF and signature are processed entirely in your browser — nothing is ever transmitted to a server.' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Sign PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online tool to sign a PDF entirely in your browser. No signup, no upload required.',
      url: 'https://pdfforge.io/sign-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Sign a PDF Online',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload', text: 'Drop your PDF onto the tool.' },
        { '@type': 'HowToStep', position: 2, name: 'Create signature', text: 'Draw, type, or upload your signature.' },
        { '@type': 'HowToStep', position: 3, name: 'Place and download', text: 'Drag your signature onto the page and download the result.' },
      ],
    },
  ],
}
