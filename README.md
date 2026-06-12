# Bliss Lifestyle — Registration Backend & Dashboard

Secure Node.js backend with MongoDB storage and an admin dashboard for Bliss Lifestyle registration form submissions.

## Features

- **Registration API** — `POST /api/blisLifeData` (same endpoint your live `form.js` uses)
- **Admin dashboard** — view all registrations with Bliss Lifestyle branding
- **JWT authentication** — secure login with httpOnly cookies
- **Notifications** — bell icon with unread badge for new registrations
- **PDF export** — download individual or all registrations as PDF
- **Refresh** — manual refresh + auto-poll every 30 seconds
- **Security** — Helmet, rate limiting, input validation, bcrypt passwords, CORS

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
copy .env.example .env
```

Edit `.env` and set:

- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — at least 32 random characters
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — dashboard login credentials
- `ALLOWED_ORIGINS` — your live site URL(s), comma-separated

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Seed admin user

```bash
npm run seed-admin
```

### 4. Start the server

```bash
npm start
```

- **Dashboard:** http://localhost:8000/dashboard
- **Login:** http://localhost:8000/login
- **API health:** http://localhost:8000/api/health

## Deploy Backend on Render

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Bliss Lifestyle backend"
git remote add origin https://github.com/YOUR-USER/bliss-backend.git
git push -u origin main
```

### 2. Create Render Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Add environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | 64+ char random string |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | Strong password |
| `ALLOWED_ORIGINS` | `https://blisslifestyle.com,https://www.blisslifestyle.com` |
| `DASHBOARD_URL` | `https://YOUR-APP.onrender.com` |

5. Deploy. Note your URL: `https://YOUR-APP.onrender.com`

### 3. Seed admin (one time)

In Render → your service → **Shell**:

```bash
npm run seed-admin
```

### 4. MongoDB Atlas

In Atlas → **Network Access** → add `0.0.0.0/0` (allows Render to connect).

### 5. Access dashboard

- Login: `https://YOUR-APP.onrender.com/login`
- Dashboard: `https://YOUR-APP.onrender.com/dashboard`

---

## Deploy Frontend on IONOS

Upload these files from the `ionos/` folder to your IONOS web hosting:

- `config.js` — set your Render URL here
- `form.js` — simple registration form
- `regForm.js` — full registration form

### HTML script order (important)

Load `config.js` **before** the form script:

```html
<script src="/js/config.js"></script>
<script src="/js/regForm.js"></script>
```

### Edit `ionos/config.js`

```javascript
window.BLISS_API_BASE = "https://YOUR-APP.onrender.com";
```

Replace `YOUR-APP` with your actual Render service name. Use your real IONOS domain in Render's `ALLOWED_ORIGINS`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/storeBLSRegFormData` | No | Submit full registration form |
| POST | `/api/blisLifeData` | No | Submit simple registration (legacy) |
| POST | `/api/auth/login` | No | Admin login |
| POST | `/api/auth/logout` | No | Admin logout |
| GET | `/api/auth/me` | Yes | Check session |
| GET | `/api/registrations` | Yes | List all registrations |
| GET | `/api/notifications/count` | Yes | Unread count |
| PATCH | `/api/registrations/:id/read` | Yes | Mark as read |
| PATCH | `/api/registrations/mark-all-read` | Yes | Mark all as read |
| GET | `/api/registrations/:id/pdf` | Yes | Download single PDF |
| GET | `/api/registrations/export/pdf` | Yes | Export all as PDF |

## Production Checklist

- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET` (64+ chars)
- Use MongoDB Atlas or a secured MongoDB instance
- Set `ALLOWED_ORIGINS` to only your live domain(s)
- Run behind HTTPS (nginx, Cloudflare, etc.)
- Change default admin password after first login
