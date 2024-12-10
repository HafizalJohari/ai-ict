'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '../components/theme-provider'
import Header from '@/components/Header'
import { AppSidebar } from '@/components/Sidebar'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDepartmentRoute = pathname === '/department'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {isDepartmentRoute ? (
            <div className="min-h-screen">
              {children}
            </div>
          ) : (
            <SidebarProvider>
              <div className="relative flex min-h-screen">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 pt-16">
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

