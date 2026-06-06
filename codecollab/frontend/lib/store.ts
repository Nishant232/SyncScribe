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
  typingUsers: new Set<string>(),
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
