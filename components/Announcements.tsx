'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useAnnouncementStore, type Announcement } from '@/lib/announcementStore'
import { useStaffStore } from '@/lib/staffStore'
import { format } from 'date-fns'

interface AnnouncementFormData {
  content: string
  priority: 'low' | 'medium' | 'high'
  author: string
}

const initialFormData: AnnouncementFormData = {
  content: '',
  priority: 'medium',
  author: '',
}

function TimeDisplay({ date }: { date: Date }) {
  const [formattedTime, setFormattedTime] = useState<string>('')

  useEffect(() => {
    setFormattedTime(format(new Date(date), 'PPp'))
  }, [date])

  if (!formattedTime) return null

  return <span>{formattedTime}</span>
}

export default function Announcements() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncementStore()
  const { staffList } = useStaffStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnnouncementFormData>(initialFormData)

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncementId(announcement.id)
      setFormData({
        content: announcement.content,
        priority: announcement.priority,
        author: announcement.author,
      })
    } else {
      setEditingAnnouncementId(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.content || !formData.author) return

    if (editingAnnouncementId) {
      updateAnnouncement(editingAnnouncementId, formData)
    } else {
      addAnnouncement(formData)
    }

    setFormData(initialFormData)
    setEditingAnnouncementId(null)
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id)
    }
  }

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

  // Get available staff names for author selection
  const availableAuthors = staffList.map(staff => ({
    id: staff.id,
    name: staff.name,
    email: staff.email
  }))

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-950">Announcements   </h2>
          <Button
            variant="outline"
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2"
          >
            <Plus className="h-3 w-3" /> New Announcement
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncementId ? 'Edit Announcement' : 'New Announcement'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Select
                  value={formData.author}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, author: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author.id} value={author.name}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Announcement</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your announcement here..."
                  className="h-32"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingAnnouncementId ? 'Update Announcement' : 'Post Announcement'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 group hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{announcement.author}</span>
                        <span className={`flex items-center gap-1 text-sm ${getPriorityColor(announcement.priority)}`}>
                          <AlertCircle className="h-3 w-3" />
                          {announcement.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <TimeDisplay date={announcement.createdAt} />
                        {announcement.updatedAt > announcement.createdAt && (
                          <span className="ml-2 text-slate-500">
                            (edited <TimeDisplay date={announcement.updatedAt} />)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(announcement)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{announcement.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                No announcements yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

