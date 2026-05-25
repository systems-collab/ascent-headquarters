-- =============================================================
-- Ascent Headquarters: Initial Schema Migration
-- =============================================================

-- 1. Extensions
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 2. Tables
-- -------------------------------------------------------------

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'founder' CHECK (role IN ('founder', 'admin')),
  location        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE questionnaire_responses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id            UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  raised_before         BOOLEAN,
  amount_raised         TEXT CHECK (amount_raised IN ('under_50k','50k_250k','250k_1m','1m_5m','5m_plus')),
  funding_types         TEXT[] DEFAULT '{}',
  has_pitch_deck        TEXT CHECK (has_pitch_deck IN ('yes','in_progress','no')),
  has_financial_model   TEXT CHECK (has_financial_model IN ('yes','in_progress','no')),
  understands_cap_tables TEXT CHECK (understands_cap_tables IN ('confident','somewhat','not_yet')),
  identified_investors  TEXT CHECK (identified_investors IN ('yes','somewhat','not_yet')),
  au_landscape_rating   TEXT CHECK (au_landscape_rating IN ('strong','moderate','limited')),
  target_pathways       TEXT[] DEFAULT '{}',
  biggest_challenge     TEXT CHECK (biggest_challenge IN ('dont_know_where_to_start','have_deck_no_meetings','getting_meetings_not_closing','legal_financial_structures','finding_right_capital','building_investor_relationships','other')),
  target_raise          TEXT CHECK (target_raise IN ('under_100k','100k_500k','500k_2m','2m_10m','10m_plus','not_sure')),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE readiness_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id        UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  pitch_readiness   INTEGER NOT NULL CHECK (pitch_readiness BETWEEN 0 AND 100),
  financial_literacy INTEGER NOT NULL CHECK (financial_literacy BETWEEN 0 AND 100),
  funding_strategy  INTEGER NOT NULL CHECK (funding_strategy BETWEEN 0 AND 100),
  business_maturity INTEGER NOT NULL CHECK (business_maturity BETWEEN 0 AND 100),
  market_awareness  INTEGER NOT NULL CHECK (market_awareness BETWEEN 0 AND 100),
  overall_score     INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
-- -------------------------------------------------------------

CREATE INDEX idx_startups_founder ON startups(founder_id);
CREATE INDEX idx_startups_stage ON startups(stage);
CREATE INDEX idx_startups_sector ON startups(sector);
CREATE INDEX idx_questionnaire_founder ON questionnaire_responses(founder_id);
CREATE INDEX idx_questionnaire_pathways ON questionnaire_responses USING GIN (target_pathways);
CREATE INDEX idx_questionnaire_funding_types ON questionnaire_responses USING GIN (funding_types);
CREATE INDEX idx_scores_founder ON readiness_scores(founder_id);
CREATE INDEX idx_scores_overall ON readiness_scores(overall_score);

-- 4. Moddatetime triggers
-- -------------------------------------------------------------

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON startups
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON readiness_scores
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- 5. handle_new_user() trigger on auth.users INSERT
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'founder'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. compute_readiness_score(p_founder_id UUID) RPC
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION compute_readiness_score(p_founder_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  q public.questionnaire_responses%ROWTYPE;
  s public.startups%ROWTYPE;
  v_pitch INTEGER;
  v_financial INTEGER;
  v_strategy INTEGER;
  v_maturity INTEGER;
  v_awareness INTEGER;
  v_overall INTEGER;
BEGIN
  SELECT * INTO q FROM public.questionnaire_responses WHERE founder_id = p_founder_id;
  SELECT * INTO s FROM public.startups WHERE founder_id = p_founder_id;

  IF q IS NULL OR s IS NULL THEN RETURN; END IF;

  v_pitch := (
    CASE q.has_pitch_deck WHEN 'yes' THEN 100 WHEN 'in_progress' THEN 50 ELSE 0 END +
    CASE q.has_financial_model WHEN 'yes' THEN 100 WHEN 'in_progress' THEN 50 ELSE 0 END +
    CASE q.identified_investors WHEN 'yes' THEN 100 WHEN 'somewhat' THEN 50 ELSE 0 END
  ) / 3;

  v_financial := (
    CASE q.understands_cap_tables WHEN 'confident' THEN 100 WHEN 'somewhat' THEN 50 ELSE 0 END +
    CASE s.monthly_revenue WHEN '100k_plus' THEN 100 WHEN '20k_100k' THEN 75 WHEN '5k_20k' THEN 50 WHEN 'under_5k' THEN 25 ELSE 10 END +
    CASE q.amount_raised WHEN '5m_plus' THEN 100 WHEN '1m_5m' THEN 80 WHEN '250k_1m' THEN 60 WHEN '50k_250k' THEN 40 WHEN 'under_50k' THEN 20 ELSE 0 END
  ) / 3;

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

  v_maturity := (
    CASE s.stage WHEN 'series_b_plus' THEN 100 WHEN 'series_a' THEN 80 WHEN 'seed' THEN 60 WHEN 'pre_seed' THEN 40 ELSE 20 END +
    CASE s.team_size WHEN '11_plus' THEN 100 WHEN '4_10' THEN 80 WHEN '2_3' THEN 60 ELSE 45 END +
    CASE s.monthly_revenue WHEN '100k_plus' THEN 100 WHEN '20k_100k' THEN 75 WHEN '5k_20k' THEN 50 WHEN 'under_5k' THEN 25 ELSE 10 END +
    CASE WHEN s.has_cofounder THEN 70 ELSE 50 END
  ) / 4;

  v_awareness := (
    CASE q.au_landscape_rating WHEN 'strong' THEN 100 WHEN 'moderate' THEN 50 ELSE 0 END +
    CASE WHEN q.raised_before THEN 80 ELSE 30 END +
    CASE WHEN array_length(q.funding_types, 1) >= 3 THEN 100
         WHEN array_length(q.funding_types, 1) = 2 THEN 70
         WHEN array_length(q.funding_types, 1) = 1 THEN 40
         ELSE 10 END
  ) / 3;

  v_overall := (v_pitch + v_financial + v_strategy + v_maturity + v_awareness) / 5;

  INSERT INTO public.readiness_scores (founder_id, pitch_readiness, financial_literacy, funding_strategy, business_maturity, market_awareness, overall_score)
  VALUES (p_founder_id, v_pitch, v_financial, v_strategy, v_maturity, v_awareness, v_overall)
  ON CONFLICT (founder_id) DO UPDATE SET
    pitch_readiness = EXCLUDED.pitch_readiness,
    financial_literacy = EXCLUDED.financial_literacy,
    funding_strategy = EXCLUDED.funding_strategy,
    business_maturity = EXCLUDED.business_maturity,
    market_awareness = EXCLUDED.market_awareness,
    overall_score = EXCLUDED.overall_score;
END;
$$;

-- 7. get_stage_benchmarks(p_stage TEXT) RPC
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_stage_benchmarks(p_stage TEXT)
RETURNS TABLE (
  avg_pitch_readiness INTEGER,
  avg_financial_literacy INTEGER,
  avg_funding_strategy INTEGER,
  avg_business_maturity INTEGER,
  avg_market_awareness INTEGER,
  avg_overall INTEGER,
  cohort_size INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.startups WHERE stage = p_stage;

  IF v_count < 10 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    AVG(rs.pitch_readiness)::INTEGER,
    AVG(rs.financial_literacy)::INTEGER,
    AVG(rs.funding_strategy)::INTEGER,
    AVG(rs.business_maturity)::INTEGER,
    AVG(rs.market_awareness)::INTEGER,
    AVG(rs.overall_score)::INTEGER,
    v_count
  FROM public.readiness_scores rs
  JOIN public.startups s ON s.founder_id = rs.founder_id
  WHERE s.stage = p_stage;
END;
$$;

-- 8. is_admin() helper
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER STABLE SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 9. Row Level Security
-- -------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Startups
CREATE POLICY "Users can read own startup" ON startups FOR SELECT USING (auth.uid() = founder_id);
CREATE POLICY "Admins can read all startups" ON startups FOR SELECT USING (is_admin());
CREATE POLICY "Users can insert own startup" ON startups FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Users can update own startup" ON startups FOR UPDATE USING (auth.uid() = founder_id);

-- Questionnaire responses
CREATE POLICY "Users can read own responses" ON questionnaire_responses FOR SELECT USING (auth.uid() = founder_id);
CREATE POLICY "Admins can read all responses" ON questionnaire_responses FOR SELECT USING (is_admin());
CREATE POLICY "Users can insert own responses" ON questionnaire_responses FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Users can update own responses" ON questionnaire_responses FOR UPDATE USING (auth.uid() = founder_id);

-- Readiness scores (read-only for clients)
CREATE POLICY "Users can read own scores" ON readiness_scores FOR SELECT USING (auth.uid() = founder_id);
CREATE POLICY "Admins can read all scores" ON readiness_scores FOR SELECT USING (is_admin());

-- 10. Explicit EXECUTE grants on RPC functions
-- -------------------------------------------------------------
-- SECURITY DEFINER functions still need EXECUTE granted to the role that
-- calls them. Keep these explicit so the migration is portable across
-- projects where the default GRANT behaviour may differ.

GRANT EXECUTE ON FUNCTION compute_readiness_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_stage_benchmarks(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
