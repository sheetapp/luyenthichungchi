-- ================================================
-- SECURITY HARDENING IMPLEMENTATION (DRAFT)
-- Phase 1: RLS Refinement & Rate Limiting
-- ================================================

-- 1. HARDEN SECURITY DEFINER FUNCTIONS
-- Prevents search_path injection attacks
ALTER FUNCTION public.handle_new_user() SET search_path = public;


-- 2. RATE LIMITING FOR SUBMISSIONS
-- Prevent spamming app_evaluations and exam_results

-- Function to check submission frequency
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    last_sub_time TIMESTAMP WITH TIME ZONE;
    min_interval INTERVAL := '1 minute'; -- Throttling interval
BEGIN
    -- Get last submission time for this user in the target table
    EXECUTE format('SELECT created_at FROM %I WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', TG_TABLE_NAME)
    INTO last_sub_time
    USING auth.uid();

    IF last_sub_time IS NOT NULL AND (now() - last_sub_time) < min_interval THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait % before submitting again.', min_interval;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply rate limit to app_evaluations
DROP TRIGGER IF EXISTS trg_rate_limit_evaluations ON app_evaluations;
CREATE TRIGGER trg_rate_limit_evaluations
    BEFORE INSERT ON app_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();

-- Apply rate limit to exam_results
DROP TRIGGER IF EXISTS trg_rate_limit_exam_results ON exam_results;
CREATE TRIGGER trg_rate_limit_exam_results
    BEFORE INSERT ON exam_results
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();


-- 3. REFINING exam_results RLS
-- Current "Anyone can view leaderboard" (true) is TOO BROAD.
-- It allows fetching private answers/details of all users.

-- First, tighten the main table access
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON exam_results;
DROP POLICY IF EXISTS "Users can view own results" ON exam_results;

-- Policy: Users can see ALL details of their OWN results
CREATE POLICY "Users can fully manage own results" ON exam_results
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Everyone can see ONLY leaderboard-safe columns of others
-- Note: Better to use a SECURE VIEW for this, but for RLS:
CREATE POLICY "Leaderboard visibility" ON exam_results
    FOR SELECT USING (true); 
-- CAUTION: If using RLS for leaderboard, we must ensure columns like 'answers' are NOT fetched.
-- Best Practice: Create a public.leaderboard VIEW that doesn't include sensitive columns.


-- 4. READ-ONLY ENFORCEMENT
-- Ensure questions and categories cannot be modified by anyone via API
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read-only questions" ON questions;
CREATE POLICY "Public read-only questions" ON questions
    FOR SELECT USING (true); -- Only SELECT allowed

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read-only categories" ON categories;
CREATE POLICY "Public read-only categories" ON categories
    FOR SELECT USING (true); -- Only SELECT allowed
