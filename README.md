# JobNest React Vite npm

Full-stack JobNest app with a React/Vite frontend and an Express/PostgreSQL backend.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set:

```bash
VITE_API_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=change-this-secret
```

## Supabase Database

Run `supabase-jobnest-complete.sql` in the Supabase SQL Editor.

That SQL is matched to the backend schema in `server/src/db/schema`.
It uses integer app users with bcrypt password hashes, not Supabase Auth UUID users.

Default seeded logins:

```text
Admin: admin@jobnest.com / admin123
User: rahul@example.com / user123
```

## Run

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev
```

## Build And Check

```bash
npm run typecheck
npm run build
```
