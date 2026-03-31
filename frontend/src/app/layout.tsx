// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'OppGabon — Emplois, Stages & Logements au Gabon',
    template: '%s | OppGabon',
  },
  description:
    'La plateforme tout-en-un du Gabon : trouvez un emploi, un stage ou un logement disponible. Employeurs, locataires et candidats — tout le monde y trouve son compte.',
  keywords: ['emploi gabon', 'stage gabon', 'logement libreville', 'recrutement gabon'],
  openGraph: {
    title: 'OppGabon',
    description: 'Emplois, Stages & Logements au Gabon',
    url: 'https://oppgabon.ga',
    siteName: 'OppGabon',
    locale: 'fr_GA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#1D6A54', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
