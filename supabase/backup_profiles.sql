-- 1. Tạo bảng backup từ dữ liệu hiện tại (Chỉ copy data + columns)
CREATE TABLE IF NOT EXISTS profiles_backup AS 
SELECT * FROM profiles;

-- 2. Bảo mật bảng Backup (Vì lệnh trên KHÔNG copy RLS)
ALTER TABLE profiles_backup ENABLE ROW LEVEL SECURITY;

-- Tạo policy chỉ cho phép Admin (hoặc service role) xem/sửa bảng backup này
CREATE POLICY "Only Admin can view backup" ON profiles_backup
    USING ((auth.jwt() ->> 'email') IN ('nhuongggh@gmail.com', 'sheetappai@gmail.com', 'bimvietsolutions@gmail.com'));

-- 3. Kiểm tra kết quả
SELECT 'Backup created and secured' as status, count(*) as count FROM profiles_backup;
