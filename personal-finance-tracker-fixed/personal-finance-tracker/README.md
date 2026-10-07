# Personal Finance Tracker

Full-stack app with React, TypeScript, Vite, Tailwind, Express, and SQLite.

## Run locally

```bash
# terminal 1
cd backend && cp .env.example .env && npm install && npm run dev

# terminal 2
cd frontend && cp .env.example .env && npm install && npm run dev
```

Frontend: http://localhost:5173 - Backend: http://localhost:3000/api/health

## Deploy

The frontend is static files. The backend is a Node server with a SQLite file, so host them separately.

1. **Backend** (Render, Railway, Fly.io): root directory `backend`, build `npm install`, start `npm start`.
   Set `CORS_ORIGIN` to your frontend URL. SQLite writes to disk, so attach a persistent disk and set
   `DATABASE_PATH` to a path on it. Without a disk, data is lost on every redeploy.
2. **Frontend** (Vercel, Netlify, Cloudflare Pages): root directory `frontend`, build `npm run build`, output `dist`.
   Set `VITE_API_BASE_URL=https://<your-backend>/api` before building. Vite reads it at build time.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | health check |
| GET | `/api/categories` | list categories |
| POST | `/api/categories` | `{ name, type }` |
| GET | `/api/transactions` | optional `startDate`, `endDate`, `categoryId` |
| POST | `/api/transactions` | `{ amount, categoryId, date, description }` |
| DELETE | `/api/transactions/:id` | |
