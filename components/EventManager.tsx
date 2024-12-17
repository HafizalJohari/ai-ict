'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Trash2, Edit, Plus } from "lucide-react"
import { format } from 'date-fns'
import { useEventStore } from '@/lib/eventStore'
import EventForm from '@/components/EventForm'
import { Event } from '@/lib/eventStore'

export default function EventManager() {
  const { events, addEvent, deleteEvent, updateEvent } = useEventStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Get upcoming events (sorted by date)
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const handleAdd = (eventData: Partial<Event>) => {
    addEvent({
      ...eventData,
      id: crypto.randomUUID(),
    } as Event)
    setIsAddDialogOpen(false)
  }

  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (eventData: Partial<Event>) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData)
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id)
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-slate-950/20">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-950/10">
        <CardTitle className="text-lg font-medium text-slate-950">
          Manage Events
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-800 hover:bg-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new event.
              </DialogDescription>
            </DialogHeader>
            <EventForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm event={selectedEvent} onSubmit={handleUpdate} />
          )}
        </DialogContent>
      </Dialog>

      <CardContent className="p-6">
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col space-y-2 p-3 rounded-lg border border-slate-950/10 bg-white/5 hover:bg-slate-950/5 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-950">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-950 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.date), 'dd MMM yyyy')}</span>
                      {event.time && (
                        <>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{event.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(event)}
                      className="h-8 w-8 text-slate-950 hover:text-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-slate-950">{event.description}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-950">
              No upcoming events
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 