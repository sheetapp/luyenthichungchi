-- Migration: Add admin response fields to user_feedback table
-- Date: 2026-02-04
-- Purpose: Enable admin to respond to user feedbacks and track admin actions

-- 1. Add admin response column
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS admin_response TEXT;

-- 2. Add timestamp for when admin responded
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS admin_responded_at TIMESTAMP WITH TIME ZONE;

-- 3. Add admin user ID to track who responded
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES auth.users(id);

-- 4. Add comments for clarity
COMMENT ON COLUMN user_feedback.admin_response IS 'Admin response to user feedback';
COMMENT ON COLUMN user_feedback.admin_responded_at IS 'Timestamp when admin responded';
COMMENT ON COLUMN user_feedback.admin_user_id IS 'Admin user who responded';

-- 5. Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_admin_user_id ON user_feedback(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_admin_responded_at ON user_feedback(admin_responded_at);

-- 6. Update RLS policies to allow admin access
-- Note: Client-side will check admin emails, but we add policy for future API endpoints

-- Allow admins to view all feedbacks (will be enforced in API layer)
-- For now, keep existing policies and add admin check in application code

-- Verification query
-- SELECT 
--     id,
--     feedback_type,
--     status,
--     admin_response,
--     admin_responded_at,
--     admin_user_id
-- FROM user_feedback
-- WHERE admin_response IS NOT NULL;
