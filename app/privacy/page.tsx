import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | PDFForge',
  description: 'How PDFForge handles your files and data. Most tools process entirely in your browser — nothing is uploaded.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">Privacy Policy</h1>
      <p className="text-mute text-sm mb-10">Last updated: July 2026</p>

      <div className="space-y-8 text-sm md:text-base text-ink leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">How your files are handled</h2>
          <p className="text-mute">
            Most tools on PDFForge — merge, split, compress, rotate, protect, unlock, image editing,
            background removal, and all the image/video/social tools — run entirely in your browser
            using JavaScript and WebAssembly. Your file is never uploaded or transmitted anywhere; it
            never leaves your device.
          </p>
          <p className="text-mute mt-3">
            A small number of conversions (Word↔PDF, Excel→PDF, HTML→PDF) require a real document/rendering
            engine that can&apos;t run in a browser. For these specific tools, your file is transmitted over
            HTTPS to our conversion provider and automatically deleted immediately after your result is
            generated. We do not retain, read, or share the contents of your files.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Information we collect</h2>
          <p className="text-mute">
            We do not require an account to use PDFForge, and we do not collect personal information for
            the core tools. We use privacy-respecting analytics (Vercel Analytics) to understand aggregate
            traffic patterns — page views and general usage counts — without tracking you individually
            across the web.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Cookies and advertising</h2>
          <p className="text-mute">
            PDFForge is partly funded by Google AdSense, which may use cookies to serve ads based on your
            visits to this and other sites. You can opt out of personalized advertising through{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-royal hover:underline">
              Google&apos;s Ads Settings
            </a>{' '}
            or{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-royal hover:underline">
              aboutads.info
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Accounts and payments</h2>
          <p className="text-mute">
            If you create an account or subscribe to a paid plan, authentication is handled by Clerk and
            payments are processed by Stripe. We never see or store your payment card details — Stripe
            handles that directly under its own security and compliance standards. Account data (email,
            subscription status) is used solely to provide the service you signed up for.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Third-party services we use</h2>
          <ul className="list-disc list-inside text-mute space-y-1">
            <li>Vercel — hosting and analytics</li>
            <li>Google AdSense — advertising</li>
            <li>Stripe — payment processing (only if you subscribe to Pro)</li>
            <li>Clerk — authentication (only if you create an account)</li>
            <li>CloudConvert — server-side document conversion (only for Word/Excel/HTML tools)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Your rights</h2>
          <p className="text-mute">
            Since most tools never transmit your files anywhere, there is nothing server-side to delete
            for those tools. For account data or questions about how your information is handled, contact
            us using the details on our{' '}
            <a href="/contact" className="text-royal hover:underline">Contact page</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink mb-2">Changes to this policy</h2>
          <p className="text-mute">
            We may update this policy as the service evolves. Material changes will update the &quot;Last
            updated&quot; date above.
          </p>
        </section>
      </div>
    </div>
  )
}
