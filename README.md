# Code-Royale (HealthSphere)

A full-stack healthcare platform with role-based access for patients and doctors, built with a React/Vite frontend and an Express/MongoDB backend.

## 1) System Overview

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Axios, React Router 6, Recharts
- **Backend**: Node.js, Express 4, MongoDB (Mongoose 8), JWT auth, bcrypt, Helmet, CORS
- **Architecture**: Split frontend/backend services; browser communicates with backend REST API via `/api/*`
- **Auth Model**: Stateless JWT bearer tokens with role-based route authorization (`patient`, `doctor`)

## 2) Repository Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js
frontend/
  src/
    components/
    context/
    hooks/
    pages/
    routes/
    services/
```

## 3) Runtime Topology

### Development

- Frontend runs on `http://localhost:3000` (Vite dev server)
- Backend runs on `http://localhost:5000` (Express)
- Vite proxy forwards `/api` to backend (`frontend/vite.config.js`)

### Data Layer

- MongoDB connection is configured via `MONGO_URI`
- Fallback local URI: `mongodb://127.0.0.1:27017/healthsphere`

## 4) Prerequisites

- Node.js **18+** (recommended: latest LTS)
- npm **9+**
- MongoDB **6+** (local or remote)

## 5) Environment Configuration

Copy the template files and adjust values as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`:

```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/healthsphere
JWT_SECRET=replace_with_a_long_random_secret
```

`frontend/.env`:

```bash
VITE_API_BASE_URL=/api
```

> `JWT_SECRET` and `MONGO_URI` should be set to secure production values outside source control.

## 6) Local Development Runbook

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

## 7) Build and Production Commands

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Backend

```bash
cd backend
npm start
```

## 8) Authentication and Authorization

- Token issuance on successful register/login
- Frontend stores token in `localStorage`
- Axios interceptor attaches `Authorization: Bearer <token>` to every API request
- 401 responses trigger token/user cleanup and redirect to `/login`
- Backend route protection:
  - `protect` middleware verifies JWT and resolves `req.user`
  - `restrictTo(...)` enforces role access for route groups

## 9) API Surface (Current)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Patient (requires `patient` role)

- `GET /api/patient/profile`
- `GET /api/patient/health`
- `POST /api/patient/health`

### Doctor (requires `doctor` role)

- `GET /api/doctor/patients`
- `GET /api/doctor/analytics`
- `POST /api/doctor/prescriptions`

### Appointments

- `GET /api/appointments` (authenticated `patient` or `doctor`)
- `POST /api/appointments` (authenticated `patient` only)

### Utility

- `GET /api/weather` (mock weather feed)

## 10) Domain Models

### User

- `name: string`
- `email: string` (unique, validated)
- `password: string` (bcrypt-hashed, min length 8)
- `role: 'patient' | 'doctor'`

### Appointment

- `patientId`, `doctorId` (ObjectId refs to `User`)
- `date`, `timeSlot`, `status`
- `meetingLink`, `notes`

### HealthData

- `patientId` (ref)
- `metrics`: heart rate, blood pressure, sleep hours, blood sugar
- `aiHealthScore` (0–100)

### Prescription

- `patientId`, `doctorId` (refs)
- `medications[]`: name, dosage, frequency, duration
- `instructions`, `dateIssued`

## 11) Response and Error Contract

Typical success envelope:

```json
{
  "status": "success",
  "data": {}
}
```

Typical error envelope:

```json
{
  "status": "error",
  "message": "...",
  "errorCode": "..."
}
```

In `development`, stack traces are included by the global error middleware.

## 12) Security Controls (Current State)

- Password hashing via bcrypt salt rounds
- JWT-based authentication with expiration (`30d`)
- Basic HTTP hardening via Helmet
- CORS enabled for API access from frontend
- Role-guarded route groups for doctor/patient isolation

## 13) Known Engineering Gaps / Next Hardening Steps

- Add request validation (e.g., Zod/Joi) on all write endpoints
- Move frontend auth tokens to HTTP-only secure cookies for stronger XSS posture
- Add refresh-token flow and token revocation strategy
- Add rate limiting and brute-force protection on auth routes
- Add automated tests (unit/integration/e2e) and CI pipeline
- Add containerization and deployment manifests

## 14) License

No license is currently declared in this repository.

---

For implementation details, refer to:

- Backend bootstrap: `backend/server.js`
- API routes: `backend/routes/*`
- Controllers: `backend/controllers/*`
- Frontend API client: `frontend/src/services/api.js`
- Dev proxy configuration: `frontend/vite.config.js`
