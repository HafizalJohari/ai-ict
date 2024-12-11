'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StaffMember {
  id: number
  name: string
  position: string
  status: 'Available' | 'Unavailable' | 'In Meeting'
  email: string
}

export default function StaffDashboard() {
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null)
  const [error, setError] = useState('')
  //const router = useRouter() //Removed

  useEffect(() => {
    // Simulating an API call to fetch the staff member's data
    const fetchStaffMember = async () => {
      try {
        // In a real application, you would make an API call here
        // For now, we'll use mock data
        const mockData: StaffMember = {
          id: 1,
          name: 'John Doe',
          position: 'Manager',
          status: 'Available',
          email: 'john@example.com'
        }
        setStaffMember(mockData)
      } catch (err) {
        setError('Failed to fetch staff member data')
      }
    }

    fetchStaffMember()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (staffMember) {
      setStaffMember({ ...staffMember, [e.target.name]: e.target.value })
    }
  }

  const handleStatusChange = (value: StaffMember['status']) => {
    if (staffMember) {
      setStaffMember({ ...staffMember, status: value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated data to your backend
    console.log('Updated staff member:', staffMember)
    // Implement API call here when backend is ready
  }

  //const handleLogout = () => { //Removed
  //  // Implement logout logic here
  //  // For now, we'll just redirect to the login page
  //  router.push('/login')
  //} //Removed

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!staffMember) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No staff member data found</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>My Dashboard</CardTitle>
        {/*<Button variant="outline" onClick={handleLogout}>Logout</Button>*/} {/*Removed*/}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={staffMember.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={staffMember.position}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={staffMember.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={handleStatusChange} value={staffMember.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
                <SelectItem value="In Meeting">In Meeting</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  )
}

