# ATOP Trust Chain Declaration Specification

**Version:** 0.1 (Draft)  
**Status:** Layer 1 — Identity and Trust  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**Depends on:** Architecture Specification v0.1, Party Registry Specification v0.2,
Jurisdiction Compliance Registry Specification v0.2  
**References:** See references.md  
**License:** Apache 2.0  

---

## Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [Foundational Framework](#2-foundational-framework)
   - 2.1 [Trust Is Not Understanding](#21-trust-is-not-understanding)
   - 2.2 [ATOP Trust Chains Are OpenID Federation Trust Chains](#22-atop-trust-chains-are-openid-federation-trust-chains)
   - 2.3 [FAPI 2.0 as the API Security Profile](#23-fapi-20-as-the-api-security-profile)
   - 2.4 [How the Three Standards Compose](#24-how-the-three-standards-compose)
3. [ATOP Entity Statements](#3-atop-entity-statements)
4. [ATOP Trust Marks](#4-atop-trust-marks)
5. [Trust Chain Construction](#5-trust-chain-construction)
6. [The Trust Chain Record](#6-the-trust-chain-record)
7. [Credential Scope Validation](#7-credential-scope-validation)
8. [Duty of Care Declaration](#8-duty-of-care-declaration)
9. [State Transitions and Signature Requirements](#9-state-transitions-and-signature-requirements)
10. [Trust Chain Archival](#10-trust-chain-archival)
11. [Trust Chain Verification](#11-trust-chain-verification)
12. [Failure Modes and Recovery](#12-failure-modes-and-recovery)
13. [Normative References](#13-normative-references)
14. [Informative References](#14-informative-references)

---

## 1. Purpose of This Document

The Trust Chain Declaration is the mechanism by which ATOP establishes, records,
and verifies the trust relationships between all parties in a transaction — and
maintains that verification throughout the transaction lifecycle.

Every ATOP transaction begins with a question: can these parties trust each other
enough to commit to a binding agreement? The answer is not binary. Trust in ATOP
is layered, evidence-based, and scoped to specific claims. A party may be trusted
as an accommodation supplier but not as a package organizer. A party may be trusted
in Japan but not yet verified for EU operations. An AI agent may be trusted to
negotiate within defined bounds but not to sign binding agreements.

**ATOP Trust Chains are OpenID Federation Trust Chains** [OIDFED] with ATOP-specific
Entity Statement extensions and Trust Marks. There is no separate or proprietary
ATOP trust mechanism. A party with an OpenID Federation verifier and knowledge of
ATOP's published Trust Mark URIs can verify any ATOP Trust Chain without
ATOP-specific tooling.

This specification defines:

- How ATOP extends OpenID Federation with ATOP-specific Entity Statement claims and
  Trust Marks — and nothing more than that
- The Trust Chain Record schema — the signed, traveling object that documents the
  trust basis for every action in a transaction, expressed as an OpenID Federation
  artifact
- Credential scope validation: how ATOP verifies that a party's credentials cover
  the specific requirement being made of them
- The Duty of Care Declaration: which party holds primary responsibility at each
  phase of the journey
- Signature requirements at each state transition, conforming to FAPI 2.0 [FAPI2MSG]
- Trust Chain archival and its role as the evidentiary record of the transaction

---

## 2. Foundational Framework

### 2.1 Trust Is Not Understanding

This distinction is the foundation of this specification and must be stated clearly.

**Trust** answers: *is this party who they say they are, and are their credentials
genuine?*

**Understanding** answers: *given their credentials, can this party actually do what
this transaction requires of them?*

These are separate questions requiring separate mechanisms.

Consider three scenarios:

*Scenario A — Scope mismatch.* Party A (a tour coordinator) trusts Party B
(a transport supplier) based on B's verified TRANSPORT_OPERATOR_LICENSE. A sends an
INQUIRY requesting transport for 20 people. B responds with availability. At
CONFIRMATION, A discovers B holds a license for private hire vehicles only — not
for passenger-carrying vehicles above 8 seats. B cannot legally fulfill the booking.

Trust was correctly established. Understanding failed because the credential scope
was not validated against the specific requirement before CONFIRMATION.

*Scenario B — Capability gap.* Party C (a resort) trusts Party D (a ski instructor)
based on D's verified SKI_INSTRUCTOR_CERT. C asks whether D can teach children. D
says yes. This capability is not in the credential — it is in D's Capability
Declaration, which C did not consult.

Trust was correctly established. Understanding required consulting the Capability
Declaration, not just the credential.

*Scenario C — Configuration mismatch.* Party E (a travel agent) sends an INQUIRY
for a group tour assuming ground transport is included. Party F (a tour operator)
responds assuming ground transport is arranged separately. Neither party made the
assumption explicit in the INQUIRY data.

Trust and credentials are irrelevant here — the problem is insufficient structure
in the INQUIRY message itself.

**ATOP's response to these three failure types:**

| Failure Type | Where Addressed | Mechanism |
|---|---|---|
| Scope mismatch | This specification — Section 7 | Credential Scope Validation at Trust Chain construction |
| Capability gap | Catalogue Specification [forthcoming] | Capability Declaration consultation during CONFIGURATION |
| Configuration mismatch | Workflow Specification [forthcoming] | Structured INQUIRY message schema with required fields |

### 2.2 ATOP Trust Chains Are OpenID Federation Trust Chains

OpenID Federation 1.0 [OIDFED] is adopted as the sole normative trust mechanism
for ATOP. ATOP does not define a parallel or supplementary trust model. All trust
establishment, verification, and propagation in ATOP operates through OpenID
Federation mechanisms.

This decision is deliberate and has specific consequences:

**Any OpenID Federation verifier can verify an ATOP Trust Chain.** No ATOP-specific
client library is required for trust verification. A regulator, an auditor, or a
counterparty in a dispute can verify the cryptographic trust chain using standard
OpenID Federation tooling and ATOP's published specifications.

**Trust is composable across Protocol Operator boundaries.** A hotel registered
with ATOP Japan and a travel agent registered with ATOP Europe can transact because
OpenID Federation's trust chain resolution works across organizational and
jurisdictional boundaries. The Protocol Operators establish mutual recognition through
a Federation Entity Statement exchange; from that point, their respective parties can
verify each other's trust chains without further bilateral arrangements.

**ATOP extends OpenID Federation, it does not replace it.** ATOP adds:
- ATOP-specific claims in Entity Configurations (Section 3)
- ATOP-specific Trust Marks for roles and conformance (Section 4)
- The Trust Chain Record schema that organizes federation artifacts per transaction
  (Section 6)

Everything else — Entity Identifiers, Entity Configurations, Subordinate Statements,
Trust Chain resolution, Trust Mark issuance and verification — follows [OIDFED]
without modification.

**How OpenID Federation solves ATOP's trust problem:**

Each ATOP Party publishes a signed Entity Configuration at their well-known endpoint.
The Protocol Operator publishes Subordinate Statements vouching for each registered
party. A verifier constructs a trust chain by:

1. Fetching the party's Entity Configuration
2. Identifying the Trust Anchor — the Protocol Operator
3. Fetching the Subordinate Statement from the Trust Anchor to the party
4. Verifying each signature cryptographically
5. Confirming the chain is unbroken and all elements are within their validity period

For transactions where parties are registered with different Protocol Operators,
those Protocol Operators MUST have established mutual recognition through a Federation
Entity Statement exchange before their parties can transact. The ATOP governance
process for Protocol Operator mutual recognition is defined in the Governance
Specification [forthcoming].

**Transaction-scoped federation.** For an active transaction, the Protocol Operator
creates a transaction-scoped Subordinate Statement for each participating party. This
statement:
- Is scoped to this transaction only (contains the `transaction_id`)
- Attests to the credential scope validation result for this party in this transaction
- Contains the compliance check result for this party's role
- Carries ATOP Trust Marks relevant to this party's role in this transaction
- Expires when the transaction reaches COMPLETION or CANCELLATION

This replaces what would otherwise be a proprietary "session token" — the
transaction-scoped Subordinate Statement IS the authorization artifact for this
transaction, expressed entirely in OpenID Federation terms. Any party in the
transaction can verify any other party's authorization by resolving their
transaction-scoped chain.

### 2.3 FAPI 2.0 as the API Security Profile

All ATOP API calls MUST conform to the FAPI 2.0 Security Profile [FAPI2SEC]. FAPI 2.0
sits on top of OpenID Connect [OIDC] and OAuth 2.0, which in turn compose with
OpenID Federation. The three standards form a coherent stack:

```
OpenID Federation [OIDFED]
  → establishes who the parties are and that they are trustworthy
      │
OpenID Connect / OAuth 2.0 [OIDC]
  → issues access tokens scoped to specific API operations,
    bound to the federation-verified party identity
      │
FAPI 2.0 Security Profile [FAPI2SEC] + Message Signing [FAPI2MSG]
  → governs how API calls are made and how binding messages are signed
```

FAPI 2.0 was selected because it is proven in high-stakes ecosystems — Open Banking
in the UK, Brazil, and Australia — that share ATOP's requirements: binding financial
commitments, multi-party authorization, and non-repudiation. FAPI 2.0's requirements
for DPoP [RFC9449], PAR (Pushed Authorization Requests), and message signing eliminate
the most common implementation vulnerabilities in multi-party API systems.

### 2.4 How the Three Standards Compose

The following shows how [OIDFED], [FAPI2SEC], and [FAPI2MSG] compose for a
representative ATOP interaction — a CONFIRMATION signature:

```
1. Party A resolves Party B's Entity Configuration via [OIDFED]
   → Verifies B's federation trust chain to the Trust Anchor
   → Verifies B's ATOP Trust Marks for their role in this transaction
   → Verifies B's transaction-scoped Subordinate Statement

2. Party A's system authenticates to Party B's ATOP API endpoint via [FAPI2SEC]
   → Uses Pushed Authorization Request (PAR) with federation-issued access token
   → DPoP [RFC9449] binds the token to Party A's key pair

3. Party A signs the CONFIRMATION message via [FAPI2MSG]
   → ES256 [ES256] signature over the canonical message content
   → Signature includes content hash, timestamp, transaction ID, state
   → DPoP proof binds the signature to the same key as the API token

4. Party B verifies:
   → Federation trust chain for Party A (step 1 in reverse)
   → FAPI 2.0 token binding
   → Message signature and content hash
   → Records the verified signature in the Trust Chain Record
```

This full stack means that CONFIRMATION — the binding moment in every ATOP
transaction — is cryptographically verifiable by any party, at any time, using
published open standards.

---

## 3. ATOP Entity Statements

ATOP extends OpenID Federation Entity Statements with ATOP-specific claims registered
in the ATOP namespace. These extensions MUST be included in Entity Configurations
published by ATOP-registered parties.

### 3.1 ATOP Entity Configuration Extension

```json
{
  "atop": {
    "version": "0.1",
    "party_id": "atop:party:jp:myauberge-001",
    "roles": ["ACCOMMODATION_SUPPLIER"],
    "endpoints": {
      "capability_declaration": "https://atop.myauberge.jp/atop/capability",
      "inquiry": "https://atop.myauberge.jp/atop/inquiry",
      "transaction": "https://atop.myauberge.jp/atop/transaction"
    },
    "jurisdiction_compliance": {
      "JP": {
        "status": "compliant_with_sandbox",
        "sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
        "last_verified": "2026-03-01"
      }
    }
  }
}
```

### 3.2 ATOP Subordinate Statement Extension

Protocol Operators MUST include ATOP-specific claims in Subordinate Statements
they issue for registered parties:

```json
{
  "atop_verification": {
    "identity_assurance_level": 3,
    "identity_verified_at": "2026-03-01T12:00:00Z",
    "credentials_verified": [
      {
        "credential_type": "ACCOMMODATION_LICENSE",
        "assurance_level": 2,
        "verified_at": "2026-03-01T12:00:00Z",
        "expires": "2027-01-14"
      }
    ],
    "roles_active": ["ACCOMMODATION_SUPPLIER"],
    "jurisdiction_compliance": {
      "JP": "compliant_with_sandbox"
    }
  }
}
```

### 3.3 Transaction-Scoped Subordinate Statement

For an active transaction, the Protocol Operator issues a transaction-scoped
Subordinate Statement for each participating party. This is a standard OpenID
Federation Subordinate Statement with additional ATOP transaction claims:

```json
{
  "iss": "https://registry.atop-protocol.org",
  "sub": "https://atop.myauberge.jp/.well-known/openid-federation",
  "iat": 1741132800,
  "exp": 1741219200,
  "source_endpoint": "https://registry.atop-protocol.org/fetch",
  "atop_transaction": {
    "transaction_id": "tx:2026-03-04:ski-booking-nagano-001",
    "trust_chain_id": "tc:2026-03-04:ski-booking-nagano-001",
    "role_in_transaction": "ACCOMMODATION_SUPPLIER",
    "credential_scope_validation": "sandbox_active",
    "active_sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
    "required_disclosures": ["JP-DISC-001", "JP-DISC-003"],
    "duty_of_care_phases": ["PRE_ACTIVITY_COLLECTION", "READY"]
  },
  "metadata": {
    "federation_entity": {
      "organization_name": "MyAuberge Co., Ltd."
    }
  }
}
```

The `exp` of the transaction-scoped Subordinate Statement is set to the earlier of:
- The transaction's expected COMPLETION time plus 24 hours
- 30 days from issuance (maximum)

---

## 4. ATOP Trust Marks

Trust Marks in OpenID Federation [OIDFED] are signed JWT assertions that a party
has met specific criteria. ATOP defines canonical Trust Marks for each role and
conformance level.

**Trust Mark issuers:**
- ATOP Certification Body — issues ATOP-wide conformance Trust Marks
- Protocol Operators — issue role and jurisdiction Trust Marks for their registered parties

### 4.1 Canonical ATOP Trust Mark URIs

| Trust Mark | URI | Issued By | Criteria |
|---|---|---|---|
| ATOP Conformance | `https://trust.atop-protocol.org/marks/atop-conformance/v1` | ATOP Certification Body | Passed ATOP conformance test suite |
| Protocol Operator | `https://trust.atop-protocol.org/marks/protocol-operator/v1` | ATOP Certification Body | Full Protocol Operator certification |
| Accommodation Supplier | `https://trust.atop-protocol.org/marks/accommodation-supplier/v1` | Protocol Operator | Verified accommodation license + liability insurance |
| Activity Supplier | `https://trust.atop-protocol.org/marks/activity-supplier/v1` | Protocol Operator | Verified activity credentials per jurisdiction |
| Tour Operator | `https://trust.atop-protocol.org/marks/tour-operator/v1` | Protocol Operator | Verified travel agency license + insolvency protection |
| Travel Agent | `https://trust.atop-protocol.org/marks/travel-agent/v1` | Protocol Operator | Verified travel agency license |
| OTA | `https://trust.atop-protocol.org/marks/ota/v1` | Protocol Operator | Verified travel agency license + data protection compliance |
| AI Agent Level 2 | `https://trust.atop-protocol.org/marks/ai-agent-level-2/v1` | Protocol Operator | Valid Agent Authorization Declaration at Level 2 or below |

### 4.2 Trust Mark Schema

Each ATOP Trust Mark is a signed JWT conforming to the OpenID Federation Trust Mark
format [OIDFTM]:

```json
{
  "iss": "https://registry.atop-protocol.org",
  "sub": "https://atop.myauberge.jp/.well-known/openid-federation",
  "id": "https://trust.atop-protocol.org/marks/accommodation-supplier/v1",
  "iat": 1741132800,
  "exp": 1772668800,
  "atop_mark_claims": {
    "role": "ACCOMMODATION_SUPPLIER",
    "jurisdictions": ["JP"],
    "credential_refs": ["cred:myauberge-001:hotel-license-jp"],
    "assurance_level": 2,
    "sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"]
  }
}
```

### 4.3 Trust Mark Verification

Trust Mark verification follows [OIDFED] Section 8. Additionally for ATOP, a
verifier MUST confirm:

1. The `sub` matches the Entity Identifier of the presenting party
2. The `id` matches the claimed Trust Mark type
3. The `atop_mark_claims.jurisdictions` covers the jurisdiction of the transaction
4. The Trust Mark has not been revoked (check issuer's Trust Mark Status List)

Trust Marks that fail any verification check MUST be rejected. The transaction
MUST NOT proceed based on an unverified Trust Mark.

---

## 5. Trust Chain Construction

Trust Chain construction is the process by which the Protocol Operator, at INQUIRY,
assembles and verifies the OpenID Federation trust basis for all parties in the
proposed transaction, then issues transaction-scoped Subordinate Statements.

### 5.1 Construction Process

```
INQUIRY received
      │
      ▼
For each party in the transaction:
  ├── Resolve Entity Identifier → fetch Entity Configuration [OIDFED §6]
  ├── Fetch Subordinate Statement from party's Protocol Operator [OIDFED §7]
  ├── Build and verify federation trust chain to Trust Anchor [OIDFED §9]
  ├── Verify all ATOP Trust Marks presented by the party [OIDFED §8]
  ├── Run Credential Scope Validation (Section 7)
  ├── Issue transaction-scoped Subordinate Statement (Section 3.3)
  └── Record all results in Trust Chain Record (Section 6)
      │
      ▼
Run Compliance Check (Jurisdiction Compliance Registry Specification)
      │
      ▼
Validate Duty of Care coverage (Section 8)
      │
      ▼
If all checks pass → distribute transaction-scoped Subordinate Statements
                  → proceed to CONFIGURATION
If any check fails → return error with specific failure reason
                  → INQUIRY rejected, no transaction-scoped statements issued
```

### 5.2 Construction Timing

Trust Chain construction MUST complete before any response is sent to the INQUIRY
initiator. Maximum construction time: 30 seconds. If federation resolution does not
complete within 30 seconds, the Protocol Operator MUST return a
`trust_chain_construction_timeout` error and log the specific resolution step that
timed out.

### 5.3 Caching

Entity Configurations and Subordinate Statements MAY be cached within their `exp`
validity period per [OIDFED] §12. Trust Marks MUST be re-verified at each new
transaction even if the Entity Configuration is cached. Transaction-scoped
Subordinate Statements are never cached — they are issued fresh per transaction.

### 5.4 Cross-Protocol-Operator Transactions

Where parties are registered with different Protocol Operators, those Protocol
Operators MUST have established mutual recognition through a Federation Entity
Statement exchange [OIDFED §7.3] before their parties can transact.

The mutual recognition chain is: Party A → Protocol Operator A → Protocol Operator B
→ Party B. The trust chain is longer but resolves using standard [OIDFED] mechanisms.
No bilateral arrangement between parties is required — the Protocol Operator
relationship covers it.

---

## 6. The Trust Chain Record

The Trust Chain Record organizes the OpenID Federation artifacts, compliance results,
and state history for a specific transaction into a single structured object. It is
created at INQUIRY, updated at each state transition, and sealed at COMPLETION or
CANCELLATION.

The Trust Chain Record does not replace or duplicate federation artifacts — it
references them. The Party's Entity Configuration, Subordinate Statement, and Trust
Marks remain at their canonical federation endpoints. The Trust Chain Record holds
references plus the ATOP-specific transaction content.

### 6.1 Trust Chain Record Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/trust-chain/record/v0.1",
  "type": "object",
  "required": ["trust_chain_id", "transaction_id", "protocol_version",
               "created_at", "created_by", "parties",
               "jurisdiction_compliance", "duty_of_care",
               "state_history", "signatures"],
  "properties": {
    "trust_chain_id": {
      "type": "string",
      "description": "Format: tc:{date}:{slug}. Globally unique, immutable."
    },
    "transaction_id": { "type": "string" },
    "protocol_version": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "created_by": {
      "type": "string",
      "description": "party_id of the Protocol Operator that constructed this chain"
    },
    "parties": {
      "type": "array",
      "items": { "$ref": "#/$defs/TrustChainParty" }
    },
    "jurisdiction_compliance": { "$ref": "#/$defs/ComplianceRecord" },
    "duty_of_care": { "$ref": "#/$defs/DutyOfCareRecord" },
    "state_history": {
      "type": "array",
      "items": { "$ref": "#/$defs/StateTransition" }
    },
    "signatures": {
      "type": "array",
      "items": { "$ref": "#/$defs/ChainSignature" }
    },
    "archive_status": {
      "type": "string",
      "enum": ["active", "completed", "cancelled", "archived"]
    }
  },
  "$defs": {
    "TrustChainParty": {
      "type": "object",
      "required": ["party_id", "entity_identifier", "role_in_transaction",
                   "federation_verification", "credential_scope_validation",
                   "transaction_subordinate_statement_ref"],
      "properties": {
        "party_id": { "type": "string" },
        "entity_identifier": {
          "type": "string", "format": "uri",
          "description": "OpenID Federation Entity Identifier — resolves to Entity Configuration"
        },
        "role_in_transaction": { "type": "string" },
        "actor_id": { "type": "string" },
        "federation_verification": {
          "type": "object",
          "properties": {
            "trust_chain_resolved": { "type": "boolean" },
            "trust_chain_resolved_at": { "type": "string", "format": "date-time" },
            "trust_anchor": {
              "type": "string",
              "description": "Entity Identifier of the Trust Anchor used"
            },
            "trust_marks_verified": {
              "type": "array", "items": { "type": "string" },
              "description": "URIs of Trust Marks verified for this party"
            },
            "entity_configuration_ref": {
              "type": "string",
              "description": "URL and content hash of Entity Configuration used"
            },
            "subordinate_statement_ref": {
              "type": "string",
              "description": "Reference to the Protocol Operator's Subordinate Statement"
            }
          }
        },
        "transaction_subordinate_statement_ref": {
          "type": "string",
          "description": "Reference to the transaction-scoped Subordinate Statement issued for this party"
        },
        "credential_scope_validation": {
          "$ref": "#/$defs/CredentialScopeValidation"
        },
        "registry_snapshot_ref": {
          "type": "string",
          "description": "Reference to Party Registry snapshot at construction time"
        },
        "duty_of_care_phases": {
          "type": "array", "items": { "type": "string" }
        }
      }
    },
    "CredentialScopeValidation": {
      "type": "object",
      "properties": {
        "validation_status": {
          "type": "string",
          "enum": ["passed", "failed", "partial", "sandbox_active"]
        },
        "requirements_checked": { "type": "array", "items": { "type": "string" } },
        "requirements_passed": { "type": "array", "items": { "type": "string" } },
        "requirements_failed": { "type": "array", "items": { "type": "string" } },
        "sandbox_flags_active": { "type": "array", "items": { "type": "string" } },
        "notes": { "type": "string" }
      }
    },
    "ComplianceRecord": {
      "type": "object",
      "properties": {
        "compliance_status": {
          "type": "string",
          "enum": ["compliant", "non_compliant", "sandbox_active", "partial_check"]
        },
        "sale_jurisdiction": { "type": "string" },
        "consumption_jurisdiction": { "type": "string" },
        "applicable_requirements": { "type": "array", "items": { "type": "string" } },
        "unmet_requirements": { "type": "array", "items": { "type": "string" } },
        "active_sandbox_flags": { "type": "array", "items": { "type": "string" } },
        "required_disclosures": { "type": "array", "items": { "type": "string" } },
        "disclosures_delivered": { "type": "array", "items": { "type": "string" } },
        "jurisdiction_entry_versions": { "type": "object" }
      }
    },
    "DutyOfCareRecord": {
      "type": "object",
      "properties": {
        "coverage_validated": { "type": "boolean" },
        "phases": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "phase": { "type": "string" },
              "primary_party": { "type": "string" },
              "backup_party": { "type": "string" },
              "handover_from": { "type": "string" },
              "handover_to": { "type": "string" },
              "handover_trigger": { "type": "string" }
            }
          }
        },
        "gaps": {
          "type": "array", "items": { "type": "string" },
          "description": "Journey phases with no declared primary duty of care holder"
        }
      }
    },
    "StateTransition": {
      "type": "object",
      "required": ["transition_id", "from_state", "to_state", "timestamp",
                   "initiated_by", "signature"],
      "properties": {
        "transition_id": { "type": "string" },
        "from_state": { "type": "string" },
        "to_state": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" },
        "initiated_by": {
          "type": "object",
          "properties": {
            "party_id": { "type": "string" },
            "actor_id": { "type": "string" },
            "actor_type": { "type": "string" }
          }
        },
        "is_binding": { "type": "boolean" },
        "signature": { "$ref": "#/$defs/ChainSignature" },
        "content_hash": {
          "type": "string",
          "description": "SHA-256 [SHA256] hash of the agreed terms at this state transition"
        }
      }
    },
    "ChainSignature": {
      "type": "object",
      "required": ["signer_party_id", "signer_actor_id", "algorithm",
                   "signature_value", "signed_at", "dpop_proof"],
      "properties": {
        "signer_party_id": { "type": "string" },
        "signer_actor_id": { "type": "string" },
        "algorithm": {
          "type": "string", "enum": ["ES256", "ES384", "RS256"]
        },
        "signature_value": { "type": "string" },
        "signed_at": { "type": "string", "format": "date-time" },
        "dpop_proof": {
          "type": "string",
          "description": "DPoP proof per [RFC9449], binding signature to sender key pair"
        }
      }
    }
  }
}
```

### 6.2 Worked Example — MyAuberge Ski Booking

```json
{
  "trust_chain_id": "tc:2026-03-04:ski-booking-nagano-001",
  "transaction_id": "tx:2026-03-04:ski-booking-nagano-001",
  "protocol_version": "0.1",
  "created_at": "2026-03-04T09:30:00Z",
  "created_by": "atop:party:jp:myauberge-001",

  "parties": [
    {
      "party_id": "atop:party:jp:myauberge-001",
      "entity_identifier": "https://atop.myauberge.jp/.well-known/openid-federation",
      "role_in_transaction": "ACCOMMODATION_SUPPLIER",
      "actor_id": "actor:myauberge-001:tomsato",
      "federation_verification": {
        "trust_chain_resolved": true,
        "trust_chain_resolved_at": "2026-03-04T09:30:05Z",
        "trust_anchor": "https://registry.atop-protocol.org",
        "trust_marks_verified": [
          "https://trust.atop-protocol.org/marks/accommodation-supplier/v1",
          "https://trust.atop-protocol.org/marks/atop-conformance/v1"
        ],
        "entity_configuration_ref": "https://atop.myauberge.jp/.well-known/openid-federation#sha256:a3f5c...",
        "subordinate_statement_ref": "https://registry.atop-protocol.org/fetch?sub=https://atop.myauberge.jp/.well-known/openid-federation#sha256:b7d2e..."
      },
      "transaction_subordinate_statement_ref": "https://registry.atop-protocol.org/transaction/tc:2026-03-04:ski-booking-nagano-001/sub/myauberge-001",
      "credential_scope_validation": {
        "validation_status": "sandbox_active",
        "requirements_checked": ["JP-LIC-001", "JP-LIC-002", "JP-CP-003"],
        "requirements_passed": ["JP-CP-003"],
        "requirements_failed": ["JP-LIC-001", "JP-LIC-002"],
        "sandbox_flags_active": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
        "notes": "Split-seller configuration active. JP-DISC-003 disclosure required."
      },
      "registry_snapshot_ref": "registry:myauberge-001:snapshot:2026-03-04T09:30:00Z",
      "duty_of_care_phases": ["PRE_ACTIVITY_COLLECTION", "READY"]
    },
    {
      "party_id": "atop:party:jp:ski-resort-nagano-001",
      "entity_identifier": "https://atop.skiresort-nagano.jp/.well-known/openid-federation",
      "role_in_transaction": "ACTIVITY_SUPPLIER",
      "actor_id": "actor:ski-resort-nagano-001:bookingsystem",
      "federation_verification": {
        "trust_chain_resolved": true,
        "trust_chain_resolved_at": "2026-03-04T09:30:08Z",
        "trust_anchor": "https://registry.atop-protocol.org",
        "trust_marks_verified": [
          "https://trust.atop-protocol.org/marks/activity-supplier/v1"
        ],
        "entity_configuration_ref": "https://atop.skiresort-nagano.jp/.well-known/openid-federation#sha256:c9a1b...",
        "subordinate_statement_ref": "https://registry.atop-protocol.org/fetch?sub=https://atop.skiresort-nagano.jp/.well-known/openid-federation#sha256:d4f8a..."
      },
      "transaction_subordinate_statement_ref": "https://registry.atop-protocol.org/transaction/tc:2026-03-04:ski-booking-nagano-001/sub/ski-resort-nagano-001",
      "credential_scope_validation": {
        "validation_status": "passed",
        "requirements_checked": ["JP-DOM-SLOPE-001"],
        "requirements_passed": ["JP-DOM-SLOPE-001"],
        "requirements_failed": [],
        "sandbox_flags_active": []
      },
      "registry_snapshot_ref": "registry:ski-resort-nagano-001:snapshot:2026-03-04T09:30:00Z",
      "duty_of_care_phases": ["FULFILLMENT", "COMPLETION"]
    }
  ],

  "jurisdiction_compliance": {
    "compliance_status": "sandbox_active",
    "sale_jurisdiction": "JP",
    "consumption_jurisdiction": "JP",
    "applicable_requirements": ["JP-LIC-001","JP-LIC-002","JP-CP-003","JP-PKG-002"],
    "unmet_requirements": ["JP-LIC-001","JP-LIC-002"],
    "active_sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
    "required_disclosures": ["JP-DISC-001","JP-DISC-003"],
    "disclosures_delivered": [],
    "jurisdiction_entry_versions": { "JP": "0.1" }
  },

  "duty_of_care": {
    "coverage_validated": true,
    "phases": [
      {
        "phase": "PRE_ACTIVITY_COLLECTION",
        "primary_party": "atop:party:jp:myauberge-001",
        "handover_to": "atop:party:jp:ski-resort-nagano-001",
        "handover_trigger": "Customer departs accommodation for ski resort"
      },
      {
        "phase": "READY",
        "primary_party": "atop:party:jp:myauberge-001"
      },
      {
        "phase": "FULFILLMENT",
        "primary_party": "atop:party:jp:ski-resort-nagano-001",
        "handover_from": "atop:party:jp:myauberge-001"
      },
      {
        "phase": "COMPLETION",
        "primary_party": "atop:party:jp:ski-resort-nagano-001"
      }
    ],
    "gaps": []
  },

  "state_history": [],
  "signatures": [],
  "archive_status": "active"
}
```

---

## 7. Credential Scope Validation

Credential Scope Validation addresses the scope mismatch failure type from Section
2.1 — the problem where a party holds a genuine, verified credential that does not
cover the specific service being requested.

### 7.1 What the Validator Checks

For each party, five checks are run in sequence:

**Check 1 — Role coverage.** Does the party hold at least one verified credential
covering their declared role? An ACCOMMODATION_SUPPLIER must hold an
ACCOMMODATION_LICENSE. An ACTIVITY_SUPPLIER must hold LIABILITY_INSURANCE. These
baseline requirements come from the role definitions in the Party Registry
Specification.

**Check 2 — Jurisdiction coverage.** Are the credentials valid in the jurisdiction
where the service is delivered? License scope is declared in the `credential_references`
field of the Party Record, including which prefectures, regions, or jurisdictions
the credential covers.

**Check 3 — Scope specificity.** Does the credential scope cover the specific
service being requested? This is where the driver/bus problem is caught. If the
INQUIRY specifies 20 passengers and the supplier's license notes declare
"private hire vehicles only, maximum 7 passengers", the validator flags a scope
mismatch. Scope restrictions are declared in the `license_class` and `notes`
fields of credential references in the Party Registry.

**Check 4 — Expiry.** Are all credentials current? Credentials expiring within 30
days are flagged `credential_expiring` but do not block the transaction. Expired
credentials MUST block the transaction unless renewal is pending and documented.

**Check 5 — Associated domain requirements.** Are there activity types triggering
associated regulatory domain requirements? Skiing triggers JP-DOM-SLOPE-001. Meals
trigger JP-DOM-FOOD-001. The validator checks that the relevant party holds the
required domain credentials.

### 7.2 Validation Result States

| Result | Meaning | Transaction Impact |
|---|---|---|
| `passed` | All requirements met | Proceed |
| `sandbox_active` | Unmet requirements have a documented compliant path | Proceed with required disclosures |
| `partial` | Some requirements could not be verified | Proceed with warning |
| `failed` | Unmet requirements with no compliant path | MUST NOT proceed to CONFIRMATION |

### 7.3 Re-Validation at CONFIRMATION

Credential Scope Validation runs a second time immediately before CONFIRMATION,
catching credentials that expired during negotiation, Trust Marks that lapsed, or
compliance status that changed. A worse result at CONFIRMATION than at INQUIRY MUST
block CONFIRMATION until resolved.

---

## 8. Duty of Care Declaration

### 8.1 Purpose

The Duty of Care Declaration makes explicit which party holds primary responsibility
for the customer at every phase of their journey — before the transaction is
confirmed. Without it, the ambiguity that left travelers stranded in disruption
events has no mechanism for resolution: no single party has a clear, enforceable
obligation to act.

The Declaration does not create liability where none exists in law. It declares,
before CONFIRMATION, which party has accepted primary responsibility for each phase.

### 8.2 Journey Phases

| Phase | Description | Typical Holder |
|---|---|---|
| `PRE_DEPARTURE` | Before customer leaves origin | Tour Operator or Travel Agent |
| `TRANSIT_OUTBOUND` | Travel to destination | Transport Supplier or Tour Operator |
| `ARRIVAL` | Customer arrives, checks in | Accommodation Supplier |
| `PRE_ACTIVITY_COLLECTION` | Information gathering before activities | Accommodation Supplier |
| `READY` | At destination, activities not yet commenced | Accommodation Supplier |
| `FULFILLMENT` | Active participation in booked activities | Activity Supplier |
| `TRANSIT_RETURN` | Travel from destination to origin | Transport Supplier or Tour Operator |
| `COMPLETION` | Transaction concluded | Primary organizing party |
| `INCIDENT` | Any phase — disruption or emergency declared | Declaring party, escalating to Tour Operator |

### 8.3 Coverage Validation Rules

1. Every journey phase MUST have exactly one `primary_party`
2. No phase may have zero primary parties — an unresolved gap MUST block CONFIGURATION
3. Handover triggers MUST be defined wherever custody changes between parties
4. The `INCIDENT` phase MUST have an escalation path to a party with human Actors

### 8.4 Duty of Care and AI Agents

Duty of care for phases managed by an AI Agent is held by the Party that issued the
Agent Authorization — not the agent itself. An AI Agent MUST notify a human Actor
within 15 minutes of detecting an INCIDENT condition in any phase it is managing.
This cannot be overridden by Agent Authorization configuration.

---

## 9. State Transitions and Signature Requirements

Every state transition creates an entry in `state_history`. Binding transitions
require a full FAPI 2.0 Message Signing [FAPI2MSG] signature. Non-binding transitions
require FAPI 2.0 client authentication but not a binding signature.

### 9.1 Signature Requirement by State

| Transition | Binding? | Required Signer | Actor Type Permitted |
|---|---|---|---|
| → INQUIRY | No | Initiating party | human, system, ai_agent |
| → CONFIGURATION | No | Protocol Operator | system |
| → PROPOSAL | No | Offering party | human, system, ai_agent (Level 2+) |
| → NEGOTIATION | No | Any party | human, system, ai_agent (Level 2+) |
| → CONFIRMATION | **Yes — all parties** | All parties | **human only** |
| → PRE_ACTIVITY_COLLECTION | No | Protocol Operator | system |
| → READY | No | Accommodation Supplier | human or system |
| → FULFILLMENT | No | Activity Supplier | human or system |
| → AMENDMENT (price/terms) | **Yes** | Amending party | **human only** |
| → CANCELLATION (with penalty) | **Yes** | Cancelling party | **human only** |
| → COMPLETION | No | Protocol Operator | system |
| → INCIDENT | No | Declaring party | human or system |

### 9.2 Binding Signature Format

A binding signature MUST conform to [FAPI2MSG] and MUST include:

```json
{
  "signed_payload": {
    "trust_chain_id": "tc:2026-03-04:ski-booking-nagano-001",
    "transition": "CONFIRMATION",
    "timestamp": "2026-03-05T14:22:00Z",
    "content_hash": "sha256:a3f5c...",
    "signer_party_id": "atop:party:jp:myauberge-001",
    "signer_actor_id": "actor:myauberge-001:tomsato",
    "transaction_subordinate_statement_ref": "https://registry.atop-protocol.org/transaction/tc:2026-03-04:ski-booking-nagano-001/sub/myauberge-001",
    "dpop_proof": "{DPoP JWT per RFC9449}"
  },
  "signature": "{ES256 signature}",
  "algorithm": "ES256"
}
```

The `content_hash` is the SHA-256 [SHA256] hash of the canonical JSON serialization
of all agreed terms at the point of signing — the non-repudiation anchor proving
exactly what was agreed to when the signature was produced.

Note that `transaction_subordinate_statement_ref` replaces the proprietary
"Transaction Token" — the party's authorization to act in this transaction is their
transaction-scoped Subordinate Statement, which is an OpenID Federation artifact.

---

## 10. Trust Chain Archival

### 10.1 Archival Trigger

At COMPLETION or CANCELLATION:
1. `archive_status` updated to `completed` or `cancelled`
2. Final archival signature applied by Protocol Operator
3. Complete record written to immutable archival storage
4. `state_history` sealed — no further entries permitted

### 10.2 Retention Periods

| Jurisdiction | Minimum Retention | Basis |
|---|---|---|
| JP | 7 years | [JP-APPI]; commercial record keeping |
| EU | 10 years | [EU-PTD] Article 28; [EU-GDPR] Article 17 |
| GB | 6 years | Limitation Act 1980; [GB-PTL] |
| US | 7 years | IRS requirements; state SOT requirements |
| Global minimum | 7 years | Conservative cross-jurisdiction baseline |

Personal data within archived Trust Chains MUST be handled per applicable data
protection law. Where GDPR right to erasure applies, personal data fields MAY be
pseudonymized while the structural record — state transitions, signatures, compliance
records — is retained.

### 10.3 What the Archive Proves

The archived Trust Chain Record answers the following questions for any regulatory
or dispute context:

- Who were the parties, verified as who they said they were at booking time?
- What credentials did each party hold, and were they verified?
- Was the transaction compliant in the applicable jurisdictions?
- What disclosures were made to the customer, and when?
- Who signed what, when, and using what key?
- Who held duty of care at each phase?
- What AI agents were involved, under what authorization, and what did they do?

---

## 11. Trust Chain Verification

Any party to a transaction, or any authorized third party such as a regulator or
dispute resolution body, may verify a Trust Chain Record. No ATOP-specific tooling
is required — standard OpenID Federation verifiers plus knowledge of ATOP's
published Trust Mark URIs are sufficient.

### 11.1 Verification Steps

1. Retrieve the Trust Chain Record using the `trust_chain_id`
2. Verify the Protocol Operator's archival signature using their Entity Configuration
3. Verify each state transition signature using the signing party's key, resolved
   via their Entity Identifier per [OIDFED]
4. Recompute content hashes for binding transitions and confirm they match
5. Verify Trust Marks were valid at the time of verification (check `iat`/`exp`)
6. Confirm transaction-scoped Subordinate Statements were issued by the correct
   Protocol Operator and were valid at the time of the transactions they authorized

### 11.2 Verification API

```
GET /trust-chains/{trust_chain_id}
GET /trust-chains/{trust_chain_id}/verify
GET /trust-chains/{trust_chain_id}/parties/{party_id}/credential-scope
```

---

## 12. Failure Modes and Recovery

**Federation resolution failure:** Retry once after 5 seconds. If still failing,
return `federation_resolution_failure` — transaction cannot proceed until the
party's federation endpoint is restored.

**Trust Mark expiry during transaction:** Protocol Operator notifies all parties
immediately. Trust Mark holder has 24 hours to renew. If not renewed within 72
hours, transaction is cancelled with no penalty to non-defaulting party.

**Credential scope mismatch at CONFIRMATION:** CONFIRMATION blocked. All parties
notified with the specific scope failure. Parties may renegotiate via NEGOTIATION
state. If gap cannot be resolved, transaction cancelled with no penalty to
non-defaulting party.

**Duty of Care gap detected:** Transaction cannot proceed to CONFIGURATION.
INQUIRY initiator notified with uncovered phases. Additional parties may be added;
Trust Chain is reconstructed.

---

## 13. Normative References

See `references.md` for full citation details including author, version, date,
and URL for each reference.

| Tag | Title | Relevance to This Specification |
|---|---|---|
| [OIDFED] | OpenID Federation 1.0 | The trust mechanism — ATOP Trust Chains ARE OpenID Federation Trust Chains |
| [FAPI2SEC] | FAPI 2.0 Security Profile | API security for all ATOP API calls |
| [FAPI2MSG] | FAPI 2.0 Message Signing | Binding signature format |
| [RFC2119] | Key Words for RFCs | Normative language |
| [RFC8174] | Ambiguity of Uppercase | Normative language clarification |
| [RFC9449] | OAuth 2.0 DPoP | Key binding for signatures and API tokens |
| [OIDC] | OpenID Connect Core 1.0 | Human Actor authentication |
| [VCDATA2] | W3C VC Data Model 2.0 | Assurance Level 4 credentials |
| [DID] | W3C DIDs v1.0 | DID resolution for cryptographic verification |
| [JSONSCHEMA] | JSON Schema 2020-12 | All schemas in this specification |
| [ISO8601] | ISO 8601 | Date and datetime fields |
| [SHA256] | FIPS 180-4 SHA-256 | Content hashing for non-repudiation |
| [ES256] | RFC 7518 JWA ES256 | Default signature algorithm |

---

## 14. Informative References

| Tag | Title | Relevance |
|---|---|---|
| [OIDFTM] | OpenID Federation Trust Marks | Background on Trust Mark mechanism used in Section 4 |
| [EIDAS2] | eIDAS 2.0 | EU digital identity; Assurance Level alignment |
| [OIDF-EUDI] | OpenID Federation EUDI Interoperability | Validates OpenID Federation maturity |
| [FAPI-ECOSYSTEMS] | FAPI 2.0 Real-World Ecosystems | Validates FAPI 2.0 suitability for ATOP |
| [EU-GDPR] | GDPR | Trust Chain archival data handling |
| [EU-AIACT] | EU AI Act | AI agent regulatory context for Section 8.4 |
| [JP-APPI] | Japan APPI | Archival retention requirements |

---

*Document status: Draft v0.1 — March 2026*  
*Next: Party Policy Declarations Specification v0.1*  
*Maintainer: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
