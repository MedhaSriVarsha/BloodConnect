# 🩸 BloodConnect — Mission-Critical Healthcare Blood Network

BloodConnect is an enterprise-grade, high-reliability platform that connects verified blood donors, urgent patient blood requests, accredited blood banks, and hospitals in real time. Built according to strict OWASP security guidelines with dual-channel email and mobile verification, keyed HMAC OTPs, Argon2id password security, and relational data integrity.

---

## 🚀 Live Services & Architecture

| Layer | Technology | Port / URL | Description |
|---|---|---|---|
| **Backend API** | Node.js LTS, Express, TypeScript, Prisma | `http://localhost:5000/api/v1` | Modular REST API with strict rate limiting, request IDs & RBAC |
| **Frontend Web** | React 18, Vite, TypeScript, Vanilla CSS | `http://localhost:5173/` | Rich glassmorphic UI, modern typography (Outfit + Inter), micro-animations |
| **Primary Database** | PostgreSQL + PostGIS + Prisma Schema | Configured via `.env` | Complete relational schema with 14 models & audit logs |
| **Security Layer** | Scrypt/Argon2id + Keyed HMAC OTPs | In-memory / DB | Single-use 6-digit OTPs, constant-time verification, 5-min expiry |

---

## 🌟 Key Features Implemented

### 1. 🚨 Live Emergency Blood Requests Board
- **Instant Patient Broadcasts**: Patients and hospital staff can post critical transfusion demands with blood group, required units, hospital location, and urgency (`CRITICAL`, `URGENT`, `NORMAL`).
- **Real-Time Donor Matching**: When an emergency request is created, compatible donors in the vicinity are immediately alerted via SMS/Email event bus.
- **Volunteer Action**: Donors can step up to donate with a single click, tracking units needed vs units fulfilled.

### 2. 📋 Interactive Eligibility Assessment Engine
- **Clinical Questionnaire**: Instant pre-screening evaluating Age (18–65), Body Weight (&ge; 45 kg), Hemoglobin (&ge; 12.5 g/dL), 90-day recovery interval, recent tattoos, surgery, and current health status.
- **Diagnostic Feedback**: Detailed pass/fail evaluation with clinical guidance (e.g. iron-rich nutrition advice, hydration reminders).
- **Next Eligible Donation Date**: Automatic computation of exact countdown days until the donor is next eligible to donate.

### 3. 📜 Donation History & Verifiable Certificates
- **Donor Journey Timeline**: Complete record of all voluntary donations, hospital locations, and units contributed.
- **Community Impact Multiplier**: Live tracking of estimated lives saved (each blood unit can save up to 3 patients).
- **Donor Honor Badges**: Dynamic tiered progression: **Bronze Hero** &rarr; **Silver Hero** &rarr; **Gold Hero** &rarr; **Platinum Hero**.
- **Digital Verifiable Certificates**: Generates official BloodConnect certificates with unique Certificate Numbers (`BC-CERT-YYYY-XXXX`) and verification seals.

### 4. 🔐 5-Step Two-Factor Registration & Verification Protocol
- **Step 1 — Registration**: Name, Email, Mobile number (+91 format), Password, Consent, and optional Referral code.
- **Step 2 — Verify Email**: Keyed HMAC 6-digit OTP dispatched to email (5-min strict expiry, max 5 attempts).
- **Step 3 — Verify Mobile**: Keyed HMAC 6-digit SMS OTP dispatched to phone.
- **Step 4 — Account Activation**: Account is activated *only* after both required verification challenges succeed.
- **Step 5 — Complete Donor Profile**: Blood group, street address, city, and active availability consent.

### 5. 🏥 Blood Banks & Hospitals Directory
- Real-time directory of accredited medical centers and blood banks.
- Live unit inventory meters displaying available stock per blood group (`O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`).
- Direct call action (`tel:`) and directions mapping.

### 6. 🤝 Trusted Blood Circle + Emergency Access Code (BC-TC-XXXXX)
- **Private Emergency Circle**: Create a protected circle of trusted friends, family, and colleagues ready to assist during blood emergencies.
- **Emergency Access Code (e.g. `BC-TC-7K9P2`)**: Unpredictable access code that identifies the circle without exposing members' private contact details to the public.
- **Informed Medical Consent**: Friends join by entering the code, selecting their relationship (e.g., Brother, Sister, Friend, Colleague), and confirming explicit consent to emergency contact.
- **Instant Emergency Access**: Authorized users can open their circle to view member blood groups, consented phone numbers, location areas, and latest availability timestamps.
- **One-Tap Emergency Alert ("Request Help from Circle")**: Instantly broadcasts emergency notifications to all consenting circle members via SMS/Push with a single tap.
- **Availability & Opt-In Control**: Members can toggle availability status and confirmation times, leave the circle, or withdraw consent at any time.

### 7. 🛡️ Admin Mission Control
- **Privileged RBAC**: Protected by server-side role authentication (`ADMIN` / `SUPER_ADMIN`).
- **Aggregate Analytics**: Live dashboard showing total registered donors, active emergency calls, certified transfusions, and inventory distribution.
- **Donor Management**: Administrative status oversight with approval and suspension capabilities.
- **Security Audit Log Trail**: Immutable log of administrative actions, resource modifications, and timestamps.
- **Real-Time Dispatches Feed**: Event stream of all outbound OTPs and SMS alerts for development and testing.

---

## 🛠️ Quick Start & Running Locally

### Backend Setup:
```powershell
cd c:\Users\varsh\OneDrive\ドキュメント\BloodConnect\backend
npm install
npm run build
node dist/server.js
# Or in watch mode:
npm run dev
```
Backend runs at `http://localhost:5000` with API health check at `http://localhost:5000/api/v1/health`.

### Frontend Setup:
```powershell
cd c:\Users\varsh\OneDrive\ドキュメント\BloodConnect\frontend
npm install
npm run build
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔑 Demo Credentials

| Role | Identifier / Email | Password |
|---|---|---|
| **System Administrator** | `admin@bloodconnect.org` | `AdminPass2026!` |
| **Verified Donor** | `rahul.sharma@example.com` | `password123` |
| **Verified Donor (Gold)** | `priya.patel@example.com` | `password123` |

---

## 📚 API Blueprint Reference (`/api/v1`)

| Module | Method & Endpoint | Description |
|---|---|---|
| **Health** | `GET /health` | Service health status and uptime |
| **Auth** | `POST /auth/register` | Step 1: Initiate two-step registration |
| | `POST /auth/verify-email` | Step 2: Verify email HMAC OTP challenge |
| | `POST /auth/verify-phone` | Step 3: Verify mobile SMS HMAC OTP challenge |
| | `POST /auth/otp/resend` | Invalidate previous and resend fresh OTP |
| | `POST /auth/donor-profile` | Step 5: Save blood group and preferences |
| | `POST /auth/login` | Authenticate and issue JWT access + refresh tokens |
| | `GET /auth/me` | Fetch authenticated user profile & donor stats |
| | `POST /auth/logout` | Revoke active session |
| **Blood Requests** | `GET /blood-requests` | List active emergency requests with filters |
| | `POST /blood-requests` | Broadcast new urgent patient blood request |
| | `POST /blood-requests/:id/volunteer` | Step up to donate and fulfill units |
| **Donations** | `GET /donations/my` | Fetch donation history, badge, and next date |
| | `POST /donations/log` | Record completed donation and issue certificate |
| | `GET /donations/certificate/:id` | Publicly verify digital donation certificate |
| **Eligibility** | `POST /eligibility/evaluate` | Clinical pre-screening assessment with instant feedback |
| | `GET /eligibility/my-history` | Past eligibility assessments |
| **Donors** | `GET /donors/search` | Privacy-conscious search for ready donors |
| | `PATCH /donors/me/availability` | Toggle donor emergency availability |
| | `GET /donors/:id` | Retrieve donor profile with consent checking |
| **Institutions** | `GET /institutions` | List blood banks and hospitals with inventory |
| **Trusted Circles** | `POST /trusted-circles` | Create a new trusted blood circle |
| | `POST /trusted-circles/join` | Join circle using Emergency Access Code + consent |
| | `GET /trusted-circles/lookup/:code` | Public preview of circle without exposing members |
| | `GET /trusted-circles/my` | Retrieve user's circle, joined circles & availability |
| | `GET /trusted-circles/:id/members` | Retrieve authorized member details & contacts |
| | `DELETE /trusted-circles/:id/members/:memberId` | Remove member or withdraw consent |
| | `PATCH /trusted-circles/me/availability` | Update donor availability & confirmation time |
| **Emergencies** | `POST /emergencies` | Create emergency transfusion request |
| | `POST /emergencies/:id/notify-circle` | Broadcast emergency alert to consenting circle members |
| **Referrals** | `GET /referrals/me` | Retrieve referral code, share URL, and points |
| **Admin** | `GET /admin/dashboard` | Aggregated emergency metrics & distribution |
| | `GET /admin/donors` | Manage all registered donor accounts |
| | `PATCH /admin/users/:id/status` | Change user status (Active / Suspended) |
| | `GET /admin/audit-logs` | Immutable security audit trail |
