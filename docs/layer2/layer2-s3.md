# 3. Capability Declaration Schema

**Activity Travel Protocol — Layer 2 — Discovery and Capability Specification**

*Working Draft — Section 3: Capability Declaration Schema*

March 2026

---

This section defines the Capability Declaration schema — the normative structure that every supplier must use when registering their offering in the Party Registry. It specifies every required and optional field, the validity model governing declaration currency, the material change rules that trigger DECLARATION_SUPERSEDED, and the Delegation Topology Declaration component for suppliers participating in multi-party Coordination Delegation.

The Security Kernel enforces all registration rules non-bypassably. A Capability Declaration that fails schema validation at registration time is rejected — no partial registration is permitted.

---

## 3.0 Capability Declaration Overview

A Capability Declaration is a supplier-registered statement of what they offer, under what conditions, and for which jurisdictions. It is static at registration time — it describes the supplier's offering in general terms, not the availability of a specific slot. Every Capability Declaration registered in the Party Registry is assigned a version identifier and a declared validity period. The Party Registry stores the current valid version of each declaration; superseded versions are retained in the audit log but are not queryable via the Capability Catalogue.

A Capability Declaration is distinct from an Activity Component. A Capability Declaration describes what a supplier offers in general. An Activity Component is a specific, parameterised instance of that offering for a particular booking — produced by the Activity Configuration process (Section 4). The Feasibility Check operation (Section 7) assesses whether a specific Activity Component configuration is feasible against the current Capability Declaration.

### 3.0.1 Declaration structure

A Capability Declaration consists of five parts:

| Part | Contents | Required |
|------|----------|----------|
| **Declaration Header** | Version identifier, registration timestamp, validity period, party identity reference. | Yes |
| **Offering Descriptor** | The offered service — type, name, description, configuration parameters, pricing model. | Yes |
| **Operational Constraints** | Conditions under which the offering is available — seasons, capacity model, advance booking window, minimum party size. | Yes |
| **Jurisdiction Coverage** | The jurisdictions in which the offering is valid and the compliance regime applicable to each. | Yes |
| **Delegation Topology Declaration** | Multi-party Coordination Delegation capability — maximum depth, co-delegatee constraints. Required only for suppliers participating in Coordination Delegation. | Conditional |

### 3.0.2 Registration rules

A Capability Declaration is registered by an authorised Party in the Party Registry. The following registration rules apply:

- The registering Party must have a current, verified Trust Chain in the Party Registry.
- The declaration must pass schema validation in full before registration is accepted. No partial registration is permitted.
- A registered Capability Declaration is queryable via the Capability Catalogue upon successful registration. Propagation to all Capability Catalogue replicas is subject to the consistency model of the deployed tier (Architecture Specification v0.2, three-tier scaling model).
- A Party may register multiple Capability Declarations. Each is assigned an independent version identifier and validity period.
- A Capability Declaration may be updated only by publishing a new version. The new version is registered; the previous version is superseded via the DECLARATION_SUPERSEDED event (Section 3.3).

---

## 3.1 Declaration Header

The Declaration Header uniquely identifies a Capability Declaration and establishes its validity context.

### 3.1.1 Required header fields

| Field | Type | Description |
|-------|------|-------------|
| `declaration_id` | UUID v7 | Unique identifier for this declaration. Assigned by the Party Registry on registration. Immutable. |
| `version_id` | string | Version identifier for this declaration. Format: `[party_id]-[ISO8601 date]-[sequence]`. Must be unique across all declarations registered by the party. |
| `registering_party_id` | string | Party Registry identifier of the registering party. Must match the authenticated Party identity at registration time. |
| `registration_timestamp` | ISO 8601 | Timestamp of successful registration. Assigned by the Party Registry. Immutable. |
| `valid_from` | ISO 8601 | The earliest date from which this declaration is valid for Feasibility Check assessment. May be a future date — suppliers may pre-register declarations for seasonal offerings before the season opens. Must be a date after which the Party Registry has verified the registering Party's Trust Chain. |
| `valid_until` | ISO 8601 | The latest date until which this declaration is valid for Feasibility Check assessment. Must be > valid_from. Must not exceed the Layer 2-defined maximum validity period. |
| `supersedes` | string \| null | The version_id of the declaration this version supersedes. Null for the first version. When non-null, the Party Registry triggers DECLARATION_SUPERSEDED for the referenced version on successful registration of this version. |

### 3.1.2 Validity period constraints

The validity period (valid_from to valid_until) is subject to the following constraints, whose normative values are defined in Section 7.2 alongside the Feasibility Window parameter. Implementations must consult Section 7.2 for the normative minimum and maximum values.

- **Minimum validity period:** A declaration with a validity period shorter than the Layer 2-defined minimum cannot be used as the basis for a Feasibility Check. The minimum is set to ensure a declaration cannot expire during a Feasibility Check operation that is otherwise within its Feasibility Window.
- **Maximum validity period:** A declaration with a validity period exceeding the Layer 2-defined maximum is rejected at registration. Suppliers must revalidate declarations approaching expiry by registering a new version before the current version expires.
- **Party-configurable validity:** suppliers may set validity periods anywhere between the minimum and maximum. They may not set periods shorter than the minimum or longer than the maximum.

> **Design rule L2-T-3-A:** Every Capability Declaration MUST carry a version identifier and a declared validity period. The Party Registry MUST store the current valid version of each declaration and reject FEASIBILITY_CLEARED events issued against expired or superseded versions.

### 3.1.3 Trust Chain validation at registration

The Security Kernel validates the registering Party's Trust Chain at the point of registration. A Capability Declaration submitted by a Party whose Trust Chain is expired, revoked, or unverifiable is rejected. Trust Chain validation at registration is distinct from Trust Chain validation during Feasibility Check assessment — both are required.

---

## 3.2 Offering Descriptor

The Offering Descriptor defines the service the supplier offers. It is the human- and agent-readable description of what can be booked.

### 3.2.1 Required offering fields

| Field | Type | Description |
|-------|------|-------------|
| `offering_type` | enum | The category of offering. Defined values: `ACTIVITY`, `ACCOMMODATION`, `TRANSPORT`, `FLIGHT`, `DINING`, `WELLNESS`, `GUIDE_SERVICE`, `TRANSFER`. The `FLIGHT` type activates NDC bridge obligations (Appendix A). Additional types may be defined in future versions of this specification. |
| `offering_name` | string | Human-readable name of the offering. Maximum 200 characters. |
| `offering_description` | string | Human-readable description. Maximum 2000 characters. |
| `configuration_parameters` | object | The parameterisation schema for this offering — the fields a booking agent must supply during Activity Configuration (Section 4) to produce a fully-specified Activity Component. Defined as a JSON Schema object. |
| `pricing_model` | enum | How the offering is priced. Defined values: `PER_PERSON`, `PER_GROUP`, `PER_UNIT`, `NEGOTIATED`. `NEGOTIATED` activates Pre-Arrangement Declaration pricing path (Section 6). |
| `base_currency` | ISO 4217 | The currency in which base pricing is expressed. |

### 3.2.2 Optional offering fields

| Field | Type | Description |
|-------|------|-------------|
| `pricing_tiers` | array | Pricing tiers by group size, season, or configuration variant. Each tier references the configuration_parameters fields that activate it. |
| `media_references` | array | URIs of descriptive media (images, video). All media URIs must resolve to resources registered in the Resource Reference Registry (Section 5). |
| `iata_irops_category_code` | string | For `FLIGHT` type offerings only. Declares that this offering supports IROPS disruption event handling and specifies the applicable IATA IROPS category code. This is the Layer 2 declaration of IROPS support — distinct from the `iata_irops_category_code` field on the Layer 3 `SourceSignalRecord` (SAR-18), which carries the code on a specific disruption event. Activates the IATA NDC bridge (Appendix A, [IATA-NDC]). |
| `ndc_order_reference_schema` | object | For `FLIGHT` type offerings only. JSON Schema for the NDC order reference accepted as foreign key in Activity Configuration. Activates NDC bridge obligations per Appendix A. |
| `liveAvailabilityMode` | enum | One of: `NONE`, `PASSIVE`, `ACTIVE_GATE`. Default: `NONE`. Declares whether this offering participates in live availability signalling. `NONE`: no live signal; Feasibility Check operates against static declaration only. `PASSIVE`: supplier publishes a live availability signal via the registered driver; the Capability Catalogue surfaces it alongside the static declaration but it does not gate `FEASIBILITY_CLEARED`. `ACTIVE_GATE`: the supplier's live availability signal gates `FEASIBILITY_CLEARED` — the supplier MUST NOT push `FEASIBILITY_CLEARED` when their live signal indicates unavailability (DR-L2-9-G). MUST be accompanied by `liveAvailabilityDriverRef` when set to `PASSIVE` or `ACTIVE_GATE` (DR-L2-9-B). See S9 for full live availability semantics. |
| `liveAvailabilityDriverRef` | string | The `resourceRefId` of an `AVAILABILITY` category Resource Reference Registry entry that provides the live availability signal driver for this offering. Required when `liveAvailabilityMode` is `PASSIVE` or `ACTIVE_GATE`; MUST be absent when `liveAvailabilityMode` is `NONE`. MUST resolve to a registered, non-expired `AVAILABILITY` category entry at Capability Declaration registration time (DR-L2-9-B, DR-L2-9-C). |
| `liveAvailabilityGranularity` | enum | One of: `SLOT_LIST`, `CAPACITY_COUNT`, `BINARY`. Describes the granularity of the live availability signal produced by the driver. `SLOT_LIST`: the signal enumerates specific available slots by identifier. `CAPACITY_COUNT`: the signal reports a numeric available capacity. `BINARY`: the signal reports only available or unavailable. Required when `liveAvailabilityMode` is `PASSIVE` or `ACTIVE_GATE`; MUST be absent when `liveAvailabilityMode` is `NONE`. |
| `liveAvailabilityCacheTtl` | ISO 8601 duration | The maximum age of a cached live availability signal that the Capability Catalogue may serve before the signal must be refreshed or marked stale. MUST be > PT0S and ≤ PT1H (DR-L2-9-D). Required when `liveAvailabilityMode` is `PASSIVE` or `ACTIVE_GATE`; MUST be absent when `liveAvailabilityMode` is `NONE`. |

### 3.2.3 Configuration parameters schema

The `configuration_parameters` field defines the Activity Configuration interface for this offering. It is a JSON Schema object that specifies: required fields the booking agent must supply; optional fields with defaults; validation rules; and field interdependencies.

The Activity Configuration Schema (Section 4) defines the normative rules for how configuration_parameters schemas must be structured. A Capability Declaration whose configuration_parameters object fails Activity Configuration Schema validation is rejected at registration.

---

## 3.3 Material Change and DECLARATION_SUPERSEDED

### 3.3.1 Material change definition

A material change is a change to a Capability Declaration that requires the supplier to register a new version and publish a DECLARATION_SUPERSEDED event for the previous version. Material changes are defined normatively to protect against FEASIBILITY_CLEARED being issued against a stale declaration (L2-T-3-D).

**The following are material changes:**

- Changes to offered services — adding, removing, or substantially altering any offering in the `offering_type`, `offering_name`, or `offering_description` fields.
- Changes to `pricing_model` — including changes between defined pricing model values.
- Changes to `configuration_parameters` that alter required fields, remove optional fields, or change validation rules in ways that would affect previously valid Activity Component configurations.
- Changes to `operational_constraints` — changes to capacity model, advance booking window, or minimum party size that would affect the feasibility of bookings already in the INQUIRY phase.
- Changes to jurisdiction coverage — any change to the jurisdictions in which the offering is valid. Jurisdiction coverage is a material change because FEASIBILITY_CLEARED events are jurisdiction-scoped (L2-T-3-D, Jurisdiction Compliance Spec v0.2).
- Changes to `delegation_topology_declaration` fields that reduce declared maximum depth or add co-delegatee constraints.

**The following are not material changes:**

- Contact detail updates — supplier name, address, email, phone, or website.
- Formatting or clarification changes that do not alter the substance of any field.
- Changes to `media_references` — adding or updating descriptive media.
- Changes to `pricing_tiers` that do not alter the `pricing_model` value.
- Extension of the validity period via a renewal registration (see Section 3.1.2).

> **Design rule L2-T-3-D:** Layer 2 MUST define 'material change' for the purposes of DECLARATION_SUPERSEDED. Minor changes (e.g. contact details, formatting) do not trigger DECLARATION_SUPERSEDED. Changes to offered services, pricing model, operational constraints, or jurisdiction coverage do.

### 3.3.2 DECLARATION_SUPERSEDED event

When a supplier registers a new version of a Capability Declaration that supersedes a prior version, the Party Registry automatically publishes a DECLARATION_SUPERSEDED event. The event carries:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | string | Fixed value: `DECLARATION_SUPERSEDED`. |
| `superseded_version_id` | string | The version_id of the declaration being superseded. |
| `replacement_version_id` | string | The version_id of the new declaration. |
| `supersession_timestamp` | ISO 8601 | Timestamp of supersession. Assigned by the Party Registry. |
| `registering_party_id` | string | Party Registry identifier of the party registering the new version. |

On receipt of DECLARATION_SUPERSEDED:

- The Party Registry marks the superseded version as invalid.
- The replacement version becomes the queryable current version in the Capability Catalogue.
- Any FEASIBILITY_CLEARED events issued against the superseded version_id after the supersession_timestamp are rejected by the Party Registry (L2-T-3-A).
- Active Feasibility Check operations that are assessing against the superseded version must be notified via the IPC channel. The Feasibility Check operation must return FEASIBILITY_FAILED with reason DECLARATION_STALE for any Activity Component assessed against the superseded version (L2-T-3-C).

> **Design rule L2-T-3-B:** Suppliers MUST publish a DECLARATION_SUPERSEDED event when a Capability Declaration is materially changed. The event MUST reference the superseded version identifier and the replacement version identifier.

> **Design rule L2-T-3-C:** The Feasibility Check operation MUST validate declaration currency before issuing FEASIBILITY_CLEARED. A FEASIBILITY_FAILED event with reason DECLARATION_STALE is the required response when the assessed declaration is expired or superseded.

---

## 3.4 Operational Constraints

The Operational Constraints section of a Capability Declaration defines the conditions under which the offering is available. These are general constraints on the offering class — not specific slot availability, which is a Feasibility Check concern.

### 3.4.1 Required operational constraint fields

| Field | Type | Description |
|-------|------|-------------|
| `availability_model` | enum | How availability is managed. Defined values: `ALWAYS_AVAILABLE` (no capacity constraint declared), `CAPACITY_MANAGED` (supplier manages a capacity pool), `ON_REQUEST` (each booking requires explicit supplier confirmation), `SEASONAL` (availability constrained by season). |
| `advance_booking_window` | object | The minimum and maximum advance booking periods. Fields: `min_advance` (ISO 8601 duration, minimum lead time required), `max_advance` (ISO 8601 duration, maximum lead time accepted). |
| `minimum_party_size` | integer | Minimum number of travelers for which the offering is valid. Minimum value: 1. |

### 3.4.2 Optional operational constraint fields

| Field | Type | Description |
|-------|------|-------------|
| `maximum_party_size` | integer | Maximum number of travelers. Absent means no declared maximum. |
| `seasonal_windows` | array | For `SEASONAL` availability_model only. Array of ISO 8601 date range objects defining the seasons during which the offering is available. |
| `capacity_pool_reference` | string | For `CAPACITY_MANAGED` availability_model only. A Resource Reference Registry identifier pointing to the supplier's capacity data source. Must be registered in the Resource Reference Registry (Section 5). |
| `blackout_periods` | array | Array of ISO 8601 date range objects defining periods during which the offering is unavailable regardless of availability_model. |

### 3.4.3 Conditional field requirements

The following fields become required when specific `availability_model` values are declared. A Capability Declaration that declares an availability_model without its required conditional fields is rejected at registration:

| availability_model value | Conditionally required field | Reason |
|--------------------------|------------------------------|--------|
| `SEASONAL` | `seasonal_windows` | Without seasonal windows, a SEASONAL declaration carries no availability information. The Feasibility Check cannot assess feasibility without them. |
| `CAPACITY_MANAGED` | `capacity_pool_reference` | Without a capacity pool reference, the Feasibility Check has no mechanism to assess whether capacity is available. |

---

## 3.5 Jurisdiction Coverage

Every Capability Declaration must declare the jurisdictions in which the offering is valid. Jurisdiction coverage is a required field — a Capability Declaration without jurisdiction coverage is rejected at registration. Changes to jurisdiction coverage are a material change and trigger DECLARATION_SUPERSEDED (Section 3.3.1).

### 3.5.1 Required jurisdiction fields

| Field | Type | Description |
|-------|------|-------------|
| `jurisdiction_entries` | array | One or more jurisdiction entries. Minimum cardinality: 1. A Capability Declaration with an empty `jurisdiction_entries` array is rejected at registration. Each entry references a jurisdiction code defined in the Jurisdiction Entries specification (jurisdiction-entries.md) and the compliance regime applicable to the offering in that jurisdiction. |

### 3.5.2 Jurisdiction entry structure

Each entry in `jurisdiction_entries` carries:

| Field | Type | Description |
|-------|------|-------------|
| `jurisdiction_code` | string | A jurisdiction code from the Activity Travel Protocol Jurisdiction Entries (jurisdiction-entries.md). |
| `compliance_regime` | string | The compliance regime applicable to this offering in this jurisdiction, as defined in the Jurisdiction Compliance Specification v0.2. |
| `regulatory_notes` | string \| null | Informational notes on jurisdiction-specific regulatory requirements. Not normative. |

### 3.5.3 Jurisdiction constraint on Pre-Arrangement Declarations

Pre-Arrangement Declarations (Section 6) that reference a Capability Declaration are scoped to the jurisdictions declared in that declaration's `jurisdiction_entries`. A Pre-Arrangement Declaration may not extend the jurisdiction scope of the Capability Declaration it references. This constraint is enforced at Pre-Arrangement Declaration registration time by the Security Kernel (L2-T-4-C).

---

## 3.6 Delegation Topology Declaration

The Delegation Topology Declaration is a conditional component of the Capability Declaration. It is required only for suppliers who intend to participate in multi-party Coordination Delegation as a Fulfilling Party in bookings with more than two Fulfilling Parties. Suppliers who do not register a Delegation Topology Declaration are not eligible to participate as a Fulfilling Party in multi-party Coordination Delegation — they may still participate as the sole Fulfilling Party or as one of two Fulfilling Parties in standard two-party Coordination Delegation (Layer 3 S12).

> **Design rule L2-T-5-A:** Layer 2 MUST define a Delegation Topology Declaration as a component of Capability Declarations. Suppliers capable of participating in multi-party Coordination Delegation MUST declare their maximum delegation depth and co-delegatee constraints at registration.

### 3.6.1 Delegation Topology Declaration fields

| Field | Type | Description |
|-------|------|-------------|
| `delegation_capable` | boolean | Whether the supplier is declaring Coordination Delegation capability. Must be `true` for this component to be meaningful. A Capability Declaration with `delegation_capable: false` or absent Delegation Topology Declaration is treated as delegation-incapable. |
| `max_delegation_depth` | integer | The maximum delegation chain depth the supplier supports as a Fulfilling Party. Minimum value: 2 (two-party, the Layer 3 v1.0 baseline). A value of 3 or greater declares capability for n-party chains. |
| `co_delegatee_constraints` | object \| null | Constraints on the identity of co-delegatees in a delegation chain involving this supplier. Null means no constraints. Defined constraint fields: `required_jurisdiction_codes` (array — co-delegatees must be registered in at least one of these jurisdictions); `required_trust_tier` (string — minimum Trust Chain tier required of co-delegatees); `excluded_party_ids` (array — specific Party Registry identifiers excluded from co-delegation with this supplier). |

### 3.6.2 Delegation Topology Declaration and the Feasibility Check

The Feasibility Check operation uses registered Delegation Topology Declarations to confirm that a valid delegation chain can be constructed for multi-party bookings before FEASIBILITY_CLEARED is issued (L2-T-5-B). The delegation topology feasibility step in the Feasibility Check operation is specified in Section 7.4. Phase window assignment for the Coordination Delegation credential is a Layer 3 concern (Layer 3 S12) — it is not declared in the Delegation Topology Declaration.

### 3.6.3 Changes to Delegation Topology Declaration fields

Changes to Delegation Topology Declaration fields that reduce declared capability — decreasing `max_delegation_depth` or adding `co_delegatee_constraints` — are material changes and trigger DECLARATION_SUPERSEDED (Section 3.3.1). Changes that increase declared capability — increasing `max_delegation_depth` or relaxing `co_delegatee_constraints` — are not material changes and may be registered without triggering DECLARATION_SUPERSEDED.

The asymmetry is intentional: a reduction in declared capability may invalidate Feasibility Check assessments already in progress that depend on the supplier's topology capability, so it requires a supersession event and FEASIBILITY_FAILED notification to active Feasibility Check operations. An increase in declared capability cannot invalidate existing assessments — it can only enable new ones — so no supersession is required.

---

## 3.7 CAAM Act-Claims — Deferral Note

Capability Declarations may optionally carry CAAM act-claims as defined in draft-barney-caam-00 [CAAM]. The presence of act-claims in a Capability Declaration is supported by this specification but the normative mapping between Activity Travel Protocol Trust Chain constructs and CAAM act-claim JWT chains is deferred to the CAAM Bridge Specification (DL2-2). Until the CAAM Bridge Specification is published, act-claims in Capability Declarations are treated as informational and are not evaluated by the Security Kernel.

---

## 3.8 Design Rule Compliance — Section 3

| Rule | Application in this section |
|------|----------------------------|
| L2-T-3-A | Section 3.1 defines the version identifier and validity period as required Declaration Header fields. Section 3.3.2 specifies that the Party Registry rejects FEASIBILITY_CLEARED events against expired or superseded versions. |
| L2-T-3-B | Section 3.3.2 defines the DECLARATION_SUPERSEDED event structure and specifies that the Party Registry publishes it automatically on supersession registration. |
| L2-T-3-C | Section 3.3.2 specifies that active Feasibility Check operations are notified of supersession via the IPC channel and must return FEASIBILITY_FAILED with reason DECLARATION_STALE. Full specification in Section 7.3. |
| L2-T-3-D | Section 3.3.1 defines material change normatively, listing both material and non-material change categories explicitly. |
| L2-T-4-C | Section 3.5.3 specifies that Pre-Arrangement Declarations may not extend the jurisdiction scope of the Capability Declaration they reference; enforced at Pre-Arrangement Declaration registration. |
| L2-T-5-A | Section 3.6 defines the Delegation Topology Declaration as a conditional component of the Capability Declaration, with required fields and registration rules. |

---

*Activity Travel Protocol — Layer 2 Discovery and Capability Specification — Working Draft — Section 3 — March 2026*
