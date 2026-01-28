# 🚀 Quick Start - Clean Migration

**File:** `supabase/clean_migration.sql`  
**Status:** ✅ Ready to run  
**Safe:** YES - Không xóa data từ `config` và `quesions`

---

## Bước 1: Xóa tables cũ (trừ config, quesions)

Chạy lệnh này trên Supabase SQL Editor:

```sql
-- Xóa tất cả các liên quan (CASCADE giải quyết vấn đề phụ thuộc)
DROP VIEW IF EXISTS leaderboard_view CASCADE;
DROP TABLE IF EXISTS user_feedback CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS Test CASCADE;

-- GIỮ NGUYÊN: config, quesions (có data)
```

---

## Bước 2: Chạy Clean Migration

1. Mở file: `supabase/clean_migration.sql`
2. Copy **toàn bộ** nội dung
3. Paste vào Supabase SQL Editor
4. Click **Run**
5. Đợi hoàn tất (~30 giây)

---

## Kết quả mong đợi

✅ **Tables mới:**
- `categories` (đã import từ config)
- `questions` (đã copy từ quesions)
- `profiles` (trống, sẵn sàng cho auth)
- `exam_results` (trống)
- `user_feedback` (trống)

✅ **Đặc điểm:**
- Tất cả string fields dùng **TEXT** (không VARCHAR)
- RLS policies đã được thiết lập
- Indexes đã được tạo
- Triggers tự động cập nhật timestamps
- Auto-create profile khi user signup

---

## Verify

```sql
-- Kiểm tra tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Kiểm tra questions
SELECT COUNT(*) as total FROM questions;

-- Kiểm tra categories
SELECT type, COUNT(*) as count FROM categories GROUP BY type;
```

---

## Lưu ý

⚠️ **Không bao giờ xóa:**
- `config` table (có data)
- `quesions` table (có data)

✅ **An toàn xóa:**
- Tất cả tables khác (không có data)
