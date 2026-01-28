-- Thêm cột is_public vào bảng exam_results nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE exam_results ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Thêm comment giải thích
COMMENT ON COLUMN exam_results.is_public IS 'Xác định kết quả thi có được hiển thị trên bảng xếp hạng (Leaderboard) hay không';
