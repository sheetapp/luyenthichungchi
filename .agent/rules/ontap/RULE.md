# Quy tắc Module Ôn Tập

## Mục đích
Module Ôn Tập cho phép người dùng xem **TẤT CẢ** câu hỏi kèm đáp án để học và ghi nhớ.

## Luồng hoạt động

### 1. Từ Trang chủ
User chọn:
- **Hạng thi**: Hạng I / Hạng II / Hạng III
- **Chuyên ngành**: Click vào 1 trong 19 chuyên ngành

→ Chuyển đến: `/on-tap?hang=Hạng I&chuyen_nganh=Khảo sát địa hình`

### 2. Trang Ôn Tập
Hiển thị **3 tabs**:
- **Pháp luật chung**
- **Pháp luật riêng**
- **Chuyên môn**

### 3. Khi click vào từng tab
Hiển thị **TẤT CẢ** câu hỏi thuộc:
- `hang` = Hạng đã chọn
- `chuyen_nganh` = Chuyên ngành đã chọn
- `phan_thi` = Tab đang chọn

## Database Query

```typescript
const { data: questions } = await supabase
  .from('questions')
  .select('*')
  .eq('hang', searchParams.hang)
  .eq('chuyen_nganh', searchParams.chuyen_nganh)
  .eq('phan_thi', selectedTab) // 'Câu hỏi Pháp luật chung' | 'Câu hỏi Pháp luật riêng' | 'Câu hỏi Chuyên môn'
  .order('id', { ascending: true })
```

## Hiển thị mỗi câu hỏi

Mỗi câu hỏi hiển thị:
1. **Số thứ tự**: Câu 1, Câu 2, ...
2. **Nội dung câu hỏi**: `cau_hoi`
3. **4 đáp án**:
   - A. `dap_an_a`
   - B. `dap_an_b`
   - C. `dap_an_c`
   - D. `dap_an_d`
4. **Đáp án đúng**: Highlight màu xanh lá (ví dụ: "✓ Đáp án: B")

## Giao diện

- **Không có giới hạn thời gian**
- **Không có chấm điểm**
- **Hiển thị ngay đáp án đúng** để user học
- Có thể scroll xem hết tất cả câu hỏi
- Layout dạng card, dễ đọc

## Phân biệt với Module Thi Thử

| Tiêu chí | Ôn Tập | Thi Thử |
|----------|--------|---------|
| Số câu hỏi | Tất cả | 30 câu (10 PL + 20 CM) |
| Hiển thị đáp án | Ngay lập tức | Sau khi nộp bài |
| Thời gian | Không giới hạn | 30 phút |
| Chấm điểm | Không | Có (≥7 PL, ≥21 tổng) |
| Mục đích | Học và ghi nhớ | Kiểm tra kiến thức |
