# Lead-Curation Workflow — Acceptance Test Results & Compliance Audit

**Project**: First-Time Homebuyer AI Studio Portal  
**Branch**: `review/lead-curation`  
**Specification**: Prompt A (Mike's Curation Console — "Marry the Listings to the Lead")  
**Compliance Standard**: GLBA / Zero-Trust / RBAC PII Guardrails  

---

### Acceptance Criteria & Verification Matrix (A1 – A7)

| Test ID | Test Scenario | Status | Compliance Verification |
| :--- | :--- | :--- | :--- |
| **A1** | **Structured Curation Request Intake**<br>Chatbot "yes" + city writes `leadCurationRequest` with structured `{ status: "requested", city, priceRange, source: "chatbot", requestedAt }`. | **PASS** | PII redaction and `sanitizeSSN` ran prior to write. No unredacted SSN/account data persisted. Verified in `src/components/LeadIntakeChatbot.tsx`. |
| **A2** | **Curation Queue Display & Auditor PII Masking**<br>Queue displays requesting leads with city, price range, source, timeline, and request age, sorted requested-first. | **PASS** | Role-gated: `compliance_auditor` role receives masked email (`f***@***.com`) and phone (`(***) ***-1234`). Verified in `server.ts` (`/api/leads/curate/queue`) and `src/components/CurationQueue.tsx`. |
| **A3** | **Listing Picker & "Marry to Lead" Action**<br>Loan Officer selects canonical candidate listings from `curated_listings` and clicks "Marry". Server writes `lead_curations/{leadId}` with status `"ready"`, and flips lead request status to `"pushed"`. | **PASS** | Canonical listings referenced verbatim. Server-side validation ensures all `listingIds` exist in candidate pool. Immutable audit stamped in `branch_audit_logs`. Verified in `server.ts` (`/api/leads/curate/marry`). |
| **A4** | **Re-Marry Replacement (Zero Duplicates)**<br>Marrying new listings replaces prior document contents cleanly without orphaned IDs or duplication. | **PASS** | Single document overwrite on `lead_curations/{leadId}`. Audit ledger logs `LEAD_LISTINGS_SUPERSEDED` event. Verified in `server.ts`. |
| **A5** | **Un-Marry Action**<br>Un-marrying deletes `lead_curations/{leadId}` and returns `leadCurationRequest.status` to `"requested"`. | **PASS** | Document removed from Firestore. Lead request status reset to `"requested"`. Audit ledger logs `LEAD_LISTINGS_UNMARRIED`. Verified in `server.ts` (`/api/leads/curate/unmarry`). |
| **A6** | **Server-Side Invalid Listing ID Rejection**<br>Attempting to marry with invented/fabricated listing ID is rejected with HTTP 400 Bad Request. | **PASS** | `validPoolIds` validation against `curated_listings` candidate pool. Reject returned without echoing raw attacker input to logs/response. |
| **A7** | **Buyer Push Notification Hook (FCM)**<br>Marrying listings triggers buyer notification path: "Mike Ford curated N homes for you". | **PASS** | Server-side push intent logged with buyer email and curated count: `[Buyer Push Notification Hook] FCM Push notification dispatched for buyer`. No cross-buyer PII leakage. |

---

### Summary of Artifacts Created & Modified

1. **`src/types.ts`**:
   - Added `LeadCurationRequest` interface (`{ status, city, priceRange, source, requestedAt }`).
   - Added `LeadCurationDoc` interface (`{ leadId, email, name, listings, curatedBy, status, pushedAt, buyerNote }`).
   - Added `leadCurationRequest?: LeadCurationRequest` to `CapturedLead`.
2. **`src/components/LeadIntakeChatbot.tsx`**:
   - Added structured `leadCurationRequest` generation during lead capture.
3. **`server.ts`**:
   - `GET /api/leads/curate/queue`: Returns curation queue with backfill support and auditor PII masking.
   - `GET /api/leads/curate/listings`: Serves candidate pool from canonical `curated_listings` collection.
   - `POST /api/leads/curate/marry`: Validates listing IDs against pool, writes `lead_curations/{leadId}`, updates lead status to `pushed`, logs FCM push, and stamps `branch_audit_logs`.
   - `POST /api/leads/curate/unmarry`: Deletes curation doc, resets lead status to `requested`, and stamps `branch_audit_logs`.
4. **`src/components/CurationQueue.tsx`**:
   - Full Lead Curation Console UI with queue metrics, search/status filters, auditor notices, interactive Listing Picker modal with verbatim program filters, personalized buyer note input, and marry/un-marry triggers.
5. **`src/components/LoanOfficerPortal.tsx` & `LoanOfficerSidebar.tsx`**:
   - Added `curation` to `TabId`, added navigation items and tab render block for `CurationQueue`.
6. **`firestore.rules`**:
   - Added security rules for `/lead_curations/{leadId}` enforcing buyer isolation and branch manager/LO write authorization.
