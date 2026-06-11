'use client'

import { useDocumentStore } from '@/lib/store'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function SavingIndicator() {
  const { isSaving, lastSaved } = useDocumentStore()

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span>
          Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <span>Not saved</span>
    </div>
  )
}
