import { CountdownEvent } from '@/lib/types'

// In-memory storage (replace with database in production)
let countdowns: CountdownEvent[] = []

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('department-features-storage')
    if (stored) {
      const data = JSON.parse(stored)
      if (data.state && Array.isArray(data.state.countdowns)) {
        countdowns = data.state.countdowns
      }
    }
  } catch (error) {
    console.error('Error loading countdowns from storage:', error)
  }
}

export const storage = {
  getCountdowns: () => countdowns,
  
  addCountdown: (countdown: CountdownEvent) => {
    countdowns.push(countdown)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('department-features-storage')
        if (stored) {
          const data = JSON.parse(stored)
          data.state.countdowns = countdowns
          localStorage.setItem('department-features-storage', JSON.stringify(data))
        }
      } catch (error) {
        console.error('Error saving countdown to storage:', error)
      }
    }
    return countdown
  },
  
  updateCountdown: (countdown: CountdownEvent) => {
    const index = countdowns.findIndex(c => c.id === countdown.id)
    if (index !== -1) {
      countdowns[index] = countdown
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('department-features-storage')
          if (stored) {
            const data = JSON.parse(stored)
            data.state.countdowns = countdowns
            localStorage.setItem('department-features-storage', JSON.stringify(data))
          }
        } catch (error) {
          console.error('Error updating countdown in storage:', error)
        }
      }
      return countdown
    }
    return null
  },
  
  deleteCountdown: (id: string) => {
    const index = countdowns.findIndex(c => c.id === id)
    if (index !== -1) {
      countdowns.splice(index, 1)
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('department-features-storage')
          if (stored) {
            const data = JSON.parse(stored)
            data.state.countdowns = countdowns
            localStorage.setItem('department-features-storage', JSON.stringify(data))
          }
        } catch (error) {
          console.error('Error deleting countdown from storage:', error)
        }
      }
      return true
    }
    return false
  }
} 