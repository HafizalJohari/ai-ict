'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Timer, Plus, Edit2, Trash2 } from 'lucide-react'
import type { CountdownEvent, CountdownEventFormData } from '@/lib/types'

const initialFormData: CountdownEventFormData = {
  title: '',
  description: '',
  targetDate: '',
  isActive: true,
}

export default function CountdownManager() {
  const [events, setEvents] = useState<CountdownEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CountdownEventFormData>(initialFormData)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/countdown')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (event?: CountdownEvent) => {
    if (event) {
      setEditingEventId(event.id)
      setFormData({
        title: event.title,
        description: event.description,
        targetDate: new Date(event.targetDate).toISOString().split('T')[0],
        isActive: event.isActive,
      })
    } else {
      setEditingEventId(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const method = editingEventId ? 'PUT' : 'POST'
      const url = editingEventId ? `/api/countdown/${editingEventId}` : '/api/countdown'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save event')
      
      fetchEvents()
      setIsDialogOpen(false)
      setFormData(initialFormData)
      setEditingEventId(null)
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this countdown?')) return

    try {
      const response = await fetch(`/api/countdown/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')
      
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleToggleActive = async (event: CountdownEvent) => {
    try {
      const response = await fetch(`/api/countdown/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          isActive: !event.isActive,
        }),
      })

      if (!response.ok) throw new Error('Failed to update event')
      
      fetchEvents()
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Timer className="h-6 w-6" />
          Countdown Manager
        </CardTitle>
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Countdown
        </Button>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEventId ? 'Edit Countdown' : 'Add New Countdown'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Event title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Event description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, targetDate: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingEventId ? 'Update Countdown' : 'Add Countdown'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading countdowns...
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target: {new Date(event.targetDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={event.isActive}
                    onCheckedChange={() => handleToggleActive(event)}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(event)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No countdowns added yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 