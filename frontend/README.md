# Cedarbrook Library — Frontend

React (Vite) + Tailwind CSS frontend for the school library management
system, consuming the backend REST API.

## Design system

- **Palette**: deep navy (`#1B2A4A`) for structure, brass/gold (`#B8860B`)
  as the single accent, warm parchment (`#F8F6F0`) instead of stark white.
- **Type**: Lora (serif) for headings — evokes book typography — paired
  with Inter for UI text and IBM Plex Mono for data (ISBNs, dates, fines).
- **Signature element**: the `.index-card` component (see `src/index.css`)
  — dashboard stat cards carry a small tab notch on the top edge, echoing
  a library card-catalog drawer.

## What's included in this pass

- Vite + React + Tailwind project scaffolding
- Axios API client with JWT interceptor and auto-logout on 401
- `AuthContext` / `useAuth` — login, logout, session restore, profile update
- `ProtectedRoute` — auth + role-gated routing
- `DashboardLayout` — responsive Sidebar (role-aware nav) + Navbar
  (notifications dropdown, user menu)
- Pages: Login, role-aware Dashboard (staff stats + Chart.js monthly
  borrow chart; student's own borrowed books/fines/reservations), Profile,
  404

## Not yet built (next passes)

Books, Categories, Students, Librarians, Borrowing, Reservations, Fines,
Reports, and Settings pages — the sidebar already links to these routes;
they need corresponding page components and routes added in `App.jsx`.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev             # http://localhost:5173
```

Login with the seed accounts created by the backend's `npm run seed`
(admin@library.edu / Admin@123, etc — see backend README).

## Deployment (Vercel)

1. Push `frontend/` to GitHub.
2. In Vercel: New Project → import repo → root directory `frontend`.
3. Framework preset: Vite. Build command: `npm run build`. Output dir: `dist`.
4. Add environment variable `VITE_API_URL` pointing to your deployed
   Render backend URL (e.g. `https://your-app.onrender.com/api`).
