import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import type { CountdownEvent } from '@/lib/types'
import { serverStorage } from '@/lib/server-storage'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate the countdown data
    if (!data.title || !data.targetDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Ensure the target date is in the future
    const now = new Date().getTime()
    const targetDate = new Date(data.targetDate).getTime()
    if (targetDate <= now) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
        { status: 400 }
      )
    }
    
    // Create new countdown with generated ID
    const newCountdown: CountdownEvent = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      targetDate: data.targetDate,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    
    // Add the new countdown
    const savedCountdown = serverStorage.addCountdown(newCountdown)
    if (!savedCountdown) {
      return NextResponse.json(
        { error: 'Failed to save countdown' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(savedCountdown)
  } catch (error) {
    console.error('Error creating countdown:', error)
    return NextResponse.json(
      { error: 'Failed to create countdown' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const countdowns = serverStorage.getCountdowns()
    
    // Filter out expired countdowns
    const now = new Date().getTime()
    const activeCountdowns = countdowns.filter(countdown => {
      const targetDate = new Date(countdown.targetDate).getTime()
      return targetDate > now || countdown.isActive
    })
    
    // Update storage if we filtered out any countdowns
    if (activeCountdowns.length !== countdowns.length) {
      serverStorage.saveCountdowns(activeCountdowns)
    }
    
    return NextResponse.json(activeCountdowns)
  } catch (error) {
    console.error('Error fetching countdowns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch countdowns' },
      { status: 500 }
    )
  }
} 