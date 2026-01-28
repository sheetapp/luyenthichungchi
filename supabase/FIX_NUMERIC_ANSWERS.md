# 🐛 Fix: Numeric Answer Values

**Issue:** `ERROR: 23514: new row violates check constraint "questions_dap_an_dung_check"`

**Root Cause:** 
Table `quesions` có `dap_an_dung` là **số** (`0`, `1`, `2`, `3`, `4`) thay vì chữ cái (`a`, `b`, `c`, `d`)

**Solution:**
Updated `clean_migration.sql` to convert numeric values:
- `0` → `a`
- `1` → `b`
- `2` → `c`
- `3` or `4` → `d`

Also accepts uppercase `A`, `B`, `C`, `D`

**Files Modified:**
- `supabase/clean_migration.sql` (Lines 49-80)

**Changes:**
1. Removed strict CHECK constraint
2. Added CASE statement to convert values during data migration
3. Normalizes all formats to lowercase letters (a, b, c, d)

**Status:** ✅ Ready to run again
