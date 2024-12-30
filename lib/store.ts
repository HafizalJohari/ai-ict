'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FeatureItem {
  id: string
  content: string
  enabled: boolean
  order: number
  width: 'full' | 'half'
}

interface DashboardStore {
  features: FeatureItem[]
  chatBubbleSize: 'small' | 'medium' | 'large'
  newsSettings: {
    enabled: boolean
    autoScroll: boolean
    refreshInterval: number // in minutes
    displayCount: number
  }
  videoSettings: {
    enabled: boolean
    embedUrl: string
    autoplay: boolean
  }
  setFeatures: (features: FeatureItem[]) => void
  toggleFeature: (id: string) => void
  updateFeatureWidth: (id: string, width: 'full' | 'half') => void
  resetFeatures: () => void
  setChatBubbleSize: (size: 'small' | 'medium' | 'large') => void
  updateNewsSettings: (settings: Partial<DashboardStore['newsSettings']>) => void
  updateVideoSettings: (settings: Partial<DashboardStore['videoSettings']>) => void
}

export const defaultFeatures: FeatureItem[] = [
  { id: 'prayer', content: 'Prayer Times', enabled: true, order: 0, width: 'half' },
  { id: 'news', content: 'News Feed', enabled: true, order: 1, width: 'half' },
  { id: 'calendar', content: 'Calendar', enabled: true, order: 2, width: 'half' },
  { id: 'staff', content: 'Staff Presence', enabled: true, order: 3, width: 'half' },
  { id: 'assets', content: 'Assets Overview', enabled: true, order: 4, width: 'half' },
  { id: 'announcements', content: 'Announcements', enabled: true, order: 5, width: 'half' },
  { id: 'activity', content: 'Recent Activity', enabled: true, order: 6, width: 'half' },
  { id: 'countdown', content: 'Countdown', enabled: true, order: 7, width: 'half' },
  { id: 'video', content: 'Video Feed', enabled: true, order: 8, width: 'half' },
]

export const useStore = create<DashboardStore>()(
  persist(
    (set) => ({
      features: defaultFeatures,
      chatBubbleSize: 'medium',
      newsSettings: {
        enabled: true,
        autoScroll: true,
        refreshInterval: 5,
        displayCount: 5
      },
      videoSettings: {
        enabled: true,
        embedUrl: '',
        autoplay: false
      },
      setFeatures: (features) => set({ features }),
      toggleFeature: (id) => set((state) => ({
        features: state.features.map((f) =>
          f.id === id ? { ...f, enabled: !f.enabled } : f
        ),
      })),
      updateFeatureWidth: (id, width) => set((state) => ({
        features: state.features.map((f) =>
          f.id === id ? { ...f, width } : f
        ),
      })),
      resetFeatures: () => set({ features: defaultFeatures }),
      setChatBubbleSize: (size) => set({ chatBubbleSize: size }),
      updateNewsSettings: (settings) => set((state) => ({
        newsSettings: { ...state.newsSettings, ...settings }
      })),
      updateVideoSettings: (settings) => set((state) => ({
        videoSettings: { ...state.videoSettings, ...settings }
      })),
    }),
    {
      name: 'dashboard-storage',
    }
  )
) 