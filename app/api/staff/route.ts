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
    
    // Map the rows to our staff data structure with timestamp handling
    const staffData: StaffData[] = rows
      .map(row => {
        // Get raw timestamp from Google Sheet
        const rawTimestamp = row.get('Timestamp')
        
        // Skip invalid entries
        if (!rawTimestamp || !row.get('Name') || !row.get('Status')) {
          console.log('Skipping invalid row:', row)
          return null
        }

        // Convert DD/MM/YYYY HH:MM:SS to ISO string
        let timestamp: string
        try {
          // Split the date and time parts
          const [datePart, timePart] = rawTimestamp.split(',')[0].split(' ')
          const [day, month, year] = datePart.split('/')
          
          // Parse time - handle both "HH:MM:SS" and "HH:MM:SS AM/PM" formats
          let hours = 0, minutes = 0, seconds = 0
          if (timePart) {
            const timeMatch = timePart.match(/(\d+):(\d+):(\d+)/)
            if (timeMatch) {
              [, hours, minutes, seconds] = timeMatch.map(Number)
              
              // Adjust for AM/PM if present
              if (timePart.toLowerCase().includes('pm') && hours < 12) {
                hours += 12
              }
              if (timePart.toLowerCase().includes('am') && hours === 12) {
                hours = 0
              }
            }
          }
          
          // Create date object with local timezone
          const date = new Date(
            parseInt(year),
            parseInt(month) - 1, // Months are 0-based in JavaScript
            parseInt(day),
            hours,
            minutes,
            seconds
          )
          
          timestamp = date.toISOString()
        } catch (error) {
          console.log('Error parsing timestamp:', rawTimestamp, error)
          return null
        }

        return {
          timestamp,
          name: row.get('Name'),
          position: row.get('Position'),
          department: row.get('Department'),
          status: row.get('Status'),
          email: row.get('Email')
        }
      })
      .filter((data): data is StaffData => data !== null)

    console.log('Processed staff data:', staffData) // Debug log
    return NextResponse.json(staffData)
  } catch (error) {
    console.error('Error fetching staff data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff data' },
      { status: 500 }
    )
  }
} 