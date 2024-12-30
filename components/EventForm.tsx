'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { format, parse } from 'date-fns'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Event } from '@/lib/eventStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define form data structure
interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  type: 'meeting' | 'training' | 'holiday' | 'other'
  location: string
}

interface EventFormProps {
  event?: Event
  selectedDate?: Date
  onSubmit: (data: Partial<Event>) => void
}

export default function EventForm({ event, selectedDate, onSubmit }: EventFormProps) {
  const form = useForm<EventFormData>({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      date: selectedDate 
        ? format(selectedDate, 'yyyy-MM-dd')
        : event?.date 
          ? format(new Date(event.date), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd'),
      time: event?.time || '',
      type: event?.type || 'other',
      location: event?.location || '',
    },
    resolver: zodResolver(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        date: z.string().min(1, 'Date is required'),
        time: z.string().optional(),
        type: z.enum(['meeting', 'training', 'holiday', 'other']),
        location: z.string().optional(),
      })
    ),
  })

  const handleSubmit: SubmitHandler<EventFormData> = (data) => {
    try {
      const parsedDate = parse(data.date, 'yyyy-MM-dd', new Date())
      if (data.time) {
        const [hours, minutes] = data.time.split(':')
        parsedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10))
      }
      
      const eventData: Partial<Event> = {
        ...data,
        date: parsedDate,
      }
      onSubmit(eventData)
    } catch (error) {
      console.error('Error parsing date:', error)
      form.setError('date', { message: 'Invalid date format' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter event description" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {event ? 'Update Event' : 'Add Event'}
        </Button>
      </form>
    </Form>
  )
} 