-- Migration: Add UPDATE policy for user_feedback
-- Run this if you already ran the previous migration

-- Create new policy: Authenticated users can update all feedback
-- This allows admin users to send responses and update status
DROP POLICY IF EXISTS "Authenticated users can update feedback" ON user_feedback;
CREATE POLICY "Authenticated users can update feedback" ON user_feedback
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
