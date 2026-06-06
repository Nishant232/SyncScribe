# CodeCollab Implementation Part 6 — Sharing & Deployment

**Continue from PART 5**

---

# DAY 4-6: FINAL FEATURES & DEPLOYMENT

---

## DAY 4: SHARING & PERMISSIONS

**Time:** 6 hours

---

## TASK 4.1: Share Modal Component (1.5 hours)

**File:** `frontend/components/sharing/ShareModal.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Share2, Copy, Check, Trash2 } from 'lucide-react'
import { sharingAPI } from '@/lib/api'
import type { Collaborator } from '@/types'

interface Props {
  documentId: string
}

export default function ShareModal({ documentId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCollaborators()
    }
  }, [isOpen, documentId])

  const loadCollaborators = async () => {
    try {
      const { data } = await sharingAPI.getCollaborators(documentId)
      setCollaborators(data.collaborators)
    } catch (error) {
      console.error('Error loading collaborators:', error)
    }
  }

  const generateShareLink = async () => {
    setLoading(true)
    try {
      const { data } = await sharingAPI.createShareLink(documentId, {
        role,
        expiresInDays: 7,
      })
      setShareLink(data.link)
    } catch (error) {
      console.error('Error generating share link:', error)
      alert('Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const removeCollaborator = async (userId: string) => {
    if (!confirm('Remove this person from the document?')) return

    try {
      await sharingAPI.removeCollaborator(documentId, userId)
      setCollaborators(collaborators.filter((c) => c.id !== userId))
    } catch (error) {
      console.error('Error removing collaborator:', error)
      alert('Failed to remove collaborator')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Invite others to view or edit this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generate Link Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Access Level</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (can only read)</SelectItem>
                  <SelectItem value="editor">Editor (can edit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateShareLink} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate Share Link'}
            </Button>

            {shareLink && (
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Collaborators List */}
          <div className="space-y-2">
            <h4 className="font-semibold">People with access</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {collaborator.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{collaborator.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 capitalize">
                      {collaborator.role}
                    </span>
                    {collaborator.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaborator(collaborator.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## TASK 4.2: Join Document Page (30 min)

**File:** `frontend/app/join/[token]/page.tsx`

```typescript
'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sharingAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
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
```

---

## TASK 4.3: Update Document Card with Share Button (15 min)

**File:** Update `frontend/components/documents/DocumentCard.tsx`

Add import:
```typescript
import ShareModal from '@/components/sharing/ShareModal'
```

Add before delete menu item:
```typescript
<DropdownMenuItem onClick={(e) => e.stopPropagation()} asChild>
  <ShareModal documentId={document.id} />
</DropdownMenuItem>
```

---

## TASK 4.4: Update Document Page with Share Button (15 min)

**File:** Update `frontend/app/(protected)/document/[id]/page.tsx`

Add import:
```typescript
import ShareModal from '@/components/sharing/ShareModal'
```

Add in header section (before SavingIndicator):
```typescript
<ShareModal documentId={id} />
```

---

## END OF DAY 4 ✅

**Deliverables:**
- ✅ Share modal with link generation
- ✅ Collaborator list
- ✅ Join via token flow
- ✅ Permission enforcement
- ✅ Remove collaborator functionality

**Git Commit:**
```bash
git add .
git commit -m "feat: implement document sharing and permissions"
git push
```

---

## DAY 5-6: DEPLOYMENT & POLISH

**Time:** 10 hours

---

## TASK 5.1: Create Production Environment Files (15 min)

**File:** `backend/.env.production.example`

```env
# Supabase Production
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_ANON_KEY=your_production_anon_key

# Server
PORT=5000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
```

**File:** `frontend/.env.production.example`

```env
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Backend API (Railway URL)
NEXT_PUBLIC_BACKEND_URL=https://your-app.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app
```

---

## TASK 5.2: Add .gitignore (10 min)

**File:** `backend/.gitignore`

```
node_modules/
dist/
.env
.env.local
.env.production
*.log
```

**File:** `frontend/.gitignore`

```
node_modules/
.next/
out/
.env.local
.env.production
*.log
.DS_Store
```

**File:** Root `.gitignore`

```
node_modules/
.env
.env.local
.env.production
*.log
.DS_Store
```

---

## TASK 5.3: Backend Build Script (10 min)

Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:setup": "node -r dotenv/config src/db/setup.js"
  }
}
```

---

## TASK 5.4: Deploy Backend to Railway (1 hour)

**Steps:**

1. Create Railway account: https://railway.app
2. Create new project → "Deploy from GitHub repo"
3. Select your repository
4. Select `backend` as root directory
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (will add after frontend deploy)
   - `ALLOWED_ORIGINS` (will add after frontend deploy)
6. Railway will auto-detect Node.js and run:
   - Build: `npm run build`
   - Start: `npm start`
7. Copy the Railway URL (e.g., `https://codecollab-backend.up.railway.app`)

**Test deployment:**
```bash
curl https://your-app.up.railway.app/health
```

---

## TASK 5.5: Deploy Frontend to Vercel (1 hour)

**Steps:**

1. Create Vercel account: https://vercel.com
2. Import Git Repository
3. Select your repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BACKEND_URL` (Railway URL from previous step)
   - `NEXT_PUBLIC_SOCKET_URL` (Railway URL from previous step)
6. Deploy
7. Copy Vercel URL (e.g., `https://codecollab.vercel.app`)

---

## TASK 5.6: Update Backend with Frontend URL (15 min)

Go back to Railway:
1. Add environment variables:
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `ALLOWED_ORIGINS=https://your-app.vercel.app`
2. Redeploy backend

---

## TASK 5.7: Create Professional README (1 hour)

**File:** Root `README.md`

```markdown
# 🚀 CodeCollab

Real-time collaborative document editor built with Next.js, Supabase, and Socket.io.

![CodeCollab Demo](./demo.gif)

## ✨ Features

- 🔐 **Secure Authentication** - Powered by Supabase Auth
- ⚡ **Real-Time Collaboration** - Multiple users can edit simultaneously
- 👥 **Live Presence** - See who's online and editing
- 💾 **Auto-Save** - Changes saved automatically every 2 seconds
- 🔗 **Share Links** - Generate shareable links with viewer/editor permissions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Socket.io Client** - Real-time communication
- **Zustand** - State management
- **Supabase Auth Helpers** - Authentication

### Backend
- **Express** - Node.js server
- **Socket.io** - WebSocket communication
- **Supabase** - Database and authentication
- **PostgreSQL** - Database
- **TypeScript** - Type safety

## 🚀 Live Demo

**Frontend:** [https://your-app.vercel.app](https://your-app.vercel.app)  
**Backend:** [https://your-app.up.railway.app](https://your-app.up.railway.app)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Supabase account
- Railway account (for backend)
- Vercel account (for frontend)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/codecollab.git
cd codecollab
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev
```

4. **Setup Database**
- Go to Supabase SQL Editor
- Copy contents of `backend/src/db/schema.sql`
- Run the SQL

5. **Open http://localhost:3000**

## 🗄️ Database Schema

```sql
- documents (id, title, content, owner_id, created_at, updated_at)
- document_permissions (id, document_id, user_id, role)
- document_shares (id, document_id, token, role, expires_at)
- comments (id, document_id, user_id, content, position)
- audit_log (id, document_id, user_id, action, metadata)
```

## 🔐 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Real-Time Editing
![Editor](./screenshots/editor.png)

### Share Modal
![Share](./screenshots/share.png)

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Built as a portfolio project
- Inspired by Google Docs
- Uses Supabase for backend infrastructure

---

Made with ❤️ by [Your Name]
```

---

## TASK 5.8: Take Screenshots (30 min)

Take screenshots of:
1. Landing page
2. Dashboard with documents
3. Editor with multiple users
4. Share modal
5. Mobile view

Save in `screenshots/` folder.

---

## TASK 5.9: Create Demo Video (1 hour)

Record 2-3 minute video showing:
1. Landing page (5s)
2. Sign up (10s)
3. Dashboard (10s)
4. Create document (10s)
5. Real-time editing with 2 browsers (60s)
6. Share feature (30s)
7. Permissions (20s)

Upload to YouTube as unlisted.

---

## TASK 5.10: Final Testing Checklist (1 hour)

**Production Tests:**
- [ ] Sign up works
- [ ] Sign in works
- [ ] Create document works
- [ ] Real-time editing works (2 browsers)
- [ ] Share link works
- [ ] Permissions enforced
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Database persistence works
- [ ] WebSocket connections stable

---

## TASK 5.11: Update Resume (30 min)

Add to your resume:

```
CodeCollab | Full Stack Developer | [Live Demo](link) | [GitHub](link)
• Built real-time collaborative document editor with Next.js 14, Socket.io, and Supabase
• Implemented WebSocket-based real-time sync supporting 10+ concurrent users per document
• Designed PostgreSQL database with Row Level Security for multi-tenant access control
• Deployed microservices architecture on Railway (backend) and Vercel (frontend)
• Tech Stack: Next.js, TypeScript, Express, Socket.io, PostgreSQL, Tailwind CSS
```

---

## END OF DAY 6 ✅

**Final Deliverables:**
- ✅ Backend deployed to Railway
- ✅ Frontend deployed to Vercel
- ✅ Professional README
- ✅ Screenshots
- ✅ Demo video
- ✅ Production testing complete
- ✅ Resume updated

**Final Git Commit:**
```bash
git add .
git commit -m "chore: production deployment and documentation"
git push
```

---

## 🎉 PROJECT COMPLETE!

**What You Built:**
- Full-stack SaaS application
- Real-time collaboration
- Production deployment
- Professional documentation

**Your Portfolio:**
- Live demo URL
- GitHub repository
- Demo video
- Professional README

**Next Steps:**
1. ✅ Update LinkedIn
2. ✅ Share on Twitter/X
3. ✅ Apply to jobs with live demo
4. ✅ Start Project 2

---

## 📊 Final Stats

- **Total Time:** ~54 hours (6 days)
- **Lines of Code:** ~1,800+
- **Files Created:** ~40+
- **Features:** 12 major features
- **Tech Stack:** 10+ technologies

**You now have a production SaaS application on your resume!** 🚀
