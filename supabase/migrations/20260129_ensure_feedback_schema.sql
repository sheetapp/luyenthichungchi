-- Ensure questions table has 'id' as a non-nullable primary key
-- Note: 'bigint' in Postgres is int8/number in JS
DO $$ 
BEGIN
    -- Check if 'id' exists and is not a primary key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'id') THEN
        -- Make it NOT NULL first
        ALTER TABLE questions ALTER COLUMN id SET NOT NULL;
        
        -- Add primary key if no constraint exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'questions'::regclass AND contype = 'p'
        ) THEN
            ALTER TABLE questions ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- Ensure user_feedback table exists with correct structure
-- question_id MUST be bigint to match questions.id
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id bigint REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    feedback_type VARCHAR(50) NOT NULL, -- 'error', 'suggestion', 'other'
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to be safe
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON user_feedback;
CREATE POLICY "Users can create feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_question_id ON user_feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status);
