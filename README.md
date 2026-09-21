# OmniLease Quoter — Enterprise Insurtech Platform (Angular 18 LTS)

A modern, production-grade hands-on study and portfolio repository simulating a **Multi-Carrier Rental Guarantee Insurance Quoter** (*Seguro Fiança Locatícia & Incêndio*) integrated with enterprise underwriting carriers (**Apex Marine, Beacon Assurance, and Vanguard Surety**).

This project demonstrates a **Senior-level Angular Architecture**, bridging historical enterprise challenges (Angular 6/14 migrations, untyped forms, and Zone.js bottlenecks) with modern industry standards (**Angular 18+ LTS, Signals, Functional DI, Native Control Flow, Zoneless readiness, and .NET Core Web API integration**).

---

## Quick Navigation & Study Guides

| Document | Purpose |
| :--- | :--- |
| **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** | Modern Angular 18 LTS vs Angular 6/14 architecture, Signals vs RxJS, Zoneless, OnPush change detection, and DI internals. |
| **[`DOMAIN_INSURTECH_INTEGRATION.md`](./DOMAIN_INSURTECH_INTEGRATION.md)** | Deep dive into the real estate insurance domain: Multi-carrier API integration, underwriting rules, DTO mapping with .NET backend. |
| **[`SENIOR_ANGULAR_CHEATSHEET.md`](./SENIOR_ANGULAR_CHEATSHEET.md)** | High-yield interview questions, technical traps, code patterns, and live coding cheatsheet for technical interviews (Enterprise / Consulting). |
| **[`ROADMAP_EXERCISES.md`](./ROADMAP_EXERCISES.md)** | Progressive hands-on exercises from foundation to senior architecture (multi-step wizard, streaming quotes, custom validators, unit tests). |

---

## Quick Start

```bash
# Navigate to project
cd C:\source\omnilease-quoter

# Install dependencies
npm install

# Start development server
npm start
# App runs at: http://localhost:4200

# Build production bundle (AOT, tree-shaking, strict typing)
npm run build

# Run unit tests
npm test
```

---

## Tech Stack & Architecture Highlights

- **Framework:** Angular 18.2+ LTS (Standalone Components default, zero `NgModule`).
- **Language:** TypeScript 5.5 (Strict mode enabled, `noImplicitAny`, strict null checks).
- **Reactivity Model:** Hybrid **Signals** (`signal()`, `computed()`, `effect()`) for synchronous UI state + **RxJS 7.8** for asynchronous network streams and backoff/retry strategies.
- **Control Flow:** Built-in template syntax (`@if`, `@for`, `@switch`, `@defer`).
- **Forms:** Strictly Typed Reactive Forms (`FormGroup<{ ... }>`).
- **Dependency Injection:** Modern `inject()` functional token resolution.
- **HTTP Pipeline:** Functional Interceptors (`HttpInterceptorFn`) with JWT injection, correlation IDs, and exponential backoff retry logic.
- **Change Detection:** `ChangeDetectionStrategy.OnPush` across all presentation components.

---

## System Integration Topology

```
┌─────────────────────────────────────────────────────────────┐
│             Real Estate Agency Portal (Angular SPA)         │
│  - Rental & Property Finances Form                         │
│  - Tenant Credit Profile & CPF                             │
│  - Real-time Computed Monthly Commitment                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/v1/quotes
                               ▼
┌─────────────────────────────────────────────────────────────┐
│         OmniLease .NET Core Gateway / Aggregator API        │
│  - Normalizes DTOs                                          │
│  - Serasa Experian Credit Bureau Verification               │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Apex Marine  │       │Beacon Assur. │       │Vanguard Sure.│
│  Fiança API  │       │  Fiança API  │       │  Fiança API  │
│(Fast ~600ms) │       │(Batch ~1.8s) │       │(Async ~1.2s) │
└──────────────┘       └──────────────┘       └──────────────┘
```

See [DOMAIN_INSURTECH_INTEGRATION.md](./DOMAIN_INSURTECH_INTEGRATION.md) for full protocol and payload specifications.
