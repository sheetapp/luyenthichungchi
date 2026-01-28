# 📋 Project Plan - Luyện thi Chứng chỉ hành nghề Xây dựng

**Last Updated:** 2026-01-24

---

## Current Status

**Phase:** Database Schema Setup (80%)  
**Current Task:** Execute update_schema.sql on Supabase

---

## Development Phases

### ✅ Phase 1: Supabase Integration (IN PROGRESS - 80%)
- [x] Environment setup
- [x] Schema analysis
- [x] TypeScript types
- [x] Helper utilities
- [x] SQL scripts (FIXED)
- [ ] **Execute update_schema.sql** ⏳ CURRENT
- [ ] Verify & test

**Est. Completion:** 2026-01-24

---

### ⏳ Phase 2: Authentication (NOT STARTED)
- [ ] Google OAuth setup
- [ ] Auth pages
- [ ] Profile page
- [ ] Protected routes

**Est. Start:** 2026-01-25

---

### ⏳ Phase 3: Ôn luyện Page (NOT STARTED)
- [ ] Filter component
- [ ] Question list
- [ ] Answer display
- [ ] Bookmark feature

**Est. Start:** 2026-01-27

---

### ⏳ Phase 4: Thi thử Page (NOT STARTED)
- [ ] Exam config
- [ ] Random selection (10 PL + 20 CM)
- [ ] Timer (30 min)
- [ ] Scoring algorithm
- [ ] Result page

**Est. Start:** 2026-01-30

---

### ⏳ Phase 5-10: Additional Features
- Statistics & History
- Leaderboard
- Feedback system
- Layout & Navigation
- Polish & Optimization
- Deployment

---

## Database Schema

**After update_schema.sql:**
- `categories` - Danh mục
- `questions` - Câu hỏi (from quesions)
- `profiles` - User info (updated)
- `exam_results` - Kết quả (updated)
- `user_feedback` - Góp ý

---

## Technical Decisions

**VARCHAR → TEXT:** Fixed length constraint errors  
**Keep quesions:** Backup data  
**Support config + categories:** Backward compatibility

---

## Files Reference

📂 **ProjectPlan/**
- `Completed_Task.md` - ✅ Done
- `OnProgress_Task.md` - 🔄 Current
- `Plan_Tasks.md` - 📋 This file
- `Walkthrough.md` - 📖 Docs
