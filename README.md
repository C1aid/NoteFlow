# NoteFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Collaborative notes app with Supabase auth, Stripe billing, and real-time sync (Premium).

Free plan: up to 5 notes. Premium: unlimited notes, sharing, and live co-editing.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Supabase & Stripe](#supabase--stripe)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Deploy](#deploy)
- [FAQ](#faq)
- [Author](#author)
- [License](#license)

---

## Tech Stack

| Category | Stack |
|----------|-------|
| Framework | Next.js 14 (App Router), TypeScript (strict) |
| UI | Tailwind CSS, shadcn/ui |
| Backend | Supabase — Auth, PostgreSQL, RLS, Realtime |
| Editor | TipTap |
| Payments | Stripe Checkout + webhooks |
| State | Zustand, TanStack Query |
| Tests | Vitest, Playwright |
| CI | GitHub Actions → Vercel |

Node.js 18+, npm 9+. Dev server: **http://localhost:3001** (port 3001 avoids conflicts with other local apps).

---

## Features

- Email/password auth (+ optional Google OAuth)
- Notes CRUD with debounced auto-save
- Free tier capped at 5 notes
- Premium: unlimited notes, share links, collaborator invites
- Real-time sync and presence avatars (Premium)
- Stripe subscription via Settings
- Dark/light theme

---

## Quick Start

```bash
git clone https://github.com/C1aid/noteflow.git
cd noteflow
npm install
cp .env.local.example .env.local
```

1. Fill in `.env.local` (Supabase + Stripe keys)
2. Run SQL migrations in Supabase — see [Supabase & Stripe](#supabase--stripe)
3. `npm run dev` → open **http://localhost:3001**

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PREMIUM_PRICE_ID` | Premium monthly price ID |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` in dev |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional |

Do not commit `.env.local`.

---

## Supabase & Stripe

**Supabase**

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** — run in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_backfill_profiles.sql`
   - `supabase/migrations/003_fix_rls_recursion.sql`
3. Optional: disable email confirmation under **Authentication → Providers → Email**
4. Google OAuth redirect: `http://localhost:3001/auth/callback`

**Stripe**

1. Create product **NoteFlow Premium** with a monthly price (test mode)
2. Copy price ID → `STRIPE_PREMIUM_PRICE_ID`
3. Local webhooks:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Test card: `4242 4242 4242 4242`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3001) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright |

---

## Project Structure

```
app/           routes (auth, dashboard, api)
components/    ui, editor, collaboration
lib/           supabase, stripe, validations
store/         zustand
supabase/      SQL migrations
tests/         unit + e2e
```

---

## Deploy

1. Push to GitHub, import in [Vercel](https://vercel.com)
2. Add env vars from `.env.local.example`
3. Set `NEXT_PUBLIC_APP_URL` to production domain
4. Stripe webhook: `https://your-domain.com/api/stripe/webhook`
5. Supabase redirect: `https://your-domain.com/auth/callback`

CI on `main`: lint → type-check → unit tests → build → e2e → Vercel deploy (needs `VERCEL_*` secrets).

---

## FAQ

**Port 3001?**  
Frees port 3000 for other local projects. Set in `package.json`.

**Profile not found on checkout?**  
Run both SQL migrations. The app auto-creates profiles via `/api/profile` once tables exist.

**Email not confirmed?**  
Confirm via Supabase email, confirm user manually in dashboard, or disable confirmation for dev.

**Failed to fetch on sign up?**  
Check Supabase URL and keys in `.env.local`, then restart the dev server.

**Same Stripe keys in multiple projects?**  
Fine in test mode. Use separate webhook secrets per deployed URL.

---

## Author

**Egor Ermilov**

- GitHub: [C1aid](https://github.com/C1aid)
- LinkedIn: [Egor-Ermilov](https://www.linkedin.com/in/egor-ermilov-049402348/)

---

## License

This project is licensed under the [MIT License](./LICENSE).
