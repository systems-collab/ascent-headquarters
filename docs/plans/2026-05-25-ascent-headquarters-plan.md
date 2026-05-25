# Ascent Headquarters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a founder intake portal with questionnaire, readiness scoring, authenticated dashboard, and admin analytics for Fishburners' Ascent program.

**Architecture:** Next.js 14 App Router frontend with Supabase (Postgres + Auth + RLS) as the entire backend. Questionnaire data persists in sessionStorage pre-auth, writes to Supabase on signup, server-side RPC computes readiness scores. Admin War Room shows aggregate analytics via RLS-protected queries.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Recharts, Supabase (Postgres, Auth, RLS), Vercel

**Spec:** `docs/specs/2026-05-25-ascent-headquarters-design.md`

---

## File Map

```
ascent-headquarters/
  src/
    app/
      layout.tsx                          # Root layout, Inter font, metadata, Supabase provider
      page.tsx                            # Landing page (public)
      globals.css                         # Tailwind directives + CSS custom properties
      login/page.tsx                      # Login form (Google + email)
      signup/page.tsx                     # Signup form (Google + email)
      auth/callback/route.ts              # OAuth callback + sessionStorage->DB persistence
      mission-briefing/
        page.tsx                          # 6-step questionnaire wizard
        results/page.tsx                  # Blurred score teaser + signup wall
      (authenticated)/
        layout.tsx                        # Sidebar + nav wrapper for auth'd routes
        command-center/page.tsx           # Founder dashboard
        launchpad/page.tsx                # Ascent curriculum CTA
        profile/page.tsx                  # Edit founder profile
      (admin)/
        layout.tsx                        # Admin layout with admin check
        admin/page.tsx                    # War Room analytics
    components/
      ui/                                 # shadcn/ui (auto-generated via CLI)
      landing/
        hero.tsx                          # Hero section with CTA
        stats-bar.tsx                     # Impact numbers
        how-it-works.tsx                  # 3-step process
        about-ascent.tsx                  # Program description
      questionnaire/
        step-about-you.tsx                # Step 1
        step-your-startup.tsx             # Step 2
        step-stage-team.tsx               # Step 3
        step-funding-history.tsx          # Step 4
        step-fundraising-readiness.tsx    # Step 5
        step-your-goals.tsx               # Step 6
        progress-bar.tsx                  # Step indicator
      dashboard/
        readiness-radar.tsx               # Radar/spider chart (Recharts)
        gap-analysis-card.tsx             # Weakest dimension card
        profile-snapshot.tsx              # Startup summary card
        benchmark-card.tsx                # Stage comparison
      admin/
        pipeline-overview.tsx             # Total counts + conversion
        stage-chart.tsx                   # Pie chart by stage
        sector-chart.tsx                  # Bar chart by sector
        geo-chart.tsx                     # State/territory breakdown
        readiness-heatmap.tsx             # Aggregate dimension scores
        funding-goals-chart.tsx           # Pathway + raise distribution
        challenges-chart.tsx              # Challenge distribution
        recent-signups-table.tsx          # Last 20 founders (pseudonymised)
      layout/
        navbar.tsx                        # Top nav (public)
        sidebar.tsx                       # Sidebar (authenticated)
        footer.tsx                        # Site footer
    lib/
      supabase/
        client.ts                         # createBrowserClient
        server.ts                         # createServerClient (cookies)
        middleware.ts                     # Auth check for protected routes
        admin.ts                          # is_admin() check
      questionnaire-storage.ts            # sessionStorage read/write/clear
      constants.ts                        # Enum labels, scoring maps, phase data
    types/
      database.ts                         # Supabase-generated types
      questionnaire.ts                    # Form state types
  supabase/
    migrations/
      00001_initial_schema.sql            # Tables, indexes, triggers, RLS, RPCs
    seed.sql                              # Synthetic test founders
  middleware.ts                           # Next.js root middleware (route protection)
  next.config.ts                          # Security headers
  tailwind.config.ts                      # Fishburners orange theme
  .env.local.example                      # Required env vars
  package.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `.env.local.example`, `tsconfig.json`

- [ ] **Step 1: Create Next.js project**

Run:
```powershell
cd D:\Fishburners\Ascent_Headquarters
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
Expected: Project created with `src/app/` structure.

- [ ] **Step 2: Install dependencies**

Run:
```powershell
npm install @supabase/supabase-js @supabase/ssr recharts
npm install -D @types/node
```

- [ ] **Step 3: Initialize shadcn/ui**

Run:
```powershell
npx shadcn@latest init -d
```
Select: New York style, Zinc base color, CSS variables.

- [ ] **Step 4: Add shadcn/ui components we need**

Run:
```powershell
npx shadcn@latest add button input label select card badge progress tabs dialog separator
```

- [ ] **Step 5: Create .env.local.example**

Create `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 6: Configure security headers in next.config.ts**

Replace `next.config.ts`:
```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

- [ ] **Step 7: Configure Tailwind with Fishburners orange**

Update `tailwind.config.ts` to extend the theme with Fishburners brand colors. Add to `extend.colors`:
```ts
fishburners: {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',   // primary orange
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
},
```

- [ ] **Step 8: Set up globals.css with CSS custom properties**

Replace `src/app/globals.css` with Tailwind directives plus custom properties:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 24.6 95% 53.1%;
    --color-primary-foreground: 60 9.1% 97.8%;
    --background: 0 0% 98%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --border: 240 5.9% 90%;
    --radius: 0.625rem;
  }
}
```

- [ ] **Step 9: Set up root layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ascent Headquarters",
  description:
    "Your command center for fundraising readiness. Ascent by Fishburners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Verify build passes**

Run:
```powershell
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 11: Initialize git and commit**

Run:
```powershell
git init
git add -A
git commit -m "feat: scaffold Next.js 14 project with Tailwind, shadcn/ui, Supabase deps"
```

---

### Task 2: TypeScript Types & Constants

**Files:**
- Create: `src/types/database.ts`, `src/types/questionnaire.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Create database types**

Create `src/types/database.ts`:
```ts
export type UserRole = "founder" | "admin";

export type Stage = "idea" | "pre_seed" | "seed" | "series_a" | "series_b_plus";
export type TeamSize = "solo" | "2_3" | "4_10" | "11_plus";
export type Sector =
  | "fintech" | "healthtech" | "edtech" | "cleantech" | "saas"
  | "ecommerce" | "deeptech" | "agritech" | "creative_media"
  | "social_impact" | "other";
export type MonthlyRevenue = "pre_revenue" | "under_5k" | "5k_20k" | "20k_100k" | "100k_plus";
export type AmountRaised = "under_50k" | "50k_250k" | "250k_1m" | "1m_5m" | "5m_plus";
export type TriState = "yes" | "in_progress" | "no";
export type Confidence = "confident" | "somewhat" | "not_yet";
export type AuLandscape = "strong" | "moderate" | "limited";
export type FundingType =
  | "bootstrapped" | "friends_family" | "angel" | "vc"
  | "grant" | "accelerator" | "debt" | "crowdfunding";
export type FundingPathway =
  | "venture_capital" | "angel_investment" | "government_grants"
  | "accelerator_programs" | "revenue_based_financing" | "debt_loans"
  | "crowdfunding" | "not_sure";
export type BiggestChallenge =
  | "dont_know_where_to_start" | "have_deck_no_meetings"
  | "getting_meetings_not_closing" | "legal_financial_structures"
  | "finding_right_capital" | "building_investor_relationships" | "other";
export type TargetRaise =
  | "under_100k" | "100k_500k" | "500k_2m" | "2m_10m" | "10m_plus" | "not_sure";
export type AuLocation =
  | "nsw" | "vic" | "qld" | "wa" | "sa" | "tas" | "act" | "nt" | "remote_regional";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  location: AuLocation | null;
  created_at: string;
  updated_at: string;
}

export interface Startup {
  id: string;
  founder_id: string;
  name: string;
  sector: Sector | null;
  description: string | null;
  stage: Stage | null;
  team_size: TeamSize | null;
  has_cofounder: boolean | null;
  monthly_revenue: MonthlyRevenue | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  founder_id: string;
  raised_before: boolean | null;
  amount_raised: AmountRaised | null;
  funding_types: FundingType[];
  has_pitch_deck: TriState | null;
  has_financial_model: TriState | null;
  understands_cap_tables: Confidence | null;
  identified_investors: Confidence | null;
  au_landscape_rating: AuLandscape | null;
  target_pathways: FundingPathway[];
  biggest_challenge: BiggestChallenge | null;
  target_raise: TargetRaise | null;
  created_at: string;
  updated_at: string;
}

export interface ReadinessScore {
  id: string;
  founder_id: string;
  pitch_readiness: number;
  financial_literacy: number;
  funding_strategy: number;
  business_maturity: number;
  market_awareness: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Create questionnaire form types**

Create `src/types/questionnaire.ts`:
```ts
import type {
  AuLocation, Sector, Stage, TeamSize, MonthlyRevenue,
  AmountRaised, FundingType, TriState, Confidence,
  AuLandscape, FundingPathway, BiggestChallenge, TargetRaise,
} from "./database";

export interface QuestionnaireFormData {
  full_name: string;
  email: string;
  location: AuLocation | "";
  startup_name: string;
  sector: Sector | "";
  description: string;
  stage: Stage | "";
  team_size: TeamSize | "";
  has_cofounder: boolean | null;
  raised_before: boolean | null;
  amount_raised: AmountRaised | "";
  funding_types: FundingType[];
  monthly_revenue: MonthlyRevenue | "";
  has_pitch_deck: TriState | "";
  has_financial_model: TriState | "";
  understands_cap_tables: Confidence | "";
  identified_investors: Confidence | "";
  au_landscape_rating: AuLandscape | "";
  target_pathways: FundingPathway[];
  biggest_challenge: BiggestChallenge | "";
  target_raise: TargetRaise | "";
}

export const EMPTY_FORM: QuestionnaireFormData = {
  full_name: "",
  email: "",
  location: "",
  startup_name: "",
  sector: "",
  description: "",
  stage: "",
  team_size: "",
  has_cofounder: null,
  raised_before: null,
  amount_raised: "",
  funding_types: [],
  monthly_revenue: "",
  has_pitch_deck: "",
  has_financial_model: "",
  understands_cap_tables: "",
  identified_investors: "",
  au_landscape_rating: "",
  target_pathways: [],
  biggest_challenge: "",
  target_raise: "",
};

export const TOTAL_STEPS = 6;
```

- [ ] **Step 3: Create constants with human-readable labels**

Create `src/lib/constants.ts`:
```ts
import type { Stage, Sector, AuLocation, FundingPathway, BiggestChallenge } from "@/types/database";

export const STAGE_LABELS: Record<Stage, string> = {
  idea: "Idea Stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b_plus: "Series B+",
};

export const SECTOR_LABELS: Record<Sector, string> = {
  fintech: "Fintech",
  healthtech: "Healthtech",
  edtech: "Edtech",
  cleantech: "Cleantech",
  saas: "SaaS",
  ecommerce: "E-commerce",
  deeptech: "Deeptech",
  agritech: "Agritech",
  creative_media: "Creative/Media",
  social_impact: "Social Impact",
  other: "Other",
};

export const LOCATION_LABELS: Record<AuLocation, string> = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  wa: "Western Australia",
  sa: "South Australia",
  tas: "Tasmania",
  act: "ACT",
  nt: "Northern Territory",
  remote_regional: "Remote/Regional",
};

export const PATHWAY_LABELS: Record<FundingPathway, string> = {
  venture_capital: "Venture Capital",
  angel_investment: "Angel Investment",
  government_grants: "Government Grants",
  accelerator_programs: "Accelerator Programs",
  revenue_based_financing: "Revenue-based Financing",
  debt_loans: "Debt/Loans",
  crowdfunding: "Crowdfunding",
  not_sure: "Not sure yet",
};

export const CHALLENGE_LABELS: Record<BiggestChallenge, string> = {
  dont_know_where_to_start: "Don't know where to start",
  have_deck_no_meetings: "Have a pitch deck but can't get meetings",
  getting_meetings_not_closing: "Getting meetings but not closing",
  legal_financial_structures: "Understanding legal/financial structures",
  finding_right_capital: "Finding the right type of capital",
  building_investor_relationships: "Building investor relationships",
  other: "Other",
};

export const ASCENT_PHASES = [
  { number: 1, title: "Fundraising Foundations", description: "Build your base understanding of startup capital and the Australian funding landscape." },
  { number: 2, title: "Preparation & Readiness", description: "Get your pitch deck, financial model, and legal foundations investor-ready." },
  { number: 3, title: "Funding Pathways", description: "Explore 19 capital pathways from VC to grants to crowdfunding." },
  { number: 4, title: "Executing the Raise", description: "Run your fundraise with confidence, from outreach to due diligence." },
  { number: 5, title: "Closing the Deal", description: "Navigate term sheets, negotiations, and the final close." },
  { number: 6, title: "Post-Raise Growth", description: "Deploy capital effectively and build toward your next milestone." },
] as const;

export const DIMENSION_LABELS: Record<string, string> = {
  pitch_readiness: "Pitch Readiness",
  financial_literacy: "Financial Literacy",
  funding_strategy: "Funding Strategy",
  business_maturity: "Business Maturity",
  market_awareness: "Market Awareness",
};

export const DIMENSION_INSIGHTS: Record<string, string> = {
  pitch_readiness: "Strengthen your pitch deck, financial model, and investor targeting.",
  financial_literacy: "Deepen your understanding of cap tables, revenue metrics, and capital history.",
  funding_strategy: "Clarify your funding pathway, target raise amount, and biggest challenges.",
  business_maturity: "Grow your team, validate revenue, and advance your startup stage.",
  market_awareness: "Build your knowledge of the Australian funding landscape and capital types.",
};
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/types src/lib/constants.ts
git commit -m "feat: add TypeScript types and constants for database schema and questionnaire"
```

---

### Task 3: Supabase Database Migration

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`, `supabase/seed.sql`

- [ ] **Step 1: Create migration file with full schema**

Create `supabase/migrations/00001_initial_schema.sql` with the complete SQL from spec Section 5 (all tables, indexes, triggers, RLS policies, RPCs). Copy verbatim from the spec:
- `profiles` table
- `startups` table with UNIQUE on founder_id + CHECK constraints + indexes
- `questionnaire_responses` table with UNIQUE + CHECK + GIN indexes
- `readiness_scores` table with UNIQUE + indexes
- `moddatetime` extension + triggers on all 4 tables
- `handle_new_user()` trigger function + trigger
- `compute_readiness_score(p_founder_id UUID)` RPC with full scoring logic
- `get_stage_benchmarks(p_stage TEXT)` RPC with n>=10 threshold
- `is_admin()` helper function
- All RLS policies (enable RLS, profiles read/update, startups CRUD, questionnaire CRUD, scores read-only)

The `compute_readiness_score` function must implement the full scoring algorithm from spec Section 9.1:

```sql
-- Inside compute_readiness_score:
-- Pitch Readiness
v_pitch := (
  CASE q.has_pitch_deck WHEN 'yes' THEN 100 WHEN 'in_progress' THEN 50 ELSE 0 END +
  CASE q.has_financial_model WHEN 'yes' THEN 100 WHEN 'in_progress' THEN 50 ELSE 0 END +
  CASE q.identified_investors WHEN 'yes' THEN 100 WHEN 'somewhat' THEN 50 ELSE 0 END
) / 3;

-- Financial Literacy
v_financial := (
  CASE q.understands_cap_tables WHEN 'confident' THEN 100 WHEN 'somewhat' THEN 50 ELSE 0 END +
  CASE s.monthly_revenue WHEN '100k_plus' THEN 100 WHEN '20k_100k' THEN 75 WHEN '5k_20k' THEN 50 WHEN 'under_5k' THEN 25 ELSE 10 END +
  CASE q.amount_raised WHEN '5m_plus' THEN 100 WHEN '1m_5m' THEN 80 WHEN '250k_1m' THEN 60 WHEN '50k_250k' THEN 40 WHEN 'under_50k' THEN 20 ELSE 0 END
) / 3;

-- Funding Strategy
v_strategy := (
  CASE WHEN array_length(q.target_pathways, 1) >= 3 THEN 100
       WHEN array_length(q.target_pathways, 1) = 2 THEN 75
       WHEN array_length(q.target_pathways, 1) = 1 AND q.target_pathways[1] != 'not_sure' THEN 50
       ELSE 10 END +
  CASE WHEN q.target_raise != 'not_sure' THEN 100 ELSE 25 END +
  CASE q.biggest_challenge
    WHEN 'building_investor_relationships' THEN 80
    WHEN 'finding_right_capital' THEN 75
    WHEN 'getting_meetings_not_closing' THEN 70
    WHEN 'legal_financial_structures' THEN 65
    WHEN 'have_deck_no_meetings' THEN 60
    WHEN 'dont_know_where_to_start' THEN 30
    ELSE 50 END
) / 3;

-- Business Maturity
v_maturity := (
  CASE s.stage WHEN 'series_b_plus' THEN 100 WHEN 'series_a' THEN 80 WHEN 'seed' THEN 60 WHEN 'pre_seed' THEN 40 ELSE 20 END +
  CASE s.team_size WHEN '11_plus' THEN 100 WHEN '4_10' THEN 80 WHEN '2_3' THEN 60 ELSE 45 END +
  CASE s.monthly_revenue WHEN '100k_plus' THEN 100 WHEN '20k_100k' THEN 75 WHEN '5k_20k' THEN 50 WHEN 'under_5k' THEN 25 ELSE 10 END +
  CASE WHEN s.has_cofounder THEN 70 ELSE 50 END
) / 4;

-- Market Awareness
v_awareness := (
  CASE q.au_landscape_rating WHEN 'strong' THEN 100 WHEN 'moderate' THEN 50 ELSE 0 END +
  CASE WHEN q.raised_before THEN 80 ELSE 30 END +
  CASE WHEN array_length(q.funding_types, 1) >= 3 THEN 100
       WHEN array_length(q.funding_types, 1) = 2 THEN 70
       WHEN array_length(q.funding_types, 1) = 1 THEN 40
       ELSE 10 END
) / 3;

v_overall := (v_pitch + v_financial + v_strategy + v_maturity + v_awareness) / 5;
```

- [ ] **Step 2: Create seed data with synthetic founders**

Create `supabase/seed.sql` with 5 clearly synthetic test founders covering different stages. Use UUIDs and fake data:
```sql
-- SYNTHETIC TEST DATA ONLY. No real PII.
-- These rows assume auth.users entries exist with matching UUIDs.
-- In practice, create test users via Supabase dashboard first.

-- Example (actual UUIDs generated at insert time):
-- INSERT INTO profiles (id, full_name, role, location) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Test Founder Alpha', 'founder', 'nsw'),
--   ('00000000-0000-0000-0000-000000000002', 'Test Founder Beta', 'founder', 'vic'),
--   ('00000000-0000-0000-0000-000000000099', 'Test Admin', 'admin', 'nsw');
-- ... corresponding startups, questionnaire_responses rows
-- Then call: SELECT compute_readiness_score('00000000-...-000000000001');
```

- [ ] **Step 3: Apply migration to Supabase**

Run the migration SQL in Supabase Dashboard > SQL Editor, or via Supabase CLI:
```powershell
npx supabase db push
```

- [ ] **Step 4: Commit**

```powershell
git add supabase/
git commit -m "feat: add Supabase migration with schema, RLS, triggers, scoring RPC"
```

---

### Task 4: Supabase Client Setup + Middleware

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `middleware.ts`

- [ ] **Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component: can't set cookies, but that's fine for reads
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create admin check helper**

Create `src/lib/supabase/admin.ts`:
```ts
import { createServerSupabaseClient } from "./server";

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role === "admin";
}
```

- [ ] **Step 4: Create root middleware for route protection**

Create `middleware.ts` (project root, not in `src/`):
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/command-center", "/launchpad", "/profile"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => path.startsWith(r));

  if ((isProtected || isAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAdmin && user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/command-center";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS (will warn about missing env vars at runtime, but build should succeed)

- [ ] **Step 6: Commit**

```powershell
git add src/lib/supabase middleware.ts
git commit -m "feat: add Supabase client, server client, admin check, and auth middleware"
```

---

### Task 5: SessionStorage Helpers

**Files:**
- Create: `src/lib/questionnaire-storage.ts`

- [ ] **Step 1: Create sessionStorage utility**

Create `src/lib/questionnaire-storage.ts`:
```ts
import { type QuestionnaireFormData, EMPTY_FORM } from "@/types/questionnaire";

const STORAGE_KEY = "ascent_questionnaire";

export function saveQuestionnaireData(data: QuestionnaireFormData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadQuestionnaireData(): QuestionnaireFormData {
  if (typeof window === "undefined") return EMPTY_FORM;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_FORM;
  try {
    return JSON.parse(raw) as QuestionnaireFormData;
  } catch {
    return EMPTY_FORM;
  }
}

export function clearQuestionnaireData(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasQuestionnaireData(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/questionnaire-storage.ts
git commit -m "feat: add sessionStorage helpers for questionnaire data"
```

---

### Task 6: Shared Layout Components

**Files:**
- Create: `src/components/layout/navbar.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/footer.tsx`, `src/app/(authenticated)/layout.tsx`, `src/app/(admin)/layout.tsx`

- [ ] **Step 1: Create public navbar**

Create `src/components/layout/navbar.tsx`:
```tsx
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-fishburners-600">
          Ascent HQ
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/mission-briefing"
            className="text-sm font-medium text-gray-700 hover:text-fishburners-600"
          >
            Mission Briefing
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-fishburners-500 px-4 py-2 text-sm font-medium text-white hover:bg-fishburners-600"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create footer**

Create `src/components/layout/footer.tsx`:
```tsx
export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <p>Ascent Headquarters by Fishburners</p>
          <p>Australia's first national capital engine for women founders</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create authenticated sidebar**

Create `src/components/layout/sidebar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/command-center", label: "Command Center" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/profile", label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-fishburners-600">
          Ascent HQ
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium ${
              pathname === item.href
                ? "bg-fishburners-50 text-fishburners-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={handleSignOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create authenticated layout**

Create `src/app/(authenticated)/layout.tsx`:
```tsx
import { Sidebar } from "@/components/layout/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Create admin layout**

Create `src/app/(admin)/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) redirect("/command-center");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```powershell
git add src/components/layout src/app/(authenticated) src/app/(admin)
git commit -m "feat: add shared layout components (navbar, sidebar, footer, auth/admin layouts)"
```

---

### Task 7: Landing Page

**Files:**
- Create: `src/components/landing/hero.tsx`, `src/components/landing/stats-bar.tsx`, `src/components/landing/how-it-works.tsx`, `src/components/landing/about-ascent.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/landing/hero.tsx`:
```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-fishburners-500 to-fishburners-700 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Ascent Headquarters
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-fishburners-100">
          Your command center for fundraising readiness. Assess where you stand,
          identify your gaps, and chart your path to capital.
        </p>
        <div className="mt-10">
          <Link
            href="/mission-briefing"
            className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-fishburners-600 shadow-lg hover:bg-gray-50 transition-colors"
          >
            Begin Mission Briefing
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create StatsBar component**

Create `src/components/landing/stats-bar.tsx`:
```tsx
const STATS = [
  { value: "200+", label: "Founders Served" },
  { value: "66%", label: "Secured Funding" },
  { value: "90%", label: "Engagement Retention" },
];

export function StatsBar() {
  return (
    <section className="border-b bg-white py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-bold text-fishburners-600">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create HowItWorks component**

Create `src/components/landing/how-it-works.tsx`:
```tsx
const STEPS = [
  { number: 1, title: "Take the Mission Briefing", description: "A 2-minute diagnostic that maps your fundraising readiness across five dimensions." },
  { number: 2, title: "Get Your Readiness Score", description: "See where you stand on pitch prep, financial literacy, funding strategy, and more." },
  { number: 3, title: "Access Your Command Center", description: "Your personalized dashboard with gap analysis and a clear path forward." },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          How It Works
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fishburners-100 text-lg font-bold text-fishburners-600">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create AboutAscent component**

Create `src/components/landing/about-ascent.tsx`:
```tsx
export function AboutAscent() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">What is Ascent?</h2>
        <p className="mt-6 text-lg text-gray-600">
          Ascent is Australia's first national capital engine for women founders,
          operated by Fishburners. The program covers the full fundraising
          lifecycle across 6 phases and 39 chapters, built by 30+ specialist
          partners.
        </p>
        <p className="mt-4 text-lg text-gray-600">
          From fundraising foundations to post-raise growth, Ascent gives you the
          knowledge and tools to raise capital with confidence.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Assemble landing page**

Replace `src/app/page.tsx`:
```tsx
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AboutAscent } from "@/components/landing/about-ascent";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <AboutAscent />
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Verify build + visual check**

Run: `npm run dev`
Open `http://localhost:3000` and verify the landing page renders correctly.
Run: `npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```powershell
git add src/components/landing src/app/page.tsx
git commit -m "feat: build landing page with hero, stats, how-it-works, and about sections"
```

---

### Task 8: Questionnaire Wizard

**Files:**
- Create: `src/components/questionnaire/progress-bar.tsx`, `src/components/questionnaire/step-about-you.tsx`, `src/components/questionnaire/step-your-startup.tsx`, `src/components/questionnaire/step-stage-team.tsx`, `src/components/questionnaire/step-funding-history.tsx`, `src/components/questionnaire/step-fundraising-readiness.tsx`, `src/components/questionnaire/step-your-goals.tsx`, `src/app/mission-briefing/page.tsx`

This is the largest task. Each step component receives `formData` and `onChange` props and renders its fields. The parent page.tsx manages state, step navigation, and sessionStorage persistence.

- [ ] **Step 1: Create progress bar component**

Create `src/components/questionnaire/progress-bar.tsx`:
```tsx
import { TOTAL_STEPS } from "@/types/questionnaire";

export function ProgressBar({ currentStep }: { currentStep: number }) {
  const percentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>Step {currentStep} of {TOTAL_STEPS}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-fishburners-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create all 6 step components**

Each step component follows the same pattern. Create all 6 files in `src/components/questionnaire/`. Each exports a component that takes `{ formData, onChange }` props where `onChange` is `(updates: Partial<QuestionnaireFormData>) => void`.

Step 1 (About You): full_name text input, email text input, location select dropdown.
Step 2 (Your Startup): startup_name text input, sector select, description textarea (max 140).
Step 3 (Stage & Team): stage radio group, team_size radio group, has_cofounder yes/no toggle.
Step 4 (Funding History): raised_before yes/no, conditional amount_raised select, conditional funding_types multi-checkbox, monthly_revenue select.
Step 5 (Fundraising Readiness): has_pitch_deck radio, has_financial_model radio, understands_cap_tables radio, identified_investors radio, au_landscape_rating radio.
Step 6 (Your Goals): target_pathways multi-checkbox, biggest_challenge radio, target_raise select.

Use shadcn/ui Input, Label, Select components. Keep each file under 100 lines.

- [ ] **Step 3: Create questionnaire page with wizard state**

Create `src/app/mission-briefing/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProgressBar } from "@/components/questionnaire/progress-bar";
import { StepAboutYou } from "@/components/questionnaire/step-about-you";
import { StepYourStartup } from "@/components/questionnaire/step-your-startup";
import { StepStageTeam } from "@/components/questionnaire/step-stage-team";
import { StepFundingHistory } from "@/components/questionnaire/step-funding-history";
import { StepFundraisingReadiness } from "@/components/questionnaire/step-fundraising-readiness";
import { StepYourGoals } from "@/components/questionnaire/step-your-goals";
import { type QuestionnaireFormData, EMPTY_FORM, TOTAL_STEPS } from "@/types/questionnaire";
import { saveQuestionnaireData, loadQuestionnaireData } from "@/lib/questionnaire-storage";

const STEP_COMPONENTS = [
  StepAboutYou,
  StepYourStartup,
  StepStageTeam,
  StepFundingHistory,
  StepFundraisingReadiness,
  StepYourGoals,
];

export default function MissionBriefingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireFormData>(EMPTY_FORM);
  const router = useRouter();

  useEffect(() => {
    setFormData(loadQuestionnaireData());
  }, []);

  function handleChange(updates: Partial<QuestionnaireFormData>) {
    const next = { ...formData, ...updates };
    setFormData(next);
    saveQuestionnaireData(next);
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      saveQuestionnaireData(formData);
      router.push("/mission-briefing/results");
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  const StepComponent = STEP_COMPONENTS[step - 1];

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Mission Briefing
        </h1>
        <p className="mb-8 text-gray-600">
          Tell us about your startup and fundraising journey.
        </p>
        <ProgressBar currentStep={step} />
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <StepComponent formData={formData} onChange={handleChange} />
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:invisible"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="rounded-md bg-fishburners-500 px-6 py-2 text-sm font-medium text-white hover:bg-fishburners-600"
            >
              {step === TOTAL_STEPS ? "See My Results" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Verify build + visual check**

Run: `npm run dev`, navigate to `/mission-briefing`, click through all 6 steps.
Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/components/questionnaire src/app/mission-briefing/page.tsx
git commit -m "feat: build 6-step questionnaire wizard with sessionStorage persistence"
```

---

### Task 9: Results Teaser + Signup Wall

**Files:**
- Create: `src/app/mission-briefing/results/page.tsx`

- [ ] **Step 1: Create results teaser page**

Create `src/app/mission-briefing/results/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { hasQuestionnaireData } from "@/lib/questionnaire-storage";

export default function ResultsTeaserPage() {
  const [hasData, setHasData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasQuestionnaireData()) {
      router.push("/mission-briefing");
      return;
    }
    setHasData(true);
  }, [router]);

  if (!hasData) return null;

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Blurred placeholder radar */}
          <div className="mx-auto mb-8 h-48 w-48 rounded-full bg-gradient-to-br from-fishburners-100 to-fishburners-200 blur-sm" />
          <h1 className="text-3xl font-bold text-gray-900">
            Your Fundraising Readiness Score is ready.
          </h1>
          <p className="mt-4 text-gray-600">
            Sign up to unlock your full diagnostic and access your Command
            Center.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/signup"
              className="block w-full rounded-md bg-fishburners-500 px-4 py-3 text-center font-medium text-white hover:bg-fishburners-600"
            >
              Continue with Google
            </Link>
            <Link
              href="/signup"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign up with email
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-fishburners-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```powershell
git add src/app/mission-briefing/results
git commit -m "feat: add results teaser page with blurred score and signup wall"
```

---

### Task 10: Auth Pages + OAuth Callback

**Files:**
- Create: `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create login page**

Create `src/app/login/page.tsx` with email/password form + Google OAuth button. On submit, call `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOAuth({ provider: 'google' })`. On success, redirect to `/command-center`.

- [ ] **Step 2: Create signup page**

Create `src/app/signup/page.tsx` with full_name input, email, password, confirm password. On submit, call `supabase.auth.signUp()` with `options: { data: { full_name } }`. Google button calls `signInWithOAuth`. On success, redirect to auth callback.

- [ ] **Step 3: Create OAuth callback route**

Create `src/app/auth/callback/route.ts`:
```ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/command-center`);
}
```

- [ ] **Step 4: Create post-signup data persistence page**

After signup, the client needs to persist sessionStorage data to Supabase. Add this logic in the Command Center page's initial load (Task 12): if sessionStorage has data and the user just signed up, write to `startups` + `questionnaire_responses`, call `compute_readiness_score` RPC, then clear sessionStorage.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```powershell
git add src/app/login src/app/signup src/app/auth
git commit -m "feat: add login, signup pages with Google OAuth and email/password auth"
```

---

### Task 11: Post-Signup Data Persistence Hook

**Files:**
- Create: `src/lib/persist-questionnaire.ts`

- [ ] **Step 1: Create persistence function**

Create `src/lib/persist-questionnaire.ts`:
```ts
import { createClient } from "@/lib/supabase/client";
import { loadQuestionnaireData, clearQuestionnaireData, hasQuestionnaireData } from "./questionnaire-storage";

export async function persistQuestionnaireIfNeeded(): Promise<boolean> {
  if (!hasQuestionnaireData()) return false;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const formData = loadQuestionnaireData();

  // Update profile with name and location
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: formData.full_name,
      location: formData.location || null,
    })
    .eq("id", user.id);

  if (profileError) throw profileError;

  // Upsert startup
  const { error: startupError } = await supabase
    .from("startups")
    .upsert({
      founder_id: user.id,
      name: formData.startup_name,
      sector: formData.sector || null,
      description: formData.description || null,
      stage: formData.stage || null,
      team_size: formData.team_size || null,
      has_cofounder: formData.has_cofounder,
      monthly_revenue: formData.monthly_revenue || null,
    }, { onConflict: "founder_id" });

  if (startupError) throw startupError;

  // Upsert questionnaire responses
  const { error: questionnaireError } = await supabase
    .from("questionnaire_responses")
    .upsert({
      founder_id: user.id,
      raised_before: formData.raised_before,
      amount_raised: formData.amount_raised || null,
      funding_types: formData.funding_types,
      has_pitch_deck: formData.has_pitch_deck || null,
      has_financial_model: formData.has_financial_model || null,
      understands_cap_tables: formData.understands_cap_tables || null,
      identified_investors: formData.identified_investors || null,
      au_landscape_rating: formData.au_landscape_rating || null,
      target_pathways: formData.target_pathways,
      biggest_challenge: formData.biggest_challenge || null,
      target_raise: formData.target_raise || null,
    }, { onConflict: "founder_id" });

  if (questionnaireError) throw questionnaireError;

  // Compute readiness score server-side
  const { error: rpcError } = await supabase
    .rpc("compute_readiness_score", { p_founder_id: user.id });

  if (rpcError) throw rpcError;

  clearQuestionnaireData();
  return true;
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/persist-questionnaire.ts
git commit -m "feat: add post-signup questionnaire persistence with server-side scoring"
```

---

### Task 12: Command Center Dashboard

**Files:**
- Create: `src/app/(authenticated)/command-center/page.tsx`, `src/components/dashboard/readiness-radar.tsx`, `src/components/dashboard/gap-analysis-card.tsx`, `src/components/dashboard/profile-snapshot.tsx`, `src/components/dashboard/benchmark-card.tsx`

- [ ] **Step 1: Create Recharts radar chart component**

Create `src/components/dashboard/readiness-radar.tsx`:
```tsx
"use client";

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";
import type { ReadinessScore } from "@/types/database";
import { DIMENSION_LABELS } from "@/lib/constants";

interface Props {
  scores: ReadinessScore;
}

export function ReadinessRadar({ scores }: Props) {
  const data = [
    { dimension: DIMENSION_LABELS.pitch_readiness, score: scores.pitch_readiness },
    { dimension: DIMENSION_LABELS.financial_literacy, score: scores.financial_literacy },
    { dimension: DIMENSION_LABELS.funding_strategy, score: scores.funding_strategy },
    { dimension: DIMENSION_LABELS.business_maturity, score: scores.business_maturity },
    { dimension: DIMENSION_LABELS.market_awareness, score: scores.market_awareness },
  ];

  const scoreColor =
    scores.overall_score >= 70 ? "#16a34a" :
    scores.overall_score >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Readiness Score
        </h2>
        <span className="text-3xl font-bold" style={{ color: scoreColor }}>
          {scores.overall_score}/100
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
          <Radar
            dataKey="score"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create gap analysis card**

Create `src/components/dashboard/gap-analysis-card.tsx` showing the 2 weakest dimensions with scores, insight text from `DIMENSION_INSIGHTS`, and a CTA linking to `/launchpad`.

- [ ] **Step 3: Create profile snapshot card**

Create `src/components/dashboard/profile-snapshot.tsx` showing startup name, sector label, stage badge, location, and target raise. Link to `/profile` for edits.

- [ ] **Step 4: Create benchmark card**

Create `src/components/dashboard/benchmark-card.tsx` that calls `get_stage_benchmarks` RPC and shows a simple comparison bar when cohort >= 10.

- [ ] **Step 5: Create Command Center page**

Create `src/app/(authenticated)/command-center/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { persistQuestionnaireIfNeeded } from "@/lib/persist-questionnaire";
import { ReadinessRadar } from "@/components/dashboard/readiness-radar";
import { GapAnalysisCard } from "@/components/dashboard/gap-analysis-card";
import { ProfileSnapshot } from "@/components/dashboard/profile-snapshot";
import { BenchmarkCard } from "@/components/dashboard/benchmark-card";
import type { Profile, Startup, ReadinessScore } from "@/types/database";

export default function CommandCenterPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [scores, setScores] = useState<ReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await persistQuestionnaireIfNeeded();
      } catch (e) {
        console.error("Failed to persist questionnaire:", e);
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, startupRes, scoresRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("startups").select("*").eq("founder_id", user.id).single(),
        supabase.from("readiness_scores").select("*").eq("founder_id", user.id).single(),
      ]);

      setProfile(profileRes.data);
      setStartup(startupRes.data);
      setScores(scoresRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading your Command Center...</div>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Welcome back, {profile?.full_name || "Founder"}
      </h1>
      {startup && (
        <p className="mb-8 text-gray-600">{startup.name}</p>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {scores && <ReadinessRadar scores={scores} />}
        {scores && <GapAnalysisCard scores={scores} />}
        {startup && profile && <ProfileSnapshot profile={profile} startup={startup} />}
        {scores && startup && <BenchmarkCard stage={startup.stage} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify build + visual check**

Run: `npm run dev`, sign up, complete questionnaire, verify Command Center renders with radar chart.
Run: `npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```powershell
git add src/components/dashboard src/app/(authenticated)/command-center
git commit -m "feat: build Command Center with radar chart, gap analysis, profile snapshot, benchmarks"
```

---

### Task 13: Launchpad Page

**Files:**
- Create: `src/app/(authenticated)/launchpad/page.tsx`

- [ ] **Step 1: Create Launchpad page**

Create `src/app/(authenticated)/launchpad/page.tsx` with:
- "What is Ascent?" section
- Phase timeline using `ASCENT_PHASES` from constants (6 phases, each with number, title, 1-line description, rendered as a vertical timeline with numbered circles)
- Recommended starting point based on user's readiness scores (fetch from Supabase, map overall_score to a phase: <30 = Phase 1, 30-50 = Phase 2, 50-70 = Phase 3, >70 = Phase 4)
- CTA button: "Access the Ascent Curriculum" (external link placeholder)
- Secondary: "Talk to the Ascent team" (mailto link)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```powershell
git add src/app/(authenticated)/launchpad
git commit -m "feat: build Launchpad page with phase timeline and recommended starting point"
```

---

### Task 14: Admin War Room

**Files:**
- Create: `src/app/(admin)/admin/page.tsx`, all 8 components in `src/components/admin/`

- [ ] **Step 1: Create admin chart components**

Create all 8 chart/table components in `src/components/admin/`:

1. `pipeline-overview.tsx` - Three stat cards: total founders, questionnaires completed, overall conversion rate. Uses `count` queries on `profiles`, `questionnaire_responses`.
2. `stage-chart.tsx` - Recharts PieChart showing founder count per stage. Query `startups` grouped by stage.
3. `sector-chart.tsx` - Recharts BarChart showing founder count per sector.
4. `geo-chart.tsx` - Recharts BarChart showing count per Australian state/territory from `profiles.location`.
5. `readiness-heatmap.tsx` - Five horizontal bars showing average score per dimension across all `readiness_scores`.
6. `funding-goals-chart.tsx` - Two charts: pathway distribution (from `target_pathways` array unnest) and target raise distribution.
7. `challenges-chart.tsx` - Recharts BarChart showing `biggest_challenge` distribution.
8. `recent-signups-table.tsx` - Table of last 20 founders. Query joins `profiles`, `startups`, `readiness_scores`. Show first name only (split `full_name` on space, take first), startup name, stage label, sector label, overall score, formatted signup date.

Each component is a self-contained client component that fetches its own data from Supabase.

- [ ] **Step 2: Create War Room page**

Create `src/app/(admin)/admin/page.tsx`:
```tsx
import { PipelineOverview } from "@/components/admin/pipeline-overview";
import { StageChart } from "@/components/admin/stage-chart";
import { SectorChart } from "@/components/admin/sector-chart";
import { GeoChart } from "@/components/admin/geo-chart";
import { ReadinessHeatmap } from "@/components/admin/readiness-heatmap";
import { FundingGoalsChart } from "@/components/admin/funding-goals-chart";
import { ChallengesChart } from "@/components/admin/challenges-chart";
import { RecentSignupsTable } from "@/components/admin/recent-signups-table";

export default function AdminWarRoomPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">War Room</h1>
      <p className="mb-8 text-gray-600">Ascent cohort analytics</p>
      <div className="space-y-6">
        <PipelineOverview />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StageChart />
          <SectorChart />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GeoChart />
          <ReadinessHeatmap />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FundingGoalsChart />
          <ChallengesChart />
        </div>
        <RecentSignupsTable />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build + visual check with test data**

Run: `npm run dev`, log in as admin, verify all 8 sections render. With no data, charts should show empty states.
Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add src/components/admin src/app/(admin)
git commit -m "feat: build admin War Room with 8 analytics sections"
```

---

### Task 15: Profile Page + Final Polish

**Files:**
- Create: `src/app/(authenticated)/profile/page.tsx`

- [ ] **Step 1: Create profile edit page**

Create `src/app/(authenticated)/profile/page.tsx` that:
- Fetches current `profiles` + `startups` data
- Renders an editable form (name, location, startup name, sector, stage, team size, description, revenue)
- On save, updates both tables via Supabase client
- Shows success toast / message on save

- [ ] **Step 2: Add admin link to sidebar for admin users**

Update `src/components/layout/sidebar.tsx` to conditionally show "War Room" nav item if the user's profile role is admin. Fetch role on mount.

- [ ] **Step 3: Verify full flow end-to-end**

1. Open `/` - landing page renders
2. Click "Begin Mission Briefing" - questionnaire loads
3. Complete all 6 steps - data persists in sessionStorage
4. Click "See My Results" - results teaser with blurred score
5. Sign up with email - account created
6. Redirected to `/command-center` - radar chart, gap analysis, profile
7. Click "Launchpad" - phase timeline with recommendation
8. Click "Profile" - edit form with current data
9. (As admin) Click "War Room" - analytics dashboard

- [ ] **Step 4: Commit**

```powershell
git add src/app/(authenticated)/profile src/components/layout/sidebar.tsx
git commit -m "feat: add profile edit page and conditional admin nav link"
```

---

### Task 16: Deploy Configuration

**Files:**
- Modify: `package.json` (verify scripts), `.env.local.example`

- [ ] **Step 1: Verify .env.local has correct values**

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Configure Google OAuth in Supabase**

In Supabase Dashboard > Authentication > Providers > Google:
- Enable Google provider
- Add Google Client ID and Secret from Google Cloud Console
- Set redirect URL to `https://your-project.supabase.co/auth/v1/callback`
- In Google Cloud Console, add authorized redirect URIs: production Vercel domain + `http://localhost:3000`

- [ ] **Step 3: Final build check**

Run:
```powershell
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 4: Push to Fishburners GitHub**

```powershell
git remote add origin https://github.com/FishburnersOrg/ascent-headquarters.git
git push -u origin main
```

- [ ] **Step 5: Deploy to Vercel**

1. Connect Fishburners GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

- [ ] **Step 6: Verify production deployment**

Open the Vercel URL and run through the full flow (landing > questionnaire > signup > command center).

- [ ] **Step 7: Final commit**

```powershell
git add -A
git commit -m "chore: finalize deploy configuration and env setup"
```
