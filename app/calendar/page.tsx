'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import CalendarView from '@/components/CalendarView'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import EventForm from '@/components/EventForm'
import { useEventStore } from '@/lib/eventStore'

export default function CalendarPage() {
  const { addEvent } = useEventStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleAddEvent = (eventData: any) => {
    addEvent({
      ...eventData,
      date: selectedDate,
    })
    setIsDialogOpen(false)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Department Calendar</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new event to the calendar.
              </DialogDescription>
            </DialogHeader>
            <EventForm onSubmit={handleAddEvent} />
          </DialogContent>
        </Dialog>
      </div>
      <CalendarView onDateSelect={handleDateSelect} />
    </main>
  )
} 