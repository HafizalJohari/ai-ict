'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StaffData } from '@/app/api/staff/route'

export default function StaffPresence() {
  const [staffList, setStaffList] = useState<StaffData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch('/api/staff')
        if (!response.ok) throw new Error('Failed to fetch staff data')
        const data = await response.json()
        setStaffList(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff data')
      } finally {
        setLoading(false)
      }
    }

    fetchStaffData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchStaffData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('available')) return 'text-green-500'
    if (statusLower.includes('busy') || statusLower.includes('meeting')) return 'text-red-500'
    if (statusLower.includes('cuti') || statusLower.includes('leave')) return 'text-lime-500'
    return 'text-gray-500'
  }

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium text-slate-100">Staff Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="rounded-md border border-white/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                    Loading staff data...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <TableRow key={index} className="group">
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.position}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(staff.status)} bg-current`} />
                        <span className={getStatusColor(staff.status)}>{staff.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      {new Date(staff.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                    {searchQuery ? 'No staff members found' : 'No staff members available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

