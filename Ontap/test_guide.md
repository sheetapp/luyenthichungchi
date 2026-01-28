# Hướng dẫn Kiểm thử (Test Guide) - Lịch sử Ôn tập

Tài liệu này hướng dẫn cách kiểm tra tính năng đồng bộ lịch sử ôn tập giữa trình duyệt (`localStorage`) và Supabase.

## 1. Chuẩn bị
- Đảm bảo bạn đã chạy script SQL tạo bảng `user_practice_stats` trong Supabase SQL Editor.
- Đã deploy hoặc đang chạy local với đầy đủ biến môi trường.

## 2. Kịch bản Kiểm thử (Test Scenarios)

### Kịch bản 1: Kiểm tra lưu trữ Cloud (Cho User đã đăng nhập)
1. **Đăng nhập** vào ứng dụng.
2. Vào mục **Ôn tập**, chọn một chuyên ngành bất kỳ.
3. Trả lời đúng/sai khoảng 5-10 câu hỏi.
4. **Quan sát Network (F12)**: Sau khi trả lời xong khoảng 3 giây, bạn sẽ thấy một request `POST` hoặc `PATCH` gửi tới bảng `user_practice_stats`.
5. **Kiểm tra Database**: Vào Supabase Dashboard -> Table Editor -> `user_practice_stats`. Bạn sẽ thấy 1 dòng dữ liệu của mình với cột `history` chứa ID các câu hỏi bạn vừa làm.

### Kịch bản 2: Đồng bộ đa thiết bị
1. Thực hiện kịch bản 1 trên trình duyệt A (ví dụ: Chrome).
2. Mở trình duyệt B (ví dụ: Edge hoặc dùng Tab ẩn danh) và **Đăng nhập cùng tài khoản**.
3. Vào đúng chuyên ngành đó.
4. **Kết quả mong đợi**: Các câu hỏi bạn đã làm ở trình duyệt A phải hiển thị màu sắc tương ứng (Xanh/Đỏ) ngay lập tức ở trình duyệt B.

### Kịch bản 3: Hòa trộn dữ liệu (Merge)
1. **Đăng xuất**.
2. Khi đang ở trạng thái khách (Guest), trả lời 2 câu hỏi mới. (Lúc này dữ liệu lưu ở `localStorage`).
3. Thực hiện **Đăng nhập**.
4. **Kết quả mong đợi**: Sau khi đăng nhập, 2 câu hỏi bạn vừa làm lúc nãy sẽ được tự động đẩy lên Supabase và gộp chung vào lịch sử cũ.

### Kịch bản 4: Chế độ Khách (Offline fallback)
1. Đảm bảo đã đăng xuất.
2. Trả lời câu hỏi.
3. F5 trang web.
4. **Kết quả mong đợi**: Lịch sử vẫn còn (lấy từ `localStorage`) dù chưa đăng nhập.

## 3. Cách xem log debug (Cho nhà phát triển)
Mở Console (F12) để xem các thông báo:
- Nếu thấy lỗi `Error syncing practice history`, hãy kiểm tra lại quyền RLS trong Supabase.
- Kiểm tra `practice_stats` trong tab **Application -> Local Storage** để xem dữ liệu thô đang lưu dưới máy.

---
**Lưu ý**: Hệ thống sử dụng "Debounce 3s", nghĩa là dữ liệu chỉ đẩy lên cloud sau khi bạn ngừng click trả lời khoảng 3 giây để tiết kiệm tài nguyên.
