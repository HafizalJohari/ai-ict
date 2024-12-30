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
        
        // Debug log
        console.log('Raw data from API:', data)
        
        // Ensure timestamps are valid and filter for today's entries
        const todayData = data.filter((staff: StaffData) => {
          if (!staff.timestamp) return false
          
          // Parse the timestamp - assuming it's in the format from Google Forms
          const date = new Date(staff.timestamp)
          if (isNaN(date.getTime())) return false
          
          return isToday(startOfDay(date))
        })

        // Sort by timestamp, most recent first
        const sortedData = todayData.sort((a: StaffData, b: StaffData) => {
          const dateA = new Date(a.timestamp)
          const dateB = new Date(b.timestamp)
          return dateB.getTime() - dateA.getTime()
        })
        
        setStaffList(sortedData)
      } catch (err) {
        console.error('Fetch error:', err)
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
    if (!status) return 'text-gray-500'
    
    const statusLower = status.toLowerCase()
    if (statusLower.includes('available') || statusLower.includes('berada di pejabat')) return 'text-green-500'
    if (statusLower.includes('busy')) return 'text-yellow-500'
    if (statusLower.includes('meeting')) return 'text-orange-500'
    if (statusLower.includes('leave') || statusLower.includes('cuti')) return 'text-red-500'
    return 'text-gray-500'
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) {
      console.log('Empty timestamp')
      return 'Invalid date'
    }
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        console.log('Invalid timestamp format:', timestamp)
        return 'Invalid date'
      }
      
      // Convert UTC to local time and format
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      return format(localDate, 'dd/MM/yyyy h:mm a')
    } catch (error) {
      console.error('Date formatting error:', error, 'for timestamp:', timestamp)
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
        <CardTitle className="text-lg font-medium text-slate-100">KEBERADAAN PEGAWAI UNIT ICT</CardTitle>
        
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
                    <Clock className="h-3 w-3" text-slate-100/>
                    <span>Updated: {formatTimestamp(staff.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-amber-400 py-8">
              All staff are available today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

