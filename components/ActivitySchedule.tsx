'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  organizer: string
}

export default function ActivitySchedule() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<Activity>({
    id: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: ''
  })

  // Load activities from localStorage on component mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('activities')
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities))
    }
  }, [])

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities))
  }, [activities])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditing) {
      setActivities(activities.map(activity => 
        activity.id === currentActivity.id ? currentActivity : activity
      ))
    } else {
      setActivities([...activities, {
        ...currentActivity,
        id: crypto.randomUUID()
      }])
    }

    setCurrentActivity({
      id: '',
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      organizer: ''
    })
    setIsEditing(false)
  }

  const handleEdit = (activity: Activity) => {
    setCurrentActivity(activity)
    setIsEditing(true)
  }

  const handleDelete = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Activity Schedule</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={currentActivity.title}
                onChange={(e) => setCurrentActivity({...currentActivity, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input
                id="organizer"
                value={currentActivity.organizer}
                onChange={(e) => setCurrentActivity({...currentActivity, organizer: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentActivity.date}
                onChange={(e) => setCurrentActivity({...currentActivity, date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={currentActivity.time}
                onChange={(e) => setCurrentActivity({...currentActivity, time: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={currentActivity.location}
                onChange={(e) => setCurrentActivity({...currentActivity, location: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentActivity.description}
              onChange={(e) => setCurrentActivity({...currentActivity, description: e.target.value})}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {isEditing ? 'Update Activity' : 'Add Activity'}
          </Button>
        </form>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.title}</TableCell>
                <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                <TableCell>{activity.time}</TableCell>
                <TableCell>{activity.location}</TableCell>
                <TableCell>{activity.organizer}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(activity)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this activity? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(activity.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

