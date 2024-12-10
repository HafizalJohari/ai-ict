'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import StaffAvailability from './StaffAvailability'
import ActivitySchedule from './ActivitySchedule'
import AssetOverview from './AssetOverview'
import AnnouncementOverview from './AnnouncementOverview'
import PrayerTimes from './PrayerTimes'
import ChatBubble from './ChatBubble'
import News from './News'
import MonthlyCalendar from './MonthlyCalendar'
import * as M from 'framer-motion'
import { Clock, Calendar } from 'lucide-react'

const featureComponents = {
  prayer: PrayerTimes,
  news: News,
  calendar: MonthlyCalendar,
  staff: StaffAvailability,
  activity: ActivitySchedule,
  assets: AssetOverview,
  announcements: AnnouncementOverview,
}

function ClockDisplay() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    const days = [
      'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'
    ]
    const months = [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ]

    const day = days[date.getDay()]
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = months[date.getMonth()]
    const yyyy = date.getFullYear()

    return `${day}, ${dd} ${mm} ${yyyy}`
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12 // Convert 0 to 12 for 12 AM

    return `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`
  }

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted) {
    return null
  }

  return (
    <M.motion.article
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.2 },
        layout: { duration: 0.3, type: "spring", bounce: 0.2 }
      }}
      className="flex flex-col backdrop-blur-md bg-white/10 border border-white/20 rounded-lg shadow-xl overflow-hidden md:col-span-2"
    >
      <M.motion.div 
        layout="position"
        className="p-4"
      >
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left: Logo */}
          <div className="flex justify-center md:justify-start">
            <div className="w-40 md:w-48 h-auto">
              <img 
                src="/media/logo-kpm-1-white.png" 
                alt="KPM Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Center: Title and Subtitle */}
          <div className="text-center space-y-1">
            <h1 className="text-xl md:text-1xl font-bold text-slate-200 tracking-wide">
              AI Integrated Digital Display
            </h1>
            <p className="text-xs md:text-sm text-slate-400 italic">
              - Dibangunkan oleh Unit ICT PPD Johor Bahru -
            </p>
          </div>
          
          {/* Right: Date and Time */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-lg md:text-xl font-medium text-slate-200">
              {formatTime(time)}
            </span>
            <span className="text-sm md:text-base text-slate-300">
              {formatDate(time)}
            </span>
          </div>
        </div>
      </M.motion.div>
    </M.motion.article>
  )
}

export default function DepartmentDisplay() {
  const store = useStore()
  const [updateKey, setUpdateKey] = useState(0)
  const enabledFeatures = store.features
    .filter(f => f.enabled)
    .sort((a, b) => a.order - b.order)

  // Monitor store changes
  useEffect(() => {
    // Subscribe to feature changes
    const unsubFeatures = useStore.subscribe(
      (state) => state.features,
      (features) => {
        setUpdateKey(prev => prev + 1)
        console.log('Features updated:', features)
      }
    )

    return () => {
      unsubFeatures()
    }
  }, [])

  // ElevenLabs widget temporarily disabled
  /*
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    script.type = 'text/javascript'
    document.body.appendChild(script)

    const convaiElement = document.createElement('elevenlabs-convai')
    convaiElement.setAttribute('agent-id', 'DL3wv6GDdO45RYetqUev')
    document.body.appendChild(convaiElement)

    return () => {
      document.body.removeChild(script)
      if (convaiElement) {
        document.body.removeChild(convaiElement)
      }
    }
  }, [])
  */

  if (enabledFeatures.length === 0) {
    return (
      <main className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500">
        <h1 className="text-2xl text-slate-200">No features are currently enabled</h1>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-[url('/media/pexels-brett-sayles-3653997.jpg')] bg-cover bg-center bg-no-repeat bg-fixed"
        role="img"
        aria-label="Department background"
      />
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-6 space-y-6">
        {/* Features Grid */}
        <M.motion.div 
          layout
          key={updateKey}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min"
        >
          {/* Clock Display */}
          <ClockDisplay />
          <M.AnimatePresence mode="popLayout">
            {enabledFeatures.map((feature) => {
              const FeatureComponent = featureComponents[feature.id as keyof typeof featureComponents]
              if (!FeatureComponent) return null

              return (
                <M.motion.article 
                  key={`${feature.id}-${updateKey}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    layout: { duration: 0.3, type: "spring", bounce: 0.2 }
                  }}
                  className={`flex flex-col min-h-0 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                    feature.width === 'full' ? 'md:col-span-2' : ''
                  }`}
                >
                  <M.motion.header 
                    layout="position"
                    className="py-3 px-4 border-b border-white/10"
                  >
                    <M.motion.h2 layout="position" className="text-lg font-medium text-slate-100">
                      {feature.content}
                    </M.motion.h2>
                  </M.motion.header>
                  <M.motion.div 
                    layout="position"
                    className="flex-1 overflow-hidden p-4 text-slate-200"
                  >
                    <FeatureComponent key={`component-${feature.id}-${updateKey}`} />
                  </M.motion.div>
                </M.motion.article>
              )
            })}
          </M.AnimatePresence>
        </M.motion.div>

        <aside>
          <ChatBubble />
        </aside>
      </div>
    </main>
  )
}

