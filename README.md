# Luyện thi Chứng chỉ hành nghề Xây dựng

Web application ôn luyện và thi thử Chứng chỉ hành nghề Xây dựng theo QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng.

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: Zustand
- **Icons**: Lucide React

## 🎨 Design System

- **Primary Color**: Deep Blue `#1A202C`
- **Accent Color**: Crimson Red `#C53030`
- **Typography**: Minimum 16px for mobile readability
- **Style**: Modern, professional, responsive (PC & Mobile)

## 📋 Features (Theo QĐ 163/QĐ-BXD ngày 18/2/2025)

### Cấu trúc đề thi:
- 10 câu Pháp luật
- 20 câu Chuyên môn  
- **Tổng**: 30 câu

### Thời gian thi:
- 30 phút đếm ngược

### Điều kiện ĐẠT:
- Tổng điểm ≥ 21 **VÀ**
- Điểm Pháp luật ≥ 7

### Tính năng:
- ✅ Ôn luyện (xem đáp án)
- ✅ Thi thử (timer, chấm điểm tự động)
- ✅ Đánh dấu câu hỏi quan trọng
- ✅ Góp ý câu hỏi
- ✅ Lịch sử thi
- ✅ Xếp hạng (Leaderboard)
- ✅ Thống kê cá nhân
- ✅ Đồng bộ tiến trình (LocalStorage + Supabase)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Follow instructions in [`supabase/README.md`](./supabase/README.md) to:
- Create Supabase project
- Run database migration
- Enable Google Authentication
- Get API keys

### 3. Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
luyenthichungchixd/
├── app/
│   ├── (auth)/              # Authentication routes
│   ├── (main)/              # Main application routes
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/
│   ├── layout/              # Layout components (Sidebar, BottomNav)
│   ├── exam/                # Exam UI components
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── supabase/            # Supabase clients & types
│   ├── store/               # Zustand stores
│   └── utils/               # Utility functions
├── supabase/
│   ├── migration.sql        # Database schema
│   └── README.md            # Setup guide
└── types/                   # TypeScript types
```

## 📊 Database Schema

### Tables:
1. **categories** - Danh mục hạng, lĩnh vực
2. **questions** - Câu hỏi thi (id_cauhoi, câu hỏi, đáp án)
3. **profiles** - Thông tin người dùng và thống kê
4. **exam_results** - Lịch sử thi thử chi tiết
5. **user_feedback** - Góp ý câu hỏi

### Security:
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic profile creation on signup

## 🚧 Development Status

### ✅ Phase 1: Foundation (Completed)
- Next.js project setup
- Tailwind CSS configuration
- Supabase client integration
- Database schema created

### 🔄 Phase 2: In Progress
- Layouts (PC Sidebar, Mobile Bottom Nav)
- Exam interface components
- State management with Zustand

### ⏳ Phase 3: Upcoming
- Dashboard & statistics
- Leaderboard
- Profile page
- Payment integration (Buy me a Coffee)

## 📝 License

Private project for construction certification exam practice.

## 🙏 Support

MB Bank: **0989256894**
