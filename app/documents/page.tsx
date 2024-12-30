'use client'

import DocumentLoader from '@/components/DocumentLoader'

export default function DocumentsPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-primary text-slate-950">Document Management (RAG)</h1>
      <div className="max-w-2xl">
        <DocumentLoader />
      </div>
    </main>
  )
} 