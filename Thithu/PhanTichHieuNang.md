# Phân tích Hiệu năng & Giải pháp Tối ưu Database

## 1. Vấn đề về Dung lượng (Storage Efficiency)
Hiện tại, cột `answers` lưu dạng JSONB như sau:
```json
[
  { "q_id": 123, "choice": "a", "correct": true },
  ...
]
```
**Giải pháp Tối ưu**: 
Chỉ lưu dạng key-value rút gọn: `{"123": "a", "124": "b"}`. Việc kiểm tra đúng/sai sẽ được thực hiện khi hiển thị bằng cách JOIN với bảng questions hoặc tính toán tại Client. Điều này giúp giảm ~60% dung lượng cột `answers`.

## 2. Vấn đề về Truy vấn (Query Performance)
Việc đếm tổng số bài thi và tính điểm trung bình bằng câu lệnh `SELECT COUNT(*)` và `AVG(score)` trên toàn bộ bảng `exam_results` mỗi khi User load trang cá nhân sẽ gây tải nặng cho CPU database khi bảng có hàng triệu dòng.

**Giải pháp Tối ưu**:
- **Denormalization**: Sử dụng cột `stats` trong bảng `profiles` để lưu giá trị đã tính toán sẵn.
- **Supabase Edge Functions / Triggers**: 
    - Tạo một database trigger `after_insert_exam_result` tự động cập nhật `stats` trong bảng `profiles` của User đó.
    - Khi User vào trang cá nhân, chỉ cần lấy 1 dòng từ bảng `profiles` là có đủ thông tin thống kê.

## 3. Kiểm soát dữ liệu lớn (Data Growth Control)
Theo thời gian, lịch sử thi có thể phình to. 
**Giải pháp**:
- **Chiến lược định kỳ**: Chỉ giữ lại chi tiết (cột `answers`) cho 50 bài thi gần nhất. Các bài thi cũ hơn chỉ giữ lại `score`, `passed`, `time_taken` để vẽ biểu đồ, xóa bỏ `answers` để giải phóng dung lượng.
- **Pagination**: Luôn load lịch sử theo trang (mặc định 10 bài/lần). Không bao giờ load toàn bộ lịch sử nếu không được yêu cầu.

## 4. Trải nghiệm Người dùng (UX & Sync)
**Giải pháp**:
- **Optimistic UI**: Khi thi xong, hiển thị kết quả ngay lập tức từ state cục bộ, quá trình lưu vào Supabase chạy ngầm.
- **Syncing guest data**: Khi người dùng đăng nhập, sử dụng `UPSERT` theo Batch để đẩy toàn bộ lịch sử từ localStorage lên Supabase trong 1 request duy nhất.
