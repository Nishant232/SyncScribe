# CodeCollab Implementation Part 4 — Dashboard & Documents

**Continue from PART 3**

---

# DAY 2 CONTINUED: DASHBOARD & DOCUMENT MANAGEMENT

---

## TASK 2.18: Protected Layout (15 min)

**File:** `frontend/app/(protected)/layout.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
```

---

## TASK 2.19: Navbar Component (30 min)

**File:** `frontend/components/layout/Navbar.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CodeCollab
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {userEmail?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">
                  {userEmail}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
```

---

## TASK 2.20: API Client (30 min)

**File:** `frontend/lib/api.ts`

```typescript
import axios, { AxiosError } from 'axios'
import { createClient } from '@/lib/supabase/client'
import type { Document, Collaborator, ShareLink } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
api.interceptors.request.use(
  async (config) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Document API
export const documentAPI = {
  getAll: () => api.get<{ documents: Document[] }>('/api/documents'),
  
  getOne: (id: string) => api.get<{ document: Document }>(`/api/documents/${id}`),
  
  create: (data: { title?: string; content?: string }) =>
    api.post<{ document: Document }>('/api/documents', data),
  
  update: (id: string, data: { title?: string; content?: string }) =>
    api.patch<{ document: Document }>(`/api/documents/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/documents/${id}`),
}

// Sharing API
export const sharingAPI = {
  createShareLink: (
    documentId: string,
    data: { role: 'editor' | 'viewer'; expiresInDays?: number }
  ) =>
    api.post<{ share: ShareLink; link: string }>(`/api/documents/${documentId}/share`, data),
  
  joinViaToken: (token: string) =>
    api.get<{ documentId: string; role: string }>(`/api/join/${token}`),
  
  getCollaborators: (documentId: string) =>
    api.get<{ collaborators: Collaborator[] }>(`/api/documents/${documentId}/collaborators`),
  
  removeCollaborator: (documentId: string, userId: string) =>
    api.delete(`/api/documents/${documentId}/collaborators/${userId}`),
}

export default api
```

---

## TASK 2.21: Color Utility (10 min)

**File:** `frontend/lib/utils/colors.ts`

```typescript
const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B88B', '#52B788', '#E76F51', '#A8DADC',
]

export function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COLLABORATOR_COLORS[hash % COLLABORATOR_COLORS.length]
}

export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
```

---

## TASK 2.22: Dashboard Page (45 min)

**File:** `frontend/app/(protected)/dashboard/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { documentAPI } from '@/lib/api'
import type { Document } from '@/types'
import DocumentList from '@/components/documents/DocumentList'
import CreateButton from '@/components/documents/CreateButton'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const { data } = await documentAPI.getAll()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentCreated = (doc: Document) => {
    setDocuments([doc, ...documents])
  }

  const handleDocumentDeleted = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateButton onDocumentCreated={handleDocumentCreated} />
      </div>

      <DocumentList
        documents={documents}
        onDocumentDeleted={handleDocumentDeleted}
      />
    </div>
  )
}
```

---

## TASK 2.23: Create Button Component (30 min)

**File:** `frontend/components/documents/CreateButton.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { documentAPI } from '@/lib/api'
import type { Document } from '@/types'

interface Props {
  onDocumentCreated?: (doc: Document) => void
}

export default function CreateButton({ onDocumentCreated }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const { data } = await documentAPI.create({
        title: 'Untitled Document',
        content: '',
      })
      
      onDocumentCreated?.(data.document)
      router.push(`/document/${data.document.id}`)
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Failed to create document')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Button onClick={handleCreate} disabled={creating} size="lg">
      <Plus className="h-5 w-5 mr-2" />
      {creating ? 'Creating...' : 'New Document'}
    </Button>
  )
}
```

---

## TASK 2.24: Document List Component (30 min)

**File:** `frontend/components/documents/DocumentList.tsx`

```typescript
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
```

---

## TASK 2.25: Document Card Component (45 min)

**File:** `frontend/components/documents/DocumentCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, Share2, FileText } from 'lucide-react'
import { documentAPI } from '@/lib/api'
import type { Document } from '@/types'

interface Props {
  document: Document
  onDeleted: (docId: string) => void
}

export default function DocumentCard({ document, onDeleted }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeleting(true)
    try {
      await documentAPI.delete(document.id)
      onDeleted(document.id)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    } finally {
      setDeleting(false)
    }
  }

  const handleOpen = () => {
    router.push(`/document/${document.id}`)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={handleOpen}>
        <div className="flex items-start justify-between">
          <FileText className="h-8 w-8 text-blue-600 mb-2" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleOpen()
              }}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
              }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                disabled={deleting}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="line-clamp-1">{document.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {document.content || 'Empty document'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="text-sm text-gray-500">
        Updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
      </CardFooter>
    </Card>
  )
}
```

---

## TASK 2.26: Install Frontend Dependencies (10 min)

```bash
cd frontend
npm install
```

Expected packages installed:
- next
- react
- react-dom
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- socket.io-client
- zustand
- axios
- date-fns
- lodash
- lucide-react
- class-variance-authority
- clsx
- tailwind-merge
- typescript
- @types/*

---

## TASK 2.27: Create Frontend .env.local File (5 min)

**File:** `frontend/.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**IMPORTANT:** Replace with your actual Supabase credentials!

---

## TASK 2.28: Test Frontend (15 min)

```bash
# Start frontend (backend should already be running)
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.0.4
- Local:   http://localhost:3000
- Ready in 2.3s
```

**Test flow:**
1. Visit http://localhost:3000
2. Click "Get Started Free"
3. Sign up with email
4. Check email for confirmation link
5. Click confirmation link
6. Should redirect to /dashboard
7. Click "New Document"
8. Should create and redirect to editor

---

## END OF DAY 2 ✅

**Frontend Deliverables:**
- ✅ Next.js 14 App Router structure
- ✅ Supabase Auth integration
- ✅ Landing page
- ✅ Auth pages (login/signup)
- ✅ Protected dashboard layout
- ✅ Document list with CRUD
- ✅ API client with interceptors
- ✅ Navbar component

**Git Commit:**
```bash
cd codecollab
git add frontend/
git commit -m "feat: add frontend foundation with Supabase auth and dashboard"
git push
```

---

## Continue to PART 5 for Real-Time Editor...

**Save this file. Part 5 will contain Socket.io integration, Editor component, and real-time collaboration features.**
