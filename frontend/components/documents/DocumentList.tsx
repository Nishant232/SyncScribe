import type { Document } from '@/types'
import DocumentCard from './DocumentCard'

interface Props {
  documents: Document[]
  onDocumentDeleted: (docId: string) => void
}

export default function DocumentList({ documents, onDocumentDeleted }: Props) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-white/[0.06] flex items-center justify-center mb-5">
          <span className="text-2xl">✦</span>
        </div>
        <h3 className="text-lg font-semibold font-display text-white mb-2">
          No documents yet
        </h3>
        <p className="text-sm text-gray-500">
          Create your first document to start collaborating
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDeleted={onDocumentDeleted}
        />
      ))}
    </div>
  )
}
