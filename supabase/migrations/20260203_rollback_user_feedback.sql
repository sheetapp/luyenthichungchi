-- ============================================
-- ROLLBACK SCRIPT: user_feedback table migration
-- Date: 2026-02-03
-- Purpose: Rollback changes if migration fails
-- ============================================

-- WARNING: Only run this if the migration failed and you need to restore

-- 1. Drop newly added columns
ALTER TABLE user_feedback DROP COLUMN IF EXISTS rating;
ALTER TABLE user_feedback DROP COLUMN IF EXISTS hang;
ALTER TABLE user_feedback DROP COLUMN IF EXISTS phan_thi;
ALTER TABLE user_feedback DROP COLUMN IF EXISTS stt;
ALTER TABLE user_feedback DROP COLUMN IF EXISTS chuyen_nganh;

-- 2. Restore question_id NOT NULL constraint
ALTER TABLE user_feedback 
ALTER COLUMN question_id SET NOT NULL;

-- 3. Delete migrated app_evaluations data (if migration was completed)
DELETE FROM user_feedback 
WHERE feedback_type = 'app_rating' 
AND question_id IS NULL;

-- 4. Verify rollback
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_feedback'
ORDER BY ordinal_position;

-- 5. Optional: Restore from backup table
-- Uncomment if you want to restore all data from backup
/*
TRUNCATE TABLE user_feedback;
INSERT INTO user_feedback 
SELECT * FROM user_feedback_backup_20260203;
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Rollback completed! user_feedback table restored to original state.';
    RAISE NOTICE 'Backup table user_feedback_backup_20260203 is still available if needed.';
END $$;
