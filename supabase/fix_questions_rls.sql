-- ============================================
-- FIX QUESTIONS TABLE RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Check current state
SELECT 
    'questions RLS enabled' as check_type,
    relrowsecurity as result
FROM pg_class 
WHERE relname = 'questions';

SELECT 
    'questions policies' as check_type,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'questions';

-- Fix: Allow everyone (including anonymous users) to read questions
DROP POLICY IF EXISTS "Questions are publicly readable" ON questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;
DROP POLICY IF EXISTS "Public questions access" ON questions;

-- Create policy to allow public read access
CREATE POLICY "Public questions access" ON questions
    FOR SELECT
    USING (true);

-- Also check config table
SELECT 
    'config RLS enabled' as check_type,
    relrowsecurity as result
FROM pg_class 
WHERE relname = 'config';

DROP POLICY IF EXISTS "Config publicly readable" ON config;
DROP POLICY IF EXISTS "Public config access" ON config;

CREATE POLICY "Public config access" ON config
    FOR SELECT
    USING (true);

-- Verify
SELECT 
    'Final check - questions policies' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'questions';

SELECT 
    'Final check - config policies' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'config';
