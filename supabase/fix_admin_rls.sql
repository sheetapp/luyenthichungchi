-- ============================================
-- FIX ADMIN & SECURE LEADERBOARD RLS POLICIES
-- 1. Cho phép Admin xem toàn bộ dữ liệu.
-- 2. Bảo mật Bảng xếp hạng: KHÔNG lộ Email/SĐT của người dùng.
-- ============================================

-- 1. Helper Function để check Admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') IN (
        'nhuongggh@gmail.com',
        'sheetappai@gmail.com',
        'bimvietsolutions@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CẬP NHẬT TABLE profiles
-- Reset policy cũ (nếu có)
DROP POLICY IF EXISTS "Profiles are viewable by everyone for leaderboard" ON profiles;

-- Policy cho Admin & Cá nhân (Xem toàn bộ thông tin)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (is_admin() OR auth.uid() = id);

-- 3. TẠO VIEW BẢO MẬT CHO BẢNG XẾP HẠNG
-- View này chỉ chọn các cột an toàn, KHÔNG bao gồm email, phone, v.v.
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT id, display_name, avata, stats
FROM profiles;

-- Cấp quyền truy cập View cho mọi người dùng
GRANT SELECT ON leaderboard_view TO anon, authenticated;

-- 4. CẬP NHẬT TABLE exam_results
DROP POLICY IF EXISTS "Admins can view all exam results" ON exam_results;
CREATE POLICY "Admins can view all exam results" ON exam_results
    FOR SELECT USING (is_admin() OR auth.uid() = user_id);

-- Leaderboard results (Công khai kết quả thi cơ bản)
DROP POLICY IF EXISTS "Anyone can view leaderboard results" ON exam_results;
CREATE POLICY "Anyone can view leaderboard results" ON exam_results
    FOR SELECT USING (true);

-- 5. CẬP NHẬT TABLE user_feedback & practice_stats
DROP POLICY IF EXISTS "Admins can manage all feedback" ON user_feedback;
CREATE POLICY "Admins can manage all feedback" ON user_feedback
    FOR ALL USING (is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all practice stats" ON user_practice_stats;
CREATE POLICY "Admins can manage all practice stats" ON user_practice_stats
    FOR ALL USING (is_admin() OR auth.uid() = user_id);

-- ============================================
-- HƯỚNG DẪN:
-- 1. Chạy script này trong SQL Editor của Supabase.
-- 2. Script này đảm bảo ngay cả khi dùng Console, người dùng cũng KHÔNG THỂ lấy được email người khác.
-- 3. Dữ liệu nhạy cảm chỉ hiển thị cho Admin và chính chủ.
-- ============================================
