-- ================================================================
-- KÍCH HOẠT TỰ ĐỘNG TẠO/CẬP NHẬT PROFILE KHI ĐĂNG NHẬP
-- ================================================================
-- Mặc định, trigger chỉ chạy khi "Tạo tài khoản" (INSERT).
-- Script này sẽ thêm trigger chạy khi "Đăng nhập" (UPDATE last_sign_in_at).
-- Giúp: Tự động khôi phục Profile nếu bị xóa nhầm, hoặc cập nhật avatar/tên nếu đổi bên Google.

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Kiểm tra
SELECT 'Login Trigger Added' as status, 'Profiles will sync on next login' as message;
