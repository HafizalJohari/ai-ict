'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EventForm from '@/components/EventForm'
import { useEventStore } from '@/lib/eventStore'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from 'date-fns'

export default function CalendarPage() {
  const { addEvent, events } = useEventStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleAddEvent = (eventData: any) => {
    addEvent({
      ...eventData,
      date: selectedDate,
    })
    setIsDialogOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  // Get events for selected date
  const selectedDateEvents = events.filter(event => 
    format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-950">Department Calendar</h1>
        <Button 
          className="bg-slate-900 hover:bg-slate-800 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          Add New Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-[auto,400px] gap-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-slate-900",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-900",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm relative p-0 rounded-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal",
                day_today: "bg-slate-100 text-slate-900 font-semibold",
                day_outside: "text-slate-400 opacity-50",
                day_disabled: "text-slate-400 opacity-50",
                day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                day_hidden: "invisible",
                day_selected: "bg-slate-900 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-900 focus:text-white",
                day_range_end: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                day_range_start: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
              }}
            />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-50 border">
                    <h3 className="font-medium text-slate-900">{event.title}</h3>
                    <div className="flex items-center gap-2 text-slate-600 mt-2">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.date), 'h:mm a')}</span>
                    </div>
                    {event.description && (
                      <p className="text-slate-600 mt-2 text-sm">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-4">No events scheduled for this date</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-slate-900">Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for {format(selectedDate, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleAddEvent} />
        </DialogContent>
      </Dialog>
    </main>
  )
} 