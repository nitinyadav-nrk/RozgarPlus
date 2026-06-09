# JobNest React Vite npm Copy

This is a standalone npm copy of the JobNest React/Vite frontend from `artifacts/jobnest`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API setup

By default, API calls still use the original relative `/api/...` paths. To point the frontend at a separate API host, copy `.env.example` to `.env` and set:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

The Supabase placeholders are included for the next step, but Supabase is not wired in yet so the app behavior stays unchanged.
