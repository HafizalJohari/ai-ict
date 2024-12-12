'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Calendar } from 'lucide-react'
import type { CountdownEvent } from '@/lib/types'
import * as M from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownDisplay() {
  const [events, setEvents] = useState<CountdownEvent[]>([])
  const [timeLeft, setTimeLeft] = useState<Record<string, TimeLeft>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/countdown')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(data.filter((event: CountdownEvent) => event.isActive))
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    const interval = setInterval(fetchEvents, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const newTimeLeft: Record<string, TimeLeft> = {}
      
      events.forEach(event => {
        const difference = new Date(event.targetDate).getTime() - new Date().getTime()
        
        if (difference > 0) {
          newTimeLeft[event.id] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          }
        }
      })
      
      setTimeLeft(newTimeLeft)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [events])

  if (loading) {
    return (
      <div className="text-center text-slate-100 py-8">
        Loading countdowns...
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-slate-100 py-8">
        No active countdowns
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map(event => {
        const time = timeLeft[event.id]
        if (!time) return null

        return (
          <M.motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              opacity: { duration: 0.3 },
              layout: { duration: 0.3, type: "spring", bounce: 0.2 }
            }}
            className="flex flex-col space-y-4 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">{event.title}</h3>
                <p className="text-sm text-slate-200 mt-1">{event.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-100">
                <Calendar className="h-3 w-3" />
                <span>{new Date(event.targetDate).toLocaleDateString('ms-MY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <M.motion.div 
                layout
                className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-3xl font-bold text-slate-100">{time.days}</span>
                <span className="text-xs text-slate-300 mt-1">Hari</span>
              </M.motion.div>
              <M.motion.div 
                layout
                className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-3xl font-bold text-slate-100">{time.hours}</span>
                <span className="text-xs text-slate-300 mt-1">Jam</span>
              </M.motion.div>
              <M.motion.div 
                layout
                className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-3xl font-bold text-slate-100">{time.minutes}</span>
                <span className="text-xs text-slate-300 mt-1">Minit</span>
              </M.motion.div>
              <M.motion.div 
                layout
                className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-3xl font-bold text-slate-100">{time.seconds}</span>
                <span className="text-xs text-slate-300 mt-1">Saat</span>
              </M.motion.div>
            </div>
          </M.motion.div>
        )
      })}
    </div>
  )
} 