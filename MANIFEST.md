# Vantage AI Canonical Listing Store & Query Engine — Plugin Manifest

**Plugin Name:** `vantage-listings-oracle`  
**Version:** `1.0.0`  
**Protocol:** REST / JSON  
**Target Consumer:** Muse AI Agent & Vantage Loan Officer Systems  
**Compliance Authority:** Gramm-Leach-Bliley Act (GLBA) & Equal Housing Opportunity  

---

## 1. Overview & Architecture

The **Vantage AI Canonical Listing Store** (`curated_listings` Firestore collection) provides a durable, server-side store of standardized real estate listings enriched with verbatim geospatial overlay eligibility classifications from the Luther GeoSphere Oregon GIS engine.

### Core Architectural Invariants:
1. **Verbatim Source-of-Truth:** Eligibility evaluations (`usda`, `lmi`, `firstHome`, `lakeviewNational`, `fhfaCountyLimit`, `calhfaMyHome`, `idahoMrbTaxExempt`) originate exclusively from upstream GeoSphere spatial boundaries and are preserved verbatim in `overlayEligibility`. No server-side re-computation or client overrides are permitted.
2. **Zero-Trust Fail-Closed Security:** Endpoints servicing external AI agents require timing-safe verification against `MUSE_API_KEY`. Unconfigured environments return `HTTP 503`; missing or invalid credentials return `HTTP 401`.
3. **GLBA Telemetry & PII Redaction:** Every query is immutably logged to the `branch_audit_logs` compliance ledger. Queries never log borrower/buyer PII.
4. **Strict Eligibility Language:** All automated descriptions and assistant responses use **"likely qualifies"** language only.

---

## 2. API Endpoints

### 2.1 `GET /api/listings`
Retrieve curated property listings with multi-dimensional filtering, provenance citations, and once-per-session regulatory disclaimers.

- **Authentication:** Required (`MUSE_API_KEY`)
- **Headers:**
  - `x-muse-api-key: <key>` **OR**
  - `Authorization: Bearer <key>`
- **Query Parameters:**
  | Parameter | Type | Default | Description |
  |---|---|---|---|
  | `city` | string | `undefined` | Case-insensitive city filter (e.g. `Eugene`, `Bend`). |
  | `minPrice` | number | `undefined` | Minimum list price in USD. |
  | `maxPrice` | number | `undefined` | Maximum list price in USD. |
  | `program` | string | `undefined` | Target loan/grant program (`usda`, `lakeview`, `fhfa`, `calhfa`, `idaho`, `firsthome`, `lmi`). Evaluated against verbatim `overlayEligibility`. |
  | `maxDaysOnMarket`| number | `undefined` | Maximum days active on market. |
  | `listingId` | string | `undefined` | Exact listing ID to retrieve a single property. |
  | `limit` | number | `25` | Results limit (1 to 100). |
  | `cursor` | string | `undefined` | Pagination cursor. |
  | `includeStale` | boolean | `false` | When `true`, includes delisted or historical listings marked `_stale: true`. |
  | `sessionId` | string | `undefined` | Client session identifier for tracking once-per-session disclaimer delivery. |

- **Response Envelope (`application/json`):**
```json
{
  "listings": [
    {
      "id": "geo-1738491000-1",
      "address": "1240 Elm St",
      "city": "Junction City",
      "state": "OR",
      "zip": "97448",
      "price": 389000,
      "beds": 3,
      "baths": 2,
      "sqft": 1720,
      "yearBuilt": 2021,
      "propertyType": "Single Family",
      "daysOnMarket": 12,
      "overlayEligibility": {
        "usda": true,
        "usdaZoneName": "USDA Rural Eligible Area",
        "lmi": false,
        "firstHome": { "available": true, "priceLimit": 645712, "areaType": "non_targeted" },
        "lakeviewNational": true,
        "fhfaCountyLimit": { "available": true, "limit": 806495 }
      },
      "_source": {
        "host": "geosphere-map-oregon.vercel.app",
        "endpointPath": "/api/map-saved-listings",
        "authMode": "public",
        "pulledAt": "2026-10-01T04:15:00.000Z",
        "syncRunId": "sync_1738491000_a8f9c2e"
      },
      "_stale": false,
      "pulledAt": "2026-10-01T04:15:00.000Z"
    }
  ],
  "citation": {
    "sourceHost": "geosphere-map-oregon.vercel.app",
    "endpointPath": "/api/map-saved-listings",
    "pulledAt": "2026-10-01T04:15:00.000Z",
    "syncRunId": "sync_1738491000_a8f9c2e"
  },
  "disclaimer": "Vantage AI Disclaimer: Program eligibility indicators ('likely qualifies') are for informational and pre-qualification guidance only based on GIS geospatial boundaries and public guideline overlays. Final approval requires formal loan application, verified borrower underwriting, property appraisal, and institutional lender review. Equal Housing Opportunity.",
  "disclaimerServed": true,
  "count": 1,
  "cursor": null
}
```

---

### 2.2 `GET /api/manifest`
Retrieve this public integration specification and plugin capabilities document.

- **Authentication:** None (Public)
- **Response Format:** `application/json`

---

### 2.3 `POST /api/geosphere/sync`
Triggers synchronization from Luther GeoSphere Oregon GIS snapshots and persists standardized listings to Firestore `curated_listings`.

- **Authentication:** User session or staff credentials
- **Persistence Behavior:**
  - Standardized items are upserted idempotently by document ID (`id`).
  - Active listings receive `_stale: false`, `_staleSince: null`, `_source` metadata, and `pulledAt`.
  - Listings absent from the latest snapshot transition to `_stale: true` with `_staleSince: <timestamp>`.

---

## 3. Program Screening Definitions (`program` Parameter)

| Program Code | Verification Rule against `overlayEligibility` | Description |
|---|---|---|
| `usda` | `usda === true` or `usdaEligible === true` | USDA Rural Development 100% Financing Eligible Zone. |
| `lakeview` | `lakeviewNationalEligible === true` or `lakeviewNational === true` | Lakeview National DPA Program Eligible. |
| `fhfa` | `fhfaCountyLimit.available === true` | FHFA Conforming Conventional Loan Limit Tier. |
| `calhfa` | `calhfaMyHome.available === true` | CalHFA MyHome Assistance Program (Interstate/Tri-State). |
| `idaho` | `idahoMrbTaxExempt.available === true` | Idaho Housing & Finance MRB Tax-Exempt Program. |
| `firsthome`| `firstHome.available === true` or `firstHomeEligible === true` | OHCS FirstHome & Flex Lending Loan Program. |
| `lmi` | `lmi === true` or `lmiEligible === true` | Low-to-Moderate Income Census Tract Special Credit. |

---

## 4. Regulatory & Compliance Notice

- All automated representations of loan terms, down payment assistance, and census eligibility are subject to federal CFPB, GLBA, and Equal Housing Opportunity regulations.
- Underwriting and income calculations must be formally verified by NMLS-licensed Loan Officer Mike Ford (NMLS #123456 / Company NMLS #320759).
