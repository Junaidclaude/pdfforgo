import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const ProtectTool = dynamic(() => import('./ProtectTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Protect PDF – Add Password Free Online',
  description:
    'Add a password to your PDF online for free. Set open and owner passwords with 128-bit AES encryption. Control printing, copying, and editing permissions. No signup — 100% browser-based.',
  alternates: {
    canonical: '/protect-pdf',
  },
  openGraph: {
    title: 'Protect PDF – Password Protect PDF Free Online | PDFForge',
    description:
      'Add password protection and permissions to any PDF. 128-bit AES encryption. Free, no signup, files stay in your browser.',
    url: '/protect-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protect PDF – Free Online | PDFForge',
    description:
      'Password-protect any PDF with 128-bit AES encryption. No signup required.',
  },
}

const RELATED_SLUGS = ['unlock-pdf', 'merge-pdf', 'compress-pdf']

export default function ProtectPdfPage() {
  const related = TOOLS.filter((t) => RELATED_SLUGS.includes(t.slug))

  return (
    <>
      {/* ── Structured data ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-dark text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5 mb-4 text-xs text-green-300">
            Client-side · Files stay on your device
          </div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Password Protect PDF Online
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Add a password to any PDF in seconds. Set an open password, an
            owner password, and control printing, copying, and editing
            permissions — all with 128-bit AES encryption.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <ProtectTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            How to Password Protect a PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-syne font-extrabold text-green-500 text-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-syne font-bold text-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-dark text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-syne font-bold text-dark mb-2 text-base">
                  {faq.q}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related tools ─────────────────────────────────── */}
      <section className="py-12 px-4 bg-bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne text-xl font-extrabold text-dark mb-6 text-center">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 block"
              >
                <p className="font-syne font-bold text-dark group-hover:text-green-500 transition-colors">
                  {tool.name}
                </p>
                <p className="text-gray-500 text-sm mt-1">{tool.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AD_SLOT: footer_banner */}
      <div className="max-w-6xl mx-auto px-4">
        <AdSlot position="footer" />
      </div>
    </>
  )
}

// ── Static data ────────────────────────────────────────────────────────────

const HOW_TO_STEPS = [
  {
    title: 'Upload Your PDF',
    body: 'Click the upload area or drag and drop your PDF. The file is read locally in your browser — nothing is uploaded to any server.',
  },
  {
    title: 'Set Your Password & Permissions',
    body: 'Enter an open password (required to open the file) and/or an owner password (controls editing, printing, and copying). Toggle permissions as needed.',
  },
  {
    title: 'Download Protected PDF',
    body: 'Click Protect PDF and download your encrypted document instantly. 128-bit AES encryption is applied in your browser — no signup or email needed.',
  },
]

const FAQS = [
  {
    q: 'What is the difference between an open password and an owner password?',
    a: 'An open password (also called user password) is required every time someone tries to open the PDF. An owner password controls what viewers can do once the PDF is open — such as printing, copying text, or editing. You can set one or both passwords.',
  },
  {
    q: 'What encryption does PDFForge use to protect PDFs?',
    a: 'PDFForge uses 128-bit AES encryption, which is the PDF 1.6 standard. This is the same encryption level used by Adobe Acrobat and other professional PDF tools. It provides strong security for sensitive documents.',
  },
  {
    q: 'Can I prevent someone from printing or copying my PDF?',
    a: 'Yes. Under the Permissions section, you can disable printing and copying. Note that determined users with advanced tools may be able to bypass permission restrictions — for truly sensitive content, an open password is the strongest protection.',
  },
  {
    q: 'Is my PDF safe when I protect it online?',
    a: 'Completely safe. All encryption happens locally in your browser. Your PDF and your password are never sent to any server. We have zero access to your files or passwords.',
  },
  {
    q: 'What happens if I forget the open password?',
    a: 'If you forget the open password, you will not be able to open the PDF. There is no way to recover it without specialized software. Make sure to keep a record of your password — or use our Unlock PDF tool if you still have access.',
  },
  {
    q: 'Can I password-protect an already-encrypted PDF?',
    a: 'Yes. PDFForge will read the existing PDF (bypassing any owner-level encryption) and re-encrypt it with your new password and settings.',
  },
  {
    q: 'Will adding a password increase the PDF file size?',
    a: 'Only slightly — encryption adds a small amount of metadata to the file. For most PDFs, the size increase is less than 1 KB.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Protect PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF password protection. Add open and owner passwords with 128-bit AES encryption. Control permissions. No signup, browser-based.',
      url: 'https://pdfforge.io/protect-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Password Protect a PDF Online',
      description:
        'Add a password to a PDF file using PDFForge — free, private, no signup.',
      totalTime: 'PT30S',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload PDF',
          text: 'Drop your PDF onto the upload area or click to browse.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Set Password',
          text: 'Enter an open password and/or owner password. Set printing and editing permissions.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'Click Protect PDF and download your encrypted document.',
        },
      ],
    },
  ],
}
