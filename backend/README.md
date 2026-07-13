# School Library Management System — Backend

A complete Node.js/Express/MongoDB REST API implementing authentication,
book management, borrowing/returning, reservations, fines, reports,
notifications, dashboard analytics, and audit logging.

## Design Notes

- **Single `User` collection** with a `role` field (`admin` | `librarian` |
  `student`) instead of three separate collections. This keeps auth and
  RBAC simple. Role-specific fields (studentId, department, employeeId)
  live on the same document and are simply unused for other roles.
- **Single `BorrowRecord` collection** covers both the "borrow" and
  "return" lifecycle via a `status` field (`borrowed` / `returned` /
  `overdue`), rather than separate Borrow/Return collections — this avoids
  duplicating the same loan data across two collections.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MongoDB Atlas URI, JWT secret, Cloudinary and email creds
npm run seed     # optional: populates sample data
npm run dev       # starts on http://localhost:5000 with nodemon
```

### Seed accounts (after `npm run seed`)

| Role      | Email                  | Password       |
|-----------|-------------------------|----------------|
| Admin     | admin@library.edu       | Admin@123      |
| Librarian | librarian@library.edu   | Librarian@123  |
| Student   | student@library.edu     | Student@123    |

## API Overview

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/me` |
| Books | `GET/POST /books`, `GET/PUT/DELETE /books/:id` (multipart for cover image) |
| Categories | `GET/POST /categories`, `PUT/DELETE /categories/:id` |
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id`, `PATCH /users/:id/status` |
| Borrowing | `GET/POST /borrow`, `POST /borrow/:id/return`, `POST /borrow/mark-overdue` |
| Reservations | `GET/POST /reservations`, `PATCH /reservations/:id/cancel` |
| Fines | `GET /fines`, `PATCH /fines/:id/pay`, `PATCH /fines/:id/waive` |
| Dashboard | `GET /dashboard` |
| Reports | `GET /reports/:type?format=pdf|excel` (types: books, borrowed, returned, students, librarians, overdue, fines) |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Settings | `GET/PUT /settings`, `GET /settings/audit-logs` |

Books/borrow/user list endpoints support query params: `?search=`, `?sort=field,-field2`,
`?page=1&limit=20`, `?fields=title,author`, and Mongo-style filters like `?yearPublished[gte]=2020`.

## Security

Helmet, CORS restricted to `CLIENT_URL`, rate limiting (general + stricter
on `/auth/login`), `express-mongo-sanitize`, `xss-clean`, bcrypt password
hashing, JWT auth, and role-based route guards are all wired in `server.js`
and `middleware/`.

## Deployment (Render)

1. Push this `backend/` folder to a GitHub repo.
2. In Render: New → Web Service → connect the repo, root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all `.env` variables in Render's Environment settings, with
   `CLIENT_URL` set to your deployed Vercel frontend URL.
