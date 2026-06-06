'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sharingAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')

  useEffect(() => {
    const joinDocument = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?redirect_url=/join/${token}`)
        return
      }

      try {
        const { data } = await sharingAPI.joinViaToken(token)
        router.push(`/document/${data.documentId}`)
      } catch (err: any) {
        console.error('Error joining document:', err)
        setError(
          err.response?.data?.error || 'Invalid or expired share link'
        )
      }
    }

    joinDocument()
  }, [token, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Link
          </h1>
          <p className="text-gray-600">{error}</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Joining document...</p>
      </div>
    </div>
  )
}
