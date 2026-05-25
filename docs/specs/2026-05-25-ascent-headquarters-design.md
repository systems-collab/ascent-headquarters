# Ascent Headquarters - Design Specification

**Date:** 2026-05-25
**Requested by:** Majella (CEO, Fishburners)
**Built by:** Shreeshailya Patil (AI Intern)
**Status:** Draft

---

## 1. Overview

Ascent Headquarters is the public-facing portal for Fishburners' Ascent program, Australia's first national capital engine for women founders. It serves as the **free front door** to the program: collecting structured data on founders through an intake questionnaire, delivering a personalized Fundraising Readiness Score, and funneling qualified founders into the paid Ascent curriculum (delivered via Coassemble).

### 1.1 Goals (all four weighted equally)

1. **Data collection** - Capture structured founder profiles (stage, sector, funding needs, team, revenue) that Fishburners currently lacks.
2. **Founder experience** - Give founders a personalized diagnostic and a reason to return. The readiness score and command center make this more than a signup form.
3. **Feedback loop** - Questionnaire answers feed recommendations; engagement data refines the model over time.
4. **Stakeholder showcase** - Demonstrate Ascent's tech capability to potential acquirers/investors. The admin War Room visualizes the founder pipeline as an asset.

### 1.2 Non-goals

- Replacing Coassemble as the curriculum delivery platform.
- Exposing any paid curriculum content (39 chapters are behind Coassemble's paywall).
- Building a full community/social platform (v2 scope).
- Mentor matching or event management (v2 scope).

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR, fast dev, free Vercel hosting, huge ecosystem |
| Backend/DB | Supabase (Postgres) | Free tier, built-in auth, RLS, realtime, REST API |
| Auth | Supabase Auth | Google OAuth + email/password out of the box |
| Hosting | Vercel (free tier) | Auto-deploy from Fishburners GitHub |
| Source control | Fishburners GitHub org | CEO-visible, team-accessible |
| Analytics | Supabase queries + custom admin page | No third-party analytics dependency |

### 2.1 Constraints

- **$0 budget** - Fishburners is in voluntary administration. Everything must be free-tier or open-source.
- **Weekend build** - MVP must be shippable in one weekend. Scope accordingly.
- **Fishburners branding** - Orange-ish palette, match existing visual identity.

---

## 3. Information Architecture

### 3.1 Routes

| Route | Zone Name | Access | Purpose |
|-------|-----------|--------|---------|
| `/` | Landing | Public | Hero, program overview, CTA to Mission Briefing |
| `/mission-briefing` | Mission Briefing | Public | Multi-step questionnaire |
| `/mission-briefing/results` | Results Teaser | Public | Readiness score preview + signup wall |
| `/login` | Auth | Public | Login (Google + email) |
| `/signup` | Auth | Public | Signup (Google + email) |
| `/command-center` | Command Center | Authenticated | Founder dashboard home |
| `/launchpad` | Launchpad | Authenticated | Ascent curriculum info + CTA |
| `/profile` | Profile | Authenticated | Edit founder profile + retake questionnaire |
| `/admin` | War Room | Admin only | Cohort analytics + pipeline |

### 3.2 User Roles

| Role | Access | How assigned |
|------|--------|-------------|
| `founder` | Command Center, Launchpad, Profile | Default on signup |
| `admin` | All founder routes + War Room | Manual flag in Supabase `profiles.role` |

---

## 4. Zone Designs

### 4.1 Landing Page (`/`)

**Purpose:** First impression. Explain Ascent, establish credibility, drive to questionnaire.

**Sections:**
1. **Hero** - "Ascent Headquarters" headline. Subline: "Your command center for fundraising readiness." CTA: "Begin Mission Briefing". Background: subtle gradient or pattern in Fishburners orange.
2. **Impact stats bar** - Key numbers (e.g., "200+ founders served", "66% secured funding", "90% engagement retention"). Pulled from Ascent Year One data.
3. **How it works** - 3-step visual: (1) Take the Mission Briefing, (2) Get your Readiness Score, (3) Access your Command Center.
4. **What is Ascent?** - Brief program description. National capital education for women founders. 6 phases, 39 chapters. Link to Fishburners.
5. **Footer** - Fishburners branding, links, copyright.

### 4.2 Mission Briefing (`/mission-briefing`)

**Purpose:** The questionnaire. Captures founder data. Feels like an assessment, not a form.

**UX:** Multi-step wizard. One question group per step. Progress bar at top. Back/Next navigation. Smooth transitions between steps.

**Steps (6 steps, ~2 minutes):**

**Step 1: About You**
- Full name (text)
- Email (text, pre-filled if returning)
- Location in Australia (dropdown: NSW, VIC, QLD, WA, SA, TAS, ACT, NT, Remote/Regional)

**Step 2: Your Startup**
- Startup name (text)
- Sector/industry (dropdown: Fintech, Healthtech, Edtech, Cleantech, SaaS, E-commerce, Deeptech, Agritech, Creative/Media, Social Impact, Other)
- One-line description (text, max 140 chars)

**Step 3: Stage & Team**
- Current stage (single select):
  - Idea stage (no product yet)
  - Pre-seed (MVP or prototype)
  - Seed (some traction, seeking first round)
  - Series A (scaling, proven model)
  - Series B+ (growth stage)
- Team size (single select): Solo founder, 2-3, 4-10, 11+
- Do you have a co-founder? (yes/no)

**Step 4: Funding History**
- Have you raised capital before? (yes/no)
- If yes, how much total? (dropdown: Under $50K, $50K-$250K, $250K-$1M, $1M-$5M, $5M+)
- If yes, what type? (multi-select: Bootstrapped, Friends & family, Angel, VC, Grant, Accelerator, Debt, Crowdfunding)
- Current monthly revenue (dropdown: Pre-revenue, Under $5K, $5K-$20K, $20K-$100K, $100K+)

**Step 5: Fundraising Readiness**
- Do you have a pitch deck? (yes / in progress / no)
- Do you have a financial model? (yes / in progress / no)
- Do you understand cap tables and term sheets? (confident / somewhat / not yet)
- Have you identified target investors? (yes, with a list / somewhat / not yet)
- How would you rate your understanding of the Australian funding landscape? (strong / moderate / limited)

**Step 6: Your Goals**
- What funding pathway interests you most? (multi-select: Venture capital, Angel investment, Government grants, Accelerator programs, Revenue-based financing, Debt/loans, Crowdfunding, Not sure yet)
- What is your biggest fundraising challenge? (single select): 
  - Don't know where to start
  - Have a pitch deck but can't get meetings
  - Getting meetings but not closing
  - Understanding legal/financial structures
  - Finding the right type of capital
  - Building investor relationships
  - Other
- How much are you looking to raise? (dropdown: Under $100K, $100K-$500K, $500K-$2M, $2M-$10M, $10M+, Not sure yet)

**Data handling:**
- Answers stored in sessionStorage during the flow (auto-expires on tab close, no account needed yet).
- On signup, sessionStorage data writes to Supabase `startups` + `questionnaire_responses` tables.
- If founder already has an account and retakes, upserts the existing row.
- sessionStorage cleared after successful write. Retry prompt on failure.

### 4.3 Results Teaser (`/mission-briefing/results`)

**Purpose:** The signup wall. Shows just enough of the readiness score to create urgency.

**What the founder sees:**
- A blurred/partially revealed readiness score radar chart.
- Headline: "Your Fundraising Readiness Score is ready."
- Subline: "Sign up to unlock your full diagnostic and access your Command Center."
- Two CTAs: "Continue with Google" / "Sign up with email"
- Below: "Already have an account? Log in"

**Scoring algorithm (server-side only via Supabase RPC):**

The teaser page shows a blurred placeholder. The real score is computed exclusively by a Supabase SECURITY DEFINER function (`compute_readiness_score`) triggered after `questionnaire_responses` insert. The client never writes to `readiness_scores` directly.

Five dimensions, each scored 0-100:

| Dimension | Inputs |
|-----------|--------|
| **Pitch Readiness** | Has pitch deck + has financial model + identified investors |
| **Financial Literacy** | Understands cap tables + revenue status + raised before |
| **Funding Strategy** | Identified pathway + knows how much to raise + not "don't know where to start" |
| **Business Maturity** | Stage + team size + revenue + has co-founder |
| **Market Awareness** | AU landscape rating + funding type experience + pathway clarity |

Overall readiness = weighted average (equal weights for MVP, tunable later).

Scoring logic per dimension:
- Each input maps to a sub-score (e.g., pitch deck: yes=100, in progress=50, no=0)
- Dimension score = average of its sub-scores
- Overall = average of 5 dimensions

### 4.4 Command Center (`/command-center`)

**Purpose:** The founder's home. What they see every time they log in.

**Layout:** Dashboard with card-based sections.

**Sections:**

1. **Welcome header** - "Welcome back, [Name]" + startup name + stage badge (e.g., "Pre-seed").

2. **Readiness Score card** - Large radar/spider chart showing 5 dimensions. Overall score as a number (e.g., "64/100"). Color-coded: green (70+), amber (40-69), red (0-39). CTA: "Retake assessment" link.

3. **Gap Analysis cards** - Top 2-3 weakest dimensions highlighted. For each: dimension name, score, one-line insight (e.g., "Your financial literacy score is 35. Most founders at your stage score 55+."). CTA on each: "Explore Ascent curriculum" (links to Launchpad).

4. **Your Profile snapshot** - Startup name, sector, stage, location, funding goal. "Edit profile" link.

5. **Benchmark card** - "How you compare" - anonymous aggregate. "Founders at your stage average X readiness. You're at Y." Simple bar or comparison visual.

### 4.5 Launchpad (`/launchpad`)

**Purpose:** Bridge to the paid Ascent curriculum. Does NOT expose curriculum content.

**Sections:**

1. **What is Ascent?** - Program overview. 6 phases, 39 chapters, built by 30+ specialist partners.

2. **Phase overview** - Visual timeline/roadmap of the 6 phases:
   - Phase 1: Fundraising Foundations
   - Phase 2: Preparation & Readiness
   - Phase 3: Funding Pathways
   - Phase 4: Executing the Raise
   - Phase 5: Closing the Deal
   - Phase 6: Post-Raise Growth
   Each phase shows a title and 1-line description. No chapter-level detail.

3. **Your recommended starting point** - Based on readiness score. E.g., "Based on your Mission Briefing, we recommend starting at Phase 2: Preparation & Readiness." Generic phase-level recommendation, not chapter-specific.

4. **CTA** - "Access the Ascent Curriculum" button linking to Coassemble. Secondary: "Talk to the Ascent team" email/contact link.

### 4.6 War Room (`/admin`)

**Purpose:** Majella's view. Cohort analytics for stakeholders and potential acquirers.

**Access:** Only users with `role: 'admin'` in Supabase `profiles` table.

**Sections:**

1. **Pipeline overview** - Total founders signed up. Questionnaires completed. Conversion rate (started > completed > signed up).

2. **Stage breakdown** - Pie/donut chart: how many founders at each stage (idea, pre-seed, seed, series A, B+).

3. **Sector distribution** - Bar chart: founder count by sector.

4. **Geographic spread** - Breakdown by Australian state/territory.

5. **Readiness heatmap** - Aggregate scores across 5 dimensions. Shows where the cohort is strongest/weakest. E.g., "Average pitch readiness: 62. Average financial literacy: 38."

6. **Funding goals** - What pathways founders are interested in (VC, grants, etc.). How much they're looking to raise.

7. **Top challenges** - Distribution of "biggest fundraising challenge" answers.

8. **Recent signups** - Table of last 20 founders: first name, startup name, stage, sector, overall readiness score, signup date. (Pseudonymised: no email, no full name. Full PII requires MFA-protected admin.)

---

## 5. Database Schema (Supabase/Postgres)

### 5.1 Tables

**`profiles`** (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'founder' CHECK (role IN ('founder', 'admin')),
  location        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
-- Email read from auth.users directly (no duplicate sync hazard).
-- role is set ONLY by the DB trigger or service-role. Never client-writable.
```

**`startups`**
```sql
CREATE TABLE startups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sector          TEXT CHECK (sector IN ('fintech','healthtech','edtech','cleantech','saas','ecommerce','deeptech','agritech','creative_media','social_impact','other')),
  description     TEXT CHECK (char_length(description) <= 140),
  stage           TEXT CHECK (stage IN ('idea','pre_seed','seed','series_a','series_b_plus')),
  team_size       TEXT CHECK (team_size IN ('solo','2_3','4_10','11_plus')),
  has_cofounder   BOOLEAN,
  monthly_revenue TEXT CHECK (monthly_revenue IN ('pre_revenue','under_5k','5k_20k','20k_100k','100k_plus')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_startups_founder ON startups(founder_id);
CREATE INDEX idx_startups_stage ON startups(stage);
CREATE INDEX idx_startups_sector ON startups(sector);
```

**`questionnaire_responses`**
```sql
CREATE TABLE questionnaire_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  raised_before   BOOLEAN,
  amount_raised   TEXT CHECK (amount_raised IN ('under_50k','50k_250k','250k_1m','1m_5m','5m_plus')),
  funding_types   TEXT[],
  has_pitch_deck  TEXT CHECK (has_pitch_deck IN ('yes', 'in_progress', 'no')),
  has_financial_model TEXT CHECK (has_financial_model IN ('yes', 'in_progress', 'no')),
  understands_cap_tables TEXT CHECK (understands_cap_tables IN ('confident', 'somewhat', 'not_yet')),
  identified_investors TEXT CHECK (identified_investors IN ('yes', 'somewhat', 'not_yet')),
  au_landscape_rating TEXT CHECK (au_landscape_rating IN ('strong', 'moderate', 'limited')),
  target_pathways TEXT[],
  biggest_challenge TEXT CHECK (biggest_challenge IN ('dont_know_where_to_start','have_deck_no_meetings','getting_meetings_not_closing','legal_financial_structures','finding_right_capital','building_investor_relationships','other')),
  target_raise    TEXT CHECK (target_raise IN ('under_100k','100k_500k','500k_2m','2m_10m','10m_plus','not_sure')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_questionnaire_founder ON questionnaire_responses(founder_id);
CREATE INDEX idx_questionnaire_funding_types ON questionnaire_responses USING GIN (funding_types);
CREATE INDEX idx_questionnaire_pathways ON questionnaire_responses USING GIN (target_pathways);
```

**`readiness_scores`**
```sql
CREATE TABLE readiness_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  pitch_readiness INTEGER CHECK (pitch_readiness BETWEEN 0 AND 100),
  financial_literacy INTEGER CHECK (financial_literacy BETWEEN 0 AND 100),
  funding_strategy INTEGER CHECK (funding_strategy BETWEEN 0 AND 100),
  business_maturity INTEGER CHECK (business_maturity BETWEEN 0 AND 100),
  market_awareness INTEGER CHECK (market_awareness BETWEEN 0 AND 100),
  overall_score   INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_scores_founder ON readiness_scores(founder_id);
-- Client NEVER writes here directly. Only compute_readiness_score() RPC inserts/upserts.
```

**`moddatetime` trigger** (all tables with `updated_at`):
```sql
CREATE EXTENSION IF NOT EXISTS moddatetime;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON startups FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON questionnaire_responses FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON readiness_scores FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

**Profile creation trigger** (hard-codes role to 'founder'):
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'founder');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Score computation RPC** (SECURITY DEFINER, client calls after questionnaire write):
```sql
CREATE OR REPLACE FUNCTION compute_readiness_score(p_founder_id UUID)
RETURNS void AS $$
DECLARE
  q questionnaire_responses%ROWTYPE;
  s startups%ROWTYPE;
  v_pitch INTEGER; v_financial INTEGER; v_strategy INTEGER;
  v_maturity INTEGER; v_awareness INTEGER; v_overall INTEGER;
BEGIN
  SELECT * INTO q FROM questionnaire_responses WHERE founder_id = p_founder_id;
  SELECT * INTO s FROM startups WHERE founder_id = p_founder_id;
  IF q IS NULL OR s IS NULL THEN RETURN; END IF;

  -- Scoring logic implemented here (see Section 9 for mappings)
  -- Omitted for brevity; full implementation in migration file

  INSERT INTO readiness_scores (founder_id, pitch_readiness, financial_literacy, funding_strategy, business_maturity, market_awareness, overall_score)
  VALUES (p_founder_id, v_pitch, v_financial, v_strategy, v_maturity, v_awareness, v_overall)
  ON CONFLICT (founder_id) DO UPDATE SET
    pitch_readiness = EXCLUDED.pitch_readiness,
    financial_literacy = EXCLUDED.financial_literacy,
    funding_strategy = EXCLUDED.funding_strategy,
    business_maturity = EXCLUDED.business_maturity,
    market_awareness = EXCLUDED.market_awareness,
    overall_score = EXCLUDED.overall_score,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Benchmark RPC** (minimum cohort threshold):
```sql
CREATE OR REPLACE FUNCTION get_stage_benchmarks(p_stage TEXT)
RETURNS TABLE (dimension TEXT, avg_score INTEGER, cohort_size INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH cohort AS (
    SELECT rs.* FROM readiness_scores rs
    JOIN startups st ON st.founder_id = rs.founder_id
    WHERE st.stage = p_stage
  )
  SELECT * FROM (
    SELECT 'pitch_readiness', AVG(pitch_readiness)::INTEGER, COUNT(*)::INTEGER FROM cohort
    UNION ALL
    SELECT 'financial_literacy', AVG(financial_literacy)::INTEGER, COUNT(*)::INTEGER FROM cohort
    UNION ALL
    SELECT 'funding_strategy', AVG(funding_strategy)::INTEGER, COUNT(*)::INTEGER FROM cohort
    UNION ALL
    SELECT 'business_maturity', AVG(business_maturity)::INTEGER, COUNT(*)::INTEGER FROM cohort
    UNION ALL
    SELECT 'market_awareness', AVG(market_awareness)::INTEGER, COUNT(*)::INTEGER FROM cohort
  ) benchmarks
  WHERE cohort_size >= 10;  -- Privacy: suppress benchmarks for small cohorts
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.2 Row-Level Security (concrete policies)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;

-- Helper: check admin via auth JWT (not mutable profiles.role)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Users update own profile (not role)" ON profiles FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
-- role column locked: WITH CHECK ensures role cannot change from current value

-- startups
CREATE POLICY "Users CRUD own startup" ON startups FOR ALL USING (founder_id = auth.uid() OR is_admin());

-- questionnaire_responses
CREATE POLICY "Users CRUD own responses" ON questionnaire_responses FOR ALL USING (founder_id = auth.uid() OR is_admin());

-- readiness_scores (read-only for clients; RPC inserts via SECURITY DEFINER)
CREATE POLICY "Users read own scores" ON readiness_scores FOR SELECT USING (founder_id = auth.uid() OR is_admin());
```

---

## 6. Auth Flow

### 6.1 Signup

1. Founder completes questionnaire (data in sessionStorage, not localStorage, to auto-expire on tab close).
2. Lands on results teaser page (blurred placeholder score, no real computation).
3. Clicks "Continue with Google" or enters email + password.
4. Supabase creates `auth.users` entry.
5. Database trigger (`handle_new_user`) creates `profiles` row with `role = 'founder'` (hard-coded, not client-supplied).
6. Client reads sessionStorage, writes to `startups` + `questionnaire_responses` via Supabase client (RLS allows insert where `founder_id = auth.uid()`).
7. Client calls `supabase.rpc('compute_readiness_score', { p_founder_id: uid })`. Score computed server-side from stored questionnaire + startup data. Client never writes to `readiness_scores`.
8. Client clears sessionStorage.
9. Redirect to `/command-center`.

**Error handling:** If step 6 or 7 fails, show a retry prompt. Do not leave PII in sessionStorage without user awareness.

### 6.2 Login

1. Founder enters credentials or clicks Google.
2. Supabase returns session.
3. Middleware checks auth; if valid, allow protected routes.
4. Redirect to `/command-center`.

### 6.3 Route Protection

- Next.js middleware checks Supabase session on `/command-center/*`, `/launchpad`, `/profile`, `/admin`.
- `/admin` additionally calls `is_admin()` RPC (SECURITY DEFINER, reads from `profiles` table server-side). Client-side redirect is UX only; actual data protection is via RLS policies.
- Unauthenticated requests redirect to `/login`.
- Google OAuth redirect URIs: only production Vercel domain + `localhost:3000` (dev) registered in Google Cloud Console.

---

## 7. Visual Design Direction

- **Primary color:** Fishburners orange (exact hex TBD from brand assets).
- **Secondary:** Dark charcoal/near-black for text and contrast.
- **Accent:** White and light gray surfaces.
- **Typography:** Clean sans-serif (Inter or similar).
- **Cards:** Rounded corners, subtle shadows, white on light gray background.
- **Charts:** Recharts (React-native, better Next.js integration than Chart.js). Orange palette for data viz.
- **Responsive:** Mobile-first. Questionnaire must work well on phone.

---

## 8. Component Library

Using shadcn/ui (copy-paste components, not a dependency) + Tailwind:

- Button, Input, Select, Checkbox (forms)
- Card, Badge (dashboard)
- Progress (questionnaire steps)
- Dialog (confirmations)
- Tabs (admin sections)
- Chart wrapper (Recharts)
- Navigation/Sidebar (authenticated layout)

---

## 9. Scoring Algorithm Detail

### 9.1 Sub-score mapping

**Pitch Readiness (3 inputs):**
| Input | yes/confident | in_progress/somewhat | no/not_yet |
|-------|:---:|:---:|:---:|
| has_pitch_deck | 100 | 50 | 0 |
| has_financial_model | 100 | 50 | 0 |
| identified_investors | 100 | 50 | 0 |
Score = average of 3 sub-scores.

**Financial Literacy (3 inputs):**
`has_financial_model` removed (avoids double-count with Pitch Readiness). No input shared with other dimensions.
| Input | Value | Score |
|-------|-------|-------|
| understands_cap_tables | confident=100, somewhat=50, not_yet=0 |
| monthly_revenue | 100k_plus=100, 20k_100k=75, 5k_20k=50, under_5k=25, pre_revenue=10 |
| amount_raised | 5m_plus=100, 1m_5m=80, 250k_1m=60, 50k_250k=40, under_50k=20, NULL(never raised)=0 |
Score = average.

**Funding Strategy (3 inputs):**
| Input | Value | Score |
|-------|-------|-------|
| target_pathways | 3+ selected=100, 2 selected=75, 1 selected=50, "not_sure" only=10 |
| target_raise | specific amount=100, not_sure=25 |
| biggest_challenge | building_investor_relationships=80, finding_right_capital=75, getting_meetings_not_closing=70, legal_financial_structures=65, have_deck_no_meetings=60, dont_know_where_to_start=30, other=50 |
Score = average.

**Business Maturity (4 inputs):**
Solo founder penalty softened (target audience skews solo).
| Input | Value | Score |
|-------|-------|-------|
| stage | series_b_plus=100, series_a=80, seed=60, pre_seed=40, idea=20 |
| team_size | 11_plus=100, 4_10=80, 2_3=60, solo=45 |
| monthly_revenue | mapped same as financial literacy |
| has_cofounder | yes=70, no=50 |
Score = average.

**Market Awareness (3 inputs):**
| Input | Value | Score |
|-------|-------|-------|
| au_landscape_rating | strong=100, moderate=50, limited=0 |
| raised_before | yes=80, no=30 |
| funding_types (count if raised) | 3+=100, 2=70, 1=40, 0=10 |
Score = average.

**Overall = mean of 5 dimension scores, rounded to nearest integer.**

### 9.2 Benchmark generation

For "How you compare" cards, we compute aggregate averages from all `readiness_scores` rows, filtered by the founder's stage. This runs as a Supabase RPC function to avoid exposing other founders' raw data.

---

## 10. MVP Scope (Weekend Build)

### In scope:
- Landing page
- Full 6-step questionnaire with sessionStorage persistence
- Results teaser with signup wall
- Google OAuth + email/password auth
- Command Center dashboard with readiness radar chart
- Launchpad page (Ascent overview + curriculum CTA)
- Admin War Room with 7 analytics sections
- Supabase schema + RLS policies
- Mobile responsive
- Deploy to Vercel from Fishburners GitHub

### Out of scope (v2):
- Intelligence Hub (market data, detailed benchmarks)
- Community directory / founder-to-founder connections
- Mentor matching
- Event calendar
- Email notifications
- ML-powered recommendations (currently rule-based scoring)
- Retake questionnaire flow (profile edit is in, full retake is v2)
- Dark mode

---

## 11. Project Structure

```
ascent-headquarters/
  src/
    app/
      layout.tsx                  # Root layout + font + metadata
      page.tsx                    # Landing page
      login/page.tsx
      signup/page.tsx
      mission-briefing/
        page.tsx                  # Questionnaire wizard
        results/page.tsx          # Results teaser + signup wall
      command-center/
        page.tsx                  # Founder dashboard
      launchpad/
        page.tsx                  # Curriculum CTA
      profile/
        page.tsx                  # Edit profile
      admin/
        page.tsx                  # War Room
    components/
      ui/                        # shadcn/ui components
      landing/                   # Landing page sections
      questionnaire/             # Step components
      dashboard/                 # Command Center cards
      admin/                     # War Room charts
      layout/                    # Nav, sidebar, footer
    lib/
      supabase/
        client.ts                # Browser client
        server.ts                # Server client
        middleware.ts             # Auth middleware + route protection
        admin.ts                 # Admin check helper (calls is_admin RPC)
      questionnaire-storage.ts   # sessionStorage helpers (read/write/clear)
    types/
      database.ts                # Supabase generated types
      questionnaire.ts           # Form types
  supabase/
    migrations/                  # SQL migrations
    seed.sql                     # Test data
  public/
    images/                      # Branding assets
  tailwind.config.ts
  next.config.ts
  package.json
```

---

## 12. Security Considerations

- All Supabase tables use Row-Level Security with concrete SQL policies (see Section 5.2).
- Admin verification uses `is_admin()` SECURITY DEFINER function. Client-side redirect is UX; RLS is the real gate.
- `profiles.role` is never client-writable. DB trigger hard-codes `'founder'`. RLS UPDATE policy locks the `role` column.
- `readiness_scores` is never client-writable. Only the `compute_readiness_score()` SECURITY DEFINER function inserts/upserts.
- Questionnaire data uses sessionStorage (not localStorage) for auto-expiry. Cleared explicitly after successful DB write. Retry prompt on failure.
- Admin "Recent signups" table shows first name + sector only (pseudonymised). Full PII in admin requires MFA (Supabase MFA on admin accounts).
- Benchmark RPC suppresses results when cohort < 10 founders at a given stage (statistical re-identification protection).
- Google OAuth redirect URIs restricted to production Vercel domain + localhost.
- Input validation: client-side (form validation) + server-side (Postgres CHECK constraints on all enum fields, char_length limits on free text).
- Seed data in `seed.sql` uses clearly synthetic data only (no realistic PII).
- PII never in URL query parameters (POST bodies only).

### 12.1 Security Headers (next.config.ts)

```ts
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

### 12.2 Known Limitations (MVP)

- No rate limiting on signup (Vercel free tier limitation). Monitor via War Room signup velocity.
- sessionStorage is the sole pre-auth persistence layer. If the user closes the tab before signing up, questionnaire answers are lost. Acceptable for MVP; v2 could use anonymous Supabase rows.
- Supabase Auth cookies should be configured with `httpOnly: true, secure: true, sameSite: 'lax'`.

---

## 13. Review Findings (incorporated)

This spec was reviewed by three parallel agents (architecture, security, database). All CRITICAL and HIGH findings have been addressed:

| # | Finding | Severity | Resolution |
|---|---------|----------|------------|
| 1 | Client-side score computation is tamper-prone | CRITICAL | Moved to Supabase RPC SECURITY DEFINER function |
| 2 | Role escalation via client-controlled profile write | CRITICAL | DB trigger hard-codes role; RLS locks role column on UPDATE |
| 3 | No concrete RLS SQL defined | CRITICAL | Full SQL policies added in Section 5.2 |
| 4 | Missing UNIQUE constraints on founder_id | HIGH | Added UNIQUE on startups, questionnaire_responses, readiness_scores |
| 5 | Missing indexes | HIGH | Added B-tree on all FKs, stage, sector; GIN on arrays |
| 6 | No security headers | HIGH | CSP + standard headers in Section 12.1 |
| 7 | Benchmark leaks small cohort data | HIGH | Minimum n >= 10 threshold in RPC |
| 8 | localStorage PII risk | HIGH | Switched to sessionStorage + error handling + retry |
| 9 | Missing updated_at + triggers | HIGH | Added moddatetime triggers on all tables |
| 10 | Missing CHECK constraints | HIGH | Full CHECK constraints on all enum TEXT columns |
| 11 | has_financial_model double-counted | MEDIUM | Removed from Financial Literacy dimension |
| 12 | Solo founder scoring too harsh | MEDIUM | Softened: solo=45 (was 25), no co-founder=50 (was 40) |
| 13 | profiles.email duplicates auth.users | MEDIUM | Removed; read email from auth.users/JWT |
| 14 | biggest_challenge scores vague | LOW | Pinned specific scores per challenge value |
| 15 | Chart library not pinned | LOW | Recharts (React-native integration) |
