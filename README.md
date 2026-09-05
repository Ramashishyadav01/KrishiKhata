# 🚜 KrishiKhata (कृषिखाता)

> **"खेती का काम, मशीन और पैसा — सबका एक जगह हिसाब।"**

**KrishiKhata (कृषिखाता)** is a full-stack Agriculture Business & Farm Machinery Management System designed for farm owners, tractor/machinery service providers, rice mill operators, and agricultural managers. It streamlines day-to-day operations, customer accounts, machine work entries, fuel logs, machine repairs, driver salaries, labour wages, bran sales, crop season tracking, and financial ledgers (Bahi-Khata).

---

## 🌟 Key Features

- 🚜 **Farm Machinery & Work Entries**: Record hourly, bigha/bissa, or per-trip machine work for farmers.
- 👥 **Farmer / Customer Management**: Maintain detailed ledgers, balances, payment histories, and field locations.
- 🌾 **Rice Mill & Bran Sales**: Comprehensive tracking for paddy milling, bran (चोकर) production, and sales.
- ⛽ **Fuel & Repair Logs**: Monitor diesel/petrol consumption and machine maintenance expenses.
- 👷 **Driver & Labour Management**: Daily attendance tracking, wages, advances, and pending salary balance calculations.
- 📅 **Season & Season-Based Filtering**: Organize work entries and financial metrics by crop seasons (e.g., Kharif, Rabi).
- 📊 **Reports & Analytics**: Export clean financial summaries, pending balances, and CSV exports.
- 🔒 **Role-Based Security & Single-Admin Architecture**: Single-Admin safeguard for owner control alongside staff/operator access.
- 🌐 **Bilingual Interface**: Native support for English and Hindi (हिंदी).

---

## 📁 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, bcryptjs
- **Database**: MongoDB (with fallback in-memory support for testing)

---

## 🏗️ Project Structure

```
KrishiKhata/
├── client/                 # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components & modals
│   │   ├── context/        # Auth, Language, & Season Contexts
│   │   ├── pages/          # Dashboard, Farmers, Work Entries, Reports, etc.
│   │   └── services/       # Axios API client & interceptors
│   └── package.json
├── server/                 # Node.js + Express Backend API
│   ├── src/
│   │   ├── config/         # Database connection & initAdmin module
│   │   ├── controllers/    # Controller logic for all business modules
│   │   ├── middleware/     # JWT protection & role authorization
│   │   ├── models/         # Mongoose Schemas (User, Customer, WorkEntry, etc.)
│   │   ├── routes/         # Express API endpoints
│   │   └── seedAdmin.js    # Idempotent Admin initialization
│   ├── .env.example        # Environment variable template
│   └── package.json
├── .gitignore              # Repository file exclusion rules
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: `v6.0` or higher (local or MongoDB Atlas)

---

### 1. Environment Configuration

Copy `.env.example` in the `server` directory to `.env`:

```bash
cd server
cp .env.example .env
```

Configure your environment variables in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/krishikhata
JWT_SECRET=your_jwt_super_secret_key_change_in_production

# Single Admin Account Setup
ADMIN_NAME=Ram Ashish Yadav
ADMIN_MOBILE=7860470800
ADMIN_PASSWORD=your_secure_admin_password
```

---

### 2. Backend Setup & Startup

```bash
cd server
npm install

# Option A: Start development server (auto-syncs Admin account from .env)
npm run dev

# Option B: Run Admin initialization script explicitly
npm run seed:admin
```

The backend server runs on `http://localhost:5000`.

---

### 3. Frontend Setup & Startup

```bash
cd client
npm install

# Start development server
npm run dev
```

The frontend application opens at `http://localhost:5173`.

---

## 🔐 Role-Based Access Control

- **Admin (`admin`)**:
  - Automatically initialized on server startup using `ADMIN_MOBILE`, `ADMIN_NAME`, and `ADMIN_PASSWORD` defined in `server/.env`.
  - Full system privileges including user management, rate updating, and system settings.
  - Enforces **Single-Admin Policy** (only one active Admin account allowed).
- **Operator (`operator`)**:
  - Assigned to standard staff and users registered via public registration (`/register`).
  - Access to daily work entries, farmer ledgers, payments, fuel logs, and reports.

---

## 🧪 Testing

Run the automated backend verification test suites:

```bash
cd server
node src/tests/seedAdmin.test.js
node src/tests/singleAdminRule.test.js
node src/tests/farmerManagement.test.js
node src/tests/fuelEntry.test.js
node src/tests/machineRateUpdate.test.js
node src/tests/branSale.test.js
```

Build the production frontend bundle:

```bash
cd client
npm run build
```

---

## 📄 License

MIT License. Developed for modern agricultural operations and farm business accounting.
