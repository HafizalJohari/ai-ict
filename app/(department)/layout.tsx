'use client'

import '../globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '../../components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export default function DepartmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 