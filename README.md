# Multi-School SaaS Platform (Production-Oriented Starter)

This repository delivers a deployment-ready **enterprise starter** for a centralized platform serving **3 schools** under one organization with multi-tenancy, RBAC, fee payments, offline collections, bookstore, results, publication workflow, and admin governance.

## 1) Project Folder Structure

```text
.
├── app/
│   ├── api/
│   │   ├── auth/register/route.ts
│   │   ├── books/
│   │   ├── health/route.ts
│   │   ├── payments/route.ts
│   │   ├── publications/route.ts
│   │   └── rankers/
│   ├── admin/
│   ├── student/
│   ├── layout.tsx
│   └── page.tsx
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── lib/prisma.ts
│   └── server/
│       ├── services/
│       │   ├── auth-service.ts
│       │   ├── payment-service.ts
│       │   └── publication-service.ts
│       └── validators/auth.ts
├── tests/register-schema.test.ts
├── .github/workflows/ci.yml
├── docker-compose.yml
├── Dockerfile
├── nginx/default.conf
├── .env.example
└── README.md
```

## 2) Database Schema

Implemented in `prisma/schema.prisma` with normalized relational entities and enums for:

- organizations, schools, users, roles, permissions
- students, parents, classes, sections, academic sessions
- fee structures, assignments, invoices, payments
- offline payment entries, payment receipts
- books, carts, orders, order items
- exam results, notices
- publications (approve/reject flow)
- rankers (super-admin updates)
- admin management logs (password change governance)
- audit logs, settings, payment gateways

### Your requested registration handling

- `PUBLIC` registration stores in `User` with:
  - `id, name, phone, email(optional), address, passwordHash, role=PUBLIC`
  - student-only fields remain null.
- `STUDENT` registration stores in `User` with:
  - `id, name, fatherName, rollNumber, caste, className, passwordHash, role=STUDENT`.

### Your requested payment/publication/book/ranker/admin rules

- `PaymentReceipt` stores `paymentId, userId, receiptPdfUrl`.
- Each user can query all receipts by `userId` (`GET /api/payments?userId=...`).
- Public user publication submit goes to `Publication` with pending status.
- Admin workflow supports status `PENDING/APPROVED/REJECTED`; approved publications are rendered on `app/page.tsx` (website index).
- Admin uploaded books are stored in `Book` (`title, author, price, available, coverImageUrl, pdfUrl, tags, description`).
- Super admin rankers stored in `Ranker`.
- Super admin password override logged in `AdminManagementLog`.

## 3) Key Architecture Explanation

- **Frontend**: Next.js App Router (TypeScript), responsive-first.
- **Backend**: API route modules with service layer abstraction.
- **ORM/DB**: Prisma + PostgreSQL.
- **Security**:
  - Password hashing via bcrypt.
  - Request validation via Zod.
  - RBAC enums and role model scaffolding.
- **Payments**:
  - payment + receipt tracking schema,
  - online/offline channel split,
  - idempotency + gateway reference fields.
- **Multi-tenancy**:
  - school-aware foreign keys,
  - super-admin can query cross-school,
  - school-admin scope by schoolId.
- **DevOps**:
  - Docker + docker-compose,
  - Nginx reverse proxy sample,
  - GitHub Actions CI for tests,
  - health endpoint.

## 4) Complete Implementation Code

Core implementation exists in this repository and is organized by modular boundaries:

- API endpoints in `app/api/**`
- business logic in `src/server/services/**`
- validation rules in `src/server/validators/**`
- persistent model and constraints in `prisma/schema.prisma`

## 5) Deployment Instructions

### Local

1. Install deps: `npm install`
2. Configure env from `.env.example`
3. Generate Prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate`
5. Seed sample data: `npm run prisma:seed`
6. Start dev server: `npm run dev`

### Docker (production style)

1. `docker compose build`
2. `docker compose up -d`
3. App at `http://localhost`

### Cloud/VPS notes

- Put SSL termination at Nginx/Load balancer.
- Use managed PostgreSQL backups (daily snapshot + WAL retention).
- Use object storage (S3/Cloudinary) for PDFs/images.
- Run migrations in deployment pipeline before app rollout.
- Add centralized logging (e.g., OpenSearch, Datadog, Loki).

## 6) Commands to Run (Local and Production)

```bash
# development
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# quality
npm run test

# production image
npm run build
npm run start

# containerized production-like
docker compose build
docker compose up -d
```

## Demo Accounts (seed)

- superadmin@demo.local / SuperAdmin@123
- admin1@demo.local / Admin@123
- admin2@demo.local / Admin@123
- admin3@demo.local / Admin@123

## Scalability Notes

- Add more schools by inserting new `School` rows (no schema rewrite).
- Payment gateway abstraction via `PaymentGateway` config table.
- Fine-grained permissions can be expanded through `Role` + `Permission` models.
