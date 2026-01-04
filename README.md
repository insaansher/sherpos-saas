# SherPOS - SaaS POS System

A modern SaaS Point of Sale system built with Next.js and Go.

## Structure

- `frontend/`: Next.js (App Router with Route Groups)
- `backend/`: Go (Gin Framework)
- `docs/`: Documentation

## Phase 2: Authentication & Onboarding (Security Updated)

### Status
- **Auth**: JWT in HttpOnly Cookies + CSRF Protection + DB Revalidation
- **Onboarding**: Check enforced before POS access
- **Isolation**: Strict Platform Admin vs Tenant User separation

### Getting Started

#### 1. Database
Ensure PostgreSQL is running.
Run the SQL in `backend/sql/schema.sql`.

#### 2. Backend
```powershell
cd backend
go mod tidy
go run main.go
```
*Server runs on port 8080*

#### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```
*App runs on port 3000*

### Testing Security (Isolation)
1. **Register User**: Create a normal tenant (e.g. coffee-shop).
   - Access `/app/dashboard` -> OK.
   - Access `/admin` -> Redirects to Dashboard (Blocked).
   
2. **Promote to Admin**:
   - Manually in DB: `UPDATE users SET role='platform_admin', tenant_id=NULL WHERE email='your@email.com';`
   - Logout and Login again.
   
3. **Verify Admin Access**:
   - Access `/admin` -> OK.
   - Access `/app/dashboard` -> Redirects to `/admin` (Blocked).
   - Access `/pos` -> Redirects to `/admin` (Blocked).
   - Access API `/api/v1/pos/ping` -> 403 Forbidden.

### Auth Flow
1. **Register**: `/register` -> Creates Tenant & Owner User.
2. **Login**: `/login` -> Sets HttpOnly Cookie.
3. **App**: `/app/dashboard` -> Protected (redirects to login).
4. **Onboarding**: Redirects to `/app/onboarding` if tenant setup incomplete.
5. **POS**: `/pos` -> Blocked until onboarding complete.
