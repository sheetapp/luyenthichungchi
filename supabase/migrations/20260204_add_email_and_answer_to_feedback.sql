-- Migration: Add email and answer columns to user_feedback
-- Date: 2026-02-04

-- 1. Add email column to store sender's email
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add answer column (JSONB) to store structured responses
-- Format: { "responded_at": "...", "content": "...", "admin_id": "..." }
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS answer JSONB;

-- 3. Update comments
COMMENT ON COLUMN user_feedback.email IS 'Email of the user at the time of submission';
COMMENT ON COLUMN user_feedback.answer IS 'Structured response from admin in JSON format';
