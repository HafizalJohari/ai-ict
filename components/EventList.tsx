'use client'

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, MapPin, User, Edit, Trash2 } from "lucide-react"
import { Event } from "@/lib/eventStore"
import { useStaffStore } from "@/lib/staffStore"
import { useEventStore } from "@/lib/eventStore"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import EventForm from "./EventForm"

interface EventListProps {
  date: Date
  events: Event[]
}

export default function EventList({ date, events }: EventListProps) {
  const { staffList } = useStaffStore()
  const { updateEvent, deleteEvent } = useEventStore()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/20'
      case 'training':
        return 'bg-green-500/20 text-green-500 border-green-500/20'
      case 'holiday':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-slate-500/20 text-slate-500 border-slate-500/20'
    }
  }

  // Get staff name by ID
  const getStaffName = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId)
    return staff ? `${staff.name} (${staff.position})` : 'Not assigned'
  }

  // Handle edit event
  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setIsEditDialogOpen(true)
  }

  // Handle delete event
  const handleDelete = (event: Event) => {
    setSelectedEvent(event)
    setIsDeleteDialogOpen(true)
  }

  // Handle update event
  const handleUpdate = (eventData: any) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData)
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id)
      setIsDeleteDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  if (!mounted) {
    return null // Return null on first render to avoid hydration mismatch
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-slate-200">
            Events for {format(date, 'MMMM d, yyyy')}
          </h3>
          <Badge variant="outline" className="text-xs">
            {events.length} Events
          </Badge>
        </div>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event.id}
                className={`p-3 rounded-lg border bg-white/5 hover:bg-white/10 transition-colors ${getEventTypeColor(event.type)}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-medium text-slate-200">{event.title}</h4>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize shrink-0">
                      {event.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-200"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => handleDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
                    <span>{getStaffName(event.staffInCharge)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 bg-white/5 rounded-lg border border-white/10">
              <p>No events scheduled for this day.</p>
              <p className="text-sm mt-1">Click on a date to add an event.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Make changes to the event details below.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              onSubmit={handleUpdate}
              initialData={selectedEvent}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{selectedEvent?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 