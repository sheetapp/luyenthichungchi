# Hướng dẫn tích hợp Bảo mật & Chống Spam (Step-by-Step)

Tài liệu này hướng dẫn chi tiết cách kích hoạt hệ thống bảo mật đa tầng cho dự án "Luyện thi CCXD XD".

## 1. Đăng ký & Lấy khóa Cloudflare Turnstile

Đây là bước quan trọng nhất để kích hoạt bộ lọc Bot (CAPTCHA) trên các form.

### Bước 1: Khởi tạo tài khoản
1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/sign-up).
2. Đăng ký tài khoản mới (hoặc đăng nhập nếu đã có).

### Bước 2: Thiết lập Site (Trang web)
1. Ở thanh menu bên trái, tìm và chọn mục **Turnstile**.
2. Nhấn nút **Add Site**.
3. Cấu hình các thông số sau:
   - **Site Name**: `Luyện thi CCXD XD` (hoặc tên bất kỳ bạn muốn).
   - **Domain**: Thêm `localhost` (để test máy ảo) và các domain thực tế của bạn (ví dụ: `luyenthindexd.com`, `ten-du-an.vercel.app`).
   - **Widget Mode**: Chọn **Managed** (Đây là chế độ thông minh nhất, chỉ hiện thử thách nếu phát hiện bot).
4. Nhấn **Create**.

### Bước 3: Lưu trữ khóa (Keys)
Sau khi nhấn Create, bạn sẽ thấy 2 loại khóa:
- **Site Key**: Copy và dán vào biến `NEXT_PUBLIC_TURNSTILE_SITE_KEY` trong file `.env`.
- **Secret Key**: Copy và dán vào biến `TURNSTILE_SECRET_KEY`.

---

## 2. Cấu hình Hệ thống & Biến môi trường

### Bước 1: Cập nhật file .env trên Server (Vercel/Hosting)
Đảm bảo bạn đã thêm 2 dòng sau vào cấu hình Environment Variables:
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=6L... (lấy từ Cloudflare)
TURNSTILE_SECRET_KEY=0x... (lấy từ Cloudflare)
```

### Bước 2: Kiểm tra cài đặt code
Tôi đã cài đặt sẵn thư viện `@marsidev/react-turnstile` và tích hợp vào mục **Góp ý**. Khi bạn thêm Site Key vào `.env`, widget sẽ tự động hiển thị.

---

## 3. Cấu hình Database (Thực hiện trên Supabase)

Lớp bảo mật này giúp ngăn chặn các cuộc tấn công trực tiếp vào Database thông qua API.

### Bước 1: Mở SQL Editor
1. Truy cập vào [Supabase Dashboard](https://supabase.com/dashboard).
2. Chọn dự án của bạn.
3. Ở menu bên trái, chọn biểu tượng **SQL Editor** (>_).

### Bước 2: Thực thi lệnh bảo mật
1. Mở file [security_hardening.sql](./security_hardening.sql) trong thư mục này.
2. Sao chép (Copy) toàn bộ mã trong file.
3. Dán (Paste) vào SQL Editor của Supabase.
4. Nhấn nút **Run**.

**Lưu ý quan trọng về logic:**
- **Rate Limit**: Mỗi người dùng chỉ được gửi 1 góp ý/phút và 1 kết quả thi/5 phút. Điều này dựa trên logic thực tế: không ai có thể làm xong một bài thi 30 câu trong vòng 1-2 phút một cách bình thường.
- **RLS**: Tôi đã thắt chặt quyền truy cập để đảm bảo dữ liệu của bạn không bị rò rỉ hoặc bị xóa sửa trái phép qua API.

---

## 4. Kiểm tra & Vận hành

Sau khi hoàn tất 3 bước trên, bạn có thể kiểm tra:
1. Mở Modal **Góp ý**: Phải thấy biểu tượng Cloudflare Turnstile hiện ra ở dưới cùng.
2. Thử gửi góp ý liên tục: Hệ thống sẽ báo lỗi `Rate limit exceeded` nếu gửi quá 1 lần trong 1 phút.
3. Thử gửi bài thi liên tục: Tương tự, nếu gửi quá nhanh sẽ bị chặn tại Database.
