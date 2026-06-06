# 🚀 CodeCollab — Complete Implementation with Supabase Auth

> **For:** Antigravity AI Agent  
> **Project:** Real-Time Collaborative Document Editor (SaaS)  
> **Stack:** Next.js 14 · TypeScript · Socket.io · PostgreSQL · Supabase Auth  
> **Timeline:** 6 Days · 50-60 hours  
> **Output:** Production-ready portfolio project

---

## 📋 AI AGENT INSTRUCTIONS

**You are building CodeCollab, a Google Docs-style real-time collaborative document editor.**

**Key Requirements:**
- Use Supabase for authentication AND database
- Use Socket.io for real-time collaboration
- Build with Next.js 14 (App Router) + TypeScript
- Follow this plan exactly, file by file
- Test after each major task
- Use environment variables for all secrets

**Working Directory:** `./codecollab/`

---

## 🏗️ PROJECT STRUCTURE

```
codecollab/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── db/
│   │   │   ├── supabase.ts
│   │   │   ├── schema.sql
│   │   │   └── setup.js
│   │   ├── socket/
│   │   │   ├── handlers.ts
│   │   │   └── rooms.ts
│   │   ├── routes/
│   │   │   ├── documents.ts
│   │   │   ├── sharing.ts
│   │   │   └── health.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── auth.ts
│   │   │   └── rateLimit.ts
│   │   └── utils/
│   │       ├── colors.ts
│   │       └── logger.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   └── (protected)/
    │       ├── layout.tsx
    │       ├── dashboard/page.tsx
    │       └── document/[id]/page.tsx
    ├── components/
    │   ├── ui/ (shadcn)
    │   ├── auth/
    │   │   ├── AuthForm.tsx
    │   │   └── AuthProvider.tsx
    │   ├── editor/
    │   │   ├── Editor.tsx
    │   │   └── SavingIndicator.tsx
    │   ├── collaboration/
    │   │   ├── PresenceBar.tsx
    │   │   ├── CursorOverlay.tsx
    │   │   └── TypingIndicator.tsx
    │   ├── documents/
    │   │   ├── DocumentList.tsx
    │   │   ├── DocumentCard.tsx
    │   │   └── CreateButton.tsx
    │   ├── sharing/
    │   │   └── ShareModal.tsx
    │   └── layout/
    │       └── Navbar.tsx
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── socket.ts
    │   ├── store.ts
    │   ├── api.ts
    │   ├── hooks/
    │   │   ├── useDocument.ts
    │   │   ├── useCollaboration.ts
    │   │   └── useAuth.ts
    │   └── utils/
    │       └── colors.ts
    ├── types/
    │   └── index.ts
    ├── middleware.ts
    ├── package.json
    ├── tsconfig.json
    └── .env.local.example
```

---

# DAY 1: PROJECT SETUP & BACKEND FOUNDATION

**Goal:** Initialize project, setup Supabase, create backend structure  
**Time:** 8 hours

---

## TASK 1.1: Initialize Project Structure (15 min)

Create the following directory structure:

```bash
mkdir -p codecollab/backend/src/{db,socket,routes,middleware,utils}
mkdir -p codecollab/frontend/{app,components,lib,types}
cd codecollab
```

---

## TASK 1.2: Backend Package.json (10 min)

**File:** `backend/package.json`

```json
{
  "name": "codecollab-backend",
  "version": "1.0.0",
  "description": "Real-time collaboration backend with Supabase",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:setup": "node -r dotenv/config src/db/setup.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@supabase/supabase-js": "^2.39.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    "@types/morgan": "^1.9.9",
    "@types/lodash": "^4.14.202",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## TASK 1.3: Backend TypeScript Config (5 min)

**File:** `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## TASK 1.4: Backend Environment Template (5 min)

**File:** `backend/.env.example`

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Frontend URL (for share links)
FRONTEND_URL=http://localhost:3000
```

---

## TASK 1.5: Supabase Database Schema (30 min)

**File:** `backend/src/db/schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document permissions
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);

-- Share tokens for invite links
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('editor', 'viewer')),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_permissions_document ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON document_shares(token);
CREATE INDEX IF NOT EXISTS idx_shares_document ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_document ON comments(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_document ON audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Documents: Users can see documents they own or have permission to access
CREATE POLICY "Users can view own documents or shared documents"
  ON documents FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM document_permissions 
      WHERE user_id = auth.uid()
    )
  );

-- Documents: Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Documents: Users can update documents they own or have editor permission
CREATE POLICY "Users can update own or editor documents"
  ON documents FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM document_permissions 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Documents: Only owners can delete
CREATE POLICY "Only owners can delete documents"
  ON documents FOR DELETE
  USING (owner_id = auth.uid());

-- Permissions: Users can view permissions for documents they have access to
CREATE POLICY "Users can view permissions for accessible documents"
  ON document_permissions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE owner_id = auth.uid() OR
      id IN (SELECT document_id FROM document_permissions WHERE user_id = auth.uid())
    )
  );

-- Permissions: Only owners can manage permissions
CREATE POLICY "Only owners can manage permissions"
  ON document_permissions FOR ALL
  USING (
    document_id IN (SELECT id FROM documents WHERE owner_id = auth.uid())
  );
```

---

## TASK 1.6: Supabase Client (20 min)

**File:** `backend/src/db/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular client with anon key (respects RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to verify JWT token
export async function verifyToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user;
}

// Helper to get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (error || !data.user) {
    throw new Error('User not found');
  }
  
  return data.user;
}
```

---

## TASK 1.7: Auth Middleware (20 min)

**File:** `backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../db/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const user = await verifyToken(token);
    
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to request
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
```

---

## TASK 1.8: Rate Limiting Middleware (15 min)

**File:** `backend/src/middleware/rateLimit.ts`

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for document creation
export const createDocumentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many documents created, please try again later.',
});

// Socket connection limit
export const socketConnectionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many socket connections, please slow down.',
});
```

---

## TASK 1.9: Error Handler (10 min)

**File:** `backend/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```

---

## TASK 1.10: Utility Functions (15 min)

**File:** `backend/src/utils/colors.ts`

```typescript
const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B88B', '#52B788', '#E76F51', '#A8DADC',
];

export function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return COLLABORATOR_COLORS[hash % COLLABORATOR_COLORS.length];
}

export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

**File:** `backend/src/utils/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    if (meta) {
      console.log(prefix, message, meta);
    } else {
      console.log(prefix, message);
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

export const serverLogger = new Logger('Server');
export const socketLogger = new Logger('Socket');
export const dbLogger = new Logger('Database');
```

---

## TASK 1.11: Document Routes (45 min)

**File:** `backend/src/routes/documents.ts`

```typescript
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../db/supabase';
import { createDocumentLimiter } from '../middleware/rateLimit';

const router = Router();

// Get all documents for user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req;

    // Query documents where user is owner or has permissions
    const { data: documents, error } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        document_permissions!inner(role)
      `)
      .or(`owner_id.eq.${userId},document_permissions.user_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ documents: documents || [] });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get single document
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Get document with permission check
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        document_permissions!inner(role)
      `)
      .eq('id', id)
      .or(`owner_id.eq.${userId},document_permissions.user_id.eq.${userId}`)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create document
router.post('/', requireAuth, createDocumentLimiter, async (req: AuthRequest, res) => {
  try {
    const { title = 'Untitled Document', content = '' } = req.body;
    const { userId } = req;

    // Create document
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .insert({
        title,
        content,
        owner_id: userId,
      })
      .select()
      .single();

    if (docError || !document) throw docError;

    // Create owner permission
    const { error: permError } = await supabaseAdmin
      .from('document_permissions')
      .insert({
        document_id: document.id,
        user_id: userId,
        role: 'owner',
      });

    if (permError) throw permError;

    res.status(201).json({ document });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Update document
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const { userId } = req;

    // Check edit permission
    const { data: permission } = await supabaseAdmin
      .from('document_permissions')
      .select('role')
      .eq('document_id', id)
      .eq('user_id', userId)
      .in('role', ['owner', 'editor'])
      .single();

    if (!permission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    // Update document
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Only owner can delete
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!document || document.owner_id !== userId) {
      return res.status(403).json({ error: 'Only owner can delete document' });
    }

    // Delete document (cascades to permissions and shares)
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
```

---

## TASK 1.12: Sharing Routes (45 min)

**File:** `backend/src/routes/sharing.ts`

```typescript
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../db/supabase';
import crypto from 'crypto';

const router = Router();

// Generate share link
router.post('/documents/:id/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: documentId } = req.params;
    const { userId } = req;
    const { role = 'viewer', expiresInDays } = req.body;

    // Check if user has permission to share
    const { data: permission } = await supabaseAdmin
      .from('document_permissions')
      .select('role')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .in('role', ['owner', 'editor'])
      .single();

    if (!permission) {
      return res.status(403).json({ error: 'Insufficient permissions to share' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expiresInDays);
      expiresAt = expireDate.toISOString();
    }

    // Create share record
    const { data: share, error } = await supabaseAdmin
      .from('document_shares')
      .insert({
        document_id: documentId,
        token,
        role,
        created_by: userId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;

    const shareLink = `${process.env.FRONTEND_URL}/join/${token}`;

    res.json({ share, link: shareLink });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// Join document via token
router.get('/join/:token', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;
    const { userId } = req;

    // Find valid share token
    const { data: share, error } = await supabaseAdmin
      .from('document_shares')
      .select('*')
      .eq('token', token)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .single();

    if (error || !share) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }

    // Add user to document permissions
    const { error: permError } = await supabaseAdmin
      .from('document_permissions')
      .upsert({
        document_id: share.document_id,
        user_id: userId,
        role: share.role,
      }, {
        onConflict: 'document_id,user_id',
      });

    if (permError) throw permError;

    // Mark share as used
    await supabaseAdmin
      .from('document_shares')
      .update({
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', share.id);

    res.json({
      documentId: share.document_id,
      role: share.role,
    });
  } catch (error) {
    console.error('Error joining document:', error);
    res.status(500).json({ error: 'Failed to join document' });
  }
});

// Get collaborators
router.get('/documents/:id/collaborators', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: documentId } = req.params;
    const { userId } = req;

    // Check if user has access
    const { data: access } = await supabaseAdmin
      .from('document_permissions')
      .select('role')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all collaborators
    const { data: permissions, error } = await supabaseAdmin
      .from('document_permissions')
      .select('*, user:user_id(*)')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const collaborators = permissions?.map((p: any) => ({
      id: p.user_id,
      email: p.user?.email || 'Unknown',
      role: p.role,
      created_at: p.created_at,
    })) || [];

    res.json({ collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// Remove collaborator
router.delete('/documents/:id/collaborators/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: documentId, userId: targetUserId } = req.params;
    const { userId } = req;

    // Only owner can remove collaborators
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (!document || document.owner_id !== userId) {
      return res.status(403).json({ error: 'Only owner can remove collaborators' });
    }

    // Cannot remove owner
    if (targetUserId === document.owner_id) {
      return res.status(400).json({ error: 'Cannot remove owner' });
    }

    // Remove permission
    const { error } = await supabaseAdmin
      .from('document_permissions')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', targetUserId);

    if (error) throw error;

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;
```

---

## TASK 1.13: Health Route (10 min)

**File:** `backend/src/routes/health.ts`

```typescript
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/api/metrics', (req, res) => {
  res.json({
    connectedClients: 0, // Will be updated with Socket.io
    activeRooms: 0,
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

---

## TASK 1.14: Room Manager (20 min)

**File:** `backend/src/socket/rooms.ts`

```typescript
interface User {
  id: string;
  email: string;
  color: string;
}

interface RoomUser extends User {
  socketId: string;
  joinedAt: number;
}

export class RoomManager {
  private rooms: Map<string, Map<string, RoomUser>> = new Map();

  addUserToRoom(roomId: string, socketId: string, user: User): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const room = this.rooms.get(roomId)!;
    room.set(socketId, {
      ...user,
      socketId,
      joinedAt: Date.now(),
    });
  }

  removeUserFromRoom(roomId: string, socketId: string): RoomUser | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.get(socketId) || null;
    room.delete(socketId);

    if (room.size === 0) {
      this.rooms.delete(roomId);
    }

    return user;
  }

  getRoomUsers(roomId: string): RoomUser[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.values()) : [];
  }

  getUserCount(roomId: string): number {
    return this.rooms.get(roomId)?.size || 0;
  }

  isUserInRoom(roomId: string, socketId: string): boolean {
    return this.rooms.get(roomId)?.has(socketId) || false;
  }

  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  getRoomStats(): { [roomId: string]: number } {
    const stats: { [roomId: string]: number } = {};
    
    this.rooms.forEach((users, roomId) => {
      stats[roomId] = users.size;
    });

    return stats;
  }
}
```

---

## Continue to PART 2 for Socket Handlers and Main Server...

**This is Part 1 of Day 1. Save this file and I'll create Part 2 with the remaining backend setup.**
