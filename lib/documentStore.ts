import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Document {
  id: string
  name: string
  content: string
  uploadedAt: string
  lastModified: string
  fileSize: number
  fileType: string
  status: 'processing' | 'completed' | 'error'
  chunks?: number
  metadata?: {
    author?: string
    createdAt?: string
    modifiedAt?: string
    tags?: string[]
    description?: string
  }
  processingError?: string
}

interface DocumentStore {
  documents: Document[]
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt' | 'lastModified'>) => string
  updateDocument: (id: string, document: Partial<Document>) => void
  deleteDocument: (id: string) => void
  getDocument: (id: string) => Document | undefined
  getAllDocuments: () => Document[]
  searchDocuments: (query: string) => Document[]
  clearAllDocuments: () => void
  exportDocuments: () => string
  importDocuments: (data: string) => boolean
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  updateMetadata: (id: string, metadata: Partial<Document['metadata']>) => void
  getDocumentsByTag: (tag: string) => Document[]
  getDocumentsByStatus: (status: Document['status']) => Document[]
  getDocumentsByDateRange: (startDate: string, endDate: string) => Document[]
  getStats: () => {
    total: number
    completed: number
    processing: number
    error: number
    totalSize: number
    averageSize: number
    byFileType: Record<string, number>
  }
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],

      addDocument: (document) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const newDocument = {
          ...document,
          id,
          uploadedAt: now,
          lastModified: now,
          metadata: {
            ...document.metadata,
            createdAt: now,
            modifiedAt: now,
            tags: document.metadata?.tags || []
          }
        }
        set((state) => ({
          documents: [...state.documents, newDocument]
        }))
        return id
      },

      updateDocument: (id, document) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  ...document,
                  lastModified: new Date().toISOString(),
                  metadata: {
                    ...doc.metadata,
                    ...document.metadata,
                    modifiedAt: new Date().toISOString()
                  }
                }
              : doc
          )
        }))
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id)
        }))
      },

      getDocument: (id) => {
        return get().documents.find((doc) => doc.id === id)
      },

      getAllDocuments: () => {
        return get().documents
      },

      searchDocuments: (query) => {
        const documents = get().documents
        const lowercaseQuery = query.toLowerCase()
        return documents.filter((doc) =>
          doc.name.toLowerCase().includes(lowercaseQuery) ||
          doc.content.toLowerCase().includes(lowercaseQuery) ||
          doc.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
      },

      clearAllDocuments: () => {
        set({ documents: [] })
      },

      exportDocuments: () => {
        const documents = get().documents
        return JSON.stringify(documents, null, 2)
      },

      importDocuments: (data) => {
        try {
          const documents = JSON.parse(data)
          if (!Array.isArray(documents)) return false
          set({ documents })
          return true
        } catch (error) {
          console.error('Failed to import documents:', error)
          return false
        }
      },

      addTag: (id, tag) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  metadata: {
                    ...doc.metadata,
                    tags: [...(doc.metadata?.tags || []), tag]
                  }
                }
              : doc
          )
        }))
      },

      removeTag: (id, tag) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  metadata: {
                    ...doc.metadata,
                    tags: doc.metadata?.tags?.filter((t) => t !== tag) || []
                  }
                }
              : doc
          )
        }))
      },

      updateMetadata: (id, metadata) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  metadata: {
                    ...doc.metadata,
                    ...metadata,
                    modifiedAt: new Date().toISOString()
                  }
                }
              : doc
          )
        }))
      },

      getDocumentsByTag: (tag) => {
        return get().documents.filter((doc) =>
          doc.metadata?.tags?.includes(tag)
        )
      },

      getDocumentsByStatus: (status) => {
        return get().documents.filter((doc) => doc.status === status)
      },

      getDocumentsByDateRange: (startDate, endDate) => {
        return get().documents.filter((doc) =>
          doc.uploadedAt >= startDate && doc.uploadedAt <= endDate
        )
      },

      getStats: () => {
        const documents = get().documents
        const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0)
        const byFileType = documents.reduce((acc, doc) => {
          acc[doc.fileType] = (acc[doc.fileType] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return {
          total: documents.length,
          completed: documents.filter(doc => doc.status === 'completed').length,
          processing: documents.filter(doc => doc.status === 'processing').length,
          error: documents.filter(doc => doc.status === 'error').length,
          totalSize,
          averageSize: documents.length ? totalSize / documents.length : 0,
          byFileType
        }
      }
    }),
    {
      name: 'document-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // Migrate from v1 to v2
          const documents = persistedState.documents.map((doc: Document) => ({
            ...doc,
            lastModified: doc.uploadedAt,
            fileSize: 0,
            fileType: doc.name.split('.').pop() || 'unknown',
            metadata: {
              createdAt: doc.uploadedAt,
              modifiedAt: doc.uploadedAt,
              tags: []
            }
          }))
          return { ...persistedState, documents }
        }
        return persistedState
      }
    }
  )
) 