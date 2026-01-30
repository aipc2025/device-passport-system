# Device Passport System Development Skill

## Overview
This skill guides Claude Code to develop the Device Digital Passport Traceability System - a full-stack B2B application for equipment lifecycle management.

## Project Context
- **Domain**: B2B electromechanical automation equipment trading and service
- **Core Feature**: Device digital passport with QR code scanning
- **Tech Stack**: React + TypeScript (Frontend), NestJS + PostgreSQL (Backend)
- **Key Requirement**: Full lifecycle traceability from procurement to after-sales service

## Architecture Overview

```
device-passport-system/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── passport/   # Device passport module
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── user/       # User management
│   │   │   │   ├── lifecycle/  # Lifecycle events
│   │   │   │   ├── service/    # Service orders
│   │   │   │   └── supplier/   # Supplier portal
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   ├── filters/
│   │   │   │   └── interceptors/
│   │   │   └── config/
│   │   ├── test/
│   │   └── package.json
│   │
│   └── web/                    # React Frontend
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── store/
│       │   └── utils/
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared types and utilities
│       ├── types/
│       └── utils/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile.*
│
├── docs/
│   ├── api/
│   └── guides/
│
├── .claude/                    # Claude Code skills
│   └── skills/
│
├── package.json               # Monorepo root
├── pnpm-workspace.yaml
└── turbo.json
```

## Development Phases

### Phase 1: MVP Foundation (Current Focus)
1. Database schema setup
2. Passport code generation (UUID with checksum)
3. Core CRUD APIs
4. Public scan endpoint
5. Multi-role authentication
6. Basic React UI

### Phase 2: Full Lifecycle
1. Procurement module
2. Quality inspection module
3. Assembly & testing modules
4. Logistics tracking
5. Supplier portal

### Phase 3: Service Management
1. Work order system
2. Engineer mobile app
3. Customer portal

### Phase 4: Analytics & Blockchain
1. Dashboard & reports
2. Blockchain integration
3. Smart contracts

## Key Business Rules

### Passport Code Format
```
DP-{COMPANY}-{YEAR}-{PRODUCT_LINE}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}
Example: DP-MED-2025-PLC-DE-000001-A7

- COMPANY: 3 chars (default: MED)
- YEAR: 4 digits
- PRODUCT_LINE: PLC|MOT|SEN|CTL|ROB|HMI|INV|VLV|PCB|OTH
- ORIGIN: DE|US|JP|CN|IT|FR|KR|TW|CH|UK
- SEQUENCE: 6 digits, auto-increment per year+product+origin
- CHECKSUM: 2 chars, Luhn-based algorithm
```

### Role Permissions
| Role | Permissions |
|------|-------------|
| PUBLIC | View public device info, submit service request |
| CUSTOMER | + View device details, service history |
| ENGINEER | + Access manuals, execute service orders |
| QC_INSPECTOR | + Update QC status |
| OPERATOR | + Create devices, manage orders |
| ADMIN | Full access |

### Device Status Flow
```
CREATED → PROCURED → IN_QC → QC_PASSED → IN_ASSEMBLY → 
IN_TESTING → TEST_PASSED → PACKAGED → IN_TRANSIT → DELIVERED → IN_SERVICE
```

## Coding Standards

### TypeScript
- Strict mode enabled
- Use interfaces for DTOs
- Use enums for fixed values
- Proper error handling with custom exceptions

### NestJS Backend
- Follow module-based architecture
- Use DTOs with class-validator
- Implement guards for authorization
- Use interceptors for response transformation
- Repository pattern for database access

### React Frontend
- Functional components with hooks
- Zustand for state management
- React Query for API calls
- Tailwind CSS for styling
- Component composition over inheritance

### Database
- UUID primary keys
- JSONB for flexible fields
- Proper indexes
- Soft delete where appropriate
- Audit timestamps (created_at, updated_at)

## API Design Principles
- RESTful endpoints
- Consistent response format: `{ success, data, error, meta }`
- Pagination: `{ page, limit, total, items }`
- Use query params for filtering
- Proper HTTP status codes
- JWT authentication

## Testing Strategy
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for critical flows
- Minimum 80% coverage for core modules
