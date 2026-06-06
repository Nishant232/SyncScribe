import type { Document } from '@/types'
import DocumentCard from './DocumentCard'

interface Props {
  documents: Document[]
  onDocumentDeleted: (docId: string) => void
}

export default function DocumentList({ documents, onDocumentDeleted }: Props) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No documents yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first document to get started
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
