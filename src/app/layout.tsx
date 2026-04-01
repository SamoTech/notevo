import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notevo — Private Encrypted Notes',
  description: 'Zero-knowledge encrypted notes with Markdown support. Your notes stay private — always.',
  keywords: ['notes', 'encrypted', 'private', 'markdown', 'laverna'],
  authors: [{ name: 'Ossama Hashim', url: 'https://github.com/SamoTech' }],
  openGraph: {
    title: 'Notevo',
    description: 'Private encrypted notes',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
