'use client'

import StaffPresence from '@/components/StaffPresence'
import ActivitySchedule from '@/components/ActivitySchedule'
import Announcements from '@/components/Announcements'
import AssetManagement from '@/components/AssetManagement'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Video from '@/components/Video'
import { useStore } from "@/lib/store"

export default function Dashboard() {
  const { features } = useStore()

  // Get sorted and enabled features
  const enabledFeatures = features
    .filter(f => f.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary text-slate-950">Department Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {enabledFeatures.map(feature => {
          const colSpan = feature.width === 'full' ? 'col-span-full' : ''
          
          switch (feature.id) {
            case 'video':
              return (
                <div key={feature.id} className={colSpan}>
                  <Video />
                </div>
              )
          }
        })}
      </div>
    </main>
  )
}

