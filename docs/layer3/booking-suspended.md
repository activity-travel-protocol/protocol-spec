# BOOKING_SUSPENDED Cross-Cutting Behaviour

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 5 | April 2026

---

BOOKING_SUSPENDED is a parallel state modifier that may overlay any active booking state or journey phase. It is not a phase. It is not a sequential step in the booking lifecycle. It is a full stop — an authority-gated condition under which no autonomous action proceeds and no state transitions occur without human authorisation.

This section is the authoritative specification for BOOKING_SUSPENDED in Layer 3. Per-phase references throughout Section 4 are summaries; this section is normative. Where any conflict exists between a Section 4 per-phase note and this section, this section takes precedence.

## 5.1 What BOOKING_SUSPENDED is not

Three states are commonly confused with BOOKING_SUSPENDED. The distinctions are normative.

| State | Has timeout mechanism | Autonomous action permitted | Resolution path | Terminal? |
|---|---|---|---|---|
| BOOKING_SUSPENDED | No — no clock runs | Never — absolute halt | Human authority required | No |
| PARTY_UNRESPONSIVE | Yes — defined timeouts | Yes — phase-dependent | Timeout expiry or human | No |
| DISRUPTION_REVIEW | Yes — PT1H default | Hold-and-preserve only | Active resolution path | No |
| BOOKING_CANCELLED_SUSPENDED | No | None — terminal | No resolution path | Yes |

> **BOOKING_SUSPENDED is not PARTY_UNRESPONSIVE.** A supplier failing to respond triggers PARTY_UNRESPONSIVE with defined timeout rules and, in some phases, limited autonomous action. BOOKING_SUSPENDED requires a confirmed entry condition (Section 5.2) and permits no autonomous action of any kind.

## 5.2 Entry conditions

Three and only three conditions trigger entry into BOOKING_SUSPENDED. These conditions are exhaustive — no other event, timeout, or agent declaration may cause BOOKING_SUSPENDED entry. All three require human confirmation before the Kernel applies the modifier; BOOKING_SUSPENDED is never entered autonomously.

| Condition | Trigger | Human confirmation required | Primary source |
|---|---|---|---|
| **C-BS-1** TU-5 (TRAVELER_DECEASED) | Confirmed or strongly suspected death of a traveler during the booking lifecycle. | Yes — TU_5_TRAVELER_DECEASED must not be set autonomously. Human confirmation required before Kernel applies BOOKING_SUSPENDED. | Security Architecture v1 Section 5.6 |
| **C-BS-2** Legal authority order | Court order, law enforcement hold, or immigration authority instruction received via Jurisdiction Registry contact requiring booking suspension. | Yes — Booking Party legal representative must acknowledge receipt before Kernel applies BOOKING_SUSPENDED. | Security Architecture v1 Section 6.1 |
| **C-BS-3** Force majeure | Booking Party declaration of force majeure affecting the entire booking — a protocol-level suspension distinct from DISRUPTION_REVIEW. | Yes — Booking Party authorised representative must submit the declaration. Agent may not declare force majeure autonomously. | Security Architecture v1 Section 6.1 |

> **Design rule T-4-A:** BOOKING_SUSPENDED is modelled as a parallel state in the XState machine, not a phase-level state. When the modifier is applied, the Booking Object retains its current journey phase. The phase field is not cleared or overwritten.

## 5.3 State characteristics while suspended

The following characteristics apply to the Booking Object for the entire duration of BOOKING_SUSPENDED, regardless of which journey phase was active at suspension entry.

- All autonomous agent actions are halted immediately on suspension entry. No Decision Object is accepted by the Kernel while BOOKING_SUSPENDED is active. Any in-flight Decision Object received after the suspension event timestamp is rejected.
- All state machine transitions are frozen. No phase transitions, booking state transitions, or Activity Component status transitions occur autonomously. The only state change permitted is exit from BOOKING_SUSPENDED via an authority-gated exit path (Section 5.5).
- The distributed lock on the Booking Object remains held. No concurrent writes are permitted.
- TRAVELER_PII retention obligations are modified: the normal retention_deadline does not apply while BOOKING_SUSPENDED is active. Purge is suspended pending authority instruction.
- The event log continues to record all events, including HEM dispatches, authority communications, and audit entries. The log is never frozen.
- SSF stream monitoring continues. If a CAEP or RISC event arrives for any agent associated with the booking during suspension, it is recorded but does not trigger autonomous action.
- The claim_initiation_ref hook, if already activated, remains active and accessible to the Booking Party for claims administration.

> **Security Kernel during suspension:** The Security Kernel continues to execute on every attempted operation. Authentication and authorisation checks still run. The Kernel rejects all transition requests from AI agents and returns BOOKING_SUSPENDED_ACTIVE as the rejection reason. Human-authorised requests from the duty-of-care Party or legal authority are evaluated normally.

> **Coordination Delegation freeze rule (normative):** When the Booking Object enters BOOKING_SUSPENDED, all active Coordination Delegations are suspended. The phaseWindow expiry and absolute expiryTime of each active delegation are frozen at the moment of suspension entry. On BOOKING_SUSPENDED exit via any authorised path, each delegation resumes with its remaining validity window intact — clocks do not restart. The freeze duration is recorded in the Booking Object log as part of the BOOKING_SUSPENDED event sequence. A delegation whose phaseWindow boundary would have been reached during the suspension period expires on BOOKING_SUSPENDED exit, not during the suspension. This freeze rule is consistent with the general timeout freeze rule in Section 11.1. Cross-references: Section 12.4.5 (Coordination Delegation phase boundary rules); Section 13 OQ-L3-7 (normative disposition and rationale).

## 5.4 Per-phase BOOKING_SUSPENDED behaviour

This table is the normative consolidation of all per-phase BOOKING_SUSPENDED specifications from Section 4. Design rule T-4-B requires that all eight phases are covered. The duty-of-care level determines the mandatory or recommended status of HEM invocation and the urgency of exit path resolution.

| Phase | DoC level | HEM invocation | Entry action set | Exit paths |
|---|---|---|---|---|
| PRE_DEPARTURE | **NONE** | Recommended (not mandatory) unless C-BS-1 or C-BS-2 applies, in which case mandatory. | Freeze all Activity Components at PENDING. Notify Booking Party. Record suspension_entered_at, suspension_reason, current_phase = PRE_DEPARTURE, duty_of_care_holder = Booking Party. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → CONFIRMED (pre-journey state restored). Path C → erroneous declaration review. |
| OUTBOUND_TRANSIT | **MODERATE** | Mandatory. Human escalation required before resumption. | Place active transit leg on HOLD_AND_PRESERVE. Notify Carrier Party. Record suspension_entered_at, current_phase = OUTBOUND_TRANSIT, duty_of_care_holder = Booking Party (primary). Kernel records DoC transfer notification to Carrier Party. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → IN_JOURNEY at OUTBOUND_TRANSIT phase. Path C → erroneous declaration review. |
| ARRIVAL | **MODERATE** | Mandatory. Human escalation required before resumption. | Freeze check-in process. Notify Host Party. Record suspension_entered_at, current_phase = ARRIVAL, duty_of_care_holder = party holding DoC at suspension moment (Booking Party if pre-TRAVELER_RECEIVED; Host Party if post). Kernel records DoC notification to Host Party. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → IN_JOURNEY at ARRIVAL phase. Path C → erroneous declaration review. |
| IN_DESTINATION | **HIGH** | Mandatory. DoC passes to Host Party immediately on entry. | DoC transfer to Host Party (Kernel operation). Notify Host Party immediately. Record suspension_entered_at, current_phase = IN_DESTINATION, duty_of_care_holder = Host Party. Place all upcoming Activity Components on HOLD_AND_PRESERVE. Jurisdiction Registry emergency contacts fetched and surfaced to human actor. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → IN_JOURNEY at IN_DESTINATION phase. Path C → erroneous declaration review. |
| ACTIVITY_FULFILLMENT | **CRITICAL** | Mandatory — no exceptions. Shortest permitted protocol_deadline (T-5-D). DoC passes to Booking Party immediately on entry. | Immediate DoC transfer to Booking Party (Kernel operation). Freeze active Activity Component at FULFILLING status — do not mark FAILED. Notify fulfilling Party, Host Party, and Booking Party simultaneously. Record suspension_entered_at, current_phase = ACTIVITY_FULFILLMENT, active_component_ref, duty_of_care_holder = Booking Party. Place all remaining Activity Components on HOLD_AND_PRESERVE. Jurisdiction Registry emergency contacts fetched. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → IN_JOURNEY at ACTIVITY_FULFILLMENT phase (active component status reviewed on resumption). Path C → erroneous declaration review. |
| RETURN_TRANSIT | **HIGH** | Mandatory. DoC transfer tracked and recorded. | Place active transit leg on HOLD_AND_PRESERVE. Notify Carrier Party. DoC transfer to Booking Party if not already held. Record suspension_entered_at, current_phase = RETURN_TRANSIT, duty_of_care_holder. Kernel records DoC transfer notification. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → IN_JOURNEY at RETURN_TRANSIT phase. Path C → erroneous declaration review. |
| RETURN_ARRIVAL | **MODERATE** | Recommended. Administrative resolution acceptable for C-BS-3. Mandatory for C-BS-1 and C-BS-2. | Notify Booking Party. Record suspension_entered_at, current_phase = RETURN_ARRIVAL, duty_of_care_holder = Booking Party. No active transit or activity components expected — HOLD_AND_PRESERVE notation recorded for completeness. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → IN_JOURNEY at RETURN_ARRIVAL phase → COMPLETION on authority confirmation. Path C → erroneous declaration review. |
| COMPLETION (journey phase) | **LOW** | Recommended. Administrative resolution acceptable. | Record suspension_entered_at, current_phase = COMPLETION, duty_of_care_holder = Booking Party. No active components. Exceptional circumstance — record reason in event log. | Path A → BOOKING_CANCELLED_SUSPENDED. Path B → COMPLETION booking state on authority confirmation. Path C → erroneous declaration review. |

## 5.5 Authority-gated exit paths

Three and only three exit paths exist from BOOKING_SUSPENDED. All three require explicit human authority confirmation recorded in the event log. The Kernel validates the authority of the confirming party before executing any exit transition.

| Path | Name | Authority required | Target state | Kernel action |
|---|---|---|---|---|
| **Path A** | Cancellation during suspension | Next-of-kin confirmation (C-BS-1) OR legal authority order (C-BS-2) OR Booking Party authorised representative (C-BS-3). | BOOKING_CANCELLED_SUSPENDED (terminal) | Kernel records BOOKING_CANCELLED_SUSPENDED event. TRAVELER_PII retention rules modified. claim_initiation_ref remains active. booking_cancelled_during_suspension flag set. Supplier cancellation notifications dispatched with SUSPENDED_CANCELLATION reason code. |
| **Path B** | Suspension lifted | Legal authority order lifting suspension (C-BS-2) OR Booking Party determination with authority confirmation that suspension trigger is resolved (C-BS-1 requires next-of-kin or legal authority; C-BS-3 requires Booking Party authorised representative). | IN_JOURNEY at preserved phase (or CONFIRMED if suspended pre-journey) | Kernel records BOOKING_SUSPENDED_LIFTED event. suspension_lifted_by recorded. Context Package re-assembled (T-4-C). OPA re-evaluated before any autonomous agent action resumes. Normal state machine resumes. |
| **Path C** | Erroneous declaration | Booking Party determination, with authority confirmation, that suspension trigger was incorrectly applied. | IN_JOURNEY at preserved phase (or CONFIRMED if suspended pre-journey) | Kernel records BOOKING_SUSPENDED_ERRONEOUS event. Full audit record of incorrect declaration preserved permanently — cannot be deleted from event log. Context Package re-assembled. OPA re-evaluated. Sub-category downgrade review triggered immediately. |

## 5.6 Audit trail requirements

The following fields must be recorded in the event log on BOOKING_SUSPENDED entry. These fields are mandatory — their absence is a conformance violation.

- `suspension_entered_at` — ISO 8601 timestamp of suspension entry event.
- `suspension_reason` — one of: C-BS-1, C-BS-2, C-BS-3.
- `current_phase` — the journey phase active at suspension entry (or PRE_JOURNEY if suspended before IN_JOURNEY).
- `duty_of_care_holder` — the Party holding duty of care at the moment of suspension entry.
- `active_component_ref` — reference to the active Activity Component, if phase is ACTIVITY_FULFILLMENT.
- `confirming_authority` — the human actor who confirmed the suspension trigger.
- `hem_dispatched_at` — timestamp of HEM dispatch, if HEM was invoked.

On exit, the following fields must be recorded:

- `suspension_lifted_at` — ISO 8601 timestamp of exit event.
- `exit_path` — one of: PATH_A, PATH_B, PATH_C.
- `suspension_lifted_by` — the human actor who authorised exit.
- `exit_authority_ref` — reference to the authority confirmation (next-of-kin declaration, legal order reference, or Booking Party representative record).

## 5.7 Secondary HEM dispatch

If the primary HEM handler is unreachable or fails to respond, a secondary HEM dispatch is issued after PT5M (fixed — not configurable). If no secondary handler is registered in the Party Policy Declaration, the Kernel records HEM_NO_SECONDARY_PATH and sets an elevated alert flag on the Booking Object. The booking remains suspended. Manual intervention is required.

> **Design rule T-5-B:** Every HEM invocation specifies escalation_reason, human_confirmation_token requirement, and secondary escalation path. HEM invocations without a registered secondary path record HEM_NO_SECONDARY_PATH and flag the Booking Object for manual review.

## 5.8 SSF interaction during BOOKING_SUSPENDED

SSF stream monitoring continues throughout BOOKING_SUSPENDED. If a CAEP Session Revoked or RISC Credential Compromised event arrives during suspension:

- The event is recorded in the Booking Object event log immediately.
- No autonomous action is triggered (consistent with the general autonomous action halt).
- The event is surfaced to the human actor handling the suspension via the next HEM interaction.
- On exit via Path B or Path C, the Kernel checks for unprocessed SSF events before re-assembling the Context Package. If any unprocessed SSF revocation events exist, Context Package assembly is delayed until a human actor acknowledges them.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 5 — April 2026*
