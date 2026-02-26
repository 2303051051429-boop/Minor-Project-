<div align="center">

# 🎓 ParulConnect

### Smart Campus Recovery Platform

A digital Lost & Found system for university campuses, featuring searchable item feeds, role-based dashboards, and AI-powered category tagging.

</div>

## Features

- **Role-based Authentication** — JWT login with bcrypt password hashing for Students and Admins
- **Live Feed** — Searchable, filterable grid of lost and found items
- **Student Dashboard** — View metrics, browse items, post new lost/found reports with image upload
- **Admin Console** — Analytics dashboard with category bar charts, recovery rate, and case resolution
- **Search & Filtering** — Text search with MongoDB text indexes and category chip filters (Electronics, Clothing, Books, Keys, Wallet)
- **Status Tracking** — Items flow through Lost → Found → Resolved
- **Security** — Helmet, CORS, rate limiting, input validation (express-validator), XSS protection

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS 4     |
| Backend    | Node.js, Express 5                  |
| Database   | MongoDB with Mongoose               |
| Auth       | JWT + bcrypt                         |
| Charts     | Recharts                             |
| Icons      | Lucide React                         |
| AI         | Gemini API (integration-ready)       |

## Project Structure

```
├── server/              # Express backend
│   ├── models/          # Mongoose schemas (User, Item)
│   ├── routes/          # API routes (auth, items, dashboard)
│   ├── middleware/       # JWT auth & role-based middleware
│   ├── config/          # Database configuration
│   ├── __tests__/       # API tests (Jest + Supertest)
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # LoginPage, StudentDashboard, AdminDashboard
│   │   ├── components/  # ItemCard, PostItemModal
│   │   ├── context/     # AuthContext
│   │   └── api.js       # Axios instance with auth interceptors
│   └── vite.config.js
└── README.md
```

## API Endpoints

| Method | Endpoint                    | Auth     | Description                |
|--------|-----------------------------|----------|----------------------------|
| POST   | `/api/auth/register`        | Public   | Register a new user        |
| POST   | `/api/auth/login`           | Public   | Login and receive JWT      |
| GET    | `/api/items`                | Public   | List items (search/filter) |
| POST   | `/api/items`                | Student  | Post a new item            |
| PATCH  | `/api/items/:id/resolve`    | Admin    | Resolve an item            |
| GET    | `/api/dashboard/metrics`    | Auth     | Dashboard statistics       |
| GET    | `/api/dashboard/recent`     | Admin    | Recent reports list        |
| GET    | `/api/health`               | Public   | Health check               |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
cp .env.example .env    # Configure your MongoDB URI and JWT secret
npm install
npm start               # Starts on port 5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev             # Starts on port 5173 with API proxy to :5000
```

### Run Tests

```bash
cd server
npm test
```

