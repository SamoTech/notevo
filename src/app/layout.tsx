import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Notevo — Private Encrypted Notes',
  description: 'AES-GCM encrypted note-taking. Your notes, your keys. Open source Laverna successor.',
  keywords: ['encrypted notes', 'private notes', 'open source', 'Laverna', 'markdown'],
  openGraph: {
    title: 'Notevo',
    description: 'Private encrypted notes with AES-GCM. No tracking, no ads.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
