import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { ClerkProvider } from '@clerk/nextjs'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})


export const viewport: Viewport = {
  themeColor: '#E84A4A',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'PDFForge — Free Online PDF Tools',
    template: '%s | PDFForge',
  },
  description:
    'Free online PDF tools. Merge, split, compress, convert PDFs instantly in your browser. No signup required, 100% private.',
  keywords: [
    'PDF tools',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'PDF to Word',
    'PDF converter',
    'online PDF editor',
    'free PDF tools',
  ],
  authors: [{ name: 'PDFForge' }],
  creator: 'PDFForge',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pdfforge.io'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PDFForge',
    title: 'PDFForge — Free Online PDF Tools',
    description:
      'Free online PDF tools. Merge, split, compress, convert PDFs instantly. No signup required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDFForge - Free Online PDF Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFForge — Free Online PDF Tools',
    description: 'Free online PDF tools. No signup required.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adSensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID

  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
        <head>
          {adSensePubId && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSensePubId}`}
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
          )}
        </head>
        <body className="min-h-screen flex flex-col font-sans">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
