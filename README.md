# Mini ERP + CRM Operations Portal

## Overview
This project combines a lightweight ERP and CRM backend with a responsive React admin dashboard for managing customers, products, stock movements, and challans.

## Features
- JWT authentication for admin, sales, warehouse, and accounts roles
- Customer CRM with follow-up notes
- Product and inventory management
- Stock adjustment workflow and movement history
- Challan creation and confirmation with transaction-safe stock deduction

## Architecture
- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL
- Frontend: React, Vite, TypeScript, Tailwind CSS

## Local setup
1. Copy backend/.env.example to backend/.env and set your database URL and JWT secret.
2. Copy frontend/.env.example to frontend/.env if you want to override the API URL.
3. Install backend dependencies: npm install
4. Run Prisma push and seed: npm run prisma:push && npm run seed
5. Start backend: npm run dev
6. In the frontend folder, install dependencies: npm install
7. Start frontend: npm run dev

## Test credentials
- Admin: admin@erp.com / Admin@123
- Sales: sales@erp.com / Sales@123
- Warehouse: warehouse@erp.com / Warehouse@123
- Accounts: accounts@erp.com / Accounts@123

## API overview
- POST /api/auth/login
- GET /api/auth/me
- GET /api/customers
- POST /api/customers
- GET /api/customers/:id
- PATCH /api/customers/:id
- POST /api/customers/:id/follow-ups
- GET /api/products
- POST /api/products
- PATCH /api/products/:id
- POST /api/products/:id/adjust-stock
- GET /api/challans
- POST /api/challans
- POST /api/challans/:id/confirm

## Postman
A usable Postman collection is available in the repository under docs/mini-erp-crm.postman_collection.json.
