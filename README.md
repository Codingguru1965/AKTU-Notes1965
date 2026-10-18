# AKTU Notes1965

> **Tagline:** Study Smart. Score Better.  
> **Mission:** A free, public, and open directory of academic resources for students of Dr. A.P.J. Abdul Kalam Technical University (AKTU), Uttar Pradesh.

[![Live Demo](https://img.shields.io/badge/Live%20Website-Vercel-black?style=for-the-badge&logo=vercel)](https://aktu-notes1965.vercel.app)
[![API Status](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://aktu-notes1965.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)

---

## 1. Project Overview

**AKTU Notes1965** is an independent, responsive, production-grade academic portal designed to give engineering students instant, friction-free access to semester study materials.

Students can search, filter, preview, and download published academic resources directly without registering, creating accounts, or logging in.

### Live Deployments

- 🌐 **Public Website:** [https://aktu-notes1965.vercel.app](https://aktu-notes1965.vercel.app)
- 🔒 **Admin Portal:** [https://aktu-notes1965.vercel.app/admin/login](https://aktu-notes1965.vercel.app/admin/login)
- ⚡ **Backend API Health:** [https://aktu-notes1965.onrender.com/api/health](https://aktu-notes1965.onrender.com/api/health)

### Supported Resources

- **AKTU Syllabus PDFs:** Unit-wise breakdowns, course outcomes, reference textbooks, and question pattern distributions.
- **Lecture Notes:** High-quality handwritten and typed notes from faculty and top-performing students.
- **Previous-Year Question Papers (PYQs):** Solved and unsolved past university end-semester papers.

### Non-Affiliation Disclaimer

*AKTU Notes1965 is an independent student resource platform. It is not affiliated with, authorized by, or endorsed by Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow.*

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js with Vite
- **Routing:** React Router v7 (with client-side SPA routing via `vercel.json`)
- **HTTP Client:** Axios (configured with credentialed cookies and base URL interceptors)
- **Styling:** Bootstrap 5 with custom CSS design tokens matching the brand palette
- **Icons:** React Icons (`react-icons/fi`)
- **Testing:** Vitest, React Testing Library, and jsdom (12/12 tests passing)

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas / Local MongoDB with Mongoose ODM
- **Authentication:** Server-verified HTTP-only cookies storing JWT sessions
- **Password Security:** bcryptjs (salted with 12 rounds)
- **Validation:** Zod schemas for incoming request bodies, parameters, and query strings
- **Security:** Helmet (HTTP security headers), strict CORS allowlist, express-rate-limit (brute-force login protection)
- **Testing:** Jest, Supertest, and Cross-Env (24/24 tests passing)

---

## 3. Brand Identity & Visual Design

- **Primary Navy:** `#102C54`
- **Sky Blue:** `#72B7FF`
- **White:** `#FFFFFF`
- **Light Background:** `#F5F8FC`
- **Main Text:** `#172033`
- **Muted Text:** `#64748B`

### Brand Assets
- `frontend/public/logo.svg`: Main brand logo with graduation cap, open book, wordmark, and tagline.
- `frontend/public/icon.svg`: Compact mobile navbar emblem and vector favicon.
- `frontend/src/assets/logo.svg`: Bundled React asset.

---

## 4. Prerequisites

- **Node.js:** v18.0.0 or higher (v24 LTS tested)
- **npm:** v9.0.0 or higher
- **MongoDB:** Local MongoDB instance running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI.

---

## 5. Local Installation & Setup

Open Windows PowerShell and navigate to the project root directory:

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965'
```

### Step 1: Install Backend Dependencies

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'
npm install
```

### Step 2: Configure Backend Environment Variables

Create `.env` inside `backend/` using the following template (replace placeholders with your private local values):

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/aktu_notes1965
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=your_minimum_32_characters_random_secret_key_here
JWT_EXPIRES_IN=24h
COOKIE_NAME=aktu_token
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=YourSecurePassword123!
ADMIN_INITIAL_NAME=Super_Admin
```

> **Security Notice:** Never commit `.env` files to Git. Actual passwords, JWT secrets, and database credentials must remain strictly inside local `.env` files or host dashboard environment variable managers.

### Step 3: Bootstrap Initial Admin Account (First-Time Local Setup Only)

```powershell
npm run create-admin
```

This bootstraps the initial administrator account using the `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD` defined in your local `backend/.env`.

### Step 4: Seed Sample AKTU Resources (Local Development Only)

```powershell
npm run seed
```

> **Caution:** `npm run seed` is strictly intended for local development and testing to populate dummy test data. Do NOT run this command in production or on an existing database with real data.

### Step 5: Install Frontend Dependencies

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'
npm install
```

### Step 6: Configure Frontend Environment Variables

Create `.env` inside `frontend/`:

```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Running Locally (PowerShell Commands)

Run backend and frontend in separate PowerShell windows:

### Terminal 1: Backend Server (Port 5000)

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'
npm run dev
```

*Health Check:* `http://localhost:5000/api/health`

### Terminal 2: Frontend Client (Port 5173)

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'
npm run dev
```

*Public Website:* `http://localhost:5173`  
*Admin Portal:* `http://localhost:5173/admin/login`

---

## 7. Running Automated Tests

### Backend Test Suite (Jest + Supertest)

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'
npm test
```
*Coverage:* **24 of 24 tests passing** (public endpoints, pagination, filters, admin auth, CRUD, validation).

### Frontend Component Tests (Vitest + React Testing Library)

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'
npm test
```
*Coverage:* **12 of 12 tests passing** (Navbar, ResourceCard, ResourceFilters, AdminLoginPage, StaticPages).

### Production Build Validation

```powershell
Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'
npm run build
```

---

## 8. Application Security Architecture

1. **Authentication:**
   - Server-verified authentication utilizing secure HTTP-only cookies (`aktu_token`).
   - Passwords hashed with bcryptjs (12 salt rounds).
   - Session tokens are never stored in `localStorage` to defend against XSS token theft.
2. **Rate Limiting:**
   - 10 login attempts per 15 minutes per IP to block brute-force attacks.
   - Public endpoint rate limiting (300 req / 15 min).
3. **SSRF & Domain Whitelist:**
   - All resource file URLs are validated against approved storage providers (Google Drive, OneDrive, GitHub raw, AWS S3, Cloudinary, Firebase, Archive.org).
   - Rejects loopback addresses (`127.0.0.1`, `localhost`, `::1`) and internal private network ranges.
4. **Data Minimization:**
   - Students browse and download without accounts, tracking, or registration fees.
   - Broken link reports collect only resource ID and description without personal identifiers.
5. **NoSQL Injection Defense:**
   - Sanitized regex queries and strict schema-based input parsing with Zod.

---

## 9. Production Deployment Guide

The application is deployed across three services:
- **Database:** MongoDB Atlas (Cloud Cluster M0)
- **Backend API:** Render Web Service
- **Frontend SPA:** Vercel Global Edge Network

### A. Database Migration (Local to MongoDB Atlas)

To deploy existing data (admin account, published notes, and syllabus PDFs) to MongoDB Atlas without manual re-entry:

1. **Create an Atlas Cluster:**
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com) and create a free M0 cluster.
   - Create a database user with read/write access.
   - In **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so cloud platforms can connect.
   - Copy your connection string:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/aktu_notes1965?retryWrites=true&w=majority`
2. **Migrate Existing Data (1-Command Safe Migration):**
   ```powershell
   Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'
   # 1. Export local database to a secure local JSON backup (gitignored)
   npm run export-db

   # 2. Import backup into your MongoDB Atlas cluster (uses upsert to prevent duplicates)
   npm run import-db -- "YOUR_ATLAS_CONNECTION_STRING"
   ```

### B. Backend Deployment (Render)

1. Connect your GitHub repository to Render as a **Web Service**.
2. **Configuration:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment Variables Configured in Host Dashboard:**
   - `PORT`: `5000` (or host-provided port)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string (kept private in dashboard)*
   - `FRONTEND_ORIGIN`: *Your production frontend URL (e.g. `https://aktu-notes1965.vercel.app`)*
   - `JWT_SECRET`: *A secure random string of at least 32 characters*
   - `JWT_EXPIRES_IN`: `24h`
   - `COOKIE_NAME`: `aktu_token`
4. *Important:* Do NOT run `npm run seed` in production. Live data is migrated via MongoDB Atlas.

### C. Frontend Deployment (Vercel)

1. Import your GitHub repository into Vercel as a new project.
2. **Configuration:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variables Configured in Vercel:**
   - `VITE_API_URL`: `https://aktu-notes1965.onrender.com/api` *(Type: Config)*
4. Client-side SPA routing is handled automatically via `frontend/vercel.json`.

---

## 10. Operational Guidelines & Best Practices

- **File Hosting:** Study materials are hosted via external approved storage providers (Google Drive, GitHub raw, AWS S3) rather than storing large binary blobs in MongoDB.
- **Direct Downloads:** Google Drive URLs are automatically transformed into direct-download links (`uc?export=download&id=...`).
- **Curriculum Regulations:** AKTU syllabus changes across batches (CBCS, K-Series, NEP) are categorized via optional `regulation` and `academicYear` tags on each resource.
