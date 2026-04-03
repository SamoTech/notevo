import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './legal.css'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notevo — Private Encrypted Notes',
  description: 'Free, private, encrypted note-taking app. Your notes never leave your device. No account needed. Markdown support. Free forever.',
  keywords: ['notes', 'encrypted notes', 'private notes', 'markdown notes', 'free notes app', 'Laverna alternative'],
  authors: [{ name: 'Ossama Hashim', url: 'https://github.com/SamoTech' }],
  openGraph: {
    title: 'Notevo — Private Encrypted Notes',
    description: 'Free, private, encrypted note-taking. Your notes never leave your device.',
    url: 'https://notevo-io.vercel.app',
    siteName: 'Notevo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notevo — Private Encrypted Notes',
    description: 'Free, private, encrypted note-taking. Your notes never leave your device.',
    creator: '@OssamaHashim',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
