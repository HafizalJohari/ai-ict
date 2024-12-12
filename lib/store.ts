'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CountdownEvent } from '@/lib/types'

export interface Asset {
  id: string
  name: string
  type: 'Peralatan' | 'Bilik' | 'Kenderaan' | 'Lain-lain'
  status: 'Tersedia' | 'Sedang Digunakan' | 'Penyelenggaraan' | 'Ditempah'
  location: string
  description?: string
  lastMaintenance?: string
  nextMaintenance?: string
}

export interface FeatureItem {
  id: string
  content: string
  order: number
  width: 'full' | 'half'
  enabled: boolean
}

interface StoreState {
  features: FeatureItem[]
  chatBubbleSize: 'small' | 'medium' | 'large'
  assets: Asset[]
  countdowns: CountdownEvent[]
  setFeatures: (features: FeatureItem[]) => void
  toggleFeature: (id: string) => void
  updateFeatureWidth: (id: string, width: 'full' | 'half') => void
  resetFeatures: () => void
  setChatBubbleSize: (size: 'small' | 'medium' | 'large') => void
  // Asset actions
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  updateAsset: (asset: Asset) => void
  deleteAsset: (id: string) => void
  // Countdown actions
  setCountdowns: (countdowns: CountdownEvent[]) => void
  addCountdown: (countdown: CountdownEvent) => void
  updateCountdown: (countdown: CountdownEvent) => void
  deleteCountdown: (id: string) => void
}

export const defaultFeatures: FeatureItem[] = [
  { id: 'prayer', content: 'Waktu Solat', order: 0, width: 'half', enabled: true },
  { id: 'news', content: 'Berita', order: 1, width: 'half', enabled: true },
  { id: 'calendar', content: 'Kalendar', order: 2, width: 'half', enabled: true },
  { id: 'staff', content: 'Kakitangan', order: 3, width: 'half', enabled: true },
  { id: 'activity', content: 'Jadual Aktiviti', order: 4, width: 'full', enabled: true },
  { id: 'assets', content: 'Aset', order: 5, width: 'half', enabled: true },
  { id: 'announcements', content: 'Pengumuman', order: 6, width: 'half', enabled: true },
  { id: 'countdown', content: 'Kiraan Masa', order: 7, width: 'full', enabled: true },
]

const initialAssets: Asset[] = [
  {
    id: '1',
    name: 'Bilik Mesyuarat A',
    type: 'Bilik',
    status: 'Tersedia',
    location: 'Tingkat 1',
    description: 'Bilik mesyuarat utama dengan projektor',
  },
  {
    id: '2',
    name: 'Laptop HP-001',
    type: 'Peralatan',
    status: 'Sedang Digunakan',
    location: 'Unit ICT',
    description: 'Laptop untuk pembangunan sistem',
  },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      features: defaultFeatures,
      chatBubbleSize: 'medium',
      assets: initialAssets,
      countdowns: [],
      setFeatures: (features) => set({ features }),
      toggleFeature: (id) =>
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === id
              ? { ...feature, enabled: !feature.enabled }
              : feature
          ),
        })),
      updateFeatureWidth: (id, width) =>
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === id ? { ...feature, width } : feature
          ),
        })),
      resetFeatures: () =>
        set((state) => {
          // Get current assets and countdown features
          const currentAssets = state.features.find(f => f.id === 'assets')
          const currentCountdown = state.features.find(f => f.id === 'countdown')
          
          // Create new features array with preserved settings for assets and countdown
          const newFeatures = defaultFeatures.map(feature => {
            if (feature.id === 'assets' && currentAssets) {
              return {
                ...feature,
                enabled: currentAssets.enabled,
                width: currentAssets.width,
                order: currentAssets.order
              }
            }
            if (feature.id === 'countdown' && currentCountdown) {
              return {
                ...feature,
                enabled: currentCountdown.enabled,
                width: currentCountdown.width,
                order: currentCountdown.order
              }
            }
            return feature
          })
          
          return { 
            features: newFeatures,
            // Preserve both assets and countdowns data during reset
            assets: state.assets,
            countdowns: state.countdowns
          }
        }),
      setChatBubbleSize: (size) => set({ chatBubbleSize: size }),
      // Asset actions
      setAssets: (assets) => set({ assets }),
      addAsset: (asset) => set((state) => ({ 
        assets: [...state.assets, asset] 
      })),
      updateAsset: (asset) => set((state) => ({
        assets: state.assets.map((a) => 
          a.id === asset.id ? asset : a
        )
      })),
      deleteAsset: (id) => set((state) => ({
        assets: state.assets.filter((a) => a.id !== id)
      })),
      // Countdown actions
      setCountdowns: (countdowns) => {
        // Filter out expired countdowns
        const now = new Date().getTime()
        const activeCountdowns = countdowns.filter(countdown => {
          const targetDate = new Date(countdown.targetDate).getTime()
          return targetDate > now || countdown.isActive
        })
        set({ countdowns: activeCountdowns })
      },
      addCountdown: (countdown) => {
        const now = new Date().getTime()
        const targetDate = new Date(countdown.targetDate).getTime()
        
        set((state) => {
          // Only add if not expired
          if (targetDate > now) {
            const newCountdowns = [...state.countdowns, countdown]
            // Update localStorage manually
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('department-features-storage')
              if (stored) {
                const data = JSON.parse(stored)
                data.state.countdowns = newCountdowns
                localStorage.setItem('department-features-storage', JSON.stringify(data))
              }
            }
            return { countdowns: newCountdowns }
          }
          return state
        })
      },
      updateCountdown: (countdown) => {
        const now = new Date().getTime()
        const targetDate = new Date(countdown.targetDate).getTime()
        
        set((state) => {
          if (targetDate > now || countdown.isActive) {
            const newCountdowns = state.countdowns.map((c) =>
              c.id === countdown.id ? countdown : c
            )
            // Update localStorage manually
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('department-features-storage')
              if (stored) {
                const data = JSON.parse(stored)
                data.state.countdowns = newCountdowns
                localStorage.setItem('department-features-storage', JSON.stringify(data))
              }
            }
            return { countdowns: newCountdowns }
          }
          return state
        })
      },
      deleteCountdown: (id) => {
        set((state) => {
          const newCountdowns = state.countdowns.filter((c) => c.id !== id)
          // Update localStorage manually
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('department-features-storage')
            if (stored) {
              const data = JSON.parse(stored)
              data.state.countdowns = newCountdowns
              localStorage.setItem('department-features-storage', JSON.stringify(data))
            }
          }
          return { countdowns: newCountdowns }
        })
      },
    }),
    {
      name: 'department-features-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        features: state.features,
        chatBubbleSize: state.chatBubbleSize,
        assets: state.assets,
        countdowns: state.countdowns,
      }),
    }
  )
) 