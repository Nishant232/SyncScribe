# CodeCollab Implementation Part 2 — Socket.io & Server

**Continue from PART 1**

---

## TASK 1.15: Socket.io Event Handlers (1 hour)

**File:** `backend/src/socket/handlers.ts`

```typescript
import { Server, Socket } from 'socket.io';
import { RoomManager } from './rooms';
import { supabaseAdmin } from '../db/supabase';
import { debounce } from 'lodash';

interface User {
  id: string;
  email: string;
  color: string;
}

interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  color: string;
}

interface DocumentEdit {
  userId: string;
  content: string;
  timestamp: number;
  position?: number;
}

const roomManager = new RoomManager();

// Debounced save functions per document
const debouncedSaves = new Map<string, any>();

function getDebouncedSave(documentId: string) {
  if (!debouncedSaves.has(documentId)) {
    debouncedSaves.set(
      documentId,
      debounce(async (content: string, userId: string) => {
        try {
          const { error } = await supabaseAdmin
            .from('documents')
            .update({
              content,
              updated_at: new Date().toISOString(),
            })
            .eq('id', documentId);

          if (error) throw error;
          
          console.log(`💾 Saved document ${documentId} to database`);
        } catch (error) {
          console.error('Error saving document:', error);
        }
      }, 500)
    );
  }
  return debouncedSaves.get(documentId);
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join document room
    socket.on('join-document', async (data: { documentId: string; user: User }) => {
      const { documentId, user } = data;
      
      console.log(`👤 User ${user.email} joining document ${documentId}`);

      // Verify user has access to document
      try {
        const { data: permission, error } = await supabaseAdmin
          .from('document_permissions')
          .select('role')
          .eq('document_id', documentId)
          .eq('user_id', user.id)
          .single();

        if (error || !permission) {
          socket.emit('permission-denied', {
            error: 'You do not have access to this document',
          });
          return;
        }

        // Join the room
        socket.join(documentId);
        
        // Track user in room
        roomManager.addUserToRoom(documentId, socket.id, user);

        // Get all users currently in the room
        const roomUsers = roomManager.getRoomUsers(documentId);

        // Notify others that a new user joined
        socket.to(documentId).emit('user-joined', {
          user,
          timestamp: Date.now(),
        });

        // Send current users list to the newly joined user
        socket.emit('room-users', {
          users: roomUsers,
          timestamp: Date.now(),
        });

        // Broadcast updated users list to everyone
        io.to(documentId).emit('users-updated', {
          users: roomUsers,
          count: roomUsers.length,
        });

        console.log(`📊 Room ${documentId} now has ${roomUsers.length} users`);
      } catch (error) {
        console.error('Error joining document:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // Handle document content changes
    socket.on('document-change', async (data: DocumentEdit) => {
      const documentId = getDocumentIdFromSocket(socket);
      
      if (!documentId) {
        console.error('❌ No document room found for socket');
        return;
      }

      // Verify user has edit permission
      try {
        const { data: permission, error } = await supabaseAdmin
          .from('document_permissions')
          .select('role')
          .eq('document_id', documentId)
          .eq('user_id', data.userId)
          .in('role', ['owner', 'editor'])
          .single();

        if (error || !permission) {
          socket.emit('permission-denied', {
            error: 'You do not have permission to edit this document',
          });
          return;
        }

        // Broadcast change to all other users in the room (immediate)
        socket.to(documentId).emit('document-update', {
          ...data,
          timestamp: Date.now(),
        });

        // Save to database (debounced to avoid spam)
        const debouncedSave = getDebouncedSave(documentId);
        debouncedSave(data.content, data.userId);

      } catch (error) {
        console.error('Error handling document change:', error);
      }
    });

    // Handle cursor position updates
    socket.on('cursor-move', (data: CursorPosition) => {
      const documentId = getDocumentIdFromSocket(socket);
      
      if (!documentId) return;

      // Broadcast cursor position to others (throttled on client)
      socket.to(documentId).emit('cursor-update', {
        ...data,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });

    // Handle typing indicator
    socket.on('typing-start', (data: { userId: string; userName: string }) => {
      const documentId = getDocumentIdFromSocket(socket);
      if (!documentId) return;

      socket.to(documentId).emit('user-typing', {
        ...data,
        timestamp: Date.now(),
      });
    });

    socket.on('typing-stop', (data: { userId: string }) => {
      const documentId = getDocumentIdFromSocket(socket);
      if (!documentId) return;

      socket.to(documentId).emit('user-stopped-typing', {
        userId: data.userId,
      });
    });

    // Handle comments
    socket.on('add-comment', (data: any) => {
      const documentId = getDocumentIdFromSocket(socket);
      if (!documentId) return;

      // Broadcast new comment to all users
      io.to(documentId).emit('comment-added', {
        ...data,
        timestamp: Date.now(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      const documentId = getDocumentIdFromSocket(socket);
      
      if (documentId) {
        const user = roomManager.removeUserFromRoom(documentId, socket.id);
        
        if (user) {
          // Notify others that user left
          socket.to(documentId).emit('user-left', {
            user,
            timestamp: Date.now(),
          });

          // Send updated users list
          const roomUsers = roomManager.getRoomUsers(documentId);
          io.to(documentId).emit('users-updated', {
            users: roomUsers,
            count: roomUsers.length,
          });

          console.log(`👋 User ${user.email} left document ${documentId}`);
        }
      }
    });

    // Heartbeat for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });
}

// Helper function to get document ID from socket rooms
function getDocumentIdFromSocket(socket: Socket): string | null {
  const rooms = Array.from(socket.rooms);
  // First room is always the socket ID, second is the document room
  return rooms.find(room => room !== socket.id) || null;
}
```

---

## TASK 1.16: Main Server File (30 min)

**File:** `backend/src/server.ts`

```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './socket/handlers';
import documentRoutes from './routes/documents';
import sharingRoutes from './routes/sharing';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Apply rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/', healthRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', sharingRoutes);

// Socket.io connection handling
setupSocketHandlers(io);

// Socket.io metrics endpoint
app.get('/api/metrics', (req, res) => {
  const sockets = io.sockets.sockets;
  const rooms = io.sockets.adapter.rooms;
  
  res.json({
    connectedClients: sockets.size,
    activeRooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

export { io };
```

---

## TASK 1.17: Database Setup Script (15 min)

**File:** `backend/src/db/setup.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read schema file
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    // Note: Supabase doesn't support direct SQL execution via JS client
    // You need to run the schema.sql manually in Supabase SQL Editor
    console.log('📝 Schema SQL ready. Please run the following in Supabase SQL Editor:');
    console.log('   1. Go to https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Copy and run the contents of backend/src/db/schema.sql');
    console.log('');
    console.log('✅ After running the SQL, your database will be ready!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
```

---

## TASK 1.18: Install Backend Dependencies (10 min)

Run in backend directory:

```bash
cd backend
npm install
```

Expected packages installed:
- express
- socket.io
- @supabase/supabase-js
- cors
- helmet
- morgan
- dotenv
- express-rate-limit
- lodash
- typescript
- tsx
- @types/* packages

---

## TASK 1.19: Create Backend .env File (5 min)

**File:** `backend/.env`

```env
# Supabase - GET FROM https://app.supabase.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**IMPORTANT:** Replace with your actual Supabase credentials!

---

## TASK 1.20: Setup Database Schema in Supabase (15 min)

**Steps:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to SQL Editor (left sidebar)
4. Click "New Query"
5. Copy entire contents of `backend/src/db/schema.sql`
6. Paste and click "Run"
7. Verify tables created (go to Table Editor)

**Expected tables:**
- documents
- document_permissions
- document_shares
- comments
- audit_log

---

## TASK 1.21: Test Backend (15 min)

```bash
# Start backend
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
📡 Socket.io ready for connections
🌍 Environment: development
```

**Test endpoints:**
```bash
# Health check
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"...","uptime":...}

# Metrics
curl http://localhost:5000/api/metrics
# Should return: {"connectedClients":0,"activeRooms":0,"timestamp":"..."}
```

---

## END OF DAY 1 ✅

**Backend Deliverables:**
- ✅ Express server with Socket.io
- ✅ Supabase integration
- ✅ Auth middleware
- ✅ Document CRUD routes
- ✅ Sharing routes
- ✅ Rate limiting
- ✅ Socket.io room management
- ✅ Database schema

**Git Commit:**
```bash
cd codecollab
git add backend/
git commit -m "feat: complete backend with Supabase auth and Socket.io"
git push
```

---

# DAY 2: FRONTEND FOUNDATION

**Goal:** Next.js app with Supabase Auth, Dashboard, Document CRUD  
**Time:** 10 hours

---

## TASK 2.1: Frontend Package.json (10 min)

**File:** `frontend/package.json`

```json
{
  "name": "codecollab-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "socket.io-client": "^4.7.2",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "date-fns": "^3.0.6",
    "lodash": "^4.17.21",
    "lucide-react": "^0.298.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/lodash": "^4.14.202",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3"
  }
}
```

---

## TASK 2.2: Frontend TypeScript Config (5 min)

**File:** `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## TASK 2.3: Next.js Config (5 min)

**File:** `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
}

module.exports = nextConfig
```

---

## TASK 2.4: Tailwind Config (10 min)

**File:** `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
```

---

## TASK 2.5: PostCSS Config (5 min)

**File:** `frontend/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## TASK 2.6: Environment Template (5 min)

**File:** `frontend/.env.local.example`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Continue to PART 3 for complete frontend implementation...

**Save this file. Part 3 will contain all frontend components, Supabase client setup, and authentication flow.**
