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
    <div className="group relative bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/25 hover:bg-white/[0.04] rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden">
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl" />

      <div onClick={handleOpen} className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-white/[0.06] flex items-center justify-center">
            <FileText className="h-4 w-4 text-violet-400" />
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#141424] rounded-xl shadow-2xl border border-white/[0.08] z-50 overflow-hidden p-1">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); handleOpen() }}
                  >
                    Open
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShareOpen(true) }}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-white font-display line-clamp-1 mb-1.5 text-sm">
          {document.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {document.content || 'Empty document'}
        </p>
        <p className="text-[11px] text-gray-700">
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
