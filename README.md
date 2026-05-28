# Restaurant Reservation API

Production-ready Node.js/Express REST API for restaurant reservations with QR code generation.

## Features

- ✅ Create reservations (public endpoint with rate limiting)
- ✅ List & filter reservations (admin)
- ✅ Update reservation status with QR generation on confirm
- ✅ QR code check-in verification
- ✅ WhatsApp confirmation messages
- ✅ PostgreSQL with transaction safety
- ✅ Input validation (Zod), error handling, security headers
- ✅ Multi-tenant ready schema

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb restaurant_reservations

# Run schema
psql -U postgres -d restaurant_reservations -f schema.sql
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Documentation

### Authentication

#### Register Admin
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@restaurant.com",
  "password": "securePassword123",
  "firstName": "Mario",
  "lastName": "Rossi",
  "role": "manager"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@restaurant.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", "email": "...", "role": "manager" }
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

---

### Public Endpoints

#### Create Reservation
```http
POST /api/v1/reservations
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "partySize": 4,
  "scheduledAt": "2026-06-01T19:00:00Z",
  "notes": "Window seat preferred"
}
```

#### Check-In via QR
```http
GET /api/v1/check-in/{token}
```

### Admin Endpoints (Requires `Authorization: Bearer <token>`)

#### List Reservations
```http
GET /api/v1/admin/reservations?status=pending&date=2026-06-01&page=1&limit=20
Authorization: Bearer <token>
```

#### Update Status
```http
PATCH /api/v1/admin/reservations/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Status values:** `pending`, `confirmed`, `rejected`, `cancelled`, `completed`, `no_show`

**Role-based access:** Only `owner`, `manager`, and `host` can update reservation status. `staff` can view but not modify.

---

## Project Structure

```
├── src/
│   ├── config/           # Database & env configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Validation, auth, rate limiting, errors
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic & DB transactions
│   ├── utils/            # Helpers (AppError, catchAsync, logger)
│   ├── app.js            # Express app setup
│   └── server.js         # Entry point
├── schema.sql            # PostgreSQL schema + seed data
├── .env.example          # Environment template
└── package.json
```

---

## WhatsApp Integration (Twilio)

### Setup Steps

1. **Create a Twilio account** at [twilio.com](https://www.twilio.com)
2. **Get your credentials** from the Twilio Console:
   - Account SID
   - Auth Token
3. **Activate WhatsApp Sandbox**
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Or use a Twilio WhatsApp Business API number
4. **Add to `.env`**
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
5. **Join the sandbox** (if using the shared sandbox)
   - Send a WhatsApp message from your phone to the sandbox number with the provided join code

### Behavior

- WhatsApp messages are sent **automatically** when an admin confirms or rejects a reservation
- Only sent if the customer provided a phone number
- Failures are logged but **never block** the reservation update
- Message includes reservation details + QR check-in link

## Security Checklist

- [x] JWT authentication with bcrypt password hashing
- [ ] Change `JWT_SECRET` to a cryptographically strong secret (min 32 chars)
- [ ] Enable `DB_SSL=true` in production
- [ ] Restrict `/auth/register` to existing admins in production (currently open for setup)
- [ ] Add `PUBLIC_BASE_URL` pointing to your domain
- [ ] Configure CORS origins strictly
- [ ] Set up PostgreSQL RLS policies for multi-tenancy
- [ ] Implement refresh token rotation for long-lived sessions
- [ ] Add brute-force protection on login endpoint

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | PostgreSQL 15+ |
| Validation | Zod |
| QR Codes | qrcode (node) |
| Logging | Winston |
| Security | Helmet, CORS, HPP, express-rate-limit |
