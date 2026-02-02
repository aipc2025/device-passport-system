# Device Passport Traceability System

## Project Overview

This is a full-stack B2B application for equipment lifecycle management with digital passport (QR code) tracking.

**Domain**: Electromechanical automation equipment trading and service
**Core Feature**: Device digital passport with full lifecycle traceability

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT + RBAC |
| API Docs | Swagger/OpenAPI |
| Testing | Jest + Supertest + Playwright |
| Package Manager | pnpm |
| Monorepo | Turborepo |

## Project Structure

```
device-passport-system/
├── apps/
│   ├── api/                 # NestJS Backend
│   └── web/                 # React Frontend
├── packages/
│   └── shared/              # Shared types & utils
├── database/
│   ├── migrations/
│   └── seeds/
├── docker/
├── docs/
└── .claude/skills/          # Claude Code skills
```

## Quick Commands

```bash
# Development
pnpm dev              # Start all services
pnpm dev:api          # Start backend only
pnpm dev:web          # Start frontend only

# Build
pnpm build            # Build all
pnpm build:api        # Build backend
pnpm build:web        # Build frontend

# Test
pnpm test             # Run all tests
pnpm test:api         # Backend tests
pnpm test:web         # Frontend tests
pnpm test:e2e         # E2E tests

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed data
pnpm db:reset         # Reset database

# Code Quality
pnpm lint             # Lint all
pnpm format           # Format code
pnpm typecheck        # Type check
```

## Key Business Concepts

### Device Passport Code Format
```
DP-{COMPANY}-{YEAR}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}
Example: DP-MED-2025-PLC-DE-000001-A7
```

### Product Lines
- PLC: Programmable Logic Controller
- MOT: Motor/Driver
- SEN: Sensor
- CTL: Controller
- ROB: Robot
- HMI: Human Machine Interface

### Device Status Flow
```
CREATED → PROCURED → IN_QC → QC_PASSED → IN_ASSEMBLY → 
IN_TESTING → TEST_PASSED → PACKAGED → IN_TRANSIT → DELIVERED → IN_SERVICE
```

### User Roles (by permission level)
1. PUBLIC - View public info, submit service requests
2. CUSTOMER - View device details, service history
3. ENGINEER - Execute service orders, access manuals
4. QC_INSPECTOR - Update QC status
5. OPERATOR - Create devices, manage orders
6. ADMIN - Full access

## Skill Files

For detailed development guidance, refer to:
- `.claude/skills/SKILL.md` - Main project skill
- `.claude/skills/BACKEND.md` - Backend development patterns
- `.claude/skills/FRONTEND.md` - Frontend development patterns
- `.claude/skills/WORKFLOW.md` - Claude Code workflow guide

## Development Phases

### Phase 1: MVP (Current) - ✅ COMPLETED
- [x] Database schema design
- [x] Passport code generation with checksum
- [x] Core CRUD APIs (50+ endpoints)
- [x] Public scan endpoint
- [x] Multi-role authentication (JWT + RBAC)
- [x] Full-featured React UI (52 pages)
- [x] Expert service system
- [x] B2B Marketplace
- [x] Points & reward system
- [x] Real-time notifications (WebSocket)
- [x] Mobile responsive + PWA
- [x] Comprehensive documentation

### Phase 2: Full Lifecycle - 8-10 weeks
- [ ] Procurement module
- [ ] QC inspection module
- [ ] Assembly & testing modules
- [ ] Logistics tracking

### Phase 3: Service Management - 6-8 weeks
- [ ] Work order system
- [ ] Engineer mobile app
- [ ] Customer portal

### Phase 4: Analytics & Blockchain - TBD
- [ ] Dashboard & reports
- [ ] Blockchain integration
- [ ] Smart contracts

## API Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/scan/:code | Scan device (public info) | No |
| POST | /api/v1/passports | Create passport | Admin/Operator |
| GET | /api/v1/passports | List passports | Yes |
| GET | /api/v1/passports/:id | Get passport detail | Yes |
| PATCH | /api/v1/passports/:id/status | Update status | Role-based |
| POST | /api/v1/auth/login | Login | No |

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use interfaces for DTOs and API responses
- Use enums for fixed value sets
- Explicit return types on functions

### NestJS
- Module-based architecture
- DTOs with class-validator decorators
- Guards for authorization
- Repository pattern for database

### React
- Functional components only
- React Query for server state
- Zustand for client state
- Tailwind for styling

### Database
- UUID primary keys
- JSONB for flexible fields
- Proper indexes on query fields
- Soft delete where appropriate

## Environment Variables

```bash
# API
DATABASE_URL=postgresql://user:pass@localhost:5432/passport
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# Web
VITE_API_URL=http://localhost:3000
```

## Getting Started

```bash
# 1. Clone and install
git clone <repo>
cd device-passport-system
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Start database
docker-compose up -d db redis

# 4. Run migrations
pnpm db:migrate

# 5. Start development
pnpm dev
```

## Contributing

1. Create feature branch from `develop`
2. Follow code style guidelines
3. Write tests for new features
4. Update documentation
5. Create PR with clear description
