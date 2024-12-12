export interface CountdownEvent {
  id: string
  title: string
  description: string
  targetDate: string
  createdAt: string
  isActive: boolean
}

export type CountdownEventFormData = Omit<CountdownEvent, 'id' | 'createdAt'> 