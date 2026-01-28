-- ============================================
-- EXPORT CURRENT DATABASE SCHEMA
-- Script để xuất cấu trúc tables hiện tại trên Supabase
-- ============================================
-- Hướng dẫn sử dụng:
-- 1. Vào Supabase Dashboard → SQL Editor
-- 2. Tạo New Query
-- 3. Copy và paste script này
-- 4. Click "Run"
-- 5. Copy kết quả và gửi cho developer
-- ============================================

-- ============================================
-- 1. DANH SÁCH TẤT CẢ CÁC TABLES
-- ============================================
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. CẤU TRÚC CHI TIẾT CỦA TABLE: categories
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'categories'
ORDER BY ordinal_position;

-- ============================================
-- 3. CẤU TRÚC CHI TIẾT CỦA TABLE: questions
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'questions'
ORDER BY ordinal_position;

-- ============================================
-- 4. CẤU TRÚC CHI TIẾT CỦA TABLE: profiles
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 5. CẤU TRÚC CHI TIẾT CỦA TABLE: exam_results
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'exam_results'
ORDER BY ordinal_position;

-- ============================================
-- 6. CẤU TRÚC CHI TIẾT CỦA TABLE: user_feedback
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_feedback'
ORDER BY ordinal_position;

-- ============================================
-- 7. DANH SÁCH CÁC INDEXES
-- ============================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 8. DANH SÁCH RLS POLICIES
-- ============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 9. FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 10. ĐẾM SỐ LƯỢNG RECORDS TRONG TỪNG TABLE
-- ============================================
SELECT 
    'categories' as table_name,
    COUNT(*) as record_count
FROM categories
UNION ALL
SELECT 
    'questions' as table_name,
    COUNT(*) as record_count
FROM questions
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
    'exam_results' as table_name,
    COUNT(*) as record_count
FROM exam_results
UNION ALL
SELECT 
    'user_feedback' as table_name,
    COUNT(*) as record_count
FROM user_feedback;

-- ============================================
-- KẾT THÚC
-- ============================================
-- Sau khi chạy script này, hãy copy toàn bộ kết quả
-- và gửi cho developer để phân tích cấu trúc database
-- ============================================
