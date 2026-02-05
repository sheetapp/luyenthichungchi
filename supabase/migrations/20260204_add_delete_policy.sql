-- Migration: Add DELETE policy for user_feedback
-- Allows admin users to delete feedback

DROP POLICY IF EXISTS "Authenticated users can delete feedback" ON user_feedback;
CREATE POLICY "Authenticated users can delete feedback" ON user_feedback
    FOR DELETE 
    USING (auth.role() = 'authenticated');
