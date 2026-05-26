# Ascent Headquarters

A founder intake portal that runs early-stage founders through a Fundraising Readiness diagnostic, scores them across five dimensions, and unlocks a personalised dashboard with gap analysis, stage benchmarks, and a recommended starting point in a fundraising curriculum.

Built for a $0 operating cost: Next.js 16 on Vercel hobby + Supabase free tier + open-source UI primitives.

## What it does

1. **Mission Briefing** (public) — a 6-step questionnaire collects founder profile, startup metadata, and fundraising posture. Answers persist in `sessionStorage` so refreshes do not lose progress.
2. **Results teaser** — score is computed but blurred behind an auth wall. Founder signs up (email or Google) to unlock.
3. **Command Center** (auth-only) — Fundraising Readiness Score across five dimensions on a radar chart, gap analysis with actionable insights, profile snapshot, and stage benchmarks when the cohort is large enough.
4. **Launchpad** — six-phase fundraising curriculum with the founder's recommended starting phase highlighted based on their score.
5. **War Room** (admin-only) — eight analytics views over the founder pipeline: stage and sector breakdowns, geographic distribution, readiness heatmap, funding goals, biggest challenges, recent signups.

## Scoring

The Fundraising Readiness Score is computed server-side via a Supabase RPC (`compute_readiness_score`) so clients can never write to the scores table. Five dimensions, each scored 0 to 100, averaged for an overall score:

- **Pitch Readiness** — pitch deck, financial model, investor list
- **Financial Literacy** — cap table confidence, revenue stage, capital raised
- **Funding Strategy** — pathway clarity, target raise, challenge specificity
- **Business Maturity** — stage, team size, revenue, co-founder presence
- **Market Awareness** — Australian funding landscape knowledge, prior raises, capital type literacy

Stage benchmarks require at least 10 founders at the same stage before they appear, so individual founders cannot be reverse-identified from aggregates.

## Architecture

```
Next.js 16 App Router (React Server Components + client islands)
        |
        v
Supabase Postgres (RLS on every table, SECURITY DEFINER RPCs)
        |
        v
Supabase Auth (email + password, Google OAuth)
```

Tables: `profiles`, `startups`, `questionnaire_responses`, `readiness_scores`. Each has Row Level Security enabled. Founders can only read their own rows; admins can read across the cohort. Score writes go through a `SECURITY DEFINER` function that pulls from `questionnaire_responses` and `startups` and writes to `readiness_scores`, so the client never touches the score table directly.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [Tailwind v4](https://tailwindcss.com/) (CSS-based theming via `@theme` blocks)
- [shadcn/ui](https://ui.shadcn.com/) (New York style, base-nova)
- [Supabase](https://supabase.com/) (Postgres, Auth, RLS)
- [Recharts](https://recharts.org/) (radar chart, admin visualisations)
- [Lucide](https://lucide.dev/) (icons)

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier is enough)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase project credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both values are available under **Project Settings > API** in the Supabase dashboard.

### 3. Run the database migration

Open the SQL editor in your Supabase dashboard and paste the contents of `supabase/migrations/00001_initial_schema.sql`. This creates the four tables, RLS policies, scoring RPC, and benchmark RPC.

If you want to seed synthetic founders for local testing, uncomment the blocks in `supabase/seed.sql` and run that file too.

### 4. Configure auth (optional but recommended)

For Google OAuth:

1. In the Supabase dashboard, go to **Authentication > Providers > Google**.
2. Add your Google OAuth client ID and secret (from the Google Cloud console).
3. Add `http://localhost:3000/auth/callback` and your production callback URL to the authorised redirect URIs.

Email signups work without any extra setup.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Make yourself an admin

After signing up, run this in the Supabase SQL editor to flip your role:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-auth-user-id';
```

You can find your user ID under **Authentication > Users** in the Supabase dashboard. With admin role, the War Room link appears in the sidebar and you can read every founder's data.

## Project layout

```
src/
  app/
    (admin)/             # Admin-only routes, guarded server-side
      admin/             # War Room
    (authenticated)/     # Logged-in routes
      command-center/    # Dashboard
      launchpad/         # Curriculum view
      profile/           # Edit profile
    auth/callback/       # Supabase OAuth callback
    login/               # Email + Google login
    signup/              # Email + Google signup
    mission-briefing/    # Public questionnaire wizard
    page.tsx             # Landing page
  components/
    admin/               # War Room analytics components
    dashboard/           # Command Center cards
    landing/             # Landing page sections
    layout/              # Navbar, sidebar, footer
    questionnaire/       # Wizard steps + progress bar
    ui/                  # shadcn primitives
  lib/
    supabase/            # Browser, server, admin clients
    constants.ts         # Enum labels, Ascent phases, dimension copy
    persist-questionnaire.ts  # sessionStorage to Supabase handoff
    questionnaire-storage.ts  # sessionStorage helpers
  types/
    database.ts          # Schema types
    questionnaire.ts     # Form shape

supabase/
  migrations/            # SQL schema, RLS, RPCs
  seed.sql               # Optional synthetic founder data
```

## Build and deploy

```bash
npm run build       # Production build
npm run start       # Run production build locally
npm run lint        # ESLint
```

The project deploys cleanly to Vercel with no additional configuration:

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings.
4. Deploy.

Security headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.

## License

MIT. See [LICENSE](LICENSE).
