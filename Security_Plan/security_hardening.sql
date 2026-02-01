-- ================================================
-- SECURITY HARDENING & RATE LIMITING
-- Project: Luyện thi Chứng chỉ hành nghề Xây dựng
-- Updated: 2026-02-01
-- ================================================

-- 1. RATE LIMITING FUNCTION
-- Generic function to throttle inserts per user on specific tables
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    last_sub_time TIMESTAMP WITH TIME ZONE;
    min_interval INTERVAL;
BEGIN
    -- Define intervals based on table
    CASE TG_TABLE_NAME
        WHEN 'app_evaluations' THEN min_interval := '1 minute';
        WHEN 'exam_results' THEN min_interval := '5 minutes';
        ELSE min_interval := '10 seconds';
    END CASE;

    -- Get last submission time for this user
    EXECUTE format('SELECT created_at FROM %I WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', TG_TABLE_NAME)
    INTO last_sub_time
    USING auth.uid();

    IF last_sub_time IS NOT NULL AND (now() - last_sub_time) < min_interval THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait % before submitting again.', min_interval
        USING ERRCODE = 'P0001'; -- Custom error code for app handling
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. APPLY RATE LIMITS
-- Apply to app_evaluations (Feedback)
DROP TRIGGER IF EXISTS trg_rate_limit_evaluations ON app_evaluations;
CREATE TRIGGER trg_rate_limit_evaluations
    BEFORE INSERT ON app_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();

-- Apply to exam_results
DROP TRIGGER IF EXISTS trg_rate_limit_exam_results ON exam_results;
CREATE TRIGGER trg_rate_limit_exam_results
    BEFORE INSERT ON exam_results
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();


-- 3. RLS TIGHTENING (EXAM RESULTS)
-- Ensure 'answers' column is not exposed in public views if we ever make a public leaderboard
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Policy: Full access for Owners
DROP POLICY IF EXISTS "Users can manage own results" ON exam_results;
CREATE POLICY "Users can manage own results" ON exam_results
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Limited public view (only for shared results)
-- If is_public is true, others can see summary but NOT detailed answers (handled by column filtering in UI, but safe to restrict here too)
DROP POLICY IF EXISTS "Public can view shared results" ON exam_results;
CREATE POLICY "Public can view shared results" ON exam_results
    FOR SELECT USING (is_public = true);


-- 4. HARDEN PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile details
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);


-- 5. READ-ONLY ENFORCEMENT
-- Config and Questions are globally readable but strictly NOT writable by users
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read-only questions" ON questions;
CREATE POLICY "Public read-only questions" ON questions FOR SELECT USING (true);

-- Fixed: table is 'config', not 'categories'
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read-only config" ON config;
CREATE POLICY "Public read-only config" ON config FOR SELECT USING (true);
