import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDocumentStore } from '../store'
import { documentAPI } from '../api'

export function useDocument(documentId: string) {
  const { setDocument, setContent, reset } = useDocumentStore()
  const supabase = createClient()

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { data } = await documentAPI.getOne(documentId)
        setDocument(data.document)
        setContent(data.document.content)
      } catch (error) {
        console.error('Error fetching document:', error)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && documentId) {
        fetchDocument()
      }
    })

    if (documentId) {
      fetchDocument()
    }

    return () => {
      subscription.unsubscribe()
      reset()
    }
  }, [documentId, setDocument, setContent, reset])
}
