import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | PDFForge',
  description: 'Get in touch with the PDFForge team.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">Get in Touch</h1>
      <p className="text-mute text-base md:text-lg mb-8 leading-relaxed">
        Found a bug, have a feature request, or a question about how PDFForge handles your files?
        We&apos;d like to hear from you.
      </p>
      <a
        href="mailto:junaid.tistasoft@gmail.com"
        className="inline-flex items-center gap-2 bg-royal hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        junaid.tistasoft@gmail.com
      </a>
      <p className="text-mute text-sm mt-8">
        We typically respond within a couple of business days.
      </p>
    </div>
  )
}
