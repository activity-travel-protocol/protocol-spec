# Named Protocol Events

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 10 | April 2026

---

Named protocol events are first-class protocol events with defined authority gates, triggering conditions, and state effects. They are not simple field updates — they produce event log entries, trigger Kernel operations, and in most cases require human confirmation before they take effect. Implementing a named protocol event as a field update is a conformance violation.

Seven named protocol events are defined in Layer 3. Three originate in traveler welfare and supplier delivery: TRAVELER_FOUND, RECOVERED, and SUPPLIER_FAILURE_AT_DELIVERY. Their schemas are defined in Context Package Specification Step 6 (SAR-19, SAR-20, SAR-21). Four originate in multi-party coordination (Section 12): DUTY_OF_CARE_TRANSFER_INITIATED, DUTY_OF_CARE_ACCEPTED, COORDINATION_OWNER_ASSIGNED, and COORDINATION_DELEGATION_REQUESTED. This section specifies the workflow effects of all seven events within the Layer 3 state machine.

| Event | Schema source | Applicable to | Blocks JOURNEY_COMPLETED? | HEM triggered? |
|---|---|---|---|---|
| TRAVELER_FOUND | SAR-20 | TU-2 (TRAVELER_MISSING), TU-6 (TRAVELER_VICTIM_OF_CRIME). Not applicable to TU-5. | Yes — until assessment completed | HEM-19 (condition assessment) |
| RECOVERED | SAR-21 | TravelerWellnessStatus W2 (active wellness event) resolution | Yes — until assessment completed | HEM-20 (condition assessment) |
| SUPPLIER_FAILURE_AT_DELIVERY | SAR-19 | Any Activity Component in CONFIRMED or FULFILLING status where supplier fails to deliver | No — booking may continue | HEM-18 for SF-2 only |
| DUTY_OF_CARE_TRANSFER_INITIATED | S12 | Multi-party booking — transferring Fulfilling Party initiates handoff | No | No (unless gap period triggers HEM per 12.3.4) |
| DUTY_OF_CARE_ACCEPTED | S12 | Multi-party booking — receiving Fulfilling Party accepts handoff | No | No |
| COORDINATION_OWNER_ASSIGNED | S12 | Multi-party booking — Host Party Security Kernel assigns escalation owner during DoC gap | No | No (is itself a response to HEM context) |
| COORDINATION_DELEGATION_REQUESTED | S12 | Multi-party booking — Fulfilling Party requests Coordination Delegation from Host Party | No | No |

---

## 10.1 TRAVELER_FOUND

*Named protocol event — resolution of TU-2 and TU-6 unreachable chains*

### 10.1.1 Definition

TRAVELER_FOUND is the named protocol event that resolves a TU-2 (TRAVELER_MISSING) or TU-6 (TRAVELER_VICTIM_OF_CRIME) chain. It is not a field update to traveler_unreachable_category — it is a first-class event with its own schema, authority gate, and three-path condition assessment.

> **Not applicable to TU-5:** TRAVELER_FOUND does not apply to TU-5 (TRAVELER_DECEASED). A TU-5 chain can only resolve via BOOKING_SUSPENDED exit paths (Section 5.5). Declaring TRAVELER_FOUND against a TU-5 booking is rejected by the Kernel.

### 10.1.2 Authority gate

TRAVELER_FOUND may be declared by:

- The duty-of-care Party (Booking Party or Host Party, depending on active phase) — for TU-2.
- Law enforcement confirmation only — for TU-6. The duty-of-care Party alone is insufficient for TU-6. Law enforcement must explicitly confirm the traveler has been found and it is safe to proceed.

An AI agent may not declare TRAVELER_FOUND autonomously. An agent may surface a TRAVELER_FOUND assessment (DT-2) based on incoming signals, but the declaration requires human action from an authorised Party.

### 10.1.3 Schema fields (SAR-20)

| Field | Type | Description | Mandatory? |
|---|---|---|---|
| event_type | Enum: TRAVELER_FOUND | Identifies this as a TRAVELER_FOUND event | Yes |
| traveler_id | UUID | The traveler to whom the event applies | Yes |
| declared_by_party_id | Party ID | The Party making the declaration | Yes |
| declaration_timestamp | ISO 8601 | When the declaration was made | Yes |
| law_enforcement_ref | URI / reference | Law enforcement confirmation reference. Required for TU-6. Null for TU-2. | Conditional — required for TU-6 |
| location_at_found | String | Location where traveler was found. Excluded from Context Package assembly if location_disclosure_blocked is active. | Optional |
| condition_at_found | Enum: FIT \| REQUIRES_ASSISTANCE \| UNKNOWN | Initial welfare assessment at time of finding | Yes |
| tu_sub_category | Enum: TU_2 \| TU_6 | The sub-category being resolved | Yes |

### 10.1.4 Workflow effects on declaration

On TRAVELER_FOUND declaration, the Kernel executes the following in sequence:

1. Validates authority gate — declared_by_party_id has authority to declare for the applicable TU sub-category.
2. For TU-6: validates law_enforcement_ref is present and resolves to a Jurisdiction Registry authority contact record.
3. Records TRAVELER_FOUND event in the event log.
4. Invokes HEM-19 (TRAVELER_FOUND_CONDITION_ASSESSMENT, PT30M) — three-path assessment required.
5. For TU-6: location blackout (location_disclosure_blocked) remains active until law enforcement explicitly confirms it is safe to lift. The field is not cleared automatically on TRAVELER_FOUND.
6. Phase transitions that were frozen by TU-2 or TU-6 remain frozen until HEM-19 assessment is completed.

### 10.1.5 Three-path condition assessment (HEM-19)

The human actor responding to HEM-19 must select one of three assessment paths:

| Path | Condition | Protocol action |
|---|---|---|
| **Path A — Fit to continue** | Traveler is assessed as fit to continue the booking. condition_at_found: FIT. | traveler_unreachable_category nulled by Kernel. Phase transitions resume. For TU-6: location blackout lifted only after separate law enforcement confirmation. JOURNEY_COMPLETED gate reopens if no other blocking conditions. |
| **Path B — Requires assistance** | Traveler requires assistance and cannot continue the booking as planned. condition_at_found: REQUIRES_ASSISTANCE. | Booking enters DISRUPTION_REVIEW. Welfare pathway activated — contingency arrangements required. Booking Party notified. JOURNEY_COMPLETED blocked until welfare pathway resolved. May escalate to W2 wellness event if medical assistance is needed. |
| **Path C — Unreachable again** | Traveler cannot be confirmed as found or has become unreachable again immediately after initial contact. condition_at_found: UNKNOWN. | TU chain re-opened at the same sub-category. HEM re-invoked. JOURNEY_COMPLETED remains blocked. |

---

## 10.2 RECOVERED

*Named protocol event — resolution of W2 active wellness event*

### 10.2.1 Definition

RECOVERED is the wellness equivalent of TRAVELER_FOUND. It is a named protocol event — not a simple field update to wellness_event_type — with the same authority-gated declaration model. RECOVERED resolves a TravelerWellnessStatus W2 (active wellness event) and triggers a three-path condition assessment identical in structure to the TRAVELER_FOUND assessment.

### 10.2.2 Applicable conditions

RECOVERED applies to TravelerWellnessStatus W2 active wellness events:

- W2 ILLNESS_MILD — traveler had a mild illness during the journey.
- W2 ILLNESS_SERIOUS — traveler had a serious illness requiring medical attention.
- W2 INJURY — traveler sustained an injury during the journey.
- W2 HOSPITALISED — traveler was hospitalised during the journey.
- W2 REQUIRES_REPATRIATION — traveler requires repatriation. RECOVERED declared after repatriation is completed and traveler is assessed as stable.

RECOVERED is not applicable to W0 (no declared condition), W1 (pre-existing condition, stable), W3 (wellness support package), or W4 (disability/reduced mobility). TU-5 (TRAVELER_DECEASED) is the terminal escalation of a W2 event — RECOVERED does not apply if TU-5 has been confirmed.

### 10.2.3 Authority gate

RECOVERED may be declared by the duty-of-care Party (Booking Party or Host Party, depending on active phase). For W2 HOSPITALISED and W2 REQUIRES_REPATRIATION, a medical professional confirmation reference is required before the Kernel accepts the declaration. An AI agent may not declare RECOVERED autonomously.

### 10.2.4 Schema fields (SAR-21)

| Field | Type | Description | Mandatory? |
|---|---|---|---|
| event_type | Enum: RECOVERED | Identifies this as a RECOVERED event | Yes |
| traveler_id | UUID | The traveler to whom the event applies | Yes |
| declared_by_party_id | Party ID | The Party making the declaration | Yes |
| declaration_timestamp | ISO 8601 | When the declaration was made | Yes |
| medical_confirmation_ref | URI / reference | Medical professional confirmation. Required for W2 HOSPITALISED and W2 REQUIRES_REPATRIATION. | Conditional |
| wellness_event_type_resolved | Enum: W2 event types | The W2 event type being resolved | Yes |
| fit_to_continue | Boolean | Assessment of traveler's ability to continue the booking | Yes |
| repatriation_completed | Boolean | Whether repatriation was completed before recovery declaration. Applicable to W2 REQUIRES_REPATRIATION only. | Conditional |

### 10.2.5 Workflow effects on declaration

On RECOVERED declaration, the Kernel executes the following in sequence:

1. Validates authority gate — declared_by_party_id has authority to declare RECOVERED for this traveler.
2. For W2 HOSPITALISED and REQUIRES_REPATRIATION: validates medical_confirmation_ref is present.
3. Updates wellness_event_type to RECOVERED on TravelerWellnessStatus.
4. Records RECOVERED event in the event log.
5. Invokes HEM-20 (RECOVERED_CONDITION_ASSESSMENT, PT30M) — three-path assessment required.
6. JOURNEY_COMPLETED gate remains blocked until HEM-20 assessment is completed.

### 10.2.6 Three-path condition assessment (HEM-20)

| Path | Condition | Protocol action |
|---|---|---|
| **Path A — Fit to continue** | fit_to_continue: true. Traveler assessed as able to continue the booking. | W2 wellness event formally closed by Kernel. wellness_tier updated as appropriate. JOURNEY_COMPLETED gate reopens if no other blocking conditions. Any remaining booking components resume normally. |
| **Path B — Requires continuing care** | fit_to_continue: false. Traveler is recovering but cannot continue the booking as planned. | Booking enters DISRUPTION_REVIEW. Continuing care pathway activated. Booking Party determines whether remaining components should be cancelled or held. JOURNEY_COMPLETED blocked until care pathway resolved. |
| **Path C — Condition deteriorated** | Traveler's condition has deteriorated since RECOVERED declaration. Assessment cannot confirm recovery. | W2 wellness event re-opened at the same or escalated event type. If deterioration suggests TU-5 risk: duty-of-care Party notified immediately. HEM re-invoked. |

---

## 10.3 SUPPLIER_FAILURE_AT_DELIVERY

*Named protocol event — supplier fails to deliver a confirmed service at the point of delivery*

### 10.3.1 Definition

SUPPLIER_FAILURE_AT_DELIVERY is the named protocol event triggered when a supplier fails to deliver a confirmed and attempted Activity Component at the point of delivery. Its schema (SAR-19) and incident taxonomy (SF-1, SF-2, SF-3) are specified in Section 8.3. This section specifies the workflow effects of the event within the named protocol event model.

### 10.3.2 Authority gate

- SF-1 and SF-3: the Booking Party agent may declare within DISRUPTION_RESPONSE authority scope. No human confirmation required for the declaration itself.
- SF-2: no confirmation required for declaration, but traveler acceptance or rejection of the substitution requires human confirmation (HEM-18).

### 10.3.3 Workflow effects on declaration

On SUPPLIER_FAILURE_AT_DELIVERY declaration, the Kernel executes:

1. Validates incident category (SF-1, SF-2, or SF-3) based on supplied evidence.
2. Sets the Activity Component to FAILED status.
3. Activates claim_initiation_ref on the Booking Object.
4. Transfers duty of care to the Booking Party immediately, regardless of active phase.
5. Notifies the Supplier via IPC channel.
6. Starts the PT24H supplier evidence window.
7. For SF-2: invokes HEM-18 (SUPPLIER_FAILURE_SUBSTITUTION_REQUIRED, PT2H).

### 10.3.4 Booking continuation after declaration

The Booking Object does not automatically enter DISRUPTION_REVIEW on SUPPLIER_FAILURE_AT_DELIVERY declaration if the remaining Activity Components are unaffected. The duty-of-care Party determines whether to:

- Continue with remaining components (booking continues in current state).
- Source an alternative for the failed component (within duty-of-care Party authority scope for SF-1 and SF-3).
- Enter DISRUPTION_REVIEW if broader resolution is needed.
- Cancel the booking (BOOKING_CANCELLED with cancellation_reason: DISRUPTION_UNRESOLVABLE).

### 10.3.5 Supplier evidence window

The supplier has PT24H from the SUPPLIER_FAILURE_AT_DELIVERY declaration to provide delivery confirmation evidence to the Booking Party. This window is fixed — not configurable by any Party. If no evidence is provided within PT24H, the Kernel records SUPPLIER_EVIDENCE_DEADLINE_ELAPSED and the claim proceeds automatically. The burden-of-proof inversion rule (Section 8.3.2) is enforced by this fixed window.

---

## 10.4 Multi-party coordination events

The four multi-party coordination events are specified in full in Section 12. Their workflow effects are summarised here for completeness.

### 10.4.1 DUTY_OF_CARE_TRANSFER_INITIATED

Recorded by the transferring Fulfilling Party when initiating a duty-of-care handoff to another Fulfilling Party. This event opens the concurrent obligation window (DoC-2) during which both parties carry DoC obligations. The Kernel records the event and starts the DOC_TRANSFER_ACK_TIMEOUT (PT15M). See Section 12.3.1.

### 10.4.2 DUTY_OF_CARE_ACCEPTED

Recorded by the receiving Fulfilling Party to acknowledge and accept a duty-of-care transfer. This event closes the concurrent obligation window. The transfer is complete when this event is present in the Booking Object log. The event must be signed with the receiving party's Trust Chain key. See Section 12.3.2.

### 10.4.3 COORDINATION_OWNER_ASSIGNED

Recorded by the Host Party Security Kernel when an incident occurs during a DoC gap period and escalation ownership must be assigned. This event identifies which party leads the HEM response. See Section 12.3.4.

### 10.4.4 COORDINATION_DELEGATION_REQUESTED

Recorded by a Fulfilling Party when requesting a Coordination Delegation from the Host Party. This event starts the CD_ISSUANCE_TIMEOUT (PT30M). If the Host Party does not respond within PT30M, the requesting party may re-request. See Section 12.4.3.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 10 — April 2026*
