# ATOP Party Policy Declarations Specification

**Version:** 0.1 (Draft)  
**Status:** Layer 1 — Identity and Trust  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**Depends on:** Architecture Specification v0.1, Party Registry Specification v0.2,
Jurisdiction Compliance Registry Specification v0.2,
Trust Chain Declaration Specification v0.1  
**References:** See references.md  
**License:** Apache 2.0  

---

## Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [Foundational Framework](#2-foundational-framework)
   - 2.1 [What a Policy Declaration Is](#21-what-a-policy-declaration-is)
   - 2.2 [Policy Basis: The Primary Organizing Principle](#22-policy-basis-the-primary-organizing-principle)
   - 2.3 [Regulatory vs. Supplier Policies — Processing Consequences](#23-regulatory-vs-supplier-policies--processing-consequences)
   - 2.4 [Layered Policies](#24-layered-policies)
   - 2.5 [What ATOP Does and Does Not Do](#25-what-atop-does-and-does-not-do)
3. [Policy Type Taxonomy](#3-policy-type-taxonomy)
4. [Policy Declaration Schema](#4-policy-declaration-schema)
5. [Policy Acknowledgment](#5-policy-acknowledgment)
6. [Policy Inheritance and Delegation](#6-policy-inheritance-and-delegation)
7. [Policy Versioning](#7-policy-versioning)
8. [Enforcement Points](#8-enforcement-points)
9. [Protocol-Level Policies](#9-protocol-level-policies)
10. [Normative References](#10-normative-references)
11. [Informative References](#11-informative-references)

---

## 1. Purpose of This Document

The protocol does not prescribe the content of Party policies. It provides the
structure for declaring them, the mechanism for acknowledging them, and the
enforcement point that prevents a transaction from proceeding if a required
policy acknowledgment is missing.

Party Policy Declarations answer the question: *what conditions must be met —
and what must be explicitly acknowledged — before this transaction can proceed
to CONFIRMATION?*

Policies in ATOP cover a wide range: a resort's adult-only rule, a dive operator's
certification requirement, a jurisdiction's visa obligation, a safety waiver for
a high-altitude hike, a data processing consent for GDPR compliance. These are not
the same kind of thing. The primary distinction that governs how ATOP processes
every policy is not its subject matter but its **basis** — is this policy a
regulatory requirement, or is it a supplier preference?

This distinction is architectural. It determines how the policy is validated,
where its acknowledgment text comes from, what ATOP enforces automatically versus
what the Party must configure, and what the legal consequences of non-compliance are.

---

## 2. Foundational Framework

### 2.1 What a Policy Declaration Is

A Policy Declaration is a structured statement, published by a Party in their
Party Record, that declares:

- A condition that must be met for a transaction involving this Party to proceed
- Who must satisfy the condition (another Party, the customer, or an Actor)
- When the condition is evaluated (at INQUIRY, CONFIGURATION, or CONFIRMATION)
- Whether explicit acknowledgment is required and in what form
- Whether the condition is a legal requirement or a business preference

Policy Declarations are distinct from:

- **Credential requirements** — handled by Credential Scope Validation in the
  Trust Chain Declaration Specification. Credential scope validation checks that
  parties hold the right licenses and certifications. Policy declarations address
  conditions beyond credentials: eligibility, consent, operational requirements,
  risk acknowledgment.

- **Compliance requirements** — handled by the Jurisdiction Compliance Registry.
  Where a regulatory compliance requirement also involves a customer-facing
  acknowledgment, the Policy Declaration references the compliance requirement
  rather than duplicating it.

- **Capability declarations** — handled by the Catalogue Specification [forthcoming].
  Capability declarations describe what a party can do. Policy declarations describe
  what conditions must be met before they will do it.

### 2.2 Policy Basis: The Primary Organizing Principle

Every Policy Declaration has a `policy_basis` field. This is the most important
field in the schema. It determines everything about how the policy is processed.

```
policy_basis: "regulatory" | "supplier" | "protocol"
```

**Regulatory policies** (`policy_basis: "regulatory"`) exist because law requires
them. The Party declaring a regulatory policy is not inventing a rule — they are
surfacing an existing legal requirement in a transaction-relevant context. A
`regulatory_reference` field is **required** for all regulatory policies and MUST
reference a specific requirement ID in the Jurisdiction Compliance Registry or a
specific sandbox flag ID.

ATOP validates regulatory policies against the Jurisdiction Compliance Registry:
- Does the cited requirement exist?
- Does it apply to this transaction configuration?
- Is a related sandbox flag active?
- Is the acknowledgment text mandated by the jurisdiction entry?

**Supplier policies** (`policy_basis: "supplier"`) exist because the Party chooses
to impose them as a condition of doing business. ATOP knows about supplier policies
only because the Party declared them. ATOP validates the structure of the declaration
but cannot validate the content against any external source. The Party has discretion
to waive or modify supplier policies; they cannot waive regulatory policies.

**Protocol policies** (`policy_basis: "protocol"`) are policies ATOP itself requires
all parties to accept as a condition of participation. They are defined in Section 9
and declared in every Party Record automatically upon registration. They are not
configurable by individual parties.

### 2.3 Regulatory vs. Supplier Policies — Processing Consequences

The following table shows how `policy_basis` determines processing at every stage:

| Aspect | Regulatory | Supplier | Protocol |
|---|---|---|---|
| Source of truth | Jurisdiction Compliance Registry | Party's own declaration | This specification |
| ATOP validates content? | Yes — against jurisdiction entry | No — structure only | N/A — defined here |
| Acknowledgment text source | Jurisdiction entry (may be mandated) | Party's own text | This specification |
| Party may waive? | No | Yes | No |
| Party may strengthen? | Yes — see Section 2.4 | Yes | No |
| Non-compliance consequences | Legal | Commercial | Protocol exclusion |
| Sandbox flag possible? | Yes — from jurisdiction entry | No | No |
| Automatically included? | Yes — if jurisdiction entry requires it | No — Party must declare | Yes — upon registration |

The most important row is **"Automatically included?"** A regulatory policy that is
required by the jurisdiction entry for this transaction configuration will be surfaced
by ATOP at INQUIRY regardless of whether the Party has explicitly declared it. The
jurisdiction entry is the authoritative source. The Party's explicit declaration
adds context — a specific acknowledgment text, an operational note — but cannot
remove the underlying requirement.

### 2.4 Layered Policies

A Party may declare a policy that builds on a regulatory floor with an additional
supplier restriction. This is common:

- The law requires minimum age 20 for alcohol service in Japan. The Party requires
  minimum age 25 for their exclusive sake tasting experience. The regulatory floor
  is 20; the supplier restriction is 25.

- The law requires a food establishment license. The Party additionally requires
  that any catering sub-supplier holds HACCP certification, which the law does not
  mandate for small operators. The regulatory floor is the establishment license;
  the supplier layer adds HACCP.

Layered policies are declared using the `exceeds_regulatory_minimum` flag and a
`regulatory_floor_reference`:

```json
{
  "policy_basis": "supplier",
  "exceeds_regulatory_minimum": true,
  "regulatory_floor_reference": "JP-DOM-ALCOHOL-001",
  "supplier_restriction": "Minimum age 25 for sake tasting experience",
  "regulatory_floor_summary": "Minimum age 20 under Japanese law"
}
```

When a layered policy is presented to a customer, both the regulatory floor and
the supplier restriction MUST be disclosed — the customer must understand which
part of the requirement is law and which part is the supplier's choice.

### 2.5 What ATOP Does and Does Not Do

ATOP **does**:
- Provide the schema for declaring policies of all types
- Validate that regulatory policy references exist in the jurisdiction entry
- Surface applicable regulatory policies automatically based on the transaction
  configuration, even if not explicitly declared by the Party
- Record policy acknowledgments in the Trust Chain with timestamp, actor identity,
  and the exact policy version acknowledged
- Block CONFIRMATION if required policy acknowledgments are missing
- Snapshot the policy version at CONFIRMATION so the confirmed booking is governed
  by the policy in effect at that moment

ATOP **does not**:
- Prescribe the content of supplier policies
- Determine whether a safety waiver is legally enforceable
- Validate that a customer actually holds a required credential (it records the
  declaration and the Party's confirmation at fulfillment)
- Issue visas or determine visa eligibility
- Take any position on the legal effect of any acknowledgment

---

## 3. Policy Type Taxonomy

Policy types describe the subject matter of a policy. Type is descriptive and used
for classification, filtering, and UI presentation. It does not determine processing —
`policy_basis` does. Every policy type can have `policy_basis: regulatory` or
`policy_basis: supplier` (except Type 8 which is always `protocol`).

### Type 1 — Party-to-Party Operational Policies

Conditions one registered Party places on transacting with another Party.

*Examples:*
- Activity Supplier requires that any Tour Operator booking group activities holds
  group liability insurance above a defined threshold
- Resort requires that the booking OTA has a data processing agreement in place
- Supplier requires that the booking Party holds a specific ATOP Trust Mark

*Applies to:* Other Parties in the transaction  
*Evaluation point:* INQUIRY — gate condition before CONFIGURATION begins  
*Regulatory basis possible:* Yes — e.g. a legally required data processing agreement
under GDPR [EU-GDPR] or APPI [JP-APPI]

### Type 2 — Customer Eligibility Policies

Conditions the customer (traveler) must meet to participate.

*Examples:*
- Minimum age (adult only; under-18 requires guardian)
- Maximum age (some activities have upper age limits for safety)
- Physical condition (fitness level, swimming ability, no recent surgery)
- Prior experience (intermediate ski level, valid scuba certification)
- Group composition (families only, no single-sex groups for certain venues)

*Applies to:* Customer  
*Evaluation point:* CONFIRMATION — customer must declare eligibility  
*Regulatory basis possible:* Yes — age restrictions imposed by law are regulatory;
age restrictions set by the supplier are supplier policies

**The regulatory/supplier distinction matters most here.** A minimum age of 20 for
alcohol in Japan is regulatory (`regulatory_reference: JP-DOM-ALCOHOL-001`). A
minimum age of 16 for a junior ski program is supplier preference. Both are Type 2
but processed differently — the regulatory one is surfaced automatically, the
supplier one only if declared.

### Type 3 — Customer Credential Policies

The customer must hold a specific credential. Splits into two sub-types:

**Type 3a — Required at booking time:** Customer must confirm they hold the
credential for CONFIRMATION to proceed. ATOP records the declaration. The Party
verifies the actual credential at fulfillment.

*Examples:*
- Valid passport with sufficient validity for the destination
- Visa for the destination country (regulatory; references jurisdiction entry)
- International driving permit for self-drive activities
- Dive certification (PADI Open Water minimum) for certain dives
- Professional accreditation for industry events

**Type 3b — Required at fulfillment:** Customer must present the credential
physically at the activity. Declared during PRE_ACTIVITY_COLLECTION. ATOP
records what will be required so the customer is informed before departure.

*Examples:*
- Driving license to be shown at car rental pickup
- Dive certification card at dive shop
- Vaccination certificate at border (regulatory)
- Age ID for alcohol-inclusive activities (regulatory)

*Applies to:* Customer  
*Evaluation point:* Type 3a at CONFIRMATION; Type 3b at PRE_ACTIVITY_COLLECTION  
*Regulatory basis possible:* Yes — visa requirements, vaccination requirements,
and age verification requirements are regulatory; supplier-imposed credential
requirements are supplier policies

**Visa requirements specifically:** ATOP declares that a visa requirement exists
and references the relevant jurisdiction entry or official government source.
Verification that the customer actually holds the correct visa is the customer's
responsibility. ATOP records that the customer was informed of the requirement
and acknowledged it. ATOP does not perform visa eligibility checking.

### Type 4 — Jurisdictional Compliance Policies

Legal requirements imposed by the destination or sale jurisdiction on the customer
or the transaction — distinct from licensing requirements on the Party.

*Examples:*
- Health declaration requirements at border
- Insurance requirements (some countries require travel insurance for entry)
- Data protection consent (GDPR lawful basis for EU customer data processing)
- Currency declaration requirements (some jurisdictions require declaring cash)
- Import/export restrictions on goods being transported

*Applies to:* Customer or transaction  
*Evaluation point:* CONFIRMATION  
*Policy basis:* Always `regulatory` — references jurisdiction entry  
*Note:* Type 4 policies are always surfaced automatically from the jurisdiction
entry when applicable. Explicit Party declaration adds context but is not required
for the policy to appear.

### Type 5 — Operational and Logistical Policies

Conditions for the activity to be executable. Not eligibility conditions — the
customer may be perfectly eligible but the activity cannot run without these
conditions being met.

*Examples:*
- Minimum group size (activity does not run below 4 people)
- Maximum group size (safety limit; statutory maximum for maritime activities
  is regulatory)
- Advance booking window (must book at least 48 hours ahead)
- Cancellation and no-show policy
- Weather-dependent cancellation terms
- Equipment: what the supplier provides vs. what the customer must bring
- Language: guide available in English and Japanese only
- Seasonality: activity only available in specific months

*Applies to:* Transaction configuration  
*Evaluation point:* CONFIGURATION — affects what can be offered in PROPOSAL  
*Regulatory basis possible:* Yes — maximum group sizes for maritime activities
are regulatory; minimum booking windows are supplier preference

### Type 6 — Data and Privacy Policies

Conditions governing how customer personal data is handled.

*Examples:*
- Data sharing consent: customer data will be shared with sub-suppliers to
  fulfill the booking
- Marketing consent: customer agrees to receive promotional communications
- Photography/filming consent: customer may appear in promotional material
- Health data processing: medical declarations are processed for safety purposes
- AI processing disclosure: an AI agent was involved in assembling this booking

*Applies to:* Customer  
*Evaluation point:* At or before CONFIRMATION  
*Regulatory basis possible:* Always check — GDPR lawful basis requirements
[EU-GDPR] and APPI [JP-APPI] make many data policies regulatory.
Consent for photography is typically supplier preference.

**AI processing disclosure** is a special case. Where an AI agent participated
in the booking, disclosure to the customer is required under ATOP Protocol Policy
(Type 8) regardless of whether any jurisdiction has yet mandated it. The EU AI Act
[EU-AIACT] Article 50 adds a regulatory layer for EU transactions.

### Type 7 — Safety and Liability Acknowledgment Policies

Conditions requiring the customer to acknowledge risks and accept conditions of
participation.

*Examples:*
- Activity risk acknowledgment: inherent risks of skiing, diving, mountaineering
- Liability scope: the supplier's liability is limited to direct losses from
  negligence; consequential losses excluded
- Emergency contact requirement: customer must provide emergency contact details
- Insurance requirement: customer must hold travel insurance covering the activity
- Medical fitness self-declaration: customer declares no contraindicated conditions
- Equipment condition: customer accepts equipment in its provided condition

*Applies to:* Customer  
*Evaluation point:* CONFIRMATION  
*Policy basis:* Almost always `supplier` — ATOP takes no position on legal
enforceability. The structure records that the acknowledgment was presented and
accepted. Whether that acknowledgment constitutes a legally enforceable waiver
in any jurisdiction is outside ATOP's scope.

*Exception:* Insurance requirements may be regulatory in some jurisdictions
(some countries require travel insurance for entry). Where regulatory, reference
the jurisdiction entry.

### Type 8 — Protocol-Level Policies

Policies ATOP itself requires all parties to accept as a condition of participation.
Defined in Section 9. Always `policy_basis: "protocol"`. Not configurable.

*Examples:*
- AI agent involvement disclosure to customers
- Trust Chain archival consent
- Duty of Care Declaration acceptance
- ATOP conformance acknowledgment

---

## 4. Policy Declaration Schema

### 4.1 Core Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/policy/declaration/v0.1",
  "type": "object",
  "required": ["policy_id", "policy_basis", "policy_type", "applies_to",
               "evaluation_point", "acknowledgment_required"],
  "properties": {
    "policy_id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+:[a-z0-9-]+:[a-z0-9-]+$",
      "description": "Format: {party_id_slug}:{policy_type_code}:{slug}. Example: myauberge:eligibility:adult-only"
    },
    "policy_basis": {
      "type": "string",
      "enum": ["regulatory", "supplier", "protocol"],
      "description": "Primary organizing field. Determines validation, text source, and enforcement."
    },
    "policy_type": {
      "type": "string",
      "enum": ["party_operational", "customer_eligibility", "customer_credential",
               "jurisdictional_compliance", "operational_logistical",
               "data_privacy", "safety_liability", "protocol"]
    },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "applies_to": {
      "type": "string",
      "enum": ["counterparty", "customer", "actor", "transaction", "all"]
    },
    "evaluation_point": {
      "type": "string",
      "enum": ["inquiry", "configuration", "proposal", "confirmation",
               "pre_activity_collection", "fulfillment", "any"]
    },
    "acknowledgment_required": { "type": "boolean" },
    "acknowledgment_config": {
      "$ref": "#/$defs/AcknowledgmentConfig"
    },
    "regulatory_reference": {
      "type": "string",
      "description": "Required when policy_basis = regulatory. Must be a valid requirement ID or sandbox flag ID from the Jurisdiction Compliance Registry.",
      "examples": ["JP-LIC-001", "EU-PKG-001", "JP-TRAVEL-LAW-SPLIT-SELLER"]
    },
    "exceeds_regulatory_minimum": {
      "type": "boolean",
      "description": "True when this is a supplier policy that builds on a regulatory floor."
    },
    "regulatory_floor_reference": {
      "type": "string",
      "description": "The regulatory requirement this supplier policy exceeds. Required when exceeds_regulatory_minimum is true."
    },
    "regulatory_floor_summary": {
      "type": "string",
      "description": "Plain language description of the regulatory floor, for customer disclosure."
    },
    "credential_type": {
      "type": "string",
      "description": "For Type 3 (customer_credential) policies: the credential type required."
    },
    "credential_sub_type": {
      "type": "string",
      "enum": ["required_at_booking", "required_at_fulfillment"],
      "description": "For Type 3 policies: when the credential must be presented."
    },
    "visa_reference": {
      "type": "object",
      "description": "For visa requirements: structured reference to official source.",
      "properties": {
        "destination_jurisdiction": { "type": "string" },
        "official_source_url": { "type": "string", "format": "uri" },
        "jurisdiction_entry_ref": { "type": "string" },
        "customer_verification_note": { "type": "string" }
      }
    },
    "applies_to_jurisdictions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "ISO 3166-1 alpha-2 codes. Empty means all jurisdictions."
    },
    "applies_to_product_types": {
      "type": "array",
      "items": { "type": "string" }
    },
    "applies_to_customer_types": {
      "type": "array",
      "items": { "type": "string" }
    },
    "delegatable": {
      "type": "boolean",
      "description": "Whether this policy can be delegated to the customer-facing party in a split-seller configuration. See Section 6."
    },
    "version": { "type": "string" },
    "effective_from": { "type": "string", "format": "date" },
    "supersedes": { "type": "string" }
  },
  "$defs": {
    "AcknowledgmentConfig": {
      "type": "object",
      "required": ["acknowledgment_type"],
      "properties": {
        "acknowledgment_type": {
          "type": "string",
          "enum": ["checkbox", "signed_declaration", "credential_declaration",
                   "implicit_by_confirmation"]
        },
        "text_source": {
          "type": "string",
          "enum": ["party_defined", "jurisdiction_entry", "protocol_defined"],
          "description": "For regulatory policies with mandated text, use jurisdiction_entry."
        },
        "text": {
          "type": "string",
          "description": "Acknowledgment text when text_source = party_defined."
        },
        "text_local": {
          "type": "string",
          "description": "Local language version. Required for regulatory policies in jurisdictions that mandate local language disclosure."
        },
        "requires_human_actor": {
          "type": "boolean",
          "description": "If true, acknowledgment cannot be provided by an AI agent — human Actor required."
        },
        "minimum_acknowledgment_timing": {
          "type": "string",
          "enum": ["before_booking", "at_proposal", "at_confirmation", "at_fulfillment"]
        }
      }
    }
  }
}
```

### 4.2 Schema Validation Rules

1. When `policy_basis = "regulatory"`, `regulatory_reference` is REQUIRED and
   MUST reference a valid entry in the Jurisdiction Compliance Registry.

2. When `exceeds_regulatory_minimum = true`, `regulatory_floor_reference` and
   `regulatory_floor_summary` are REQUIRED.

3. When `policy_type = "customer_credential"`, `credential_type` and
   `credential_sub_type` are REQUIRED.

4. When `acknowledgment_required = true`, `acknowledgment_config` is REQUIRED.

5. When `acknowledgment_config.text_source = "jurisdiction_entry"`, the Protocol
   Operator retrieves the acknowledgment text from the referenced jurisdiction entry
   at transaction time — the Party does not define it.

6. When `acknowledgment_config.requires_human_actor = true`, an AI agent MUST NOT
   provide the acknowledgment. The transaction MUST pause for human Actor input.

### 4.3 Policy Declaration Examples

**Example A — Regulatory adult-only (alcohol service, Japan)**

```json
{
  "policy_id": "myauberge:customer-eligibility:alcohol-age-jp",
  "policy_basis": "regulatory",
  "policy_type": "customer_eligibility",
  "title": "Minimum age for alcohol service",
  "applies_to": "customer",
  "evaluation_point": "confirmation",
  "acknowledgment_required": true,
  "acknowledgment_config": {
    "acknowledgment_type": "checkbox",
    "text_source": "party_defined",
    "text": "I confirm that all members of my party are aged 20 or over and understand that proof of age may be requested.",
    "text_local": "同行者全員が20歳以上であることを確認します。年齢確認を求められる場合があります。",
    "requires_human_actor": false,
    "minimum_acknowledgment_timing": "at_confirmation"
  },
  "regulatory_reference": "JP-DOM-ALCOHOL-001",
  "applies_to_jurisdictions": ["JP"],
  "version": "1.0",
  "effective_from": "2026-01-01"
}
```

**Example B — Supplier adult-only exceeding regulatory floor**

```json
{
  "policy_id": "sake-tour:customer-eligibility:age-25-minimum",
  "policy_basis": "supplier",
  "policy_type": "customer_eligibility",
  "title": "Minimum age 25 for premium sake tasting experience",
  "description": "Our premium sake tasting is designed for experienced adult palates. We set a minimum age of 25 as a business policy.",
  "applies_to": "customer",
  "evaluation_point": "confirmation",
  "acknowledgment_required": true,
  "acknowledgment_config": {
    "acknowledgment_type": "checkbox",
    "text_source": "party_defined",
    "text": "I confirm all participants are aged 25 or over. Japanese law requires a minimum age of 20 for alcohol. Our policy requires a minimum age of 25 for this experience.",
    "requires_human_actor": false,
    "minimum_acknowledgment_timing": "at_confirmation"
  },
  "exceeds_regulatory_minimum": true,
  "regulatory_floor_reference": "JP-DOM-ALCOHOL-001",
  "regulatory_floor_summary": "Japanese law prohibits alcohol service to persons under 20.",
  "applies_to_jurisdictions": ["JP"],
  "version": "1.0",
  "effective_from": "2026-01-01"
}
```

**Example C — Customer credential (visa requirement)**

```json
{
  "policy_id": "jp-resort:jurisdictional-compliance:visa-requirement",
  "policy_basis": "regulatory",
  "policy_type": "jurisdictional_compliance",
  "title": "Japan entry visa requirement",
  "description": "Visitors from certain nationalities require a visa to enter Japan. Customers are responsible for verifying and obtaining the correct visa before travel.",
  "applies_to": "customer",
  "evaluation_point": "confirmation",
  "acknowledgment_required": true,
  "acknowledgment_config": {
    "acknowledgment_type": "checkbox",
    "text_source": "party_defined",
    "text": "I confirm I have verified the visa requirements for my nationality for entry to Japan and will ensure I hold the correct documentation before travel. ATOP and the booking party are not responsible for denied entry due to visa non-compliance.",
    "requires_human_actor": false,
    "minimum_acknowledgment_timing": "at_confirmation"
  },
  "regulatory_reference": "JP-ENTRY-VISA-001",
  "visa_reference": {
    "destination_jurisdiction": "JP",
    "official_source_url": "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    "customer_verification_note": "Check MOFA Japan visa requirements for your nationality before booking."
  },
  "delegatable": true,
  "applies_to_jurisdictions": ["JP"],
  "version": "1.0",
  "effective_from": "2026-01-01"
}
```

**Example D — Safety waiver (ski activity)**

```json
{
  "policy_id": "ski-nagano:safety-liability:ski-activity-risk",
  "policy_basis": "supplier",
  "policy_type": "safety_liability",
  "title": "Ski activity risk acknowledgment",
  "description": "Skiing involves inherent risks of physical injury. Participants acknowledge these risks as a condition of participation.",
  "applies_to": "customer",
  "evaluation_point": "confirmation",
  "acknowledgment_required": true,
  "acknowledgment_config": {
    "acknowledgment_type": "signed_declaration",
    "text_source": "party_defined",
    "text": "I acknowledge that skiing involves inherent risks including collision, falls, and injury from terrain and weather conditions. I voluntarily accept these risks and confirm I am physically fit to participate. I understand that Nagano Ski Resort's liability is limited to losses caused by its direct negligence. ATOP records this acknowledgment but takes no position on its legal effect.",
    "requires_human_actor": true,
    "minimum_acknowledgment_timing": "at_confirmation"
  },
  "delegatable": true,
  "applies_to_jurisdictions": ["JP"],
  "version": "1.0",
  "effective_from": "2026-01-01"
}
```

**Example E — Data processing consent (GDPR)**

```json
{
  "policy_id": "eu-ota:data-privacy:gdpr-data-sharing",
  "policy_basis": "regulatory",
  "policy_type": "data_privacy",
  "title": "Personal data sharing with service providers",
  "applies_to": "customer",
  "evaluation_point": "confirmation",
  "acknowledgment_required": true,
  "acknowledgment_config": {
    "acknowledgment_type": "checkbox",
    "text_source": "party_defined",
    "text": "I consent to my personal data being shared with the accommodation, activity, and transport providers named in this booking for the purpose of fulfilling my reservation. Data will be processed in accordance with our Privacy Policy.",
    "requires_human_actor": false,
    "minimum_acknowledgment_timing": "at_confirmation"
  },
  "regulatory_reference": "EU-CP-003",
  "applies_to_jurisdictions": ["EU"],
  "version": "1.0",
  "effective_from": "2026-01-01"
}
```

---

## 5. Policy Acknowledgment

### 5.1 Acknowledgment Record Schema

Every policy acknowledgment is recorded in the Trust Chain Record. The acknowledgment
record captures exactly what was presented, when, by whom, and in what context.

```json
{
  "PolicyAcknowledgment": {
    "required": ["acknowledgment_id", "policy_id", "policy_version",
                 "acknowledged_by", "acknowledged_at", "acknowledgment_type",
                 "text_presented", "trust_chain_id"],
    "properties": {
      "acknowledgment_id": { "type": "string" },
      "policy_id": { "type": "string" },
      "policy_version": { "type": "string" },
      "policy_basis": { "type": "string" },
      "acknowledged_by": {
        "type": "object",
        "properties": {
          "party_id": { "type": "string" },
          "actor_id": { "type": "string" },
          "actor_type": {
            "type": "string",
            "description": "Must be human for policies with requires_human_actor = true"
          }
        }
      },
      "acknowledged_at": { "type": "string", "format": "date-time" },
      "acknowledgment_type": { "type": "string" },
      "text_presented": {
        "type": "string",
        "description": "The exact text shown to the acknowledging party. Immutable after recording."
      },
      "text_presented_local": { "type": "string" },
      "trust_chain_id": { "type": "string" },
      "workflow_state_at_acknowledgment": { "type": "string" },
      "policy_snapshot_ref": {
        "type": "string",
        "description": "Reference to the policy version snapshot in effect at this acknowledgment."
      }
    }
  }
}
```

### 5.2 The Acknowledgment Principle

The acknowledgment record captures **what was actually presented** in `text_presented`,
not just a reference to the policy. This is the non-repudiation anchor for policy
acknowledgments: it proves the customer saw the exact text they acknowledged, even
if the policy is later updated.

For regulatory policies with mandated text (`text_source: "jurisdiction_entry"`),
the Protocol Operator retrieves the current text from the jurisdiction entry at
transaction time and populates `text_presented`. The Party does not define the text —
the jurisdiction entry does.

### 5.3 AI Agents and Acknowledgment

An AI agent MUST NOT provide a policy acknowledgment on behalf of a customer for
policies where `acknowledgment_config.requires_human_actor = true`. When the
transaction reaches a policy requiring human acknowledgment, the workflow MUST pause
and present the policy to the human customer or the human Actor with customer
authorization.

An AI agent MAY provide acknowledgments on behalf of a Party (not the customer) for
operational and data policies where the Party has pre-authorized the agent to do so
in its Agent Authorization Declaration.

---

## 6. Policy Inheritance and Delegation

### 6.1 The Problem

In a multi-party transaction — particularly a split-seller configuration — each
Party has their own policies. The customer is typically in a direct conversation
with one Party (the accommodation supplier, or the OTA) but has obligations to
multiple parties (the ski resort, the taxi company, the restaurant). 

Without a delegation mechanism, one of two bad outcomes occurs:
- The customer is presented with disconnected policy acknowledgments from multiple
  parties in different contexts with no coherent flow
- Policies from non-customer-facing parties are never presented at all

### 6.2 The Delegation Model

A Party may mark a policy as `delegatable: true`. This signals that in a multi-party
transaction, the customer-facing Party may present this policy on behalf of the
declaring Party.

When a policy is delegated:
1. The customer-facing Party presents the policy as part of their CONFIRMATION flow
2. The acknowledgment record attributes the acknowledgment to the policy's declaring
   Party, not the presenting Party
3. The Trust Chain Record shows both: `presented_by` (the customer-facing party)
   and `policy_owner` (the declaring party)
4. The acknowledgment is as valid as if the declaring Party had presented it directly

Policies with `delegatable: false` (or the field absent) MUST be presented directly
by the declaring Party. Where this is not possible in the transaction configuration,
the declaring Party must be added to the customer communication flow.

### 6.3 Protocol Operator Responsibility

The Protocol Operator is responsible for ensuring that all required policy
acknowledgments are collected before CONFIRMATION — whether through delegation
or direct presentation. This is an enforcement responsibility, not merely a
coordination one: CONFIRMATION MUST be blocked if any required acknowledgment
is missing.

---

## 7. Policy Versioning

### 7.1 Policy Snapshot at CONFIRMATION

At CONFIRMATION, the Protocol Operator snapshots the exact version of every
policy that was acknowledged. The snapshot reference is recorded in the Trust
Chain Record alongside the acknowledgment record.

This snapshot ensures:
- The confirmed booking is governed by the policies in effect at CONFIRMATION
- A policy update after CONFIRMATION does not retroactively change the customer's
  obligations or the Party's obligations under that booking
- Disputes are resolved against the snapshotted policy, not the current version

### 7.2 Policy Version Fields

Every Policy Declaration MUST include:
- `version` — semantic version string
- `effective_from` — the date from which this version applies
- `supersedes` — the policy_id:version this replaces, if applicable

### 7.3 Handling Policy Updates During Active Transactions

If a Party updates a policy after a customer has reached PROPOSAL but before
CONFIRMATION:
- Transactions in CONFIGURATION or PROPOSAL that reference the old policy version
  continue with the old version
- New INQUIRYs after the `effective_from` date of the new version use the new version
- The Protocol Operator MUST NOT silently substitute a new policy version into an
  in-progress transaction without notifying all parties

---

## 8. Enforcement Points

The Protocol Operator enforces policy requirements at specific workflow states.
The following table defines what is checked at each state and what the enforcement
action is when a required acknowledgment is missing.

| Workflow State | Enforcement Action | Missing Acknowledgment Result |
|---|---|---|
| INQUIRY | Evaluate Type 1 (party-operational) policies | INQUIRY rejected with policy_gate_failure |
| CONFIGURATION | Evaluate Type 5 (operational/logistical) policies | Configuration options restricted |
| PROPOSAL | Surface all pending acknowledgments to customer | PROPOSAL includes policy acknowledgment requests |
| CONFIRMATION | Verify all required acknowledgments are present | CONFIRMATION blocked |
| PRE_ACTIVITY_COLLECTION | Verify Type 3b (credential at fulfillment) declarations | Customer notified of required documents |
| FULFILLMENT | Record Type 3b credential presentation by Party | Activity supplier confirms credential presented |

### 8.1 The CONFIRMATION Gate

CONFIRMATION is the hard enforcement point. Before any binding signature is accepted,
the Protocol Operator MUST verify:

1. All policies with `evaluation_point: "confirmation"` have acknowledgment records
   in the Trust Chain
2. All policies with `requires_human_actor: true` were acknowledged by a human Actor
3. For regulatory policies, the acknowledgment text matches the current jurisdiction
   entry text (or the snapshotted text if the entry was updated mid-transaction)
4. No policy has expired between its acknowledgment and CONFIRMATION

If any check fails, CONFIRMATION is blocked and the specific missing acknowledgment
is returned to the initiating party.

### 8.2 Automatic Policy Surfacing

The Protocol Operator MUST surface applicable regulatory policies at INQUIRY even
if the Party has not explicitly declared them, when:
- The transaction configuration triggers a requirement in the jurisdiction entry
- The requirement involves a customer acknowledgment

This ensures that regulatory protections are not lost because a Party failed to
include them in their Policy Declarations. The jurisdiction entry is the authoritative
source; the Party's declaration is supplementary.

---

## 9. Protocol-Level Policies

Protocol-level policies are declared in every Party Record automatically upon
registration. They are not configurable by individual parties and cannot be removed.

### PP-001 — AI Agent Involvement Disclosure

Where an AI agent participated in any part of the booking process, the customer
MUST be informed before CONFIRMATION.

*Disclosure text:* "An AI agent assisted in assembling this booking on behalf of
[Party name]. All bookings were reviewed and confirmed by a human representative
before submission. The AI agent operated under a declared authorization scope and
all its actions are recorded in the booking's Trust Chain."

*When applicable:* Any transaction where an AI agent with actor_type = "ai_agent"
appears in the Trust Chain state history  
*Requires human acknowledgment:* No — checkbox acknowledgment sufficient  
*Regulatory reference:* EU-AI-ACT-TRAVEL sandbox flag (EU transactions)

### PP-002 — Trust Chain Archival Consent

Customer data associated with this transaction will be retained in the Trust Chain
archive for the minimum retention period applicable to the relevant jurisdiction.

*Disclosure text:* "Records of this booking, including your identity verification,
policy acknowledgments, and booking history, will be retained for a minimum of
[jurisdiction-specific period] in compliance with applicable law. You may request
access to your records in accordance with applicable data protection law."

*When applicable:* All transactions  
*Requires human acknowledgment:* No — implicit by CONFIRMATION  
*Regulatory reference:* EU-GDPR, JP-APPI (as applicable)

### PP-003 — Duty of Care Declaration Acceptance

All Parties in the transaction accept their declared Duty of Care obligations as
defined in the Trust Chain Record.

*Applies to:* All Parties (not the customer)  
*When applicable:* All transactions  
*Requires human acknowledgment:* No — binding signature at CONFIRMATION covers this  
*Note:* This is a Party-level obligation, not a customer acknowledgment.

### PP-004 — ATOP Conformance Acknowledgment

All Parties confirm they operate in conformance with the ATOP Protocol Specification
version in effect at transaction time.

*Applies to:* All Parties  
*When applicable:* All transactions  
*Requires human acknowledgment:* No — covered by Party registration

---

## 10. Normative References

See `references.md` for full citation details.

| Tag | Title | Relevance |
|---|---|---|
| [OIDFED] | OpenID Federation 1.0 | Policy acknowledgments recorded in Trust Chain; Trust Chain is OpenID Federation artifact |
| [FAPI2MSG] | FAPI 2.0 Message Signing | Binding signature at CONFIRMATION covers PP-003 |
| [RFC2119] | Key Words for RFCs | Normative language |
| [RFC8174] | Ambiguity of Uppercase | Normative language clarification |
| [JSONSCHEMA] | JSON Schema 2020-12 | Policy Declaration and Acknowledgment schemas |
| [ISO8601] | ISO 8601 | Date and datetime fields |

---

## 11. Informative References

| Tag | Title | Relevance |
|---|---|---|
| [EU-GDPR] | GDPR | Type 6 data privacy policies; PP-002 archival consent |
| [EU-AIACT] | EU AI Act | PP-001 AI disclosure; EU-AI-ACT-TRAVEL sandbox flag |
| [EU-PTD] | EU Package Travel Directive | Type 4 jurisdictional compliance policies |
| [JP-APPI] | Japan APPI | Type 6 data privacy policies; PP-002 archival consent |
| [JP-TAA] | Japan Travel Agency Act | Regulatory basis for Type 2 and Type 4 policies in JP |

---

*Document status: Draft v0.1 — March 2026*  
*This document completes Layer 1 — Identity and Trust of the ATOP Protocol.*  
*Next: Layer 2 — Catalogue Specification v0.1*  
*Maintainer: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
