# Architecture

SherPOS follows a standard SaaS architecture.

## Frontend
Next.js App Router with Route Groups for separation of concerns:
- `(marketing)`: Public pages (Landling, Pricing)
- `(app)`: Tenant Dashboard (Secure)
- `(pos)`: Point of Sale Interface (Optimized for touch/speed)
- `(admin)`: Super Admin (Internal tools)

## Backend
Go API using Gin.
- Monolithic API for simplicity initially.
- Tenant isolation via `tenant_id` in database tables.

## Database
PostgreSQL.
- `tenants`: Stores tenant info.
- `users`: Stores user info linked to tenants.
- Shared database, row-level isolation.
