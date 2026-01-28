-- ============================================
-- ADD PREFERENCES AND BADGES TO PROFILES
-- ============================================

-- Add new columns to profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{"rank": "Hạng III", "specialty": "Khảo sát xây dựng", "theme": "light"}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'badges') THEN
        ALTER TABLE profiles ADD COLUMN badges JSONB DEFAULT '{"stars": 0, "level": "Beginner", "achievements": []}'::jsonb;
    END IF;
END $$;

-- Update RLS if needed (usually profiles already has good RLS)
-- Ensure users can update their own preferences/badges
DROP POLICY IF EXISTS "Users can update own profile preferences" ON profiles;
CREATE POLICY "Users can update own profile preferences" ON profiles
    FOR UPDATE USING (auth.uid() = id);
