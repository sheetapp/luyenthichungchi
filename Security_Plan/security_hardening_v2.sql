-- ================================================
-- SECURITY HARDENING V2 - DoS & SPAM PROTECTION
-- Project: Luyện thi Chứng chỉ hành nghề Xây dựng
-- Updated: 2026-02-02
-- Changes: Added rate limiting for all tables, size constraints
-- ================================================

-- 1. ENHANCED RATE LIMITING FUNCTION
-- Generic function with configurable intervals per table
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    last_sub_time TIMESTAMP WITH TIME ZONE;
    min_interval INTERVAL;
    operation_type TEXT;
BEGIN
    -- Determine operation type (INSERT vs UPDATE)
    operation_type := TG_OP;
    
    -- Define intervals based on table and operation
    CASE TG_TABLE_NAME
        WHEN 'app_evaluations' THEN 
            min_interval := '5 minutes'; -- UPDATED from 1 minute per user request
        WHEN 'exam_results' THEN 
            min_interval := '5 minutes';
        WHEN 'user_practice_stats' THEN 
            min_interval := '10 seconds'; -- NEW: Prevent rapid sync flooding
        WHEN 'profiles' THEN 
            IF operation_type = 'UPDATE' THEN
                min_interval := '30 seconds'; -- NEW: Prevent profile spam
            ELSE
                min_interval := '0 seconds'; -- Allow INSERT (first time)
            END IF;
        ELSE 
            min_interval := '10 seconds';
    END CASE;

    -- Skip check if interval is 0
    IF min_interval = '0 seconds' THEN
        RETURN NEW;
    END IF;

    -- Get last submission time for this user
    IF operation_type = 'INSERT' THEN
        EXECUTE format('SELECT created_at FROM %I WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', TG_TABLE_NAME)
        INTO last_sub_time
        USING auth.uid();
    ELSE -- UPDATE
        EXECUTE format('SELECT updated_at FROM %I WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1', TG_TABLE_NAME)
        INTO last_sub_time
        USING auth.uid();
    END IF;

    IF last_sub_time IS NOT NULL AND (now() - last_sub_time) < min_interval THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait % before submitting again.', min_interval
        USING ERRCODE = 'P0001'; -- Custom error code for app handling
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. APPLY RATE LIMITS TO ALL TABLES

-- app_evaluations (Feedback) - 5 minutes
DROP TRIGGER IF EXISTS trg_rate_limit_evaluations ON app_evaluations;
CREATE TRIGGER trg_rate_limit_evaluations
    BEFORE INSERT ON app_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();

-- exam_results (Exam Submission) - 5 minutes
DROP TRIGGER IF EXISTS trg_rate_limit_exam_results ON exam_results;
CREATE TRIGGER trg_rate_limit_exam_results
    BEFORE INSERT ON exam_results
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();

-- user_practice_stats (Practice Sync) - 10 seconds
DROP TRIGGER IF EXISTS trg_rate_limit_practice_stats ON user_practice_stats;
CREATE TRIGGER trg_rate_limit_practice_stats
    BEFORE INSERT OR UPDATE ON user_practice_stats
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();

-- profiles (Profile Updates) - 30 seconds
DROP TRIGGER IF EXISTS trg_rate_limit_profiles ON profiles;
CREATE TRIGGER trg_rate_limit_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_submission_rate_limit();


-- 3. SIZE CONSTRAINTS TO PREVENT MEMORY FLOODING

-- Limit practice history JSONB size to 1 MB
ALTER TABLE user_practice_stats 
DROP CONSTRAINT IF EXISTS history_size_limit;

ALTER TABLE user_practice_stats 
ADD CONSTRAINT history_size_limit 
CHECK (pg_column_size(history) < 1048576); -- 1 MB limit

-- Limit exam answers JSONB size to 100 KB (30 questions should be ~10-20 KB)
ALTER TABLE exam_results 
DROP CONSTRAINT IF EXISTS answers_size_limit;

ALTER TABLE exam_results 
ADD CONSTRAINT answers_size_limit 
CHECK (pg_column_size(answers) < 102400); -- 100 KB limit

-- Limit profile text fields
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS address_length_limit;

ALTER TABLE profiles 
ADD CONSTRAINT address_length_limit 
CHECK (length(address) <= 500);

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS company_length_limit;

ALTER TABLE profiles 
ADD CONSTRAINT company_length_limit 
CHECK (length(company) <= 200);


-- 4. RLS TIGHTENING (EXAM RESULTS)
-- Ensure 'answers' column is not exposed in public views
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Policy: Full access for Owners
DROP POLICY IF EXISTS "Users can manage own results" ON exam_results;
CREATE POLICY "Users can manage own results" ON exam_results
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Limited public view (only if is_public is true)
-- NOTE: is_public column may not exist yet, this is for future use
DROP POLICY IF EXISTS "Public can view shared results" ON exam_results;
-- Commented out until is_public column is added
-- CREATE POLICY "Public can view shared results" ON exam_results
--     FOR SELECT USING (is_public = true);


-- 5. HARDEN PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile details
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);


-- 6. HARDEN APP_EVALUATIONS (Feedback)
ALTER TABLE app_evaluations ENABLE ROW LEVEL SECURITY;

-- Users can view own evaluations
DROP POLICY IF EXISTS "Users can view own evaluations" ON app_evaluations;
CREATE POLICY "Users can view own evaluations" ON app_evaluations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own evaluations
DROP POLICY IF EXISTS "Users can insert own evaluations" ON app_evaluations;
CREATE POLICY "Users can insert own evaluations" ON app_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 7. READ-ONLY ENFORCEMENT
-- Config and Questions are globally readable but strictly NOT writable by users
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read-only questions" ON questions;
CREATE POLICY "Public read-only questions" ON questions FOR SELECT USING (true);

-- Fixed: table is 'config', not 'categories'
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read-only config" ON config;
CREATE POLICY "Public read-only config" ON config FOR SELECT USING (true);


-- 8. AUDIT LOGGING (Optional - for monitoring abuse)
-- Create audit log table to track suspicious activities
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log (only admins can view)
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- No policies = no one can access except service role
-- Admins will use service role key to query this table


-- 9. VERIFICATION QUERIES
-- Run these to verify the security hardening is applied correctly

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'exam_results', 'app_evaluations', 'questions', 'config', 'user_practice_stats');

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check rate limit triggers exist
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname LIKE 'trg_rate_limit%';

-- Check size constraints exist
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%_size_limit' OR conname LIKE '%_length_limit';


-- ================================================
-- DEPLOYMENT NOTES
-- ================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all checks pass
-- 3. Test rate limiting by rapid submissions
-- 4. Monitor security_audit_log for abuse patterns
-- 5. Adjust intervals if needed based on real usage
-- ================================================
