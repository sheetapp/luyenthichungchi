-- Migration: Update user_feedback table for app feedback
-- Date: 2026-02-03
-- Purpose: Allow user_feedback to handle both question-specific and general app feedback

-- 1. Make question_id nullable for general app feedback
ALTER TABLE user_feedback 
ALTER COLUMN question_id DROP NOT NULL;

-- 2. Add rating column for star ratings (app feedback)
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 3. Add denormalized question info columns (for easier querying and display)
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS hang VARCHAR(10);

ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS phan_thi VARCHAR(50);

ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS stt INTEGER;

ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS chuyen_nganh TEXT;

-- 4. Add comments for clarity
COMMENT ON COLUMN user_feedback.question_id IS 'NULL for general app feedback, UUID for question-specific feedback';
COMMENT ON COLUMN user_feedback.rating IS 'Star rating (1-5) for app feedback, NULL for question feedback';
COMMENT ON COLUMN user_feedback.feedback_type IS 'Types: app_rating, app_feedback, app_bug, app_feature, question_error, question_unclear, question_suggestion';
COMMENT ON COLUMN user_feedback.hang IS 'Denormalized from questions table for easier querying. NULL for app feedback.';
COMMENT ON COLUMN user_feedback.phan_thi IS 'Denormalized from questions table for easier querying. NULL for app feedback.';
COMMENT ON COLUMN user_feedback.stt IS 'Denormalized from questions table for easier querying. NULL for app feedback.';
COMMENT ON COLUMN user_feedback.chuyen_nganh IS 'Denormalized from questions table for easier querying. NULL for app feedback.';
COMMENT ON COLUMN user_feedback.status IS 'Feedback status: pending, reviewed, resolved. Already exists in original schema.';

-- 4. Migrate existing data from app_evaluations to user_feedback (if app_evaluations exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_evaluations') THEN
        INSERT INTO user_feedback (user_id, question_id, feedback_type, content, rating, status, created_at)
        SELECT 
            user_id,
            NULL as question_id,
            'app_rating' as feedback_type,
            content,
            rating,
            'pending' as status,
            created_at
        FROM app_evaluations
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Migrated data from app_evaluations to user_feedback';
    END IF;
END $$;

-- 5. Create index on rating column
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);

-- 6. Update RLS policies (already exist, but verify)
-- Users can view their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create feedback
DROP POLICY IF EXISTS "Users can create feedback" ON user_feedback;
CREATE POLICY "Users can create feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Optional: Drop app_evaluations table after successful migration
-- Uncomment the following line if you want to remove app_evaluations
-- DROP TABLE IF EXISTS app_evaluations;

-- Verification query
-- SELECT 
--     feedback_type,
--     COUNT(*) as count,
--     AVG(rating) as avg_rating
-- FROM user_feedback
-- GROUP BY feedback_type;
