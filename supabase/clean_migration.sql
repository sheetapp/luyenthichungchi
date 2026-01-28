-- ============================================
-- MIGRATION CHUẨN - TÔN TRỌNG 100% CẤU TRÚC CỦA BẠN
-- Đã cập nhật theo ảnh cấu trúc bạn gửi
-- ============================================

-- Enable UUID extension (cho các table mới như profiles, results)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLE questions (Trùng khớp 100% cột bạn gửi)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id_cauhoi bigint PRIMARY KEY,
    chi_muc TEXT,
    stt bigint,
    phan_thi TEXT,
    chuyen_nganh TEXT,
    hang TEXT,
    cau_hoi TEXT,
    dap_an_a TEXT,
    dap_an_b TEXT,
    dap_an_c TEXT,
    dap_an_d TEXT,
    dap_an_dung TEXT, -- Để TEXT để chấp nhận cả 'a', 'b' và '0', '1'...
    "Loai_number" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy DỮ LIỆU GỐC - Không thay đổi bất cứ gì
INSERT INTO questions (
    id_cauhoi, chi_muc, stt, phan_thi, chuyen_nganh, 
    hang, cau_hoi, dap_an_a, dap_an_b, dap_an_c, 
    dap_an_d, dap_an_dung, "Loai_number"
)
SELECT 
    id_cauhoi, chi_muc, stt, phan_thi, chuyen_nganh, 
    hang, cau_hoi, dap_an_a, dap_an_b, dap_an_c, 
    dap_an_d, dap_an_dung, "Loai_number"
FROM quesions
ON CONFLICT (id_cauhoi) DO NOTHING;

-- ============================================
-- 2. TABLE profiles (Dành cho chức năng đăng nhập)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABLE exam_results (Dành cho chức năng thi thử)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    hang TEXT,
    chuyen_nganh TEXT,
    score INTEGER,
    total_questions INTEGER,
    time_taken INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BẢO MẬT RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Cấp quyền cơ bản cho user
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users view own results" ON exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger tự tạo Profile khi User đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
