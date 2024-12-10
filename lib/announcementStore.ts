import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Announcement {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  priority: 'low' | 'medium' | 'high'
  author: string
}

interface AnnouncementState {
  announcements: Announcement[]
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAnnouncement: (id: string, announcement: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => void
  deleteAnnouncement: (id: string) => void
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set) => ({
      announcements: [],
      addAnnouncement: (announcement) =>
        set((state) => ({
          announcements: [
            {
              ...announcement,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            ...state.announcements,
          ],
        })),
      updateAnnouncement: (id, updatedAnnouncement) =>
        set((state) => ({
          announcements: state.announcements.map((announcement) =>
            announcement.id === id
              ? {
                  ...announcement,
                  ...updatedAnnouncement,
                  updatedAt: new Date(),
                }
              : announcement
          ),
        })),
      deleteAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter(
            (announcement) => announcement.id !== id
          ),
        })),
    }),
    {
      name: 'announcement-storage',
    }
  )
) 