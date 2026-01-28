-- ============================================
-- SQL SETUP BỔ SUNG (CHO CÁC BẢNG CÒN LẠI)
-- Chạy script này để tạo các bảng User và Kết quả thi
-- ============================================

-- 1. TABLE profiles (Theo yêu cầu của bạn)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    user_name TEXT,
    display_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    avata TEXT, -- Giữ nguyên typo 'avata' theo yêu cầu
    job_title TEXT,
    gender TEXT,
    stats JSONB DEFAULT '{}'::jsonb, -- Để lưu thống kê nhanh nếu cần
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE exam_results (Để lưu lịch sử thi thử)
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    hang TEXT, -- Cấp chứng chỉ (Hạng I, II, III)
    chuyen_nganh TEXT, -- Chuyên ngành dự thi
    score INTEGER DEFAULT 0, -- Tổng điểm
    total_questions INTEGER DEFAULT 30,
    law_correct INTEGER DEFAULT 0, -- Số câu đúng Pháp luật
    specialist_correct INTEGER DEFAULT 0, -- Số câu đúng Chuyên môn
    time_taken INTEGER DEFAULT 0, -- Thời gian làm bài (giây)
    passed BOOLEAN DEFAULT FALSE, -- Đạt hay không đạt
    answers JSONB DEFAULT '[]'::jsonb, -- Lưu chi tiết các câu đã chọn
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BẢO MẬT RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Cấp quyền
DROP POLICY IF EXISTS "Profiles access" ON profiles;
CREATE POLICY "Profiles access" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Results access" ON exam_results;
CREATE POLICY "Results access" ON exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Results insert" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRIGGER TỰ TẠO PROFILE (Cập nhật đúng cột mới)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, user_name, avata)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    ) ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created BEFORE INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
