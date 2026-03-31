# Human Escalation Manager Invocation Catalogue

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 6 | March 2026

---

This section catalogues every point in the Layer 3 workflow at which the Human Escalation Manager (HEM) is invoked. For each invocation it specifies: the trigger state and condition, the escalation_reason value, the protocol_deadline, whether a human_confirmation_token is required before execution resumes, and the secondary escalation path if the handler is unreachable.

The HEM is a kernel-gated, user-mode component. The protocol specifies trigger conditions and execution gates. Handler implementation — channel, notification format, confirmation UI — is application responsibility. The protocol does not prescribe handler_type (`HUMAN_DIRECT | AI_AGENT | AUTOMATED_WORKFLOW`). See design rule T-5-C.

## 6.1 HEM model summary

**What the Kernel enforces at every HEM invocation point:**

- A registered HEM handler exists in the Party Policy Declaration (escalation_handler field with handler_ref, handler_endpoint URI, and handler_type). Registration is rejected at Party registration time if absent.
- The handler is dispatched when triggered — escalation_dispatched_at is recorded in the event log.
- No execution-gated action proceeds while escalation is pending — the Kernel holds the gate until escalation_resolved_at is recorded.
- Where human_confirmation_token is required: the token must be present and valid before the gate opens.
- Every HEM invocation is recorded in the audit trail with escalation_reason, dispatched_at, and resolved_at.

**What the Kernel does not enforce:**

- The channel used (email, push notification, Slack, in-app, AI agent pipeline).
- The time the human reads or acts on the escalation.
- The content or format of the notification.
- Whether the resolution is human-manual or AI-assisted.
- The specific confirmation UI the implementer uses.

> **Design rule T-5-C:** Layer 3 does not prescribe handler_type. The state machine specifies the trigger condition and the execution gate only. Implementers may use any handler_type registered in their Party Policy Declaration.

## 6.2 Priority classification

All HEM invocations are classified by priority. Priority determines the order in which the Kernel processes competing escalations and the urgency communicated to the handler.

| Priority | Definition | protocol_deadline range |
|---|---|---|
| **P1 — Critical** | Immediate threat to traveler safety or welfare. BOOKING_SUSPENDED active. No autonomous action possible. Shortest permitted deadline. | PT5M to PT15M (operator may configure tighter; may not configure looser than PT15M for P1) |
| **P2 — High** | Active duty-of-care obligation with unresolved welfare concern. No BOOKING_SUSPENDED but escalation is blocking operations. | PT15M to PT30M |
| **P3 — Operational** | No immediate welfare concern. Booking operational issue requiring human decision to unblock workflow. | PT30M to PT2H |
| **P4 — Administrative** | No welfare concern. Administrative resolution required. Workflow may proceed in limited mode pending resolution. | PT2H to PT24H |

## 6.3 Invocation catalogue

Each entry below is a normative specification of one HEM invocation point. Entries are ordered by priority (P1 first) then by phase sequence within each priority tier.

---

### 6.3.1 Priority P1 — Critical

#### HEM-01 — ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED (T-5-D — highest priority in protocol)

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = ACTIVITY_FULFILLMENT. Active Activity Component in FULFILLING status. |
| **escalation_reason** | `TRAVELER_DECEASED_FULFILLMENT` \| `LEGAL_HOLD_FULFILLMENT` \| `FORCE_MAJEURE_FULFILLMENT` |
| **protocol_deadline** | Shortest permitted deadline. Operator may configure tighter. Protocol does not set a floor below PT5M. Default: PT5M. |
| **human_confirmation_token** | Required. Token must be issued by duty-of-care Party (Booking Party — DoC transfers to Booking Party on BOOKING_SUSPENDED entry in ACTIVITY_FULFILLMENT). |
| **Secondary path** | Immediate re-dispatch to secondary handler. If no secondary handler registered: HEM_NO_SECONDARY_PATH recorded. Booking remains suspended. Elevated alert flag set on Booking Object. |
| **Notes** | This is the highest-priority HEM invocation in the entire protocol per T-5-D. The active Activity Component is frozen at FULFILLING — it must not be marked FAILED autonomously. The fulfilling Party, Host Party, and Booking Party are all notified simultaneously on suspension entry. Jurisdiction Registry emergency contacts surfaced to human actor. TU-6 location blackout applies if concurrent. |

#### HEM-02 — TU-5 (TRAVELER_DECEASED) — initial escalation

| Field | Value |
|---|---|
| **Trigger state** | TU_5_TRAVELER_DECEASED set on TravelerContext. BOOKING_SUSPENDED entered (C-BS-1). |
| **escalation_reason** | `TRAVELER_DECEASED` |
| **protocol_deadline** | PT15M. Operator may configure tighter. |
| **human_confirmation_token** | Required for BOOKING_SUSPENDED exit Path B or Path C. Next-of-kin or legal authority confirmation for Path A. |
| **Secondary path** | Re-dispatch with increased urgency. PT10M secondary deadline. If still no response: incident record preserved, booking held, manual intervention required. |
| **Notes** | alt_contact_ref NEXT_OF_KIN attempted immediately in parallel with HEM dispatch. SSF stream checked for concurrent session revocation or credential compromise. IATA Resolution 735d welfare obligations apply to airline-connected segments. Unaccompanied minor rule: next-of-kin is the only valid authority path — legal authority contacts are secondary. |

#### HEM-03 — TU-6 (TRAVELER_VICTIM_OF_CRIME) — initial escalation

| Field | Value |
|---|---|
| **Trigger state** | TU_6_TRAVELER_VICTIM_OF_CRIME set on TravelerContext. Phase: any IN_JOURNEY phase. |
| **escalation_reason** | `TRAVELER_VICTIM_OF_CRIME` |
| **protocol_deadline** | PT10M. Operator may configure tighter. |
| **human_confirmation_token** | Required. Authority: law enforcement confirmation OR duty-of-care Party with explicit law enforcement acknowledgement. |
| **Secondary path** | Re-dispatch with increased urgency. If no secondary handler: booking held, manual intervention required. No autonomous action in any circumstance. |
| **Notes** | Escalation context must NOT include traveler location or itinerary — escalation channel itself may be compromised. Location blackout flag (location_disclosure_blocked) set on Context Package immediately. SSF stream checked for CAEP Session Revoked and RISC Credential Compromised. alt_contact_ref NEXT_OF_KIN or CORPORATE_ACCOUNT only — contact method must not reveal traveler location. Unaccompanied minor rule: GUARDIAN_ONLY authority immediately, law enforcement engagement mandatory. |

#### HEM-04 — TU-2 (TRAVELER_MISSING) — initial escalation

| Field | Value |
|---|---|
| **Trigger state** | TU_2_TRAVELER_MISSING set on TravelerContext. Phase: any IN_JOURNEY phase. |
| **escalation_reason** | `TRAVELER_MISSING` |
| **protocol_deadline** | PT15M. Operator may configure tighter. |
| **human_confirmation_token** | Required. All subsequent state changes require explicit human confirmation from duty-of-care Party or confirmed authority contact. |
| **Secondary path** | Re-issued after PT10M with increased urgency flag. If still no response: booking held pending manual intervention. Incident record preserved. |
| **Notes** | HOLD_AND_PRESERVE on all downstream bookings — no rebooking, cancellation, or autonomous action. alt_contact_ref attempted in parallel. Jurisdiction Registry law enforcement and emergency services contacts fetched for active jurisdiction code and surfaced to human actor only. Sub-category may be upgraded to TU-6 if evidence of crime emerges. |

#### HEM-05 — IN_DESTINATION + BOOKING_SUSPENDED

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = IN_DESTINATION. |
| **escalation_reason** | `TRAVELER_DECEASED_DESTINATION` \| `LEGAL_HOLD_DESTINATION` \| `FORCE_MAJEURE_DESTINATION` |
| **protocol_deadline** | PT10M. Operator may configure tighter. |
| **human_confirmation_token** | Required. Token issued by Host Party (duty-of-care holder in IN_DESTINATION). |
| **Secondary path** | Re-dispatch to secondary handler. If none: HEM_NO_SECONDARY_PATH recorded. Booking held. |
| **Notes** | DoC passes to Host Party immediately on BOOKING_SUSPENDED entry in IN_DESTINATION. All upcoming Activity Components placed on HOLD_AND_PRESERVE. Jurisdiction Registry emergency contacts fetched. |

---

### 6.3.2 Priority P2 — High

#### HEM-06 — OUTBOUND_TRANSIT + BOOKING_SUSPENDED

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = OUTBOUND_TRANSIT. |
| **escalation_reason** | `TRAVELER_DECEASED_TRANSIT` \| `LEGAL_HOLD_TRANSIT` \| `FORCE_MAJEURE_TRANSIT` |
| **protocol_deadline** | PT15M. Operator may configure tighter. |
| **human_confirmation_token** | Required. Token issued by Booking Party. |
| **Secondary path** | Re-dispatch to secondary handler. If none: booking held. |
| **Notes** | Active transit leg placed on HOLD_AND_PRESERVE. Carrier Party notified. DoC remains with Booking Party (primary) for OUTBOUND_TRANSIT suspension. |

#### HEM-07 — RETURN_TRANSIT + BOOKING_SUSPENDED

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = RETURN_TRANSIT. |
| **escalation_reason** | `TRAVELER_DECEASED_RETURN` \| `LEGAL_HOLD_RETURN` \| `FORCE_MAJEURE_RETURN` |
| **protocol_deadline** | PT15M. Operator may configure tighter. |
| **human_confirmation_token** | Required. Token issued by Booking Party. |
| **Secondary path** | Re-dispatch to secondary handler. If none: booking held. |
| **Notes** | Active transit leg placed on HOLD_AND_PRESERVE. DoC transfer to Booking Party tracked and recorded. If active W2 wellness event: wellness event record linked to BOOKING_SUSPENDED audit entry. |

#### HEM-08 — ARRIVAL + BOOKING_SUSPENDED

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = ARRIVAL. |
| **escalation_reason** | `TRAVELER_DECEASED_ARRIVAL` \| `LEGAL_HOLD_ARRIVAL` \| `FORCE_MAJEURE_ARRIVAL` |
| **protocol_deadline** | PT15M. Operator may configure tighter. |
| **human_confirmation_token** | Required. Token issued by party holding DoC at suspension moment (Booking Party if pre-TRAVELER_RECEIVED; Host Party if post). |
| **Secondary path** | Re-dispatch to secondary handler. If none: booking held. |
| **Notes** | Check-in process frozen. Host Party notified. DoC holder at suspension moment recorded. |

#### HEM-09 — TU-1 unresolved — ACTIVITY_FULFILLMENT

| Field | Value |
|---|---|
| **Trigger state** | TU-1 (DEVICE_UNAVAILABLE) unresolved after PT5M in ACTIVITY_FULFILLMENT. |
| **escalation_reason** | `TRAVELER_UNREACHABLE_FULFILLMENT` |
| **protocol_deadline** | PT30M. Operator may configure tighter. |
| **human_confirmation_token** | Not required for escalation dispatch. Required for any state change following escalation. |
| **Secondary path** | PARTY_UNRESPONSIVE entered if HEM deadline elapsed without resolution. |
| **Notes** | Shortened alt_contact timeout (PT5M vs PT10M standard) reflects elevated duty-of-care context in ACTIVITY_FULFILLMENT. |

#### HEM-10 — TU-3b (TRAVELER_DEPARTED_IRREGULARLY)

| Field | Value |
|---|---|
| **Trigger state** | TU_3b_TRAVELER_DEPARTED_IRREGULARLY set on TravelerContext. |
| **escalation_reason** | `TRAVELER_DEPARTED_IRREGULARLY` |
| **protocol_deadline** | PT30M. Operator may configure tighter. |
| **human_confirmation_token** | Required for all subsequent state changes. |
| **Secondary path** | Re-dispatch with urgency flag. Booking Party commercial and legal team notified. |
| **Notes** | TU-3b must not be set autonomously — human confirmation required before sub-category is applied. If immigration violation suspected: Jurisdiction Registry consulted. Contacts surfaced to human actor only — the Activity Travel Protocol does not report to authorities autonomously. |

---

### 6.3.3 Priority P3 — Operational

#### HEM-11 — OPA assembly failure — blocking DT

| Field | Value |
|---|---|
| **Trigger state** | OPA policy evaluation fails during ASSEMBLY POINT. Decision Object confidence below floor (CONFIDENCE_UNDERRUN) or reasoning below minimum length (REASONING_INSUFFICIENT). |
| **escalation_reason** | `ASSEMBLY_FAILURE` \| `CONFIDENCE_UNDERRUN` \| `REASONING_INSUFFICIENT` |
| **protocol_deadline** | PT10M (also the protocol maximum for this invocation — not configurable looser). Operator may configure tighter. |
| **human_confirmation_token** | Required if blocking a DT-2, DT-3, or DT-4 action. |
| **Secondary path** | Booking operation blocked until resolved. If PT10M elapsed: operation cancelled, human decision required to retry. |
| **Notes** | The PT10M value is both the default and the protocol maximum for HEM-11. No Party may configure a looser deadline for OPA assembly failures. |

#### HEM-12 — SSF revocation during C1 window

| Field | Value |
|---|---|
| **Trigger state** | CAEP Session Revoked or RISC Credential Compromised event arrives during an active C1 autonomous reversal window. |
| **escalation_reason** | `SSF_REVOCATION_DURING_C1` |
| **protocol_deadline** | No separate deadline — C1 clock is frozen on SSF event arrival. HEM-12 must be resolved before C1 clock resumes. |
| **human_confirmation_token** | Required. Human must confirm whether to proceed with or reverse the DT-4 declaration. |
| **Secondary path** | C1 clock remains frozen until HEM-12 resolved. If handler unreachable: C1_MAX_FREEZE_DURATION applies (PT1H). On expiry, the Kernel automatically reverses the DT-4 declaration, records INCIDENT_REVERSED with reason: SSF_HANDLER_TIMEOUT, and the booking resumes normal state machine operation. Booking Party notified of auto-reversal. |
| **Notes** | The C1 clock freeze means the PT15M reversal window does not expire during SSF processing. The declaring agent's credential status is rechecked before any downstream action is permitted, regardless of the human's decision to proceed. C1_MAX_FREEZE_DURATION (PT1H) is not configurable — it is a protocol floor ensuring that a handler failure cannot permanently suspend the booking in a non-BOOKING_SUSPENDED hold state. The auto-reversal outcome is conservative: the disruption is treated as undeclared rather than confirmed, favouring booking continuity over autonomous disruption response. |

#### HEM-13 — TU-1 / TU-4 unresolved — standard phases

| Field | Value |
|---|---|
| **Trigger state** | TU-1 or TU-4 unresolved after PT10M in standard phases (non-ACTIVITY_FULFILLMENT). |
| **escalation_reason** | `TRAVELER_UNREACHABLE_UNRESOLVED` |
| **protocol_deadline** | PT30M. Operator may configure tighter. |
| **human_confirmation_token** | Not required for dispatch. Required for any state change. |
| **Secondary path** | PARTY_UNRESPONSIVE rules apply if HEM deadline elapsed. |
| **Notes** | This is the standard unreachable escalation for the lower-severity sub-categories in non-critical phases. |

#### HEM-14 — CONFIRMATION_TIMEOUT

| Field | Value |
|---|---|
| **Trigger state** | Supplier confirmation timeout elapsed in PENDING_CONFIRMATION. |
| **escalation_reason** | `CONFIRMATION_TIMEOUT` |
| **protocol_deadline** | PT24H. Operator may configure tighter. |
| **human_confirmation_token** | Required for any booking continuation. |
| **Secondary path** | Booking cancelled with cancellation_reason: CONFIRMATION_TIMEOUT if no resolution. |
| **Notes** | Invoked only if at least one component has already been confirmed (partial confirmation case). If no components confirmed, booking cancels directly. |

#### HEM-15 — AMENDMENT_TIMEOUT

| Field | Value |
|---|---|
| **Trigger state** | Amendment confirmation timeout elapsed in AMENDMENT state. |
| **escalation_reason** | `AMENDMENT_TIMEOUT` |
| **protocol_deadline** | PT2H. Operator may configure tighter. |
| **human_confirmation_token** | Required for amendment outcome decision. |
| **Secondary path** | Original booking reinstated if no response within protocol_deadline. |
| **Notes** | Human actor must decide: accept original booking, retry amendment, or cancel. Original booking reinstated as default pending human decision. |

#### HEM-16 — DISRUPTION_REVIEW_TIMEOUT

| Field | Value |
|---|---|
| **Trigger state** | Disruption review timeout elapsed in DISRUPTION_REVIEW state. |
| **escalation_reason** | `DISRUPTION_REVIEW_TIMEOUT` |
| **protocol_deadline** | PT1H. Operator may configure tighter. |
| **human_confirmation_token** | Required for resolution path selection. |
| **Secondary path** | Booking enters PARTY_UNRESPONSIVE if no resolution. |
| **Notes** | Human actor must select resolution path: continue booking with alternative arrangements, cancel, or extend review period. |

#### HEM-17 — PARTY_UNRESPONSIVE — fulfillment phase

| Field | Value |
|---|---|
| **Trigger state** | Fulfilling Party unresponsive during ACTIVITY_FULFILLMENT phase. |
| **escalation_reason** | `PARTY_UNRESPONSIVE_FULFILLMENT` |
| **protocol_deadline** | PT30M. Operator may configure tighter. |
| **human_confirmation_token** | Required for alternative sourcing or cancellation. |
| **Secondary path** | Alternative service sourcing within duty-of-care Party authority scope if SF-1 rules apply. |
| **Notes** | May coincide with SUPPLIER_FAILURE_AT_DELIVERY declaration if the party was expected to deliver at the time of unresponsiveness. |

#### HEM-18 — SF-2 substitution acceptance

| Field | Value |
|---|---|
| **Trigger state** | SUPPLIER_FAILURE_AT_DELIVERY declared with category SF-2 (materially different substitution offered). |
| **escalation_reason** | `SUPPLIER_FAILURE_SUBSTITUTION_REQUIRED` |
| **protocol_deadline** | PT2H. Operator may configure tighter. |
| **human_confirmation_token** | Required. Traveler acceptance or rejection of substitution must be human-confirmed. |
| **Secondary path** | Substitution rejected if no response within protocol_deadline. SF-2 treated as SF-1 (complete non-delivery) for claims purposes. |
| **Notes** | Traveler acceptance of the substitution closes the SF-2 incident. Rejection activates the claim path at SF-1 severity. No autonomous acceptance of substitution is permitted. |

#### HEM-19 — TRAVELER_FOUND condition assessment

| Field | Value |
|---|---|
| **Trigger state** | TRAVELER_FOUND named protocol event declared (TU-2 or TU-6 resolution). |
| **escalation_reason** | `TRAVELER_FOUND_CONDITION_ASSESSMENT` |
| **protocol_deadline** | PT30M. Operator may configure tighter. |
| **human_confirmation_token** | Required for path selection (Path A, B, or C — Section 10.1.5). |
| **Secondary path** | TU chain remains open if assessment not completed within deadline. |
| **Notes** | Three-path assessment required: fit to continue (Path A), requires assistance (Path B), or unreachable again (Path C). For TU-6: location blackout remains active until law enforcement explicitly confirms safe to lift — assessment alone does not lift the blackout. |

#### HEM-20 — RECOVERED condition assessment

| Field | Value |
|---|---|
| **Trigger state** | RECOVERED named protocol event declared (W2 wellness event resolution). |
| **escalation_reason** | `RECOVERED_CONDITION_ASSESSMENT` |
| **protocol_deadline** | PT30M. Operator may configure tighter. |
| **human_confirmation_token** | Required for path selection (fit to continue, requires continuing care, condition deteriorated — Section 10.2.6). |
| **Secondary path** | W2 event remains open if assessment not completed. |
| **Notes** | Three-path assessment mirrors TRAVELER_FOUND model. For W2 HOSPITALISED and REQUIRES_REPATRIATION: medical confirmation reference required before RECOVERED declaration is accepted. |

---

### 6.3.4 Priority P4 — Administrative

#### HEM-21 — BOOKING_SUSPENDED — RETURN_ARRIVAL

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = RETURN_ARRIVAL. |
| **escalation_reason** | `SUSPENDED_RETURN_ARRIVAL` |
| **protocol_deadline** | PT2H. Operator may configure tighter. |
| **human_confirmation_token** | Required for exit path selection. |
| **Secondary path** | Booking remains suspended. Elevated alert flag set if no secondary handler. |
| **Notes** | Administrative resolution acceptable for C-BS-3 in this phase. Mandatory HEM for C-BS-1 and C-BS-2. |

#### HEM-22 — BOOKING_SUSPENDED — COMPLETION phase

| Field | Value |
|---|---|
| **Trigger state** | BOOKING_SUSPENDED modifier applied while phase = COMPLETION (journey phase). |
| **escalation_reason** | `SUSPENDED_COMPLETION_PHASE` |
| **protocol_deadline** | PT4H. Operator may configure tighter. |
| **human_confirmation_token** | Required for exit path selection. |
| **Secondary path** | Booking remains suspended. |
| **Notes** | Exceptional circumstance. Administrative resolution acceptable. Reason for suspension in COMPLETION phase must be recorded in event log as it represents a completed journey being retrospectively suspended. |

#### HEM-23 — TU-3a (TRAVELER_OVERDUE)

| Field | Value |
|---|---|
| **Trigger state** | TU-3a (TRAVELER_OVERDUE) unresolved after PT20M alt_contact timeout. |
| **escalation_reason** | `TRAVELER_OVERDUE` |
| **protocol_deadline** | PT60M. Operator may configure tighter. |
| **human_confirmation_token** | Not required for dispatch. Required for sub-category upgrade. |
| **Secondary path** | Standard PARTY_UNRESPONSIVE rules apply after deadline. |
| **Notes** | TU-3a is the benign overdue case — no evidence of distress. Default assumption is benign voluntary extension. claim_initiation_ref activated if financial loss incurred. May escalate to TU-3b, TU-2, or TU-6 if evidence changes the classification. |

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 6 — March 2026*
