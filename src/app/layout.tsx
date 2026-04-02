import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' })

export const metadata: Metadata = {
  title: 'Notevo — Private Encrypted Notes',
  description: 'Private, encrypted Markdown notes. Your data never leaves your hands.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔐</text></svg>'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('notevo-theme');
              if (t) document.documentElement.setAttribute('data-theme', t);
              else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
                document.documentElement.setAttribute('data-theme', 'dark');
            } catch(e) {}
          })()
        `}} />
      </head>
      <body className={`${inter.variable} ${instrumentSerif.variable}`} style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}
