# ⭐⭐⭐ RateMyStuff

> Rate anything — products, players, tools & more. A community-driven rating and review platform.

**Live Demo**: [https://pulse-portal-production-6632.up.railway.app](https://pulse-portal-production-6632.up.railway.app)

---

## Features

- 🔐 **Google OAuth** — Secure sign-in via Google (no passwords stored)
- ⭐ **Rating System** — Rate items 1–5 stars with written reviews
- 📊 **Analytics Dashboard** — Platform-wide performance insights with charts
- 🗳️ **Upvoting** — Community-driven upvote system
- 📱 **Responsive** — Fully responsive on desktop, tablet, and mobile
- 🏈 **Multi-Category** — Products, Services, Tools, Projects, Ideas, and Players
- 🚀 **Production Ready** — MongoDB backend, Docker deployment, session persistence

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts |
| **Backend** | Node.js, Express, Passport.js (Google OAuth) |
| **Database** | MongoDB Atlas |
| **Sessions** | connect-mongo (persistent sessions) |
| **Deployment** | Docker, Railway |

---

## Local Development

### Prerequisites

- Node.js >= 18
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

### Setup

```bash
# Clone the repo
git clone https://github.com/MOhdDAniShK/RateMyStuff.git
cd RateMyStuff

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and Google OAuth credentials

# Run frontend dev server (port 5173)
npm run dev

# In a separate terminal, run the backend (port 3000)
npm run dev:server
```

### Google OAuth Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (Web Application)
3. Add **Authorized JavaScript Origins**: `http://localhost:3000`
4. Add **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`
5. Copy the Client ID and Secret to your `.env` file

---

## Deployment (Railway)

### 1. Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin master
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
2. Select your repository
3. Railway will auto-detect the Dockerfile and deploy

### 3. Set Environment Variables on Railway

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (e.g. `pulse_portal`) |
| `SESSION_SECRET` | Strong random string for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `BASE_URL` | Your Railway app URL (e.g. `https://your-app.up.railway.app`) |
| `NODE_ENV` | `production` |

> **Important**: After deploying, update the **Authorized redirect URI** in Google Cloud Console to: `https://YOUR_RAILWAY_URL/auth/google/callback`

### 4. Verify Deployment

- Visit your Railway URL — you should see the login page
- Health check endpoint: `/health`
- API endpoint: `/api/items`

---

## Project Structure

```
├── server.js          # Express backend (API + OAuth + static serving)
├── src/
│   ├── App.tsx        # Main React app with sidebar navigation
│   ├── components/    # UI components (LoginPage, ItemDetail, Analytics, etc.)
│   ├── lib/store.ts   # API client, types, and localStorage fallback
│   ├── index.css      # Global styles (Tailwind + custom)
│   └── main.tsx       # React entry point
├── Dockerfile         # Multi-stage Docker build (build + serve)
├── railway.json       # Railway deployment config
├── vite.config.ts     # Vite dev server with API proxy
└── .env.example       # Environment variable template (no secrets)
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/items` | Get all items (with optional `category`, `search`, `sort` query params) |
| `GET` | `/api/items/:id` | Get single item |
| `POST` | `/api/items` | Submit new item |
| `POST` | `/api/items/:id/upvote` | Toggle upvote |
| `POST` | `/api/items/:id/rate` | Add/update rating |
| `GET` | `/api/feedback` | Get all feedback across items |
| `GET` | `/api/analytics` | Platform analytics |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/logout` | Logout |

---

## License

MIT
