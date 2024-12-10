import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { searchSimilarDocuments } from '@/lib/vectorStore'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    // Parse request body
    const body = await req.json()
    const { messages }: { messages: ChatMessage[] } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Validate the latest message
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage?.content) {
      return NextResponse.json(
        { error: 'Invalid message content' },
        { status: 400 }
      )
    }

    console.log('Processing user message:', latestMessage.content)
    
    // Search for relevant documents
    const relevantDocs = await searchSimilarDocuments(latestMessage.content)
    console.log('Found relevant documents:', relevantDocs.length)
    
    // Create context from relevant documents
    const context = relevantDocs.length > 0
      ? `Here is some relevant information from our knowledge base:
         ${relevantDocs.map((doc, i) => `[Document ${i + 1}]: ${doc}`).join('\n\n')}
         
         Please use this information to help answer the question. If the information is relevant, 
         incorporate it into your response naturally. If the information isn't relevant to the 
         question, you can ignore it and answer based on your general knowledge.`
      : ''

    // Use a supported model
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    console.log('Using OpenAI model:', model)

    const systemMessage = `You are a helpful ICT support assistant for PPD Johor Bahru. 
    Your responses should be clear, professional, and based on available information.
    When using information from documents, try to be specific about what you found.
    ${context}`

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    // Check if we have a valid response
    if (!response.choices[0]?.message?.content) {
      console.error('No response content from OpenAI')
      throw new Error('No response generated')
    }

    return NextResponse.json({
      message: response.choices[0].message.content
    })
  } catch (error) {
    // Detailed error logging
    console.error('Chat API Error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    // User-friendly error response
    let errorMessage = 'An unexpected error occurred'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API configuration error'
      } else if (error.message.includes('Vector store')) {
        errorMessage = 'Document search error'
      } else {
        errorMessage = 'Failed to generate response'
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 