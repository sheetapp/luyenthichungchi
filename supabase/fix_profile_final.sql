-- ==========================================
-- SCRIPT SỬA LỖI TẠO PROFILE & DỌN DẸP RLS
-- ==========================================

-- 1. XÓA SẠCH CÁC POLICY CŨ (Tránh xung đột/trùng lặp)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles insert" ON profiles;
DROP POLICY IF EXISTS "Profiles select" ON profiles;
DROP POLICY IF EXISTS "Profiles update" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile preferences" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles access" ON profiles;

-- 2. TẠO LẠI POLICY CHUẨN (Gọn gàng & Bảo mật)
-- Cho phép mọi người xem profile của chính mình (và Admin xem tất cả)
CREATE POLICY "View Profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        (auth.jwt() ->> 'email') IN ('nhuongggh@gmail.com', 'sheetappai@gmail.com', 'bimvietsolutions@gmail.com')
    );

-- Cho phép User tự sửa profile của mình (và Admin sửa tất cả)
CREATE POLICY "Update Profiles" ON profiles
    FOR UPDATE USING (
        auth.uid() = id 
        OR 
        (auth.jwt() ->> 'email') IN ('nhuongggh@gmail.com', 'sheetappai@gmail.com', 'bimvietsolutions@gmail.com')
    );

-- Cho phép Insert (cần thiết cho Trigger hoặc đăng ký thủ công nếu có)
CREATE POLICY "Insert Profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. CẬP NHẬT TRIGGER TẠO USER (Khớp chính xác với Schema của bạn)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- Chạy với quyền Admin, bỏ qua RLS
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        user_name, 
        display_name, 
        avata, -- Giữ nguyên typo theo yêu cầu
        status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        -- user_name: lấy phần trước @ của email
        SPLIT_PART(NEW.email, '@', 1),
        -- display_name: ưu tiên metadata, nếu không có thì lấy email
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        -- avata: lấy từ metadata picture/avatar_url
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'active', -- status mặc định
        NOW(),
        NOW()
    ) 
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        avata = COALESCE(EXCLUDED.avata, profiles.avata),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. ĐẢM BẢO TRIGGER ĐƯỢC GẮN VÀO AUTH.USERS (Sau khi user đăng ký)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Helper function check (Optional)
SELECT 'SUCCESS' as status, 'Policies Cleaned & Trigger Updated' as message;
