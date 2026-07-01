import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | PDFForge',
  description: 'Terms and conditions for using PDFForge\'s free PDF and image tools.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">Terms of Service</h1>
      <p className="text-mute text-sm mb-10">Last updated: July 2026</p>

      <div className="space-y-8 text-sm md:text-base text-ink leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Acceptance of terms</h2>
          <p className="text-mute">
            By using PDFForge, you agree to these terms. If you don&apos;t agree, please don&apos;t use the
            site. We may update these terms from time to time; continued use after changes means you accept
            the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">The service</h2>
          <p className="text-mute">
            PDFForge provides free, browser-based tools for working with PDFs, images, and related content.
            Most tools process files entirely on your device; a small number of conversion tools use a
            server-side provider, as described in our{' '}
            <a href="/privacy" className="text-royal hover:underline">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Acceptable use</h2>
          <p className="text-mute">You agree not to use PDFForge to:</p>
          <ul className="list-disc list-inside text-mute space-y-1 mt-2">
            <li>Process files you don&apos;t have the legal right to use or distribute</li>
            <li>Attempt to disrupt, overload, or reverse-engineer the service beyond normal use</li>
            <li>Use the service for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Your content</h2>
          <p className="text-mute">
            You retain all rights to the files you process using PDFForge. We claim no ownership over your
            content. For server-side conversion tools, files are transmitted solely to generate your
            requested output and are deleted immediately afterward — see our{' '}
            <a href="/privacy" className="text-royal hover:underline">Privacy Policy</a> for details.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Free tier and paid plans</h2>
          <p className="text-mute">
            The core tools are free to use. If a paid Pro plan is available and you subscribe, billing is
            handled through Stripe under the plan terms shown at checkout. You may cancel anytime; access
            continues until the end of the current billing period.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">No warranty</h2>
          <p className="text-mute">
            PDFForge is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the
            service will be uninterrupted, error-free, or fit for any particular purpose. Always keep a
            backup of important files before processing them with any tool, on any site.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Limitation of liability</h2>
          <p className="text-mute">
            To the fullest extent permitted by law, PDFForge and its operators are not liable for any
            indirect, incidental, or consequential damages arising from your use of the service, including
            loss of data or files.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Contact</h2>
          <p className="text-mute">
            Questions about these terms? Reach out via our{' '}
            <a href="/contact" className="text-royal hover:underline">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
