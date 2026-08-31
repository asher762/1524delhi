import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import localFont from 'next/font/local'
import { Literata } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const boska = localFont({
  src: [
    {
      path: '../../fonts/Boska-Variable.woff2',
      weight: '200 900',
      style: 'normal',
    },
    {
      path: '../../fonts/Boska-VariableItalic.woff2',
      weight: '200 900',
      style: 'italic',
    },
  ],
  variable: '--font-boska',
  display: 'swap',
})

const literata = Literata({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-literata',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(boska.variable, literata.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.png" rel="icon" type="image/png" />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
