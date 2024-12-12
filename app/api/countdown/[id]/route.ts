import { NextResponse } from 'next/server'
import type { CountdownEvent } from '@/lib/types'
import { serverStorage } from '@/lib/server-storage'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const updatedCountdown = serverStorage.updateCountdown(params.id, data)
    
    if (!updatedCountdown) {
      return NextResponse.json(
        { error: 'Countdown not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedCountdown)
  } catch (error) {
    console.error('Error updating countdown:', error)
    return NextResponse.json(
      { error: 'Failed to update countdown' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = serverStorage.deleteCountdown(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Countdown not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting countdown:', error)
    return NextResponse.json(
      { error: 'Failed to delete countdown' },
      { status: 500 }
    )
  }
} 