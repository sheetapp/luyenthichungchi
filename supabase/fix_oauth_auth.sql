-- ============================================
-- FIX OAUTH AUTHENTICATION & PROFILE CREATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Fix RLS Policies for profiles table
DROP POLICY IF EXISTS "Profiles access" ON profiles;
DROP POLICY IF EXISTS "Profiles insert" ON profiles;
DROP POLICY IF EXISTS "Profiles select" ON profiles;
DROP POLICY IF EXISTS "Profiles update" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Profiles select" ON profiles 
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Profiles update" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role to insert profiles (for trigger)
CREATE POLICY "Profiles insert" ON profiles 
    FOR INSERT WITH CHECK (true);

-- 2. Fix the trigger to use AFTER INSERT instead of BEFORE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, user_name, avata)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        avata = COALESCE(EXCLUDED.avata, profiles.avata);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger AFTER INSERT
CREATE TRIGGER on_auth_user_created 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- 4. Verify the setup
SELECT 
    'Trigger exists' as check_type,
    EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) as result;

SELECT 
    'RLS enabled' as check_type,
    relrowsecurity as result
FROM pg_class 
WHERE relname = 'profiles';

SELECT 
    'Policies count' as check_type,
    COUNT(*) as result
FROM pg_policies 
WHERE tablename = 'profiles';
