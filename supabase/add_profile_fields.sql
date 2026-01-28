-- SQL script to add missing profile fields
-- Chạy script này trong Supabase SQL Editor

-- Thêm column company (nếu chưa có)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'company'
    ) THEN
        ALTER TABLE profiles ADD COLUMN company TEXT;
    END IF;
END $$;

-- Thêm column address (nếu chưa có)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;
END $$;

-- Đảm bảo column gender tồn tại (đã có trong một số script trước nhưng để chắc chắn)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'gender'
    ) THEN
        ALTER TABLE profiles ADD COLUMN gender TEXT;
    END IF;
END $$;
