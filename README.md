# Bliss Lifestyle — Registration Backend & Dashboard

Secure Node.js backend with MongoDB storage and an admin dashboard for Bliss Lifestyle registration form submissions.

## Features

- **Registration API** — `POST /api/storeBLSRegFormData` (full registration form)
- **Contact API** — `POST /api/blisLifeData` (contact us form)
- **Admin dashboard** — view registrations and contact requests with Bliss Lifestyle branding
- **JWT authentication** — secure login with httpOnly cookies
- **Notifications** — bell icon with unread badge for new submissions
- **PDF export** — download individual or all records as PDF
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
git add .
git commit -m "Bliss Lifestyle backend"
git push origin main
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
| `DASHBOARD_URL` | `https://blisslifestyle.onrender.com` |

5. Deploy. Note your URL: `https://blisslifestyle.onrender.com`

### 3. Seed admin (one time)

In Render → your service → **Shell**:

```bash
npm run seed-admin
```

### 4. MongoDB Atlas

In Atlas → **Network Access** → add `0.0.0.0/0` (allows Render to connect).

### 5. Access dashboard

- Login: `https://blisslifestyle.onrender.com/login`
- Dashboard: `https://blisslifestyle.onrender.com/dashboard`

---

## Deploy Frontend on IONOS

Upload these files from the `ionos/` folder to your IONOS web hosting:

- `config.js` — set your Render URL here
- `form.js` — contact us form
- `regForm.js` — full registration form

### HTML script order (important)

Load `config.js` **before** the form script:

```html
<script src="/js/config.js"></script>
<script src="/js/regForm.js"></script>
```

### Edit `ionos/config.js`

```javascript
window.BLISS_API_BASE = "https://blisslifestyle.onrender.com";
```

Use your real IONOS domain in Render's `ALLOWED_ORIGINS`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/storeBLSRegFormData` | No | Submit full registration form |
| POST | `/api/blisLifeData` | No | Submit contact us form |
| POST | `/api/auth/login` | No | Admin login |
| POST | `/api/auth/logout` | No | Admin logout |
| GET | `/api/auth/me` | Yes | Check session |
| GET | `/api/registrations` | Yes | List all registrations |
| GET | `/api/notifications/count` | Yes | Unread count |
| PATCH | `/api/registrations/:id/read` | Yes | Mark as read |
| PATCH | `/api/registrations/mark-all-read` | Yes | Mark all as read |
| GET | `/api/registrations/:id/pdf` | Yes | Download single PDF |
| GET | `/api/registrations/export/pdf` | Yes | Export all registrations as PDF |
| GET | `/api/contacts` | Yes | List all contact requests |
| PATCH | `/api/contacts/:id/read` | Yes | Mark contact as read |
| PATCH | `/api/contacts/mark-all-read` | Yes | Mark all contacts as read |
| GET | `/api/contacts/:id/pdf` | Yes | Download single contact PDF |
| GET | `/api/contacts/export/pdf` | Yes | Export all contacts as PDF |

## Production Checklist

- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET` (64+ chars)
- Use MongoDB Atlas or a secured MongoDB instance
- Set `ALLOWED_ORIGINS` to only your live domain(s)
- Run behind HTTPS (nginx, Cloudflare, etc.)
- Change default admin password after first login
