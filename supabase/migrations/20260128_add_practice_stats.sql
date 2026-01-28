-- ============================================
-- TẠO BẢNG LƯU TRỮ LỊCH SỬ ÔN TẬP
-- ============================================

CREATE TABLE IF NOT EXISTS user_practice_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    history JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE user_practice_stats ENABLE ROW LEVEL SECURITY;

-- Chính sách: Người dùng chỉ có thể xem dữ liệu của chính mình
DROP POLICY IF EXISTS "Users can view own practice stats" ON user_practice_stats;
CREATE POLICY "Users can view own practice stats" ON user_practice_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Chính sách: Người dùng có thể chèn dữ liệu của chính mình
DROP POLICY IF EXISTS "Users can insert own practice stats" ON user_practice_stats;
CREATE POLICY "Users can insert own practice stats" ON user_practice_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chính sách: Người dùng có thể cập nhật dữ liệu của chính mình
DROP POLICY IF EXISTS "Users can update own practice stats" ON user_practice_stats;
CREATE POLICY "Users can update own practice stats" ON user_practice_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger tự động cập nhật updated_at
DROP TRIGGER IF EXISTS tr_user_practice_stats_updated_at ON user_practice_stats;
CREATE TRIGGER tr_user_practice_stats_updated_at
    BEFORE UPDATE ON user_practice_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
