import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import fs from 'fs'
import path from 'path'

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// File paths for persistence
const STORAGE_DIR = path.join(process.cwd(), '.vector_store')
const DOCS_PATH = path.join(STORAGE_DIR, 'documents.json')

// Initialize vector store
let vectorStore: MemoryVectorStore | null = null

// Keep track of stored documents
let storedDocuments: Array<{
  content: string;
  metadata?: Record<string, any>;
}> = []

// Load persisted data
try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (fs.existsSync(DOCS_PATH)) {
    storedDocuments = JSON.parse(fs.readFileSync(DOCS_PATH, 'utf-8'))
    console.log('Loaded stored documents:', storedDocuments.length)
  }
} catch (error) {
  console.error('Error loading persisted data:', error)
}

// Function to save documents
async function persistDocuments() {
  try {
    fs.writeFileSync(DOCS_PATH, JSON.stringify(storedDocuments))
    console.log('Saved documents to disk')
  } catch (error) {
    console.error('Error persisting documents:', error)
  }
}

// Function to initialize vector store with documents
export async function initializeVectorStore(documents: string[]) {
  try {
    console.log('Initializing vector store with documents:', documents.length)
    
    // Test embeddings first
    const embeddingsWorking = await testEmbeddings()
    if (!embeddingsWorking) {
      throw new Error('Embeddings not working, check OpenAI API key')
    }
    
    // Validate and process new documents
    const validDocuments = documents.filter(doc => {
      if (!doc || typeof doc !== 'string' || doc.trim().length === 0) {
        console.warn('Skipping invalid document')
        return false
      }
      return true
    }).map(content => ({ content }))
    
    // Add new documents to storage
    storedDocuments = [...storedDocuments, ...validDocuments]
    await persistDocuments()
    
    console.log('Total stored documents:', storedDocuments.length)
    
    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const docs = await Promise.all(
      storedDocuments.map(async (doc, index) => {
        try {
          const chunks = await textSplitter.createDocuments([doc.content])
          console.log(`Document ${index + 1}: Split into ${chunks.length} chunks`)
          return chunks
        } catch (error) {
          console.error(`Error splitting document ${index + 1}:`, error)
          return []
        }
      })
    )

    // Flatten chunks array
    const flatDocs = docs.flat()
    console.log('Total chunks created:', flatDocs.length)

    if (flatDocs.length === 0) {
      throw new Error('No valid document chunks created')
    }

    // Create vector store
    vectorStore = await MemoryVectorStore.fromDocuments(
      flatDocs,
      embeddings
    )
    console.log('Vector store initialized successfully with', flatDocs.length, 'chunks')

    return true
  } catch (error) {
    console.error('Error initializing vector store:', error)
    return false
  }
}

// Function to check if embeddings are working
async function testEmbeddings() {
  try {
    console.log('Testing embeddings...')
    const testEmbed = await embeddings.embedQuery('test')
    console.log('Embeddings working, vector size:', testEmbed.length)
    return true
  } catch (error) {
    console.error('Embeddings test failed:', error)
    return false
  }
}

// Function to search similar documents
export async function searchSimilarDocuments(query: string, k: number = 3) {
  try {
    // Initialize vector store if needed
    if (!vectorStore && storedDocuments.length > 0) {
      console.log('Vector store not initialized, reinitializing from stored documents...')
      const success = await initializeVectorStore([])
      if (!success) {
        console.error('Failed to initialize vector store')
        return []
      }
    }

    if (!vectorStore) {
      console.log('No documents available')
      return []
    }

    console.log('Searching for documents related to:', query)
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.warn('Invalid query provided')
      return []
    }

    const results = await vectorStore.similaritySearch(query, k)
    console.log('Found matching documents:', results.length)
    if (results.length > 0) {
      results.forEach((doc, i) => {
        console.log(`Match ${i + 1} preview: ${doc.pageContent.substring(0, 100)}...`)
      })
    } else {
      console.log('No matching documents found')
    }
    return results.map((doc: Document) => doc.pageContent)
  } catch (error) {
    console.error('Error searching documents:', error)
    return []
  }
} 