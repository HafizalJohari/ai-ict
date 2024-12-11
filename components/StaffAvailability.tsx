'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Circle, Clock, AlertCircle } from 'lucide-react'
import type { StaffData } from '@/app/api/staff/route'
import { format, isToday, startOfDay } from 'date-fns'

export default function StaffAvailability() {
  const [staffList, setStaffList] = useState<StaffData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch('/api/staff')
        if (!response.ok) throw new Error('Failed to fetch staff data')
        const data = await response.json()
        
        // Filter for today's entries only
        const todayData = data.filter((staff: StaffData) => {
          try {
            return isToday(new Date(staff.timestamp))
          } catch {
            return false
          }
        })

        // Sort by timestamp, most recent first
        const sortedData = todayData.sort((a: StaffData, b: StaffData) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        
        setStaffList(sortedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff data')
      } finally {
        setLoading(false)
      }
    }

    fetchStaffData()
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchStaffData, 5 * 60 * 1000)

    // Calculate time until next midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    // Set up midnight reset
    const midnightTimeout = setTimeout(() => {
      setStaffList([]) // Clear the list at midnight
      fetchStaffData() // Then fetch new data
    }, timeUntilMidnight)

    return () => {
      clearInterval(refreshInterval)
      clearTimeout(midnightTimeout)
    }
  }, [])

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('available')) return 'text-green-500'
    if (statusLower.includes('busy')) return 'text-yellow-500'
    if (statusLower.includes('meeting')) return 'text-orange-500'
    if (statusLower.includes('leave') || statusLower.includes('cuti')) return 'text-red-500'
    return 'text-gray-500'
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return format(date, 'dd/MM/yyyy h:mm a')
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-slate-100">Staff Availability</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-100">
            <AlertCircle className="h-4 w-4" />
            <span>Resets at midnight</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-100">
            <Clock className="h-4 w-4" />
            <span>Auto updates every 5 min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-100 py-8">
              Loading staff data...
            </div>
          ) : staffList.length > 0 ? (
            staffList.map((staff, index) => (
              <div 
                key={index}
                className="flex flex-col space-y-2 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Circle className={`h-3 w-3 ${getStatusColor(staff.status)} fill-current`} />
                    <span className="font-medium text-slate-200">{staff.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-100">{staff.position}</span>
                    <span className={`text-sm capitalize ${getStatusColor(staff.status)}`}>
                      {staff.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-100">
                  <span>{staff.department}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {formatTimestamp(staff.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-100 py-8">
              No staff updates for today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

