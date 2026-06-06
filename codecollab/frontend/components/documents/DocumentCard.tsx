'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Trash2, Share2, FileText } from 'lucide-react'
import { documentAPI } from '@/lib/api'
import ShareModal from '@/components/sharing/ShareModal'
import type { Document } from '@/types'

interface Props {
  document: Document
  onDeleted: (docId: string) => void
}

export default function DocumentCard({ document, onDeleted }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeleting(true)
    setMenuOpen(false)
    try {
      await documentAPI.delete(document.id)
      onDeleted(document.id)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    } finally {
      setDeleting(false)
    }
  }

  const handleOpen = () => {
    router.push(`/document/${document.id}`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer relative">
      <div onClick={handleOpen} className="p-6">
        <div className="flex items-start justify-between mb-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    handleOpen()
                  }}
                >
                  Open
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    setShareOpen(true)
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
          {document.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {document.content || 'Empty document'}
        </p>
        <p className="text-xs text-gray-400">
          Updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
        </p>
      </div>

      {shareOpen && (
        <ShareModal
          documentId={document.id}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
