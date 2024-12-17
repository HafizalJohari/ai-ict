import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { startOfDay, addDays, isAfter, isBefore } from 'date-fns'

export interface Event {
  id: string
  title: string
  description?: string
  date: Date
  time?: string
  type: 'meeting' | 'training' | 'holiday' | 'other'
  location?: string
}

// Initial events with future dates
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Mesyuarat Jabatan',
    description: 'Kajian semula kemajuan jabatan bulanan',
    date: addDays(new Date(), 1),
    time: '09:00',
    type: 'meeting',
    location: 'Bilik Mesyuarat A'
  },
  {
    id: '2',
    title: 'Latihan ICT',
    description: 'Sesi latihan sistem baharu',
    date: addDays(new Date(), 2),
    time: '14:00',
    type: 'training',
    location: 'Bilik Latihan'
  }
]

interface EventStore {
  events: Event[]
  addEvent: (event: Omit<Event, 'id'>) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  deleteEvent: (id: string) => void
  getEventsByDate: (date: Date) => Event[]
  getUpcomingEvents: (days?: number) => Event[]
  getPastEvents: (days?: number) => Event[]
  getEventsByType: (type: Event['type']) => Event[]
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: initialEvents,
      
      addEvent: (eventData) => set((state) => ({
        events: [...state.events, { ...eventData, id: crypto.randomUUID() }]
      })),
      
      updateEvent: (id, eventData) => set((state) => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        )
      })),
      
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),
      
      getEventsByDate: (date) => {
        const events = get().events
        const targetDate = startOfDay(new Date(date)).toISOString()
        return events.filter(event => 
          startOfDay(new Date(event.date)).toISOString() === targetDate
        )
      },

      getUpcomingEvents: (days = 7) => {
        const events = get().events
        const now = new Date()
        const futureDate = addDays(now, days)
        return events
          .filter(event => {
            const eventDate = new Date(event.date)
            return isAfter(eventDate, now) && isBefore(eventDate, futureDate)
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      },

      getPastEvents: (days = 7) => {
        const events = get().events
        const now = new Date()
        const pastDate = addDays(now, -days)
        return events
          .filter(event => {
            const eventDate = new Date(event.date)
            return isBefore(eventDate, now) && isAfter(eventDate, pastDate)
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      getEventsByType: (type) => {
        return get().events.filter(event => event.type === type)
      }
    }),
    {
      name: 'event-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
) 