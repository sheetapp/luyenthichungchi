-- Create app_evaluations table for general user feedback
CREATE TABLE IF NOT EXISTS app_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own evaluations" ON app_evaluations;
CREATE POLICY "Users can view own evaluations" ON app_evaluations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create evaluations" ON app_evaluations;
CREATE POLICY "Users can create evaluations" ON app_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON app_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_rating ON app_evaluations(rating);
