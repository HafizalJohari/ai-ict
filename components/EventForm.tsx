'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Event } from '@/lib/eventStore'
import { useStaffStore } from '@/lib/staffStore'
import { Calendar } from "@/components/ui/calendar"
import { format, addYears, subYears } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface EventFormProps {
  onSubmit: (data: any) => void
  initialData?: Event
  isEditing?: boolean
}

export default function EventForm({ onSubmit, initialData, isEditing = false }: EventFormProps) {
  const { staffList } = useStaffStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    organizer: '',
    type: 'meeting' as const,
    staffInCharge: ''
  })

  // Set date range (5 years past to 5 years future)
  const today = new Date()
  const fromDate = subYears(today, 5)
  const toDate = addYears(today, 5)

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date),
        staffInCharge: initialData.staffInCharge || ''
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date
      }))
    }
  }

  // Filter available staff (not offline)
  const availableStaff = staffList.filter(staff => staff.status !== 'offline')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Event title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Event description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={handleDateSelect}
              fromDate={fromDate}
              toDate={toDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange('startTime')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange('endTime')}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={handleChange('location')}
          placeholder="Event location"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizer">Organizer</Label>
        <Input
          id="organizer"
          value={formData.organizer}
          onChange={handleChange('organizer')}
          placeholder="Event organizer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="staffInCharge">Staff in Charge</Label>
        <Select
          value={formData.staffInCharge}
          onValueChange={handleSelectChange('staffInCharge')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select staff in charge" />
          </SelectTrigger>
          <SelectContent>
            {availableStaff.map(staff => (
              <SelectItem 
                key={staff.id} 
                value={staff.id}
                className="flex items-center gap-2"
              >
                <span className="font-medium">{staff.name}</span>
                <span className="text-sm text-muted-foreground">({staff.position})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Event Type</Label>
        <Select
          value={formData.type}
          onValueChange={handleSelectChange('type')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="holiday">Holiday</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Update Event' : 'Add Event'}
      </Button>
    </form>
  )
} 