---
title: SyncScribe
emoji: 📝
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
---

<div align="center">

<br />

```
 ____                   ____            _ _
/ ___| _   _ _ __   ___/ ___|  ___ _ __(_) |__   ___
\___ \| | | | '_ \ / __\___ \ / __| '__| | '_ \ / _ \
 ___) | |_| | | | | (__ ___) | (__| |  | | |_) |  __/
|____/ \__, |_| |_|\___|____/ \___|_|  |_|_.__/ \___|
       |___/
```

**Real-time collaborative document editing for modern teams**

*Write together. In perfect sync.*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7.2-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Express](https://img.shields.io/badge/Express-4.18-404040?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br />

[Live Demo](#) &nbsp;·&nbsp; [Report Bug](https://github.com/Nishant232/syncscribe/issues) &nbsp;·&nbsp; [Request Feature](https://github.com/Nishant232/syncscribe/issues)

<br />

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Core Features](#-core-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture](#-system-architecture)
5. [Database Schema](#-database-schema)
6. [Authentication Flow](#-authentication-flow)
7. [Real-Time Collaboration Flow](#-real-time-collaboration-flow)
8. [Complete Request Lifecycle](#-complete-request-lifecycle)
9. [API Reference](#-api-reference)
10. [WebSocket Events](#-websocket-events)
11. [Project Structure](#-project-structure)
12. [Getting Started](#-getting-started)
13. [Environment Variables](#-environment-variables)
14. [Deployment](#-deployment)
15. [Security Overview](#-security-overview)

---

## 🔭 Overview

**SyncScribe** is a production-ready, full-stack real-time collaborative document editor. Multiple users can edit the same document simultaneously — watching each other's cursors move and text appear character-by-character, with zero page refreshes.

It is built on a **three-tier architecture**:

| Tier | Technology | Role |
|------|-----------|------|
| **Frontend** | Next.js 14 + Zustand | UI, state management, Supabase Auth SSR |
| **Backend** | Express + Socket.io | REST API, WebSocket hub, JWT verification |
| **Database** | Supabase (PostgreSQL) | Persistence, Auth, Row Level Security |

> **Core principle:** User edits travel through Socket.io WebSockets for instant peer broadcast, and are persisted to PostgreSQL via a **500 ms debounce** to balance responsiveness with database load.

---

## ✨ Core Features

| Feature | Details |
|---------|---------|
| **⚡ Real-Time Editing** | Keystroke-level sync via Socket.io — no polling, no refresh |
| **🖱️ Live Cursors** | Color-coded cursor positions with floating name labels |
| **💬 Typing Indicators** | "User is typing..." broadcast to all peers in the room |
| **👥 Team Presence** | Live avatar bar — see who joined and when |
| **💾 Auto-Save** | 500 ms debounced write to PostgreSQL on every change |
| **🔗 Share Links** | 64-char hex tokens — set viewer or editor role per invite |
| **🔐 Role-Based Access** | `owner` · `editor` · `viewer` enforced via PostgreSQL RLS |
| **🛡️ Secure Auth** | Supabase JWT verified server-side on every request and socket |

---

## 🛠 Tech Stack

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.0.4 | App Router, SSR, routing |
| React | 18.2 | Component model |
| TypeScript | 5.3.3 | Full type safety |
| Tailwind CSS | 3.3.6 | Utility-first styling |
| Space Grotesk + Inter | — | Display + body typography |
| Zustand | 4.4.7 | Lightweight global state |
| Socket.io Client | 4.7.2 | WebSocket client |
| Supabase.js + SSR | 2.39.0 | Auth & DB client |
| Axios | 1.6.2 | HTTP REST client |
| Lucide React | 0.298 | Icon library |
| date-fns | 3.0.6 | Date formatting |
| Lodash | 4.17.21 | Debounce utility |

### Backend

| Library | Version | Purpose |
|---------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| Express | 4.18.2 | HTTP server & routing |
| Socket.io | 4.7.2 | WebSocket server |
| TypeScript | 5.3.3 | Type safety |
| Supabase Admin SDK | 2.39.0 | DB access + token verification |
| express-rate-limit | 7.1.5 | Rate limiting |
| cors | 2.8.5 | CORS policy |
| dotenv | 16.3.1 | Env configuration |

### Infrastructure

| Service | Role |
|---------|------|
| **Supabase** | PostgreSQL + Auth + Row Level Security |
| **Vercel** | Frontend (Next.js edge-optimised) |
| **Railway** | Backend (Node.js container) |

---

## 🏗 System Architecture

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                            BROWSER / CLIENT                               ║
║                                                                           ║
║  ┌───────────────────────────────────────────────────────────────────┐   ║
║  │  Next.js 14 App Router                                             │   ║
║  │                                                                    │   ║
║  │  ┌──────────────────┐         ┌───────────────────────────────┐   │   ║
║  │  │ Server Components│         │  Client Components             │   │   ║
║  │  │  (SSR / RSC)     │         │  Editor · Dashboard · Auth    │   │   ║
║  │  │  Auth guard      │         │                               │   │   ║
║  │  └──────────────────┘         └───────────────────────────────┘   │   ║
║  └────────────────────────────────────────┬────────────────────────────┘  ║
║                                            │                               ║
║  ┌─────────────────────────────┐   ┌───────▼──────────────────────────┐  ║
║  │  Zustand Store               │   │  Communication Layer              │  ║
║  │  ─────────────────────────   │   │  ──────────────────────────────   │  ║
║  │  currentDocument             │   │  ┌──────────────┐ ┌───────────┐  │  ║
║  │  content · isSaving          │◄──┤  │ Axios Client │ │Socket.io  │  │  ║
║  │  onlineUsers · cursors       │   │  │ Bearer JWT   │ │Client WSS │  │  ║
║  │  typingUsers · isConnected   │   │  │ auto-attach  │ │max 5 retry│  │  ║
║  └─────────────────────────────┘   │  └──────┬───────┘ └─────┬─────┘  │  ║
║                                    └─────────┼───────────────┼─────────┘  ║
╚═══════════════════════════════════════════════╪═══════════════╪════════════╝
                                                │               │
                                 HTTPS · REST   │               │   WSS · Socket.io
                                                │               │
╔═══════════════════════════════════════════════▼═══════════════▼════════════╗
║                         EXPRESS BACKEND  (Port 5000)                       ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────┐ ║
║  │  Middleware Pipeline                                                   │ ║
║  │                                                                        │ ║
║  │   CORS  ──►  express.json  ──►  Rate Limiter  ──►  Auth (JWT verify)  │ ║
║  └────────────────────────────────────┬─────────────────────────────────┘ ║
║                                        │                                   ║
║       ┌────────────────────────────────┼────────────────────────┐         ║
║       │                                │                         │         ║
║  ┌────▼──────────────┐      ┌──────────▼──────────┐   ┌─────────▼──────┐ ║
║  │  REST Routes       │      │  Socket.io Server    │   │  RoomManager   │ ║
║  │  ────────────────  │      │  ────────────────    │   │  (In-Memory)   │ ║
║  │  GET  /documents   │      │  join-document        │   │                │ ║
║  │  POST /documents   │      │  document-change      │   │  roomId        │ ║
║  │  PATCH/:id         │      │  cursor-move          │   │   └─ Map<      │ ║
║  │  DELETE/:id        │      │  typing-start/stop    │   │    socketId,   │ ║
║  │  POST /:id/share   │      │  add-comment          │   │    UserInfo>   │ ║
║  │  GET  /join/:tok   │      │  ping · pong          │   │                │ ║
║  └───────┬────────────┘      └──────────┬────────────┘   └────────────────┘ ║
║          └──────────────────────────────┘                                  ║
║                         │  Supabase Admin SDK                              ║
╚═════════════════════════╪════════════════════════════════════════════════════╝
                           │
╔══════════════════════════▼════════════════════════════════════════════════════╗
║                          SUPABASE PLATFORM                                    ║
║                                                                               ║
║  ┌──────────────────┐    ┌───────────────────┐    ┌────────────────────────┐ ║
║  │   PostgreSQL DB   │    │   Supabase Auth    │    │  Row Level Security    │ ║
║  │  ──────────────   │    │  ──────────────    │    │  ────────────────────  │ ║
║  │  documents        │    │  JWT generation    │    │  owner  → full CRUD    │ ║
║  │  doc_permissions  │    │  User management   │    │  editor → read + write │ ║
║  │  document_shares  │    │  Token verify      │    │  viewer → read only    │ ║
║  │  comments         │    │                    │    │                        │ ║
║  │  audit_log        │    │                    │    │  Enforced at DB layer  │ ║
║  └──────────────────┘    └───────────────────┘    └────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Edit Propagation

```
  User types a character
          │
          ▼
  React setState  ──────────────────────────────  (local update — instant)
          │
          ▼
  emit('document-change', { content, documentId })
          │
          │  WebSocket  (< 50 ms)
          ▼
  Backend Socket.io Server
          │
          ├──────────────────────────────────────────────────────────────────►
          │  socket.to(room).emit('document-update', { content, userId })
          │  broadcast to all other peers in the room
          │                   │
          │                   ▼
          │          All peers update their editor UI
          │
          └──────────────────────────────────────────────────────────────────►
             debounce 500 ms
                     │
                     ▼
             UPDATE documents SET content = $1 WHERE id = $2
                     │
                     ▼
             PostgreSQL (Supabase) — persisted ✓
```

---

## 🗄 Database Schema

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │  documents                                                            │
 │  ────────────────────────────────────────────────────────────────    │
 │  id           UUID         PK   DEFAULT gen_random_uuid()            │
 │  title        TEXT              DEFAULT 'Untitled Document'          │
 │  content      TEXT              DEFAULT ''                           │
 │  owner_id     UUID         FK ──────────────────────────────┐        │
 │  is_public    BOOLEAN           DEFAULT false                │        │
 │  created_at   TIMESTAMPTZ       DEFAULT now()                │        │
 │  updated_at   TIMESTAMPTZ       auto-trigger on UPDATE       │        │
 └──────────────────────┬───────────────────────────────────────┘        │
                        │ 1 : N                                  │        │
          ┌─────────────┴──────────────────────┐                ▼        │
          │                                    │           auth.users     │
          ▼                                    ▼                          │
 ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
 │  document_permissions        │  │  document_shares                  │  │
 │  ──────────────────────────  │  │  ──────────────────────────────   │  │
 │  id           UUID  PK       │  │  id           UUID  PK            │  │
 │  document_id  UUID  FK       │  │  document_id  UUID  FK            │  │
 │  user_id      UUID  FK       │  │  token        TEXT  UNIQUE (64ch) │  │
 │  role         ENUM:          │  │  role         ENUM: editor|viewer │  │
 │    owner                     │  │  created_by   UUID  FK            │  │
 │    editor                    │  │  expires_at   TIMESTAMPTZ NULL    │  │
 │    viewer                    │  │  used_by      UUID  NULL          │  │
 │  created_at   TIMESTAMPTZ    │  │  used_at      TIMESTAMPTZ NULL    │  │
 │                              │  │  created_at   TIMESTAMPTZ         │  │
 │  UNIQUE (document_id,        │  └──────────────────────────────────┘  │
 │           user_id)           │                                         │
 └──────────────────────────────┘                                         │
                                                                           │
 ┌──────────────────────────────┐  ┌──────────────────────────────────┐   │
 │  comments                    │  │  audit_log                        │   │
 │  ──────────────────────────  │  │  ──────────────────────────────   │   │
 │  id           UUID  PK       │  │  id           UUID  PK            │   │
 │  document_id  UUID  FK       │  │  document_id  UUID  FK            │   │
 │  user_id      UUID  FK       │  │  user_id      UUID  FK            │◄──┘
 │  content      TEXT  NOT NULL │  │  action       TEXT  NOT NULL      │
 │  position     INT            │  │  metadata     JSONB               │
 │  resolved     BOOL DEFAULT   │  │  ip_address   INET                │
 │               false          │  │  created_at   TIMESTAMPTZ         │
 │  created_at   TIMESTAMPTZ    │  └──────────────────────────────────┘
 │  updated_at   TIMESTAMPTZ    │
 └──────────────────────────────┘

 Role Hierarchy
 ──────────────────────────────────────────────────────────────
 owner  ──►  full control (CRUD + share + manage collaborators)
 editor ──►  read + write content, real-time collaboration
 viewer ──►  read only — watches live edits, cannot modify
```

---

## 🔐 Authentication Flow

```
  Browser              Next.js Middleware          Backend              Supabase Auth
     │                        │                       │                      │
     │── POST /auth/signup ──►│                       │                      │
     │   { email, password }  │── signUp() ───────────────────────────────►│
     │                        │                       │   create user record │
     │                        │◄── { user, session } ─────────────────────── │
     │◄── Set-Cookie: sb-* ───│                       │                      │
     │                        │                       │                      │
     │── Navigate /dashboard ►│                       │                      │
     │                        │ middleware.ts                                 │
     │                        │── supabase.auth.getUser() ────────────────►│
     │                        │◄── { user } or null ──────────────────────── │
     │                        │                       │                      │
     │               ┌────────┴────────┐              │                      │
     │               │ user present?   │              │                      │
     │               │  yes → render   │              │                      │
     │               │  no  → /login   │              │                      │
     │               └─────────────────┘              │                      │
     │                        │                       │                      │
     │── GET /api/documents ──────────────────────────►│                      │
     │   Authorization: Bearer <JWT>                  │                      │
     │                                      auth middleware                  │
     │                                      getUser(token) ─────────────────►│
     │                                      (max 3 retries + backoff)        │
     │                                                │◄── { user } ─────────│
     │◄── 200 { documents: [...] } ───────────────────│                      │
     │                                                │                      │
     │── socket.connect({ auth: { token } }) ────────►│                      │
     │                                      verify token again               │
     │◄── connected  OR  'permission-denied' ─────────│                      │
```

---

## ⚡ Real-Time Collaboration Flow

```
  User A (Editor)        Backend Socket.io         User B (Viewer)       PostgreSQL
       │                        │                        │                    │
       │─ join-document ───────►│                        │                    │
       │  { documentId, JWT }   │── verify JWT           │                    │
       │                        │── check permissions    │                    │
       │                        │── RoomManager.add(A)   │                    │
       │◄─ room-users ──────────│                        │                    │
       │   { users: [ ... ] }   │                        │                    │
       │                        │◄─── join-document ─────│                    │
       │                        │     { documentId, JWT }│                    │
       │◄─ user-joined ─────────│────────────────────────►│                   │
       │   { user: B, color }   │                        │                    │
       │                        │                        │                    │
       │  ✏️  User A types       │                        │                    │
       │─ document-change ─────►│                        │                    │
       │  { content }           │── document-update ─────►│                   │
       │                        │   (broadcast to room)  │◄── editor updates  │
       │                        │                        │                    │
       │─ cursor-move ─────────►│                        │                    │
       │  { position: 42 }      │── cursor-update ───────►│                   │
       │                        │                        │  show cursor @42   │
       │                        │                        │                    │
       │─ typing-start ────────►│                        │                    │
       │                        │── user-typing ─────────►│                   │
       │                        │                        │ "A is typing..."   │
       │─ typing-stop ─────────►│                        │                    │
       │                        │── user-stopped-typing ──►│                  │
       │                        │                        │                    │
       │     ·  ·  ·  debounce 500 ms elapses  ·  ·  ·   │                    │
       │                        │── UPDATE documents ────────────────────────►│
       │                        │   SET content = $1     │                    │
       │                        │   WHERE id = $2        │                    │
       │                        │◄─────────────────────────────── OK ─────────│
       │                        │                        │                    │
       │  🚪  User A closes tab  │                        │                    │
       │─ disconnect ──────────►│                        │                    │
       │                        │── RoomManager.remove(A)│                    │
       │                        │── user-left ───────────►│                   │
       │                        │   { userId: A }        │  remove A cursor   │
```

---

## 🔄 Complete Request Lifecycle

```
  Browser          Next.js (SSR)              Backend                  Supabase
     │                   │                       │                         │
     │── /dashboard ─────►│                       │                         │
     │              middleware.ts                 │                         │
     │              supabase.auth.getUser()────────────────────────────────►│
     │                   │◄──────────────────────────────── { user }/null ──│
     │              no user → redirect /auth/login                          │
     │                   │                       │                         │
     │◄── Render page ───│                       │                         │
     │                   │                       │                         │
     │── GET /api/documents ─────────────────────►│                         │
     │   Authorization: Bearer JWT                │                         │
     │                               auth.ts: getUser(token)               │
     │                                            │────────────────────────►│
     │                                            │◄────── { user } ────────│
     │                               rate limit check (pass)               │
     │                                            │                         │
     │                               SELECT * FROM documents               │
     │                               WHERE owner_id = user.id             │
     │                               OR id IN (                           │
     │                                 SELECT document_id                  │
     │                                 FROM document_permissions           │
     │                                 WHERE user_id = user.id            │
     │                               )────────────────────────────────────►│
     │                                            │◄────── [rows] ──────────│
     │◄── 200 { documents: [...] } ───────────────│                         │
     │                                            │                         │
     │── socket.connect({ auth: { token } })─────►│                         │
     │                               verify JWT, join room                  │
     │◄── 'connected' ────────────────────────────│                         │
     │                                            │                         │
     │── 'document-change' { content }────────────►│                         │
     │                               broadcast to peers                    │
     │                               debounce 500 ms → persist ───────────►│
     │◄── 'document-update' (from peers) ─────────│                         │
```

---

## 🔗 API Reference

**Base URL:** `http://localhost:5000`

### Documents

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|:----:|:----------:|-------------|
| `GET` | `/api/documents` | ✅ | 100 / 15 min | List all accessible documents |
| `GET` | `/api/documents/:id` | ✅ | 100 / 15 min | Fetch a single document |
| `POST` | `/api/documents` | ✅ | **10 / 15 min** | Create a new document |
| `PATCH` | `/api/documents/:id` | ✅ | 100 / 15 min | Update title or content |
| `DELETE` | `/api/documents/:id` | ✅ owner | 100 / 15 min | Delete document permanently |

### Sharing & Collaboration

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/documents/:id/share` | ✅ | Generate share token with role + optional expiry |
| `GET` | `/api/join/:token` | ✅ | Redeem token → inserts `document_permissions` row |
| `GET` | `/api/documents/:id/collaborators` | ✅ | List collaborators and their roles |
| `DELETE` | `/api/documents/:id/collaborators/:userId` | ✅ owner | Remove a collaborator |

### System

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/health` | ❌ | Health check |
| `GET` | `/api/metrics` | ✅ | Active rooms and connected socket counts |

---

## 📡 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-document` | `{ documentId, token? }` | Join a document collaboration room |
| `document-change` | `{ documentId, content, cursorPosition }` | Broadcast an edit |
| `cursor-move` | `{ documentId, position }` | Update cursor position |
| `typing-start` | `{ documentId }` | Signal that typing started |
| `typing-stop` | `{ documentId }` | Signal that typing stopped |
| `add-comment` | `{ documentId, content, position }` | Add an inline comment |
| `leave-document` | `{ documentId }` | Explicit room exit |
| `ping` | — | Connection heartbeat |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-users` | `{ users[] }` | Current users in the room (on join) |
| `user-joined` | `{ user, color, joinedAt }` | Someone entered the room |
| `user-left` | `{ userId, socketId }` | Someone disconnected |
| `users-updated` | `{ users[], count }` | Refreshed presence list |
| `document-update` | `{ content, userId, timestamp }` | Live content change broadcast |
| `cursor-update` | `{ socketId, userId, position }` | Live cursor position |
| `user-typing` | `{ userId, userEmail }` | Typing indicator activated |
| `user-stopped-typing` | `{ userId }` | Typing indicator deactivated |
| `comment-added` | `{ comment }` | New comment broadcast |
| `permission-denied` | `{ message }` | Access control rejection |
| `pong` | — | Heartbeat response |

---

## 📁 Project Structure

```
syncscribe/
│
├── frontend/                             # Next.js 14 Application
│   │
│   ├── app/
│   │   ├── layout.tsx                    # Root layout — Space Grotesk + Inter fonts
│   │   ├── globals.css                   # Design system — CSS vars, animations
│   │   ├── page.tsx                      # Landing page
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx            # Sign-in page (split layout)
│   │   │   ├── signup/page.tsx           # Sign-up page (split layout)
│   │   │   └── callback/route.ts         # Supabase OAuth callback
│   │   │
│   │   ├── (protected)/                  # Auth-guarded route group
│   │   │   ├── layout.tsx                # Verifies session — redirect if none
│   │   │   ├── dashboard/page.tsx        # Document list view
│   │   │   └── document/[id]/page.tsx    # Document editor view
│   │   │
│   │   └── join/[token]/page.tsx         # Share link redemption
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── Logo.tsx                  # SyncScribe SVG logo
│   │   ├── auth/
│   │   │   └── AuthForm.tsx              # Login / signup form
│   │   ├── layout/
│   │   │   └── Navbar.tsx                # App navigation bar
│   │   ├── documents/
│   │   │   ├── DocumentList.tsx          # Document grid + empty state
│   │   │   ├── DocumentCard.tsx          # Card with context menu
│   │   │   └── CreateButton.tsx          # New document CTA
│   │   ├── editor/
│   │   │   ├── Editor.tsx                # Textarea with real-time sync
│   │   │   └── SavingIndicator.tsx       # Auto-save status badge
│   │   ├── collaboration/
│   │   │   └── PresenceBar.tsx           # Online users avatar row
│   │   └── sharing/
│   │       └── ShareModal.tsx            # Document share dialog
│   │
│   ├── lib/
│   │   ├── api.ts                        # Axios — JWT auto-attached
│   │   ├── socket.ts                     # Socket.io singleton (auto-reconnect)
│   │   ├── store.ts                      # Zustand global state
│   │   ├── hooks/
│   │   │   ├── useDocument.ts            # Fetch document data
│   │   │   └── useCollaboration.ts       # Socket.io room setup + handlers
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   ├── server.ts                 # Server Supabase client (RSC)
│   │   │   └── middleware.ts             # Auth token refresh on navigation
│   │   └── utils/
│   │       └── colors.ts                 # Deterministic user color assignment
│   │
│   ├── types/index.ts                    # Shared TypeScript interfaces
│   ├── middleware.ts                     # Next.js route protection
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── backend/                              # Express + Socket.io Server
    └── src/
        │
        ├── server.ts                     # Entry point — Express + Socket.io init
        │
        ├── routes/
        │   ├── documents.ts              # Document CRUD + collaborator endpoints
        │   ├── sharing.ts                # Share token generate + redeem
        │   └── health.ts                 # Health check + metrics
        │
        ├── socket/
        │   ├── handlers.ts               # All Socket.io event handlers
        │   └── rooms.ts                  # RoomManager — in-memory user tracking
        │
        ├── middleware/
        │   ├── auth.ts                   # JWT verify via Supabase (3 retries)
        │   ├── errorHandler.ts           # Centralised error response formatter
        │   └── rateLimit.ts              # Multi-tier rate limiting
        │
        ├── db/
        │   ├── supabase.ts               # Supabase admin client (service role)
        │   ├── schema.sql                # Full PostgreSQL schema
        │   └── setup.js                  # DB bootstrap helper
        │
        └── utils/
            ├── colors.ts                 # User color assignment
            └── logger.ts                 # Console logger utility
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| Supabase account | Free tier works |

### 1 — Clone the repository

```bash
git clone https://github.com/Nishant232/syncscribe.git
cd syncscribe
```

### 2 — Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste and run the full `backend/src/db/schema.sql`
3. Under **Settings → API**, copy the Project URL, `anon` key, and `service_role` key

### 3 — Configure environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — add your Supabase credentials

cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local — add Supabase public keys + backend URL
```

### 4 — Install dependencies

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 5 — Run development servers

```bash
# Terminal 1 — Backend  (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend  (port 3000)
cd frontend
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — sign up, create a document, share the link, and watch two cursors move.

---

## 🔑 Environment Variables

### `backend/.env`

```env
# ── Supabase ──────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret    # keep private — full DB access
SUPABASE_ANON_KEY=your-anon-public-key

# ── Server ────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── CORS ──────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:3000

# ── Share Links ───────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
```

### `frontend/.env.local`

```env
# ── Supabase (public — safe to expose) ────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# ── Backend ───────────────────────────────────────────────────────────
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

> ⚠️ Never commit `.env` or `.env.local`. Both are git-ignored by default.  
> The `service_role` key bypasses RLS — treat it like a database root password.

---

## ☁️ Deployment

### Frontend → Vercel

```bash
npm i -g vercel
cd frontend && vercel
```

Set these in the **Vercel dashboard → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL          your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     your Supabase anon key
NEXT_PUBLIC_BACKEND_URL           https://your-backend.up.railway.app
NEXT_PUBLIC_SOCKET_URL            https://your-backend.up.railway.app
```

### Backend → Railway

1. Push repo to GitHub
2. [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Set **Root Directory** to `backend`
4. Add env vars (mirror of `backend/.env` with production values)
5. Railway auto-detects Node.js — deploys on push

### Database

No deployment needed. Supabase is fully managed. Ensure `schema.sql` has been run and all RLS policies are active.

---

## 🔒 Security Overview

| Layer | Mechanism |
|-------|-----------|
| **Transport** | HTTPS (Vercel + Railway) · WSS (Socket.io) |
| **Authentication** | Supabase JWT — verified server-side on every REST request and WebSocket handshake |
| **Authorization** | PostgreSQL Row Level Security — `owner / editor / viewer` policies enforced at database layer |
| **Rate Limiting** | 100 req / 15 min (general) · 10 creates / 15 min · 5 socket connections / 1 min |
| **CORS** | Configurable allowlist via `ALLOWED_ORIGINS` environment variable |
| **Share Tokens** | 64-char hex · single-use · optional expiry timestamp |
| **Token Retry** | Auth middleware retries Supabase token verification up to **3 times** with exponential backoff |

---

## 📄 License

[MIT](LICENSE) © 2024 [Nishant232](https://github.com/Nishant232)

---

<div align="center">

Built with ❤️ by [Nishant232](https://github.com/Nishant232)

**SyncScribe** — Write together, in perfect sync.

</div>
