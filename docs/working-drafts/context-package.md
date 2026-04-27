# Context Package Specification

::: info Working Draft
This document is a Working Draft. It is the canonical Layer 1 Context Package schema reference — all Schema Amendment Requests SAR-1 through SAR-21 applied, current as of Step 6. Use this document to look up schema fields, validation rules, and state machine definitions. To understand the design decisions behind this schema, see the [Context Package Design Rationale](/working-drafts/context-package-design).
:::

| Field | Value |
|---|---|
| Document ref | ATP_ContextPackage_Step6_v1 |
| Schema version | v6 (SAR-1 through SAR-21 applied) |
| Status | Complete — Layer 2 and Layer 3 specifications published. Canonical Layer 1 Context Package reference. |
| Contributor | Tom Sato (MyAuberge K.K.) |
| Date | March 2026 |

## What This Document Is

The Context Package is what the Activity Travel Protocol runtime delivers to an AI agent at every invocation point — the precisely scoped information the agent needs to make a specific decision. The Decision Object is what the agent returns. Both are first-class protocol artifacts with defined schemas, signing requirements, and Security Kernel enforcement.

This document defines the canonical schema for both. Every field, every enum value, every validation rule is specified here. The schema was developed across six sessions and carries 21 Schema Amendment Requests. All are consolidated here into a single reference.

**Six Decision Types** determine which variant of the Context Package is assembled. Each Decision Type targets a specific class of decision at a specific point in the booking lifecycle. The design rationale document explains the taxonomy in full; the invocation matrix below gives the working reference.

**Invocation matrix** — participation levels at which each Decision Type applies per booking state:

| State | DT-1 Config | DT-2 Feasib. | DT-3 Policy | DT-4 Disrupt. | DT-5 Monitor | DT-6 Negot. |
|---|---|---|---|---|---|---|
| `INQUIRY` | L1–L3 | L1–L3 | — | — | — | — |
| `NEGOTIATION` | L1–L2 | L1–L3 | L1–L2 | — | — | L2–L3 † |
| `PROPOSAL` | — | L1–L3 | L1–L2 | L1–L2 | — | L1–L2 |
| `CONFIRMATION` | — | — | L1–L2 * | — | — | — |
| Fulfillment sub-states | — | — | L1–L2 | — | L2–L3 | — |
| `DISRUPTION_REVIEW` | — | L2–L3 | L1–L2 | L2–L3 | L2–L3 | — |
| `AMENDMENT` | — | L1–L3 | L1–L2 | — | — | L2–L3 |
| `INCIDENT` Cat A | — | — | — | L1 | L1 | — |
| `INCIDENT` Cat B | — | — | — | L1–L2 | L1–L2 | — |
| `INCIDENT` Cat C1 | — | — | — | L2–L3 ‡ | L2–L3 ‡ | — |
| `INCIDENT` Cat C2/C3 | — | — | — | L1–L2 | L1–L2 | — |
| `PARTY_UNRESPONSIVE` | — | — | — | L2–L3 | L2–L3 | — |

\* `CONFIRMATION`: `human_escalation_requested = true` enforced by Security Kernel at all levels — not configurable.
† DT-6 L2–L3 A2A multi-agent: forward reference, excluded from initial scope.
‡ C1 autonomous declaration: only when all four mandatory conditions are met.

## Version Lineage

v1 (base, Steps 3 & 4) → v3 (SAR-1 through SAR-9 applied) → v6 (this document, SAR-10 through SAR-21 applied).

v2, v4, and v5 were not produced as separate documents. Do not reference intermediate version numbers — they do not exist.

---

## 1. Step 6 Security Constraints

### 1.1 Signing Algorithm

Both `context_package_signature` and `decision_object_signature` use ES256 (ECDSA with P-256 and SHA-256), aligning with FAPI 2.0 Security Profile and W3C VC Data Model 2.0.

| Field | Algorithm | Key source | Signs |
|---|---|---|---|
| `context_package_signature` | ES256 (ECDSA / P-256 / SHA-256) | Party signing key registered at Party Registry | `assembled_at` + `booking_id` + `invocation_id` + `booking_state` hash |
| `decision_object_signature` | ES256 | AI agent signing key declared in `AgentAuthorityDeclaration` | `proposed_action` + `reasoning` + `confidence` |

### 1.2 CUSTOMER_INPUT Sanitisation Rules

All fields carrying `x-data-classification: CUSTOMER_INPUT` must pass through the sanitisation pipeline before inclusion in a Context Package presented to an AI agent. The pipeline applies in order:

1. Strip HTML tags and JavaScript protocol handlers (`javascript:`, `data:`)
2. Normalise Unicode to NFC to prevent homoglyph injection
3. Enforce field-level `maxLength` constraints — truncate and flag if exceeded
4. Apply prompt injection pattern detection: flag any field containing role-instruction-style phrasing for human review before agent invocation
5. Log sanitisation events to the audit trail (OpenTelemetry span attribute: `atp.sanitisation.triggered`)

::: danger
`CUSTOMER_INPUT` fields must never be passed verbatim to an AI agent without sanitisation. Sanitisation is a non-bypassable Security Kernel function.
:::

### 1.3 TRAVELER_PII Sanitisation Rules

`TRAVELER_PII` fields require encryption at rest (AES-256-GCM) and are subject to jurisdiction-specific retention deadlines.

- Must never appear in the precedent index.
- Must be excluded from all OpenTelemetry span attributes — the audit trail records the fact of access, not the value.
- Assembled only at the access level required by the current decision type.
- Purged at or before `TravelerContext.retention_deadline`. Contact references nulled within 24 hours of booking lifecycle end.

### 1.4 Full Audit Chain — DOR-5 Enforcement

- The runtime must verify that `source_signal_reference`, when present, resolves to an entry in the event log for this `booking_id`.
- For `DT-4 AUTONOMOUS_INCIDENT_DECLARATION`, `source_signal_reference` is mandatory. A Decision Object without it is rejected by the Security Kernel regardless of confidence or reasoning length.
- Exact `prior_decision_hash` match on a different `invocation_id` triggers `DECISION_REPLAY_DETECTED` escalation.

---

## 2. ContextPackageBase Schema (SAR-13 applied)

::: info SAR-13 — add `location_disclosure_blocked`
Set to `true` by the runtime when an active TU-6 (`TRAVELER_VICTIM_OF_CRIME`) incident is declared. Blocks assembly of any field carrying traveler location, accommodation, or itinerary data — regardless of agent authority scope. Set and cleared only by the Security Kernel. Clearing condition: explicit law enforcement confirmation only.
:::

| Field | Type | Req. | Description |
|---|---|---|---|
| `location_disclosure_blocked` | boolean | optional | SAR-13. Set to `true` when active TU-6 incident declared. Defaults to `false` (omitted). `x-assembly-source: RUNTIME_GENERATED`. |

---

## 3. Shared Object Schemas

### 3.1 AgentAuthorityDeclaration (SAR-11 applied)

::: info SAR-11 — add `BUSINESS_GROUP_LEAD` to scope enum
An agent holding `BUSINESS_GROUP_LEAD` scope is authorised to make booking decisions on behalf of all members of a `TravelerGroup` where `decision_authority = CORPORATE_ACCOUNT`. Blocking registration error if declared without a registered corporate account Party.
:::

#### Updated scope enum

| Scope value | Description |
|---|---|
| `INQUIRY_ONLY` | Read-only participation. Agent may assemble and read Context Package; may not propose actions. |
| `NEGOTIATION` | Agent may propose and respond to negotiation actions within DT-6 authority bounds. |
| `BOOKING_AMENDMENT` | Agent may propose amendments within the amendment policy declared by Parties. |
| `DISRUPTION_RESPONSE` | Agent may propose disruption response actions within DT-4 authority bounds. |
| `FULFILMENT_MONITORING` | Agent may propose fulfilment monitoring actions within DT-5 authority bounds. |
| `BUSINESS_GROUP_LEAD` | **SAR-11 NEW.** Decision authority for a `TravelerGroup` with `decision_authority = CORPORATE_ACCOUNT`. |

### 3.2–3.4, 3.6–3.11 Unchanged Schemas

Sections 3.2–3.4, 3.6–3.8, 3.10–3.11 are unchanged from v3. Section 3.9 (`PrecedentRecord`, SAR-3), Section 3.13 (`TravelerGroup`), and Section 3.14 (`PartyCapabilityDeclaration`) are unchanged from v3.

### 3.5 SourceSignalRecord (SAR-18 applied)

::: info SAR-18 — add IATA IROPS category code
When the source signal originates from an airline-connected disruption event, `iata_irops_category_code` carries the IATA IROPS category code as standard vocabulary. Absent for non-airline signals.
:::

| Field | Type | Req. | Description |
|---|---|---|---|
| `iata_irops_category_code` | string | optional | SAR-18. IATA IROPS disruption category code. Present only when `signal_category = CAT_C` and the originating carrier provides an IATA IROPS code. `x-assembly-source: SOURCE_SIGNAL`. |

### 3.12 TravelerContext (SAR-10 applied)

::: info SAR-10 — replace `TU_3_TRAVELER_ABSCONDED`
Removed. Replaced by `TU_3A_TRAVELER_OVERDUE` and `TU_3B_TRAVELER_DEPARTED_IRREGULARLY`. Rationale: "absconded" carries serious legal and reputational weight — applying it to someone who simply extended their stay could cause real harm. Existing data migration: stored `TU_3_TRAVELER_ABSCONDED` values treated as `TU_3A_TRAVELER_OVERDUE` pending human sub-category review. Migration must be logged to the audit trail.
:::

#### Updated `traveler_unreachable_category` enum

| Enum value | Description | Human confirm required? |
|---|---|---|
| `TU_1_DEVICE_UNAVAILABLE` | Traveler physically present, reachable via alt contact. Phone broken, lost, or flat. | No |
| `TU_2_TRAVELER_MISSING` | Traveler cannot be physically located. Welfare concern. | No — escalate immediately |
| `TU_3A_TRAVELER_OVERDUE` | **SAR-10 NEW.** Traveler has not appeared or returned as expected. Default assumption: benign. | No |
| `TU_3B_TRAVELER_DEPARTED_IRREGULARLY` | **SAR-10 NEW.** Traveler left jurisdiction/booking context in manner raising commercial or legal concern. | **YES — must not be set autonomously** |
| `TU_4_CONTACT_SUSPENDED` | Traveler has deliberately suspended contact. Default classification when no evidence supports a more specific sub-category. | No |
| `TU_5_TRAVELER_DECEASED` | Confirmed or strongly suspected death of traveler during booking lifecycle. | **YES — must not be set autonomously** |
| `TU_6_TRAVELER_VICTIM_OF_CRIME` | Traveler is victim of crime — kidnap, serious assault, robbery, detention by non-state actor. | **YES — must not be set autonomously** |

::: tip Classification Rules
**Sub-category Precedence:** TU-6 takes precedence over TU-2. TU-5 takes precedence over all.
**Default Classification:** when first declared with no specific evidence, runtime must default to `TU_4_CONTACT_SUSPENDED`.
**Unaccompanied Minor:** any sub-category other than TU-4 escalates immediately to `GUARDIAN_ONLY` authority.
:::

### 3.15 TravelerWellnessStatus (NEW — SAR-14)

**Schema `$id`:** `https://schema.activity.travel/context-package/TravelerWellnessStatus/v6`

`x-data-classification: TRAVELER_PII` (all fields). `x-availability-tracked: true`. Must never appear in the precedent index.

#### Wellness tier fields

| Field | Type | Req. | Description |
|---|---|---|---|
| `wellness_tier` | enum | required | `W0` \| `W1` \| `W2` \| `W3` \| `W4`. W0 = no declared condition (default). W1 = pre-existing declared condition, stable. W2 = active wellness event (runtime incident). W3 = medical purpose travel. W4 = disability or reduced mobility. |
| `wellness_clearance_ref` | string (URI) | optional | FREMEC-equivalent clearance reference. `x-assembly-source: PARTY_REGISTRY`. |
| `ssr_codes` | array[string] | optional | IATA SSR codes. Key values: `MEDA`, `WCHR`/`WCHS`/`WCHC`, `BLND`, `DEAF`, `DPNA`, `STCR`, `OXYG`. `minItems: 1` when present. |

#### W2 active wellness event fields

Present only when `wellness_tier = W2`.

| Field | Type | Req. | Description |
|---|---|---|---|
| `wellness_event_type` | enum | required when W2 | `ILLNESS_MILD` \| `ILLNESS_SERIOUS` \| `INJURY` \| `HOSPITALISED` \| `REQUIRES_REPATRIATION` \| `RECOVERED` |
| `wellness_event_declared_by` | enum | required when W2 | `BOOKING_PARTY` \| `DUTY_OF_CARE_PARTY` \| `TRAVELER` \| `AUTHORITY` |
| `treating_facility_ref` | string (encrypted ref) | optional | Encrypted reference if `HOSPITALISED`. `TRAVELER_PII`. Accessible only by duty-of-care Party and law enforcement. |
| `fit_to_continue` | boolean | optional | `true` when fitness to continue confirmed. Required before booking resumption after W2 event. |
| `repatriation_required` | boolean | optional | `true` when duty-of-care Party determines traveler needs to return home. Triggers DT-4 rebooking authority. |

#### JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schema.activity.travel/context-package/TravelerWellnessStatus/v6",
  "title": "TravelerWellnessStatus",
  "x-data-classification": "TRAVELER_PII",
  "x-availability-tracked": true,
  "type": "object",
  "required": ["wellness_tier"],
  "properties": {
    "wellness_tier": { "type": "string", "enum": ["W0","W1","W2","W3","W4"] },
    "wellness_clearance_ref": { "type": "string", "format": "uri" },
    "ssr_codes": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "wellness_event_type": { "type": "string",
      "enum": ["ILLNESS_MILD","ILLNESS_SERIOUS","INJURY","HOSPITALISED","REQUIRES_REPATRIATION","RECOVERED"] },
    "wellness_event_declared_by": { "type": "string",
      "enum": ["BOOKING_PARTY","DUTY_OF_CARE_PARTY","TRAVELER","AUTHORITY"] },
    "treating_facility_ref": { "type": "string" },
    "fit_to_continue": { "type": "boolean" },
    "repatriation_required": { "type": "boolean" }
  },
  "if": { "properties": { "wellness_tier": { "const": "W2" } } },
  "then": { "required": ["wellness_event_type","wellness_event_declared_by"] },
  "additionalProperties": false
}
```

### 3.16 Booking Object Additions (SAR-15 applied)

| Field | Type | Req. | Description |
|---|---|---|---|
| `claim_initiation_ref` | string (URI) | optional | SAR-15. Reference to the active claim record. Activated on `SUPPLIER_FAILURE_AT_DELIVERY` or TU-3a/TU-3b financial loss. Null when no claim is active. `x-assembly-source: BOOKING_OBJECT`. |

### 3.17 SUPPLIER_FAILURE_AT_DELIVERY Incident Schema (NEW — SAR-19)

**Schema `$id`:** `https://schema.activity.travel/context-package/SupplierFailureAtDelivery/v6`

**Burden-of-proof inversion:** once a booking reaches `CONFIRMATION` and the delivery window opens, the supplier bears the burden of proving delivery occurred. `claim_initiation_ref` is activated by default on declaration.

#### Incident type taxonomy

| Category | Label | Definition | Human confirm? |
|---|---|---|---|
| SF-1 | `NO_SHOW_SUPPLIER` | Supplier failed to appear or open at confirmed time and location. | No |
| SF-2 | `SERVICE_NOT_AS_DESCRIBED` | Supplier appeared but delivered a materially different service. | **YES** |
| SF-3 | `FORCED_CANCELLATION_AT_DELIVERY` | Supplier cancelled at point of delivery citing reasons within their control. | No |

#### Schema fields

| Field | Type | Req. | Description |
|---|---|---|---|
| `incident_id` | string (UUID v7) | required | Unique per incident. |
| `incident_type` | enum | required | `SUPPLIER_FAILURE_AT_DELIVERY` (constant). |
| `failure_category` | enum | required | `SF-1` \| `SF-2` \| `SF-3`. SF-2 requires human confirmation before being set. |
| `declared_at` | datetime (UTC) | required | Runtime clock timestamp. |
| `declared_by` | string (party_id) | required | DID of declaring Party. |
| `supplier_party_id` | string (party_id) | required | DID of supplier that failed to deliver. |
| `delivery_window_opened_at` | datetime (UTC) | required | When booking reached `CONFIRMATION` and service was due. Burden-of-proof inversion applies from this point. |
| `supplier_evidence_deadline` | datetime (UTC) | required | `RUNTIME_GENERATED`. `delivery_window_opened_at` + PT24H. If no evidence by deadline: claim proceeds automatically. |
| `claim_initiation_ref` | string (URI) | required | Must match Booking Object `claim_initiation_ref` for this incident. |
| `traveler_present` | boolean | required | `true` if traveler was present or attempted to be present. |
| `sf2_human_confirmation_ref` | string (URI) | conditional | Required when `failure_category = SF-2`. |

#### DOR rule additions

| Rule ID | Rule | Effect |
|---|---|---|
| DOR-9 | Decision Object interacting with active `SUPPLIER_FAILURE_AT_DELIVERY` incident must include `source_signal_reference` pointing to `incident_id` in the event log. | Reject if absent or non-resolving. |
| DOR-10 | SF-2 classification requires `sf2_human_confirmation_ref`. Runtime must verify reference resolves before committing. | Reject SF-2 without verified confirmation. |
| DOR-11 | Traveler acceptance of SF-2 substitution must be recorded as a Decision Object. Autonomous acceptance not permitted. | Reject without explicit traveler consent reference. |

---

## 4. DT Extension Schemas (SAR-18 interaction note)

DT1Extension through DT6Extension are unchanged from v3. SAR interaction for DT4 and DT5:

| DT Extension | Interaction with Step 6 amendments |
|---|---|
| DT1–DT3, DT6 | No interaction with SAR-10 through SAR-21. |
| DT4Extension | `SUPPLIER_FAILURE_AT_DELIVERY` activates when a supplier fails at delivery during DT-4 FULFILLMENT states. `claim_initiation_ref` activated by runtime, not agent. Agents interacting with active SUPPLIER_FAILURE incidents must include `source_signal_reference` (DOR-9). `TravelerWellnessStatus` W2 `REQUIRES_REPATRIATION` activates DT-4 rebooking authority. `BOOKING_SUSPENDED` terminates all DT-4 action authority. |
| DT5Extension | `TravelerWellnessStatus` W2 active event fields (`wellness_event_type`, `fit_to_continue`) are key monitoring inputs. SF-1 `NO_SHOW_SUPPLIER` is the primary failure type surfaced in DT-5 monitoring. |

---

## 5. Booking State Machine (SAR-16, SAR-17 applied)

SAR-16 and SAR-17 add two new states. All existing states are unchanged.

### 5.1 BOOKING_SUSPENDED state (SAR-16)

#### Entry conditions — three and only three

| Entry path | Trigger | Notes |
|---|---|---|
| Path 1 (primary) | TU-5 `TRAVELER_DECEASED` confirmed or strongly suspected | Requires human confirmation before `TU_5_TRAVELER_DECEASED` is set. `BOOKING_SUSPENDED` transition follows immediately. |
| Path 2 | Legal authority order requiring booking suspension | Court order, law enforcement hold, or immigration authority instruction. Authority identity logged to audit trail. |
| Path 3 | Booking Party declaration of force majeure affecting the entire booking | Distinct from `DISRUPTION_REVIEW`. Booking Party must provide force majeure declaration reference. |

#### State characteristics

| Characteristic | Definition |
|---|---|
| Autonomous actions | HALTED — absolute, no exceptions. |
| State machine transitions | FROZEN — booking cannot move to any other state without explicit human unlock. No timeout mechanism applies. |
| `available_actions` | EMPTY for all agent invocations — Security Kernel returns empty set regardless of authority scope. |
| Context Package assembly | PERMITTED for read-only purposes. No Decision Object execution follows. |
| `TRAVELER_PII` retention deadlines | SUSPENDED — all data preserved until suspension resolved. |
| SSF monitoring | CONTINUES — runtime does not stop listening for security events. |
| `location_disclosure_blocked` | Remains active if `BOOKING_SUSPENDED` entered via TU-6 pathway. Cleared only by law enforcement confirmation. |

#### Exit conditions — authority-gated

| Exit path | Authority required | Result |
|---|---|---|
| Path A | Next-of-kin or legal authority confirmation | Booking transitions to `BOOKING_CANCELLED_SUSPENDED` terminal state. |
| Path B | Legal authority order lifting the suspension | Booking returns to pre-suspension state. `suspension_lifted_by` audit record added. |
| Path C | Booking Party determination with authority confirmation that suspension trigger was incorrect | Booking returns to pre-suspension state with full audit record of erroneous declaration. |

::: tip
`BOOKING_SUSPENDED` is not `PARTY_UNRESPONSIVE` (which has timeouts). It is not `DISRUPTION_REVIEW` (which has a resolution path). It is not a terminal state. It is a full stop requiring human authority to exit.
:::

### 5.2 BOOKING_CANCELLED_SUSPENDED terminal state (SAR-17)

Entry: exclusively from `BOOKING_SUSPENDED` Path A.

| Characteristic | Definition |
|---|---|
| State type | Terminal — no exit path. |
| `TRAVELER_PII` retention | Retained until jurisdiction authority confirms purge is appropriate. |
| `claim_initiation_ref` | Remains active — supplier claim path survives the terminal state. |
| Audit flag | Carries `suspended_cancellation: true` in the event log. Distinct from normal `CANCELLATION`. |

---

## 6. Named Protocol Events (SAR-20, SAR-21)

Named protocol events are first-class protocol events with defined authority gates, triggering conditions, and state effects. They are not simple field updates.

### 6.1 TRAVELER_FOUND (SAR-20)

Applicable to TU-2 and TU-6. Not applicable to TU-5.

| Property | Definition |
|---|---|
| Authority gate | (a) duty-of-care Party, (b) confirmed Jurisdiction Registry authority contact, or (c) traveler via re-established contact. For TU-6: law enforcement confirmation required. |
| On declaration | `traveler_unreachable_category` nulled. DT-4 autonomous hold released. Active escalation marked resolved. Incident record preserved and closed but not purged. |
| Sub-category downgrade | Sole protocol-permitted downgrade path that does not require separate authority confirmation. |
| Autonomous action | Does not auto-resume. Duty-of-care Party must issue explicit booking resumption confirmation as a separate step. |
| Condition assessment | Three-path prompt: (A) traveler able to continue — booking resumes; (B) traveler requires assistance — booking held; (C) traveler wishes to cancel — cancellation and repatriation authorised. |

#### TRAVELER_FOUND event schema fields

| Field | Type | Req. | Description |
|---|---|---|---|
| `event_type` | string (constant) | required | `TRAVELER_FOUND` |
| `event_id` | string (UUID v7) | required | Unique protocol event identifier. |
| `declared_at` | datetime (UTC) | required | Runtime clock timestamp. |
| `declared_by_party_id` | string (DID) | required | DID of declaring Party. |
| `authority_type` | enum | required | `DUTY_OF_CARE_PARTY` \| `JURISDICTION_AUTHORITY` \| `TRAVELER_SELF` \| `LAW_ENFORCEMENT`. For TU-6 must be `LAW_ENFORCEMENT`. |
| `law_enforcement_ref` | string (URI) | conditional | Required when resolving TU-6. |
| `prior_tu_category` | enum | required | Must be `TU_2_TRAVELER_MISSING` or `TU_6_TRAVELER_VICTIM_OF_CRIME`. |
| `condition_assessment_path` | enum | required | `A_CONTINUE` \| `B_ASSISTANCE_REQUIRED` \| `C_CANCEL_REPATRIATE`. Must be set before any resumption action proceeds. |

### 6.2 RECOVERED (SAR-21)

`RECOVERED` is the wellness equivalent of `TRAVELER_FOUND`. Applicable to `TravelerWellnessStatus` W2 resolution. On declaration: `wellness_event_type` updated to `RECOVERED`, `fit_to_continue` assessment required, three-path condition assessment surfaced to duty-of-care Party.

| Field | Type | Req. | Description |
|---|---|---|---|
| `event_type` | string (constant) | required | `RECOVERED` |
| `event_id` | string (UUID v7) | required | Unique protocol event identifier. |
| `declared_at` | datetime (UTC) | required | Runtime clock timestamp. |
| `declared_by_party_id` | string (DID) | required | DID of declaring Party. |
| `authority_type` | enum | required | `BOOKING_PARTY` \| `DUTY_OF_CARE_PARTY` \| `TRAVELER` \| `MEDICAL_PROFESSIONAL`. |
| `prior_wellness_event_type` | enum | required | The `wellness_event_type` being resolved. Must not be `RECOVERED`. |
| `fit_to_continue` | boolean | required | Must be explicitly set — does not default to `true`. |
| `condition_assessment_path` | enum | required | `A_CONTINUE` \| `B_ASSISTANCE_REQUIRED` \| `C_CANCEL_REPATRIATE`. |
| `medical_confirmation_ref` | string (URI) | conditional | Required when `authority_type = MEDICAL_PROFESSIONAL`. |

---

## 7. DecisionObject Schema (SAR-12 applied)

All fields from v3 unchanged. SAR-12 adds `REASONING_INSUFFICIENT` to `escalation_reason`.

::: info SAR-12 — add `REASONING_INSUFFICIENT`
Used when a Decision Object's `reasoning` field fails the per-action minimum length check (DOR-7-SAR2). More precise than `CONFIDENCE_UNDERRUN`, which was used as an interim value. `CONFIDENCE_UNDERRUN` remains valid for confidence-floor failures only — the two values are now distinct.
:::

### Updated escalation_reason enum

| Value | Trigger | Source |
|---|---|---|
| `CONFIDENCE_UNDERRUN` | Confidence value below per-action minimum threshold | Step 5 / SAR-2. Retained for confidence-value failures only. |
| `REASONING_INSUFFICIENT` | `reasoning` field shorter than per-action minimum (DOR-7-SAR2) | **SAR-12 NEW.** |
| `ASSEMBLY_FAILURE` | Cedar evaluation timeout or failure on blocking DT | FR-5.3. `protocol_deadline`: PT10M. |
| `CREDENTIAL_COMPROMISED_GATE` | Active RISC Credential Compromised event on `agent_id` | SSF-Q2. Full execution gate. |
| `SSF_REVOCATION_DURING_C1_WINDOW` | C1 trigger SSF event during PT15M reversal window | SSF-Q4. |
| `DECISION_REPLAY_DETECTED` | Exact Decision Object hash match on different `invocation_id` for same `booking_id` | DT-Q4. Hard protocol rule. |
| `TRAVELER_UNREACHABLE_UNRESOLVED` | Alt contact not confirmed within TU-1 timeout | TU-1. |
| `TRAVELER_MISSING` | TU-2 declared | TU-2. Invoked immediately. |
| `TRAVELER_OVERDUE` | TU-3a alt contact not confirmed within PT20M | TU-3a. |
| `TRAVELER_DEPARTED_IRREGULARLY` | TU-3b confirmed by human actor | TU-3b. |
| `TRAVELER_DECEASED` | TU-5 confirmed or strongly suspected | TU-5. Invoked immediately. |
| `TRAVELER_VICTIM_OF_CRIME` | TU-6 confirmed | TU-6. Invoked immediately. PT10M deadline. |

---

## 8. Security Kernel Validation Rules (Step 6 additions)

DOR-1 through DOR-8 unchanged from v3. Step 6 adds three new rules and updates DOR-7.

| Rule ID | Rule | Effect |
|---|---|---|
| DOR-1 to DOR-8 | Unchanged from v3. | — |
| DOR-7-SAR2 (updated) | `reasoning` ≥ per-action minimum. `REASONING_INSUFFICIENT` replaces `CONFIDENCE_UNDERRUN` for reasoning-length failures. `CONFIDENCE_UNDERRUN` retained for confidence-value failures. | Reject if below floor. Re-invoke once. If still short: HEM with `REASONING_INSUFFICIENT`. |
| DOR-9 | Decision Object interacting with active `SUPPLIER_FAILURE_AT_DELIVERY` incident must include `source_signal_reference` pointing to `incident_id`. | Reject if absent or non-resolving. |
| DOR-10 | SF-2 classification requires `sf2_human_confirmation_ref`. Runtime must verify reference resolves before committing. | Reject SF-2 without verified confirmation. |
| DOR-11 | Traveler acceptance of SF-2 substitution must be a Decision Object. Autonomous acceptance not permitted. | Reject without explicit traveler consent reference. |

---

## 9. CP-S3 Input Traceability (Step 6 update)

| Input ID | DT scope | Step 6 update |
|---|---|---|
| CP-S3-1 | DT-1 | Unchanged from v3. |
| CP-S3-2 | DT-2 | Unchanged from v3. |
| CP-S3-3 | DT-3 | Unchanged from v3. |
| CP-S3-4 | DT-4 | `SUPPLIER_FAILURE_AT_DELIVERY` activates within DT-4 FULFILLMENT states. `claim_initiation_ref` hook provides claim state. W2 `REQUIRES_REPATRIATION` activates DT-4 rebooking authority. `BOOKING_SUSPENDED` terminates all DT-4 action authority. |
| CP-S3-5 | DT-5 | W2 active event fields (`wellness_event_type`, `fit_to_continue`) are key DT-5 monitoring inputs. SF-1 `NO_SHOW_SUPPLIER` is primary failure type surfaced in DT-5 monitoring. |
| CP-S3-6 | DT-6 | Unchanged from v3. `BOOKING_SUSPENDED` terminates DT-6 negotiation authority. |
| CP-S3-7 | All | `TravelerWellnessStatus` and `SUPPLIER_FAILURE_AT_DELIVERY` incident fields must never appear in the precedent index. `TRAVELER_PII` constraint enforced. |
| CP-S3-8 | All | `AgentAuthorityDeclaration` (SAR-11: `BUSINESS_GROUP_LEAD` added). `DecisionObject` (SAR-12: `REASONING_INSUFFICIENT` added). DOR-9, DOR-10, DOR-11 added. |
| CP-S3-9 | All | `ContextPackageBase` (SAR-13: `location_disclosure_blocked` added). `ActivityTimeContext` unchanged from v3. |
| CP-S3-10 | All | `TRAVELER_PII` sanitisation rules: Section 1.3. `CUSTOMER_INPUT` sanitisation pipeline: Section 1.2. `SUPPLIER_FAILURE_AT_DELIVERY` incident fields carry `BOOKING_OBJECT` classification — not `TRAVELER_PII`. |

---

## 10. Layer 2 Forward Compatibility

| Requirement | Schema location | Layer 2 action |
|---|---|---|
| Capability Catalogue wellness requirements | `TravelerWellnessStatus.ssr_codes` | Layer 2 Capability Declaration must allow suppliers to declare SSR-compatible service capabilities. W4 SSR codes must be checkable against supplier declarations at booking assignment. |
| Supplier failure taxonomy | `SUPPLIER_FAILURE_AT_DELIVERY.failure_category` | Layer 2 Capability Declaration should allow suppliers to declare no-show and service delivery guarantee policies. |
| Jurisdiction law enforcement contacts | Jurisdiction Compliance Registry | Layer 2 Jurisdiction Registry entries must include law enforcement and emergency services contact references. Required by TU-2, TU-5, TU-6. |
| IATA welfare obligation thresholds | Jurisdiction Compliance Registry | Entries for JP, EU, GB, US must incorporate IATA welfare obligation thresholds as baseline duty-of-care parameters. |

---

## 11. Open Questions Status

| Item | Status | Resolution |
|---|---|---|
| SAR-10 through SAR-21 | APPLIED | Applied in this document (v6). |
| `REASONING_INSUFFICIENT` label | CLOSED | SAR-12 applied. |
| `BOOKING_SUSPENDED` and `BOOKING_CANCELLED_SUSPENDED` | CLOSED | SAR-16, SAR-17 applied. |
| `BUSINESS_GROUP_LEAD` scope | CLOSED | SAR-11 applied. |
| `SUPPLIER_FAILURE_AT_DELIVERY` + `claim_initiation_ref` | CLOSED | SAR-19, SAR-15 applied. |
| `TravelerWellnessStatus` full schema | CLOSED | SAR-14 applied. |
| `TRAVELER_FOUND` and `RECOVERED` event schemas | CLOSED | SAR-20, SAR-21 applied. |
| NDC compatibility bridge | OPEN — Layer 4 | Named Layer 4 deliverable. |
| `SUPPLIER_FAILURE_AT_DELIVERY` commercial spec | OPEN — separate spec | Payment, compensation, dispute resolution outside ATP core scope. |
| SSF/RISC remediation policy gap | OPEN — implementation guidance | Validate against live SSF implementation before protocol-committing. |
| TU chain live operational testing | OPEN — implementation guidance | All chains must be tested against real operational events. |
| Cross-invocation anomaly thresholds | OPEN — implementation guidance | Cannot be committed without live data. |
| A2A multi-agent DT-6 | OPEN — deferred | Watch for Google A2A protocol maturity. |

---

## 12. Items Deferred Beyond Step 6

| Item | Deferred to |
|---|---|
| NDC compatibility bridge and ONE Order mapping | Layer 4 |
| MEDIF-equivalent workflow implementation guidance | Companion implementation guidance paper |
| IATA SSR code reference guide and FREMEC implementation guidance | Companion implementation guidance paper |
| IATA welfare obligation thresholds in Jurisdiction Registry (JP, EU, GB, US) | Jurisdiction Registry entries update |
| `SUPPLIER_FAILURE_AT_DELIVERY` payment, compensation, settlement, dispute resolution | Separate commercial specification |
| Cross-jurisdiction enforcement of supplier failure claims | Separate commercial specification |
| Insurance integration for supplier failure and wellness events | Separate commercial specification |
| TU-3b companion implementation guidance | Companion implementation guidance paper |
| Escalation handling best practices for small operators and large OTAs | Companion implementation guidance paper |

---

::: info Step 6 Complete
SAR-10 through SAR-21 applied. All open items from v3 closed except deferred items in Section 12.

Next specification work: Layer 4 — Schema and SDK. Prerequisite: SDK Architecture Blueprint (Track 3 Session 2).
:::
