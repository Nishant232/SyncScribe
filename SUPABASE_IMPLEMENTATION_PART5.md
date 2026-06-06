# CodeCollab Implementation Part 5 — Real-Time Editor & Collaboration

**Continue from PART 4**

---

# DAY 3: REAL-TIME COLLABORATION

**Goal:** Socket.io integration + Real-time editor  
**Time:** 10 hours

---

## TASK 3.1: Socket.io Client (30 min)

**File:** `frontend/lib/socket.ts`

```typescript
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts')
    })
  }

  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
```

---

## TASK 3.2: Zustand Store (45 min)

**File:** `frontend/lib/store.ts`

```typescript
import { create } from 'zustand'
import type { Document, CollaboratorUser, CursorPosition } from '@/types'

interface DocumentStore {
  // Document state
  currentDocument: Document | null
  content: string
  isSaving: boolean
  lastSaved: Date | null

  // Collaboration state
  onlineUsers: CollaboratorUser[]
  cursors: Map<string, CursorPosition>
  typingUsers: Set<string>

  // Connection state
  isConnected: boolean
  connectionError: string | null

  // Actions
  setDocument: (doc: Document) => void
  setContent: (content: string) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
  setOnlineUsers: (users: CollaboratorUser[]) => void
  addOnlineUser: (user: CollaboratorUser) => void
  removeOnlineUser: (socketId: string) => void
  updateCursor: (cursor: CursorPosition) => void
  removeCursor: (socketId: string) => void
  setTyping: (userId: string, typing: boolean) => void
  setConnected: (connected: boolean) => void
  setConnectionError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentDocument: null,
  content: '',
  isSaving: false,
  lastSaved: null,
  onlineUsers: [],
  cursors: new Map(),
  typingUsers: new Set(),
  isConnected: false,
  connectionError: null,
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  ...initialState,

  setDocument: (doc) => set({ currentDocument: doc, content: doc.content }),
  
  setContent: (content) => set({ content }),
  
  setSaving: (saving) => set({ isSaving: saving }),
  
  setLastSaved: (date) => set({ lastSaved: date }),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  addOnlineUser: (user) =>
    set((state) => ({
      onlineUsers: [...state.onlineUsers.filter(u => u.socketId !== user.socketId), user],
    })),
  
  removeOnlineUser: (socketId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.socketId !== socketId),
    })),
  
  updateCursor: (cursor) =>
    set((state) => {
      const newCursors = new Map(state.cursors)
      newCursors.set(cursor.socketId || cursor.userId, cursor)
      return { cursors: newCursors }
    }),
  
  removeCursor: (socketId) =>
    set((state) => {
      const newCursors = new Map(state.cursors)
      newCursors.delete(socketId)
      return { cursors: newCursors }
    }),
  
  setTyping: (userId, typing) =>
    set((state) => {
      const newTypingUsers = new Set(state.typingUsers)
      if (typing) {
        newTypingUsers.add(userId)
      } else {
        newTypingUsers.delete(userId)
      }
      return { typingUsers: newTypingUsers }
    }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  setConnectionError: (error) => set({ connectionError: error }),
  
  reset: () => set(initialState),
}))
```

---

## TASK 3.3: useDocument Hook (20 min)

**File:** `frontend/lib/hooks/useDocument.ts`

```typescript
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
```

---

## TASK 3.4: useCollaboration Hook (1 hour)

**File:** `frontend/lib/hooks/useCollaboration.ts`

```typescript
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { initSocket, getSocket } from '../socket'
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

      socket = initSocket()

      const userColor = getUserColor(user.id)
      const collaboratorUser: CollaboratorUser = {
        id: user.id,
        email: user.email || 'Anonymous',
        color: userColor,
        socketId: socket.id || '',
        joinedAt: Date.now(),
      }

      // Join document room
      socket.emit('join-document', {
        documentId,
        user: collaboratorUser,
      })

      // Connection handlers
      socket.on('connect', () => {
        setConnected(true)
        console.log('Connected to document room')
      })

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
```

---

## TASK 3.5: Editor Component (2 hours)

**File:** `frontend/components/editor/Editor.tsx`

```typescript
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

      const userColor = useDocumentStore.getState().onlineUsers.find(u => u.id === user.id)?.color || '#000'

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
        <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium z-10">
          View Only
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onSelect={handleSelect}
        disabled={!canEdit}
        className={`flex-1 w-full p-8 text-lg resize-none focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
          !canEdit ? 'cursor-not-allowed opacity-60' : ''
        }`}
        placeholder={canEdit ? "Start typing..." : "You have view-only access"}
        spellCheck="true"
      />
    </div>
  )
}
```

---

## TASK 3.6: Saving Indicator (20 min)

**File:** `frontend/components/editor/SavingIndicator.tsx`

```typescript
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
```

---

## TASK 3.7: Presence Bar (30 min)

**File:** `frontend/components/collaboration/PresenceBar.tsx`

```typescript
'use client'

import { useDocumentStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function PresenceBar() {
  const { onlineUsers } = useDocumentStore()

  const visibleUsers = onlineUsers.slice(0, 5)
  const remainingCount = onlineUsers.length - 5

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">
        {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
      </span>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <Avatar
            key={user.socketId}
            className="border-2 border-white dark:border-gray-800 w-8 h-8"
            style={{ borderColor: user.color }}
            title={user.email}
          >
            <AvatarFallback style={{ backgroundColor: user.color }}>
              {user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 text-xs font-semibold">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## TASK 3.8: Document Page (1 hour)

**File:** `frontend/app/(protected)/document/[id]/page.tsx`

```typescript
'use client'

import { use } from 'react'
import { useDocument } from '@/lib/hooks/useDocument'
import { useCollaboration } from '@/lib/hooks/useCollaboration'
import { useDocumentStore } from '@/lib/store'
import Editor from '@/components/editor/Editor'
import SavingIndicator from '@/components/editor/SavingIndicator'
import PresenceBar from '@/components/collaboration/PresenceBar'
import { Skeleton } from '@/components/ui/skeleton'

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { currentDocument, isConnected } = useDocumentStore()

  // Load document
  useDocument(id)

  // Setup collaboration
  useCollaboration(id)

  if (!currentDocument) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentDocument.title}
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SavingIndicator />
          <PresenceBar />
        </div>
      </div>

      {/* Editor */}
      <Editor documentId={id} />
    </div>
  )
}
```

---

## TASK 3.9: Test Real-Time Editing (1 hour)

**Test flow:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000
4. Sign in with first account
5. Create document
6. Open same document in **Chrome Incognito** (sign in as different user)
7. Type in one window → should appear in other < 300ms
8. Check presence bar → should show both users
9. Check database → content should persist

**Debugging checklist:**
- [ ] Socket connects (check browser console)
- [ ] Backend shows "Client connected"
- [ ] User joins document room
- [ ] Typing in one window updates other
- [ ] No cursor jumping
- [ ] Content persists in database

---

## END OF DAY 3 ✅

**Deliverables:**
- ✅ Socket.io client integrated
- ✅ Real-time text editing
- ✅ Cursor position preservation
- ✅ Debounced socket emit (300ms)
- ✅ Debounced DB save (2s)
- ✅ Presence bar with online users
- ✅ Connection status indicator
- ✅ Saving indicator
- ✅ Permission enforcement (view-only mode)

**Git Commit:**
```bash
cd codecollab
git add .
git commit -m "feat: implement real-time collaborative editing with Socket.io"
git push
```

---

## Continue to PART 6 for final features and deployment...

**Save this file. Part 6 will contain sharing, deployment, and final polish.**
