# Kế hoạch triển khai Tính năng Thi lại & Xem chi tiết

## 1. Mục tiêu
- **Xem chi tiết**: Hiển thị bảng phân tích câu đúng/sai cho từng phần (Pháp luật, Chuyên môn) ngay trong lịch sử thi tại trang cá nhân.
- **Thi lại (Retake)**: Cho phép người dùng làm lại chính xác bộ câu hỏi của một bài thi cũ trong quá khứ để kiểm tra sự tiến bộ.

## 2. Giải pháp Kỹ thuật

### A. Hiển thị Chi tiết (Account Page)
- Chuyển đổi danh sách lịch sử thành dạng **Accordion** (nhấn vào để mở rộng) hoặc sử dụng **Modal** chi tiết.
- Hiển thị các thông số:
    - Tổng điểm: `score/30`
    - Pháp luật: `law_correct/10`
    - Chuyên môn: `specialist_correct/20`
    - Thời gian làm bài: `time_taken`
    - Danh sách câu hỏi (dạng grid nhỏ): Đỏ (Sai), Xanh (Đúng).

### B. Cơ chế Thi lại (Retake Logic)
- **Luồng hoạt động**:
    1. Người dùng nhấn nút "Thi lại" tại một bản ghi trong lịch sử.
    2. Chuyển hướng sang `/thi-thu/[examId]?retake=[resultId]`.
    3. Trang thi thử sẽ kiểm tra tham số `retake`:
        - Nếu có `retake`: Fetch dữ liệu từ `exam_results` theo `resultId` để lấy danh sách `q_id` từ cột `answers`.
        - Truy vấn bảng `questions` theo danh sách ID này để lấy đúng bộ câu hỏi cũ.
        - Khởi tạo session thi mới với bộ câu hỏi này.
        - Khi nộp bài, lưu thành một bản ghi `exam_results` mới (có thể đánh dấu là `is_retake = true` nếu cần).

## 3. Các bước thực hiện cụ thể

### Giai đoạn 1: Cập nhật giao diện Tài khoản
- [ ] Thiết kế lại dòng lịch sử để có thể mở rộng xem chi tiết.
- [ ] Thêm nút "Thi lại" (biểu tượng Rotate/Refresh).

### Giai đoạn 2: Nâng cấp Logic trang Thi thử
- [ ] Cập nhật `useEffect` load câu hỏi để ưu tiên xử lý tham số `retake`.
- [ ] Xây dựng Query fetch questions qua danh sách ID: `supabase.from('questions').select('*').in('id_cauhoi', [ids])`.
- [ ] Đảm bảo thứ tự câu hỏi khớp với lần thi trước (nếu cần) hoặc giữ nguyên cấu trúc phân bổ.

### Giai đoạn 3: Kiểm chuẩn
- [ ] Kiểm tra việc lưu kết quả sau khi thi lại có chính xác không.
- [ ] Đảm bảo tính năng "Chia sẻ" vẫn hoạt động cho bài thi lại.

---
*Kế hoạch được lập để tối ưu hóa trải nghiệm học tập và ôn luyện của người dùng.*
