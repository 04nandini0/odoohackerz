# AssetFlow
### Enterprise Asset & Resource Management System

Built for **Odoo Hackathon 2026** — Virtual Round (July 12, 2026)

---

## 📌 Problem Statement

Organizations with physical assets, shared resources, or spaces — offices, schools, hospitals, factories, agencies — still rely on spreadsheets and paper logs to track who holds what, where it is, and its condition. AssetFlow replaces that with a centralized ERP platform covering the full asset lifecycle, resource booking, maintenance approvals, and structured audits, without touching purchasing, invoicing, or accounting concerns.

**AssetFlow enables organizations to:**
- Maintain departments, asset categories, and an employee directory
- Track assets through a flexible lifecycle: `Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed`
- Allocate assets to employees/departments with automatic conflict handling (no double-allocation)
- Book shared/limited resources by time slot with overlap validation
- Route maintenance requests through an approval workflow before repair work starts
- Run scheduled audit cycles with assigned auditors and auto-generated discrepancy reports
- Surface overdue returns, bookings, and maintenance activity via notifications and a live KPI dashboard

---

## 🛠️ Tech Stack

Built entirely on **self-hosted, open infrastructure** — no third-party SaaS/BaaS dependency (no Firebase, Supabase, managed cloud DBs, or managed storage) for any backend, frontend, database, or API component.

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core Web API (C#) |
| Database | MongoDB — self-hosted via Docker |
| Authentication | OAuth2.0 + JWT (self-implemented) |
| Caching | Redis — self-hosted via Docker |
| Messaging | RabbitMQ — self-hosted via Docker |
| Real-time updates | SignalR |
| File Storage | MinIO (S3-compatible) — self-hosted via Docker |
| Reporting/Analytics | Recharts / Chart.js (in-app, self-built) |
| QR/Barcode | Client-side scanner (`html5-qrcode`) |
| Notifications | In-app + SignalR live toast; email via self-hosted SMTP relay |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions (build & test workflow) |

---

## 👥 Team & Roles

| Member | Role | Responsibilities |
|---|---|---|
| Avinash7061 | Auth & Org Lead | Login/signup, JWT, role guards, department/category/employee directory setup |
| Muskan-06-git | Asset Core Lead | Asset registration, directory & search, lifecycle state machine |
| 04Nandini0 | Allocation & Booking Lead | Allocation/transfer conflict logic, resource booking overlap validation |
| Sujata-dot | Maintenance, Dashboard & Notifications Lead | Maintenance workflow, KPI dashboard, SignalR hub, notification feed |

---

## 🚀 Features

### Core Workflows
- **Realistic account creation** — signup creates an Employee account only; Admin promotes trusted employees to Department Head or Asset Manager from the Employee Directory. No self-elevated admin access.
- **Conflict-safe allocation** — the system blocks allocating an asset that's already held, shows who holds it, and offers a Transfer Request instead of failing silently.
- **Overlap-safe booking** — shared resources (rooms, vehicles, equipment) can't be double-booked; back-to-back slots are correctly allowed.
- **Approval-gated maintenance** — repair work can't start until an Asset Manager approves the request; asset status updates automatically at each stage.
- **Structured audits** — scheduled audit cycles with assigned auditors, per-asset verification (Verified/Missing/Damaged), and auto-generated discrepancy reports.
- **Live operational visibility** — real-time KPI dashboard (available, allocated, in maintenance, active bookings, pending transfers, upcoming/overdue returns) powered by SignalR.

### Real-World Use Cases
- **Corporate offices** — track laptops, monitors, furniture across departments; book meeting rooms without conflicts.
- **Schools/Colleges** — manage lab equipment, projectors, sports gear; audit lab inventory each semester.
- **Hospitals** — track shared diagnostic equipment and wheelchairs across departments, with maintenance approval before critical equipment goes offline.
- **Factories** — manage tool cribs and machinery allocation, route repair requests through supervisor approval, run periodic safety audits.
- **Agencies/Field teams** — track vehicles and field equipment, book vehicles for site visits, flag overdue returns automatically.

### How We Use Our Stack
- **Redis** caches frequently-read data (asset directory listings, dashboard KPIs) so the dashboard stays fast under real-time load.
- **RabbitMQ** decouples notification generation (allocation, booking, maintenance events) from delivery, so a burst of activity doesn't block the main API.
- **SignalR** pushes dashboard/notification updates to every connected client instantly — no polling.
- **MinIO** stores asset photos, maintenance photos, and audit evidence with an S3-compatible API, fully under our own infrastructure.
- **MongoDB's flexible schema** fits the varied asset types (electronics, vehicles, furniture) and their category-specific fields without rigid relational migrations.

---

## 📂 Project Structure

```
├── backend/            # ASP.NET Core Web API
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Hubs/            # SignalR hubs
│   └── ...
├── frontend/           # React/Next.js client
│   ├── components/
│   ├── pages/
│   └── ...
├── docker-compose.yml   # Mongo, Redis, RabbitMQ, MinIO
├── .github/workflows/   # CI build & test
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Docker & Docker Compose
- .NET 8 SDK
- Node.js 18+

### 1. Spin up infrastructure
```bash
docker compose up -d
```
This starts MongoDB, Redis, RabbitMQ, and MinIO locally — no external accounts needed.

### 2. Run the backend
```bash
cd backend
dotnet restore
dotnet run
```

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` in both `/backend` and `/frontend` and fill in local connection strings (Mongo, Redis, RabbitMQ, MinIO — all pointing to `localhost` by default via Docker Compose).

---

## ✅ Status

- [ ] Auth & Org Setup
- [ ] Asset Registration & Directory
- [ ] Allocation & Transfer
- [ ] Resource Booking
- [ ] Maintenance Workflow
- [ ] Dashboard & Notifications
- [ ] Audit Cycles
- [ ] Reports & Analytics

---

## 📜 License

Built for Odoo Hackathon 2026. All rights to team members, submitted under hackathon terms.
