import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StaffStatus = 'available' | 'busy' | 'meeting' | 'cuti'

export interface Staff {
  id: string
  name: string
  position: string
  status: StaffStatus
  department: string
  email: string
  lastUpdated: Date
}

interface StaffState {
  staffList: Staff[]
  addStaff: (staff: Omit<Staff, 'id' | 'lastUpdated'>) => void
  updateStaff: (id: string, staff: Partial<Staff>) => void
  deleteStaff: (id: string) => void
  updateStaffStatus: (id: string, status: StaffStatus) => void
}

// Initial staff data
const initialStaff: Staff[] = [
  {
    id: '1',
    name: 'HAFIZAL',
    position: 'F3',
    department: 'ICT',
    status: 'busy',
    email: 'hafizal@example.com',
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'HAZIM',
    position: 'F1',
    department: 'ICT',
    status: 'available',
    email: 'hazim@example.com',
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'HAFSAH',
    position: 'F3',
    department: 'ICT',
    status: 'available',
    email: 'hafsah@example.com',
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'ICT PPDJB',
    position: 'F1',
    department: 'ICT',
    status: 'available',
    email: 'ictppdjb@moe.gov.my',
    lastUpdated: new Date(),
  }
]

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staffList: initialStaff, // Set initial data
      addStaff: (staff) =>
        set((state) => ({
          staffList: [
            ...state.staffList,
            {
              ...staff,
              id: crypto.randomUUID(),
              lastUpdated: new Date(),
            },
          ],
        })),
      updateStaff: (id, updatedStaff) =>
        set((state) => ({
          staffList: state.staffList.map((staff) =>
            staff.id === id
              ? { ...staff, ...updatedStaff, lastUpdated: new Date() }
              : staff
          ),
        })),
      deleteStaff: (id) =>
        set((state) => ({
          staffList: state.staffList.filter((staff) => staff.id !== id),
        })),
      updateStaffStatus: (id, status) =>
        set((state) => ({
          staffList: state.staffList.map((staff) =>
            staff.id === id
              ? { ...staff, status, lastUpdated: new Date() }
              : staff
          ),
        })),
    }),
    {
      name: 'staff-storage',
    }
  )
) 