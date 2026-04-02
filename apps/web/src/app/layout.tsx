import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import NeonBackground from '@/components/NeonBackground'

export const metadata: Metadata = {
  title: 'NeonForge',
  description: 'Cinematic AI data platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="fixed inset-0 -z-10">
            <NeonBackground />
            <div className="neon-noise" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
