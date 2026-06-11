'use client'

import { useEffect, useState } from 'react'
import { documentAPI } from '@/lib/api'
import type { Document } from '@/types'
import DocumentList from '@/components/documents/DocumentList'
import CreateButton from '@/components/documents/CreateButton'

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const { data } = await documentAPI.getAll()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentCreated = (doc: Document) => {
    setDocuments([doc, ...documents])
  }

  const handleDocumentDeleted = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 bg-white/[0.06] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white/[0.03] border border-white/[0.06] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            My Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateButton onDocumentCreated={handleDocumentCreated} />
      </div>

      <DocumentList
        documents={documents}
        onDocumentDeleted={handleDocumentDeleted}
      />
    </div>
  )
}
