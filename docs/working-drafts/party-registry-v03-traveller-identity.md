# Party Registry Specification v0.3 — Traveller Identity Addendum

**Status:** Working Draft — In Active Development  
**Supersedes:** Party Registry Specification v0.2 (sections noted below)  
**Document:** ATP_WorkingDraft_TravellerIdentity_v0.1.md  
**Foundation:** Activity Travel Protocol Foundation  
**Licence:** Apache 2.0  
**Published:** April 2026

---

> **Scope of this addendum.** This document extends Party Registry Specification v0.2 with the TRAVELLER party type, consumer authentication flows, Traveller Identity Token schema, traveller AI Agent mandate constraints, and the consent records schema. It does not supersede or modify any other section of v0.2. All v0.2 definitions remain normative. Where this document and v0.2 conflict, this document takes precedence for TRAVELLER-related definitions only.

---

## Preamble: Staged Identity in Open Protocols

The Activity Travel Protocol Party Registry Specification v0.2 defines operator, supplier, travel agency, platform, and regulatory party types. Traveller demand roles (CONSUMER, CORPORATE_TRAVELER, GROUP_ORGANIZER, EVENT_PLANNER, CORPORATE_BUYER) are named in v0.2 but carry no schema, no authentication model, and no implementation guidance.

This is the correct architectural order. Operator identity is the trust anchor. Traveller identity federates through operator trust relationships — a traveller's ATP identity is established through their relationship with an operator, and their credentials are verifiable because the operator's Party Record is verifiable. Defining the trust anchors before the federated identities is standard practice across open identity protocols.

This addendum defines what was deferred from v0.2: the TRAVELLER party type in full.

---

## 1. TRAVELLER Party Type

### 1.1 Definition

`TRAVELLER` is a new value for the `party_type` field in the Party Registry. It represents an individual end-user of travel services — a person who is the subject of a Booking Object, who may authenticate with an ATP operator, and who may authorise an AI agent to act on their behalf.

The TRAVELLER party type is distinct from all existing party types in the following ways:

- **Registration model:** A TRAVELLER Party Record is created by a consumer, not by an organisation. It requires no company registration, no professional credential, and no operator verification beyond a verified email address or phone number.
- **Authentication:** TRAVELLER authentication uses consumer-grade flows (Section 3). Organisation-grade flows (mTLS certificate, API key) are not applicable.
- **Party Record structure:** The TRAVELLER Party Record is a proper subset of the full Party Record schema. Fields that are mandatory for organisations (legal_name, registration_number, jurisdiction_of_incorporation) are absent.
- **Mandate authority ceiling:** A TRAVELLER may issue AI Agent mandates, but the delegation ceiling for traveller-issued mandates is Level 2. See Section 4.3.

### 1.2 TRAVELLER Party Record Schema

```typescript
interface TravellerPartyRecord {
  // Core identity
  party_id: string;                    // Format: "atp:traveller:{uuid-v7}"
  party_type: "TRAVELLER";             // Fixed value
  status: "active" | "suspended" | "deleted";
  schema_version: "0.3";

  // Self-declared profile
  identity: {
    display_name: string;              // Self-declared. Assurance Level 1. Not verified.
    verified_contact: VerifiedContact; // At least one required. Authentication anchor.
    travel_documents?: TravelDocument[]; // Optional. Self-declared or verified.
    emergency_contact?: EmergencyContact; // Optional. Used in TU-4 through TU-6.
  };

  // Authentication
  authentication: {
    primary_method: ConsumerAuthMethod; // See Section 3
    registered_devices?: DeviceRecord[]; // Passkey-registered devices
    last_authenticated_at?: string;      // ISO 8601
  };

  // AI Agent authorisations issued by this traveller
  agent_authorisations?: TravellerAgentAuthorisation[];

  // Consent records
  consent_records: ConsentRecord[];      // See Section 5. Required, may be empty array.

  // Booking Object index (operator-scoped by default)
  booking_index: BookingReference[];     // References to Booking Objects where party_id appears

  // Metadata
  created_at: string;                    // ISO 8601
  updated_at: string;                    // ISO 8601
  created_by_operator: string;           // party_id of the operator that created this record
}
```

### 1.3 VerifiedContact

A TRAVELLER Party Record MUST contain at least one verified contact. The verified contact is the authentication anchor — the address or number through which the traveller proves control of their identity.

```typescript
interface VerifiedContact {
  type: "email" | "phone";
  value: string;                         // Email address or E.164 phone number
  verified: boolean;                     // MUST be true before record is considered active
  verified_at: string;                   // ISO 8601 timestamp of verification
  verification_method: "email_otp" | "sms_otp" | "whatsapp_otp" | "oidc_social";
  primary: boolean;                      // Exactly one contact must be primary: true
}
```

An operator MAY store multiple verified contacts on a TRAVELLER Party Record. Exactly one MUST be marked `primary: true`.

### 1.4 TravelDocument

Travel documents are optional and self-declared by default. Verified travel documents (Assurance Level 3) require operator-specific verification processes that are outside the scope of this specification.

```typescript
interface TravelDocument {
  document_type: "PASSPORT" | "NATIONAL_ID" | "RESIDENT_CARD" | "VISA";
  document_number: string;               // Self-declared
  nationality: string;                   // ISO 3166-1 alpha-2
  given_names: string;
  family_name: string;
  date_of_birth?: string;                // ISO 8601 date
  expiry_date?: string;                  // ISO 8601 date
  assurance_level: 1 | 2 | 3;           // 1: self-declared, 2: operator-reviewed, 3: verified
  added_at: string;                      // ISO 8601
}
```

### 1.5 EmergencyContact

The emergency contact is self-declared by the traveller and is used in the TRAVELER_UNREACHABLE escalation chain at steps TU-4 through TU-6.

```typescript
interface EmergencyContact {
  display_name: string;
  relationship: string;                  // Free text: "spouse", "parent", "friend", etc.
  phone: string;                         // E.164
  email?: string;
  preferred_language?: string;           // BCP 47 language tag
  added_at: string;                      // ISO 8601
}
```

**Note:** The placement of the emergency contact (TRAVELLER Party Record vs. per-booking Pre-Activity Collection) is an open question (OQ-MOB-4). This specification places it in the TRAVELLER Party Record as the primary location. Operators MAY additionally capture emergency contact data in Pre-Activity Collection; if both exist, the TRAVELLER Party Record value takes precedence for TU-4 through TU-6 escalation.

---

## 2. TRAVELLER Party Record Lifecycle

### 2.1 Creation

A TRAVELLER Party Record is created by an operator on behalf of a traveller, typically at booking confirmation or at first authentication via the operator's mobile app. The creating operator is recorded in `created_by_operator`.

A traveller MAY have Party Records with multiple operators. Each is independent. Cross-operator identity is handled by the Traveller Identity Token (Section 4), not by record sharing.

**Minimum viable record at creation:**

```json
{
  "party_id": "atp:traveller:01HWGZP8XK3V9EJBR4N7FM5D0Q",
  "party_type": "TRAVELLER",
  "status": "active",
  "schema_version": "0.3",
  "identity": {
    "display_name": "Alex",
    "verified_contact": {
      "type": "email",
      "value": "alex@example.com",
      "verified": true,
      "verified_at": "2026-05-01T09:00:00Z",
      "verification_method": "email_otp",
      "primary": true
    }
  },
  "authentication": {
    "primary_method": "email_otp"
  },
  "consent_records": [],
  "booking_index": [],
  "created_at": "2026-05-01T09:00:00Z",
  "updated_at": "2026-05-01T09:00:00Z",
  "created_by_operator": "myauberge-hotel"
}
```

### 2.2 Progressive Enrichment

A TRAVELLER Party Record starts minimal and is enriched over time:

| Stage | Trigger | Addition |
|-------|---------|----------|
| **Registration** | First booking or app sign-in | `display_name`, `verified_contact` |
| **First mandate** | Traveller authorises AI Agent | `agent_authorisations[0]` |
| **Pre-journey** | Pre-Activity Collection | `travel_documents` (if required by booking) |
| **Emergency setup** | Traveller configures emergency contact | `identity.emergency_contact` |
| **Cross-operator** | Traveller requests TIT | TIT issued (not stored in Party Record) |

### 2.3 Deletion and Data Retention

A TRAVELLER Party Record set to `status: "deleted"` MUST have all PII removed or pseudonymised within the operator's applicable jurisdiction retention period. The `party_id` and `booking_index` references SHOULD be retained for audit purposes. The `consent_records` array MUST be retained for the full statutory period.

---

## 3. Consumer Authentication Flows

Four authentication flows are defined. Operators MUST support at least one flow. Operators choosing to support traveller-issued AI Agent mandates (Section 4.3) MUST support at least one flow at Assurance Level 2 or higher.

### 3.1 Social OIDC (Assurance Level 2)

**Standard:** OpenID Connect 1.0 + PKCE  
**Applicable providers:** Google, Apple, LINE  
**Assurance Level:** 2 (email or phone verified by the OIDC provider)

The operator initiates an OIDC authorisation code flow with PKCE. On successful authentication, the operator receives an ID Token from the provider. The operator extracts the `email` or `phone_number` claim and creates or updates the TRAVELLER Party Record with that contact as `verified: true`, `verification_method: "oidc_social"`.

```
Guest taps "Sign in with LINE"
  → Operator initiates OIDC flow (scope: openid email phone)
  → LINE authenticates guest, issues ID Token
  → Operator verifies ID Token signature against LINE JWKS
  → Operator extracts email/phone from ID Token
  → Operator creates/updates TRAVELLER Party Record
  → Operator issues ATP Traveller Session Token (see Section 3.5)
```

### 3.2 Email OTP — Magic Link (Assurance Level 2)

**Standard:** RFC 8628 (device authorisation flow pattern) + ATP envelope  
**Assurance Level:** 2 (email verified by OTP)

The operator generates a signed JWT link and delivers it to the traveller's email address. The JWT contains the `booking_object_id` scope and expires in 15 minutes.

```
Guest submits email address
  → Operator generates signed JWT { booking_object_id, email, exp: now+15min }
  → Operator sends magic link to email
  → Guest clicks link (same or different device)
  → Operator verifies JWT signature and expiry
  → Operator verifies email matches TRAVELLER Party Record or creates new record
  → Operator issues ATP Traveller Session Token
```

**Phase 1 use:** The Email OTP magic link is the Phase 1 guest portal access mechanism. The JWT delivered via WhatsApp in the Azusa Journey thin viewer is this token (see CLAUDE.md TI-2). In Phase 2, the same link initiates an OIDC upgrade flow rather than granting direct access.

### 3.3 Phone OTP (Assurance Level 2)

**Standard:** SMS OTP + ATP envelope  
**Preferred channel (Japan market):** WhatsApp OTP  
**Assurance Level:** 2 (phone verified by OTP)

The operator generates a 6-digit OTP and delivers it to the traveller's phone number via SMS or WhatsApp. The OTP expires in 10 minutes.

```
Guest submits phone number
  → Operator generates 6-digit OTP, stores hash with { phone, exp: now+10min }
  → Operator sends OTP via SMS or WhatsApp
  → Guest submits OTP
  → Operator verifies OTP hash match and expiry
  → Operator creates/updates TRAVELLER Party Record
  → Operator issues ATP Traveller Session Token
```

### 3.4 Passkey — WebAuthn (Assurance Level 3)

**Standard:** WebAuthn Level 3 (W3C)  
**Assurance Level:** 3 (device-bound biometric credential)

Passkey authentication binds the traveller's identity to a specific device via a biometric credential (Face ID, Touch ID, Windows Hello). This is the highest assurance flow available to travellers.

**Required for:** Traveller-issued AI Agent mandates at Level 2 in future versions. Not required for Phase 2 (see Section 4.3).

```
Guest registers passkey
  → Operator initiates WebAuthn registration ceremony
  → Guest's device generates ECDSA keypair, stores private key in secure enclave
  → Public key stored in TRAVELLER Party Record → authentication.registered_devices
  
Guest authenticates with passkey
  → Operator initiates WebAuthn authentication ceremony with challenge
  → Guest's device signs challenge with stored private key (biometric required)
  → Operator verifies signature against stored public key
  → Operator issues ATP Traveller Session Token
```

### 3.5 ATP Traveller Session Token

All four authentication flows issue an ATP Traveller Session Token on success. This token scopes subsequent API requests to the authenticated traveller's Party Record and their permitted Booking Objects.

```typescript
interface TravellerSessionToken {
  // JWT header
  alg: "EdDSA";
  typ: "atp-traveller-session+jwt";
  kid: string;                           // Operator key ID

  // JWT payload
  jti: string;                           // UUID v4
  iss: string;                           // Operator party_id
  sub: string;                           // Traveller party_id
  iat: number;                           // Issued at (Unix timestamp)
  exp: number;                           // Expires at (iat + session duration, max 24h)
  auth_method: ConsumerAuthMethod;       // How the traveller authenticated
  auth_assurance: 1 | 2 | 3;            // Assurance level of the authentication
  scope: string[];                       // ["booking:read", "profile:read", "mandate:issue", ...]
}
```

---

## 4. Traveller Identity Token (TIT)

### 4.1 Purpose

The Traveller Identity Token enables cross-operator identity portability. A traveller authenticated with Operator A can present a TIT to Operator B; Operator B verifies the TIT against Operator A's Party Record and recognises the traveller's identity without receiving any personal data.

The TIT model is federation, not centralisation. No central ATP Foundation registry of traveller identities exists or will be created. Personal data does not leave the issuing operator's system as part of TIT issuance.

### 4.2 TIT Schema

```typescript
interface TravellerIdentityToken {
  // JWT header
  alg: "EdDSA";
  typ: "atp-traveller-identity+jwt";
  kid: string;                           // Issuing operator key ID

  // JWT payload
  jti: string;                           // UUID v4
  iss: string;                           // Issuing operator party_id (e.g. "myauberge-hotel")
  sub: string;                           // Traveller party_id (e.g. "atp:traveller:{uuid}")
  iat: number;                           // Issued at (Unix timestamp)
  exp: number;                           // Expires at (max 90 days from issuance)

  // Identity claims — privacy-preserving
  contact_hash: string;                  // SHA-256 of canonical verified_contact value
                                         // NOT the contact itself
  display_name_hash: string;             // SHA-256 of display_name. For duplicate detection only.
  assurance_level: 2 | 3;               // Assurance level of the verified_contact

  // Consent grants applicable to cross-operator use
  consent_cross_operator: boolean;       // Whether traveller has consented to cross-operator sharing
  consent_granted_at: number;            // Unix timestamp of consent grant

  // Issuer-signed attestation
  // Signature covers all above fields
}
```

**Privacy design:** The `contact_hash` is a one-way hash of the contact value. Operator B can verify that the TIT was issued for the same contact they hold on their own TRAVELLER Party Record (by hashing the contact they have and comparing), but cannot recover the original contact from the hash. This enables identity matching without data disclosure.

### 4.3 TIT Issuance

A TIT is issued by an operator on request from an authenticated traveller. The traveller must have `consent_records` entry for `consent_type: "cross_operator_sharing"` (see Section 5) before a TIT is issued.

```
Traveller requests TIT from their operator app
  → Operator verifies traveller session token
  → Operator verifies consent_records contains active cross_operator_sharing consent
  → Operator generates TIT signed with operator's Ed25519 key
  → TIT delivered to traveller (displayed in app, copied to clipboard)
  → Traveller presents TIT to second operator's app
```

### 4.4 TIT Verification

When Operator B receives a TIT:

1. **Signature verification:** Look up Operator A's Party Record in the shared Party Registry. Retrieve the public key with the matching `kid`. Verify the JWT signature.
2. **Expiry check:** Verify `exp` has not passed.
3. **Consent check:** Verify `consent_cross_operator: true`.
4. **Identity matching (optional):** If the traveller has already created a Party Record at Operator B, hash Operator B's `verified_contact` value and compare against `contact_hash`. A match confirms the same person.
5. **Record creation or linking:** If the traveller is new to Operator B, create a minimal TRAVELLER Party Record with `party_id` from the TIT `sub`. If the traveller already exists, link the records.

**Important:** The TIT does not transfer personal data. Operator B learns only: (a) the traveller's ATP party_id, (b) the assurance level at which they were verified, and (c) the contact hash for duplicate detection. Actual contact details are shared only through a separate, consent-backed data sharing mechanism that is outside the scope of v0.3.

### 4.5 TIT-Based Booking Object Discovery

The ATP REST API adds one new query parameter to the `GET /bookings` endpoint to support TIT-based discovery:

```
GET /bookings?tit={jwt_string}
Authorization: Bearer {operator_api_key}
```

This endpoint is called by a second operator to discover Booking Objects associated with a traveller who has presented their TIT. The operator verifies the TIT (Section 4.4) and returns Booking Objects from their own system where `traveller_party_id` matches the TIT `sub`.

**Scope limitation:** This endpoint only returns Booking Objects in the called operator's own system. Cross-operator enumeration across all ATP operators is not supported (that would require a central registry). The traveller must present their TIT to each operator separately to discover their bookings there.

---

## 5. Traveller AI Agent Mandate Constraints

### 5.1 Traveller-Issued Mandates

A TRAVELLER Party Record holder MAY issue an AI Agent mandate authorising an agent to act on their behalf. This is formally a traveller-issued mandate, distinct from an operator-issued mandate in the following ways:

| Property | Operator-issued mandate | Traveller-issued mandate |
|----------|------------------------|--------------------------|
| Issuer | Operator party (e.g. `myauberge-hotel`) | TRAVELLER party (e.g. `atp:traveller:{uuid}`) |
| Scope | All Booking Objects of that operator | Booking Objects where `traveller_party_id` matches |
| Delegation ceiling | Operator-defined (up to Level 4) | **Maximum Level 2 (CLOSED — OQ-MOB-3)** |
| Revocation | Operator action | Traveller action (self-service via app) |
| Authentication required | Operator credential | Traveller session token (min Assurance Level 2) |

### 5.2 TravellerAgentAuthorisation Schema

```typescript
interface TravellerAgentAuthorisation {
  authorisation_id: string;              // UUID v4
  mandate_type: "JOURNEY_COORDINATOR" | "BOOKING_ASSISTANT" | "NOTIFICATION_ONLY";
  issued_to: string;                     // Party ID of the AI Agent or service

  // Authority constraints — FIXED FOR v1.1
  authority_level: 1 | 2;               // Maximum Level 2. Level 3+ not permitted.
  delegation_ceiling: 1 | 2;            // Maximum Level 2. Enforced by Security Kernel.

  permitted_transitions: string[];       // Explicit list of Booking Object transitions
                                         // CONFIRM must NOT be in this list
                                         // (CONFIRMATION hard cap applies)

  scope: {
    all_bookings: boolean;               // true = all traveller's Booking Objects
    booking_ids?: string[];              // or specific Booking Object IDs
  };

  // Lifecycle
  issued_at: string;                     // ISO 8601
  expires_at?: string;                   // ISO 8601. If absent, valid until revoked.
  revoked_at?: string;                   // ISO 8601. Set when traveller revokes.
  status: "active" | "revoked" | "expired";
}
```

### 5.3 Narrowing Property — Traveller Context

The narrowing property (delegated mandate ⊆ delegating mandate) applies to traveller-issued mandates as follows:

- A traveller-issued mandate MUST NOT exceed the permissions the operator has granted to the traveller role on the relevant Booking Objects.
- A traveller at `authority_level: 2` cannot issue a sub-mandate at `authority_level: 3` (would violate narrowing property and traveller authority ceiling).
- The Security Kernel enforces both the narrowing property and the Level 2 ceiling at mandate issuance. Mandates that violate either constraint are rejected with `ATPSecurityError: NARROWING_VIOLATION` or `ATPSecurityError: TRAVELLER_AUTHORITY_CEILING`.

### 5.4 CONFIRMATION Hard Cap — Traveller Mandates

The CONFIRMATION hard cap applies without exception to traveller-issued mandates. A traveller-issued mandate MUST NOT include `CONFIRM` in `permitted_transitions`. The Security Kernel will reject any mandate issuance request that includes CONFIRM in a traveller-issued mandate.

This is not a v1.1 restriction pending future relaxation. It is a protocol invariant.

---

## 6. Consent Records

### 6.1 Purpose

The consent records schema provides a protocol-level mechanism for recording, tracking, and revoking consent grants from travellers. It is the mechanism that makes APPI, GDPR, and PDPA compliance assertable at scale — not by adding compliance overhead, but by making consent a first-class element of the TRAVELLER Party Record.

### 6.2 ConsentRecord Schema

```typescript
interface ConsentRecord {
  consent_id: string;                    // UUID v4
  consent_type: ConsentType;
  status: "active" | "revoked" | "expired";

  // Grant
  granted_at: string;                    // ISO 8601
  granted_via: ConsumerAuthMethod;       // How the traveller authenticated when granting
  granted_assurance_level: 1 | 2 | 3;   // Auth assurance at time of grant

  // Scope
  scope_operator?: string;               // party_id of operator, if operator-specific
  scope_all_operators?: boolean;         // true = consent applies to all ATP operators

  // Revocation
  revoked_at?: string;                   // ISO 8601. Set when traveller revokes.
  revocation_reason?: string;            // Optional traveller-provided reason.

  // Jurisdiction
  jurisdiction: string;                  // ISO 3166-1 alpha-2 (e.g. "JP", "EU", "SG")
  legal_basis: string;                   // e.g. "APPI_Art17", "GDPR_Art6_1a", "PDPA_S13"

  // Audit
  ip_hash?: string;                      // Hash of IP at time of grant (for audit, not tracking)
  user_agent_hash?: string;              // Hash of UA string at time of grant
}
```

### 6.3 ConsentType

```typescript
type ConsentType =
  | "data_processing"           // Processing personal data for booking purposes (required for booking)
  | "ai_agent_authorisation"    // Authorising an AI agent to act on the traveller's behalf
  | "cross_operator_sharing"    // Sharing identity with other ATP operators via TIT
  | "marketing_communications"  // Optional: receiving marketing messages
  | "analytics"                 // Optional: usage analytics
  | "emergency_data_sharing";   // Sharing emergency contact data in TU-4 through TU-6
```

**Required consents by feature:**

| Feature | Required consent types |
|---------|----------------------|
| Basic booking (Phase 1) | `data_processing` |
| AI Agent coordination | `data_processing` + `ai_agent_authorisation` |
| TIT issuance | `data_processing` + `cross_operator_sharing` |
| TU-4 emergency contact notification | `data_processing` + `emergency_data_sharing` |

### 6.4 Consent Revocation

A traveller MAY revoke any consent at any time. Revocation MUST:

1. Set `status: "revoked"` and `revoked_at` on the ConsentRecord.
2. If revoking `ai_agent_authorisation`: immediately set all dependent TravellerAgentAuthorisations to `status: "revoked"`.
3. If revoking `cross_operator_sharing`: invalidate all outstanding TITs (by noting revocation timestamp; outstanding TITs that were issued before revocation remain valid until their `exp`).
4. Record a `CONSENT_REVOKED` event in the event log.

Consent revocation does not retroactively invalidate completed Booking Object transitions. The audit trail for past actions is preserved.

---

## 7. Booking Object Integration

### 7.1 traveller_party_id Field

**CLOSED DECISION — TI-1:** The `traveller_party_id` field is added to the Booking Object schema as a nullable field. This field is populated when a TRAVELLER Party Record exists for the guest. It is `null` for Phase 1 bookings where no TRAVELLER Party Record has been created.

```typescript
interface BookingObject {
  booking_object_id: string;
  state: BookingObjectState;
  traveller_party_id: string | null;   // NEW in v0.3. Format: "atp:traveller:{uuid}" or null.
  regulatory_class: RegulatoryClass;
  // ... all other existing fields unchanged
}
```

**Migration:** Existing Booking Objects created before Party Registry v0.3 have `traveller_party_id: null`. When a TRAVELLER Party Record is subsequently created for a guest who has existing bookings, the operator MAY backfill `traveller_party_id` with a non-null value and a `TRAVELLER_LINKED` event in the event log.

### 7.2 Guest Portal JWT (Phase 1 Thin Viewer)

**CLOSED DECISION — TI-2:** The guest portal access link (the WhatsApp link that gives the guest access to the thin viewer web app) MUST be structured as a signed JWT from the start of Phase 1 implementation.

This is not a v0.3 change to the protocol specification — it is an implementation requirement for the Phase 1 reference implementation, documented here because it is the precursor to Phase 2 traveller authentication. The JWT structure is:

```typescript
interface GuestPortalToken {
  // JWT header
  alg: "EdDSA";
  typ: "atp-guest-portal+jwt";
  kid: string;                           // Operator key ID

  // JWT payload
  jti: string;                           // UUID v4
  iss: string;                           // Operator party_id (e.g. "myauberge-hotel")
  booking_object_id: string;             // Scoped to exactly ONE Booking Object
  iat: number;                           // Issued at (Unix timestamp)
  exp: number;                           // Expires at (iat + 15 days)
  scope: ["booking:read"];               // Read-only access
}
```

**Phase 2 upgrade path:** When Phase 2 is implemented, the guest clicks the same WhatsApp link. Instead of granting direct access, the JWT becomes the pre-auth token that initiates the OIDC or OTP flow. The traveller authenticates, a TRAVELLER Party Record is created or linked, and the session upgrades from the pre-auth JWT to a full ATP Traveller Session Token. No re-engineering of the WhatsApp delivery mechanism is required.

---

## 8. Open Questions — v0.3 Scope

The following questions are deferred from v0.3 and will be addressed in a subsequent working session before Phase 2 mobile build begins.

| ID | Question | Blocking |
|----|---------|---------|
| OQ-MOB-4 | Emergency contact placement: TRAVELLER Party Record vs. per-booking Pre-Activity Collection. This document adopts the Party Record placement as the normative answer but acknowledges APPI data minimisation concerns. | TU-4 through TU-6 completeness |
| OQ-MOB-5 | Minor travellers: no provision for parent/guardian proxy in current spec. Needed for group bookings with children (school trips, family packages). | GROUP_ORGANIZER role completeness |
| OQ-MOB-6 | Traveller-facing MCP tool exposure: should the ATP MCP Server expose traveller-scoped tools (read my Booking Object, confirm my agent's proposal) in addition to the operator-facing tools currently defined? | Mobile app AI interface |
| OQ-MOB-7 | Verified travel document (passport) in TRAVELLER Party Record: define in v0.3 (Section 1.4 provides the schema) or remain operator-managed? This document provides the schema but leaves the policy question open. | Visa-required destinations, parametric insurance |

---

## 9. Normative Summary

The following table summarises the normative additions of Party Registry v0.3.

| Addition | Section | Status |
|---------|---------|--------|
| TRAVELLER party_type | 1.1 | **Normative** |
| TRAVELLER Party Record schema | 1.2 | **Normative** |
| VerifiedContact schema | 1.3 | **Normative** |
| TravelDocument schema | 1.4 | Informative (policy open — OQ-MOB-7) |
| EmergencyContact schema | 1.5 | Normative (placement open — OQ-MOB-4) |
| TRAVELLER Party Record lifecycle | 2 | **Normative** |
| Social OIDC flow | 3.1 | **Normative** |
| Email OTP flow | 3.2 | **Normative** |
| Phone OTP flow | 3.3 | **Normative** |
| Passkey flow | 3.4 | Normative (not required for Phase 2) |
| ATP Traveller Session Token | 3.5 | **Normative** |
| Traveller Identity Token schema | 4.2 | **Normative** |
| TIT issuance process | 4.3 | **Normative** |
| TIT verification process | 4.4 | **Normative** |
| TIT-based Booking Object discovery | 4.5 | **Normative** |
| Traveller mandate authority ceiling (Level 2) | 5.1–5.3 | **Normative — CLOSED** |
| CONFIRMATION hard cap on traveller mandates | 5.4 | **Normative — invariant** |
| ConsentRecord schema | 6.2 | **Normative** |
| ConsentType definitions | 6.3 | **Normative** |
| Consent revocation process | 6.4 | **Normative** |
| traveller_party_id field in Booking Object | 7.1 | **Normative — CLOSED (TI-1)** |
| Guest Portal JWT structure | 7.2 | Normative reference implementation guidance |

---

## 10. References

- Party Registry Specification v0.2 — activitytravel.pro/working-drafts/layer1/
- ATP_DiscussionRecord_TravellerIdentity_WorkingSession_v1.docx — April 22, 2026
- OpenID Connect Core 1.0 — openid.net/specs/openid-connect-core-1_0.html
- WebAuthn Level 3 — w3.org/TR/webauthn-3/
- W3C Verifiable Credentials Data Model 2.0 — w3.org/TR/vc-data-model-2.0/
- OpenID Federation 1.0 — openid.net/specs/openid-federation-1_0.html
- RFC 7519 — JSON Web Token (JWT)
- RFC 8037 — CFRG Elliptic Curves for JOSE (Ed25519)

---

*Activity Travel Protocol Foundation · Apache 2.0 · activitytravel.pro*  
*Working Draft — community feedback invited at github.com/activity-travel-protocol/protocol-spec*
