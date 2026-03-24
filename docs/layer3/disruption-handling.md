# Disruption Event Handling

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 8 | March 2026

---

This section specifies how the Activity Travel Protocol handles disruption events — unplanned incidents that affect the delivery of a confirmed booking. Three disruption categories are defined: operational disruptions (IROPS and equivalent), supplier failure at delivery, and force majeure. Each category has a defined declaration model, autonomous action permission set, and resolution path.

Disruption events are first-class protocol events. They are not error conditions — they are anticipated scenarios with specified handling paths. An implementation that cannot process disruption events is non-conformant.

## 8.1 Disruption event taxonomy

The three disruption categories are mutually exclusive at the incident level but may co-occur across Activity Components within a single booking.

| Category | Definition | Primary DT | Entry state | Authority to declare |
|---|---|---|---|---|
| IROPS / operational disruption | An external event disrupts planned travel operations — flight delay, cancellation, weather event, infrastructure failure. Service not yet attempted or delivery interrupted by external cause. | DT-4 AUTONOMOUS_INCIDENT_DECLARATION | DISRUPTION_REVIEW | Booking Party agent (within scope) or Carrier Party |
| SUPPLIER_FAILURE_AT_DELIVERY | A supplier fails to deliver a confirmed and attempted service at the point of delivery. Traveler present or attempted to be present. Supplier did not fulfil their obligation. | DT-4 AUTONOMOUS_INCIDENT_DECLARATION (SF-1, SF-3) or HEM-18 (SF-2) | DISRUPTION_REVIEW (if resolution needed) or direct claim path | Booking Party agent (SF-1, SF-3) or human confirmation (SF-2) |
| Force majeure | An extraordinary event beyond any party's control that makes fulfilment impossible or illegal — natural disaster, war, pandemic, government prohibition. | C-BS-3 BOOKING_SUSPENDED entry | BOOKING_SUSPENDED (if entire booking affected) or DISRUPTION_REVIEW (if partial) | Booking Party authorised representative — never autonomous |

---

## 8.2 DT-4 — Autonomous Incident Declaration

*The primary mechanism by which AI agents declare disruption events*

### 8.2.1 Scope and authority

DT-4 is the decision type by which an AI agent declares a disruption incident autonomously — without waiting for human instruction. It is the most consequential autonomous action the protocol permits. An agent operating within DISRUPTION_RESPONSE authority scope may issue a DT-4 Decision Object when source signal evidence supports the declaration.

DT-4 declarations are not errors. They are the expected protocol response to external disruption signals. The protocol is designed to be operated by AI agents in disruption scenarios — human reaction time is insufficient for real-time IROPS handling at scale.

### 8.2.2 Source signal requirement

A DT-4 Decision Object must carry a valid source_signal_reference (DOR-5, mandatory for DT-4). The source_signal_reference must resolve to an entry in the event log for this booking_id. A DT-4 Decision Object without a source_signal_reference is rejected by the Security Kernel regardless of confidence or reasoning length.

For airline-connected disruptions, the iata_irops_category_code field in SourceSignalRecord (SAR-18) should be populated where available. This enables Activity Travel Protocol-to-airline disruption taxonomy mapping without requiring the protocol to adopt IATA messaging format.

### 8.2.3 The C1 autonomous reversal window

Every DT-4 declaration opens a PT15M reversal window (the C1 window) during which the declaration may be reversed without audit consequence. This window exists to handle the common case where a disruption signal arrives, an agent declares an incident, and the disruption resolves itself before any downstream action has been taken.

**C1 window mechanics:**

- On DT-4 Decision Object acceptance: Kernel records INCIDENT_DECLARED event and starts the C1 clock.
- Reversible downstream actions (holds, notifications) are placed on hold during the window.
- Irreversible downstream actions (cancellations with financial consequence, confirmed rebookings) are not permitted during the C1 window without human confirmation.
- If the agent reverses the declaration within PT15M: INCIDENT_REVERSED recorded. Reversible actions unwound. No audit penalty.
- If no reversal within PT15M: declaration confirmed. Reversible actions execute. Normal disruption resolution path proceeds.
- If an SSF revocation event arrives during the C1 window: HEM-12 invoked. Window clock frozen. Human decision required (Section 6.3.3, HEM-12).

> **Irreversible actions during C1 window:** No irreversible downstream action may execute autonomously during the C1 reversal window. An agent that attempts to execute a cancellation with financial consequence during the C1 window is operating outside its authority scope. The Kernel rejects such actions and triggers HEM with escalation_reason: OUT_OF_SCOPE_ACTION.

### 8.2.4 DT-4 and DISRUPTION_REVIEW state

A confirmed DT-4 declaration (C1 window elapsed or explicitly confirmed) transitions the Booking Object from its current state into DISRUPTION_REVIEW. The current journey phase is preserved. Normal autonomous agent operations are constrained to HOLD_AND_PRESERVE within DISRUPTION_REVIEW unless the agent holds explicit DISRUPTION_RESPONSE authority scope.

An agent holding DISRUPTION_RESPONSE scope may propose alternative arrangements (DT-2) within DISRUPTION_REVIEW, but may not execute them autonomously — human confirmation from the duty-of-care Party is required before any rebooking or cancellation action executes.

### 8.2.5 DT-4 confidence floor

A minimum confidence value applies to DT-4 declarations. The per-action minimum is defined in the Decision Object schema (DOR-7, Context Package Specification Step 6). A DT-4 Decision Object with confidence below the floor is rejected by the Kernel and REASONING_INSUFFICIENT or CONFIDENCE_UNDERRUN is returned as the escalation_reason, triggering HEM-11 (ASSEMBLY_FAILURE) if OPA evaluation also fails.

---

## 8.3 SUPPLIER_FAILURE_AT_DELIVERY

*Supplier fails to deliver a confirmed service at the point of delivery*

### 8.3.1 Definition and distinguishing characteristics

A SUPPLIER_FAILURE_AT_DELIVERY incident is declared when all three of the following conditions are met:

- The service was confirmed — an Activity Component in CONFIRMED or FULFILLING status exists in the Booking Object.
- The traveler was present or attempted to be present — the traveler arrived at the delivery point or attempted to arrive within a reasonable window of the scheduled time.
- The supplier did not fulfil their obligation — the service was not delivered as booked.

This is distinct from a pre-delivery cancellation (normal cancellation rules apply) and from an IROPS-type disruption where delivery was prevented by an external cause beyond the supplier's control. The defining characteristic is: delivery was attempted and failed at the moment of delivery due to supplier failure.

### 8.3.2 Burden-of-proof inversion

Once a booking reaches CONFIRMED state and the delivery window opens, the supplier bears the burden of proving delivery occurred. This is the burden-of-proof inversion rule: the claim_initiation_ref hook is activated by default on SUPPLIER_FAILURE_AT_DELIVERY declaration. The supplier has PT24H to provide delivery confirmation evidence to the Booking Party. If no evidence is provided within PT24H, the claim proceeds automatically.

### 8.3.3 Incident type taxonomy

| Category | Code | Definition | Human confirmation required? | Autonomous response permitted? |
|---|---|---|---|---|
| Complete non-delivery | SF-1 | The service was not delivered at all. The supplier was absent, closed, or otherwise unable to provide any element of the booked service. | No — Booking Party agent may declare within authority scope | Yes — alternative service sourcing permitted within duty-of-care Party authority scope |
| Materially different substitution | SF-2 | A service was delivered but materially different from what was booked — different standard, different location, significant component missing. | No for declaration, but traveler acceptance or rejection of substitution requires human confirmation | No — traveler acceptance required before accepting substitution (HEM-18) |
| Partial delivery | SF-3 | The service was partially delivered — some elements fulfilled, others not. Traveler received partial value. | No — Booking Party agent may declare within authority scope | Yes — alternative service sourcing for undelivered elements permitted within authority scope |

### 8.3.4 Protocol actions on declaration

- Incident category (SF-1, SF-2, SF-3) set on the incident record.
- claim_initiation_ref activated on the Booking Object immediately.
- Duty of care passes to the Booking Party immediately on incident declaration, regardless of the active phase or which Party was holding duty of care.
- Supplier notified via Booking Party communication channel.
- Supplier has PT24H to provide delivery confirmation evidence. If no evidence: claim proceeds automatically.
- SF-2 only: HEM-18 (SUPPLIER_FAILURE_SUBSTITUTION_REQUIRED) invoked. Traveler acceptance or rejection of substitution must be human-confirmed.
- If traveler is present and without their booked service: contingency response activated. SF-1 and SF-3 allow alternative service sourcing within duty-of-care Party authority scope. SF-2: traveler acceptance required.

### 8.3.5 TU-3a connection

If a traveler fails to appear for an alternative service arranged following a SUPPLIER_FAILURE_AT_DELIVERY declaration, and no communication is received, TU-3a (TRAVELER_OVERDUE) may be declared. The incident records are linked via claim_initiation_ref. This handles the scenario where a supplier failure leads to a traveler being displaced and subsequently unreachable.

### 8.3.6 SUPPLIER_FAILURE_AT_DELIVERY and Activity Component status

An Activity Component affected by SUPPLIER_FAILURE_AT_DELIVERY is set to FAILED status. This is distinct from CANCELLED (traveler or Booking Party elected not to proceed) and FULFILLED (delivery completed). FAILED status activates the SUPPLIER_FAILURE_AT_DELIVERY claim path and is the trigger for the burden-of-proof inversion rule.

A Booking Object may continue with remaining Activity Components after a FAILED component. The journey does not automatically cancel on a single component failure. The Booking Party determines whether the remaining booking is viable.

---

## 8.4 Force Majeure

*Extraordinary events beyond any party's control making fulfilment impossible or illegal*

### 8.4.1 Definition

Force majeure in the Activity Travel Protocol context means an extraordinary event beyond the reasonable control of any party that makes fulfilment of the booking impossible or illegal. Examples: natural disaster at the destination, declaration of war or civil emergency, government prohibition on travel, pandemic closure of borders.

Force majeure is not a catch-all for operational disruptions. An IROPS event (flight delay, weather diversion) is an operational disruption handled via DT-4 and DISRUPTION_REVIEW. Force majeure applies where the fundamental premise of the booking — that travel to and fulfilment at the destination is possible — has been invalidated.

### 8.4.2 Declaration authority

Force majeure may only be declared by a Booking Party authorised representative. An AI agent may not declare force majeure autonomously. An agent may surface a force majeure assessment (DT-2, CONFIGURATION_SUGGESTION) but the declaration itself requires human action. This is C-BS-3 — one of the three BOOKING_SUSPENDED entry conditions.

### 8.4.3 Scope: whole-booking vs partial

| Scope | Effect | Entry state | Resolution |
|---|---|---|---|
| Whole booking | The force majeure event makes the entire booking impossible. All Activity Components are affected. | BOOKING_SUSPENDED (C-BS-3) | Path A (cancellation) or Path B (suspension lifted when force majeure event resolves) per Section 5.5. |
| Partial | One or more Activity Components are affected but the booking may continue in modified form. | DISRUPTION_REVIEW | Disruption resolution path per Section 3.5. Affected components may be cancelled or substituted with human confirmation. |

### 8.4.4 Force majeure and OPA policy evaluation

ODRL-encoded cancellation policies are evaluated by OPA before any financial consequences are applied. Force majeure declarations are submitted to the OPA policy engine with force_majeure: true in the evaluation context. Jurisdiction-specific force majeure rules (e.g. Japan's consumer protection provisions for natural disasters) are evaluated at the jurisdiction tier. Party Operational policies declaring force majeure terms are evaluated at the party tier.

The protocol does not determine whether force majeure is legally valid — it evaluates the declared policies. Legal determination is the responsibility of the parties and their jurisdiction.

### 8.4.5 Force majeure and DISRUPTION_ADJACENT

When force majeure is declared for one Activity Component (partial scope), other Activity Components in the same booking may be classified as DISRUPTION_ADJACENT — they are not directly affected by the force majeure event but their delivery is at risk due to logistical cascades. DISRUPTION_ADJACENT carries no Security Kernel timeout. Cascade assessment is Host Party responsibility without a protocol deadline.

> **OQ-L3-6 closed:** DISRUPTION_ADJACENT carries no named protocol timeout. Cascade assessment is Host Party responsibility without a Security Kernel deadline. This disposition is normative and recorded in Section 13.

---

## 8.5 IROPS-specific provisions

IROPS (Irregular Operations) is the IATA taxonomy for airline operational disruptions. The Activity Travel Protocol handles IROPS events through the standard DT-4 mechanism with the following IROPS-specific provisions.

### 8.5.1 IROPS category codes

When declaring a DT-4 disruption incident for an airline-connected Activity Component, the iata_irops_category_code field in SourceSignalRecord (SAR-18) should be populated with the applicable IATA IROPS category code. This field enables downstream integration with airline operational systems without requiring the Activity Travel Protocol to adopt IATA messaging format natively.

### 8.5.2 Carrier Party obligations during IROPS

A Carrier Party registered in the booking has the following obligations on IROPS declaration:

- Notify the Booking Party via IPC channel immediately on IROPS event.
- Provide the DISRUPTION_REVIEW resolution within the disruption review timeout (PT1H default).
- Apply IATA Resolution 735d welfare provisions for stranded or significantly delayed passengers where applicable.
- Accept alternative routing proposals from agents operating with DISRUPTION_RESPONSE scope, subject to human confirmation of cost and schedule impacts.

### 8.5.3 IATA Resolution 735d welfare obligations

IATA Resolution 735d defines welfare obligations for stranded or significantly delayed passengers. These obligations are surfaced to the duty-of-care Party during IROPS disruption handling. The specific obligations (meal vouchers, accommodation, rebooking rights) are jurisdiction-dependent and are evaluated via the Jurisdiction Registry.

The Activity Travel Protocol surfaces 735d obligations as part of the DISRUPTION_REVIEW resolution context. Fulfilment of 735d obligations is Carrier Party and Booking Party responsibility — the protocol records the obligation and its resolution but does not itself execute welfare provision.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 8 — March 2026*
