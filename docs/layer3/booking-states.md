# Booking States

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 3 | April 2026

---

This section defines every state in the Booking Object state machine. For each state, it specifies: the conditions under which the state is entered, the transitions out of the state, the timeout rules that apply, and the duty-of-care obligations active while the Booking Object is in that state.

The Security Kernel executes non-bypassably on every transition. This is universally true and is not restated per-state. See Section 1.6 and Architecture Specification v1.0 Section 6.

## 3.0 Complete state inventory

The Booking Object state machine contains eleven states, classified as active states, a cross-cutting parallel modifier, or terminal states.

| State | Class | IN_JOURNEY phase tracked | Duty of care active |
|---|---|---|---|
| INQUIRY | Active | No | None |
| PENDING_CONFIRMATION | Active | No | None |
| CONFIRMED | Active | No | Booking Party |
| AMENDMENT | Active | Yes — phase context preserved | Phase-appropriate (see Section 4) |
| DISRUPTION_REVIEW | Active | Yes — phase context preserved | Phase-appropriate (see Section 4) |
| PARTY_UNRESPONSIVE | Active | Yes — phase context preserved | Phase-appropriate (see Section 4) |
| IN_JOURNEY | Active | Yes — 8 phases (Section 4) | Phase-appropriate (see Section 4) |
| BOOKING_SUSPENDED | Parallel modifier | Yes — phase context preserved | Phase-appropriate + suspension rules (Section 5) |
| COMPLETION | Terminal | No | None |
| BOOKING_CANCELLED | Terminal | No | None |
| BOOKING_CANCELLED_SUSPENDED | Terminal | No | Residual — TRAVELER_PII retention rules apply |

---

## 3.1 INQUIRY — Active State

### 3.1.1 Purpose

INQUIRY is the initial state of every Booking Object. The booking is being assembled: the traveler or their AI agent is selecting suppliers, configuring activity components, and obtaining feasibility confirmation. No commitment has been made by any party. The Booking Object exists as a runtime entity but carries no contractual obligation.

### 3.1.2 Entry conditions

INQUIRY is the only state entered by Booking Object creation. A Booking Object is created when a Booking Party submits a valid booking initiation request carrying:

- A valid Party Registry identity for the Booking Party.
- At least one Activity Component reference.
- A TravelerContext with identity_tier >= T1.
- A jurisdiction code matching an entry in the Jurisdiction Compliance Registry.

The Security Kernel validates all four conditions before the Booking Object is created. A failed initiation request does not produce a Booking Object.

### 3.1.3 OQ-L3-1 resolution — feasibility check model

INQUIRY operates against static Capability Declarations. The Booking Party's agent assembles a feasibility check by referencing each supplier's declared capabilities as registered in the Party Registry. The protocol specifies the trigger, timeout, and failure path for this feasibility check. The query mechanism — including whether live availability is consulted — is a Layer 2 concern and is not prescribed here.

A feasibility check must clear for each Activity Component before the Booking Object may transition from INQUIRY to PENDING_CONFIRMATION. A feasibility check is considered cleared when the Kernel records a FEASIBILITY_CLEARED event for the component in the event log. The source of the clearance signal — static declaration match, live availability API response, or operator override — is outside Layer 3 scope.

> **OQ-L3-1 closed:** Live availability is a Layer 2 concern. Layer 3 requires only that a FEASIBILITY_CLEARED event is recorded per Activity Component before INQUIRY exits. How that event is generated is Layer 2's specification responsibility.

### 3.1.4 AI agent participation

AI agent participation is permitted in INQUIRY at participation Level 1 (INFORMATION_PROVISION) and Level 2 (CONFIGURATION_SUGGESTION). DT-1 and DT-2 are the applicable decision types. The agent receives a Context Package assembled by the Kernel at the ASSEMBLY POINT node preceding invocation. The Context Package in INQUIRY contains:

- Current Booking Object state (incomplete — no confirmation).
- Capability Declaration references for each candidate supplier.
- Applicable policy set (ODRL) for the booking jurisdiction.
- TravelerContext at the declared identity_tier (T1 minimum; T2/T3 fields included only if declared and verified).
- Authority scope: CONFIGURATION_SUGGESTION only. No autonomous booking action is permitted in INQUIRY.

An agent proposing a configuration change (DT-2) submits a Decision Object. The human traveler or Booking Party must confirm the proposal before any Activity Component is added, removed, or modified. Autonomous configuration is not permitted in INQUIRY.

### 3.1.5 Transitions out of INQUIRY

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| Submit booking | PENDING_CONFIRMATION | All Activity Components have FEASIBILITY_CLEARED. TravelerContext complete for all required fields at declared identity_tier. At least one supplier Party confirmed as registered and active in Party Registry. | Security Kernel records BOOKING_SUBMITTED event. Assigns booking_id (UUID v7). Distributed lock acquired. |
| Abandon inquiry | BOOKING_CANCELLED | Booking Party or traveler explicitly abandons. No conditions beyond initiating party authorisation. | Security Kernel records INQUIRY_ABANDONED event. Booking Object archived. |
| Inquiry timeout | BOOKING_CANCELLED | No BOOKING_SUBMITTED event within the inquiry timeout window. Protocol default: PT4H. Party-configurable to any value <= PT4H. | Kernel Scheduler fires INQUIRY_TIMEOUT event. Booking Object archived. No HEM invocation required. |

> **Timeout rule:** The inquiry timeout clock begins when the Booking Object is created. The PT4H default reflects the expectation that INQUIRY is an interactive session. Operators may configure a shorter window; they may not configure a longer one. The Kernel Scheduler enforces the tighter of the Party-declared value and the protocol maximum.

### 3.1.6 Duty of care

No duty of care obligation is active in INQUIRY. The traveler has made no booking commitment and the Booking Party has incurred no contractual obligation. TRAVELER_UNREACHABLE chains do not apply.

---

## 3.2 PENDING_CONFIRMATION — Active State

### 3.2.1 Purpose

PENDING_CONFIRMATION is the state in which the submitted booking awaits supplier confirmation. The Booking Party has committed to the booking; suppliers have not yet confirmed. The Booking Object is live and locked. Traveler data is now subject to TRAVELER_PII handling obligations.

### 3.2.2 Entry conditions

Entered exclusively from INQUIRY via the Submit booking transition (Section 3.1.5). No other entry path exists.

### 3.2.3 Supplier confirmation model

Each Activity Component in the Booking Object requires a confirmation event from its designated supplier. Suppliers are notified via the protocol's IPC channel (Kernel OS function 5) immediately on entry to PENDING_CONFIRMATION. The notification carries a ConfirmationRequest message containing the Activity Component reference, the booking_id, the required confirmation deadline, and the Booking Party's Party Registry identity.

Supplier confirmation is an all-or-nothing gate per Activity Component. Partial confirmation of a multi-supplier booking is recorded in the event log but does not advance the Booking Object to CONFIRMED until all components are confirmed or the Booking Party explicitly accepts a modified booking with fewer components.

### 3.2.4 Transitions out of PENDING_CONFIRMATION

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| All components confirmed | CONFIRMED | A SUPPLIER_CONFIRMED event recorded for every Activity Component in the Booking Object. | Kernel records BOOKING_CONFIRMED event. Duty of care assigned to Booking Party. Confirmation notification dispatched to traveler via Booking Party IPC channel. |
| Supplier decline — rebookable | INQUIRY | One or more suppliers decline. Booking Party elects to reconfigure rather than cancel. | Kernel records SUPPLIER_DECLINED event per component. Booking Object returns to INQUIRY with declined components removed. FEASIBILITY_CLEARED events for retained components remain valid. |
| Supplier decline — cancel | BOOKING_CANCELLED | One or more suppliers decline and Booking Party elects to cancel. | Kernel records BOOKING_CANCELLED event with cancellation_reason: SUPPLIER_DECLINE. |
| Booking Party withdrawal | BOOKING_CANCELLED | Booking Party withdraws the booking before all suppliers confirm. | Kernel records BOOKING_CANCELLED event with cancellation_reason: BOOKING_PARTY_WITHDRAWAL. Supplier cancellation notifications dispatched. |
| Confirmation timeout | BOOKING_CANCELLED | One or more suppliers fail to confirm within the confirmation timeout. Protocol default: PT24H. Party-configurable to tighter bounds. | Kernel Scheduler fires CONFIRMATION_TIMEOUT event. HEM invoked with escalation_reason: CONFIRMATION_TIMEOUT if any confirmed components exist. Booking Object cancelled with cancellation_reason: CONFIRMATION_TIMEOUT. |

### 3.2.5 Duty of care

No duty of care obligation is active in PENDING_CONFIRMATION. The Booking Party holds administrative responsibility for the booking submission, but the traveler has not yet departed and no fulfillment has begun. TRAVELER_UNREACHABLE chains do not apply.

TRAVELER_PII handling obligations are active from PENDING_CONFIRMATION onwards. All TRAVELER_PII fields in the Booking Object are subject to encryption at rest (AES-256-GCM) and jurisdiction-specific retention deadlines from this point.

---

## 3.3 CONFIRMED — Active State

### 3.3.1 Purpose

CONFIRMED is the pre-departure state. All suppliers have confirmed their components. The booking is contractually committed. The traveler has not yet entered the IN_JOURNEY state. The Booking Party holds duty of care.

### 3.3.2 Entry conditions

Entered exclusively from PENDING_CONFIRMATION via the All components confirmed transition (Section 3.2.4). No other entry path exists.

### 3.3.3 AI agent participation in CONFIRMED

AI agent participation is permitted in CONFIRMED at Level 1 (INFORMATION_PROVISION) and Level 2 (CONFIGURATION_SUGGESTION). DT-1 and DT-2 apply. Agents may propose amendments to the confirmed booking. All amendment proposals require human confirmation from the Booking Party before taking effect. Autonomous amendment is not permitted in CONFIRMED. Amendment proposals that require supplier re-confirmation trigger an AMENDMENT state transition (Section 3.4).

> **No protocol timeout for CONFIRMED:** No timeout is defined for the CONFIRMED state. This is intentional — the booking may remain in CONFIRMED indefinitely pending Booking Party action to commence the journey. The Booking Party holds contractual commitment; the Kernel Scheduler does not enforce a departure deadline. Cancellation policy terms apply if the Booking Party elects to cancel.

### 3.3.4 Transitions out of CONFIRMED

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| Journey begins | IN_JOURNEY | Booking Party or authorised agent records JOURNEY_STARTED. Phase set to PRE_DEPARTURE. | Kernel records JOURNEY_STARTED event. Phase field set to PRE_DEPARTURE. All Activity Components confirmed as PENDING. Pre-departure checklist assembled. |
| Amendment requested | AMENDMENT | Booking Party or authorised agent (DT-2, human-confirmed) submits amendment affecting one or more confirmed components. | Kernel records AMENDMENT_REQUESTED event. Booking Object enters AMENDMENT retaining CONFIRMED context. Suppliers of affected components notified. |
| Cancellation | BOOKING_CANCELLED | Booking Party initiates cancellation. OPA evaluates applicable cancellation policy before transition executes. | Kernel records BOOKING_CANCELLED event with cancellation_reason: BOOKING_PARTY_CANCELLATION. Cancellation policy terms applied. Supplier cancellation notifications dispatched. |
| Disruption declared | DISRUPTION_REVIEW | Booking Party or authorised agent (DT-4) disruption declaration. source_signal_reference must resolve to an event log entry (DOR-5). C1 reversal window (PT15M) opened on confirmed declaration. | Kernel records DISRUPTION_DECLARED event. Phase context preserved as PRE_DEPARTURE. Reversible downstream actions held during C1 window. |
| BOOKING_SUSPENDED entry | BOOKING_SUSPENDED (modifier) | One of the three BOOKING_SUSPENDED entry conditions met (C-BS-1, C-BS-2, or C-BS-3). Human confirmation required before Kernel applies modifier. | Kernel records BOOKING_SUSPENDED_ENTERED event. Phase preserved (pre-departure context). HEM invoked where applicable. All audit fields recorded per S5.6. |

---

## 3.4 AMENDMENT — Active State

### 3.4.1 Purpose

AMENDMENT is entered when an in-flight change to a confirmed booking requires supplier re-confirmation. The booking retains its pre-amendment state context — CONFIRMED (pre-journey) or IN_JOURNEY at the current phase — pending resolution of the amendment.

### 3.4.2 Entry conditions

Entered from CONFIRMED or IN_JOURNEY when a Booking Party or authorised agent submits an amendment affecting one or more confirmed Activity Components and those components require supplier re-confirmation.

### 3.4.3 Transitions out of AMENDMENT

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| Amendment accepted | CONFIRMED or IN_JOURNEY | All affected suppliers confirm amended components. Booking Party records AMENDMENT_ACCEPTED. | Kernel records AMENDMENT_CONFIRMED event. Booking Object returns to pre-amendment state (CONFIRMED or IN_JOURNEY at preserved phase). |
| Amendment rejected | CONFIRMED or IN_JOURNEY | One or more suppliers decline the amendment. Booking Party elects to retain original booking. | Kernel records AMENDMENT_REJECTED event. Original booking components reinstated. Booking Object returns to pre-amendment state. |
| Amendment cancel | BOOKING_CANCELLED | Booking Party elects to cancel rather than proceed with original or amended booking. | Kernel records BOOKING_CANCELLED event with cancellation_reason: BOOKING_PARTY_CANCELLATION. Cancellation policy applied. |
| Amendment timeout | CONFIRMED or IN_JOURNEY | Suppliers fail to respond within amendment confirmation timeout. Protocol default: PT2H. Party-configurable to tighter bounds. | Kernel Scheduler fires AMENDMENT_TIMEOUT event. HEM invoked with escalation_reason: AMENDMENT_TIMEOUT. Original booking reinstated pending human decision. |

---

## 3.5 DISRUPTION_REVIEW — Active State

### 3.5.1 Purpose

DISRUPTION_REVIEW is entered when a disruption event has been declared and is being actively resolved. The booking retains its current journey phase context. Normal autonomous agent operations are constrained to HOLD_AND_PRESERVE unless the agent holds explicit DISRUPTION_RESPONSE authority scope.

### 3.5.2 Entry conditions

Entered from IN_JOURNEY or CONFIRMED via a confirmed DT-4 AUTONOMOUS_INCIDENT_DECLARATION (C1 window elapsed or explicitly confirmed by the declaring agent) or via a Booking Party disruption declaration. The current journey phase is preserved on entry.

### 3.5.3 Disruption resolution model

An agent holding DISRUPTION_RESPONSE scope may propose alternative arrangements (DT-2) within DISRUPTION_REVIEW, but may not execute them autonomously — human confirmation from the duty-of-care Party is required before any rebooking or cancellation action executes. The full disruption handling model is specified in Section 8.

### 3.5.4 Transitions out of DISRUPTION_REVIEW

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| Resolution confirmed | IN_JOURNEY or CONFIRMED | Duty-of-care Party records DISRUPTION_RESOLVED. Alternative arrangements confirmed if applicable. | Kernel records DISRUPTION_RESOLVED event. Booking Object returns to pre-disruption state at preserved phase. Normal agent permissions resume. |
| Escalation to suspension | BOOKING_SUSPENDED (modifier) | Disruption escalates to a BOOKING_SUSPENDED entry condition (C-BS-1, C-BS-2, or C-BS-3). Requires legal authority order or force majeure declaration. | Kernel records DISRUPTION_ESCALATED_TO_SUSPENDED event. BOOKING_SUSPENDED modifier applied. HEM invoked immediately. |
| Cancellation | BOOKING_CANCELLED | Duty-of-care Party determines disruption cannot be resolved and elects to cancel. | Kernel records BOOKING_CANCELLED event with cancellation_reason: DISRUPTION_UNRESOLVABLE. Supplier notifications dispatched. Claims path activated if applicable. |
| Disruption review timeout | PARTY_UNRESPONSIVE | No resolution event within disruption review timeout. Protocol default: PT1H. Party-configurable to tighter bounds. | Kernel Scheduler fires DISRUPTION_REVIEW_TIMEOUT event. HEM invoked with escalation_reason: DISRUPTION_REVIEW_TIMEOUT. |

---

## 3.6 PARTY_UNRESPONSIVE — Active State

### 3.6.1 Purpose

PARTY_UNRESPONSIVE is entered when a Party with an active obligation fails to respond within a defined timeout. It is distinct from BOOKING_SUSPENDED: PARTY_UNRESPONSIVE has a timeout mechanism and, in some phases, permits limited autonomous action. The booking retains its current phase context.

### 3.6.2 Entry conditions

Entered from any active state when a timeout fires for a Party with an active obligation in the current phase. The specific triggering timeouts are defined per-phase in Section 4 and consolidated in Section 11.

### 3.6.3 Transitions out of PARTY_UNRESPONSIVE

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| Party responds | Previous active state | The unresponsive party records a valid response event. Identity re-verified by Security Kernel. | Kernel records PARTY_RESPONSIVE event. Booking Object returns to state from which PARTY_UNRESPONSIVE was entered. Phase and duty of care context restored. |
| Escalation to suspension | BOOKING_SUSPENDED (modifier) | Party remains unresponsive and circumstances escalate to a BOOKING_SUSPENDED entry condition. | Kernel records PARTY_UNRESPONSIVE_ESCALATED event. BOOKING_SUSPENDED modifier applied. HEM invoked. |
| Resolution by human | CONFIRMED or IN_JOURNEY | HEM human actor resolves the unresponsive situation — rebooking, cancellation of affected component, or substitution. | Kernel records HEM_RESOLVED event. Booking Object transitions per human decision. |
| Cancellation | BOOKING_CANCELLED | No resolution within the extended PARTY_UNRESPONSIVE timeout or human elects to cancel. | Kernel records BOOKING_CANCELLED event with cancellation_reason: PARTY_UNRESPONSIVE_UNRESOLVED. |

---

## 3.7 IN_JOURNEY — Active State

### 3.7.1 Purpose

IN_JOURNEY is the state in which the traveler is active — in transit or at the destination. Within IN_JOURNEY, the Booking Object tracks which of eight journey phases the traveler is currently in (Section 4). Duty of care is phase-appropriate and may transfer between parties as the traveler moves through the journey.

### 3.7.2 Entry conditions

Entered from CONFIRMED when the Booking Party or authorised agent records JOURNEY_STARTED. Phase field is set to PRE_DEPARTURE on entry. All Activity Components are confirmed as PENDING.

### 3.7.3 Transitions out of IN_JOURNEY

| Transition | Target state | Conditions required | Kernel action |
|---|---|---|---|
| Journey completes | COMPLETION | Booking Party records JOURNEY_COMPLETED. All Activity Components in FULFILLED or CANCELLED status. No open TU-2, TU-5, or TU-6 chains. No open W2 wellness events. All SUPPLIER_FAILURE_AT_DELIVERY claims resolved or formally handed to claims process. | Kernel records JOURNEY_COMPLETED event. Booking Object advances to COMPLETION terminal state. Event log and TRAVELER_PII retained per jurisdiction-defined periods. |
| Disruption declared | DISRUPTION_REVIEW | DT-4 AUTONOMOUS_INCIDENT_DECLARATION or Booking Party disruption declaration. source_signal_reference must resolve to an event log entry (DOR-5). | Kernel records DISRUPTION_DECLARED event. Phase context preserved. C1 reversal window (PT15M) opened. Reversible downstream actions held. |
| Amendment requested | AMENDMENT | Booking Party or authorised agent (DT-2, human-confirmed) submits amendment affecting one or more components. | Kernel records AMENDMENT_REQUESTED event. Booking Object enters AMENDMENT retaining IN_JOURNEY phase context. |
| Party unresponsive | PARTY_UNRESPONSIVE | Timeout fires for a party with an active obligation during the current phase. | Kernel records PARTY_UNRESPONSIVE_ENTERED event. Phase context preserved. HEM invoked per phase-specific rules. |
| BOOKING_SUSPENDED entry | BOOKING_SUSPENDED (modifier) | One of the three BOOKING_SUSPENDED entry conditions met (C-BS-1, C-BS-2, or C-BS-3). Human confirmation required. | Kernel records BOOKING_SUSPENDED_ENTERED event. Current journey phase preserved. Per-phase entry action set executed (S5.4). All audit fields recorded per S5.6. |
| Cancellation | BOOKING_CANCELLED | Booking Party initiates cancellation during the journey. OPA evaluates cancellation policy. | Kernel records BOOKING_CANCELLED event with cancellation_reason: BOOKING_PARTY_CANCELLATION. Supplier notifications dispatched. |

---

## 3.8 BOOKING_SUSPENDED — Parallel State Modifier

BOOKING_SUSPENDED is a parallel state modifier, not a sequential active state. It may overlay any active booking state or journey phase. It is specified in full in Section 5. The state inventory entry and exit paths are summarised in Appendix B (State Transition Table).

**Exit paths** (all require human authority confirmation):

| Path | Name | Target state |
|---|---|---|
| Path A | Cancellation during suspension | BOOKING_CANCELLED_SUSPENDED (terminal) |
| Path B | Suspension lifted | IN_JOURNEY at preserved phase (or CONFIRMED if suspended pre-journey) |
| Path C | Erroneous declaration | IN_JOURNEY at preserved phase (or CONFIRMED if suspended pre-journey) |

> **Design rule T-4-A:** BOOKING_SUSPENDED is modelled as a parallel state in the XState machine, not a phase-level state. The booking retains its current journey phase when BOOKING_SUSPENDED is entered.

---

## 3.9 COMPLETION — Terminal State

COMPLETION is entered when the journey has concluded and all JOURNEY_COMPLETED gate conditions are satisfied. No transitions out of COMPLETION exist. The Booking Object is archived. Event log and TRAVELER_PII are retained per jurisdiction-defined minimum periods.

**JOURNEY_COMPLETED gate conditions** (all must be satisfied):

- All Activity Components are in FULFILLED or CANCELLED status.
- No open TU-2, TU-5, or TU-6 TRAVELER_UNREACHABLE chains.
- No open W2 wellness events (unresolved RECOVERED assessment).
- All SUPPLIER_FAILURE_AT_DELIVERY claims resolved or formally handed to the claims process.

---

## 3.10 BOOKING_CANCELLED — Terminal State

BOOKING_CANCELLED is entered when the booking is cancelled through a normal cancellation path before or during the journey. No transitions out of BOOKING_CANCELLED exist.

Valid cancellation_reason values:

- `INQUIRY_ABANDONED`
- `INQUIRY_TIMEOUT`
- `SUPPLIER_DECLINE`
- `BOOKING_PARTY_WITHDRAWAL`
- `CONFIRMATION_TIMEOUT`
- `BOOKING_PARTY_CANCELLATION`
- `DISRUPTION_UNRESOLVABLE`
- `PARTY_UNRESPONSIVE_UNRESOLVED`

Cancellation policy terms are applied via OPA evaluation before the transition executes (except INQUIRY_ABANDONED and INQUIRY_TIMEOUT, which carry no contractual obligation). Supplier cancellation notifications are dispatched. TRAVELER_PII retention obligations apply per jurisdiction rules.

---

## 3.11 BOOKING_CANCELLED_SUSPENDED — Terminal State

BOOKING_CANCELLED_SUSPENDED is entered when a Booking Object in BOOKING_SUSPENDED state is cancelled via Path A (Section 5.5). It carries distinct obligations that do not apply to BOOKING_CANCELLED:

- TRAVELER_PII is retained until jurisdiction authority confirms purge is appropriate. The normal retention_deadline does not apply.
- The claim_initiation_ref hook remains active for claims administration.
- The booking_cancelled_during_suspension flag is set in the event log.
- Next-of-kin contact obligations continue per jurisdiction authority instructions (C-BS-1 cases).
- Supplier cancellation notifications are dispatched with SUSPENDED_CANCELLATION reason code.

> **cancellation_reason for BOOKING_CANCELLED_SUSPENDED:** The SUSPENDED_CANCELLATION reason code is specific to BOOKING_CANCELLED_SUSPENDED and is not part of the BOOKING_CANCELLED reason enum defined in Section 3.10. BOOKING_CANCELLED and BOOKING_CANCELLED_SUSPENDED are distinct terminal states with distinct reason spaces. Implementations must not conflate them.

No transitions out of BOOKING_CANCELLED_SUSPENDED exist.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 3 — April 2026*
