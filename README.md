# DevTalk

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Team chat for developers — workspaces, channels, DMs, threads, and real-time messaging with Supabase auth and Stripe billing.

Free plan: up to 10 channels, 90-day message history. Pro: unlimited channels and full history.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Supabase & Stripe](#supabase--stripe)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Deploy](#deploy)
- [FAQ](#faq)
- [Author](#author)
- [License](#license)

---

## Tech Stack

| Category | Stack |
|----------|-------|
| Framework | Next.js 14 (App Router), TypeScript (strict) |
| UI | Tailwind CSS, shadcn/ui, liquid-glass design system |
| Backend | Supabase — Auth, PostgreSQL, RLS, Realtime |
| Messaging | Markdown, threads, reactions, @mentions, GitHub previews |
| Payments | Stripe Checkout + webhooks |
| State | Zustand, TanStack Query |
| Tests | Vitest, Playwright |
| CI | GitHub Actions |

Node.js 18+, npm 9+. Dev server: **http://localhost:3001**.

---

## Features

### Auth & billing
- Email/password auth (+ optional Google OAuth)
- Free and Pro tiers via Stripe
- Profile: display name, avatar upload, settings

### Workspaces & navigation
- **Workspaces** — top-level groups with switcher, create, leave/delete
- **Icon rail** — Home, DMs, Activity, Files, More
- **Home sidebar** — workspace switcher, search, channel sections, channels
- **DM sidebar** — direct message list

### Chat
- Public and private channels scoped to a workspace
- Channel sections (group channels into folders)
- Real-time messages with Supabase Realtime
- **Threads** — reply in thread, summary bar with reply count, deep links (`?thread=`)
- Emoji reactions
- Rich message input — formatting toolbar, emoji picker, @mentions
- Markdown + code blocks + GitHub link previews
- Date dividers, message timestamps, edited labels
- User profile panel — message, contact info
- Delete channels/sections, leave channels and DMs

### Placeholders (UI ready)
- Activity, Files, Pins, global search — coming soon pages

---

## Quick Start

```bash
git clone https://github.com/C1aid/devtalk-app.git
cd devtalk-app
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
| `STRIPE_PRO_PRICE_ID` | Pro monthly price ID |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` in dev |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional |

Do not commit `.env.local`.

---

## Supabase & Stripe

### Supabase migrations

Run in **SQL Editor** in order:

| # | File | Purpose |
|---|------|---------|
| 001 | `001_initial_schema.sql` | Profiles, base schema |
| 002 | `002_backfill_profiles.sql` | Profile backfill |
| 003 | `003_fix_rls_recursion.sql` | RLS fixes |
| 004 | `004_add_pro_tier.sql` | Add `pro` enum — **run alone** |
| 005 | `005_devtalk_chat.sql` | Channels, messages, reactions |
| 006 | `006_drop_legacy.sql` | Drop legacy notes tables |
| 007 | `007_profile_display.sql` | Display name |
| 008 | `008_avatars_storage.sql` | Avatar storage bucket |
| 009 | `009_channel_sections_dms.sql` | Sections + DMs |
| 010 | `010_channel_delete_policy.sql` | Delete channels/DMs |
| 011 | `011_channel_members_leave.sql` | Leave channels/DMs |
| 012 | `012_workspaces.sql` | Workspaces + backfill |
| 013 | `013_fix_workspace_rls.sql` | Fix workspace create RLS |

**If 012 is already applied**, run only **013** — do not re-run 012.

Optional: disable email confirmation under **Authentication → Providers → Email**.

Google OAuth redirect: `http://localhost:3001/auth/callback`

### Stripe

1. Create product **DevTalk Pro** with a monthly price (test mode)
2. Copy price ID → `STRIPE_PRO_PRICE_ID`
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
app/
  (auth)/          login, signup, reset password
  (dashboard)/
    w/[slug]/      workspace home + channels
    channels/      legacy redirects + DM chat
    dms/           DM list
    threads/       all threads
    settings/      account, plan
    activity/      placeholder
    files/         placeholder
    search/        placeholder
  api/             REST endpoints
components/
  chat/            channel chat, messages, input, profile panel
  workspace/       switcher, create dialog
  dashboard/       icon rail, sidebar, page header
lib/
  chat/            queries, format, mentions
  workspace/       paths, server helpers
  supabase/        client, middleware
store/             zustand
supabase/          SQL migrations
tests/             unit + e2e
```

---

## Architecture

```
Workspace (/w/[slug])
├── Icon rail: Home | DMs | Activity | Files | More
├── Home sidebar: workspace switcher → sections → channels
├── DM sidebar: conversation list
├── Channels: /w/[slug]/channels/[id]
├── DMs: /channels/[id]/chat
└── Threads: side panel + /threads overview
```

Legacy `/channels/[id]` redirects to the workspace channel or DM route.

---

## Deploy

1. Push to GitHub, import in [Vercel](https://vercel.com)
2. Add env vars from `.env.local.example`
3. Set `NEXT_PUBLIC_APP_URL` to production domain
4. Stripe webhook: `https://your-domain.com/api/stripe/webhook`
5. Supabase redirect: `https://your-domain.com/auth/callback`

CI on `main`: lint → type-check → unit tests → build → e2e.

---

## FAQ

**Port 3001?**  
Frees port 3000 for other local projects. Set in `package.json`.

**Profile not found on checkout?**  
Run the SQL migrations. The app auto-creates profiles via `/api/profile` once tables exist.

**Workspace create fails with RLS error?**  
Run migration **013** if **012** was already applied.

**Email not confirmed?**  
Confirm via Supabase email, confirm user manually in dashboard, or disable confirmation for dev.

**Failed to fetch on sign up?**  
Check Supabase URL and keys in `.env.local`, then restart the dev server.

---

## Author

**Egor Ermilov**

- GitHub: [C1aid](https://github.com/C1aid)
- LinkedIn: [Egor-Ermilov](https://www.linkedin.com/in/egor-ermilov-049402348/)

---

## License

This project is licensed under the [MIT License](./LICENSE).
