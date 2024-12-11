import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

// Types for our staff data
export interface StaffData {
  timestamp: string
  name: string
  position: string
  department: string
  status: string
  email: string
}

export async function GET() {
  try {
    // Initialize auth - environment variables must be set
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth)
    
    // Load the document properties and sheets
    await doc.loadInfo()

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0]
    
    // Get all rows
    const rows = await sheet.getRows()
    
    // Map the rows to our staff data structure
    const staffData: StaffData[] = rows.map(row => ({
      timestamp: row.get('Timestamp'),
      name: row.get('Name'),
      position: row.get('Position'),
      department: row.get('Department'),
      status: row.get('Status'),
      email: row.get('Email')
    }))

    // Return the data
    return NextResponse.json(staffData)
  } catch (error) {
    console.error('Error fetching staff data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff data' },
      { status: 500 }
    )
  }
} 