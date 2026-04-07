# Prayas Multi-School Platform

Production-oriented multi-school management system for **3 schools** with role-based modules for super admin, school admins, students/parents, fee collections, bookstore, publications, and reports.

## Architecture Summary

- **Frontend**: Next.js (Vercel) with Razorpay Checkout for fee/book payments.
- **Backend**: Next.js API endpoints deployed separately on Render.
- **Database**: Hostinger hPanel PostgreSQL/MySQL-compatible target (Prisma currently configured for PostgreSQL).
- **Payments**: Razorpay-only flow with order creation, signature verification, and webhook validation.
- **Offline fees**: School-admin manual entries stored separately as `OFFLINE` channel records.

## Environment Variables

### Frontend (Vercel)
Use `env/frontend.env.example`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### Backend (Render)
Use `env/backend.env.example`:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `FRONTEND_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `CORS_ALLOWED_ORIGINS`

> Never expose `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, or database passwords in public variables.

## Razorpay Flow

1. Frontend calls `/api/payments/create-order` with `idempotencyKey`.
2. Backend creates Razorpay order and stores `Payment` in `PENDING`.
3. Checkout returns payment details to frontend handler.
4. Frontend calls `/api/payments/verify`.
5. Backend verifies HMAC signature and marks payment `PAID` or `FAILED`.
6. Razorpay webhook (`/api/payments/webhook`) independently verifies events for reconciliation.

## Offline Payment Flow

- School admin submits `/api/payments/offline`.
- Backend creates a `Payment` with `channel=OFFLINE` and linked `OfflinePaymentEntry`.
- No Razorpay trigger occurs for offline records.
- Super admin reporting can separately aggregate online/offline totals.

## API Endpoints

- `POST /api/auth/register`
- `GET /api/payments?userId=...`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/webhook`
- `POST /api/payments/offline`
- `GET /api/publications`
- `POST /api/publications`
- `GET /api/reports/payments`
- `GET /api/health`

## Deploy (Vercel + Render + Hostinger DB)

### 1) Database (Hostinger)
- Create PostgreSQL database.
- Whitelist Render outbound IPs if required.
- Build `DATABASE_URL` with SSL if required by Hostinger:
  - `postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public&sslmode=require`

### 2) Backend (Render)
- Deploy repo as Web Service using `render.yaml`.
- Configure all backend env vars from `env/backend.env.example`.
- Set webhook URL in Razorpay dashboard:
  - `https://<render-service>/api/payments/webhook`

### 3) Frontend (Vercel)
- Deploy frontend app.
- Configure frontend env vars from `env/frontend.env.example`.
- Set `NEXT_PUBLIC_API_URL` to Render backend base URL.

### 4) Razorpay Dashboard
- Use production/live keys in production.
- Add webhook secret and keep it only in backend env.
- Configure success/callback URLs to frontend domain.

## Credentials Mapping Template (fill from screenshots)

- `RAZORPAY_KEY_ID` = **needs confirmation from screenshot**
- `RAZORPAY_KEY_SECRET` = **needs confirmation from screenshot**
- `RAZORPAY_WEBHOOK_SECRET` = **needs confirmation from screenshot**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` = same as `RAZORPAY_KEY_ID`
- `DATABASE_URL` (Hostinger) = **needs confirmation from screenshot**
- `NEXT_PUBLIC_API_URL` (Render URL) = **needs confirmation from screenshot**
- `NEXT_PUBLIC_APP_URL` (Vercel URL/domain) = **needs confirmation from screenshot**

## Local Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Production Checklist

- [ ] SSL enabled for Vercel/Render custom domains
- [ ] All secrets set in Vercel/Render env manager
- [ ] Razorpay webhook secret set and verified
- [ ] DB SSL mode validated
- [ ] `NEXT_PUBLIC_API_URL` points to Render backend
- [ ] Health check (`/api/health`) returns ok
- [ ] Payment success/failure/webhook tested end-to-end
- [ ] Offline payment entry tested by school-admin role
- [ ] Super-admin report validates online vs offline totals
