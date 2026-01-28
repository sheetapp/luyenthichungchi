# Quy tắc Module Thi Thử

## Mục đích
Module Thi Thử mô phỏng **kỳ thi thật** để kiểm tra kiến thức của người dùng.

## Quy định thi chính thức

### Cấu trúc đề thi
- **10 câu** Pháp luật (Chung + Riêng)
- **20 câu** Chuyên môn
- **Tổng: 30 câu**
- **Thời gian: 30 phút**

### Điểm số
- **Pháp luật**: 10 điểm (tối đa)
- **Chuyên môn**: 20 điểm (tối đa)
- **Tổng**: 30 điểm
- **Mỗi câu đúng**: 1 điểm

### Điều kiện đạt
✅ **Pháp luật**: ≥ 7 điểm  
✅ **Tổng điểm**: ≥ 21 điểm

**Cả 2 điều kiện phải thỏa mãn** thì mới đạt yêu cầu.

## Luồng hoạt động

### 1. Chọn đề thi
User chọn:
- **Hạng thi**: Hạng I / Hạng II / Hạng III
- **Chuyên ngành**: 1 trong 19 chuyên ngành

### 2. Tạo đề thi ngẫu nhiên

```typescript
// Bước 1: Lấy 10 câu Pháp luật (random từ chung + riêng)
const phapLuat = await supabase
  .from('questions')
  .select('*')
  .eq('hang', selectedHang)
  .in('phan_thi', ['Câu hỏi Pháp luật chung', 'Câu hỏi Pháp luật riêng'])
  .order('RANDOM()')
  .limit(10)

// Bước 2: Lấy 20 câu Chuyên môn (random)
const chuyenMon = await supabase
  .from('questions')
  .select('*')
  .eq('hang', selectedHang)
  .eq('chuyen_nganh', selectedChuyenNganh)
  .eq('phan_thi', 'Câu hỏi Chuyên môn')
  .order('RANDOM()')
  .limit(20)

// Bước 3: Gộp lại thành đề thi 30 câu
const examQuestions = [...phapLuat, ...chuyenMon]
```

### 3. Trong khi làm bài
- **Đếm ngược thời gian**: 30:00 → 00:00
- **Không hiển thị đáp án đúng**
- Cho phép chọn đáp án A/B/C/D
- Có nút "Nộp bài" hoặc hết giờ tự động nộp

### 4. Sau khi nộp bài

#### Tính điểm
```typescript
let phapLuatScore = 0
let chuyenMonScore = 0

// Chấm 10 câu Pháp luật
for (let i = 0; i < 10; i++) {
  if (userAnswers[i] === correctAnswers[i]) {
    phapLuatScore++
  }
}

// Chấm 20 câu Chuyên môn
for (let i = 10; i < 30; i++) {
  if (userAnswers[i] === correctAnswers[i]) {
    chuyenMonScore++
  }
}

const totalScore = phapLuatScore + chuyenMonScore
const isPassed = phapLuatScore >= 7 && totalScore >= 21
```

#### Hiển thị kết quả
- **Điểm Pháp luật**: X/10
- **Điểm Chuyên môn**: Y/20
- **Tổng điểm**: Z/30
- **Kết quả**: ĐẠT / KHÔNG ĐẠT
- **Chi tiết**: Hiển thị từng câu với đáp án đúng/sai

### 5. Lưu kết quả
Lưu vào bảng `exam_results`:
- `user_id`
- `hang`
- `chuyen_nganh`
- `phap_luat_score`
- `chuyen_mon_score`
- `total_score`
- `is_passed`
- `time_taken` (giây)
- `created_at`

## Giao diện

### Màn hình thi
- Timer đếm ngược nổi bật
- Hiển thị số câu đã làm / tổng số câu
- Navigation giữa các câu
- Nút "Nộp bài" luôn hiển thị

### Màn hình kết quả
- Thống kê tổng quan (điểm, thời gian)
- Badge ĐẠT/KHÔNG ĐẠT rõ ràng
- Chi tiết từng câu với highlight đúng/sai
- Nút "Thi lại" và "Về trang chủ"

## Phân biệt với Module Ôn Tập

| Tiêu chí | Thi Thử | Ôn Tập |
|----------|---------|--------|
| Số câu hỏi | 30 câu (10 PL + 20 CM) | Tất cả |
| Hiển thị đáp án | Sau khi nộp bài | Ngay lập tức |
| Thời gian | 30 phút | Không giới hạn |
| Chấm điểm | Có (≥7 PL, ≥21 tổng) | Không |
| Mục đích | Kiểm tra kiến thức | Học và ghi nhớ |
| Lưu kết quả | Có | Không |
