-- ============================================
-- XUẤT CẤU TRÚC DATABASE HIỆN TẠI (ĐƠN GIẢN)
-- Copy toàn bộ và chạy trên Supabase SQL Editor
-- ============================================

-- 1. DANH SÁCH TẤT CẢ CÁC TABLES
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CẤU TRÚC CHI TIẾT TẤT CẢ CÁC TABLES
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. DANH SÁCH INDEXES
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. DANH SÁCH FOREIGN KEYS
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. RLS POLICIES
SELECT
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. ĐẾM SỐ RECORDS
SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as record_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
