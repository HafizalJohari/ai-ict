import { CountdownEvent } from './types'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'countdowns.json')

// Ensure data directory exists
try {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true })
} catch (error) {
  console.error('Error creating data directory:', error)
}

// Initialize empty data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]))
  } catch (error) {
    console.error('Error creating data file:', error)
  }
}

export const serverStorage = {
  getCountdowns: (): CountdownEvent[] => {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading countdowns:', error)
      return []
    }
  },

  saveCountdowns: (countdowns: CountdownEvent[]): void => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(countdowns, null, 2))
    } catch (error) {
      console.error('Error saving countdowns:', error)
    }
  },

  addCountdown: (countdown: CountdownEvent): CountdownEvent | null => {
    try {
      const countdowns = serverStorage.getCountdowns()
      countdowns.push(countdown)
      serverStorage.saveCountdowns(countdowns)
      return countdown
    } catch (error) {
      console.error('Error adding countdown:', error)
      return null
    }
  },

  updateCountdown: (id: string, data: Partial<CountdownEvent>): CountdownEvent | null => {
    try {
      const countdowns = serverStorage.getCountdowns()
      const index = countdowns.findIndex(c => c.id === id)
      if (index === -1) return null

      const updatedCountdown = {
        ...countdowns[index],
        ...data,
        id // Ensure ID doesn't change
      }
      countdowns[index] = updatedCountdown
      serverStorage.saveCountdowns(countdowns)
      return updatedCountdown
    } catch (error) {
      console.error('Error updating countdown:', error)
      return null
    }
  },

  deleteCountdown: (id: string): boolean => {
    try {
      const countdowns = serverStorage.getCountdowns()
      const index = countdowns.findIndex(c => c.id === id)
      if (index === -1) return false

      countdowns.splice(index, 1)
      serverStorage.saveCountdowns(countdowns)
      return true
    } catch (error) {
      console.error('Error deleting countdown:', error)
      return false
    }
  }
} 