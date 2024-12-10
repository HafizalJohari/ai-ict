'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, X, Check, Loader2, FileIcon, Eye, Download, Upload as UploadIcon, Tags, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDocumentStore, type Document } from '@/lib/documentStore'
import { bytesToSize } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Supported file types
const SUPPORTED_FILE_TYPES = [
  '.txt', '.md', '.doc', '.docx',
  '.pdf', '.rtf', '.csv', '.json',
  '.xml', '.html', '.htm'
].join(',')

// Max file size in MB
const MAX_FILE_SIZE = 10

export default function DocumentLoader() {
  const {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    exportDocuments,
    importDocuments,
    addTag,
    removeTag,
    updateMetadata,
    getStats
  } = useDocumentStore()

  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewDocument, setViewDocument] = useState<Document | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [editMetadata, setEditMetadata] = useState<Document | null>(null)
  const [newTag, setNewTag] = useState('')

  const stats = getStats()

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
      setUploadError(`File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE}MB.`)
      return false
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
      setUploadError(`File type ${fileExtension} is not supported.`)
      return false
    }

    return true
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    setUploadError(null)
    setIsLoading(true)

    // Validate all files first
    const validFiles = Array.from(files).filter(validateFile)
    if (validFiles.length === 0) {
      setIsLoading(false)
      return
    }

    try {
      for (const file of validFiles) {
        const text = await file.text()
        
        // Add document to store with processing status
        const docId = addDocument({
          name: file.name,
          content: text,
          status: 'processing',
          fileSize: file.size,
          fileType: file.name.split('.').pop() || 'unknown',
          metadata: {
            author: 'Unknown',
            description: '',
            tags: []
          }
        })

        try {
          // Process document with vector store
          const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documents: [{
                name: file.name,
                content: text
              }]
            }),
          })

          if (!response.ok) throw new Error('Failed to process document')

          // Update status to completed
          updateDocument(docId, { status: 'completed' })

        } catch (error) {
          console.error('Error processing file:', error)
          setUploadError(`Failed to process ${file.name}. Please try again.`)
          // Update status to error
          updateDocument(docId, {
            status: 'error',
            processingError: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    } catch (error) {
      console.error('Error reading files:', error)
      setUploadError('Failed to read files. Please try again.')
    }

    setIsLoading(false)
    event.target.value = '' // Reset file input
  }

  const handleDelete = async (id: string) => {
    try {
      // Delete from vector store
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete document')
      
      // Delete from local store
      deleteDocument(id)
    } catch (error) {
      console.error('Error deleting document:', error)
      setUploadError('Failed to delete document. Please try again.')
    }
    setDeleteId(null)
  }

  const handleExport = () => {
    const data = exportDocuments()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'documents.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') {
        const success = importDocuments(content)
        if (!success) {
          setUploadError('Failed to import documents. Invalid format.')
        }
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  const handleAddTag = (docId: string) => {
    if (!newTag.trim()) return
    addTag(docId, newTag.trim())
    setNewTag('')
  }

  const getStatusBadge = (status: Document['status'], chunks?: number) => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            {chunks ? `${chunks} chunks` : 'Completed'}
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/20">
            <X className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card className="bg-white/5 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-medium text-slate-100">Document Management</CardTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={SUPPORTED_FILE_TYPES}
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload">
                  <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    disabled={isLoading}
                    asChild
                  >
                    <span>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload Documents
                    </span>
                  </Button>
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Document Stats</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Total Documents: {stats.total}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Completed: {stats.completed}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Processing: {stats.processing}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Error: {stats.error}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Total Size: {bytesToSize(stats.totalSize)}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExport}
                  title="Export Documents"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Input
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="import-file"
                  onChange={handleImport}
                />
                <label htmlFor="import-file">
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                    title="Import Documents"
                    asChild
                  >
                    <span>
                      <UploadIcon className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              <p className="text-xs text-slate-400">
                Supported formats: {SUPPORTED_FILE_TYPES.split(',').join(', ')} (Max {MAX_FILE_SIZE}MB)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200">Document</TableHead>
                  <TableHead className="text-slate-200">Upload Date</TableHead>
                  <TableHead className="text-slate-200">Size</TableHead>
                  <TableHead className="text-slate-200">Status</TableHead>
                  <TableHead className="text-slate-200">Tags</TableHead>
                  <TableHead className="text-right text-slate-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="border-white/10">
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-primary" />
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {bytesToSize(doc.fileSize)}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status, doc.chunks)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.metadata?.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-red-500/20"
                            onClick={() => removeTag(doc.id, tag)}
                          >
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => setEditMetadata(doc)}
                        >
                          <Tags className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewDocument(doc)}
                          className="h-8 w-8 text-slate-400 hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(doc.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet.</p>
              <p className="text-sm mt-1">Upload documents to start processing.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Document Dialog */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewDocument?.name}
            </DialogTitle>
            <DialogDescription>
              Uploaded on {viewDocument && new Date(viewDocument.uploadedAt).toLocaleString()}
              {viewDocument?.metadata?.author && ` by ${viewDocument.metadata.author}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            {viewDocument?.metadata?.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {viewDocument?.content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog open={!!editMetadata} onOpenChange={() => setEditMetadata(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document Metadata</DialogTitle>
            <DialogDescription>
              Add tags and metadata to help organize your documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input
                value={editMetadata?.metadata?.author || ''}
                onChange={(e) => editMetadata && updateMetadata(editMetadata.id, {
                  author: e.target.value
                })}
                placeholder="Document author"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editMetadata?.metadata?.description || ''}
                onChange={(e) => editMetadata && updateMetadata(editMetadata.id, {
                  description: e.target.value
                })}
                placeholder="Document description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {editMetadata?.metadata?.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-500/20"
                    onClick={() => editMetadata && removeTag(editMetadata.id, tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && editMetadata) {
                      handleAddTag(editMetadata.id)
                    }
                  }}
                />
                <Button
                  onClick={() => editMetadata && handleAddTag(editMetadata.id)}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 