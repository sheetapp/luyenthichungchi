-- ================================================================
-- BUG FIX: KHÔNG GHI ĐÈ DỮ LIỆU NGƯỜI DÙNG ĐÃ SỬA
-- ================================================================
-- Vấn đề: Script cũ dùng COALESCE(EXCLUDED.name, profiles.name) -> Ưu tiên dữ liệu mới từ Google.
-- Hậu quả: Nếu User tự đổi tên, sau đó đăng nhập lại -> Bị reset về tên Google.
-- Giải pháp: Đảo ngược lại -> COALESCE(profiles.name, EXCLUDED.name) -> Ưu tiên giữ dữ liệu cũ.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    VALUES (
        NEW.id, 
        NEW.email, 
        SPLIT_PART(NEW.email, '@', 1),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'active',
        NOW(),
        NOW()
    ) 
    ON CONFLICT (id) DO UPDATE SET
        -- Luôn cập nhật email để đảm bảo đồng bộ
        email = EXCLUDED.email,
        -- GIỮ NGUYÊN tên/avatar cũ của người dùng (nếu đã có). Chỉ điền vào nếu đang trống (NULL).
        display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
        avata = COALESCE(profiles.avata, EXCLUDED.avata),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'SUCCESS' as status, 'Updated handle_new_user to PRESERVE existing data' as message;
