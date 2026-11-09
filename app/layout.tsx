import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import AnimatedBackground from '@/components/AnimatedBackground'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' })

export const metadata: Metadata = {
  title: 'TheMohitFact Hub — Digital Library & Resources',
  description: 'Digital resources, books, PDFs and notes from TheMohitFact. Knowledge that moves you forward.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    const sb = await createClient()
    const { data } = await sb.auth.getUser()
    user = data?.user ?? null
  } catch {}
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        <AnimatedBackground />
        <AuthProvider loggedIn={!!user}>
          <Navbar email={user?.email ?? null} />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
