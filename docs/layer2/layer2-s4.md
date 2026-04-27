# 4. Activity Configuration Schema

**Activity Travel Protocol — Layer 2 — Discovery and Capability Specification**

*Working Draft — Section 4: Activity Configuration Schema*

March 2026

---

This section defines the Activity Configuration Schema — the normative structure governing how a generic offering in a Capability Declaration is parameterised into a fully-specified Activity Component ready for Layer 3 INQUIRY. It specifies the configuration input structure, the required and optional configuration fields, the price resolution rules, the validation requirements for `configuration_parameters` schemas declared in Capability Declarations (Section 3.2.3), and the output format of a completed Activity Component.

Activity Configuration is the second step in the Layer 2 pipeline: it follows Capability Declaration discovery (Section 3 and Section 8) and precedes the Feasibility Check operation (Section 7). A Booking Object may not be created until all required Activity Components have been configured and have received FEASIBILITY_CLEARED.

---

## 4.0 Activity Configuration Overview

### 4.0.1 Purpose

Activity Configuration transforms a supplier's general declared offering into a specific, bookable item for a particular traveler and booking context. The inputs are a Capability Declaration and a set of booking parameters supplied by the booking agent or traveler. The output is a fully-specified Activity Component.

The Activity Configuration Schema serves two functions:

- It defines the normative structure for the `configuration_parameters` field in every Capability Declaration (Section 3.2.3). Every `configuration_parameters` object registered in a Capability Declaration must conform to the Activity Configuration Schema's structural rules.
- It defines the normative structure for the Activity Component output — the artifact passed to Layer 3 INQUIRY.

### 4.0.2 Activity Configuration in the Layer 2 pipeline

Activity Configuration occupies a fixed position in the Layer 2 pipeline:

| Step | Operation | Section |
|------|-----------|---------|
| 1 | Query the Capability Catalogue to discover and retrieve a Capability Declaration | S8 (query interface), S3 (declaration schema) |
| **2** | **Activity Configuration — parameterise the offering** | **S4 (this section)** |
| 3 | Feasibility Check — confirm the configured component is feasible | S7 |
| 4 | Booking Object creation — enter Layer 3 | Layer 3 S3 |

A Feasibility Check may not be initiated until Activity Configuration is complete for the Activity Component being assessed. An Activity Component that has not completed Activity Configuration is not a valid Feasibility Check subject.

### 4.0.3 Relationship to Capability Declaration configuration_parameters

The `configuration_parameters` field in a Capability Declaration (Section 3.2.3) defines the Activity Configuration interface for that specific offering. It is a JSON Schema object specifying which fields a booking agent must supply during Activity Configuration.

The Activity Configuration Schema defined in this section is the meta-schema — it defines the rules that every `configuration_parameters` JSON Schema object must follow. A Capability Declaration whose `configuration_parameters` object does not conform to this meta-schema is rejected at registration (Section 3.0.2).

---

## 4.1 Configuration Input

The configuration input is the set of parameters supplied by the booking agent to configure a specific offering from a Capability Declaration for a particular booking.

### 4.1.1 Required configuration input fields

| Field | Type | Description |
|-------|------|-------------|
| `capability_declaration_id` | UUID v7 | The `declaration_id` of the Capability Declaration being configured. Must reference a currently valid declaration in the Party Registry — not expired, not superseded. |
| `capability_declaration_version_id` | string | The `version_id` of the specific Capability Declaration version being configured. The Feasibility Check operation will validate that this version is still current at the time of assessment (L2-T-3-C). |
| `booking_agent_party_id` | string | Party Registry identifier of the booking agent initiating the configuration. Must be a Party registered in the Party Registry with a current Trust Chain. Activity Configuration does not require additional authority beyond Party registration — authority gates for Booking Object creation are enforced at Layer 3 INQUIRY entry. |
| `requested_dates` | object | The date or date range for which the Activity Component is being configured. Fields: `start_date` (ISO 8601, required); `end_date` (ISO 8601, required if the offering spans multiple days; equal to `start_date` for single-day offerings). |
| `traveler_count` | integer | Number of travelers for this Activity Component. Must be >= the Capability Declaration's `minimum_party_size`. Must be <= `maximum_party_size` if declared. |
| `offering_parameters` | object | The offering-specific configuration fields defined in the Capability Declaration's `configuration_parameters` schema. Must satisfy all required fields and validation rules in that schema. |

### 4.1.2 Optional configuration input fields

| Field | Type | Description |
|-------|------|-------------|
| `preferred_currency` | ISO 4217 | The currency in which the booking agent requests pricing to be expressed. If absent, the Capability Declaration's `base_currency` is used. Currency conversion is a supplier responsibility — the Activity Configuration Schema does not define conversion rules. |
| `pre_arrangement_declaration_id` | string | Reference to a registered Pre-Arrangement Declaration (Section 6) applicable to this configuration. Required when `pricing_model` is `NEGOTIATED`. The referenced declaration must be registered and current in the Party Registry. |
| `ndc_order_reference` | string | For `FLIGHT` offering type only. The NDC order reference accepted as a foreign key, conforming to the `ndc_order_reference_schema` declared in the Capability Declaration (Section 3.2.2). Activates NDC bridge obligations (Appendix A). |
| `configuration_notes` | string | Free-text notes from the booking agent. Maximum 500 characters. Classified as `CUSTOMER_INPUT` — subject to sanitisation rules at the Layer 3 ASSEMBLY POINT before any AI agent processes this field. |

### 4.1.3 Conditional field requirements

The following field becomes required when a specific `pricing_model` is declared in the Capability Declaration. A configuration input that omits this field under the stated condition is rejected before price resolution begins:

| Capability Declaration pricing_model | Conditionally required field | Reason |
|--------------------------------------|------------------------------|--------|
| `NEGOTIATED` | `pre_arrangement_declaration_id` | Without a Pre-Arrangement Declaration reference, no agreed price or pricing formula exists for resolution. The configuration cannot proceed. |

### 4.1.4 Offering parameters validation

The `offering_parameters` object is validated against the `configuration_parameters` JSON Schema declared in the Capability Declaration at the time of Activity Configuration. Validation rules:

- All fields marked as required in `configuration_parameters` must be present and valid.
- Optional fields not supplied are set to their declared defaults.
- Fields not declared in `configuration_parameters` are rejected — the Activity Configuration Schema does not permit extension fields in `offering_parameters`.
- Validation failures return a structured error response identifying the failing field, the constraint violated, and the expected value or format.

---

## 4.2 Price Resolution

Price resolution determines the price of the configured Activity Component. The resolution path depends on the Capability Declaration's `pricing_model`.

### 4.2.1 Price resolution by pricing model

| pricing_model | Resolution path |
|---------------|----------------|
| `PER_PERSON` | Base price per person × `traveler_count`, adjusted by applicable `pricing_tiers`. The base price per person field name is defined in the Capability Declaration's `configuration_parameters` schema by the supplier. |
| `PER_GROUP` | Base price per group, adjusted by applicable `pricing_tiers`. `traveler_count` does not affect the group price unless a tier condition references party size. The base price per group field name is defined in the Capability Declaration's `configuration_parameters` schema by the supplier. |
| `PER_UNIT` | Base price per unit × the unit quantity specified in `offering_parameters`. Unit type, unit quantity field name, and base price per unit field name are all defined in the Capability Declaration's `configuration_parameters` schema by the supplier. |
| `NEGOTIATED` | Price is resolved against the referenced Pre-Arrangement Declaration (Section 6). A `pre_arrangement_declaration_id` is required in the configuration input (Section 4.1.3). The Pre-Arrangement Declaration defines the agreed price or pricing formula. If no valid Pre-Arrangement Declaration is referenced, the configuration is rejected. |

### 4.2.2 Pricing tier evaluation

Where `pricing_tiers` are declared in the Capability Declaration, the applicable tier is evaluated against the configuration input at Activity Configuration time. Tier selection rules:

- Tiers are evaluated in declaration order. The first tier whose conditions are satisfied by the configuration input is applied.
- If no tier condition is satisfied, the base price applies.
- A tier may reference any field in `offering_parameters` or the standard configuration input fields (`traveler_count`, `requested_dates`).
- Tier conditions are evaluated against the configuration input at Activity Configuration time. They are not re-evaluated at Feasibility Check time unless the configuration input changes.

### 4.2.3 Resolved price in the Activity Component output

The price resolution result is recorded in the Activity Component output as a `resolved_price` object. The `resolved_price` is the price calculated by the booking agent against the Capability Declaration's declared pricing model at the time of Activity Configuration. It represents the expected price — not a supplier commitment. The supplier's acceptance of this price is confirmed at Layer 3 PENDING_CONFIRMATION. The Feasibility Check operation may return FEASIBILITY_FAILED if the supplier cannot honour the resolved price at the time of assessment. Price disputes after FEASIBILITY_CLEARED are a Layer 3 concern.

---

## 4.3 Activity Component Output

The Activity Component is the output of Activity Configuration. It is a fully-specified booking item ready for the Feasibility Check operation and, on FEASIBILITY_CLEARED, for Layer 3 INQUIRY.

### 4.3.1 Activity Component output fields

| Field | Type | Description |
|-------|------|-------------|
| `activity_component_id` | UUID v7 | Unique identifier for this Activity Component. Assigned at Activity Configuration completion. |
| `capability_declaration_id` | UUID v7 | The `declaration_id` of the Capability Declaration this component is configured from. |
| `capability_declaration_version_id` | string | The `version_id` of the Capability Declaration version assessed. The Feasibility Check operation validates that this version is still current (L2-T-3-C). |
| `supplier_party_id` | string | Party Registry identifier of the supplier Party responsible for this component. Derived from the Capability Declaration's `registering_party_id`. |
| `offering_type` | enum | Carried through from the Capability Declaration's `offering_type`. |
| `configured_offering` | object | The fully-specified offering — the `offering_parameters` values supplied in the configuration input, resolved against the Capability Declaration's `configuration_parameters` schema. |
| `requested_dates` | object | Carried through from the configuration input. |
| `traveler_count` | integer | Carried through from the configuration input. |
| `resolved_price` | object | The resolved price for this Activity Component. Fields: `amount` (decimal); `currency` (ISO 4217); `pricing_model` (carried through from Capability Declaration); `pricing_basis` (the tier or base price rule applied); `price_resolved_at` (ISO 8601 timestamp). |
| `feasibility_status` | enum | Current feasibility status of this Activity Component. Initial value on Activity Configuration completion: `PENDING_FEASIBILITY_CHECK`. Updated by the Feasibility Check operation to `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED`. When set to `FEASIBILITY_FAILED`, a mandatory `feasibility_failed_reason` sub-field carries the reason value as defined in Section 2.3 (DECLARATION_STALE, OFFERING_UNAVAILABLE, DELEGATION_TOPOLOGY_INFEASIBLE, or FEASIBILITY_WINDOW_EXPIRED). |
| `pre_arrangement_declaration_id` | string \| null | Reference to the Pre-Arrangement Declaration applied, if any. Null if `pricing_model` is not `NEGOTIATED`. |
| `ndc_order_reference` | string \| null | NDC order reference, for `FLIGHT` type only. Null otherwise. |
| `configuration_completed_at` | ISO 8601 | Timestamp of Activity Configuration completion. Assigned at output creation. |

### 4.3.2 Activity Component output immutability

The Activity Component output is immutable after creation, with one exception: the `feasibility_status` field is updated by the Feasibility Check operation. All other fields are fixed at Activity Configuration completion. If a booking agent needs to change any other field, a new Activity Configuration must be performed, producing a new Activity Component with a new `activity_component_id`. The previous Activity Component is discarded.

This immutability rule ensures that the Feasibility Check operation always assesses a stable, known configuration — not a configuration that may have changed between initiation and assessment.

### 4.3.3 Activity Component handoff to Layer 3

The Activity Component output is the unit passed to Layer 3 INQUIRY. Layer 3 receives the Activity Component as a complete artifact. Layer 3 does not re-run Activity Configuration — it accepts the Activity Component as produced by Layer 2. The gate for Booking Object creation is that the Security Kernel has recorded a FEASIBILITY_CLEARED event in the Booking Object event log for every required Activity Component (Layer 3 S1 Section 1.7, OQ-L3-1; Layer 3 S3.1.3). The `feasibility_status` field on each Activity Component is a derived representation of that event-log state — the event-log record is authoritative.

The Activity Component fields `supplier_party_id`, `offering_type`, `configured_offering`, `requested_dates`, `traveler_count`, and `resolved_price` are used by Layer 3 to construct the Booking Object's Activity Component set. Layer 3 does not validate these fields against the Capability Declaration — that validation is Layer 2's responsibility and is completed before Layer 3 is entered.

---

## 4.4 configuration_parameters Meta-Schema Rules

This section defines the normative rules that every `configuration_parameters` JSON Schema object in a Capability Declaration must follow. These are the meta-schema constraints enforced at Capability Declaration registration (Section 3.2.3).

### 4.4.1 Required meta-schema properties

Every `configuration_parameters` schema object must:

- Be a valid JSON Schema. The minimum supported version is draft-07; the recommended version is 2020-12. Implementations must validate against the version declared in the schema's `$schema` keyword. Schemas that omit `$schema` are validated against draft-07.
- Define at least one required field — a `configuration_parameters` schema with no required fields is rejected at registration. An offering with no configuration parameters (e.g. a fixed-price, fixed-date event) must still declare a `booking_reference_acknowledged` boolean field as a minimum required field, signalling that the booking agent has explicitly confirmed the offering terms.
- Declare a `type` of `object` at the top level.
- Not use `additionalProperties: true` — all accepted fields must be explicitly declared.
- Not reference external JSON Schema resources — all schema definitions must be self-contained within the `configuration_parameters` object.

### 4.4.2 Prohibited patterns

The following patterns in `configuration_parameters` schemas are rejected at Capability Declaration registration:

- Schemas that reference the booking agent's identity fields directly — the booking agent's Party Registry identifier is carried in the configuration input, not in `offering_parameters`.
- Schemas that require TRAVELER_PII fields — Personally Identifiable Information about the traveler is not collected at Activity Configuration time. It is collected at Layer 3 INQUIRY entry and governed by Layer 3 identity_tier rules.
- Schemas with unbounded `string` fields without `maxLength` — all string fields must declare a `maxLength`. This prevents oversized `offering_parameters` payloads from being carried through to the Activity Component output and into Layer 3.
- Schemas that declare `pricing_model` or pricing fields — pricing is defined in the Capability Declaration's top-level fields, not in `configuration_parameters`.

This list is not exhaustive. The general principle is that `configuration_parameters` schemas must be scoped to offering-specific parameterisation only. Schemas that collect data belonging to other protocol layers (identity, policy, pricing, PII) are rejected at registration regardless of whether the specific pattern is listed above.

---

## 4.5 Design Rule Compliance — Section 4

| Rule | Application in this section |
|------|----------------------------|
| L2-T-1-C | Section 4.0.2 establishes that a Feasibility Check may not be initiated until Activity Configuration is complete — enforcing the pipeline sequencing dependency. |
| Layer 3 T-2-B (noted for implementer awareness) | Section 4.1.2 specifies that `configuration_notes` are classified as `CUSTOMER_INPUT`. When this field is passed through the Layer 3 ASSEMBLY POINT, Layer 3 design rule T-2-B applies — no direct path from raw `configuration_notes` content to an AI agent invocation is permitted. Sanitisation is enforced at the ASSEMBLY POINT, not at Activity Configuration time. |
| L2-T-3-C | Sections 4.1.1 and 4.3.1 require `capability_declaration_version_id` to be carried through from configuration input to Activity Component output, enabling the Feasibility Check operation to validate declaration currency per L2-T-3-C. |
| L2-T-4-A | Section 4.2.1 specifies that `NEGOTIATED` pricing requires a `pre_arrangement_declaration_id` reference — Pre-Arrangement Declarations take effect through the Layer 3 Security Kernel Cedar evaluation, consistent with L2-T-4-A. |

---

*Activity Travel Protocol — Layer 2 Discovery and Capability Specification — Working Draft — Section 4 — March 2026*
