# ATOP Party Registry Specification

**Version:** 0.2 (Draft)  
**Status:** Layer 1 — Identity and Trust  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**Depends on:** Architecture Specification v0.1  
**License:** Apache 2.0  

---

## Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [Foundational Framework](#2-foundational-framework)
3. [Party — The Top-Level Entity](#3-party--the-top-level-entity)
4. [Party Identity](#4-party-identity)
5. [Party Roles](#5-party-roles)
6. [Party Actors](#6-party-actors)
7. [The Agentic Authorization Framework](#7-the-agentic-authorization-framework)
8. [Credential References](#8-credential-references)
9. [Jurisdiction Compliance](#9-jurisdiction-compliance)
10. [Protocol Support](#10-protocol-support)
11. [The Complete Party Record](#11-the-complete-party-record)
12. [Registration Process](#12-registration-process)
13. [The Trust Chain](#13-the-trust-chain)
14. [Registry Operations](#14-registry-operations)
15. [Identifier Specification](#15-identifier-specification)
16. [Versioning and Governance](#16-versioning-and-governance)

---

## 1. Purpose of This Document

The Party Registry is the foundational component of ATOP Layer 1 — Identity and Trust.
Every entity that participates in an ATOP transaction must be registered. The Registry
is the source of truth for who parties are, what roles they hold, what credentials they
possess, and who is authorized to act on their behalf.

This specification defines:

- A foundational framework for how entities, roles, credentials, and authorizations are
  described — the conceptual grammar before the content
- The complete data structure of a Party record and each of its components
- The complete, versioned Role Taxonomy
- How Actors (human and AI) are declared and authorized
- The credential reference schema and assurance levels
- The registration process
- How Trust Chains are constructed from Registry data at transaction time
- The Registry API operations

This document is written for implementors. A developer with no prior ATOP knowledge
should be able to implement a conforming Party Registry after reading this document and
the Architecture Specification.

---

## 2. Foundational Framework

Before defining what a Party record contains, this section establishes *how* ATOP
describes entities, roles, and credentials. Every major component of the Registry
follows the same underlying patterns.

### 2.1 The Claim Model

Every piece of information in the ATOP Registry is a **claim** — a statement made by
some party about some subject.

A claim has three components:

| Component | Question | Example |
|---|---|---|
| **Subject** | Who or what is being described? | MyAuberge Co., Ltd. |
| **Claim** | What is being asserted? | Holds a valid hotel operating license |
| **Claimant** | Who is making the assertion? | Nagano Prefecture Tourism Department |

This model is adopted from W3C Verifiable Credentials (VC) Data Model 2.0, which ATOP
uses as its formal standard for machine-readable credential claims. Not every claim in
ATOP reaches the full W3C VC format, but all claims follow this three-part structure.

**Self-declared claims** are made by the Party about itself — a hotel declaring its
own name and address. These are the lowest-assurance claims. They are useful for
discovery and communication but cannot support compliance or trust decisions without
independent verification.

**Externally verified claims** are made by a third party — a government body declaring
that a hotel holds a valid license. These carry higher assurance because the claimant
has a legal basis for the assertion and typically bears consequences for false claims.

The Registry records both types and explicitly marks which is which. Implementations
MUST NOT treat a self-declared claim as equivalent to a verified claim.

### 2.2 The Verification Model

Verification is the process by which a claim is assessed for reliability. ATOP defines
four verification methods, corresponding to four Assurance Levels.

| Level | Name | Verification Method | Standard Reference |
|---|---|---|---|
| 1 | Self-declared | No external verification | — |
| 2 | Document-attested | Authorized reviewer examines physical or digital document | ISO/IEC 29115 LoA 2 |
| 3 | Third-party verified | Recognized authority issues signed digital assertion | eIDAS LoA Substantial |
| 4 | Cryptographically verifiable | Machine-verifiable cryptographic proof | W3C VC Data Model 2.0; eIDAS LoA High |

The Jurisdiction Compliance Registry Specification defines the minimum assurance level
required for each credential type in each jurisdiction.

### 2.3 Data Formats in the Real World

ATOP implementations encounter credentials and identity data in many formats. This
section describes the formats ATOP recognizes and how each maps to the claim and
verification model.

**Paper documents** — the most common format for regulatory credentials today.
Examples: hotel operating license, taxi driver license, food handler certificate.

*How ATOP handles it:* The Party uploads a scan. An authorized reviewer examines it
and records: document type, issuing authority, license number, issue date, expiry date,
and a SHA-256 hash of the uploaded image. The reviewer signs the attestation using
their Actor credential. The Registry stores only the hash and reference URL, not the
document itself. Assurance Level: 2.

**Structured digital documents (signed PDF)** — a digitally issued certificate in PDF
form may carry an embedded digital signature from the issuing authority.

*How ATOP handles it:* Same as paper, with additional signature verification. Where
the PDF carries a valid digital signature from a recognized authority, this may qualify
for Assurance Level 3. Assurance Level: 2 (unsigned) or 3 (authority-signed).

**Government digital registries (API-accessible)** — some jurisdictions expose public
company and license registries via API. Japan's houjin bangou (corporate number)
system, UK Companies House API, EU business registries.

*How ATOP handles it:* The Party submits its registration number. The Protocol Operator
queries the jurisdiction API, verifies the registration number matches the declared
legal name and status, and records the query response with timestamp.
Assurance Level: 3.

*Implementor note:* The Jurisdiction Compliance Registry Specification maintains a list
of recognized government API sources per jurisdiction.

**W3C Verifiable Credentials with DID** — the highest-assurance format. A credential
issued as a W3C VC contains the claim, the issuer cryptographic signature, and a
reference to the issuer DID document for public key lookup.

*How ATOP handles it:* The Party presents the VC. ATOP resolves the issuer DID to
obtain the public key. The VC signature is verified cryptographically. The VC is stored
in full and re-verified at each transaction. Assurance Level: 4.

*Standard reference:* W3C Verifiable Credentials Data Model 2.0
(https://www.w3.org/TR/vc-data-model-2.0/)

**Graph-structured data (JSON-LD, RDF)** — some credential ecosystems represent
interconnected claims as a graph. JSON-LD is also the serialization format for W3C VCs.

*How ATOP handles it:* JSON-LD is natively supported as the serialization for W3C VCs.
RDF triples may be submitted as supporting evidence. ATOP processes graph data at
ingestion and stores as structured credential references. Assurance Level: determined
by the verification method of the root claim.

**Self-asserted structured data (JSON)** — for information where no external credential
exists: contact details, website, supported protocol versions.

*How ATOP handles it:* Accepted and stored as-is, marked `self_declared: true`.
No verification performed. Assurance Level: 1.

### 2.4 The Description Schema Pattern

Every major entity in this specification — Party, Role, Actor, Agent Authorization,
Credential Reference — is described using the same three-part pattern:

**Part 1 — Schema definition.** A JSON Schema 2020-12 object defining the structure,
field names, types, required fields, and constraints. This is the normative definition.

**Part 2 — Field definitions.** A table defining every field: its purpose, whether
required or optional, who provides it, and whether publicly readable or authenticated.

**Part 3 — Example.** A complete, realistic JSON example using MyAuberge Co., Ltd.
as the reference party throughout this document.

When extending the specification with new entity types, the same three-part pattern
MUST be followed.

### 2.5 Normative Language

This specification uses RFC 2119 key words: MUST, MUST NOT, REQUIRED, SHALL, SHOULD,
RECOMMENDED, MAY, OPTIONAL.

**Schema language.** All schemas are expressed in JSON Schema 2020-12. Normative schema
files are maintained in `atop-protocol/atop-spec` under `/schemas/registry/`. Inline
schemas in this document are illustrative. Repository schemas are authoritative.

---

## 3. Party — The Top-Level Entity

A **Party** is the top-level entity in the ATOP Registry. Everything else is either a
property of a Party or a relationship between Parties.

### What a Party Record Describes

A Party record answers six questions:

| Component | Question | Section |
|---|---|---|
| **Identity** | Who is this entity, legally and factually? | Section 4 |
| **Roles** | What is this entity permitted to do in transactions? | Section 5 |
| **Actors** | Who and what can act on behalf of this entity? | Section 6 |
| **Credentials** | What qualifications does this entity hold? | Section 8 |
| **Compliance** | Is this entity compliant where it operates? | Section 9 |
| **Protocol Support** | What ATOP version does this entity support? | Section 10 |

These components are not independent. Roles depend on Credentials. Compliance depends
on Roles and Credentials. Actors derive authority from the Party record. The Party
record is the root of this dependency graph.

### Party Record Structure (Overview)

```
Party
├── party_id          (assigned at registration, persistent, globally unique)
├── party_type        (organization / individual / government / platform)
├── status            (active / suspended / deregistered / pending_verification)
├── Identity          (see Section 4)
│   ├── legal_name
│   ├── jurisdiction
│   ├── registration_number
│   ├── registered_address
│   └── contact
├── Roles[]           (see Section 5)
│   ├── role_id
│   ├── status
│   └── credential_refs[]
├── Actors[]          (see Section 6)
│   ├── actor_id
│   ├── actor_type
│   └── authorization_scope
├── Agent Authorizations[]  (see Section 7)
│   ├── authorization_id
│   ├── agent_identity
│   └── authority_scope
├── Credentials[]     (see Section 8)
│   ├── credential_ref
│   ├── credential_type
│   └── assurance_level
├── Jurisdiction Compliance  (see Section 9)
│   └── {jurisdiction_code}: compliance_object
└── Protocol Support  (see Section 10)
    ├── min_version
    └── max_version
```

The complete JSON example is in Section 11.

---

## 4. Party Identity

### 4.1 What Identity Describes

Party Identity answers: *who is this entity, in the real world?*

Identity data is primarily factual and self-declared — legal name, registered address,
contact details. Its purpose is identification and communication, not authorization.
Identity alone grants no transaction permissions. Permissions come from Roles, which
require Credentials.

However, identity verification is a prerequisite for registration. A Party MUST have
its core identity claims verified at Assurance Level 2 or above before holding active
Roles. This ensures every participant in the ATOP ecosystem is a real, identifiable
entity.

### 4.2 Identity Claims and Their Verification

| Field | Claim Type | Verification Method | Assurance Level |
|---|---|---|---|
| `legal_name` | Self-declared, then verified | Cross-checked against public company registry | 2–3 |
| `legal_name_local` | Self-declared | Not independently verified | 1 |
| `jurisdiction` | Self-declared | Implied by registration number verification | — |
| `registration_number` | Self-declared, then verified | Government registry API or document | 2–3 |
| `registration_authority` | Self-declared | Matched against known authority list | 2 |
| `registered_address` | Self-declared | Not independently verified by default | 1 |
| `contact.primary_email` | Self-declared | Email verification code | 1+ |
| `contact.website` | Self-declared | Not independently verified | 1 |

`legal_name`, `jurisdiction`, and `registration_number` MUST be verified at Assurance
Level 2 before a Party can be activated.

### 4.3 Identity Schema

```json
{
  "identity": {
    "legal_name": "string, required",
    "trading_name": "string, optional",
    "legal_name_local": "string, required if non-Latin script jurisdiction",
    "jurisdiction": "string, required — ISO 3166-1 alpha-2",
    "registration_number": "string, required for organization and government types",
    "registration_authority": "string, required",
    "registered_address": {
      "street": "string",
      "city": "string",
      "region": "string, optional",
      "postal_code": "string",
      "country": "string — ISO 3166-1 alpha-2"
    },
    "contact": {
      "primary_email": "string, required — verified at registration",
      "primary_phone": "string, optional",
      "website": "string, optional"
    }
  }
}
```

### 4.4 Privacy

Identity data describes entities, not individuals in a personal capacity. For
`party_type: individual`, the legal name and contact details of the individual are
present. These fields are not publicly readable without authentication and justified
transaction context.

ATOP implementations MUST comply with applicable data protection law for each
jurisdiction of operation — including Japan APPI, EU GDPR, and equivalent frameworks.

---

## 5. Party Roles

### 5.1 The Role Description Schema

Before listing individual roles, this section defines the structure used to describe
every role in the taxonomy. All roles use this schema, enabling programmatic processing
and consistent extension.

#### Role Description Fields

| Field | Type | Description |
|---|---|---|
| `role_id` | string | Canonical identifier, SCREAMING_SNAKE_CASE |
| `role_version` | string | Version when this role was introduced or last changed |
| `category` | enum | `supply`, `distribution`, `demand`, `platform`, `regulatory` |
| `display_name` | string | Human-readable name |
| `description` | string | What this role represents and who typically holds it |
| `credential_requirements` | array | Required credential types, minimum assurance level, jurisdictions |
| `transaction_permissions` | array | What this role permits in ATOP workflow states |
| `regulatory_notes` | string | Optional — jurisdiction-specific compliance constraints |
| `extensibility` | object | How requirements and permissions are extended over time |

#### Role Schema (JSON Schema 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/registry/role-definition/v0.2",
  "type": "object",
  "required": ["role_id", "role_version", "category", "display_name",
               "description", "credential_requirements", "transaction_permissions"],
  "properties": {
    "role_id": { "type": "string", "pattern": "^[A-Z][A-Z0-9_]*$" },
    "role_version": { "type": "string", "pattern": "^[0-9]+\.[0-9]+$" },
    "category": {
      "type": "string",
      "enum": ["supply", "distribution", "demand", "platform", "regulatory"]
    },
    "display_name": { "type": "string" },
    "description": { "type": "string" },
    "credential_requirements": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["credential_type", "min_assurance_level"],
        "properties": {
          "credential_type": { "type": "string" },
          "min_assurance_level": { "type": "integer", "minimum": 1, "maximum": 4 },
          "jurisdictions": {
            "type": "array", "items": { "type": "string" },
            "description": "ISO 3166-1 codes. Empty array means all jurisdictions."
          },
          "required": { "type": "boolean", "default": true },
          "notes": { "type": "string" }
        }
      }
    },
    "transaction_permissions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["permission_id", "description"],
        "properties": {
          "permission_id": { "type": "string" },
          "description": { "type": "string" },
          "workflow_states": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "regulatory_notes": { "type": "string" },
    "extensibility": {
      "type": "object",
      "properties": {
        "additional_credential_types": { "type": "string" },
        "jurisdiction_extensions": { "type": "string" }
      }
    }
  }
}
```

#### How to Extend Credential Requirements and Permissions

When a new jurisdiction requires a credential type not yet in a role definition, it is
added as a new entry in `credential_requirements` with a `jurisdictions` filter. This
is a MINOR version change and does not break existing implementations.

When a new workflow state is added to the ATOP protocol, `transaction_permissions` for
affected roles are updated additively. Implementations not yet supporting the new state
continue operating correctly — permissions are additive and the new state simply does
not appear in their permitted state list.

When a new credential type is required universally — for example, if IATA establishes
a mandatory AI agent certification — it is added to the credential_requirements array
and the credential_types registry (Section 8.2) as a MINOR change. Parties without the
new credential have the affected role flagged `credential_pending` until acquired.

#### Applying This Schema — Example (ACTIVITY_SUPPLIER)

```json
{
  "role_id": "ACTIVITY_SUPPLIER",
  "role_version": "1.0",
  "category": "supply",
  "display_name": "Activity Supplier",
  "description": "A party that provides bookable activities, experiences, or tours.
    Examples: ski resort, guided tour operator, adventure sports operator,
    cultural experience provider, cooking class.",
  "credential_requirements": [
    {
      "credential_type": "ACTIVITY_OPERATING_LICENSE",
      "min_assurance_level": 2,
      "jurisdictions": [],
      "required": false,
      "notes": "Required where jurisdiction mandates it."
    },
    {
      "credential_type": "ACTIVITY_SAFETY_CERT",
      "min_assurance_level": 2,
      "jurisdictions": [],
      "required": false,
      "notes": "Required for outdoor, adventure, and high-risk activity types."
    },
    {
      "credential_type": "LIABILITY_INSURANCE",
      "min_assurance_level": 2,
      "jurisdictions": [],
      "required": true
    }
  ],
  "transaction_permissions": [
    {
      "permission_id": "PUBLISH_CAPABILITY_DECLARATION",
      "description": "Publish a Capability Declaration including configuration schemas.",
      "workflow_states": ["DISCOVERY"]
    },
    {
      "permission_id": "RESPOND_TO_INQUIRY",
      "description": "Receive and respond to INQUIRY messages.",
      "workflow_states": ["INQUIRY"]
    },
    {
      "permission_id": "PARTICIPATE_IN_CONFIGURATION",
      "description": "Provide capability data and feasibility check responses.",
      "workflow_states": ["CONFIGURATION"]
    },
    {
      "permission_id": "ACCEPT_BOOKING",
      "description": "Accept an activity component booking.",
      "workflow_states": ["CONFIRMATION"]
    },
    {
      "permission_id": "REQUEST_PRE_ACTIVITY_INFO",
      "description": "Issue Pre-Activity Information Requests for gear, waivers,
        dietary restrictions.",
      "workflow_states": ["PRE_ACTIVITY_COLLECTION"]
    },
    {
      "permission_id": "TRIGGER_INCIDENT",
      "description": "Trigger INCIDENT state for activities under operational
        responsibility.",
      "workflow_states": ["FULFILLMENT"]
    }
  ],
  "regulatory_notes": "Outdoor activity operators in Japan may be subject to the
    Outdoor Activity Safety Promotion Act. Ski resorts are subject to municipal slope
    safety regulations. The Jurisdiction Compliance Registry defines these in detail.",
  "extensibility": {
    "additional_credential_types": "Activity-category-specific certifications
      (e.g. DIVE_OPERATOR_CERT, MOUNTAIN_GUIDE_CERT) may be proposed as MINOR
      additions to the credential_types registry.",
    "jurisdiction_extensions": "Jurisdiction-specific requirements are declared in the
      Jurisdiction Compliance Registry, not in this role definition. This role defines
      the universal minimum."
  }
}
```

### 5.2 The Role Taxonomy

The canonical role list follows. Each role is described using the fields defined in
Section 5.1. Machine-readable role definitions are maintained at
`atop-protocol/atop-spec/schemas/registry/roles/`.

---

#### Supply Roles

**`ACCOMMODATION_SUPPLIER`** · supply · v1.0  
Provides overnight accommodation — hotel, ryokan, hostel, resort.  
*Credentials required:* ACCOMMODATION_LICENSE (L2, all, required),
LIABILITY_INSURANCE (L2, all, required).  
*Permissions:* Publish capability declarations. Accept accommodation bookings.
Initiate Amendments. Receive Pre-Activity Collection data.

---

**`ACTIVITY_SUPPLIER`** · supply · v1.0  
Provides bookable activities, experiences, or tours.  
*Credentials required:* ACTIVITY_OPERATING_LICENSE (L2, jurisdiction-dependent,
conditional), ACTIVITY_SAFETY_CERT (L2, conditional for outdoor/adventure),
LIABILITY_INSURANCE (L2, required).  
*Permissions:* Full activity booking lifecycle. Issue Pre-Activity Collection requests.
Trigger INCIDENT state.  
*Regulatory notes:* Ski resorts subject to municipal slope safety regulations in Japan.

---

**`TRANSPORT_SUPPLIER`** · supply · v1.0  
Provides ground transportation — taxi, van, bus, shuttle.  
*Credentials required:* TRANSPORT_OPERATOR_LICENSE (L2, required),
VEHICLE_INSURANCE (L2, required), DRIVER_LICENSE (L2, required for individuals).  
*Permissions:* Accept transport bookings. Send pickup confirmations. Trigger transport
INCIDENT state.  
*Regulatory notes:* Capability declarations MUST declare driver availability windows.
Feasibility checks MUST validate against declared driver hour limits.

---

**`VENUE_SUPPLIER`** · supply · v1.0  
Provides event or meeting venues — conference facilities, banquet halls, event spaces.  
*Credentials required:* FIRE_SAFETY_CERT (L2, required),
VENUE_CAPACITY_CERT (L2, required above jurisdiction thresholds),
VENUE_OPERATING_LICENSE (L2, jurisdiction-dependent).  
*Permissions:* Publish exhaustive facility schemas. Participate in NEGOTIATION.
Accept event bookings. Issue Amendment requests.

---

**`EQUIPMENT_RENTAL_SUPPLIER`** · supply · v1.0  
Provides rental equipment — ski gear, bicycles, diving equipment.  
*Credentials required:* BUSINESS_REGISTRATION (L2, required),
EQUIPMENT_SAFETY_CERT (L2, jurisdiction-dependent).  
*Permissions:* Publish capability declarations with per-item rental/sale classification.
Process gear sizing from Pre-Activity Collection.  
*Regulatory notes:* Capability Declaration MUST include `rental_prohibited` flag per
item type with `regulatory_basis` where health regulations prohibit rental of
skin-contact items.

---

**`FOOD_BEVERAGE_SUPPLIER`** · supply · v1.0  
Provides catering and food services within a travel experience.  
*Credentials required:* FOOD_HANDLER_LICENSE (L2, required),
BUSINESS_REGISTRATION (L2, required).  
*Permissions:* Publish capability declarations with menu and dietary options.
Receive dietary restriction data. Confirm reservations.

---

**`SUB_SUPPLIER`** · supply · v1.0  
Provides services under contract to another supplier with no direct customer
relationship. The contracting supplier remains responsible to the customer.  
*Credentials required:* Relevant professional certification for service type.  
*Permissions:* Appear in Trust Chain for operational coordination. Receive relevant
operational data. Do not appear in customer-facing documentation unless explicitly
declared.

---

**`RESOURCE_PROVIDER`** · supply · v1.0  
Provides data or infrastructure resources (weather API, routing API, emergency
coordination). Not party to bookings. Appears in Resource Reference Registry.

---

#### Distribution Roles

**`TOUR_OPERATOR`** · distribution · v1.0  
Assembles multi-supplier travel products and sells them as packages.  
*Credentials required:* TRAVEL_AGENCY_LICENSE (L2, required),
INSOLVENCY_PROTECTION (L2, where mandated by jurisdiction).  
*Permissions:* Initiate multi-supplier bookings. Act as primary contracting party.
Hold Duty of Care during fulfillment. Declare split-seller configurations.  
*Regulatory notes:* A hotel assembling accommodation and activity packages is acting as
a Tour Operator in most jurisdictions and requires a Travel Agency License, or must
operate in a split-seller configuration with a licensed intermediary.

---

**`TRAVEL_AGENT`** · distribution · v1.0  
Sells travel products as intermediary between customer and supplier.  
*Credentials required:* TRAVEL_AGENCY_LICENSE (L2, required),
IATA_ACCREDITATION (L3, required for air components).  
*Permissions:* Initiate bookings on behalf of customers. Issue vouchers and
confirmations. Participate in negotiation on behalf of customers.

---

**`ONLINE_TRAVEL_AGENCY`** · distribution · v1.0  
Digital platform for travel product discovery, booking, and payment.  
*Credentials required:* TRAVEL_AGENCY_LICENSE (L2, per jurisdiction of operation),
DATA_PROTECTION_COMPLIANCE (L3, required).  
*Permissions:* All Travel Agent permissions. May operate AI Agents at permitted levels.
MUST implement Disruption Event Declaration subscription for destinations served.

---

**`CHANNEL_MANAGER`** · distribution · v1.0  
Technology infrastructure connecting supplier inventory to multiple distribution
channels.  
*Credentials required:* ATOP_CONFORMANCE (L3, required).  
*Permissions:* Technology intermediary role in Trust Chain. Does not hold commercial
liability for booking outcomes.

---

**`BED_BANK`** · distribution · v1.0  
Wholesaler purchasing accommodation in bulk and reselling to agents and OTAs.  
*Credentials required:* TRAVEL_AGENCY_LICENSE (L2, relevant jurisdictions),
INSOLVENCY_PROTECTION (L2, where required).

---

#### Demand Roles

**`CONSUMER`** · demand · v1.0  
Individual traveler for personal leisure travel. Registration not required for standard
bookings. MUST register to authorize an AI Agent on their behalf.

**`CORPORATE_TRAVELER`** · demand · v1.0  
Individual traveling under a corporate travel policy.

**`GROUP_ORGANIZER`** · demand · v1.0  
Books on behalf of a group. Responsible for group member information collection and
supplier communication.

**`EVENT_PLANNER`** · demand · v1.0  
Plans and executes events — conferences, retreats, weddings, incentive travel.

**`CORPORATE_BUYER`** · demand · v1.0  
Organization purchasing travel services for employees under a negotiated corporate
agreement.

---

#### Platform Roles

**`PROTOCOL_OPERATOR`** · platform · v1.0  
Operates ATOP-conformant registry and API infrastructure. Responsible for Party
registration verification, credential attestation, and Trust Chain archival.  
*Credentials required:* ATOP_OPERATOR_CERT (L3), SECURITY_AUDIT_CERT (L3),
DATA_PROTECTION_COMPLIANCE (L3).  
*Special responsibilities:* May issue Disruption Event Declarations within operational
scope. Maintains evidentiary transaction records.

**`TECHNOLOGY_PROVIDER`** · platform · v1.0  
Provides technology services — PMS vendors, booking engines, AI platforms.
Appears in Trust Chain for audit. Does not hold commercial liability.

**`CERTIFICATION_BODY`** · platform · v1.0  
Authorized to issue ATOP Conformance Certificates.

---

#### Regulatory Roles

**`LICENSING_AUTHORITY`** · regulatory · v1.0  
Government body authorized to issue travel industry licenses.  
*Special permissions:* May update credential verification status for licenses it has
issued. Notified when parties under its jurisdiction enter INCIDENT or
DISRUPTION-REVIEW state.

**`CONSUMER_PROTECTION_BODY`** · regulatory · v1.0  
Government or authorized organization responsible for consumer protection in travel.

**`INDUSTRY_ASSOCIATION`** · regulatory · v1.0  
Recognized travel industry association — IATA, JATA, ABTA, OpenTravel Alliance.  
*Special permissions:* Associations with Protocol Operator status may issue Disruption
Event Declarations within their operational scope.

**`EMERGENCY_COORDINATOR`** · regulatory · v1.0  
Emergency response coordination — local emergency services, mountain rescue, coast
guard.  
*Permissions:* Recipient of INCIDENT state notifications. Does not participate in
booking workflows. Contact details and notification preferences maintained in the
Registry for regions served.

---

#### Extended Roles

Parties may declare roles not in the canonical taxonomy using a namespace-qualified
extension:

```json
{
  "role_id": "ext:jp:ryokan-association-member",
  "namespace": "jp",
  "display_name": "Ryokan Association Member",
  "status": "active"
}
```

Extended roles do not grant canonical transaction permissions. They may be proposed for
canonical inclusion through the governance process in Section 16.

---

## 6. Party Actors

### 6.1 The Actor Description Schema

An Actor declaration answers: *who or what is authorized to act within ATOP workflows
on behalf of this Party, and to what extent?*

#### Actor Description Fields

| Field | Type | Declared By | Description |
|---|---|---|---|
| `actor_id` | string | Registry | Globally unique identifier |
| `party_id` | string | Registry | The Party this Actor belongs to |
| `actor_type` | enum | Party | `human`, `system`, or `ai_agent` |
| `display_name` | string | Party | Human-readable name |
| `role_within_party` | string | Party | Job title or function |
| `status` | enum | Registry | `active`, `suspended`, `revoked` |
| `authentication` | object | Party + Registry | How this Actor authenticates |
| `authorization_scope` | object | Party | What this Actor may do |
| `contact` | object | Party | Reachable for human-confirmation workflows |

#### Actor Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/registry/actor/v0.2",
  "type": "object",
  "required": ["actor_id", "party_id", "actor_type", "display_name",
               "status", "authentication", "authorization_scope"],
  "properties": {
    "actor_id": { "type": "string" },
    "party_id": { "type": "string" },
    "actor_type": { "type": "string", "enum": ["human", "system", "ai_agent"] },
    "display_name": { "type": "string" },
    "role_within_party": { "type": "string" },
    "status": { "type": "string", "enum": ["active", "suspended", "revoked"] },
    "authentication": {
      "type": "object",
      "required": ["method"],
      "properties": {
        "method": { "type": "string",
          "enum": ["oauth2_oidc", "mtls_certificate", "api_key"] },
        "subject_identifier": { "type": "string" },
        "mfa_required": { "type": "boolean" }
      }
    },
    "authorization_scope": {
      "type": "object",
      "properties": {
        "workflow_states": { "type": "array", "items": { "type": "string" } },
        "can_sign_binding": { "type": "boolean" },
        "can_issue_agent_authorization": { "type": "boolean" },
        "can_modify_party_record": { "type": "boolean" },
        "transaction_value_limit": { "oneOf": [{"type":"number"},{"type":"null"}] }
      }
    },
    "contact": {
      "type": "object",
      "properties": {
        "email": { "type": "string" },
        "phone": { "type": "string" },
        "preferred_channel": { "type": "string",
          "enum": ["email", "sms", "whatsapp", "in_app"] }
      }
    }
  }
}
```

### 6.2 Actor Types and Permissions

**`human`** — A natural person. The only actor type that can sign binding agreements,
authorize AI Agents, modify the Party Record, and confirm AI-generated proposals.
A Party MUST declare at least one human Actor with `can_sign_binding: true`.

**`system`** — A software system (booking engine, PMS). May initiate and progress
workflow states up to but not including CONFIRMATION. MUST NOT create a binding
obligation.

**`ai_agent`** — A software Actor using AI reasoning. Requires an Agentic Authorization
record (Section 7). An AI Agent entry in the Actors array references its Agent
Authorization record.

#### Binding Signature Requirement

Any transition creating a binding obligation — CONFIRMATION, AMENDMENT changing price
or terms, CANCELLATION triggering a penalty — MUST carry a signature from a human Actor
with `can_sign_binding: true`.

The signature is produced using the Actor OAuth 2.1 / FAPI 2.0 Proof of Possession
token. The signed payload includes: transaction ID, state being entered, UTC timestamp,
and SHA-256 hash of agreed terms. This signature is archived in the Trust Chain and
provides non-repudiation.

#### Actor Example

```json
{
  "actor_id": "actor:myauberge-001:tomsato",
  "party_id": "atop:party:jp:myauberge-001",
  "actor_type": "human",
  "display_name": "Tom Sato",
  "role_within_party": "CEO",
  "status": "active",
  "authentication": {
    "method": "oauth2_oidc",
    "subject_identifier": "sub:google:1234567890",
    "mfa_required": true
  },
  "authorization_scope": {
    "workflow_states": ["CONFIRMATION", "AMENDMENT", "CANCELLATION", "INCIDENT"],
    "can_sign_binding": true,
    "can_issue_agent_authorization": true,
    "can_modify_party_record": true,
    "transaction_value_limit": null
  },
  "contact": {
    "email": "tomsato@myauberge.jp",
    "phone": "+81-90-6315-1325",
    "preferred_channel": "email"
  }
}
```

---

## 7. The Agentic Authorization Framework

### 7.1 The Agent Authorization Schema

An Agent Authorization answers: *what is this AI Agent permitted to do, on whose behalf,
and within what limits?*

Every field is a claim. Most are self-declared by the Party. The security-critical
fields — the public key reference and signature algorithm — are verified by
counterparties at the time of each interaction.

#### Agent Authorization Fields

| Field | Type | Description |
|---|---|---|
| `authorization_id` | string | Unique identifier |
| `party_id` | string | The Party issuing this authorization |
| `issued_by_actor` | string | The human Actor who issued it |
| `issued_at` / `expires_at` | datetime | Validity window |
| `agent_identity` | object | Name, version, platform, endpoint |
| `ai_participation_level` | integer 0–3 | Maximum level at which this agent may operate |
| `authority_scope` | object | Permitted states, values, negotiation bounds |
| `human_confirmation_requirements` | object | Which actions require human confirmation |
| `counterparty_verification` | object | Public key URL and signature algorithm |

#### Agent Authorization Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/registry/agent-authorization/v0.2",
  "type": "object",
  "required": ["authorization_id", "party_id", "issued_by_actor", "issued_at",
               "expires_at", "agent_identity", "ai_participation_level",
               "authority_scope", "human_confirmation_requirements",
               "counterparty_verification"],
  "properties": {
    "authorization_id": { "type": "string" },
    "party_id": { "type": "string" },
    "issued_by_actor": { "type": "string" },
    "issued_at": { "type": "string", "format": "date-time" },
    "expires_at": { "type": "string", "format": "date-time" },
    "status": { "type": "string", "enum": ["active", "revoked", "expired"] },
    "agent_identity": {
      "type": "object",
      "required": ["agent_name", "agent_version", "agent_endpoint"],
      "properties": {
        "agent_name": { "type": "string" },
        "agent_version": { "type": "string" },
        "agent_platform": { "type": "string" },
        "agent_endpoint": { "type": "string", "format": "uri" }
      }
    },
    "ai_participation_level": { "type": "integer", "minimum": 0, "maximum": 3 },
    "authority_scope": {
      "type": "object",
      "properties": {
        "permitted_roles": { "type": "array", "items": { "type": "string" } },
        "permitted_workflow_states": { "type": "array", "items": { "type": "string" } },
        "prohibited_workflow_states": { "type": "array", "items": { "type": "string" } },
        "can_initiate_bookings": { "type": "boolean" },
        "can_respond_to_bookings": { "type": "boolean" },
        "max_proposal_value_usd": { "type": "number" },
        "negotiation_bounds": { "type": "object" }
      }
    },
    "human_confirmation_requirements": {
      "type": "object",
      "properties": {
        "required_before": { "type": "array", "items": { "type": "string" } },
        "confirmation_timeout_hours": { "type": "integer" },
        "escalation_actor": { "type": "string" }
      }
    },
    "counterparty_verification": {
      "type": "object",
      "required": ["public_key_url", "signature_algorithm"],
      "properties": {
        "public_key_url": { "type": "string", "format": "uri" },
        "signature_algorithm": { "type": "string", "enum": ["ES256","ES384","RS256"] }
      }
    }
  }
}
```

### 7.2 AI Participation Levels

| Level | Name | What the Agent May Do | Human Required Before |
|---|---|---|---|
| 0 | Logic only | Query data, check availability, validate schemas | Any response to counterparty |
| 1 | AI-assisted | Propose configurations, draft responses | Sending any message to counterparty |
| 2 | AI-negotiated | Send messages, make proposals, counter-propose within bounds | CONFIRMATION or binding transition |
| 3 | AI-autonomous | Complete full workflow steps | Human reviews result before archival |

### 7.3 Permanent Prohibitions

Regardless of authorization level, an AI Agent is permanently prohibited from:

- Signing a CONFIRMATION message
- Signing an AMENDMENT that changes price or material terms
- Issuing a CANCELLATION that triggers a financial penalty
- Modifying the Party Record
- Issuing or revoking Agent Authorizations
- Responding to INCIDENT state without notifying a human Actor within 15 minutes

The ATOP API MUST reject any message in these categories signed by an AI Agent
identifier. The rejection MUST be logged and the relevant human Actor notified.

#### Counterparty Verification

When Party A receives a message from an AI Agent claiming to act for Party B, it MUST
verify: (1) the Agent Authorization exists and has `status: active`, (2) the
authorization has not expired, (3) the action is within `permitted_workflow_states`,
(4) the message value is within `max_proposal_value_usd`, (5) the message signature
verifies against the public key at `public_key_url`. Any failed check MUST result in
rejection, logging, and human Actor notification.

---

## 8. Credential References

### 8.1 The Credential Reference Schema

A Credential Reference answers: *what evidence exists that this Party holds a specific
qualification, and how reliable is that evidence?*

The Registry stores credential metadata and verification status — not the credential
documents themselves.

#### Credential Reference Fields

| Field | Type | Description |
|---|---|---|
| `credential_ref` | string | Unique reference identifier |
| `party_id` | string | The Party holding this credential |
| `credential_type` | string | Type from the credential types registry |
| `assurance_level` | integer 1–4 | Level achieved after verification |
| `issuing_authority` | object | Who issued this credential |
| `document` | object | Issue date, expiry, number, document URL, SHA-256 hash |
| `verification` | object | Who verified, when, how, next review date |
| `vc_data` | object or null | Full W3C VC payload if assurance_level is 4 |

#### Credential Reference Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/registry/credential-reference/v0.2",
  "type": "object",
  "required": ["credential_ref", "party_id", "credential_type",
               "assurance_level", "issuing_authority", "document", "verification"],
  "properties": {
    "credential_ref": { "type": "string" },
    "party_id": { "type": "string" },
    "credential_type": { "type": "string" },
    "assurance_level": { "type": "integer", "minimum": 1, "maximum": 4 },
    "issuing_authority": {
      "type": "object",
      "required": ["name", "authority_type", "jurisdiction"],
      "properties": {
        "name": { "type": "string" },
        "authority_type": { "type": "string",
          "enum": ["government", "industry_body", "certification_body", "self"] },
        "jurisdiction": { "type": "string" },
        "party_id": { "type": "string" }
      }
    },
    "document": {
      "type": "object",
      "properties": {
        "issued_date": { "type": "string", "format": "date" },
        "expiry_date": { "type": "string", "format": "date" },
        "license_number": { "type": "string" },
        "document_url": { "type": "string", "format": "uri" },
        "document_hash": { "type": "string" }
      }
    },
    "verification": {
      "type": "object",
      "properties": {
        "status": { "type": "string",
          "enum": ["verified", "pending", "failed", "expired"] },
        "verified_by": { "type": "string" },
        "verified_at": { "type": "string", "format": "date-time" },
        "verification_method": { "type": "string",
          "enum": ["self_declared", "document_review", "api_verification",
                   "signed_assertion", "cryptographic_verification"] },
        "next_review_date": { "type": "string", "format": "date" }
      }
    },
    "vc_data": { "oneOf": [{"type":"null"}, {"type":"object"}] }
  }
}
```

### 8.2 Credential Types

| Credential Type | Required For Role | Notes |
|---|---|---|
| `ACCOMMODATION_LICENSE` | ACCOMMODATION_SUPPLIER | Hotel/ryokan operating license |
| `TRAVEL_AGENCY_LICENSE` | TOUR_OPERATOR, TRAVEL_AGENT, OTA | Class 1/2/3 in Japan; ATOL in UK |
| `ACTIVITY_OPERATING_LICENSE` | ACTIVITY_SUPPLIER | Jurisdiction-dependent |
| `ACTIVITY_SAFETY_CERT` | ACTIVITY_SUPPLIER | Outdoor, adventure, high-risk |
| `FOOD_HANDLER_LICENSE` | FOOD_BEVERAGE_SUPPLIER | Food safety certification |
| `TRANSPORT_OPERATOR_LICENSE` | TRANSPORT_SUPPLIER | Vehicle operator license |
| `DRIVER_LICENSE` | TRANSPORT_SUPPLIER (individual) | Professional driver license |
| `VEHICLE_INSURANCE` | TRANSPORT_SUPPLIER | Required all jurisdictions |
| `FIRE_SAFETY_CERT` | VENUE_SUPPLIER | Fire safety compliance |
| `VENUE_CAPACITY_CERT` | VENUE_SUPPLIER | Occupancy certificate |
| `LIABILITY_INSURANCE` | All supply roles | Minimum coverage per jurisdiction |
| `INSOLVENCY_PROTECTION` | TOUR_OPERATOR, TRAVEL_AGENT | EU PTD, Japan Class 2+ |
| `IATA_ACCREDITATION` | TRAVEL_AGENT, OTA | Required for air components |
| `DATA_PROTECTION_COMPLIANCE` | OTA, PROTOCOL_OPERATOR | GDPR, APPI, equivalent |
| `ATOP_CONFORMANCE` | PROTOCOL_OPERATOR, CHANNEL_MANAGER | Issued by ATOP certification body |
| `ATOP_OPERATOR_CERT` | PROTOCOL_OPERATOR | Full operator certification |
| `SECURITY_AUDIT_CERT` | PROTOCOL_OPERATOR | Annual security audit |
| `BUSINESS_REGISTRATION` | All individual party types | Business registration document |

### 8.3 Assurance Levels

| Level | Name | Verification Method | Standard Reference |
|---|---|---|---|
| 1 | Self-declared | None | — |
| 2 | Document-attested | Reviewer examines document, records signed attestation | ISO/IEC 29115 LoA 2 |
| 3 | Third-party verified | API query to recognized government registry, or authority-signed assertion | eIDAS LoA Substantial |
| 4 | Cryptographically verifiable | W3C VC signature verified against issuer DID | W3C VC Data Model 2.0; eIDAS LoA High |

### 8.4 Credential Expiry Monitoring

- **90 days before expiry:** Renewal reminder to Party administrative Actors
- **30 days before expiry:** Dependent role flagged `credential_expiring`
- **At expiry:** Dependent role suspended until credential is renewed
- **Exception:** Bookings already in FULFILLMENT are not affected

---

## 9. Jurisdiction Compliance

Records whether the Party holds licenses required for its roles in each jurisdiction
where it operates, and any regulatory constraints or sandbox flags that apply.

Full specification of jurisdiction compliance rules is in the
**Jurisdiction Compliance Registry Specification**.

```json
{
  "jurisdiction_compliance": {
    "JP": {
      "travel_agency_license": false,
      "travel_agency_license_number": null,
      "packaging_restriction": true,
      "packaging_restriction_note": "Cannot independently package accommodation with
        off-premise activities without a Travel Agency License.",
      "sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
      "compliance_last_reviewed": "2026-03-01"
    }
  }
}
```

---

## 10. Protocol Support

Declares the ATOP version range the Party supports and which roles and states its
implementation handles.

```json
{
  "protocol_support": {
    "min_version": "0.1",
    "max_version": "0.2",
    "supported_roles_in_transaction": ["ACCOMMODATION_SUPPLIER", "PROTOCOL_OPERATOR"],
    "supported_workflow_states": [
      "DISCOVERY", "INQUIRY", "CONFIGURATION", "PROPOSAL", "NEGOTIATION",
      "CONFIRMATION", "PRE_ACTIVITY_COLLECTION", "READY", "FULFILLMENT",
      "COMPLETION", "CANCELLATION", "INCIDENT"
    ]
  }
}
```

Version negotiation: the INQUIRY message declares each party supported version range.
The Protocol Operator selects the highest mutually supported version. If no common
version exists, the transaction cannot proceed.

---

## 11. The Complete Party Record

A complete Party Record for MyAuberge Co., Ltd., assembling all components defined in
Sections 3 through 10.

```json
{
  "party_id": "atop:party:jp:myauberge-001",
  "party_type": "organization",
  "status": "active",
  "registered_at": "2026-03-01T00:00:00Z",
  "last_updated": "2026-03-04T09:00:00Z",

  "identity": {
    "legal_name": "MyAuberge Co., Ltd.",
    "trading_name": "MyAuberge",
    "legal_name_local": "マイオーベルジュ株式会社",
    "jurisdiction": "JP",
    "registration_number": "0000-01-012345",
    "registration_authority": "Japan Legal Affairs Bureau",
    "registered_address": {
      "street": "1234 Shirakaba",
      "city": "Chino",
      "region": "Nagano",
      "postal_code": "391-0000",
      "country": "JP"
    },
    "contact": {
      "primary_email": "info@myauberge.jp",
      "primary_phone": "+81-266-00-0000",
      "website": "https://www.myauberge.jp"
    }
  },

  "roles": [
    {
      "role_id": "ACCOMMODATION_SUPPLIER",
      "status": "active",
      "declared_at": "2026-03-01T00:00:00Z",
      "jurisdictions": ["JP"],
      "credential_refs": [
        "cred:myauberge-001:hotel-license-jp",
        "cred:myauberge-001:liability-insurance-jp"
      ]
    },
    {
      "role_id": "PROTOCOL_OPERATOR",
      "status": "active",
      "declared_at": "2026-03-01T00:00:00Z",
      "jurisdictions": ["JP"],
      "credential_refs": ["cred:myauberge-001:atop-conformance-001"]
    }
  ],

  "actors": [
    {
      "actor_id": "actor:myauberge-001:tomsato",
      "actor_type": "human",
      "display_name": "Tom Sato",
      "role_within_party": "CEO",
      "status": "active",
      "authentication": {
        "method": "oauth2_oidc",
        "subject_identifier": "sub:google:1234567890",
        "mfa_required": true
      },
      "authorization_scope": {
        "workflow_states": ["CONFIRMATION","AMENDMENT","CANCELLATION","INCIDENT"],
        "can_sign_binding": true,
        "can_issue_agent_authorization": true,
        "can_modify_party_record": true,
        "transaction_value_limit": null
      },
      "contact": {
        "email": "tomsato@myauberge.jp",
        "phone": "+81-90-6315-1325",
        "preferred_channel": "email"
      }
    }
  ],

  "agent_authorizations": [],

  "credentials": [
    {
      "credential_ref": "cred:myauberge-001:hotel-license-jp",
      "party_id": "atop:party:jp:myauberge-001",
      "credential_type": "ACCOMMODATION_LICENSE",
      "assurance_level": 2,
      "issuing_authority": {
        "name": "Nagano Prefecture Tourism Department",
        "authority_type": "government",
        "jurisdiction": "JP"
      },
      "document": {
        "issued_date": "2024-01-15",
        "expiry_date": "2027-01-14",
        "license_number": "NP-HOTEL-2024-0123",
        "document_url": "https://credentials.atop-protocol.org/docs/myauberge-hotel-license",
        "document_hash": "sha256:a1b2c3d4e5f6..."
      },
      "verification": {
        "status": "verified",
        "verified_by": "atop:party:atop-protocol:registry-operator",
        "verified_at": "2026-03-01T12:00:00Z",
        "verification_method": "document_review",
        "next_review_date": "2026-09-01"
      },
      "vc_data": null
    }
  ],

  "jurisdiction_compliance": {
    "JP": {
      "travel_agency_license": false,
      "travel_agency_license_number": null,
      "packaging_restriction": true,
      "packaging_restriction_note": "Cannot independently package accommodation with
        off-premise activities without a Travel Agency License. Split-seller
        configuration required.",
      "sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
      "compliance_last_reviewed": "2026-03-01"
    }
  },

  "protocol_support": {
    "min_version": "0.1",
    "max_version": "0.2",
    "supported_roles_in_transaction": ["ACCOMMODATION_SUPPLIER","PROTOCOL_OPERATOR"],
    "supported_workflow_states": [
      "DISCOVERY","INQUIRY","CONFIGURATION","PROPOSAL","NEGOTIATION",
      "CONFIRMATION","PRE_ACTIVITY_COLLECTION","READY","FULFILLMENT",
      "COMPLETION","CANCELLATION","INCIDENT"
    ]
  },

  "registry_metadata": {
    "registered_by": "atop:party:atop-protocol:registry-operator",
    "verification_method": "document_attestation",
    "public": true
  }
}
```

---

## 12. Registration Process

### 12.1 Who Can Register

Any entity intending to participate in ATOP transactions must register. No fee for
registration in the open registry.

Registration may be initiated by: the Party itself, a Protocol Operator on behalf of
the Party, or a Licensing Authority registering parties under their jurisdiction.

### 12.2 Registration Steps

**Step 1 — Submit Party Record.**  
Required minimum: `party_type`, `identity.legal_name`, `identity.jurisdiction`,
`identity.registration_number`, `identity.contact.primary_email`, at least one role.

**Step 2 — Email Verification.**  
Verification code sent to `primary_email`. Must be confirmed within 48 hours.
Status moves to `pending_verification`.

**Step 3 — Identity Verification.**  
Protocol Operator verifies legal identity. Automated for jurisdictions with public
registry APIs. Manual document review where automated checks are unavailable.

**Step 4 — Credential Verification.**  
Supporting credentials verified for each declared role. Unverified roles marked
`pending_credential`.

**Step 5 — Activation.**  
Once identity is verified and at least one role has Assurance Level 2 credentials
confirmed: `status: active`.

**Step 6 — Actor Declaration.**  
At least one human Actor with `can_sign_binding: true` MUST be declared and
authenticated before the Party can participate in transactions.

### 12.3 Rejection Criteria

Registration is rejected if: legal identity cannot be verified, the registration
number is already registered under a different `party_id`, the Party appears on a
sanctions list, or claimed roles require credentials demonstrably not held.

Rejection reasons are provided. Resubmission with corrected information is permitted.

---

## 13. The Trust Chain

The Trust Chain is a signed, traveling record of all parties involved in a specific
transaction, constructed from Registry records at the moment the transaction begins.

### 13.1 Construction

On receiving an INQUIRY, the Protocol Operator constructs a Trust Chain:

```json
{
  "trust_chain_id": "tc:2026-03-04:booking-ski-001",
  "transaction_id": "tx:2026-03-04:booking-ski-001",
  "created_at": "2026-03-04T09:30:00Z",
  "protocol_version": "0.2",
  "parties": [
    {
      "party_id": "atop:party:jp:myauberge-001",
      "role_in_transaction": "ACCOMMODATION_SUPPLIER",
      "duty_of_care_phases": ["PRE_ACTIVITY_COLLECTION", "READY"],
      "snapshot_ref": "registry:myauberge-001:snapshot:2026-03-04T09:30:00Z"
    },
    {
      "party_id": "atop:party:jp:ski-resort-nagano-001",
      "role_in_transaction": "ACTIVITY_SUPPLIER",
      "duty_of_care_phases": ["FULFILLMENT", "COMPLETION"],
      "snapshot_ref": "registry:ski-resort-nagano-001:snapshot:2026-03-04T09:30:00Z"
    }
  ],
  "jurisdiction_compliance": {
    "primary_jurisdiction": "JP",
    "applicable_regulations": ["JP-TRAVEL-LAW-2018"],
    "sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"]
  },
  "state_history": [],
  "signatures": []
}
```

### 13.2 Duty of Care Coverage

`duty_of_care_phases` MUST collectively cover every journey phase without gaps. The
Protocol Operator MUST validate complete coverage before CONFIRMATION.

### 13.3 Registry Snapshots

At Trust Chain construction, a snapshot of each Party Record is archived. This
snapshot — not the live record — governs the transaction, ensuring the Trust Chain
reflects credentials and authorizations at booking time.

### 13.4 Archival

Complete Trust Chain archived at COMPLETION or CANCELLATION. Minimum retention: 7 years
or the maximum required by applicable jurisdictions.

---

## 14. Registry Operations

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/registry/parties` | No | Register a new Party |
| `GET` | `/registry/parties/{party_id}` | No (public fields) | Retrieve Party Record |
| `PUT` | `/registry/parties/{party_id}` | Yes | Update Party Record |
| `GET` | `/registry/parties/{party_id}/roles` | No | List roles |
| `POST` | `/registry/parties/{party_id}/actors` | Yes | Declare Actor |
| `GET` | `/registry/parties/{party_id}/actors` | Yes | List Actors |
| `POST` | `/registry/parties/{party_id}/agent-authorizations` | Yes | Issue Agent Authorization |
| `DELETE` | `/registry/parties/{party_id}/agent-authorizations/{auth_id}` | Yes | Revoke Agent Authorization |
| `GET` | `/registry/parties/{party_id}/credentials` | Yes | List credentials |
| `POST` | `/registry/trust-chains` | Yes | Construct Trust Chain |
| `GET` | `/registry/trust-chains/{tc_id}` | Yes | Retrieve Trust Chain |
| `GET` | `/registry/roles` | No | List canonical roles |
| `GET` | `/registry/credential-types` | No | List credential types |

**Publicly readable:** `party_id`, `party_type`, `status`, `identity.legal_name`,
`identity.trading_name`, `identity.jurisdiction`, role IDs and status,
`protocol_support`.

**Authentication required:** `identity.registration_number`, `identity.contact`,
`credentials` (full detail), `actors` (full detail), `agent_authorizations`,
`jurisdiction_compliance`.

---

## 15. Identifier Specification

| Entity | Format | Example |
|---|---|---|
| Party | `atop:party:{jurisdiction}:{slug}` | `atop:party:jp:myauberge-001` |
| Actor | `actor:{party_slug}:{actor_slug}` | `actor:myauberge-001:tomsato` |
| Agent Authorization | `agent-auth:{party_slug}:{auth_slug}` | `agent-auth:myauberge-001:concierge-v1` |
| Credential Reference | `cred:{party_slug}:{cred_slug}` | `cred:myauberge-001:hotel-license-jp` |
| Trust Chain | `tc:{date}:{slug}` | `tc:2026-03-04:booking-ski-001` |

`jurisdiction` is ISO 3166-1 alpha-2, lowercase. `slug` is URL-safe, 3–64 characters,
lowercase, hyphens permitted, no whitespace. `party_id` values are persistent and never
reused after deregistration.

---

## 16. Versioning and Governance

### Versioning Rules

- **Adding** a new role or credential type: MINOR version increment
- **Changing** permissions or requirements for an existing entry: MINOR version with
  migration guidance
- **Removing** a role or credential type: MAJOR version increment, minimum 6-month
  deprecation period

### Proposing a New Role

1. Open a GitHub Issue in `atop-protocol/atop-spec` using the Role Proposal template
2. Provide: role_id, display_name, category, description, credential_requirements,
   transaction_permissions, regulatory_notes, and at least two real-world examples
3. Community comment period: 30 days
4. ATOP governance body reviews: approve, request modification, or reject
5. Approved roles included in the next MINOR release

### Proposing a New Credential Type

Same process as a new role using the Credential Type Proposal template. Additionally
requires: how the credential is issued per jurisdiction and the verification method
available at each assurance level.

---

*Document status: Draft v0.2 — March 2026*  
*Next: Jurisdiction Compliance Registry Specification v0.1*  
*Depends on: Architecture Specification v0.1*  
*Maintainer: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
