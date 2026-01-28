# Kế hoạch triển khai Ôn tập câu hỏi sai theo bộ đề

## 1. Mục tiêu
- **Thống kê**: Tổng hợp toàn bộ các câu hỏi làm sai từ lịch sử thi thử (`exam_results`).
- **Phân nhóm**: Hiển thị danh sách câu hỏi sai được nhóm theo từng bộ đề (lần thi) cụ thể.
- **Ôn tập mục tiêu**: Cho phép người dùng bắt đầu một phiên ôn tập chỉ bao gồm những câu đã làm sai của một bộ đề nhất định.

## 2. Giải pháp Kỹ thuật

### A. Xử lý Dữ liệu (Account Page)
- Hiện tại, trang Tài khoản đã load `exam_results`.
- Cần xây dựng logic để parse cột `answers` (JSONB) của tất cả các bản ghi, lọc ra những câu có `correct: false`.
- Nhóm các câu này theo `resultId` và hiển thị trong tab "Câu hỏi đã làm sai".

### B. Giao diện (UI)
- Sử dụng danh sách dạng Accordion/Card tương tự như trang Lịch sử.
- Mỗi card đại diện cho một bộ đề có câu sai:
    - Tiêu đề: "Câu sai của bài thi #[ID]"
    - Thông tin: Ngày thi, Số lượng câu sai.
    - Nút hành động: "Ôn tập ngay bộ câu này".

### C. Cơ chế Ôn tập (Review Flow)
- Khi nhấn "Ôn tập ngay", chuyển hướng sang `/on-tap?mode=exam_review&resultId=[ID]`.
- Trang **Ôn tập** (`app/(main)/on-tap/page.tsx`) sẽ:
    1. Kiểm tra query param `mode=exam_review`.
    2. Lấy danh sách ID câu hỏi sai từ `exam_results` của `resultId` tương ứng.
    3. Tải các câu hỏi đó và bắt đầu chế độ ôn tập thông thường nhưng giới hạn trong tập hợp này.

## 3. Các bước thực hiện cụ thể
- [ ] Cập nhật logic xử lý `wrongQuestions` trong `app/(main)/tai-khoan/page.tsx` để nhóm theo bài thi.
- [ ] Xây dựng giao diện hiển thị câu sai theo nhóm.
- [ ] Cập nhật trang Ôn tập để hỗ trợ chế độ `exam_review`.
- [ ] Kiểm tra tính đồng bộ và lưu lại tiến độ ôn tập (nếu cần).
