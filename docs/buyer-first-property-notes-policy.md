# Buyer-First Property Card Notes Policy (Draft — compliance review required)

## Required behavior
1. A buyer must post the first substantive message on the specific property's card thread. Viewing, favoriting, intake submission, system-generated alerts, and messages in another property thread do not count.
2. Only the verified LO assigned to that buyer may respond in that same in-app thread after a buyer message has been durably saved. The LO, agents, admins, bots, or background jobs must not initiate a buyer-facing property card note.
3. The reply privilege is **in-app and thread-specific only**. It is not TCPA/SMS opt-in, email marketing authorization, push-notification consent, or permission to initiate another channel. No carrier SMS is sent by this feature.
4. Revoke access when LO assignment is removed or invalid; do not default to a site owner. Log allowed and denied replies with authenticated actor, lead, property, and timestamp.
5. The buyer's note must be authenticated or bound to a verified buyer session. Never trust a client-supplied `sender`, `leadId`, or `assignedLoId` as proof.

## Security gate (currently **not satisfied** in dashboard)
The current dashboard `property_conversations` Firestore rules allow anonymous create/update and the browser directly writes the `messages` array. A malicious browser can forge a buyer message or LO reply. The feature-branch UI/service guard is defense-in-depth only, **not enforcement**.

Before deploying this policy, migrate writes to a server-authorized endpoint (or authenticated Cloud Function) that validates the caller's buyer/staff identity, checks the verified LO assignment, and uses a Firestore transaction to check persisted buyer initiation and append a reply atomically. Deny direct client writes in Firestore rules. Add emulator integration tests for unauthenticated, forged sender, unassigned LO, admin, no buyer message, concurrent writes, and valid buyer-first LO reply. Do not deploy a rules change that silently breaks anonymous buyer note submission.

## Legal/compliance note
“Soft consent” is an internal product shorthand only, not a verified TCPA exemption. Have compliance counsel approve the in-app scope, content, disclosure, retention, and any notification mechanism.
