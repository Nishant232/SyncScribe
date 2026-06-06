'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { documentAPI } from '@/lib/api'
import type { Document } from '@/types'

interface Props {
  onDocumentCreated?: (doc: Document) => void
}

export default function CreateButton({ onDocumentCreated }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const { data } = await documentAPI.create({
        title: 'Untitled Document',
        content: '',
      })
      
      onDocumentCreated?.(data.document)
      router.push(`/document/${data.document.id}`)
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Failed to create document')
    } finally {
      setCreating(false)
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={creating}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
    >
      <Plus className="h-5 w-5" />
      {creating ? 'Creating...' : 'New Document'}
    </button>
  )
}
