-- ============================================
-- Luyện thi Chứng chỉ hành nghề Xây dựng
-- Database Schema Migration
-- Nghị định 175/2024/NĐ-CP
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: categories
-- Lưu danh mục Hạng, Lĩnh vực, và Loại phần thi
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'hang', 'linh_vuc', 'loai_phan_thi'
  code VARCHAR(10) NOT NULL, -- I, II, III hoặc mã lĩnh vực
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

-- Insert initial categories
INSERT INTO categories (type, code, name, description) VALUES
('hang', 'I', 'Hạng I', 'Chứng chỉ hạng I'),
('hang', 'II', 'Hạng II', 'Chứng chỉ hạng II'),
('hang', 'III', 'Hạng III', 'Chứng chỉ hạng III'),
('loai_phan_thi', 'PHAP_LUAT', 'Pháp luật', 'Phần thi Pháp luật (10 câu)'),
('loai_phan_thi', 'CHUYEN_MON', 'Chuyên môn', 'Phần thi Chuyên môn (20 câu)')
ON CONFLICT DO NOTHING;

-- ============================================
-- TABLE: questions
-- Lưu câu hỏi thi
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id_cauhoi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hang VARCHAR(10) NOT NULL, -- I, II, III
  phan_thi VARCHAR(50) NOT NULL, -- 'Pháp luật', 'Chuyên môn'
  chuyen_nganh TEXT, -- Optional
  cau_hoi TEXT NOT NULL,
  dap_an_a TEXT,
  dap_an_b TEXT,
  dap_an_c TEXT,
  dap_an_d TEXT,
  dap_an_dung VARCHAR(1) NOT NULL CHECK (dap_an_dung IN ('a', 'b', 'c', 'd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for questions
CREATE INDEX IF NOT EXISTS idx_questions_hang ON questions(hang);
CREATE INDEX IF NOT EXISTS idx_questions_phan_thi ON questions(phan_thi);
CREATE INDEX IF NOT EXISTS idx_questions_chuyen_nganh ON questions(chuyen_nganh);

-- ============================================
-- TABLE: profiles
-- Lưu thông tin người dùng
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar TEXT,
  stats JSONB DEFAULT '{
    "total_exams": 0,
    "avg_score": 0,
    "highest_score": 0,
    "total_practice_questions": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE: exam_results
-- Lưu lịch sử thi thử
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hang VARCHAR(10) NOT NULL,
  chuyen_nganh TEXT,
  total_questions INTEGER NOT NULL DEFAULT 30,
  correct_answers INTEGER NOT NULL,
  law_correct INTEGER NOT NULL, -- Số câu đúng phần Pháp luật
  specialist_correct INTEGER NOT NULL, -- Số câu đúng phần Chuyên môn
  total_score INTEGER NOT NULL, -- Tổng điểm (= correct_answers)
  law_score INTEGER NOT NULL, -- Điểm Pháp luật (= law_correct)
  time_spent INTEGER NOT NULL, -- Thời gian hoàn thành (giây)
  passed BOOLEAN NOT NULL, -- ĐẠT/KHÔNG ĐẠT
  answers JSONB NOT NULL, -- Lưu chi tiết câu trả lời
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for exam_results
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_created_at ON exam_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_passed ON exam_results(passed);
CREATE INDEX IF NOT EXISTS idx_exam_results_score ON exam_results(total_score DESC);

-- Enable RLS for exam_results
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_results
DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
CREATE POLICY "Users can view own results" ON exam_results
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own results" ON exam_results;
CREATE POLICY "Users can insert own results" ON exam_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for leaderboard (allow viewing all results for ranking)
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON exam_results;
CREATE POLICY "Anyone can view leaderboard" ON exam_results
  FOR SELECT USING (true);

-- ============================================
-- TABLE: user_feedback
-- Lưu góp ý câu hỏi từ người dùng
-- ============================================
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id_cauhoi) ON DELETE CASCADE NOT NULL,
  feedback_type VARCHAR(50) NOT NULL, -- 'error', 'suggestion', 'unclear'
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_question_id ON user_feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status);

-- Enable RLS for user_feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON user_feedback;
CREATE POLICY "Users can create feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to questions
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Insert sample questions (you'll need to add real questions later)
INSERT INTO questions (hang, phan_thi, cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, dap_an_dung) VALUES
('I', 'Pháp luật', 'Nghị định 175/2024/NĐ-CP có hiệu lực từ ngày nào?', '01/01/2024', '15/02/2024', '01/03/2024', '01/04/2024', 'b'),
('I', 'Pháp luật', 'Thời gian thi cho mỗi bài thi là bao nhiêu phút?', '20 phút', '30 phút', '45 phút', '60 phút', 'b')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETED
-- ============================================
-- Run this script in Supabase SQL Editor
-- Navigate to: Dashboard → SQL Editor → New Query
-- Paste this entire script and click "Run"
