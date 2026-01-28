# Kế hoạch Di chuyển Lịch sử Ôn tập lên Supabase

Di chuyển lịch sử ôn tập từ `localStorage` của trình duyệt sang bảng lưu trữ tập trung trên Supabase. Việc này giúp người dùng có thể tiếp tục tiến trình ôn tập trên nhiều thiết bị khác nhau.

## Thay đổi Đề xuất

### Lớp Dữ liệu (Database)

Tạo bảng `user_practice_stats` để lưu trữ lịch sử dưới dạng một khối JSONB duy nhất cho mỗi người dùng.

```sql
CREATE TABLE IF NOT EXISTS user_practice_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    history JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE user_practice_stats ENABLE ROW LEVEL SECURITY;

-- Chính sách bảo mật (Policies)
CREATE POLICY "Users can view own practice stats" ON user_practice_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own practice stats" ON user_practice_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice stats" ON user_practice_stats
    FOR UPDATE USING (auth.uid() = user_id);
```

### Lớp Ứng dụng (Application)

Cập nhật `app/(main)/on-tap/quiz/page.tsx`:
- Thêm logic lấy dữ liệu (fetching) từ Supabase khi component mount.
- Triển khai hàm đồng bộ (sync) với cơ chế "debounce" để đẩy cập nhật lên Supabase.
- Tự động hòa trộn (merge) dữ liệu từ `localStorage` cho khách hoặc khi cần thiết.

## Kế hoạch Xác minh

1.  **Tải dữ liệu ban đầu**: Đăng nhập, bắt dầu làm quiz, trả lời vài câu hỏi.
2.  **Kiểm tra tính kiên định**: Refresh trang, đảm bảo tiến độ vẫn còn đó.
3.  **Kiểm tra đa thiết bị**: Đăng nhập trên trình duyệt/thiết bị khác, đảm bảo tiến độ được đồng bộ.
4.  **Chế độ Khách**: Đảm bảo ứng dụng vẫn hoạt động (dùng `localStorage`) khi chưa đăng nhập.
