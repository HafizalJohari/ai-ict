'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAnnouncementStore, type Announcement } from '@/lib/announcementStore'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

function TimeDisplay({ date }: { date: Date }) {
  const [formattedTime, setFormattedTime] = useState<string>('')

  useEffect(() => {
    setFormattedTime(format(new Date(date), 'PPp'))
  }, [date])

  if (!formattedTime) return null

  return <span>{formattedTime}</span>
}

export default function AnnouncementOverview() {
  const { announcements } = useAnnouncementStore()
  const [contentHeight, setContentHeight] = useState('auto')

  useEffect(() => {
    // Update height based on content and viewport
    const updateHeight = () => {
      const vh = window.innerHeight
      const minHeight = 200 // minimum height in pixels
      const maxHeight = vh * 0.4 // 40% of viewport height
      const contentSize = Math.min(Math.max(announcements.length * 100, minHeight), maxHeight)
      setContentHeight(`${contentSize}px`)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [announcements.length])

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-slate-500'
    }
  }

  const getPriorityText = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'Penting'
      case 'medium':
        return 'Sederhana'
      case 'low':
        return 'Biasa'
      default:
        return priority
    }
  }

  // Sort announcements by date (newest first) and priority
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    // First sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then sort by date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20 w-full">
      <CardContent className="p-4">
        <ScrollArea className={`pr-4 transition-all duration-300`} style={{ height: contentHeight }}>
          <div className="space-y-3">
            {sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">
                          {announcement.author}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-sm ${getPriorityColor(
                            announcement.priority
                          )}`}
                        >
                          <AlertCircle className="h-3 w-3" />
                          {getPriorityText(announcement.priority)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <TimeDisplay date={announcement.createdAt} />
                        {announcement.updatedAt > announcement.createdAt && (
                          <span className="ml-2 text-slate-500">
                            (dikemaskini <TimeDisplay date={announcement.updatedAt} />)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                Tiada pengumuman buat masa ini
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
