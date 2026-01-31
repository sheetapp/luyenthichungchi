# Kỹ thuật Thao tác Rảnh tay (Hands-free Navigation) - Chuẩn ""Ôn tập""

Đây là tài liệu tổng hợp chính xác các quy tắc đang được áp dụng tại trang **Ôn tập**, dùng làm chuẩn để triển khai sang các trang khác.

## 1. Cơ chế Hoạt động

- **Sự kiện Global**: Lắng nghe `keydown` trên toàn bộ cửa sổ (`window`).
- **Input Guard**: Chặn xử lý hoàn toàn nếu người dùng đang focus vào ô nhập liệu (`INPUT`, `TEXTAREA`).
- **Khu vực (KB Area)**: Chia màn hình thành 2 vùng focus chính:
    - `sidebar`: Danh sách câu hỏi (Grid).
    - `main`: Nội dung chi tiết câu hỏi và đáp án.

## 2. Quy tắc Điều hướng

### Chuyển vùng (Tab)
- Phím `Tab` dùng để đảo focus giữa `sidebar` và `main`.
- **Logic Sync**:
    - Chuyển sang `sidebar`: Giữ nguyên vị trí focus tại câu hỏi hiện tại (`currentIndex`).
    - Chuyển sang `main`: Reset focus về phần tử đầu tiên (index 0 - thường là đáp án A).

### Vùng Sidebar (Danh sách câu hỏi)
- **Mũi tên Trái/Phải**: Di chuyển lùi/tiến 1 câu.
- **Mũi tên Lên/Xuống**: Di chuyển lùi/tiến 1 hàng (thường là +/- 6 hoặc 5 tùy grid layout).
- **Space/Enter**:
    1. Nhảy đến câu hỏi đang được focus (`jumpToQuestion`).
    2. Chuyển focus sang vùng `main` ngay lập tức.
    3. Reset focus index của `main` về 0.

### Vùng Main (Trả lời)
- **Mũi tên Lên/Xuống**: Di chuyển focus giữa các đáp án (A -> B -> C -> D).
- **Mũi tên Trái/Phải**: Chuyển sang câu hỏi Trước/Sau (`handlePrevious` / `handleNext`).
- **Space/Enter**: Chọn đáp án đang focus (`handleAnswerSelect`).

## 3. Đồng bộ State (Sync Logic)

Để đảm bảo trải nghiệm mượt mà giữa Chuột và Bàn phím:
- **Khi click chọn câu hỏi (Mouse)**: Phải cập nhật đồng thời `currentIndex` VÀ `kbFocusIndex` về cùng một giá trị.
- Điều này đảm bảo khi người dùng quay lại dùng bàn phím (vd: nhấn mũi tên phải), focus sẽ đi tiếp từ câu vừa click, không bị nhảy về vị trí cũ.

## 4. Visual Feedback (Hiển thị)

Cần có style riêng cho trạng thái focus của bàn phím, khác với trạng thái "đang chọn" (active) của chuột.

- **Sidebar Item**:
  ```tsx
  const isKbFocused = kbArea === 'sidebar' && kbFocusIndex === index
  // Style: ring-[3px] ring-blue/30 scale-110 z-10
  ```
- **Main Options**:
  ```tsx
  const isKbFocused = kbArea === 'main' && kbFocusIndex === index
  // Style: ring-[3px] ring-blue/50 z-10
  ```

## 5. Lưu ý Quan trọng
- **Không có Shortcut "Nộp bài"**: Trang Ôn tập hiện tại **không** có phím tắt `Ctrl + Enter` để nộp bài. (Không nên tự ý thêm vào Thi thử nếu muốn đồng bộ hoàn toàn).
- **Mobile Check**: Logic bàn phím nên được vô hiệu hóa trên mobile (`!isMobile`) để tránh xung đột với các thao tác chạm hoặc bàn phím ảo.
