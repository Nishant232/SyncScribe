# CodeCollab Implementation Part 3 — Frontend with Supabase Auth

**Continue from PART 2**

---

# DAY 2 CONTINUED: FRONTEND SETUP

---

## TASK 2.7: Supabase Client Setup (20 min)

**File:** `frontend/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File:** `frontend/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**File:** `frontend/lib/supabase/middleware.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

---

## TASK 2.8: Root Middleware (10 min)

**File:** `frontend/middleware.ts`

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## TASK 2.9: TypeScript Types (15 min)

**File:** `frontend/types/index.ts`

```typescript
export interface User {
  id: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_role?: 'owner' | 'editor' | 'viewer';
}

export interface CollaboratorUser extends User {
  color: string;
  socketId: string;
  joinedAt: number;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  color: string;
  socketId?: string;
}

export interface DocumentPermission {
  document_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ShareLink {
  id: string;
  document_id: string;
  token: string;
  role: 'editor' | 'viewer';
  expires_at: string | null;
  created_at: string;
}

export interface Collaborator extends User {
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}
```

---

## TASK 2.10: Global CSS (10 min)

**File:** `frontend/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## TASK 2.11: Root Layout (15 min)

**File:** `frontend/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeCollab - Real-Time Collaborative Documents',
  description: 'Edit documents together in real-time with live cursors and instant sync',
  keywords: ['collaboration', 'documents', 'real-time', 'editor'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

## TASK 2.12: Landing Page (20 min)

**File:** `frontend/app/page.tsx`

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8 max-w-3xl">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
          CodeCollab
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300">
          Real-time collaborative document editing
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Work together seamlessly with live cursors, presence indicators, and instant sync
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started Free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-semibold">Real-Time Sync</h3>
            <p className="text-sm text-gray-500">Instant updates across all devices</p>
          </div>
          <div>
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold">Live Collaboration</h3>
            <p className="text-sm text-gray-500">See who's editing in real-time</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-semibold">Secure Sharing</h3>
            <p className="text-sm text-gray-500">Control access with permissions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## TASK 2.13: Auth Form Component (30 min)

**File:** `frontend/components/auth/AuthForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthFormProps {
  type: 'login' | 'signup'
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          minLength={6}
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
          {message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Loading...' : type === 'signup' ? 'Sign Up' : 'Sign In'}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {type === 'signup' ? (
          <>
            Already have an account?{' '}
            <a href="/auth/login" className="text-primary hover:underline">
              Sign in
            </a>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </>
        )}
      </p>
    </form>
  )
}
```

---

## TASK 2.14: Login Page (10 min)

**File:** `frontend/app/auth/login/page.tsx`

```typescript
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue to CodeCollab
          </p>
        </div>
        <AuthForm type="login" />
      </div>
    </div>
  )
}
```

---

## TASK 2.15: Signup Page (10 min)

**File:** `frontend/app/auth/signup/page.tsx`

```typescript
import AuthForm from '@/components/auth/AuthForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join CodeCollab
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account to start collaborating
          </p>
        </div>
        <AuthForm type="signup" />
      </div>
    </div>
  )
}
```

---

## TASK 2.16: Auth Callback (10 min)

**File:** `frontend/app/auth/callback/route.ts`

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

---

## TASK 2.17: Install shadcn/ui Components (20 min)

**Note:** You'll need to install shadcn/ui components manually. Here's the setup:

```bash
cd frontend
npx shadcn-ui@latest init
```

Answer prompts:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes

Then install components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
```

This creates `components/ui/` folder with all UI components.

---

## Continue to PART 4 for Dashboard and Document components...

**Save this file. Part 4 will contain Dashboard, Document List, and remaining frontend components.**
