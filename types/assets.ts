export interface Asset {
  id: string
  name: string
  type: 'Equipment' | 'Room' | 'Vehicle' | 'Other'
  status: 'Available' | 'In Use' | 'Maintenance' | 'Reserved'
  location: string
  description?: string
  lastMaintenance?: Date
  nextMaintenance?: Date
} 