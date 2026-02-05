-- ============================================
-- BACKUP SCRIPT: user_feedback table
-- Date: 2026-02-03
-- Purpose: Backup current user_feedback structure before migration
-- ============================================

-- This script creates a backup of the user_feedback table
-- Run this BEFORE executing the migration script

-- 1. Create backup table with current data
CREATE TABLE IF NOT EXISTS user_feedback_backup_20260203 AS 
SELECT * FROM user_feedback;

-- 2. Verify backup
SELECT 
    'user_feedback' as original_table,
    COUNT(*) as original_count
FROM user_feedback
UNION ALL
SELECT 
    'user_feedback_backup_20260203' as backup_table,
    COUNT(*) as backup_count
FROM user_feedback_backup_20260203;

-- 3. Show current structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_feedback'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Backup completed successfully! Table: user_feedback_backup_20260203';
END $$;
