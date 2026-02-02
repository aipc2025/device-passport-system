# System Architecture Documentation
## Device Passport Traceability System

**Version**: 1.1.0
**Last Updated**: 2026-02-03
**Architecture Type**: Monorepo, Microservices-Ready
**Deployment**: Docker + Cloud (AWS/Azure/GCP)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Patterns](#3-architecture-patterns)
4. [Project Structure](#4-project-structure)
5. [Component Diagrams](#5-component-diagrams)
6. [Data Flow](#6-data-flow)
7. [API Structure](#7-api-structure)
8. [Database Schema](#8-database-schema)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Module Dependencies](#10-module-dependencies)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Security Architecture](#12-security-architecture)
13. [Performance Optimization](#13-performance-optimization)
14. [Scalability Strategy](#14-scalability-strategy)

---

## 1. System Overview

### Purpose
B2B device passport traceability system for electromechanical automation equipment trading and service management with full lifecycle tracking.

### Core Features
- **Digital Passport**: Unique QR codes for device lifecycle management
- **Expert Services**: Technical and business expert matching platform
- **Marketplace**: B2B equipment trading (Product listings + RFQ system)
- **Service Management**: Work order tracking with status workflow
- **Points System**: Reward and credit system for user engagement
- **Multi-tenancy**: Organization-based data isolation

### Business Model
- B2B SaaS platform
- Commission-based marketplace
- Service fee from expert matching
- Premium membership for RUSHING mode
- Token economy (LUNA Bitcoin - NB) for blockchain integration

---

## 2. Technology Stack

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI library |
| **Language** | TypeScript | 5.3.3 | Type safety |
| **Build Tool** | Vite | 5.0.8 | Fast dev server & build |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS |
| **Routing** | React Router | 6.21.2 | SPA navigation |
| **State Management** | Zustand | 4.4.7 | Lightweight state |
| **Data Fetching** | Axios | 1.6.5 | HTTP client |
| **Server State** | React Query | 5.17.9 | Cache & sync |
| **Forms** | React Hook Form | 7.49.3 | Form validation |
| **Icons** | Lucide React | 0.307.0 | Icon library |
| **Notifications** | React Hot Toast | 2.4.1 | Toast messages |
| **QR Codes** | qrcode.react | 3.1.0 | QR generation |
| **Maps** | Leaflet | 1.9.4 | Interactive maps |
| **i18n** | react-i18next | 14.0.1 | Internationalization |
| **SEO** | React Helmet Async | 2.0.4 | Meta tags |
| **PWA** | Vite Plugin PWA | 0.17.4 | Service worker |

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | NestJS | 10.3.0 | Node.js framework |
| **Language** | TypeScript | 5.3.3 | Type safety |
| **ORM** | TypeORM | 0.3.19 | Database abstraction |
| **Database** | PostgreSQL | 16 | Primary datastore |
| **Cache** | Redis | 7 | Session & cache |
| **Auth** | Passport.js | 0.7.0 | Authentication |
| **JWT** | @nestjs/jwt | 10.2.0 | Token management |
| **Validation** | class-validator | 0.14.0 | DTO validation |
| **API Docs** | Swagger | 7.1.17 | OpenAPI docs |
| **Testing** | Jest | 29.7.0 | Unit tests |
| **E2E Testing** | Supertest | 6.3.3 | API tests |
| **WebSocket** | Socket.IO | 4.6.1 | Real-time |
| **File Upload** | Multer | 1.4.5-lts.1 | File handling |
| **Compression** | @nestjs/compression | 0.2.0 | Response gzip |
| **Security** | Helmet | 7.1.0 | Security headers |
| **Rate Limiting** | @nestjs/throttler | 5.1.1 | API throttling |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **Turborepo** | Monorepo build orchestration |
| **pnpm** | Fast, disk-efficient package manager |
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Playwright** | E2E browser testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |
| **GitHub Actions** | CI/CD pipeline (recommended) |

---

## 3. Architecture Patterns

### Overall Architecture
- **Monorepo**: Single repository with multiple packages
- **Separation of Concerns**: Clear frontend/backend separation
- **RESTful API**: Resource-oriented API design
- **Layered Architecture**: Presentation → Business Logic → Data Access
- **Event-Driven**: WebSocket for real-time updates
- **Microservices-Ready**: Modular design for future service extraction

### Backend Architecture (NestJS)
```
┌─────────────────────────────────────────────────┐
│              Controller Layer                    │
│  (HTTP Routes, WebSocket Gateways, Guards)      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Service Layer                       │
│  (Business Logic, Orchestration)                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Repository Layer                    │
│  (TypeORM Repositories, Database Access)         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Database Layer                      │
│  (PostgreSQL, Redis)                             │
└─────────────────────────────────────────────────┘
```

### Frontend Architecture (React)
```
┌─────────────────────────────────────────────────┐
│              Pages                               │
│  (Route Components, Page Logic)                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Components                          │
│  (Reusable UI Components)                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Services                            │
│  (API Calls, Business Logic)                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Store (Zustand)                     │
│  (Client-side State Management)                  │
└─────────────────────────────────────────────────┘
```

---

## 4. Project Structure

```
device-passport-system/
├── apps/
│   ├── api/                          # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts               # Application entry point
│   │   │   ├── app.module.ts         # Root module
│   │   │   ├── config/               # Configuration
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   └── redis.config.ts
│   │   │   ├── modules/              # Feature modules
│   │   │   │   ├── auth/             # Authentication
│   │   │   │   ├── users/            # User management
│   │   │   │   ├── organizations/    # Multi-tenancy
│   │   │   │   ├── passport/         # Device passports
│   │   │   │   ├── expert/           # Expert services
│   │   │   │   ├── service-order/    # Work orders
│   │   │   │   ├── marketplace/      # Trading platform
│   │   │   │   ├── matching/         # Matching algorithm
│   │   │   │   ├── points/           # Reward system
│   │   │   │   ├── scan/             # Public QR scan
│   │   │   │   ├── supplier/         # Supplier management
│   │   │   │   ├── service-request/  # Public requests
│   │   │   │   ├── device-takeover/  # Device registration
│   │   │   │   ├── invitation/       # Referral system
│   │   │   │   └── notification/     # Notifications
│   │   │   ├── database/             # Database
│   │   │   │   ├── migrations/       # TypeORM migrations
│   │   │   │   └── seeds/            # Seed data
│   │   │   ├── common/               # Shared utilities
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   └── pipes/
│   │   │   └── entities/             # TypeORM entities
│   │   ├── test/                     # E2E tests
│   │   ├── uploads/                  # File storage (dev)
│   │   └── package.json
│   │
│   └── web/                          # Frontend (React)
│       ├── src/
│       │   ├── main.tsx              # React entry point
│       │   ├── App.tsx               # Root component
│       │   ├── pages/                # Route pages
│       │   │   ├── Home.tsx
│       │   │   ├── Login.tsx
│       │   │   ├── Scan.tsx
│       │   │   ├── admin/            # Admin pages
│       │   │   ├── expert/           # Expert pages
│       │   │   ├── marketplace/      # Marketplace pages
│       │   │   ├── supplier/         # Supplier pages
│       │   │   ├── buyer/            # Buyer pages
│       │   │   └── registration/     # Registration flows
│       │   ├── components/           # Reusable components
│       │   │   ├── common/           # Common UI
│       │   │   ├── layouts/          # Layout components
│       │   │   └── forms/            # Form components
│       │   ├── services/             # API services
│       │   │   └── api.ts            # Axios configuration
│       │   ├── store/                # Zustand stores
│       │   │   ├── auth.store.ts
│       │   │   └── user.store.ts
│       │   ├── hooks/                # Custom hooks
│       │   │   ├── usePWA.ts
│       │   │   └── useGeolocation.ts
│       │   ├── i18n/                 # Internationalization
│       │   │   └── locales/
│       │   ├── assets/               # Static assets
│       │   └── styles/               # Global styles
│       ├── public/                   # Public assets
│       ├── index.html                # HTML template
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared code
│       ├── src/
│       │   ├── enums/                # Enums
│       │   │   └── index.ts          # ProductLine, UserRole, etc.
│       │   ├── types/                # TypeScript types
│       │   │   ├── passport.ts
│       │   │   ├── user.ts
│       │   │   └── service-order.ts
│       │   └── utils/                # Utilities
│       │       ├── passport-code.ts  # Code generation
│       │       └── expert-passport-code.ts
│       └── package.json
│
├── database/
│   ├── migrations/                   # Database migrations
│   └── seeds/                        # Seed data scripts
│
├── docker/
│   ├── Dockerfile.api                # Backend Docker image
│   ├── Dockerfile.web                # Frontend Docker image
│   └── docker-compose.yml            # Multi-container setup
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── BLOCKCHAIN-TOKEN-IMPLEMENTATION-PLAN.md
│   └── TEST-VERIFICATION-CHECKLIST.md
│
├── .github/
│   └── workflows/                    # CI/CD pipelines
│
├── turbo.json                        # Turborepo configuration
├── pnpm-workspace.yaml               # pnpm workspace
├── package.json                      # Root package.json
└── README.md                         # Project README
```

---

## 5. Component Diagrams

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Web App  │  │  Mobile  │  │ QR Scan  │  │   PWA    │    │
│  │ (React)  │  │   App    │  │  Device  │  │  (SW)    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS (REST API / WebSocket)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer            │
│                    (Nginx / AWS ALB / Cloudflare)           │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer (NestJS)                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Auth Module  │ │Device Module │ │Expert Module │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │Marketplace   │ │Service Orders│ │ Points Sys   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ PostgreSQL   │ │    Redis     │ │  File Store  │        │
│  │  (Primary)   │ │   (Cache)    │ │  (S3/Local)  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services (Future)                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Blockchain   │ │     IPFS     │ │   Payment    │        │
│  │  (Polygon)   │ │  (Storage)   │ │   Gateway    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Module Dependency Graph

```
                       ┌──────────┐
                       │   Auth   │
                       └─────┬────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
          ┌─────▼────┐ ┌─────▼────┐ ┌────▼─────┐
          │  Users   │ │   Orgs   │ │  Points  │
          └─────┬────┘ └─────┬────┘ └────┬─────┘
                │            │            │
       ┌────────┼────────────┼────────────┘
       │        │            │
  ┌────▼────┐ ┌▼─────────┐ ┌▼──────────┐
  │Passport │ │  Expert  │ │ Service   │
  │ (Device)│ │          │ │  Orders   │
  └────┬────┘ └─────┬────┘ └────┬──────┘
       │            │            │
       └────────────┼────────────┘
                    │
            ┌───────▼───────┐
            │  Marketplace  │
            │  (Products +  │
            │     RFQs)     │
            └───────┬───────┘
                    │
            ┌───────▼───────┐
            │    Matching   │
            │   Algorithm   │
            └───────────────┘
```

---

## 6. Data Flow

### User Authentication Flow

```
┌──────┐     1. POST /api/v1/auth/login     ┌─────────┐
│Client├──────(email + password)──────────▶│  API    │
└──────┘                                    └────┬────┘
   ▲                                             │
   │                                        2. Validate
   │                                             │
   │                                        ┌────▼────┐
   │                                        │Database │
   │                                        │(Users)  │
   │                                        └────┬────┘
   │                                             │
   │    5. Store tokens in Zustand               │
   │       + localStorage                   3. Generate
   │                                        JWT Tokens
   │                                             │
   │     4. { accessToken, refreshToken,    ┌────▼────┐
   └───────────── user }◀──────────────────│  Redis  │
                                            │ (Session)│
                                            └─────────┘
```

### Device Passport Creation Flow

```
┌──────┐  1. Fill Form   ┌─────────┐  2. Validate  ┌──────────┐
│Admin ├───────────────▶│Frontend ├────────────▶│   API    │
└──────┘                 └─────────┘               └─────┬────┘
                                                         │
                                                   3. Generate
                                                   Passport Code
                                                   (with checksum)
                                                         │
                                                   ┌─────▼────┐
                                                   │  Shared  │
                                                   │  Utils   │
                                                   └─────┬────┘
                                                         │
                                                   4. Create
                                                   Entity
                                                         │
                                                   ┌─────▼────┐
                                                   │Database  │
                                                   │(Passport)│
                                                   └─────┬────┘
                                                         │
                                                   5. Generate
                                                   QR Code
                                                         │
                                                   ┌─────▼────┐
                                                   │QR Library│
                                                   └─────┬────┘
                                                         │
┌──────┐  7. Display QR   ┌─────────┐  6. Return  │
│Admin │◀─────────────────│Frontend │◀────────────┘
└──────┘                   └─────────┘
```

### Expert Matching Flow

```
┌───────────┐  1. Submit    ┌─────────┐  2. Create  ┌──────────┐
│ Customer  ├──Service──────▶│Frontend ├────Order────▶│   API    │
│           │  Request       └─────────┘              └─────┬────┘
└───────────┘                                               │
                                                       3. Save
                                                            │
                                                      ┌─────▼─────┐
                                                      │ Database  │
                                                      │(Service   │
                                                      │ Orders)   │
                                                      └─────┬─────┘
                                                            │
                                                       4. Trigger
                                                       Matching
                                                            │
                                                      ┌─────▼─────┐
                                                      │ Matching  │
                                                      │ Service   │
                                                      └─────┬─────┘
                                                            │
                                                       5. Calculate
                                                       Scores
                                                       (Skill, Location,
                                                        Availability)
                                                            │
                                                      ┌─────▼─────┐
                                                      │ Database  │
                                                      │ (Experts) │
                                                      └─────┬─────┘
                                                            │
                                                       6. Filter
                                                       RUSHING
                                                       Experts
                                                            │
                                                      ┌─────▼─────┐
                                                      │WebSocket  │
                                                      │ Gateway   │
                                                      └─────┬─────┘
                                                            │
┌───────────┐  8. Accept     ┌─────────┐  7. Push    │
│  Expert   │◀────Order──────│Mobile   │◀─Notification┘
│ (RUSHING) │                │ App     │
└───────────┘                └─────────┘
```

---

## 7. API Structure

### RESTful Resource Naming

```
/api/v1
├── /auth
│   ├── POST   /login
│   ├── POST   /register
│   ├── POST   /refresh
│   └── POST   /logout
│
├── /scan
│   └── GET    /:code
│
├── /passports
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   └── PATCH  /:id/status
│
├── /experts
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── PATCH  /:id/work-status
│   ├── GET    /:id/matches
│   └── GET    /:id/service-records
│
├── /service-orders
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── POST   /:id/assign
│   ├── POST   /:id/complete
│   └── POST   /:id/cancel
│
├── /marketplace
│   ├── /products
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /:id
│   │   ├── PATCH  /:id
│   │   └── DELETE /:id
│   ├── /rfqs
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /:id
│   │   ├── PATCH  /:id
│   │   └── DELETE /:id
│   └── /matches
│       ├── GET    /supplier
│       └── GET    /buyer
│
├── /inquiries
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   └── POST   /:id/messages
│
├── /points
│   ├── GET    /balance
│   ├── GET    /transactions
│   └── GET    /rules
│
└── /notifications
    ├── GET    /
    ├── PATCH  /:id/read
    └── DELETE /:id
```

### Response Format

**Success Response**:
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "...": "..."
  },
  "message": "Success"
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Pagination Response**:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 8. Database Schema

### Core Tables

**users**
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- passwordHash (VARCHAR)
- name (VARCHAR)
- role (ENUM: PUBLIC, CUSTOMER, EXPERT, ENGINEER, QC_INSPECTOR, OPERATOR, ADMIN)
- organizationId (UUID, FK → organizations)
- createdAt, updatedAt

**organizations**
- id (UUID, PK)
- name (VARCHAR)
- code (VARCHAR(3), UNIQUE)
- companyType (ENUM)
- legalRepresentative (VARCHAR)
- registeredCapital (DECIMAL)
- status (ENUM: PENDING, APPROVED, REJECTED)
- createdAt, updatedAt

**device_passports**
- id (UUID, PK)
- passportCode (VARCHAR, UNIQUE)
- companyCode (VARCHAR(3))
- yearMonth (VARCHAR(4))
- productType (VARCHAR(2))
- origin (VARCHAR(2))
- sequence (INTEGER)
- checksum (VARCHAR(2))
- deviceName (VARCHAR)
- manufacturer (VARCHAR)
- serialNumber (VARCHAR, UNIQUE)
- status (ENUM)
- currentLocation (VARCHAR)
- locationCoordinates (GEOGRAPHY(POINT))
- createdById (UUID, FK → users)
- organizationId (UUID, FK → organizations)
- createdAt, updatedAt

**expert_passports**
- id (UUID, PK)
- userId (UUID, FK → users)
- passportCode (VARCHAR, UNIQUE)
- expertType (ENUM: T, B, A)
- industryCode (VARCHAR)
- skillCode (VARCHAR)
- birthYearMonth (VARCHAR(4))
- nationality (VARCHAR(2))
- sequence (INTEGER)
- checksum (VARCHAR(2))
- professionalField (VARCHAR)
- yearsExperience (INTEGER)
- servicesOffered (TEXT)
- certifications (JSONB)
- workStatus (ENUM: IDLE, AVAILABLE, RUSHING, BOOKED, IN_SERVICE, OFF_DUTY)
- membershipLevel (ENUM: FREE, SILVER, GOLD, DIAMOND)
- membershipExpiry (TIMESTAMP)
- createdAt, updatedAt

**service_orders**
- id (UUID, PK)
- orderNumber (VARCHAR, UNIQUE)
- title (VARCHAR)
- description (TEXT)
- urgency (ENUM: LOW, MEDIUM, HIGH, URGENT)
- status (ENUM: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
- devicePassportId (UUID, FK → device_passports)
- customerId (UUID, FK → users)
- expertId (UUID, FK → users)
- locationCoordinates (GEOGRAPHY(POINT))
- attachments (JSONB)
- createdAt, updatedAt

**marketplace_products**
- id (UUID, PK)
- supplierId (UUID, FK → users)
- listingTitle (VARCHAR)
- description (TEXT)
- productType (VARCHAR)
- hsCode (VARCHAR)
- priceMin (DECIMAL)
- priceMax (DECIMAL)
- currency (VARCHAR)
- moq (INTEGER)
- leadTimeDays (INTEGER)
- status (ENUM: DRAFT, ACTIVE, PAUSED, SOLD_OUT)
- createdAt, updatedAt

**marketplace_rfqs**
- id (UUID, PK)
- buyerId (UUID, FK → users)
- title (VARCHAR)
- description (TEXT)
- category (VARCHAR)
- quantity (INTEGER)
- budgetMin (DECIMAL)
- budgetMax (DECIMAL)
- deliveryDeadline (DATE)
- status (ENUM: DRAFT, OPEN, CLOSED)
- isPublic (BOOLEAN)
- validUntil (DATE)
- createdAt, updatedAt

**matching_results**
- id (UUID, PK)
- sourceType (ENUM: PRODUCT, RFQ, SERVICE_REQUEST)
- sourceId (UUID)
- targetType (ENUM: RFQ, PRODUCT, EXPERT)
- targetId (UUID)
- score (DECIMAL)
- scoreBreakdown (JSONB)
- status (ENUM: NEW, VIEWED, CONTACTED, DISMISSED)
- createdAt, updatedAt

**point_transactions**
- id (UUID, PK)
- userId (UUID, FK → users)
- type (ENUM: REWARD, CREDIT, PENALTY)
- amount (INTEGER)
- balance (INTEGER)
- category (ENUM: SERVICE, REVIEW, REFERRAL, DEVICE, etc.)
- description (VARCHAR)
- metadata (JSONB)
- createdAt

### Indexes

```sql
-- Device Passports
CREATE INDEX idx_passport_code ON device_passports(passportCode);
CREATE INDEX idx_passport_org ON device_passports(organizationId);
CREATE INDEX idx_passport_status ON device_passports(status);
CREATE INDEX idx_passport_location ON device_passports USING GIST(locationCoordinates);

-- Experts
CREATE INDEX idx_expert_user ON expert_passports(userId);
CREATE INDEX idx_expert_status ON expert_passports(workStatus);
CREATE INDEX idx_expert_skills ON expert_passports(skillCode);

-- Service Orders
CREATE INDEX idx_order_status ON service_orders(status);
CREATE INDEX idx_order_customer ON service_orders(customerId);
CREATE INDEX idx_order_expert ON service_orders(expertId);
CREATE INDEX idx_order_location ON service_orders USING GIST(locationCoordinates);
CREATE INDEX idx_order_created ON service_orders(createdAt DESC);

-- Marketplace
CREATE INDEX idx_product_supplier ON marketplace_products(supplierId);
CREATE INDEX idx_product_status ON marketplace_products(status);
CREATE INDEX idx_rfq_buyer ON marketplace_rfqs(buyerId);
CREATE INDEX idx_rfq_status ON marketplace_rfqs(status);

-- Matching
CREATE INDEX idx_match_source ON matching_results(sourceType, sourceId);
CREATE INDEX idx_match_target ON matching_results(targetType, targetId);
CREATE INDEX idx_match_score ON matching_results(score DESC);
```

---

## 9. Authentication & Authorization

### JWT Token Structure

**Access Token** (expires in 15 minutes):
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "OPERATOR",
  "organizationId": "org-uuid",
  "iat": 1704076800,
  "exp": 1704077700
}
```

**Refresh Token** (expires in 7 days):
```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1704076800,
  "exp": 1704681600
}
```

### Role Hierarchy (Permission Levels)

```
PUBLIC          = 0  (View public info)
CUSTOMER        = 10 (View devices, submit requests)
EXPERT          = 15 (Accept service orders)
ENGINEER        = 20 (Execute service orders)
QC_INSPECTOR    = 25 (Update QC status)
OPERATOR        = 30 (Create devices, manage orders)
ADMIN           = 100 (Full access)

Supplier/Buyer roles = 12-18 (Marketplace access)
```

### Authorization Flow

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OPERATOR)
@Controller('passports')
export class PassportController {
  // Only ADMIN and OPERATOR can access
}
```

**Guards**:
- `JwtAuthGuard`: Validates JWT token
- `RolesGuard`: Checks user role against required roles
- `OrganizationGuard`: Ensures data isolation (user can only access their org's data)

---

## 10. Module Dependencies

### Core Dependencies

```
auth ─────────┐
              ├─▶ users
organizations ┘

users ────────┐
              ├─▶ passport (device)
organizations ┘

users ────────┐
              ├─▶ expert
points ───────┘

users ────────┐
expert ───────┤
              ├─▶ service-order
passport ─────┘

service-order ┐
expert ───────├─▶ matching
users ────────┘

users ────────┐
              ├─▶ marketplace (products, RFQs)
organizations ┘

marketplace ──┐
              ├─▶ matching
expert ───────┘
```

### Circular Dependency Prevention

- Use **Dependency Injection** (NestJS)
- Use **forwardRef()** for circular references
- Event-driven communication where appropriate
- Service interfaces for abstraction

---

## 11. Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────┐
│         Developer Machine               │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ React (Vite)│  │ NestJS      │      │
│  │ Port: 5173  │  │ Port: 3000  │      │
│  └─────────────┘  └──────┬──────┘      │
│                           │             │
│  ┌─────────────┐  ┌──────▼──────┐      │
│  │ PostgreSQL  │  │   Redis     │      │
│  │ Port: 5432  │  │ Port: 6379  │      │
│  └─────────────┘  └─────────────┘      │
│         Docker Containers               │
└─────────────────────────────────────────┘
```

**Commands**:
```bash
docker-compose up -d  # Start DB & Redis
pnpm dev              # Start API & Web concurrently
```

### Production Environment (Docker Compose)

```
┌─────────────────────────────────────────────────────────┐
│                      Cloud Server                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Nginx      │  │  API (Node)  │  │  Web (Static)│  │
│  │ Port: 80/443 ├─▶│  Port: 3000  │  │  Served by   │  │
│  │ (Reverse     │  │  (NestJS)    │  │  Nginx       │  │
│  │  Proxy)      │  └──────┬───────┘  └──────────────┘  │
│  └──────────────┘         │                             │
│                  ┌─────────┼──────────┐                 │
│                  │         │          │                 │
│         ┌────────▼─────┐  │  ┌───────▼──────┐          │
│         │ PostgreSQL   │  │  │    Redis     │          │
│         │ (Persistent) │  │  │   (Session)  │          │
│         └──────────────┘  │  └──────────────┘          │
│                           │                             │
│                  ┌────────▼─────┐                       │
│                  │ File Storage │                       │
│                  │ (Volume/S3)  │                       │
│                  └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

**docker-compose.yml** structure:
```yaml
services:
  nginx:      # Reverse proxy + static files
  api:        # NestJS application
  web:        # React build (static)
  postgres:   # Database
  redis:      # Cache
```

### Production Environment (Cloud - Kubernetes)

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│                                                          │
│  ┌──────────────┐                                       │
│  │   Ingress    │  (HTTPS, Load Balancing)              │
│  │  Controller  │                                       │
│  └──────┬───────┘                                       │
│         │                                               │
│    ┌────┴────┐                                          │
│    │   ┌─────▼────┐  ┌─────────┐  ┌─────────┐         │
│    │   │ API Pods │  │ Web Pod │  │ Workers │         │
│    │   │(Replicas)│  │(Nginx)  │  │ (Queue) │         │
│    │   └────┬─────┘  └─────────┘  └─────────┘         │
│    │        │                                           │
│    │   ┌────▼─────┐  ┌──────────┐  ┌─────────┐        │
│    │   │PostgreSQL│  │  Redis   │  │   S3    │        │
│    │   │(Stateful)│  │(Stateful)│  │(Storage)│        │
│    │   └──────────┘  └──────────┘  └─────────┘        │
│    │                                                    │
└────┴────────────────────────────────────────────────────┘
```

**Key Components**:
- **Ingress**: Nginx Ingress Controller
- **API Deployment**: 3+ replicas with auto-scaling
- **Database**: Managed PostgreSQL (AWS RDS, Azure Database, etc.)
- **Cache**: Managed Redis (AWS ElastiCache, Azure Cache, etc.)
- **Storage**: Object storage (S3, Azure Blob)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack / Loki

---

## 12. Security Architecture

### Security Layers

1. **Transport Layer**
   - HTTPS (TLS 1.3)
   - HSTS headers
   - Certificate pinning (mobile)

2. **Application Layer**
   - Helmet middleware (security headers)
   - CORS configuration
   - Rate limiting (100 req/min per IP)
   - Input validation (class-validator)
   - Output sanitization

3. **Authentication Layer**
   - JWT with RS256 (asymmetric)
   - Password hashing (bcrypt, 10 rounds)
   - Refresh token rotation
   - Session management (Redis)

4. **Authorization Layer**
   - Role-based access control (RBAC)
   - Permission hierarchy
   - Organization-level data isolation
   - Resource ownership checks

5. **Data Layer**
   - Encrypted at rest (database)
   - Encrypted in transit (SSL/TLS)
   - No sensitive data in logs
   - Personal data anonymization

### Security Best Practices Implemented

✅ No hardcoded credentials
✅ Environment variables for secrets
✅ SQL injection prevention (TypeORM)
✅ XSS prevention (React auto-escaping)
✅ CSRF tokens
✅ File upload validation (size, type, virus scan recommended)
✅ Rate limiting on sensitive endpoints
✅ Audit logging for sensitive operations
✅ Password complexity requirements
✅ Account lockout after failed login attempts

---

## 13. Performance Optimization

### Backend Optimizations

1. **Database**
   - Proper indexing on query fields
   - Connection pooling (default: 10)
   - Query result caching (Redis)
   - Pagination for large datasets
   - Eager loading with joins (prevent N+1)

2. **API**
   - Response compression (gzip)
   - ETags for conditional requests
   - API response caching (Redis)
   - Throttling/Rate limiting
   - Asynchronous operations

3. **Caching Strategy**
   ```
   Static data     → 1 hour  (Product types, enums)
   User profile    → 15 min  (Frequently accessed)
   Session data    → 7 days  (Refresh tokens)
   Search results  → 5 min   (Volatile data)
   ```

### Frontend Optimizations

1. **Build Time**
   - Code splitting (manual chunks)
   - Tree shaking (Vite)
   - Minification & uglification
   - Asset optimization (images)

2. **Runtime**
   - Lazy loading routes
   - Virtual scrolling (long lists)
   - Debounced search inputs
   - Optimistic UI updates
   - React.memo for expensive components

3. **Bundle Analysis**
   ```
   Before optimization: 1,151 KB (291 KB gzipped)
   After optimization:    782 KB (176 KB gzipped)
   Reduction:            39% gzipped
   ```

4. **Caching**
   - Service Worker (PWA)
   - Browser cache headers
   - React Query cache
   - LocalStorage for auth tokens

---

## 14. Scalability Strategy

### Horizontal Scaling

1. **API Layer**
   - Stateless application design
   - Load balancing across multiple instances
   - Auto-scaling based on CPU/memory
   - Sticky sessions not required

2. **Database Layer**
   - Read replicas for read-heavy operations
   - Write/Read separation
   - Connection pooling per instance
   - Partitioning large tables

3. **Cache Layer**
   - Redis cluster mode
   - Cache replication
   - Distributed caching

### Vertical Scaling

- Upgrade server resources (CPU, RAM)
- Database optimization (indexes, queries)
- Application profiling and optimization

### Microservices Migration Path

Current monolith can be split into:

1. **Auth Service**: Authentication & authorization
2. **Passport Service**: Device passport management
3. **Expert Service**: Expert matching & services
4. **Marketplace Service**: Product listings & RFQs
5. **Notification Service**: Push notifications & emails
6. **Matching Service**: Algorithm & scoring
7. **Points Service**: Reward & credit system

**Communication**: REST API / gRPC / Message Queue (RabbitMQ, Kafka)

---

## Conclusion

This architecture provides a solid foundation for a B2B device passport traceability system with:

✅ **Scalability**: Horizontally scalable with load balancing
✅ **Security**: Multi-layer security with RBAC and data isolation
✅ **Performance**: Optimized for fast response times
✅ **Maintainability**: Clean modular architecture
✅ **Extensibility**: Easy to add new features and modules
✅ **Reliability**: Error handling and monitoring ready
✅ **Future-proof**: Microservices-ready architecture

---

**Document Maintained By**: Development Team
**Last Review Date**: 2026-02-03
**Next Review Date**: 2026-04-03

