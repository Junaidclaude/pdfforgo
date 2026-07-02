import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { TOOLS } from '@/lib/tools'

const UnlockTool = dynamic(() => import('./UnlockTool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Unlock PDF – Remove Password Free Online',
  description:
    'Remove password protection and restrictions from PDF files online for free. Unlock printing, copying, and editing. Enter the open password if required. No signup — 100% browser-based.',
  alternates: {
    canonical: '/unlock-pdf',
  },
  openGraph: {
    title: 'Unlock PDF – Remove PDF Password Free Online | PDFForge',
    description:
      'Remove PDF password and restrictions online. Unlock printing, copying, and editing. Free, no signup, files stay in your browser.',
    url: '/unlock-pdf',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unlock PDF – Free Online | PDFForge',
    description:
      'Remove PDF password protection and restrictions. No signup required.',
  },
}

const RELATED_SLUGS = ['protect-pdf', 'compress-pdf', 'merge-pdf']

export default function UnlockPdfPage() {
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
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-4 text-xs text-orange-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse" />
            Client-side · Files stay on your device
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight text-ink">
            Unlock PDF Online
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto">
            Remove password protection and restrictions from your PDF files.
            Unlock printing, copying, and editing — instantly, in your browser.
          </p>
        </div>
      </section>

      {/* ── Tool ─────────────────────────────────────────── */}
      <UnlockTool />

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-paper">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink text-center mb-10">
            How to Remove a PDF Password
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-line">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-orange-600 text-lg">
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
            Legitimate Reasons to Unlock a PDF (and the One Thing This Tool Won&apos;t Do)
          </h2>
          <div className="space-y-4 text-mute text-sm md:text-base leading-relaxed">
            <p>
              People end up here for reasons that have nothing to do with bypassing someone else&apos;s
              security. A common one: your own company or a client locked a PDF with printing and copying
              disabled, and now you&apos;re the one who needs to pull a paragraph into a report or print a
              signed copy for a physical file. Another: you inherited a batch of old scanned records or
              statements that were protected years ago, the person who set the password is long gone, but
              you have every right to the content and just need the restriction lifted so the files are
              usable again. A third: you&apos;re archiving documents and want a clean, unencrypted copy that
              won&apos;t prompt future software or long-term storage systems for a password nobody remembers.
            </p>
            <p>
              What actually happens under the hood depends on which kind of protection you&apos;re dealing with.
              Plenty of PDFs are locked with an <strong>owner password only</strong> — no password required
              to open them, just permission flags disabling printing or editing. Those, this tool clears
              automatically with no password needed at all, because the content was never actually hidden
              from you in the first place; only the permission flags were set. A PDF with a genuine{' '}
              <strong>open password</strong> is different — the file&apos;s contents are encrypted, and you have
              to supply the correct password before anything can be decrypted and re-saved without it.
            </p>
            <p>
              This is also the honest limitation to know going in: if you don&apos;t have the password to a PDF
              that requires one to open, this tool cannot get you in. It tries the password you type exactly
              once, and if it&apos;s wrong you&apos;ll see an &quot;incorrect password&quot; message — there&apos;s no brute-forcing,
              no dictionary attack, no backdoor. That&apos;s a deliberate line, not a missing feature; a tool that
              cracked open-password PDFs without the password would be far more useful to someone trying to
              get into a document that isn&apos;t theirs than to someone who&apos;s genuinely locked out of their own
              file.
            </p>
            <p>
              Once a file is unlocked, it&apos;s a completely ordinary, unencrypted PDF — worth remembering if
              you&apos;re planning to send it back out. If you need to re-apply a password (a new one you&apos;ll
              actually remember, or updated permissions), run it through{' '}
              <Link href="/protect-pdf" className="text-orange-600 hover:underline">Protect PDF</Link> before
              it goes anywhere. And if the unlocked file also happens to be oversized once you can finally
              work with it, <Link href="/compress-pdf" className="text-orange-600 hover:underline">Compress PDF</Link> is
              a natural next stop.
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
                className="group bg-white rounded-2xl p-5 border border-line hover:border-orange-300 transition-all hover:-translate-y-1 block"
              >
                <p className="font-display font-bold text-ink group-hover:text-orange-600 transition-colors">
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
    title: 'Upload Your Locked PDF',
    body: 'Click the upload area or drag and drop your password-protected PDF. The file stays entirely in your browser — nothing is sent to a server.',
  },
  {
    title: 'Enter Password If Required',
    body: 'If the PDF requires a password to open, enter it in the password field. For PDFs that only have editing/printing restrictions (no open password), leave it blank.',
  },
  {
    title: 'Download Unlocked PDF',
    body: 'Click Unlock PDF. All passwords and restrictions are removed and you can download the clean, unrestricted PDF immediately.',
  },
]

const FAQS = [
  {
    q: 'Can I unlock a PDF without knowing the password?',
    a: 'You can remove owner-level restrictions (printing, copying, editing) without a password. However, if the PDF requires a password just to open it (user/open password), you must know the correct password — PDFForge cannot bypass open-password encryption.',
  },
  {
    q: 'What is the difference between an open password and owner restrictions?',
    a: 'An open password is required every time the PDF is opened — the file is encrypted and unreadable without it. Owner restrictions are a separate layer that limits what viewers can do (print, copy, edit) but does not prevent opening the file. PDFForge can remove both, but requires the password for open-password PDFs.',
  },
  {
    q: 'Why does my PDF say it is restricted but has no open password?',
    a: 'Many PDFs are created with an owner password only, which applies restrictions without requiring a password to open. This is common in downloaded reports and forms. PDFForge can remove these restrictions without any password.',
  },
  {
    q: 'Is my PDF safe to unlock online with PDFForge?',
    a: 'Completely safe. All processing runs locally in your browser using WebAssembly (pdf-lib). Your file and password are never sent to any server. We have zero access to your documents.',
  },
  {
    q: 'Will unlocking a PDF change the content or quality?',
    a: 'No. Unlocking copies all pages and content into a new PDF without encryption metadata. The text, images, and formatting are completely preserved.',
  },
  {
    q: 'Can I re-lock an unlocked PDF with a new password?',
    a: 'Yes. Once unlocked, use our Protect PDF tool to add a new open password, owner password, or both. You can also set new printing and editing permissions.',
  },
  {
    q: 'What if my PDF cannot be unlocked?',
    a: 'If you receive an error, check that you are entering the correct password. Very old PDFs (PDF 1.1–1.3) or those using non-standard encryption may not be supported. Try updating the PDF with a PDF editor first.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Unlock PDF — PDFForge',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free online PDF unlocker. Remove PDF password protection and restrictions. No signup, browser-based.',
      url: 'https://pdfforge.io/unlock-pdf',
    },
    {
      '@type': 'HowTo',
      name: 'How to Remove a PDF Password Online',
      description:
        'Unlock a password-protected PDF using PDFForge — free, private, no signup.',
      totalTime: 'PT30S',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload PDF',
          text: 'Drop your locked PDF onto the upload area or click to browse.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Enter Password',
          text: 'If the PDF has an open password, enter it. Leave blank for owner-only restrictions.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download',
          text: 'Click Unlock PDF and download the unrestricted document.',
        },
      ],
    },
  ],
}
