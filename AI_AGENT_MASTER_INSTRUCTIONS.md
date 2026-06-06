# 🤖 ANTIGRAVITY AI AGENT — MASTER INSTRUCTIONS

> **READ THIS FILE FIRST**  
> This is your complete build guide for CodeCollab

---

## 📋 OVERVIEW

**You are building:** CodeCollab — A real-time collaborative document editor  
**Similar to:** Google Docs  
**Tech Stack:** Next.js 14, TypeScript, Socket.io, Supabase, PostgreSQL  
**Timeline:** 6 implementation files (Parts 1-6)  
**Output:** Production-ready SaaS application

---

## 🎯 YOUR MISSION

Build CodeCollab by following **6 implementation parts** in exact order:

1. **PART 1** — Backend setup (database, Supabase client, middleware)
2. **PART 2** — Socket.io handlers and main server
3. **PART 3** — Frontend Supabase auth and components
4. **PART 4** — Dashboard and document management
5. **PART 5** — Real-time editor and collaboration
6. **PART 6** — Sharing, deployment, final polish

---

## ⚡ QUICK START INSTRUCTIONS

### STEP 1: Read All Implementation Files

Before writing any code, read these files in order:
1. `SUPABASE_IMPLEMENTATION_PART1.md`
2. `SUPABASE_IMPLEMENTATION_PART2.md`
3. `SUPABASE_IMPLEMENTATION_PART3.md`
4. `SUPABASE_IMPLEMENTATION_PART4.md`
5. `SUPABASE_IMPLEMENTATION_PART5.md`
6. `SUPABASE_IMPLEMENTATION_PART6.md`

### STEP 2: Create Project Structure

```bash
mkdir -p codecollab
cd codecollab
```

### STEP 3: Execute Parts 1-6 Sequentially

Start with PART 1, Task 1.1 and proceed linearly through all tasks.

---

## 📁 TARGET DIRECTORY STRUCTURE

Create this exact structure:

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
│   ├── .env
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   ├── signup/page.tsx
    │   │   └── callback/route.ts
    │   └── (protected)/
    │       ├── layout.tsx
    │       ├── dashboard/page.tsx
    │       └── document/[id]/page.tsx
    ├── components/
    │   ├── ui/ (shadcn)
    │   ├── auth/
    │   │   └── AuthForm.tsx
    │   ├── editor/
    │   │   ├── Editor.tsx
    │   │   └── SavingIndicator.tsx
    │   ├── collaboration/
    │   │   └── PresenceBar.tsx
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
    │   │   └── useCollaboration.ts
    │   └── utils/
    │       └── colors.ts
    ├── types/
    │   └── index.ts
    ├── middleware.ts
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.local
    ├── .env.local.example
    └── .gitignore
```

---

## 🔧 CRITICAL RULES

### Rule 1: Follow Exact Order
**DO NOT skip tasks.** Each task builds on previous ones.

### Rule 2: Create Files Exactly as Specified
Copy code snippets **exactly** as written. Do not modify unless explicitly told.

### Rule 3: Use Environment Variables
**NEVER hardcode:**
- API keys
- URLs
- Secrets

**ALWAYS use:**
- `process.env.VARIABLE_NAME`
- `.env` files (backend)
- `.env.local` files (frontend)

### Rule 4: Test After Each Major Section
After completing each DAY (not just each PART), test that everything works:

**After Day 1 (Parts 1-2):**
```bash
cd backend
npm install
npm run dev
# Should see: "🚀 Server running on port 5000"
curl http://localhost:5000/health
# Should return: {"status":"ok",...}
```

**After Day 2 (Parts 3-4):**
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
# Should see landing page
# Sign up should work
```

**After Day 3 (Part 5):**
- Open document in 2 browsers
- Type in one → should appear in other
- Verify real-time sync works

### Rule 5: Install Dependencies When Told
When you see "install dependencies" in the implementation:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ WRONG: Skipping database setup
```
"I'll set up the database later"
```
**✅ CORRECT:** Run schema.sql in Supabase BEFORE testing backend

### ❌ WRONG: Using wrong environment file
```typescript
// In frontend code
const url = process.env.SUPABASE_URL  // ❌ Missing NEXT_PUBLIC_
```
**✅ CORRECT:**
```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL  // ✅
```

### ❌ WRONG: Hardcoding URLs
```typescript
const api = axios.create({
  baseURL: 'http://localhost:5000'  // ❌
})
```
**✅ CORRECT:**
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL  // ✅
})
```

### ❌ WRONG: Creating files in wrong location
```
codecollab/supabase.ts  // ❌ Wrong location
```
**✅ CORRECT:**
```
codecollab/backend/src/db/supabase.ts  // ✅
```

---

## 📝 IMPLEMENTATION WORKFLOW

### For Each Task in Implementation Files:

1. **Read task title and description**
2. **Note the file path** (e.g., `backend/src/db/supabase.ts`)
3. **Create file in exact location**
4. **Copy code exactly as shown**
5. **Save file**
6. **Move to next task**

### Example Workflow:

**TASK 1.5 says:**
```
File: backend/src/db/supabase.ts

[code here]
```

**You do:**
1. Navigate to `codecollab/backend/src/db/`
2. Create file `supabase.ts`
3. Copy all code from implementation
4. Save file
5. Continue to Task 1.6

---

## 🔑 ENVIRONMENT SETUP GUIDE

### Backend Environment Variables

You MUST create `backend/.env` with:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**Where to get these:**
1. Go to https://app.supabase.com
2. Create project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Frontend Environment Variables

You MUST create `frontend/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**Note:** Frontend variables MUST start with `NEXT_PUBLIC_`

---

## 🗄️ DATABASE SETUP

**CRITICAL:** You must manually run the SQL schema in Supabase.

### Steps:

1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Open `backend/src/db/schema.sql`
6. Copy **entire contents**
7. Paste into Supabase SQL Editor
8. Click "Run"
9. Verify 5 tables created:
   - documents
   - document_permissions
   - document_shares
   - comments
   - audit_log

**Expected Output:**
```
Success. No rows returned
```

---

## 🧪 TESTING PROTOCOL

### After Backend Setup (Day 1):

```bash
cd backend
npm run dev
```

**Test commands:**
```bash
# Should return {"status":"ok"}
curl http://localhost:5000/health

# Should return metrics
curl http://localhost:5000/api/metrics
```

### After Frontend Setup (Day 2):

```bash
cd frontend
npm run dev
```

**Browser tests:**
1. Visit http://localhost:3000 → Should see landing page
2. Click "Get Started" → Should see signup form
3. Sign up with email → Should get confirmation email
4. Confirm email → Should redirect to dashboard
5. Click "New Document" → Should create document

### After Real-Time (Day 3):

1. Create document in Browser 1
2. Open same document in Browser 2 (use Chrome Incognito)
3. Sign in as different user in Browser 2
4. Type in Browser 1 → Should appear in Browser 2 within 300ms
5. Check presence bar → Should show 2 users

### Final Testing (Day 6):

- [ ] Deployed to Railway (backend)
- [ ] Deployed to Vercel (frontend)
- [ ] Production URLs work
- [ ] Real-time works in production
- [ ] Share links work
- [ ] Mobile responsive
- [ ] No console errors

---

## 📦 DEPENDENCY INSTALLATION

### Backend Dependencies

**When:** After creating `backend/package.json`

```bash
cd backend
npm install
```

**Expected packages:**
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

### Frontend Dependencies

**When:** After creating `frontend/package.json`

```bash
cd frontend
npm install
```

**Expected packages:**
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
- tailwindcss

### shadcn/ui Components

**When:** After frontend dependencies installed

```bash
cd frontend
npx shadcn-ui@latest init
# Answer: Yes, Default, Slate, Yes

npx shadcn-ui@latest add button input label card dialog dropdown-menu avatar skeleton toast select
```

---

## 🎯 SUCCESS CHECKPOINTS

### ✅ Checkpoint 1: Backend Running
- Backend starts on port 5000
- Health endpoint returns OK
- Database tables created
- No errors in console

### ✅ Checkpoint 2: Auth Working
- Can sign up
- Receive confirmation email
- Can sign in
- Redirects to dashboard

### ✅ Checkpoint 3: CRUD Working
- Can create document
- Document appears in list
- Can open document
- Can delete document

### ✅ Checkpoint 4: Real-Time Working
- Socket connects
- 2 users can edit simultaneously
- Changes appear < 300ms
- Presence bar shows users
- Content persists in database

### ✅ Checkpoint 5: Sharing Working
- Can generate share link
- Link joins document
- Permissions enforced
- Can remove collaborators

### ✅ Checkpoint 6: Deployed
- Production URLs work
- All features work in production
- Demo video recorded
- README updated

---

## 🚀 DEPLOYMENT STEPS

### Deploy Backend to Railway

1. Go to https://railway.app
2. Create account
3. "New Project" → "Deploy from GitHub"
4. Select repository
5. Root directory: `backend`
6. Add environment variables (production values)
7. Deploy
8. Copy Railway URL

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import Git repository
3. Framework: Next.js
4. Root directory: `frontend`
5. Add environment variables (production values)
6. Deploy
7. Copy Vercel URL

### Update CORS

Go back to Railway:
1. Update `ALLOWED_ORIGINS` with Vercel URL
2. Update `FRONTEND_URL` with Vercel URL
3. Redeploy

---

## 📊 PROGRESS TRACKING

Track your progress through the implementation:

**Day 1: Backend Foundation**
- [ ] Part 1: Database setup (Tasks 1.1-1.10)
- [ ] Part 2: Socket.io setup (Tasks 1.11-1.21)

**Day 2: Frontend Foundation**
- [ ] Part 3: Auth setup (Tasks 2.1-2.17)
- [ ] Part 4: Dashboard (Tasks 2.18-2.28)

**Day 3: Real-Time**
- [ ] Part 5: Editor & Collaboration (Tasks 3.1-3.9)

**Day 4: Sharing**
- [ ] Part 6 (Section 1): Share features (Tasks 4.1-4.4)

**Day 5-6: Deploy**
- [ ] Part 6 (Section 2): Production deploy (Tasks 5.1-5.11)

---

## 🆘 TROUBLESHOOTING

### Issue: "Cannot connect to database"
**Solution:**
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check database schema was created
4. Test connection in Supabase dashboard

### Issue: "Auth not working"
**Solution:**
1. Check Supabase email settings
2. Verify `SUPABASE_ANON_KEY` in frontend
3. Check browser console for errors
4. Verify middleware.ts is created

### Issue: "Socket not connecting"
**Solution:**
1. Check backend is running on port 5000
2. Verify `NEXT_PUBLIC_SOCKET_URL` is correct
3. Check browser console for WebSocket errors
4. Verify CORS settings allow frontend URL

### Issue: "Real-time not working"
**Solution:**
1. Check Socket.io connected (browser console)
2. Verify user joined document room (backend logs)
3. Check permissions in database
4. Test with 2 different browsers

---

## 📞 FINAL CHECKLIST BEFORE MARKING COMPLETE

- [ ] All 6 implementation parts executed
- [ ] Backend running locally
- [ ] Frontend running locally
- [ ] Auth works (sign up, sign in)
- [ ] CRUD works (create, read, update, delete documents)
- [ ] Real-time works (2+ users editing)
- [ ] Sharing works (generate link, join document)
- [ ] Permissions enforced (viewer vs editor)
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Production URLs work
- [ ] README.md created
- [ ] Demo video recorded
- [ ] Git repository clean (no .env files committed)

---

## 🎉 COMPLETION

When you finish all 6 parts and pass the final checklist:

**YOU HAVE BUILT:**
- ✅ Full-stack SaaS application
- ✅ Real-time collaboration system
- ✅ Production-ready deployment
- ✅ Professional documentation

**DELIVERABLES:**
- Live demo URL
- GitHub repository
- Demo video
- Professional README

**This is a job-landing portfolio project!** 🚀

---

## 📚 FILE REFERENCE

**Implementation Files (Read in Order):**
1. SUPABASE_IMPLEMENTATION_PART1.md
2. SUPABASE_IMPLEMENTATION_PART2.md
3. SUPABASE_IMPLEMENTATION_PART3.md
4. SUPABASE_IMPLEMENTATION_PART4.md
5. SUPABASE_IMPLEMENTATION_PART5.md
6. SUPABASE_IMPLEMENTATION_PART6.md

**This File:** Master instruction guide (read first)

---

**NOW START WITH PART 1 AND BUILD YOUR PROJECT!** 💪
