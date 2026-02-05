-- Migration: Allow viewing all feedback for admin functionality
-- Created: 2026-02-04
-- Purpose: Add RLS policy to allow authenticated users to view all feedback
--          This is needed for the admin feedback management interface

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;

-- Create new policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create new policy: Authenticated users can view all feedback
-- This allows the admin interface to display all feedback
CREATE POLICY "Authenticated users can view all feedback" ON user_feedback
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Create new policy: Authenticated users can update all feedback
-- This allows admin users to send responses and update status
DROP POLICY IF EXISTS "Authenticated users can update feedback" ON user_feedback;
CREATE POLICY "Authenticated users can update feedback" ON user_feedback
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Note: The admin interface will use these policies to:
-- 1. Fetch all feedback (SELECT)
-- 2. Update feedback with admin responses (UPDATE)
-- Individual users will still only see their own feedback in the personal view
-- because the application filters by user_id in the query
