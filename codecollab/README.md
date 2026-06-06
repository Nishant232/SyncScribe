# 🚀 CodeCollab

Real-time collaborative document editor built with Next.js, Supabase, and Socket.io.

## ✨ Features

- 🔐 **Secure Authentication** - Powered by Supabase Auth
- ⚡ **Real-Time Collaboration** - Multiple users can edit simultaneously
- 👥 **Live Presence** - See who's online and editing
- 💾 **Auto-Save** - Changes saved automatically every 2 seconds
- 🔗 **Share Links** - Generate shareable links with viewer/editor permissions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **Zustand** - State management
- **@supabase/ssr** - Authentication

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
- Supabase account (https://app.supabase.com)

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
- Run the SQL to create all tables

5. **Open http://localhost:3000**

## 🗄️ Database Schema

```
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

## 🚀 Deployment

### Backend → Railway
1. Go to https://railway.app
2. Create new project from GitHub repo
3. Set root directory to `backend`
4. Add all environment variables
5. Deploy

### Frontend → Vercel
1. Go to https://vercel.com
2. Import GitHub repo
3. Set root directory to `frontend`
4. Add environment variables (use Railway URL for backend)
5. Deploy

## 📄 License

MIT License

---

Made with ❤️ using Next.js, Supabase & Socket.io
