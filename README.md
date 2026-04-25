# RateMyStuff

> Rate anything — products, players, tools & more. A community-driven rating platform.

## Features

- 🔐 **Google OAuth** — Secure sign-in via Google
- ⭐ **Rating System** — Rate items 1-5 stars with written reviews
- 📊 **Analytics Dashboard** — Platform-wide performance insights
- 🗳️ **Upvoting** — Community-driven upvote system
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🚀 **Production Ready** — MongoDB backend with session persistence

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express, Passport.js (Google OAuth)
- **Database**: MongoDB (Atlas)
- **Deployment**: Docker, Railway

---

## Local Development

### Prerequisites

- Node.js >= 18
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/RateMyStuff.git
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
3. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/auth/google/callback`
   - Production: `https://YOUR_DOMAIN/auth/google/callback`
4. Copy the Client ID and Secret to your `.env` file

---

## Deployment (Railway)

### 1. Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
2. Select your repository
3. Railway will auto-detect the Dockerfile and deploy

### 3. Set Environment Variables on Railway

In your Railway project settings, add these variables:

| Variable | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `DB_NAME` | `pulse_portal` |
| `SESSION_SECRET` | A strong random string (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `BASE_URL` | Your Railway app URL (e.g. `https://your-app.up.railway.app`) |
| `NODE_ENV` | `production` |

> **Important**: After deploying and getting your Railway URL, update the **Authorized redirect URI** in Google Cloud Console to: `https://YOUR_RAILWAY_URL/auth/google/callback`

### 4. Verify Deployment

- Visit your Railway URL
- You should see the login page with Google sign-in
- The health check endpoint is `/api/items`

---

## Project Structure

```
├── server.js          # Express backend (API + OAuth + static serving)
├── src/
│   ├── App.tsx        # Main React app
│   ├── components/    # UI components
│   ├── lib/store.ts   # API client & data layer
│   ├── index.css      # Styles
│   └── main.tsx       # React entry point
├── Dockerfile         # Multi-stage Docker build
├── railway.json       # Railway deployment config
├── vite.config.ts     # Vite dev server config
└── .env.example       # Environment variable template
```

## License

MIT
