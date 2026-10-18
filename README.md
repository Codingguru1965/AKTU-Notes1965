# AKTU Notes1965

> **Tagline:** Study Smart. Score Better.  

> **Mission:** A free, public, and open directory of academic resources for students of Dr. A.P.J. Abdul Kalam Technical University (AKTU), Uttar Pradesh.

---

## 1. Project Overview

**AKTU Notes1965** is an independent, responsive, production-minded academic portal designed to give engineering students instant, friction-free access to semester study materials.

Students can search, filter, preview, and download published resources directly without registering, creating accounts, or logging in.

### Supported Resources

- **AKTU Syllabus PDFs:** Unit-wise breakdowns, course outcomes, reference textbooks, and question pattern distributions.

- **Lecture Notes:** High-quality handwritten and typed notes from university faculty and top-performing students.

- **Previous-Year Question Papers (PYQs):** Solved and unsolved past university end-semester papers.

### Non-Affiliation Disclaimer

*AKTU Notes1965 is an independent student resource platform. It is not affiliated with, authorized by, or endorsed by Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow.*

---

## 2. Technology Stack

### Frontend

- **Framework:** React.js with Vite

- **Routing:** React Router v7

- **HTTP Client:** Axios (configured with credentials and base URL interceptors)

- **Styling:** Bootstrap 5 with tailored CSS design tokens matching the academic brand palette

- **Icons:** React Icons (react-icons/fi)

- **Testing:** Vitest, React Testing Library, and jsdom

### Backend

- **Runtime:** Node.js (ES Modules)

- **Framework:** Express.js

- **Database:** MongoDB Atlas / Local MongoDB with Mongoose ODM

- **Authentication:** HTTP-only cookies storing JWT sessions

- **Password Security:** bcryptjs (salted with 12 rounds)

- **Validation:** Zod schemas on both incoming request bodies and query parameters

- **Security:** Helmet (HTTP security headers), strict CORS allowlist, express-rate-limit (brute-force login protection)

- **Testing:** Jest, Supertest, and Cross-Env

---

## 3. Brand Identity & Visual Design

- **Primary Navy:** #102C54

- **Sky Blue:** #72B7FF

- **White:** #FFFFFF

- **Light Background:** #F5F8FC

- **Main Text:** #172033

- **Muted Text:** #64748B

### Logo Assets

- frontend/public/logo.svg: Main brand logo with graduation cap, open book, wordmark, and tagline.

- frontend/public/icon.svg: Compact mobile navbar emblem and vector favicon.

- frontend/src/assets/logo.svg: Bundled React asset.

---

## 4. Prerequisites

- **Node.js:** v18.0.0 or higher (v24 LTS tested)

- **npm:** v9.0.0 or higher

- **MongoDB:** Local MongoDB instance running on mongodb://127.0.0.1:27017 OR a MongoDB Atlas cluster URI.

---

## 5. Installation and Setup

Open Windows PowerShell and navigate to the root directory:

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965'

`

### Step 1: Install Backend Dependencies

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'

npm install

`

### Step 2: Configure Backend Environment Variables

Create .env inside backend/:

`ini

PORT=5000

NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/aktu_notes1965

FRONTEND_ORIGIN=http://localhost:5173

JWT_SECRET=super_secret_aktu_jwt_notes1965_dev_key_at_least_32_chars_long

JWT_EXPIRES_IN=7d

COOKIE_NAME=aktu_token

ADMIN_INITIAL_EMAIL=ankit@1965gmail.co.in

ADMIN_INITIAL_PASSWORD=YourSecurePassword123!

ADMIN_INITIAL_NAME=Super_Admin

`

### Step 3: Bootstrap Admin Account

`powershell

npm run create-admin

`

*Bootstrap credentials:*

- **Email:** ankit@1965gmail.co.in

- **Password:** [Configured in .env / Secure Password]

### Step 4: Seed Sample AKTU Resources

`powershell

npm run seed

`

Seeds 18 initial syllabus PDFs, lecture notes, and PYQs across CSE, IT, ECE, EE, ME, and Civil.

### Step 5: Install Frontend Dependencies

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'

npm install

`

### Step 6: Configure Frontend Environment Variables

Create .env inside frontend/:

`ini

VITE_API_URL=http://localhost:5000/api

`

---

## 6. Running Locally (PowerShell Commands)

Run backend and frontend in separate PowerShell windows:

### Terminal 1: Backend Server (Port 5000)

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'

npm start

`

*Health Check:* http://localhost:5000/api/health

### Terminal 2: Frontend Client (Port 5173)

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'

npm run dev

`

*Public Website:* http://localhost:5173  

*Admin Portal:* http://localhost:5173/admin/login

---

## 7. Running Tests

### Backend Test Suite (Jest + Supertest)

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\backend'

npm test

`

*Results:* 24 of 24 tests passing.

### Frontend Component Tests (Vitest + React Testing Library)

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'

npm test

`

*Results:* 12 of 12 tests passing across all component and static page suites.

### Production Build Validation

`powershell

Set-Location 'D:\PROJECTS\AKTU-Notes1965\frontend'

npm run build

`

---

## 8. Application Security Architecture

1. **Authentication:**

   - Server-verified authentication utilizing secure HTTP-only cookies.

   - Passwords hashed with bcryptjs (12 salt rounds).

   - JWT tokens never stored in localStorage to defend against XSS token theft.

2. **Rate Limiting:**

   - 10 login attempts per 15 minutes per IP to block brute-force attacks.

   - Public endpoint rate limiting (300 req / 15 min).

3. **SSRF & Domain Whitelist:**

   - All resource file URLs are validated against approved storage providers (Google Drive, OneDrive, GitHub raw, AWS S3, Cloudinary, Firebase, Archive.org).

   - Rejects loopback addresses (127.0.0.1, localhost, ::1) and internal private network ranges.

4. **Data Minimization:**

   - Students browse and download without accounts, tracking, or registration fees.

   - Broken link reports collect only resource ID and description without personal identifiers.

5. **NoSQL Injection Defense:**

   - Sanitized regex queries and strict schema-based input parsing with Zod.

---

## 9. Deployment Guide

### Backend Deployment (e.g., Render, Railway, AWS ECS)

1. **MongoDB Atlas:**

   - Create a database user with read/write access.

   - Allow network access (0.0.0.0/0 or static outbound IP).

2. **Environment Variables:**

   - PORT: 5000

   - NODE_ENV: production

   - MONGODB_URI: mongodb+srv://<user>:<password>@cluster0.mongodb.net/aktu_notes1965?retryWrites=true&w=majority

   - FRONTEND_ORIGIN: https://your-frontend-domain.vercel.app

   - JWT_SECRET: Random 32+ character string

   - COOKIE_NAME: ktu_token

3. Set build command to `npm install` and start command to `npm start`.

4. Run `npm run create-admin` and `npm run seed` in the build console.

### Frontend Deployment (e.g., Vercel, Netlify)

1. Connect repository with root directory set to `frontend`.

2. Build command: `npm run build`, Output directory: dist.

3. Set environment variable:

   - VITE_API_URL: https://your-backend.onrender.com/api

---

## 10. Known Limitations

- **File Hosting:** Resources point to external approved storage providers (Google Drive, GitHub, AWS S3) to avoid bloating MongoDB documents.

- **Curriculum Regulations:** AKTU syllabus updates (CBCS, K-Series) are tracked via optional 

egulation and cademicYear tags on each resource.

