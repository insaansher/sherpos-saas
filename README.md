# SherPOS - SaaS POS System

A modern SaaS Point of Sale system built with Next.js and Go.

## Structure

- `frontend/`: Next.js (App Router with Route Groups)
- `backend/`: Go (Gin Framework)
- `docs/`: Documentation

## Phase 4: Core POS Engine & Sales (Beta)

### Status
- **POS UI**: `/pos` route (dedicated layout) with Product Grid, Cart, Discount, and Checkout.
- **Backend**: Transactional sales, stock management, invoice generation (`INV-YYYY-XXXXXX`).
- **Phase 3**: Admin Plan Management (`/admin/plans`) fully editable.

### Getting Started

#### 1. Database
Ensure PostgreSQL is running.
Run the complete SQL schema from `backend/sql/schema.sql` to create new tables (`products`, `sales`, etc.).

#### 2. Backend
```powershell
cd backend
go mod tidy
go run main.go
```
*Server runs on port 8080*
*Auto-seeds demo products if none exist.*

#### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```
*App runs on port 3000*

### Testing Guide

#### Admin Plans (Phase 3)
1. **Login** as Platform Admin.
2. Go to `/admin/plans`.
3. Create, edit (prices/limits), or clone plans. Changes reflect on `/pricing`.

#### POS Sales (Phase 4)
1. **Login** as a Tenant User (e.g., `owner@store.com`).
2. Navigate to `/pos`.
3. **Products**: You should see demo products (Coffee, Tea, etc.) seeded automatically.
4. **Sale**: 
   - Click products to add to cart.
   - Adjust quantity (stock is enforced).
   - Click "PAY" to complete sale.
   - A success invoice modal will appear.

### Security Note
- **POS Access**: Strictly limited to `owner`, `manager`, `cashier` roles.
- **Stock**: Decrements atomically. Prevented from going below 0 via API logic.
