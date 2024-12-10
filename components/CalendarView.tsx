'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from '@/lib/eventStore'
import { format, addYears, subYears } from "date-fns"
import { CalendarIcon } from "lucide-react"
import EventList from './EventList'

interface CalendarViewProps {
  onDateSelect?: (date: Date) => void
}

export default function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [date, setDate] = useState<Date>(new Date())
  const { events, getEventsByDate } = useEventStore()

  // Set date range (5 years past to 5 years future)
  const today = new Date()
  const fromDate = subYears(today, 5)
  const toDate = addYears(today, 5)

  // Get events for the selected date
  const selectedDateEvents = getEventsByDate(date)

  // Function to get events for a specific date
  const getDayEvents = (day: Date) => {
    return events.filter(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    )
  }

  // Handle date selection
  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      onDateSelect?.(newDate)
    }
  }

  // Custom day render function
  const renderDay = (day: Date) => {
    const dayEvents = getDayEvents(day)
    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <time 
          dateTime={format(day, 'yyyy-MM-dd')} 
          className={`absolute top-1 left-1 text-sm ${isToday ? 'font-bold text-primary' : ''}`}
        >
          {format(day, 'd')}
        </time>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 right-1 flex gap-0.5">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={`w-1.5 h-1.5 rounded-full ${
                  event.type === 'meeting' ? 'bg-blue-500' :
                  event.type === 'training' ? 'bg-green-500' :
                  event.type === 'holiday' ? 'bg-yellow-500' :
                  'bg-slate-500'
                }`}
              />
            ))}
            {dayEvents.length > 3 && (
              <Badge variant="secondary" className="h-3 text-[10px] px-1">
                +{dayEvents.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium text-slate-100">Calendar</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[auto,400px] gap-6">
          <div className="min-w-[320px]">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              fromDate={fromDate}
              toDate={toDate}
              initialFocus
              className="rounded-md border border-white/20"
              components={{
                Day: ({ date: dayDate }) => renderDay(dayDate)
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-slate-200",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-200",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm relative p-0 rounded-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal",
                day_today: "bg-accent/50 text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_range_end: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_range_start: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              }}
            />
          </div>
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <EventList date={date} events={selectedDateEvents} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 