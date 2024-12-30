'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from '@/lib/eventStore'
import { format, startOfToday, endOfToday, isWithinInterval } from "date-fns"
import { CalendarIcon, Clock, MapPin, User } from "lucide-react"
import * as M from 'framer-motion'

export default function MonthlyPlanner() {
  const { events } = useEventStore()
  const [autoScroll, setAutoScroll] = useState(true)
  
  // Get today's events
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return isWithinInterval(eventDate, {
      start: startOfToday(),
      end: endOfToday()
    })
  })

  // Get upcoming events (next 7 days excluding today)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    return isWithinInterval(eventDate, {
      start: new Date(today.setHours(24, 0, 0, 0)), // Start from tomorrow
      end: nextWeek
    })
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'mesyuarat':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/20'
      case 'latihan':
        return 'bg-green-500/20 text-green-500 border-green-500/20'
      case 'cuti':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
      case 'program':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/20'
      default:
        return 'bg-slate-500/20 text-slate-500 border-slate-500/20'
    }
  }

  const EventCard = ({ event }: { event: any }) => (
    <M.motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-3 rounded-lg border bg-white/5 hover:bg-white/10 transition-colors ${getEventTypeColor(event.type)}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-medium text-slate-200">{event.title}</h4>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{event.description}</p>
        </div>
        <Badge variant="outline" className="capitalize shrink-0">
          {event.type}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{event.startTime} - {event.endTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          <span>{event.organizer}</span>
        </div>
      </div>
    </M.motion.div>
  )

  const MarqueeEvents = ({ events, title, count }: { events: any[], title: string, count: number }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
      if (!autoScroll || events.length <= 1) return

      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length)
      }, 5000) // Change event every 5 seconds

      return () => clearInterval(interval)
    }, [events.length])

    if (events.length === 0) {
      return (
        <div className="min-h-[100px] flex items-center justify-center">
          <p className="text-sm text-slate-400">No {title.toLowerCase()}</p>
        </div>
      )
    }

    return (
      <div 
        className="relative min-h-[100px]"
        onMouseEnter={() => setAutoScroll(false)}
        onMouseLeave={() => setAutoScroll(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-200">{title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {count} Events
            </Badge>
            {events.length > 1 && (
              <div className="text-xs text-slate-400">
                {currentIndex + 1} / {events.length}
              </div>
            )}
          </div>
        </div>
        <M.AnimatePresence mode="wait">
          <M.motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {events[currentIndex] && (
              <>
                {title === "Upcoming Events" && (
                  <div className="text-xs text-slate-100 mb-1">
                    {format(new Date(events[currentIndex].date), 'EEEE, MMMM d')}
                  </div>
                )}
                <EventCard event={events[currentIndex]} />
              </>
            )}
          </M.motion.div>
        </M.AnimatePresence>
      </div>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium text-slate-100">PERANCANGAN BULANAN</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <MarqueeEvents 
            events={todayEvents} 
            title="ACARA HARI INI" 
            count={todayEvents.length} 
          />
          <MarqueeEvents 
            events={upcomingEvents} 
            title="ACARA AKAN DATANG" 
            count={upcomingEvents.length} 
          />
        </div>
      </CardContent>
    </Card>
  )
} 