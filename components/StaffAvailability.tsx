'use client'

import { useStaffStore, type Staff, type StaffStatus } from '@/lib/staffStore'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Circle } from 'lucide-react'

export default function StaffAvailability() {
  const { staffList } = useStaffStore()

  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case 'available':
        return 'text-green-500'
      case 'busy':
        return 'text-yellow-500'
      case 'offline':
        return 'text-gray-500'
      case 'meeting':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-100">Staff Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staffList.map((staff) => (
            <div 
              key={staff.id}
              className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Circle className={`h-3 w-3 ${getStatusColor(staff.status)} fill-current`} />
                <span className="font-medium text-slate-200">{staff.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{staff.position}</span>
                <span className={`text-sm capitalize ${getStatusColor(staff.status)}`}>
                  {staff.status}
                </span>
              </div>
            </div>
          ))}
          {staffList.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No staff members available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

