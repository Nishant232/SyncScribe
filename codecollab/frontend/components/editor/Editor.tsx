'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDocumentStore } from '@/lib/store'
import { getSocket } from '@/lib/socket'
import { debounce } from 'lodash'
import { documentAPI } from '@/lib/api'

interface Props {
  documentId: string
}

export default function Editor({ documentId }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  const supabase = createClient()
  
  const {
    content,
    setContent,
    setSaving,
    setLastSaved,
    currentDocument,
  } = useDocumentStore()

  const socket = getSocket()

  // Debounced socket emit (300ms)
  const debouncedSocketEmit = useCallback(
    debounce(async (newContent: string) => {
      if (!socket) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      socket.emit('document-change', {
        userId: user.id,
        content: newContent,
        timestamp: Date.now(),
      })
    }, 300),
    [socket]
  )

  // Debounced DB save (2 seconds)
  const debouncedDbSave = useCallback(
    debounce(async (newContent: string) => {
      if (!documentId) return

      try {
        setSaving(true)
        await documentAPI.update(documentId, { content: newContent })
        setLastSaved(new Date())
      } catch (error) {
        console.error('Error saving to database:', error)
      } finally {
        setSaving(false)
      }
    }, 2000),
    [documentId, setSaving, setLastSaved]
  )

  // Handle text change
  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const newCursorPosition = e.target.selectionStart

    // Update local state immediately
    setContent(newContent)
    setCursorPosition(newCursorPosition)

    // Emit to socket (debounced)
    debouncedSocketEmit(newContent)

    // Save to database (debounced)
    debouncedDbSave(newContent)

    // Emit typing indicator
    if (socket) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      socket.emit('typing-start', {
        userId: user.id,
        userName: user.email || 'Anonymous',
      })

      setTimeout(() => {
        socket.emit('typing-stop', { userId: user.id })
      }, 1000)
    }
  }

  // Handle cursor movement
  const handleSelect = async (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const position = e.currentTarget.selectionStart
    setCursorPosition(position)

    if (socket) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const userColor = useDocumentStore.getState().onlineUsers.find(u => u.id === user.id)?.color || '#3B82F6'

      socket.emit('cursor-move', {
        userId: user.id,
        userName: user.email || 'Anonymous',
        position,
        color: userColor,
      })
    }
  }

  // Restore cursor position after content update from others
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [content])

  // Check if user can edit
  const canEdit = currentDocument?.user_role === 'owner' || currentDocument?.user_role === 'editor'

  return (
    <div className="flex-1 flex flex-col relative">
      {!canEdit && (
        <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium z-10 border border-yellow-200">
          View Only
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onSelect={handleSelect}
        disabled={!canEdit}
        className={`flex-1 w-full p-8 text-lg resize-none focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono leading-relaxed ${
          !canEdit ? 'cursor-not-allowed opacity-60' : ''
        }`}
        placeholder={canEdit ? 'Start typing...' : 'You have view-only access'}
        spellCheck="true"
      />
    </div>
  )
}
