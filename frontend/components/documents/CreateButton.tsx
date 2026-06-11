'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
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
      className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-px text-sm"
    >
      {creating
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
      }
      {creating ? 'Creating...' : 'New Document'}
    </button>
  )
}
