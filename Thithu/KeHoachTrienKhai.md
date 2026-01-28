# Kế hoạch tích hợp và tối ưu hóa lịch sử Thi thử

## 1. Hiện trạng (Current State)
- **Tính năng đang có**: 
    - Lưu kết quả thi trực tiếp vào bảng `exam_results` của Supabase sau khi hoàn thành bài thi.
    - Chỉ lưu cho người dùng đã đăng nhập.
    - Hiển thị 10 bài thi gần nhất tại trang "Tài khoản".
    - Tính toán thống kê (Tổng bài thi, Điểm trung bình, Tỉ lệ đạt) "on-the-fly" phía Client.
- **Hạn chế**:
    - Khách (vãng lai) chưa được lưu lịch sử.
    - Việc tính toán stats mỗi lần vào trang cá nhân sẽ trở nên chậm khi số lượng bài thi lớn.
    - Dữ liệu `answers` trong JSONB có thể chứa thông tin dư thừa.

## 2. Mục tiêu (Objectives)
- **Lưu lịch sử cho Khách**: Hỗ trợ lưu bài thi vào `localStorage` nếu chưa đăng nhập.
- **Đồng bộ hóa**: Tự động chuyển lịch sử từ `localStorage` lên Supabase ngay khi người dùng đăng nhập.
- **Tối ưu hiệu năng**:
    - Chuyển việc tính toán stats sang phía Database hoặc lưu trữ kết quả đã tính toán (Cache).
    - Tối ưu hóa cấu trúc JSONB để giảm dung lượng lưu trữ.
    - Phân trang (Pagination) lịch sử thi để tránh load quá nhiều dữ liệu một lúc.

## 3. Kế hoạch triển khai (Implementation Plan)

### Giai đoạn 1: Hỗ trợ Khách (Guest Support)
- [ ] Chỉnh sửa `handleSubmit` trong `app/(main)/thi-thu/[examId]/page.tsx` để lưu vào `localStorage` nếu `!user`.
- [ ] Tạo helper `syncExamHistory()` để gọi khi đăng nhập thành công (tương tự như phần Ôn tập).

### Giai đoạn 2: Tối ưu hóa Database & Hiệu năng
- [ ] **Bổ sung cột `is_public`**: Thêm cột `is_public` (boolean, default false) vào bảng `exam_results` để hỗ trợ tính năng chia sẻ kết quả lên bảng xếp hạng khi người dùng thi ĐẠT.
- [ ] **Thống kê (Leaderboard)**: Xây dựng logic xếp hạng dựa trên các bài thi có `is_public = true`.
- [ ] **Nút chia sẻ tại Tài khoản**: Bổ sung nút "Chia sẻ" cho các bài thi ĐẠT trong danh sách lịch sử tại trang cá nhân.
- [ ] **Tối ưu JSONB**: Chỉ lưu `{ q_id, choice }`. Tránh lưu lại toàn bộ nội dung câu hỏi hoặc flag `correct` (vì có thể tính toán lại được từ câu trả lời và đáp án đúng trong bảng `questions`).
- [ ] **Index**: Đảm bảo các chỉ mục `user_id` và `created_at` hoạt động tốt.

### Giai đoạn 3: Nâng cấp Giao diện Lịch sử
- [ ] Thêm tính năng phân trang tại trang "Tài khoản".
- [ ] Cho phép xem chi tiết đề thi cũ (Review) bằng cách kéo lại dữ liệu answers từ Supabase theo ID bài thi.

---
*Kế hoạch này được lập bởi Antigravity để đảm bảo hệ thống vận hành mượt mà ngay cả khi có hàng triệu bản ghi bài thi.*
