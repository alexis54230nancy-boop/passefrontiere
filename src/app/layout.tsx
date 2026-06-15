import type { Metadata } from 'next'
import { Inter, Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PasseFrontière — Gérez vos jours frontaliers sans stress',
  description:
    "PasseFrontière suit automatiquement vos jours travaillés, vous alerte avant les seuils fiscaux et centralise toutes vos démarches transfrontalières.",
  keywords: ['frontalier', 'fiscal', 'Luxembourg', 'Suisse', 'Allemagne', 'Belgique', 'télétravail', 'seuil'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${syne.variable} ${plusJakartaSans.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  )
}
