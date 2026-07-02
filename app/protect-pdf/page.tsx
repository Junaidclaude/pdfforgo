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
      <section className="hero-bg py-12 px-4 border-b border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 mb-4 text-xs text-green-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Password Protect PDF Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Add a password to any PDF in seconds. Set an open password, an
            owner password, and control printing, copying, and editing
            permissions — all with 128-bit AES encryption.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <ProtectTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Password Protect a PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-green-600 text-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-mute text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
            What a PDF Password Actually Protects — and What It Doesn&apos;t
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              It&apos;s worth being precise about what you&apos;re getting, because the two passwords this tool sets
              do very different jobs. An <strong>open password</strong> encrypts the document itself — the
              file is genuinely unreadable without it, using 128-bit AES, the same standard Adobe Acrobat
              uses. That&apos;s real cryptographic protection, appropriate for anything you&apos;d be uncomfortable
              having read by whoever it lands in front of: signed contracts, tax documents, medical or HR
              records sent over email. An <strong>owner password</strong>, on the other hand, doesn&apos;t
              encrypt the file for viewing — it sets permission flags that ask compliant PDF readers to
              disable printing, copying, or editing. Most mainstream readers respect those flags, but they
              are a request, not a lock; someone with the right tools can strip permission-only
              restrictions without ever knowing the owner password. If the content itself needs to stay
              private, use an open password — permissions alone are for discouraging casual copying, not
              stopping a determined recipient.
            </p>
            <p>
              A detail that surprises people: you don&apos;t need to set both passwords for permissions to take
              effect. If you only enter an open password and leave the owner password blank, this tool
              generates one for you behind the scenes so your printing/copying/editing choices still get
              applied to the encrypted file — you just won&apos;t know that generated password, which is fine
              since its only role is enforcing permissions on a file that already requires your open
              password to view in the first place.
            </p>
            <p>
              Realistically, most people reach for this tool for one of three reasons: sending a document
              that contains something sensitive over a channel they don&apos;t fully trust (email, a shared
              drive), meeting a client or vendor&apos;s requirement that deliverables be password-protected
              before submission, or simply discouraging a document from being casually forwarded or edited
              once it leaves your hands. For the first two, set an open password. For the third, an owner
              password with printing/editing disabled is usually enough — and it has the advantage of
              letting the recipient still open and read the file without typing anything.
            </p>
            <p>
              One consequence of using real encryption: there&apos;s no recovery path if you forget an open
              password. Not from PDFForge, not from anyone — that&apos;s what makes it real protection rather
              than a soft restriction. Write it down somewhere before you send the file. And if you&apos;re on
              the receiving end of a PDF that&apos;s locked in a way you shouldn&apos;t be dealing with,{' '}
              <Link href="/unlock-pdf" className="text-green-600 hover:underline">Unlock PDF</Link> handles
              the reverse of everything described here.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <h3 className="font-display font-bold text-ink mb-2 text-base">
                  {faq.q}
                </h3>
                <p className="text-mute text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related tools ─────────────────────────────────── */}
      <section className="py-12 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="group bg-white rounded-2xl p-5 border border-line hover:border-green-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-green-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-mute text-sm mt-1">{tool.shortDesc}</p>
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
