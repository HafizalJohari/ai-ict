'use client'

import { useState, useEffect } from 'react'
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {

       // Initial date set
       const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      })
    // Initial time set
    setCurrentTime(new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }))
 

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <span className="text-xl font-bold text-white">ICT PPD JB</span>
            <h1 className="text-2xl font-bold text-white">Buletin Board</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Only render time when it's available (client-side) */}
            {currentTime && <p className="text-lg text-white">{currentTime}</p>}
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-white/20" />
    </header>
  )
}
