import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

export interface Asset {
  id: string
  name: string
  type: 'Peralatan' | 'Bilik' | 'Kenderaan' | 'Lain-lain'
  status: 'Tersedia' | 'Sedang Digunakan' | 'Penyelenggaraan' | 'Ditempah'
  location: string
  description?: string
  lastMaintenance?: Date
  nextMaintenance?: Date
}

export interface FeatureItem {
  id: string
  content: string
  enabled: boolean
  width: 'full' | 'half' // Kawalan lebar container
  order: number // Kawalan susunan paparan
}

interface AppState {
  features: FeatureItem[]
  assets: Asset[]
  setFeatures: (features: FeatureItem[]) => void
  toggleFeature: (id: string) => void
  resetFeatures: () => void
  updateFeatureWidth: (id: string, width: 'full' | 'half') => void
  // Tindakan Aset
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  updateAsset: (asset: Asset) => void
  deleteAsset: (id: string) => void
}

interface Store {
  features: FeatureItem[]
  chatBubbleSize: 'small' | 'medium' | 'large'
  assets: Asset[]
  setFeatures: (features: FeatureItem[]) => void
  setChatBubbleSize: (size: 'small' | 'medium' | 'large') => void
  toggleFeature: (id: string) => void
  resetFeatures: () => void
  updateFeatureWidth: (id: string, width: 'full' | 'half') => void
  // Asset actions
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  updateAsset: (asset: Asset) => void
  deleteAsset: (id: string) => void
}

export const defaultFeatures: FeatureItem[] = [
  { id: 'prayer', content: 'Waktu Solat', enabled: true, width: 'full', order: 0 },
  { id: 'news', content: 'Berita Terkini', enabled: true, width: 'full', order: 1 },
  { id: 'calendar', content: 'Kalendar Bulanan', enabled: true, width: 'full', order: 2 },
  { id: 'staff', content: 'Status Kakitangan', enabled: true, width: 'half', order: 3 },
  { id: 'assets', content: 'Status Aset', enabled: true, width: 'half', order: 4 },
  { id: 'announcements', content: 'Pengumuman', enabled: true, width: 'half', order: 5 },
  { id: 'activity', content: 'Jadual Aktiviti', enabled: true, width: 'half', order: 6 },
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
    location: 'Jabatan ICT',
    description: 'Laptop untuk pembangunan',
  },
]

export const useStore = create<Store>()(
  persist(
    (set) => ({
      features: defaultFeatures,
      chatBubbleSize: 'medium',
      assets: initialAssets,
      setFeatures: (features) => set({ features }),
      setChatBubbleSize: (size) => set({ chatBubbleSize: size }),
      toggleFeature: (id) =>
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
          ),
        })),
      resetFeatures: () => set({ features: defaultFeatures }),
      updateFeatureWidth: (id, width) =>
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === id ? { ...feature, width } : feature
          ),
        })),
      // Asset actions
      setAssets: (assets) => set({ assets }),
      addAsset: (asset) => 
        set((state) => ({ 
          assets: [...state.assets, asset] 
        })),
      updateAsset: (asset) => 
        set((state) => ({
          assets: state.assets.map((a) => 
            a.id === asset.id ? asset : a
          )
        })),
      deleteAsset: (id) => 
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id)
        })),
    }),
    {
      name: 'department-features-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        features: state.features,
        chatBubbleSize: state.chatBubbleSize,
        assets: state.assets,
      }),
    }
  )
)

// Fungsi pembantu untuk memilih ciri tertentu
export const useFeature = (id: string) => {
  return useStore((state) => state.features.find((f) => f.id === id))
} 