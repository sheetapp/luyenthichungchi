-- ============================================
-- SOURCE OF TRUTH - CẤU TRÚC TOÀN BỘ DATABASE
-- Sử dụng file này làm căn cứ để viết code
-- ============================================

/*
1. TABLE: config (Dữ liệu cố định bạn đã import)
   - id: TEXT (cd001, cd002...)
   - data_name: TEXT (Filter...)
   - data_type: TEXT (hang, phan_thi, chuyen_nganh, chi_muc)
   - data_value: TEXT (Hạng I, Pháp luật chung, 1.1...)

2. TABLE: questions (Dữ liệu câu hỏi bạn đã import)
   - id_cauhoi: BIGINT (PK)
   - chi_muc: TEXT
   - stt: BIGINT
   - phan_thi: TEXT
   - chuyen_nganh: TEXT
   - hang: TEXT
   - cau_hoi: TEXT
   - dap_an_a: TEXT
   - dap_an_b: TEXT
   - dap_an_c: TEXT
   - dap_an_d: TEXT
   - dap_an_dung: TEXT ('a', 'b', 'c', 'd')
   - Loai_number: TEXT ('I', 'II', 'III'...)

3. TABLE: profiles (Dữ liệu người dùng)
   - id: UUID (PK)
   - email: TEXT
   - user_name: TEXT
   - display_name: TEXT
   - phone: TEXT
   - status: TEXT
   - avata: TEXT
   - job_title: TEXT
   - gender: TEXT

4. TABLE: exam_results (Lịch sử thi)
   - id: UUID (PK)
   - user_id: UUID (FK)
   - hang: TEXT
   - chuyen_nganh: TEXT
   - score: INTEGER
   - total_questions: INTEGER
   - law_correct: INTEGER
   - specialist_correct: INTEGER
   - time_taken: INTEGER
   - passed: BOOLEAN
   - answers: JSONB (Dạng [ { q_id: 1, choice: 'a', correct: true }, ... ])
*/
