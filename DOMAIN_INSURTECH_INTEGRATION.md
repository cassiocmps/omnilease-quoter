# Domain Deep Dive: Multi-Carrier Insurtech & Apex Marine Integration

This document outlines the business rules, architecture, and API integration mechanics of **OmniLease** (Real Estate Insurtech Platform) and underwriting carriers like **Apex Marine Seguros, Beacon Assurance, and Vanguard Surety** for **Seguro Fiança Locatícia** (Rental Guarantee Insurance).

---

## 1. Business Context & Value Proposition

### What is OmniLease?
OmniLease is a specialized B2B Insurtech platform connecting:
1. **Real Estate Agencies (*Imobiliárias*):** Need to rent properties quickly without the friction of traditional human guarantors (*fiadores*) or 3-month cash deposits (*depósitos caução*).
2. **Insurance Carriers (*Seguradoras*):** Underwrite default risk, property damage, and legal fees.
3. **Tenants (*Inquilinos*):** Pay a monthly or annual insurance fee to guarantee the lease.

### What is Apex Marine Fiança Locatícia?
Apex Marine is one of the premier insurance carriers in Brazil for rental guarantee. Their market differentiators:
* **Automated Risk Engine:** Instant credit approval for residential leases based on CPF and bureau scores (Serasa/Boa Vista).
* **Rapid Indemnity SLA:** One of the fastest compensation turnaround times in the market (claims paid within 3 to 5 business days upon proven default).
* **Comprehensive Bundled Coverages:** Basic rent default, condominium fees, IPTU, internal/external painting, physical property damage, and 24-hour emergency assistance (plumber, locksmith, electrician).

---

## 2. Technical Integration Topology

```
┌─────────────────────────────────────────────────────────────────┐
│               Imobiliária User / Corretor Portal                │
│                        [ Angular SPA ]                          │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ HTTPS (JWT Bearer, Correlation-ID)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             OmniLease .NET Core Gateway / Aggregator            │
│                                                                 │
│  - Endpoint: POST /api/v1/fianca/quotes                         │
│  - Credit Bureau Query (Serasa Experian / SPC)                  │
│  - Parallel Provider Dispatcher (C# Task.WhenAll)               │
│  - Carrier Schema Normalization Engine                          │
└────────┬───────────────────────┬───────────────────────┬────────┘
         │                       │                       │
         │ REST / mTLS           │ SOAP / MTOM           │ REST / HMAC
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Apex Marine    │    │ Beacon Assurance │    │ Vanguard Surety  │
│   Insurtech API  │    │   Parceiros API  │    │  Enterprise API  │
│  (Avg: ~600ms)   │    │  (Avg: ~1800ms)  │    │  (Avg: ~1200ms)  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 3. Financial & Underwriting Rules

### A. Monthly Commitment Formula (*Custo Total da Locação*)
The base insured amount is not just the rent. It encompasses all recurring lease liabilities:

$$\text{Compromisso Mensal} = \text{Aluguel} + \text{Condomínio} + \text{IPTU} + \text{Encargos Fixos}$$

### B. Income Multiplier Rule (*Comprovação de Renda*)
* **Rule:** The tenant's gross or net proven income must satisfy:
  $$\text{Renda Mensal} \ge 3 \times \text{Compromisso Mensal}$$
* If $\text{Renda} < 3 \times \text{Compromisso}$, Apex Marine either:
  1. Requests **Income Composition** (*Composição de Renda* with up to 3 co-tenants).
  2. Flags status as `PENDING_ANALYSIS` (manual underwriter review required).
  3. Rejects the proposal (`REFUSED`) if bureau credit score is below threshold (< 550).

### C. Pricing & Tariffs
* **Apex Marine Standard Rate:** ~8% to 12% of the annual rent commitment (equivalent to approximately 1 to 1.5 monthly rents per year, payable in up to 12 monthly interest-free credit card or boleto installments).
* **Optional Coverages Factor:**
  * Danos ao Imóvel: $+1.2\%$ base premium
  * Pintura Interna: $+0.8\%$ base premium
  * Multa Rescisória: $+0.5\%$ base premium
  * Assistência 24h: Flat fee (R$ 15,00/month)

---

## 4. API Contract & Data Payloads

### Frontend Request to OmniLease Gateway
```json
{
  "property": {
    "zipCode": "01310-100",
    "propertyType": "RESIDENTIAL_APARTMENT",
    "rentAmount": 2800.00,
    "condoAmount": 750.00,
    "iptuAmount": 180.00
  },
  "tenant": {
    "fullName": "Mariana Souza Santos",
    "cpf": "12345678901",
    "email": "mariana.souza@email.com",
    "monthlyIncome": 12500.00,
    "employmentType": "CLT"
  },
  "coverages": {
    "rentDefault": true,
    "propertyDamage": true,
    "internalPainting": true,
    "fineBreach": false,
    "assistance24h": true
  }
}
```

### Gateway Response from Apex Marine Adapter
```json
{
  "quoteId": "APX-2026-98124",
  "providerId": "apex-marine",
  "providerName": "Apex Marine Seguros",
  "logoUrl": "assets/logos/apex-marine.svg",
  "status": "APPROVED",
  "creditScore": 840,
  "financials": {
    "totalCommitment": 3730.00,
    "monthlyPremium": 312.45,
    "annualPremium": 3749.40,
    "installments": [
      { "times": 1, "value": 3749.40, "hasInterest": false },
      { "times": 12, "value": 312.45, "hasInterest": false }
    ]
  },
  "highlights": [
    "Aprovação imediata sem envio de holerite",
    "Indenização em até 3 dias úteis",
    "Assistência Residencial 24h inclusa"
  ],
  "responseTimeMs": 620
}
```

---

## 5. Senior Frontend Architectural Implications

When presenting this domain in an interview, emphasize the **front-end engineering challenges** it presents:

1. **Handling Heterogeneous Provider Latency:**
   * *Problem:* Apex Marine returns in 600ms, while Beacon Assurance takes 2000ms. Blocking the whole screen until all finish degrades UX.
   * *Senior Solution:* Implement **streaming quotes** using RxJS `merge` / SSE or progressive rendering: render Apex Marine's card immediately, keeping a skeleton loader active on other provider cards until their responses arrive.
2. **Currency & Precision Handling:**
   * Never store currency as floats during arithmetic; maintain values in whole cents (`integer`) or normalize cleanly to prevent IEEE-754 floating point drift (`2800.00 + 750.00 = 3550.0000000000005`).
3. **Resilient Form Validation (Async Debt & Credit Checks):**
   * Implementing asynchronous custom validators in Angular (`AsyncValidatorFn`) that debounce CPF entry by 400ms before querying the backend for duplicate applications or active policies.
