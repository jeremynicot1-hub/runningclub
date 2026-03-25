# AthletiX – Athletics Club SaaS

A full-stack SaaS application for athletics clubs, with separate Coach and Athlete dashboards, real-time chat, session planning, and performance tracking.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (via Docker or local install)

### 1. Start the Database

```bash
docker-compose up -d
```

If Docker is not available, create a PostgreSQL database manually:
```sql
CREATE DATABASE athletics;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE athletics TO admin;
```

### 2. Start the Backend

```bash
cd backend
npm run dev
```

On the first run, also push the Prisma schema:
```bash
cd backend
npx prisma db push
```

The backend runs on **http://localhost:5000**

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on **http://localhost:3000**

---

## Project Structure

```
run/
├── docker-compose.yml         # PostgreSQL via Docker
├── frontend/                  # Next.js 15 App (TailwindCSS)
│   └── src/
│       ├── app/               # All pages (App Router)
│       │   ├── login/
│       │   ├── register/
│       │   └── dashboard/
│       │       ├── coach/     # Coach pages
│       │       └── athlete/   # Athlete pages
│       ├── components/        # Shared components (Sidebar)
│       ├── context/           # AuthContext
│       └── lib/               # API utilities
└── backend/                   # Express + TypeScript
    ├── prisma/
    │   └── schema.prisma       # Full database schema
    └── src/
        ├── index.ts            # Server entry + Socket.io
        ├── middleware/
        │   └── auth.ts         # JWT authentication middleware
        └── routes/
            ├── auth.ts         # POST /api/auth/register|login
            ├── clubs.ts        # GET|POST /api/clubs
            ├── teams.ts        # GET|POST /api/teams
            ├── sessions.ts     # GET|POST /api/sessions
            ├── users.ts        # GET|PUT /api/users/me
            └── chat.ts         # GET|POST /api/messages/club/:id
```

---

## Features

| Feature | Coach | Athlete |
|---|---|---|
| Dashboard overview | ✅ Club stats, sessions | ✅ Today's sessions |
| Club management | ✅ Create club, manage members | — |
| Team management | ✅ Create teams, add/remove members | — |
| Session planning | ✅ Interactive calendar + creation modal | ✅ View sessions |
| Session logging | — | ✅ Log distance, time, RPE, comment |
| Performance tracking | — | ✅ History table + stats |
| Real-time chat | ✅ Club-wide chat (Socket.io) | ✅ Club-wide chat |
| Profile | ✅ View/edit sports profile | ✅ View/edit sports profile |

## Future Integration Points
- **Garmin/Strava**: `POST /api/sessions/:id/result` already accepts `actualDistance` and `time` — extend with `externalSource` field
- **Stripe**: Add subscription tier to `Club` model
- **Push notifications**: Add subscription endpoint for Web Push API
