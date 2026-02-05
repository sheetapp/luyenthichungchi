-- ============================================
-- VERIFICATION SCRIPT: user_feedback migration
-- Date: 2026-02-03
-- Purpose: Verify migration was successful
-- ============================================

-- Run this AFTER executing the migration script

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_feedback'
ORDER BY ordinal_position;

-- 2. Check if new columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'rating'
    ) THEN '✓ rating column exists' ELSE '✗ rating column missing' END as rating_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'hang'
    ) THEN '✓ hang column exists' ELSE '✗ hang column missing' END as hang_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'phan_thi'
    ) THEN '✓ phan_thi column exists' ELSE '✗ phan_thi column missing' END as phan_thi_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'stt'
    ) THEN '✓ stt column exists' ELSE '✗ stt column missing' END as stt_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'chuyen_nganh'
    ) THEN '✓ chuyen_nganh column exists' ELSE '✗ chuyen_nganh column missing' END as chuyen_nganh_check;

-- 3. Check question_id nullable constraint
SELECT 
    column_name,
    is_nullable,
    CASE 
        WHEN is_nullable = 'YES' THEN '✓ question_id is nullable (correct)'
        ELSE '✗ question_id is NOT NULL (incorrect)'
    END as nullable_check
FROM information_schema.columns
WHERE table_name = 'user_feedback' 
AND column_name = 'question_id';

-- 4. Count feedback by type
SELECT 
    feedback_type,
    COUNT(*) as count,
    COUNT(question_id) as with_question,
    COUNT(*) - COUNT(question_id) as without_question,
    AVG(rating) as avg_rating
FROM user_feedback
GROUP BY feedback_type
ORDER BY feedback_type;

-- 5. Sample data check
SELECT 
    id,
    feedback_type,
    CASE WHEN question_id IS NULL THEN 'App Feedback' ELSE 'Question Feedback' END as category,
    rating,
    hang,
    phan_thi,
    stt,
    chuyen_nganh,
    created_at
FROM user_feedback
ORDER BY created_at DESC
LIMIT 10;

-- 6. RLS policies check
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_feedback';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Migration verification completed!';
    RAISE NOTICE 'Review the results above to ensure all checks pass.';
    RAISE NOTICE '===========================================';
END $$;
