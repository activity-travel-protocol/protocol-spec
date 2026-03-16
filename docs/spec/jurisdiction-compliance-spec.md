# ATOP Jurisdiction Compliance Registry Specification

**Version:** 0.2 (Draft)  
**Status:** Layer 1 — Identity and Trust  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**Depends on:** Architecture Specification v0.1, Party Registry Specification v0.2  
**Related documents:** Jurisdiction Entries v0.1, Global Jurisdiction Comparison v0.1  
**License:** Apache 2.0  

---

## Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [Foundational Framework](#2-foundational-framework)
3. [The Jurisdiction Entry Schema](#3-the-jurisdiction-entry-schema)
4. [Licensing Requirements](#4-licensing-requirements)
5. [Consumer Protection Requirements](#5-consumer-protection-requirements)
6. [Packaging Obligations](#6-packaging-obligations)
7. [Disclosure Requirements](#7-disclosure-requirements)
8. [Associated Regulatory Domains](#8-associated-regulatory-domains)
9. [The Regulatory Sandbox Flag](#9-the-regulatory-sandbox-flag)
10. [The Compliance Check Operation](#10-the-compliance-check-operation)
11. [Government Advisory Sources](#11-government-advisory-sources)
12. [Registry Operations](#12-registry-operations)
13. [Versioning and Governance](#13-versioning-and-governance)

---

## 1. Purpose of This Document

The Jurisdiction Compliance Registry answers the question every ATOP participant must
answer before executing a transaction:

**For this Party, in this role, selling this product, to this customer, in this
jurisdiction — what does compliance require?**

This specification defines the schemas, mechanisms, and operations of the Registry. It
does not contain the jurisdiction entries themselves — those are maintained in the
companion **Jurisdiction Entries v0.1**, versioned separately so regulatory updates do
not trigger schema changes.

The companion **Global Jurisdiction Comparison v0.1** is for regulators, industry
stakeholders, and policy audiences who need to understand the landscape ATOP operates
within, not the technical implementation.

---

## 2. Foundational Framework

### 2.1 Compliance as Transaction Configuration

ATOP evaluates compliance against a **transaction configuration** — the combination of:

- The roles all parties hold in the transaction
- The product type being sold
- The jurisdiction where the product is sold (point-of-sale jurisdiction)
- The jurisdiction where it is consumed (destination jurisdiction)
- The customer type (consumer, corporate, group)

The same Party selling the same product may be compliant in one jurisdiction and
non-compliant in another. A product sold legally to a corporate buyer may require
additional protections for a leisure consumer. The Registry evaluates all dimensions.

### 2.2 Travel Law and Associated Regulatory Domains

Travel law is the primary domain: Travel Agency Acts, Package Travel Directives, Seller
of Travel statutes. But activity-based travel is unavoidably multi-domain. A single
ski trip touches the Travel Agency Act, hotel licensing law, road transport regulations,
food safety law, municipal slope safety ordinances, and personal data protection law
simultaneously.

ATOP addresses this through a **two-tier model**:

**Tier 1 — Core Associated Domains.** Food safety, ground transport, and maritime
operations are defined as core domains with full schemas, canonical credential types,
and cross-jurisdiction authority references. These cover the most common non-travel-law
requirements in activity-based bookings.

**Tier 2 — Extended Domains.** Any other regulatory domain — ski safety, fire safety,
guide licensing, environmental protection, healthcare — is declared using a generic
reference structure. The Party names the domain, identifies the governing authority,
and specifies the required credential. ATOP provides the declaration framework;
implementors verify the detail.

### 2.3 What ATOP Does and Does Not Do

ATOP MUST:
- Make every applicable requirement visible to all parties before CONFIRMATION
- Record in the Trust Chain whether requirements were met at booking time
- Flag non-compliant configurations visibly in the Trust Chain
- Activate the Regulatory Sandbox mechanism for gray zones

ATOP MUST NOT claim:
- That a compliant-flagged transaction is legally compliant under all applicable law
- That its entries substitute for jurisdiction-specific legal advice

Implementations SHOULD warn parties when a transaction is flagged `non_compliant` or
`sandbox_active` and SHOULD require explicit acknowledgment before CONFIRMATION.

### 2.4 Normative Language and Schema Reference

RFC 2119 key words apply: MUST, MUST NOT, REQUIRED, SHOULD, MAY.

Schema language: JSON Schema 2020-12. Normative schemas at
`atop-protocol/atop-spec/schemas/compliance/`. Inline schemas in this document are
illustrative; repository schemas are authoritative.

---

## 3. The Jurisdiction Entry Schema

### 3.1 Entry Structure

```
JurisdictionEntry
├── jurisdiction_code               ISO 3166-1 alpha-2
├── jurisdiction_name
├── entry_version                   Versioned independently from this spec
├── entry_status                    full | partial | framework | authoritative
├── last_updated
├── co_maintained_by                ATOP party_id of co-maintaining regulatory body
├── primary_regulatory_body
├── licensing_requirements[]        Section 4
├── consumer_protection[]           Section 5
├── packaging_obligations[]         Section 6
├── disclosure_requirements[]       Section 7
├── associated_regulatory_domains[] Section 8
├── sandbox_flags[]                 Section 9
└── government_advisory_sources[]   Section 11
```

### 3.2 Entry Status Values

| Status | Meaning | Production Use |
|---|---|---|
| `framework` | Schema structure only, no content | No |
| `partial` | Some sections complete; gaps explicitly flagged | With caution |
| `full` | All sections complete | Yes |
| `authoritative` | Co-maintained with jurisdiction's primary regulatory body | Highest confidence |

### 3.3 Jurisdiction Entry Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.atop-protocol.org/compliance/jurisdiction-entry/v0.2",
  "type": "object",
  "required": ["jurisdiction_code", "jurisdiction_name", "entry_version",
               "entry_status", "last_updated", "primary_regulatory_body"],
  "properties": {
    "jurisdiction_code": { "type": "string", "pattern": "^[A-Z]{2}$" },
    "jurisdiction_name": { "type": "string" },
    "entry_version": { "type": "string" },
    "entry_status": {
      "type": "string",
      "enum": ["framework", "partial", "full", "authoritative"]
    },
    "last_updated": { "type": "string", "format": "date" },
    "co_maintained_by": { "type": "string" },
    "primary_regulatory_body": {
      "type": "object",
      "required": ["name", "website"],
      "properties": {
        "name": { "type": "string" },
        "name_local": { "type": "string" },
        "website": { "type": "string", "format": "uri" },
        "atop_party_id": { "type": "string" }
      }
    }
  }
}
```

---

## 4. Licensing Requirements

Answers: *for this role and product type in this jurisdiction, which license is
required, from which authority, at what assurance level?*

### 4.1 Schema

```json
{
  "LicensingRequirement": {
    "required": ["requirement_id", "trigger", "applies_to_roles",
                 "required_credential", "licensing_authority", "legal_basis"],
    "properties": {
      "requirement_id": {
        "type": "string", "pattern": "^[A-Z]{2}-LIC-[0-9]{3}$"
      },
      "description": { "type": "string" },
      "trigger": {
        "type": "object",
        "properties": {
          "selling_roles": { "type": "array", "items": { "type": "string" } },
          "product_types": {
            "type": "array",
            "items": { "type": "string",
              "enum": ["accommodation_only", "activity_only", "transport_only",
                      "package_two_components", "package_three_or_more", "any"] }
          },
          "customer_types": { "type": "array", "items": { "type": "string" } },
          "sale_jurisdiction": { "type": "string" },
          "consumption_jurisdiction": { "type": "string" }
        }
      },
      "applies_to_roles": { "type": "array", "items": { "type": "string" } },
      "required_credential": {
        "type": "object",
        "properties": {
          "credential_type": { "type": "string" },
          "min_assurance_level": { "type": "integer", "minimum": 1, "maximum": 4 },
          "license_class": { "type": "string" },
          "notes": { "type": "string" }
        }
      },
      "licensing_authority": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "name_local": { "type": "string" },
          "website": { "type": "string" },
          "atop_party_id": { "type": "string" }
        }
      },
      "legal_basis": {
        "type": "object",
        "required": ["statute"],
        "properties": {
          "statute": { "type": "string" },
          "article": { "type": "string" },
          "url": { "type": "string" }
        }
      },
      "sandbox_flag_ref": { "type": "string" }
    }
  }
}
```

---

## 5. Consumer Protection Requirements

Answers: *what financial protection must be in place for the customer?*

The three primary mechanisms: **insolvency protection** (refund if seller becomes
insolvent before the trip), **liability insurance** (covers harm during the trip),
**bonding or trust accounts** (holds customer funds separately).

```json
{
  "ConsumerProtectionRequirement": {
    "required": ["requirement_id", "protection_type", "trigger",
                 "applies_to_roles", "minimum_coverage", "legal_basis"],
    "properties": {
      "requirement_id": { "type": "string" },
      "description": { "type": "string" },
      "protection_type": {
        "type": "string",
        "enum": ["insolvency_protection", "liability_insurance",
                 "bonding", "trust_account", "payment_protection"]
      },
      "trigger": {
        "type": "object",
        "properties": {
          "product_types": { "type": "array", "items": { "type": "string" } },
          "minimum_value_usd": { "type": "number" },
          "advance_payment_required": { "type": "boolean" },
          "customer_types": { "type": "array", "items": { "type": "string" } }
        }
      },
      "applies_to_roles": { "type": "array", "items": { "type": "string" } },
      "minimum_coverage": {
        "type": "object",
        "properties": {
          "amount": { "type": "number" },
          "currency": { "type": "string" },
          "per": { "type": "string", "enum": ["transaction", "customer", "year"] },
          "notes": { "type": "string" }
        }
      },
      "legal_basis": { "type": "object" }
    }
  }
}
```

---

## 6. Packaging Obligations

Answers: *at what point does combining services create a regulated package, and what
additional obligations does that trigger?*

Crossing the packaging threshold typically triggers: insolvency protection, mandatory
pre-trip information, price revision limits, right of transfer, significant alteration
rights, and termination rights. The exact threshold and obligations vary by jurisdiction
and are defined in the Jurisdiction Entries.

```json
{
  "PackagingObligation": {
    "required": ["obligation_id", "threshold", "obligations_triggered"],
    "properties": {
      "obligation_id": { "type": "string" },
      "description": { "type": "string" },
      "threshold": {
        "type": "object",
        "properties": {
          "minimum_component_types": { "type": "integer" },
          "component_types_required": {
            "type": "array", "items": { "type": "string" }
          },
          "pricing_condition": {
            "type": "string",
            "enum": ["inclusive_price", "total_price", "any_combined_price", "any"]
          },
          "duration_condition": { "type": "string" },
          "single_seller_required": { "type": "boolean" },
          "notes": { "type": "string" }
        }
      },
      "obligations_triggered": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "obligation_type": {
              "type": "string",
              "enum": ["insolvency_protection", "pre_trip_information",
                      "price_revision_limit", "right_of_transfer",
                      "significant_alteration_rights", "termination_rights",
                      "liability_for_performance", "assistance_obligation"]
            },
            "description": { "type": "string" },
            "legal_basis": { "type": "object" }
          }
        }
      },
      "split_seller_exemption": {
        "type": "object",
        "properties": {
          "available": { "type": "boolean" },
          "conditions": { "type": "string" },
          "sandbox_flag_ref": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 7. Disclosure Requirements

Answers: *what must the customer be told, when, and in what form?*

Disclosures map to ATOP workflow states. Pre-contractual information is delivered at
or before PROPOSAL. The confirmation document is generated at CONFIRMATION.
Pre-departure information is delivered in the READY state.

Two disclosure types are added in v0.2 beyond what most travel frameworks define:
`split_seller_notice` (required when JP-TRAVEL-LAW-SPLIT-SELLER or equivalent sandbox
flag is active) and `ai_agent_disclosure` (required where jurisdiction mandates
disclosure that an AI agent participated in the booking).

```json
{
  "DisclosureRequirement": {
    "required": ["requirement_id", "disclosure_type", "trigger",
                 "content_required", "delivery_timing", "legal_basis"],
    "properties": {
      "requirement_id": { "type": "string" },
      "description": { "type": "string" },
      "disclosure_type": {
        "type": "string",
        "enum": ["pre_contractual_information", "confirmation_document",
                 "voucher", "cancellation_terms", "consumer_rights_notice",
                 "seller_identity", "insurance_information", "emergency_contact",
                 "data_protection_notice", "split_seller_notice",
                 "ai_agent_disclosure"]
      },
      "trigger": {
        "type": "object",
        "properties": {
          "product_types": { "type": "array", "items": { "type": "string" } },
          "customer_types": { "type": "array", "items": { "type": "string" } },
          "transaction_value_threshold_usd": { "type": "number" },
          "sandbox_flags_active": { "type": "array", "items": { "type": "string" } }
        }
      },
      "applies_to_roles": { "type": "array", "items": { "type": "string" } },
      "content_required": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "field": { "type": "string" },
            "description": { "type": "string" },
            "mandatory": { "type": "boolean" }
          }
        }
      },
      "delivery_timing": {
        "type": "string",
        "enum": ["before_booking", "at_proposal", "at_confirmation",
                 "before_departure", "at_checkin", "on_demand"]
      },
      "delivery_format": { "type": "array", "items": { "type": "string" } },
      "language_requirements": { "type": "string" },
      "atop_workflow_state": { "type": "string" },
      "legal_basis": { "type": "object" }
    }
  }
}
```

---

## 8. Associated Regulatory Domains

### 8.1 Why This Section Exists

Travel law governs who can sell travel. But activity-based travel touches many
regulatory domains that travel law does not address. Every activity type in ATOP
potentially brings with it a set of non-travel regulatory requirements:

| Activity | Associated Domains |
|---|---|
| Restaurant / tour lunch | Food safety law, alcohol licensing |
| Taxi, bus, shuttle | Road transport operator licensing, driver hours |
| Boat tour, diving, fishing charter | Maritime authority, coast guard, vessel safety |
| Ski resort | Municipal slope safety, lift inspection, ski patrol |
| Guided hike or mountaineering | Guide licensing (where required), wilderness permits |
| Hotel event catering | Food safety, fire safety, occupancy limits |
| Beach resort | Coast guard jurisdiction, environmental protection zones |

ATOP cannot be a comprehensive database of every regulation in every domain. It can
provide a declaration framework — a structured way for parties to declare which
domains apply to their activity type and what credentials they hold. The two-tier model
below defines how.

### 8.2 The Two-Tier Model

**Tier 1 — Core Domains** are fully specified within this document. Core domains are
those that appear most frequently across ATOP activity types, are well-defined in all
primary ATOP jurisdictions, and have canonical credential types that can be normalized
across jurisdictions. Three core domains are defined in v0.2: food safety, ground
transport, and maritime.

**Tier 2 — Extended Domains** use a generic reference structure. Any regulatory domain
not in Tier 1 is declared by identifying the domain type, the governing authority,
the activity types it applies to, and the required credentials. Content is provided
by the Party or the jurisdiction entry author; ATOP validates the structure.

### 8.3 Shared Schema for All Domain Entries

```json
{
  "AssociatedRegulatoryDomain": {
    "required": ["domain_id", "domain_type", "tier",
                 "applies_to_activity_types", "governing_authority",
                 "required_credentials"],
    "properties": {
      "domain_id": {
        "type": "string",
        "pattern": "^[A-Z]{2}-DOM-[A-Z]+-[0-9]{3}$",
        "description": "Format: {JJ}-DOM-{TYPE}-{NNN}. Example: JP-DOM-FOOD-001"
      },
      "domain_type": {
        "type": "string",
        "enum": ["food_safety", "ground_transport", "maritime", "aviation",
                 "slope_safety", "fire_safety", "guide_licensing", "environmental",
                 "healthcare", "alcohol", "data_protection", "other"]
      },
      "tier": { "type": "integer", "enum": [1, 2] },
      "description": { "type": "string" },
      "applies_to_activity_types": {
        "type": "array", "items": { "type": "string" }
      },
      "governing_authority": {
        "type": "object",
        "required": ["name", "jurisdiction"],
        "properties": {
          "name": { "type": "string" },
          "name_local": { "type": "string" },
          "jurisdiction": { "type": "string" },
          "website": { "type": "string" },
          "atop_party_id": { "type": "string" }
        }
      },
      "required_credentials": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["credential_type", "min_assurance_level", "applies_to_roles"],
          "properties": {
            "credential_type": { "type": "string" },
            "min_assurance_level": { "type": "integer" },
            "applies_to_roles": { "type": "array", "items": { "type": "string" } },
            "required": { "type": "boolean" },
            "notes": { "type": "string" }
          }
        }
      },
      "legal_basis": { "type": "object" },
      "sandbox_flag_ref": { "type": "string" }
    }
  }
}
```

### 8.4 Tier 1 — Food Safety Domain

**Applies to activity types:** restaurant, catering, cooking_class, tour_with_meals,
conference_catering, food_tour, hotel_breakfast, welcome_dinner

Food safety regulation governs any party preparing, handling, or serving food.
In ATOP context: restaurants that are stops on a tour itinerary, hotel catering for
conferences, cooking class operators, food tour guides, and any Activity Supplier
providing meals as part of their service.

**Canonical credential types for food safety:**

| Credential Type | Description | Typical Assurance Level |
|---|---|---|
| `FOOD_HANDLER_LICENSE` | Individual food handler certification | L2 |
| `FOOD_ESTABLISHMENT_LICENSE` | Premises license to operate a food business | L2–L3 |
| `HACCP_CERTIFICATION` | Hazard Analysis Critical Control Points compliance | L3 |
| `FOOD_ALLERGY_MANAGEMENT_CERT` | Allergen management certification | L2 |

**Cross-jurisdiction authority references:**

| Jurisdiction | Primary Authority | Key Statute | HACCP Mandatory? |
|---|---|---|---|
| JP | Prefectural public health authorities | Food Sanitation Act (食品衛生法) | Yes, for large operators |
| EU | Member state food safety authorities | Regulation (EC) 852/2004 | Yes, above micro-enterprise |
| UK | Local Authority Environmental Health | Food Safety Act 1990; Food Hygiene Regulations 2006 | Yes |
| US | State health departments (FDA model code) | FDA Food Code (model, state-adopted) | Yes, above threshold |

### 8.5 Tier 1 — Ground Transport Domain

**Applies to activity types:** taxi, private_hire, bus, shuttle, minibus,
guided_driving_tour, transfer_service

Ground transport regulation governs commercial passenger vehicles and their operators.
In ATOP context: taxis and private hire vehicles for guest transfers, tour buses,
resort shuttle services, and any Transport Supplier carrying customers.

**Canonical credential types for ground transport:**

| Credential Type | Description | Typical Assurance Level |
|---|---|---|
| `TRANSPORT_OPERATOR_LICENSE` | Commercial passenger transport operator license | L2–L3 |
| `DRIVER_LICENSE` | Professional commercial driver license | L2 |
| `VEHICLE_ROADWORTHINESS_CERT` | Vehicle safety / roadworthiness certificate | L2 |
| `VEHICLE_INSURANCE` | Commercial passenger vehicle insurance | L2 |
| `DRIVER_HOUR_LOG` | Compliance record for driver working hours | L2 |

**Critical ATOP operational note — driver hours:** Driver hour limits are a hard
constraint on itinerary feasibility, not merely a compliance checkbox. When a
TRANSPORT_SUPPLIER declares driver availability windows in their Capability Declaration,
the ATOP Feasibility Check MUST validate that the proposed itinerary does not require
a driver to exceed legal working hours. An itinerary that appears feasible from a
routing perspective may be non-compliant from a driver hours perspective.

**Cross-jurisdiction authority references:**

| Jurisdiction | Primary Authority | Key Statute | Driver Hours Limit |
|---|---|---|---|
| JP | Regional Transport Bureaus (MLIT) | Road Transportation Act (道路運送法) | 13h/day, 65h/week |
| EU | National transport ministries | Regulation (EC) 561/2006 | 9h/day (10h twice/week), 56h/week |
| UK | Driver and Vehicle Licensing Agency (DVLA) | Road Traffic Act 1988 | EU rules retained post-Brexit for HGV; PSV 10h/day |
| US | Federal Motor Carrier Safety Administration | 49 CFR Part 395 | 10h driving after 8h off-duty |

### 8.6 Tier 1 — Maritime Domain

**Applies to activity types:** boat_tour, diving, snorkeling, kayaking_guided,
fishing_charter, yacht_charter, water_taxi, coastal_tour, whale_watching,
paddleboard_tour, sailing_lesson

Maritime regulation governs commercial passenger vessels and their operators.
In ATOP context: boat tours, diving and snorkeling operators, fishing charters,
coastal tours, and any water-based activity operated from a vessel.

**Canonical credential types for maritime:**

| Credential Type | Description | Typical Assurance Level |
|---|---|---|
| `VESSEL_REGISTRATION` | Official vessel registration | L2–L3 |
| `VESSEL_SAFETY_CERT` | Seaworthiness and safety equipment certificate | L2–L3 |
| `MARITIME_OPERATOR_LICENSE` | Commercial passenger vessel operator license | L2–L3 |
| `MASTER_CERTIFICATE` | Vessel master / skipper qualification | L2–L3 |
| `MARINE_LIABILITY_INSURANCE` | Commercial marine passenger liability insurance | L2 |
| `COAST_GUARD_INSPECTION_CERT` | Coast guard annual inspection certificate | L2–L3 |

**Cross-jurisdiction authority references:**

| Jurisdiction | Primary Authority | Key Statute | Annual Inspection Required? |
|---|---|---|---|
| JP | Japan Coast Guard (海上保安庁) | Marine Transportation Act (海上運送法) | Yes |
| EU | Member state maritime authorities; EMSA oversight | Directive 2009/45/EC | Yes |
| UK | Maritime and Coastguard Agency (MCA) | Merchant Shipping Act 1995 | Yes |
| US | United States Coast Guard (USCG) | 46 CFR (Title 46) | Yes |

### 8.7 Tier 2 — Extended Domain Declaration Examples

The following examples show how any domain beyond the three core domains is declared:

**Ski Slope Safety (JP-DOM-SLOPE-001)**
```json
{
  "domain_id": "JP-DOM-SLOPE-001",
  "domain_type": "slope_safety",
  "tier": 2,
  "description": "Municipal regulations governing ski lift operations, slope
    classification, patrol requirements, and emergency response planning.",
  "applies_to_activity_types": ["skiing", "snowboarding", "ski_resort"],
  "governing_authority": {
    "name": "Municipal government (varies by resort location)",
    "name_local": "市区町村",
    "jurisdiction": "JP",
    "website": "https://www.mlit.go.jp"
  },
  "required_credentials": [
    {
      "credential_type": "SKI_SLOPE_SAFETY_INSPECTION",
      "min_assurance_level": 2,
      "applies_to_roles": ["ACTIVITY_SUPPLIER"],
      "required": true,
      "notes": "Annual municipal inspection. Requirements vary by prefecture."
    },
    {
      "credential_type": "SKI_PATROL_CERTIFICATION",
      "min_assurance_level": 2,
      "applies_to_roles": ["ACTIVITY_SUPPLIER"],
      "required": true,
      "notes": "Qualified ski patrol required on all open slopes."
    }
  ],
  "legal_basis": {
    "statute": "Municipal safety ordinances; MLIT guidelines",
    "notes": "No single national statute. Nagano Prefecture has the most developed
      regulatory framework given concentration of ski resorts."
  }
}
```

**Wilderness Guide Licensing (EU-DOM-GUIDE-001)**
```json
{
  "domain_id": "EU-DOM-GUIDE-001",
  "domain_type": "guide_licensing",
  "tier": 2,
  "description": "Professional mountain and wilderness guide licensing. Not harmonized
    across EU — national requirements vary significantly. IFMGA certification provides
    internationally recognized baseline.",
  "applies_to_activity_types": ["hiking", "mountaineering", "alpine_tour",
                                "canyoning", "via_ferrata"],
  "governing_authority": {
    "name": "IFMGA/UIAGM — International Federation of Mountain Guides Associations",
    "jurisdiction": "EU",
    "website": "https://www.ivbv.info"
  },
  "required_credentials": [
    {
      "credential_type": "MOUNTAIN_GUIDE_LICENSE",
      "min_assurance_level": 3,
      "applies_to_roles": ["ACTIVITY_SUPPLIER", "SUB_SUPPLIER"],
      "required": false,
      "notes": "IFMGA is recognized internationally. Austria, France, Italy, and
        Switzerland legally require licensed guides for certain alpine activities.
        Other member states vary. Verify requirement in consumption jurisdiction."
    }
  ]
}
```

**Coastal Environmental Protection (AU-DOM-ENV-001)**
```json
{
  "domain_id": "AU-DOM-ENV-001",
  "domain_type": "environmental",
  "tier": 2,
  "description": "Marine park and environmental protection zone permits for commercial
    operators in Australian coastal waters. Reef area operations require additional
    permits under the Great Barrier Reef Marine Park Authority.",
  "applies_to_activity_types": ["snorkeling", "diving", "boat_tour",
                                "kayaking_guided", "whale_watching"],
  "governing_authority": {
    "name": "Great Barrier Reef Marine Park Authority (GBRMPA)",
    "jurisdiction": "AU",
    "website": "https://www.gbrmpa.gov.au"
  },
  "required_credentials": [
    {
      "credential_type": "MARINE_PARK_PERMIT",
      "min_assurance_level": 2,
      "applies_to_roles": ["ACTIVITY_SUPPLIER"],
      "required": true,
      "notes": "Required for any commercial operation within the Marine Park boundary."
    }
  ]
}
```

---

## 9. The Regulatory Sandbox Flag

### 9.1 Purpose

The Regulatory Sandbox Flag makes regulatory gray zones explicit and machine-readable.
When a transaction sits in an area where law is ambiguous, pending reform, or where
a compliant workaround exists, the flag records that ambiguity transparently. No party
proceeds unknowingly through a gray zone.

Every flag invocation contributes to an aggregate, anonymized dataset. Across thousands
of transactions, this dataset becomes evidence for regulatory reform — showing precisely
where regulation creates friction for legitimate commerce without improving consumer
protection.

### 9.2 Sandbox Flag Schema

```json
{
  "SandboxFlag": {
    "required": ["flag_id", "flag_name", "jurisdiction", "category",
                 "regulatory_context", "ambiguity_description",
                 "compliant_path", "status"],
    "properties": {
      "flag_id": {
        "type": "string",
        "pattern": "^[A-Z]{2}-[A-Z]+-[A-Z0-9-]+$",
        "description": "Format: {JJ}-{CATEGORY}-{SLUG}"
      },
      "flag_name": { "type": "string" },
      "jurisdiction": { "type": "string" },
      "category": {
        "type": "string",
        "enum": ["licensing", "packaging", "consumer_protection",
                 "ai_agent", "cross_border", "disclosure",
                 "associated_domain", "other"]
      },
      "regulatory_context": {
        "type": "object",
        "required": ["statute", "summary"],
        "properties": {
          "statute": { "type": "string" },
          "article": { "type": "string" },
          "url": { "type": "string" },
          "summary": { "type": "string" }
        }
      },
      "ambiguity_description": { "type": "string" },
      "compliant_path": {
        "type": "object",
        "required": ["available"],
        "properties": {
          "available": { "type": "boolean" },
          "description": { "type": "string" },
          "conditions": { "type": "array", "items": { "type": "string" } },
          "consumer_disclosure_required": { "type": "boolean" },
          "consumer_disclosure_text": { "type": "string" },
          "consumer_disclosure_text_local": { "type": "string" }
        }
      },
      "reform_reference": {
        "type": "object",
        "properties": {
          "reform_name": { "type": "string" },
          "expected_date": { "type": "string" },
          "source_url": { "type": "string" }
        }
      },
      "status": {
        "type": "string",
        "enum": ["active", "resolved", "deprecated"]
      },
      "usage_statistics": {
        "type": "object",
        "description": "Aggregate and anonymized only — no individual transaction data",
        "properties": {
          "transaction_count": { "type": "integer" },
          "first_used": { "type": "string", "format": "date" },
          "last_used": { "type": "string", "format": "date" }
        }
      }
    }
  }
}
```

### 9.3 Sandbox Flag Lifecycle

```
IDENTIFIED → DOCUMENTED → ACTIVE → RESOLVED | DEPRECATED
```

When law is clarified or reformed: flag marked `resolved`, jurisdiction entry updated,
usage statistics archived for the historical record, parties who used the flag in the
prior 12 months notified.

### 9.4 Consumer Disclosure Under Sandbox

When `consumer_disclosure_required` is true, the disclosure text MUST appear in the
CONFIRMATION document and the customer MUST acknowledge it before CONFIRMATION
completes. Where the jurisdiction requires local-language disclosure, both
`consumer_disclosure_text` and `consumer_disclosure_text_local` MUST be presented.

---

## 10. The Compliance Check Operation

The primary integration point at transaction time. Invoked by the Protocol Operator
at INQUIRY to evaluate whether the proposed transaction configuration is compliant.

### 10.1 Request

```json
{
  "selling_party_id": "string",
  "selling_roles": ["array of ATOP role IDs"],
  "product_type": "string",
  "components": ["array of component types"],
  "activity_types": ["array — triggers associated domain checks"],
  "sale_jurisdiction": "ISO 3166-1 alpha-2",
  "consumption_jurisdiction": "ISO 3166-1 alpha-2",
  "customer_type": "string",
  "estimated_value_usd": "number",
  "involves_ai_agent": "boolean",
  "ai_agent_authorization_id": "string"
}
```

### 10.2 Response

```json
{
  "compliance_status": "compliant | non_compliant | sandbox_active | partial_check",
  "applicable_requirements": ["all requirement IDs that apply"],
  "met_requirements": ["requirement IDs confirmed met"],
  "unmet_requirements": ["requirement IDs not met"],
  "active_sandbox_flags": ["flag IDs active for this transaction"],
  "compliant_path_available": "boolean",
  "compliant_path_description": "string",
  "associated_domain_requirements": ["domain requirement IDs triggered"],
  "required_disclosures": ["disclosure requirement IDs"],
  "warnings": ["array of human-readable warning strings"],
  "jurisdiction_entry_versions": { "JP": "0.1", "EU": "0.1" }
}
```

### 10.3 Example — Hotel Ski Package, Japan, No Travel Agency License

```json
Request: {
  "selling_party_id": "atop:party:jp:myauberge-001",
  "selling_roles": ["ACCOMMODATION_SUPPLIER"],
  "product_type": "package_two_components",
  "components": ["accommodation", "activity"],
  "activity_types": ["skiing", "equipment_rental"],
  "sale_jurisdiction": "JP",
  "consumption_jurisdiction": "JP",
  "customer_type": "consumer",
  "estimated_value_usd": 1200
}

Response: {
  "compliance_status": "sandbox_active",
  "applicable_requirements": ["JP-LIC-001", "JP-LIC-002", "JP-CP-001",
                               "JP-CP-003", "JP-PKG-002"],
  "met_requirements": ["JP-CP-003"],
  "unmet_requirements": ["JP-LIC-001", "JP-LIC-002", "JP-CP-001"],
  "active_sandbox_flags": ["JP-TRAVEL-LAW-SPLIT-SELLER"],
  "compliant_path_available": true,
  "compliant_path_description": "Split-seller configuration. Each component
    contracted separately. Customer disclosure JP-DISC-003 required.",
  "associated_domain_requirements": ["JP-DOM-SLOPE-001"],
  "required_disclosures": ["JP-DISC-001", "JP-DISC-003"],
  "warnings": [
    "Selling party does not hold Travel Agency License. Package sale not permitted.
     Split-seller configuration (手配旅行) required.",
    "Ski activity supplier must hold JP-DOM-SLOPE-001 slope safety inspection.
     Verify credential before CONFIRMATION."
  ],
  "jurisdiction_entry_versions": { "JP": "0.1" }
}
```

---

## 11. Government Advisory Sources

Advisory sources are registered in the Compliance Registry and referenced by the
Disruption Event mechanism. When an advisory changes severity for a registered region,
ATOP can trigger a Disruption Event Declaration automatically or surface it for
manual review.

```json
{
  "AdvisorySource": {
    "required": ["source_id", "source_name", "jurisdiction",
                 "feed_url", "severity_levels"],
    "properties": {
      "source_id": { "type": "string" },
      "source_name": { "type": "string" },
      "source_name_local": { "type": "string" },
      "jurisdiction": { "type": "string" },
      "issuing_authority": { "type": "string" },
      "feed_url": { "type": "string", "format": "uri" },
      "feed_format": {
        "type": "string",
        "enum": ["rss", "atom", "json_api", "html_scrape", "manual"]
      },
      "severity_levels": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "level_code": { "type": "string" },
            "level_name": { "type": "string" },
            "atop_severity_mapping": {
              "type": "string",
              "enum": ["MONITOR", "CAUTION", "WARNING", "CRITICAL"]
            }
          }
        }
      },
      "update_frequency": { "type": "string" }
    }
  }
}
```

Registered source entries are maintained in the Jurisdiction Entries document.

---

## 12. Registry Operations

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/compliance/jurisdictions` | No | List all jurisdiction entries |
| `GET` | `/compliance/jurisdictions/{code}` | No | Full jurisdiction entry |
| `GET` | `/compliance/jurisdictions/{code}/licensing` | No | Licensing requirements |
| `GET` | `/compliance/jurisdictions/{code}/consumer-protection` | No | Consumer protection |
| `GET` | `/compliance/jurisdictions/{code}/packaging` | No | Packaging obligations |
| `GET` | `/compliance/jurisdictions/{code}/disclosures` | No | Disclosure requirements |
| `GET` | `/compliance/jurisdictions/{code}/associated-domains` | No | Associated domain requirements |
| `GET` | `/compliance/jurisdictions/{code}/sandbox-flags` | No | Sandbox flags |
| `POST` | `/compliance/check` | Yes | Compliance Check operation |
| `GET` | `/compliance/sandbox-flags/{flag_id}` | No | Single flag with usage statistics |
| `GET` | `/compliance/advisory-sources` | No | Registered advisory sources |

---

## 13. Versioning and Governance

This specification and the Jurisdiction Entries document are versioned independently.

**Specification changes:** Schema additions are MINOR. Breaking schema changes are
MAJOR. New Tier 1 domains added to Section 8 are MINOR.

**Jurisdiction entry changes:** Minor corrections are PATCH. New requirements or changed
details are MINOR with affected parties notified. Resolved sandbox flags are MINOR
with prior users notified.

**Adding a jurisdiction entry:** GitHub Issue with Jurisdiction Entry Proposal template.
45-day community comment period. Legal review recommended. Approved in next MINOR
release of Jurisdiction Entries.

**Co-maintenance with regulatory bodies:** ATOP actively seeks co-maintenance with
national tourism authorities. Co-maintained entries are marked `authoritative`. The JTA
is the target co-maintainer for the JP entry. A JTA-endorsed JP entry transforms
ATOP's compliance declarations from best-interpretation of published law to
authoritative regulatory statements — a qualitatively different level of reliability.

---

*Document status: Draft v0.2 — March 2026*  
*Companion documents: Jurisdiction Entries v0.1, Global Jurisdiction Comparison v0.1*  
*Maintainer: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
