# Plan B Implementation - Navigation UX Optimization

## Design Overview

### Key Improvements

1. **Navigation Buttons at Junction**: Place Previous/Next buttons **between question header and answer area**
2. **Scrollable Question Content**: Question text scrolls if long, preventing page height expansion
3. **Fixed Layout**: Entire practice area has fixed height, no page scrolling needed
4. **Optimized Mouse Travel**: Minimal distance between question → navigation → answers

---

## Layout Structure (Plan B) ⭐

```
┌─────────────────────────────────────────┐
│ Stats: Đã làm 0 | Chưa làm 97          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Câu 1 | Tất cả | Khảo sát địa hình     │ ← Question header
│─────────────────────────────────────────│
│ Đối với công tác khảo sát xây dựng...  │ ← Scrollable
│ (long question text scrolls here)       │ ← max-height
│ ↕ (scroll if needed)                    │ ← overflow-y-auto
│─────────────────────────────────────────│
│    [← Trước]  1/192  [Tiếp →]          │ ← Navigation at junction
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⭕ A. Lựa chọn...                        │ ← Answers
│ ⭕ B. Cung cấp...                        │
│ ⭕ C. Bồi thường...                      │
│ ⭕ D. Điều chỉnh...                      │
└─────────────────────────────────────────┘
```

---

## Implementation Details

### CSS Styling for Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--apple-border);
    border-radius: 3px;
}
```

---

## Verification Plan
1. **Desktop Navigation**: Buttons appear between question and answers.
2. **Scrollable Question**: Long questions show a styled scrollbar.
3. **Mobile Unchanged**: Bottom navigation pill still works.
