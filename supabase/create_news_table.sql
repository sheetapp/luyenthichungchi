-- ============================================
-- CREATE TABLE: library_posts (Tin tức & Tài liệu)
-- ============================================
-- NOTE: This table has been created in Supabase.
-- This file serves as documentation of the actual structure.

CREATE TABLE IF NOT EXISTS public.library_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NULL,                          -- HTML hoặc Markdown từ AI
    excerpt TEXT NULL,                          -- Tóm tắt ngắn
    thumbnail_url TEXT NULL,                    -- Ảnh đại diện bài viết
    category TEXT NULL DEFAULT 'news'::text,    -- 'news', 'guide', 'document'
    type TEXT NULL DEFAULT 'article'::text,     -- 'article', 'document', 'guide'
    attachments JSONB NULL DEFAULT '[]'::jsonb, -- [{name: "Văn bản 1.pdf", url: "...", size: "1.2MB"}]
    images JSONB NULL DEFAULT '[]'::jsonb,      -- Danh sách ảnh trong bài
    is_published BOOLEAN NULL DEFAULT true,
    view_count INTEGER NULL DEFAULT 0,
    author_id UUID NULL,
    created_at TIMESTAMPTZ NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NULL DEFAULT now(),
    CONSTRAINT library_posts_pkey PRIMARY KEY (id),
    CONSTRAINT library_posts_slug_key UNIQUE (slug),
    CONSTRAINT library_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id)
) TABLESPACE pg_default;

-- BẬT RLS
ALTER TABLE library_posts ENABLE ROW LEVEL SECURITY;

-- POLICY: Mọi người đều có thể xem bài viết đã xuất bản
CREATE POLICY "Anyone can view published posts" ON library_posts
    FOR SELECT USING (is_published = true);

-- POLICY: Admin có toàn quyền quản lý
CREATE POLICY "Admins can manage library_posts" ON library_posts
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN (
            'nhuongggh@gmail.com',
            'sheetappai@gmail.com',
            'bimvietsolutions@gmail.com'
        )
    );

-- TRIGGER: Tự động cập nhật ngày updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_library_posts_updated_at
    BEFORE UPDATE ON library_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFIED STRUCTURE:
-- ✅ Table created successfully in Supabase
-- ✅ RLS policies active
-- ✅ Trigger for auto-updating timestamps
-- ✅ Foreign key to profiles table
-- ✅ JSONB support for attachments and images
-- ============================================
