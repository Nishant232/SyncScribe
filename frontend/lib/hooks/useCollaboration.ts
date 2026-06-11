import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { initSocket } from '../socket'
import { useDocumentStore } from '../store'
import { getUserColor } from '../utils/colors'
import type { CollaboratorUser } from '@/types'

export function useCollaboration(documentId: string) {
  const {
    setConnected,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setContent,
    updateCursor,
    removeCursor,
    setTyping,
  } = useDocumentStore()

  const supabase = createClient()

  useEffect(() => {
    if (!documentId) return

    let socket: any = null

    const setupSocket = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Pass the JWT so the server can verify identity at the socket level
      const { data: { session } } = await supabase.auth.getSession()
      socket = initSocket(session?.access_token)

      const userColor = getUserColor(user.id)
      const collaboratorUser: CollaboratorUser = {
        id: user.id,
        email: user.email || 'Anonymous',
        color: userColor,
        socketId: socket.id || '',
        joinedAt: Date.now(),
      }

      const joinDocument = () => {
        socket.emit('join-document', {
          documentId,
          user: { ...collaboratorUser, socketId: socket.id },
        })
      }

      // Connection handlers
      socket.on('connect', () => {
        setConnected(true)
        joinDocument()
      })

      // If already connected (e.g. after StrictMode remount), emit immediately
      if (socket.connected) {
        joinDocument()
      }

      socket.on('disconnect', () => {
        setConnected(false)
        console.log('Disconnected from document room')
      })

      // User joined
      socket.on('user-joined', (data: { user: CollaboratorUser }) => {
        console.log('User joined:', data.user.email)
        addOnlineUser(data.user)
      })

      // User left
      socket.on('user-left', (data: { user: CollaboratorUser }) => {
        console.log('User left:', data.user.email)
        removeOnlineUser(data.user.socketId)
        removeCursor(data.user.socketId)
      })

      // Current users in room
      socket.on('room-users', (data: { users: CollaboratorUser[] }) => {
        console.log('Current users:', data.users)
        setOnlineUsers(data.users)
      })

      // Users list updated
      socket.on('users-updated', (data: { users: CollaboratorUser[] }) => {
        setOnlineUsers(data.users)
      })

      // Document content update
      socket.on('document-update', (data: { content: string; userId: string }) => {
        if (data.userId !== user.id) {
          setContent(data.content)
        }
      })

      // Cursor position update
      socket.on('cursor-update', (data: any) => {
        if (data.userId !== user.id) {
          updateCursor(data)
        }
      })

      // Typing indicators
      socket.on('user-typing', (data: { userId: string; userName: string }) => {
        if (data.userId !== user.id) {
          setTyping(data.userId, true)
        }
      })

      socket.on('user-stopped-typing', (data: { userId: string }) => {
        setTyping(data.userId, false)
      })

      // Permission denied
      socket.on('permission-denied', (data: { error: string }) => {
        alert(data.error)
      })
    }

    setupSocket()

    return () => {
      if (socket) {
        // Tell the server to remove this user from the room even if the
        // socket stays alive (e.g. user navigated away without closing tab)
        socket.emit('leave-document', { documentId })
        socket.off('connect')
        socket.off('disconnect')
        socket.off('user-joined')
        socket.off('user-left')
        socket.off('room-users')
        socket.off('users-updated')
        socket.off('document-update')
        socket.off('cursor-update')
        socket.off('user-typing')
        socket.off('user-stopped-typing')
        socket.off('permission-denied')
      }
    }
  }, [documentId])
}
