# Security Hardening Roadmap

This folder contains the technical plan and documentation for securing the **Luyện thi Chứng chỉ hành nghề Xây dựng** application.

## 📅 Phases

### Phase 1: Database Level Security (RLS & Triggers)
*   **Target**: Prevent data leakage and insertion spam.
*   **Actions**:
    *   Initialize `rate_limit` tracking on `profiles`.
    *   Update `exam_results` policies to prevent full table exposure.
    *   Harden `SECURITY DEFINER` functions.

### Phase 2: Application Layer (Middleware)
*   **Target**: Enforce server-side authentication.
*   **Actions**:
    *   Install `@supabase/ssr`.
    *   Properly configure `middleware.ts` for route protection.

### Phase 3: Bot Protection (WAF & Captcha)
*   **Target**: Prevent automated brute-force or spamming.
*   **Actions**:
    *   Integrate Cloudflare Turnstile for critical forms.

---

## 📄 Documents
1. [Security Audit](file:///e:/2026/Webapp/15.%20S%C3%A1t%20hach%20CCXD/luyenthichungchixd/Security_Plan/AUDIT.md) - Analysis of risks and vulnerabilities.
2. [Hardening SQL](file:///e:/2026/Webapp/15.%20S%C3%A1t%20hach%20CCXD/luyenthichungchixd/Security_Plan/hardening.sql) (Drafting) - Postgres implementation details.
