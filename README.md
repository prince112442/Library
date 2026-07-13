# Cedarbrook Library Management System

A MERN-stack automated school library management system.

## Repository layout

This is a **monorepo** — one Git repo containing both apps as sibling
folders. They deploy independently, each to its own platform, using that
platform's "root directory" setting:

```
cedarbrook-library/
├── backend/     Node.js + Express + MongoDB API → deploy to Render
└── frontend/    React (Vite) + Tailwind → deploy to Vercel
```

## Why not merge them into one app?

Render and Vercel are separate hosting platforms with different build
pipelines (Node server vs. static site), so the API and the UI need
separate deployments regardless of repo layout. Keeping one repo with two
folders (rather than two repos) just makes it easier to keep them in sync
and review changes together — each platform is told which subfolder to
build from.

## Deploying from this one repo

**1. Push this whole folder to GitHub as one repository.**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

**2. Backend → Render**
- New → Web Service → connect the repo
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add the environment variables from `backend/.env.example`, with
  `CLIENT_URL` set to your Vercel frontend URL once you have it.

**3. Frontend → Vercel**
- New Project → import the same repo
- Root Directory: `frontend`
- Framework Preset: Vite (build `npm run build`, output `dist`)
- Add environment variable `VITE_API_URL` set to your Render backend URL
  + `/api` (e.g. `https://cedarbrook-api.onrender.com/api`)

Each platform only looks at its assigned subfolder, so the two deploys
don't interfere with each other even though they live in the same repo.

## Local development

Run both simultaneously in two terminals:

```bash
# Terminal 1
cd backend && npm install && npm run dev      # http://localhost:5000

# Terminal 2
cd frontend && npm install && npm run dev     # http://localhost:5173
```

See `backend/README.md` and `frontend/README.md` for full details.
# Library
