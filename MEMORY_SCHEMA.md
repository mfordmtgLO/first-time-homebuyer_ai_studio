# Shared Memory Schema (Vantage AI 2nd Brain & Muse)

This specification defines the unified schema stored in the Firestore `/memories` collection, shared across the Scripted Chatbot Intake, Ingested Knowledge Docs/Media, and Muse Conversation Turns.

---

## Document Structure

```typescript
export interface MemoryDocument {
  id: string;                      // Document ID (Firestore generated or custom UUID)
  title: string;                   // Summary or step title (PII-scrubbed)
  content: string;                 // Detailed answer, transcription, or event payload (PII-scrubbed)
  kind: MemoryKind;                // Categorical kind (see enum below)
  industryId: string;              // Tenant boundary (e.g. "mortgage_real_estate")
  leadId?: string;                 // Buyer sandbox key (buyer reads restricted to own leadId)
  listingId?: string;              // Associated property/MLS ID if related to a listing
  sessionId?: string;              // Session identifier for conversational continuity
  createdAt: string;               // ISO 8601 timestamp
  source: string;                  // Originating subsystem (e.g. "intake_chatbot", "muse_chat", "doc_upload")
  piiScrubbed: true;               // Cryptographic/regex confirmation that zero SSN/CC was stored
  metadata?: Record<string, any>;  // Optional structured parameters (e.g. DTI, budget brackets)
}
```

---

## Memory Kinds (`MemoryKind`)

| Kind | Description | Example Content |
| :--- | :--- | :--- |
| `intake_answer` | Step responses from the 7-step buyer intake funnel | `Step 3 (Budget): Target monthly payment $2,400 with $25k savings.` |
| `conversation_turn` | Chat exchange between borrower and AI Assistant / Muse | `User asked about USDA eligibility in Junction City; cited tract 0015.00.` |
| `ingested_doc` | Extracted & sanitized guideline documents or PDF matrices | `OHCS Flex Lending 2026 purchase price cap for Lane County is $566,354.` |
| `ingested_media` | Transcriptions of branch webinars, audio notes, or video | `LO Mike Ford underwriting walkthrough of Lakeview National program.` |
| `engagement_event` | User interaction indicating preference or intent | Favorited MLS #273683992, listing dwell time >60s, tour requested. |
| `conversion_event` | High-value milestone or pipeline conversion | Booked LO discovery call, pre-approval application started, drop-off. |

---

## Security & Tenant Isolation Rules

1. **Tenant Isolation:** All `/memories` queries enforce `.where("industryId", "==", industryId)`. Cross-tenant retrieval is strictly prohibited.
2. **Buyer Sandboxing:** In the public consumer funnel, buyers may only access memories stamped with their authenticated `leadId`.
3. **Pre-Ingestion PII Scrubbing:** All `title` and `content` fields must pass `redactPII()` before persistence, redacting SSNs, ITINs, and payment card numbers to `[REDACTED_SSN_PII]` or `[REDACTED_CC_PII]`.
4. **Income Brackets Only:** Chatbots and Muse never store raw financial documents or tax returns in `/memories`; income is recorded in standardized brackets.
