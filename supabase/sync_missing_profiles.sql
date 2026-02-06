-- ================================================================
-- SCRIPT ĐỒNG BỘ: TẠO PROFILE CHO USER CÒN THIẾU
-- ================================================================
-- Vấn đề: Trigger chỉ chạy khi "Đăng ký mới" (Insert auth.users). 
-- Nếu bạn xóa profile nhưng User vẫn còn trong Auth, đăng nhập lại sẽ KHÔNG kích hoạt trigger.
-- Script này sẽ quét toàn bộ user trong Auth và tạo profile nếu chưa có.

INSERT INTO public.profiles (
    id, 
    email, 
    user_name, 
    display_name, 
    avata, 
    status, 
    created_at, 
    updated_at
)
SELECT 
    au.id,
    au.email,
    SPLIT_PART(au.email, '@', 1),
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email),
    COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture', ''),
    'active',
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL; -- Chỉ lấy những user chưa có profile

-- Kiểm tra kết quả
SELECT 'Profiles Synced' as status, count(*) as created_count 
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '1 minute';
