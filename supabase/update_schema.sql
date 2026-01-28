-- ============================================
-- UPDATE DATABASE SCHEMA
-- Cập nhật cấu trúc database để phù hợp với dự án
-- Giữ nguyên dữ liệu đã có
-- ============================================

-- Enable UUID extension (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BƯỚC 1: CẬP NHẬT TABLE profiles
-- ============================================

-- Thêm column display_name (nếu chưa có)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
        -- Copy dữ liệu từ full_name sang display_name
        UPDATE profiles SET display_name = full_name WHERE display_name IS NULL;
    END IF;
END $$;

-- Thêm column stats (JSONB)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'stats'
    ) THEN
        ALTER TABLE profiles ADD COLUMN stats JSONB DEFAULT '{
            "total_exams": 0,
            "avg_score": 0,
            "highest_score": 0,
            "total_practice_questions": 0
        }'::jsonb;
    END IF;
END $$;

-- Thêm column updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Đảm bảo email NOT NULL
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- ============================================
-- BƯỚC 2: CẬP NHẬT TABLE exam_results
-- ============================================

-- Thêm các columns còn thiếu
DO $$ 
BEGIN
    -- hang
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'hang'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN hang TEXT;
    END IF;

    -- chuyen_nganh
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'chuyen_nganh'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN chuyen_nganh TEXT;
    END IF;

    -- correct_answers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'correct_answers'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN correct_answers INTEGER DEFAULT 0;
        -- Sync từ score nếu có
        UPDATE exam_results SET correct_answers = score WHERE correct_answers = 0 AND score IS NOT NULL;
    END IF;

    -- law_correct
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'law_correct'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN law_correct INTEGER DEFAULT 0;
    END IF;

    -- specialist_correct
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'specialist_correct'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN specialist_correct INTEGER DEFAULT 0;
    END IF;

    -- total_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'total_score'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN total_score INTEGER DEFAULT 0;
        UPDATE exam_results SET total_score = score WHERE total_score = 0 AND score IS NOT NULL;
    END IF;

    -- law_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'law_score'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN law_score INTEGER DEFAULT 0;
    END IF;

    -- time_spent (đổi tên từ time_taken)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'time_spent'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN time_spent INTEGER DEFAULT 0;
        -- Copy từ time_taken nếu có
        UPDATE exam_results SET time_spent = time_taken WHERE time_spent = 0 AND time_taken IS NOT NULL;
    END IF;

    -- passed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'passed'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN passed BOOLEAN DEFAULT FALSE;
    END IF;

    -- answers (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'answers'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN answers JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Đảm bảo các columns NOT NULL
ALTER TABLE exam_results ALTER COLUMN total_questions SET DEFAULT 30;
ALTER TABLE exam_results ALTER COLUMN total_questions SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN correct_answers SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN law_correct SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN specialist_correct SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN total_score SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN law_score SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN time_spent SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN passed SET NOT NULL;
ALTER TABLE exam_results ALTER COLUMN answers SET NOT NULL;

-- ============================================
-- BƯỚC 3: TẠO TABLE categories (nếu chưa có)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'hang', 'linh_vuc', 'loai_phan_thi', 'chuyen_nganh', 'chi_muc'
    code VARCHAR(10) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

-- Import dữ liệu từ config sang categories
INSERT INTO categories (type, code, name, description)
SELECT 
    data_type as type,
    data_value as code,
    data_value as name,
    data_name as description
FROM config
WHERE data_type IN ('hang', 'phan_thi', 'chuyen_nganh', 'chi_muc')
ON CONFLICT DO NOTHING;

-- Thêm loại phần thi
INSERT INTO categories (type, code, name, description) VALUES
('loai_phan_thi', 'PHAP_LUAT', 'Pháp luật', 'Phần thi Pháp luật (10 câu)'),
('loai_phan_thi', 'CHUYEN_MON', 'Chuyên môn', 'Phần thi Chuyên môn (20 câu)')
ON CONFLICT DO NOTHING;

-- ============================================
-- BƯỚC 4: TẠO TABLE questions CHÍNH XÁC (nếu chưa có)
-- Lưu ý: Table hiện tại là "quesions" (typo)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id_cauhoi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hang TEXT NOT NULL, -- I, II, III - Changed from VARCHAR(10) to TEXT
    phan_thi TEXT NOT NULL, -- 'Pháp luật', 'Chuyên môn' - Changed from VARCHAR(50) to TEXT
    chuyen_nganh TEXT,
    cau_hoi TEXT NOT NULL,
    dap_an_a TEXT,
    dap_an_b TEXT,
    dap_an_c TEXT,
    dap_an_d TEXT,
    dap_an_dung VARCHAR(1) NOT NULL CHECK (dap_an_dung IN ('a', 'b', 'c', 'd')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for questions
CREATE INDEX IF NOT EXISTS idx_questions_hang ON questions(hang);
CREATE INDEX IF NOT EXISTS idx_questions_phan_thi ON questions(phan_thi);
CREATE INDEX IF NOT EXISTS idx_questions_chuyen_nganh ON questions(chuyen_nganh);

-- Copy dữ liệu từ table "quesions" sang "questions" (nếu questions trống)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quesions') 
       AND NOT EXISTS (SELECT 1 FROM questions LIMIT 1) THEN
        
        INSERT INTO questions (hang, phan_thi, chuyen_nganh, cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, dap_an_dung)
        SELECT 
            COALESCE(hang, 'I') as hang,
            COALESCE(phan_thi, 'Chuyên môn') as phan_thi,
            chuyen_nganh,
            COALESCE(cau_hoi, '') as cau_hoi,
            dap_an_a,
            dap_an_b,
            dap_an_c,
            dap_an_d,
            COALESCE(LOWER(SUBSTRING(dap_an_dung, 1, 1)), 'a') as dap_an_dung
        FROM quesions
        WHERE cau_hoi IS NOT NULL AND cau_hoi != '';
    END IF;
END $$;

-- ============================================
-- BƯỚC 5: TẠO TABLE user_feedback
-- ============================================
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id_cauhoi) ON DELETE CASCADE NOT NULL,
    feedback_type VARCHAR(50) NOT NULL, -- 'error', 'suggestion', 'unclear'
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_question_id ON user_feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status);

-- ============================================
-- BƯỚC 6: TẠO/CẬP NHẬT RLS POLICIES
-- ============================================

-- Enable RLS cho profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS cho exam_results
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
CREATE POLICY "Users can view own results" ON exam_results
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own results" ON exam_results;
CREATE POLICY "Users can insert own results" ON exam_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON exam_results;
CREATE POLICY "Anyone can view leaderboard" ON exam_results
    FOR SELECT USING (true);

-- Enable RLS cho user_feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON user_feedback;
CREATE POLICY "Users can create feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- BƯỚC 7: TẠO TRIGGERS
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to questions
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BƯỚC 8: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BƯỚC 9: TẠO INDEXES BỔ SUNG
-- ============================================
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_created_at ON exam_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_passed ON exam_results(passed);
CREATE INDEX IF NOT EXISTS idx_exam_results_score ON exam_results(total_score DESC);

-- ============================================
-- HOÀN TẤT
-- ============================================
-- Script này đã cập nhật database để phù hợp với dự án
-- Dữ liệu cũ được giữ nguyên
-- ============================================
