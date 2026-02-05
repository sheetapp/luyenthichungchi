-- ================================================
-- FIX: Profile Update Rate Limit Function
-- Issue: Function uses 'user_id' column but profiles table uses 'id'
-- Date: 2026-02-03
-- 
-- SCHEMA ANALYSIS:
-- - profiles: id (PK, references auth.users)
-- - exam_results: user_id (FK to profiles.id)
-- - app_evaluations: user_id (FK to profiles.id)  
-- - user_practice_stats: user_id (PK, references auth.users)
--
-- PROBLEM: Original function assumes all tables have 'user_id' column
-- SOLUTION: Handle profiles table separately since it uses 'id' instead
-- ================================================

-- Updated rate limiting function to handle profiles table correctly
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    last_sub_time TIMESTAMP WITH TIME ZONE;
    min_interval INTERVAL;
    operation_type TEXT;
    user_column TEXT;
BEGIN
    -- Determine operation type (INSERT vs UPDATE)
    operation_type := TG_OP;
    
    -- Define intervals and user column based on table
    CASE TG_TABLE_NAME
        WHEN 'app_evaluations' THEN 
            min_interval := '5 minutes';
            user_column := 'user_id';
        WHEN 'exam_results' THEN 
            min_interval := '5 minutes';
            user_column := 'user_id';
        WHEN 'user_practice_stats' THEN 
            min_interval := '10 seconds';
            user_column := 'user_id';
        WHEN 'profiles' THEN 
            IF operation_type = 'UPDATE' THEN
                min_interval := '30 seconds';
            ELSE
                min_interval := '0 seconds'; -- Allow INSERT (first time)
            END IF;
            user_column := 'id'; -- profiles uses 'id' not 'user_id'
        ELSE 
            min_interval := '10 seconds';
            user_column := 'user_id';
    END CASE;

    -- Skip check if interval is 0
    IF min_interval = '0 seconds' THEN
        RETURN NEW;
    END IF;

    -- Get last submission time for this user
    IF operation_type = 'INSERT' THEN
        EXECUTE format('SELECT created_at FROM %I WHERE %I = $1 ORDER BY created_at DESC LIMIT 1', 
            TG_TABLE_NAME, user_column)
        INTO last_sub_time
        USING auth.uid();
    ELSE -- UPDATE
        EXECUTE format('SELECT updated_at FROM %I WHERE %I = $1 ORDER BY updated_at DESC LIMIT 1', 
            TG_TABLE_NAME, user_column)
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
