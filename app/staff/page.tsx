'use client'

import StaffPresence from '@/components/StaffPresence'
import StaffAvailability from '@/components/StaffAvailability'

export default function StaffPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-slate-950">Staff Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StaffPresence />
        <StaffAvailability />
      </div>
    </main>
  )
}

