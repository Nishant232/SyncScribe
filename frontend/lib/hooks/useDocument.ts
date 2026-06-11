import { useEffect } from 'react'
import { useDocumentStore } from '../store'
import { documentAPI } from '../api'

export function useDocument(documentId: string) {
  const { setDocument, setContent, reset } = useDocumentStore()

  useEffect(() => {
    if (!documentId) return

    const fetchDocument = async () => {
      try {
        const { data } = await documentAPI.getOne(documentId)
        setDocument(data.document)
        setContent(data.document.content)
      } catch (error) {
        console.error('Error fetching document:', error)
      }
    }

    fetchDocument()

    return () => {
      reset()
    }
  }, [documentId, setDocument, setContent, reset])
}
