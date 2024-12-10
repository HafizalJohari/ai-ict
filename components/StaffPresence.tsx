'use client'

import { useState } from 'react'
import { useStaffStore, type Staff, type StaffStatus } from '@/lib/staffStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Trash2, UserPlus, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StaffFormData {
  name: string
  position: string
  status: StaffStatus
  department: string
  email: string
}

const initialFormData: StaffFormData = {
  name: '',
  position: '',
  status: 'available',
  department: '',
  email: '',
}

export default function StaffPresence() {
  const { staffList, addStaff, updateStaff, deleteStaff, updateStaffStatus } = useStaffStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffFormData>(initialFormData)
  const [searchQuery, setSearchQuery] = useState('')

  const handleOpenDialog = (staff?: Staff) => {
    if (staff) {
      setEditingStaffId(staff.id)
      setFormData({
        name: staff.name,
        position: staff.position,
        status: staff.status,
        department: staff.department,
        email: staff.email,
      })
    } else {
      setEditingStaffId(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return

    if (editingStaffId) {
      updateStaff(editingStaffId, formData)
    } else {
      addStaff(formData)
    }

    setFormData(initialFormData)
    setEditingStaffId(null)
    setIsDialogOpen(false)
  }

  const handleDelete = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      deleteStaff(staffId)
    }
  }

  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case 'available':
        return 'text-green-500'
      case 'busy':
        return 'text-yellow-500'
      case 'offline':
        return 'text-gray-500'
      case 'meeting':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium text-slate-100">Staff Management</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff
        </Button>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Staff name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, position: e.target.value }))
                  }
                  placeholder="Staff position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, department: e.target.value }))
                  }
                  placeholder="Department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: StaffStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingStaffId ? 'Update Staff Member' : 'Add Staff Member'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="rounded-md border border-white/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="group">
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.position}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <Select
                        value={staff.status}
                        onValueChange={(value: StaffStatus) =>
                          updateStaffStatus(staff.id, value)
                        }
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(staff.status)}`} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(staff)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                    {searchQuery ? 'No staff members found' : 'No staff members added yet'}
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

