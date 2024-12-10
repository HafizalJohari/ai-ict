import { NextResponse } from 'next/server'
import { initializeVectorStore } from '@/lib/vectorStore'

// In-memory storage for documents (replace with database in production)
let storedDocuments: Array<{
  id: string
  name: string
  content: string
  uploadedAt: string
}> = []

export async function GET() {
  try {
    return NextResponse.json({ documents: storedDocuments })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { documents } = body

    if (!Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Invalid documents format' },
        { status: 400 }
      )
    }

    // Process and store documents
    const newDocuments = documents.map((doc: { name: string, content: string }) => ({
      id: Math.random().toString(36).substring(7),
      name: doc.name,
      content: doc.content,
      uploadedAt: new Date().toISOString()
    }))

    storedDocuments = [...storedDocuments, ...newDocuments]

    // Initialize vector store with document contents
    const success = await initializeVectorStore(newDocuments.map(doc => doc.content))

    if (!success) {
      throw new Error('Failed to initialize vector store')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing documents:', error)
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    // Extract document ID from URL
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Remove document from storage
    const documentIndex = storedDocuments.findIndex(doc => doc.id === id)
    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    storedDocuments = storedDocuments.filter(doc => doc.id !== id)

    // Reinitialize vector store with remaining documents
    const success = await initializeVectorStore(storedDocuments.map(doc => doc.content))

    if (!success) {
      throw new Error('Failed to reinitialize vector store')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
} 