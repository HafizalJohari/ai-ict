import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { startOfDay, addDays, isAfter, isBefore, parseISO, isToday } from 'date-fns'

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  startTime: string
  endTime: string
  location: string
  organizer: string
  type: 'mesyuarat' | 'latihan' | 'cuti' | 'program' | 'lain-lain'
  status: 'akan datang' | 'sedang berlangsung' | 'selesai' | 'dibatalkan'
  staffInCharge: string
  participants?: string[]
  attachments?: string[]
  reminder?: boolean
}

// Initial events with future dates
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Mesyuarat Jabatan',
    description: 'Kajian semula kemajuan jabatan bulanan',
    date: addDays(new Date(), 1), // Tomorrow
    startTime: '09:00',
    endTime: '10:30',
    location: 'Bilik Mesyuarat A',
    organizer: 'Ketua Jabatan',
    type: 'mesyuarat',
    status: 'akan datang',
    staffInCharge: '1',
    participants: ['1', '2', '3'],
    reminder: true
  },
  {
    id: '2',
    title: 'Latihan ICT',
    description: 'Sesi latihan sistem baharu',
    date: addDays(new Date(), 2), // Day after tomorrow
    startTime: '14:00',
    endTime: '16:00',
    location: 'Bilik Latihan',
    organizer: 'Jabatan ICT',
    type: 'latihan',
    status: 'akan datang',
    staffInCharge: '2',
    participants: ['2', '4', '5'],
    reminder: true
  }
]

interface EventStore {
  events: Event[]
  addEvent: (event: Omit<Event, 'id' | 'status'>) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  deleteEvent: (id: string) => void
  getEventsByDate: (date: Date) => Event[]
  getUpcomingEvents: (days?: number) => Event[]
  getPastEvents: (days?: number) => Event[]
  getEventsByType: (type: Event['type']) => Event[]
  getEventsByStatus: (status: Event['status']) => Event[]
}

const storage = {
  getItem: (name: string): string | null => {
    try {
      const str = localStorage.getItem(name)
      if (!str) return null
      
      const data = JSON.parse(str)
      if (!data || !data.state || !Array.isArray(data.state.events)) {
        return JSON.stringify({ state: { events: initialEvents } })
      }

      // Convert ISO date strings to Date objects
      const events = data.state.events.map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }))

      return JSON.stringify({
        ...data,
        state: { ...data.state, events }
      })
    } catch (error) {
      console.error('Error reading from storage:', error)
      return JSON.stringify({ state: { events: initialEvents } })
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      const data = JSON.parse(value)
      if (!data || !data.state) {
        localStorage.setItem(name, JSON.stringify({ state: { events: initialEvents } }))
        return
      }

      // Convert Date objects to ISO strings
      const events = (data.state.events || []).map((event: Event) => ({
        ...event,
        date: event.date instanceof Date ? event.date.toISOString() : event.date
      }))

      localStorage.setItem(name, JSON.stringify({
        ...data,
        state: { ...data.state, events }
      }))
    } catch (error) {
      console.error('Error writing to storage:', error)
    }
  },

  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.error('Error removing from storage:', error)
    }
  }
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: initialEvents,
      
      addEvent: (eventData) => set((state) => {
        const eventDate = new Date(eventData.date)
        const status = 'akan datang'
        
        return {
          events: [...state.events, { 
            ...eventData, 
            id: crypto.randomUUID(),
            status,
            date: eventDate
          }]
        }
      }),
      
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
      },

      getEventsByStatus: (status) => {
        return get().events.filter(event => event.status === status)
      }
    }),
    {
      name: 'department-events-storage',
      version: 2,
      storage: createJSONStorage(() => storage)
    }
  )
) 