# 🏛️ Managed Master Hub & Spoke Architecture: RentCast API & GeoSphere Plugin Synchronization

> **Copyright (c) 2025–2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.**  
> *Vantage AI Ecosystem • Centralized Master API Governance & Standalone Plugin Distribution*

---

## 📌 1. Strategic Decision: Why BYOK (Bring Your Own Key) Was Removed from the Plugin
Forcing commercial plugin buyers (e.g. mortgage brokers, real estate teams, site owners from Etsy/Gumroad/GitHub) to register their own RentCast account, manage credit cards, understand API tiers, and monitor unexpected overage charges creates massive user friction, support tickets, and potential churn.

### The Solution: Managed Master Feed Architecture ("Hub & Spoke")
- **Master Hub (GeoSphere Map Oregon App)**: **Mike Ford (Admin)** holds the single enterprise/growth RentCast API subscription. All external RentCast API pulls, automated `dsh-cron` schedules, MLS batching, and GeoID/DPA enrichment happen exclusively in the master GeoSphere app.
- **Spoke Plugins (Client Portals & Commercial Modules)**:
  - Contain **Zero Raw API Key Requirements (Zero BYOK)**.
  - Feature a 1-click **"Sync GeoMap Saved Listings"** button that imports curated, verified, DPA/USDA-badged listings from Mike Ford's Master GeoSphere Feed.
  - Include a built-in **"Request Area-Specific Low/No Down Payment Search"** dispatch: When a lead inputs an area and target monthly payment, the request routes directly to Mike Ford's master queue to trigger a RentCast pull and auto-sync the new qualifying listings back to the lead.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MASTER HUB (GeoSphere Map Oregon App)                    │
│  • Single RentCast Master API Account (Mike Ford Admin)                     │
│  • Scheduled dsh-cron 7/30-day Automated Pulls across Hundreds of Cities    │
│  • Automated GeoID Census Tract, USDA RD & CRA Grant Badging                │
│  • Master Firestore / JSON Feed Repository                                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Cloud Sync / Master Feed Stream)
┌─────────────────────────────────────────────────────────────────────────────┐
│             STANDALONE PLUGINS & CLIENT PORTALS (Zero BYOK Required)        │
│  • 1-Click "Sync GeoMap Saved Listings" Button (Instant Import)             │
│  • Interactive DTI Pre-Qualification Sliders (Max 50% DTI Envelope)         │
│  • Live Map Pin Popups & Rent-vs-Own Equity Metrics                         │
│  • "Request Area-Specific Low/No Down Search" -> Dispatches to Mike's Queue │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💳 2. RentCast API Pricing Tiers & Master Budgeting (For Mike Ford Admin)

All paid plans are billed monthly to Mike Ford's single account with nationwide listing coverage:

| Tier | Monthly Base Price | Included Monthly Requests | Cost per Included Request | Overage Fee (Per Additional Request) | Capacity for Master GeoSphere Network |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Developer (Free)** | **$0 / mo** | 50 requests | Free | $0.40 / req | Initial testing & unit verification |
| **Foundation** | **$74 / mo** | 1,000 requests | ~$0.074 / req | $0.20 / req | Up to ~200 cities on 30-day cron cycles (~50k–100k listings) |
| **Growth** | **$199 / mo** | 5,000 requests | ~$0.040 / req | $0.06 / req | 500+ cities monthly or 250 cities weekly + ad-hoc client requests |
| **Scale** | **$399 / mo** | 25,000 requests | ~$0.016 / req | $0.015 / req | Daily nationwide high-frequency automated watchdog |
| **Enterprise** | **Custom** | 100,000+ requests | Negotiated bulk | Custom SLA | Multi-brokerage national MLS aggregates |

---

## 🔍 3. Ingestion Mechanics & 500-Record Batch Optimization

1. **Batch Size (`limit=500`)**: RentCast allows retrieving up to **500 active property records per single billable API request**.
2. **Billing per HTTP Call**: An API call returning 500 properties costs only **1 request credit**.
3. **Filter Pre-Screening**: By appending `maxPrice=650000` (regional FHA/conforming cap) and `status=Active`, all non-qualifying multi-million-dollar luxury properties are filtered out at the API level, cutting billable calls by 50%.

### Master Cron Budget Calculations:
* **200 Target Metro Areas (Monthly)**: 200 cities × 2 calls = **400 API requests / month** → Easily covered by **Foundation Plan ($74/mo)**.
* **500 Cities Nationwide (Monthly)**: 500 cities × 2.5 calls = **1,250 API requests / month** → Covered by **Growth Plan ($199/mo)** with 3,750 requests remaining for borrower area requests.
* **Weekly Price-Drop Watchdog (250 Cities)**: 250 cities × 2 calls × 4 weeks = **2,000 requests / month** → Covered by **Growth Plan ($199/mo)**.

---

## 🚀 4. How the Plugin Handles Client Data & Area Requests

When a borrower or plugin owner uses the standalone plugin:

1. **Instant Offline/Cached Access**:
   The plugin loads with pre-synced master listings (e.g. Portland Metro, Lane County, Columbia County, Central Oregon) with verified photos, USDA RD eligibility, and CRA grants.
2. **1-Click "Sync GeoMap Saved Listings"**:
   Tapping this button connects to Mike Ford's Master Feed endpoint or Firestore collection, pulling down the latest refreshed properties and price drops in seconds.
3. **Borrower "Area-Specific Low/No Down Payment Request"**:
   If a buyer wants listings in a new city (e.g. Bend, Medford, Salem, or Boise), they click **"Request Area Listings"** and enter their target zip/city and budget.
   - The plugin dispatches a structured webhook/payload to Mike Ford's Master Admin Queue.
   - The master `dsh-cron` agent in the GeoSphere app executes the RentCast API call, badges the properties with DPA/Census Tract data, and syncs the new cluster directly to the buyer's map.

---
*Architectural Master Specification • Vantage AI Ecosystem*
