# Supabase Database Setup Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - **Name**: Luyện thi CCHN XD
   - **Database Password**: (Save this password!)
   - **Region**: Choose closest to Vietnam (Singapore recommended)
4. Wait for project to be provisioned

## Step 2: Run Database Migration

1. In your Supabase Dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Open the file `supabase/migration.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** button
7. Wait for confirmation message

## Step 3: Enable Authentication

1. Navigate to **Authentication** → **Providers**
2. Enable **Google** provider:
   - Follow Supabase instructions to configure Google OAuth
   - Add authorized redirect URLs:
     ```
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```

## Step 4: Get API Keys

1. Navigate to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public** key (API Key)
   - **service_role** key (Service Key - keep secret!)

## Step 5: Configure Environment Variables

1. In your project root, create `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 6: Verify Setup

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000
3. The app should load without errors

## Step 7: Test Database Connection

You can test the database by creating a test page or API route that queries Supabase.

## Database Schema Overview

### Tables Created:
1. **categories** - Danh mục hạng, lĩnh vực, loại phần thi
2. **questions** - Câu hỏi thi (10 Pháp luật + 20 Chuyên môn)
3. **profiles** - Thông tin người dùng và thống kê
4. **exam_results** - Lịch sử thi thử chi tiết
5. **user_feedback** - Góp ý câu hỏi từ người dùng

### Security:
- Row Level Security (RLS) enabled on all user tables
- Users can only view/edit their own data
- Automatic profile creation on signup
- Leaderboard accessible to all authenticated users

## Troubleshooting

### Error: "relation already exists"
- This is normal if you run the migration twice
- The script uses `IF NOT EXISTS` and `ON CONFLICT` to prevent duplicates

### Error: "permission denied"
- Make sure you're running the script as the database owner
- Check that RLS policies are correctly configured

### Authentication Issues
- Verify Google OAuth credentials
- Check authorized redirect URLs
- Ensure environment variables are correctly set

## Next Steps

1. Add real exam questions to the `questions` table
2. Configure Google OAuth fully
3. Test authentication flow
4. Begin building UI components
