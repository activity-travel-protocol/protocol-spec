# Appendix B: State Transition Table

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Appendix B | April 2026

---

This appendix provides a consolidated reference of all state transitions defined in the Activity Travel Protocol Layer 3 Workflow Specification. It is normative: where a transition appears in this appendix and is not described in the main specification body, this appendix governs. Where a transition appears in both, the main specification body is the authority on conditions and semantics; this appendix is the authority on completeness — it confirms that no transition is missing from the specification.

Three tables are provided:

- **B.1** — Booking Object state transitions (the eleven-state machine defined in Section 3)
- **B.2** — Journey phase transitions (the eight-phase cycle defined in Section 4)
- **B.3** — Activity Component status transitions (the five-status component model defined in Section 3 and used throughout Sections 4 through 12)

All transitions in all three tables are Security Kernel operations. The Kernel executes non-bypassably on every transition. This is not restated per-row.

## B.1 Booking Object state transitions

The following table enumerates every valid state transition in the Booking Object state machine. Transitions not listed here are not permitted. An attempt to execute an unlisted transition is rejected by the Security Kernel with INVALID_TRANSITION as the rejection reason.

BOOKING_SUSPENDED is listed as both a source and target where applicable, reflecting its parallel modifier status. A booking in BOOKING_SUSPENDED retains its underlying active state — BOOKING_SUSPENDED is always paired with an underlying state. Entries in the BOOKING_SUSPENDED rows use `[SUSPENDED + state]` notation to reflect this.

| Source state | Target state | Transition event | Trigger authority | Conditions required | BOOKING_SUSPENDED interaction | Section ref |
|---|---|---|---|---|---|---|
| — (new) | INQUIRY | BOOKING_OBJECT_CREATED | Booking Party | Valid Party Registry identity. At least one Activity Component reference. TravelerContext T1+. Jurisdiction code valid. | Not applicable — BOOKING_SUSPENDED cannot be applied until a Booking Object exists. | S3.1.2 |
| INQUIRY | PENDING_CONFIRMATION | BOOKING_SUBMITTED | Booking Party | All Activity Components have FEASIBILITY_CLEARED. TravelerContext complete. At least one supplier confirmed active in Party Registry. | Not applicable pre-PENDING. | S3.1.5 |
| INQUIRY | BOOKING_CANCELLED | INQUIRY_ABANDONED | Booking Party or traveler | No conditions beyond initiating party authorisation. | Not applicable — BOOKING_CANCELLED is terminal. | S3.1.5 |
| INQUIRY | BOOKING_CANCELLED | INQUIRY_TIMEOUT | Kernel Scheduler | PT4H elapsed since BOOKING_OBJECT_CREATED (or tighter Party-configured value). | Not applicable. | S3.1.5 |
| PENDING_CONFIRMATION | CONFIRMED | BOOKING_CONFIRMED | Kernel (on receiving all SUPPLIER_CONFIRMED events) | SUPPLIER_CONFIRMED recorded for every Activity Component. | BOOKING_SUSPENDED is not entered in PENDING_CONFIRMATION by protocol design. C-BS conditions require a booking in an active operational state. | S3.2.4 |
| PENDING_CONFIRMATION | INQUIRY | SUPPLIER_DECLINED | Booking Party | One or more suppliers declined. Booking Party elects to reconfigure. | Not applicable. | S3.2.4 |
| PENDING_CONFIRMATION | BOOKING_CANCELLED | BOOKING_CANCELLED | Booking Party, Kernel Scheduler, or Supplier decline + cancel election | Multiple paths: Booking Party withdrawal, CONFIRMATION_TIMEOUT, Supplier decline + cancel. | Not applicable. | S3.2.4 |
| CONFIRMED | IN_JOURNEY | JOURNEY_STARTED | Booking Party or authorised agent | Phase set to PRE_DEPARTURE. All Activity Components PENDING. | If BOOKING_SUSPENDED is active: JOURNEY_STARTED rejected. BOOKING_SUSPENDED must be exited before journey begins. | S3.3.4 |
| CONFIRMED | DISRUPTION_REVIEW | DISRUPTION_DECLARED | Booking Party or authorised agent (DT-4) | Confirmed DT-4 declaration. source_signal_reference resolves to event log entry. C1 reversal window (PT15M) opened. Phase context preserved as PRE_DEPARTURE. | If BOOKING_SUSPENDED active: DISRUPTION_DECLARED rejected. | S3.3.4, S3.5.2 |
| CONFIRMED | AMENDMENT | AMENDMENT_REQUESTED | Booking Party or authorised agent (DT-2, human-confirmed) | Amendment affects one or more confirmed components requiring supplier re-confirmation. | If BOOKING_SUSPENDED active: AMENDMENT_REQUESTED rejected. | S3.3.4 |
| CONFIRMED | BOOKING_CANCELLED | BOOKING_CANCELLED | Booking Party | OPA evaluates cancellation policy before transition executes. | Not applicable to terminal state. | S3.3.4 |
| CONFIRMED | [SUSPENDED + CONFIRMED] | BOOKING_SUSPENDED_ENTERED | Human authority (C-BS-1, C-BS-2, or C-BS-3) | One of the three BOOKING_SUSPENDED entry conditions confirmed by human authority. | This IS the BOOKING_SUSPENDED entry transition. Phase preserved (PRE_JOURNEY context). | S5.2 |
| AMENDMENT | CONFIRMED | AMENDMENT_CONFIRMED | Booking Party | All affected suppliers confirmed amended components. AMENDMENT_ACCEPTED recorded. | Rejected if BOOKING_SUSPENDED active. | S3.4.3 |
| AMENDMENT | CONFIRMED | AMENDMENT_REJECTED | Booking Party | Supplier declines. Booking Party elects to retain original. | Rejected if BOOKING_SUSPENDED active. | S3.4.3 |
| AMENDMENT | IN_JOURNEY | AMENDMENT_CONFIRMED (in-journey) | Booking Party | Amendment during IN_JOURNEY state — returns to IN_JOURNEY at preserved phase. | Rejected if BOOKING_SUSPENDED active. | S3.4.3 |
| AMENDMENT | IN_JOURNEY | AMENDMENT_REJECTED (in-journey) | Booking Party | Original booking reinstated. Returns to IN_JOURNEY at preserved phase. | Rejected if BOOKING_SUSPENDED active. | S3.4.3 |
| AMENDMENT | BOOKING_CANCELLED | BOOKING_CANCELLED | Booking Party | Booking Party elects to cancel during amendment. Cancellation policy evaluated. | Not applicable to terminal state. | S3.4.3 |
| AMENDMENT | CONFIRMED or IN_JOURNEY | AMENDMENT_TIMEOUT | Kernel Scheduler | PT2H elapsed since AMENDMENT_REQUESTED (or tighter Party-configured value). HEM-15 invoked. Original booking reinstated pending human decision. | Rejected if BOOKING_SUSPENDED active. | S3.4.3 |
| DISRUPTION_REVIEW | CONFIRMED or IN_JOURNEY | DISRUPTION_RESOLVED | Duty-of-care Party | Resolution event recorded. Alternative arrangements confirmed if applicable. | Rejected if BOOKING_SUSPENDED active. | S3.5.4 |
| DISRUPTION_REVIEW | [SUSPENDED + DISRUPTION_REVIEW] | DISRUPTION_ESCALATED_TO_SUSPENDED | Human authority (C-BS-2 or C-BS-3) | Disruption escalates to a BOOKING_SUSPENDED entry condition. Human confirmation required. | This IS the BOOKING_SUSPENDED entry transition from DISRUPTION_REVIEW. | S3.5.4 |
| DISRUPTION_REVIEW | BOOKING_CANCELLED | BOOKING_CANCELLED | Duty-of-care Party | Disruption unresolvable. Cancellation policy evaluated. | Not applicable to terminal state. | S3.5.4 |
| DISRUPTION_REVIEW | PARTY_UNRESPONSIVE | DISRUPTION_REVIEW_TIMEOUT | Kernel Scheduler | PT1H elapsed (or tighter Party-configured value). HEM-16 invoked. | Rejected if BOOKING_SUSPENDED active. | S3.5.4 |
| PARTY_UNRESPONSIVE | (return to prior active state) | PARTY_RESPONSIVE | Previously unresponsive party | Party records a valid response. Identity re-verified by Security Kernel. | Rejected if BOOKING_SUSPENDED active. | S3.6.3 |
| PARTY_UNRESPONSIVE | [SUSPENDED + PARTY_UNRESPONSIVE] | PARTY_UNRESPONSIVE_ESCALATED | Human authority (C-BS-1, C-BS-2, or C-BS-3) | Party remains unresponsive and circumstances escalate to BOOKING_SUSPENDED condition. | This IS the BOOKING_SUSPENDED entry from PARTY_UNRESPONSIVE. | S3.6.3 |
| PARTY_UNRESPONSIVE | CONFIRMED or IN_JOURNEY | HEM_RESOLVED | Human actor via HEM response | Human actor resolves the unresponsive situation. | Rejected if BOOKING_SUSPENDED active. | S3.6.3 |
| PARTY_UNRESPONSIVE | BOOKING_CANCELLED | BOOKING_CANCELLED | Human actor or Kernel Scheduler | No resolution within extended timeout or human elects to cancel. | Not applicable to terminal state. | S3.6.3 |
| IN_JOURNEY | COMPLETION | JOURNEY_COMPLETED | Booking Party | All Activity Components FULFILLED or CANCELLED. No open TU-2, TU-5, TU-6 chains. No open W2 wellness events. All SUPPLIER_FAILURE_AT_DELIVERY claims resolved or handed to claims process. | Rejected if BOOKING_SUSPENDED active. | S3.7.3 |
| IN_JOURNEY | DISRUPTION_REVIEW | DISRUPTION_DECLARED | Booking Party or authorised agent (DT-4) | Confirmed DT-4 declaration. source_signal_reference resolves to event log entry. C1 reversal window opened. | Rejected if BOOKING_SUSPENDED active. | S3.7.3 |
| IN_JOURNEY | AMENDMENT | AMENDMENT_REQUESTED | Booking Party or authorised agent (DT-2, human-confirmed) | In-journey amendment affects components requiring re-confirmation. | Rejected if BOOKING_SUSPENDED active. | S3.7.3 |
| IN_JOURNEY | PARTY_UNRESPONSIVE | PARTY_UNRESPONSIVE_ENTERED | Kernel Scheduler (timeout) | Timeout fires for a party with active obligation in current phase. | Rejected if BOOKING_SUSPENDED active. | S3.7.3 |
| IN_JOURNEY | [SUSPENDED + IN_JOURNEY] | BOOKING_SUSPENDED_ENTERED | Human authority (C-BS-1, C-BS-2, or C-BS-3) | One of three entry conditions confirmed by human authority. Per-phase entry action set executed. | This IS the BOOKING_SUSPENDED entry from IN_JOURNEY. | S5.2 |
| IN_JOURNEY | BOOKING_CANCELLED | BOOKING_CANCELLED | Booking Party | Cancellation during journey. Cancellation policy evaluated. | Not applicable to terminal state. | S3.7.3 |
| [SUSPENDED + any active] | [same active state, suspension lifted] | BOOKING_SUSPENDED_LIFTED | Human authority (authority requirements per S5.5 Path B) | Authority-gated Path B exit. Context Package re-assembled. OPA re-evaluated. | This IS the BOOKING_SUSPENDED exit transition (Path B). | S5.5 |
| [SUSPENDED + any active] | [same active state, erroneous declaration] | BOOKING_SUSPENDED_ERRONEOUS | Human authority (Path C) | Human authority confirms declaration was incorrect. Full audit record preserved. Context Package re-assembled. | This IS the BOOKING_SUSPENDED exit transition (Path C). | S5.5 |
| [SUSPENDED + any active] | BOOKING_CANCELLED_SUSPENDED | BOOKING_CANCELLED_SUSPENDED | Human authority (authority requirements per S5.5 Path A) | Authority-gated Path A exit. booking_cancelled_during_suspension flag set. | This IS the BOOKING_SUSPENDED exit transition (Path A — terminal). | S5.5 |

---

## B.2 Journey phase transitions

The following table enumerates every valid journey phase transition within the IN_JOURNEY booking state. Phase transitions are triggered by explicit events recorded in the Booking Object event log. The Security Kernel validates authority and records every transition.

"May be skipped" means the transition is not required for all booking types — a booking with no outbound transit leg does not pass through OUTBOUND_TRANSIT. Skipped phases leave no trace in the event log except the absence of the corresponding transition event.

| Source phase | Target phase | Transition event | Trigger authority | May be skipped? | Conditions | Section ref |
|---|---|---|---|---|---|---|
| — (IN_JOURNEY entry) | PRE_DEPARTURE | JOURNEY_STARTED | Booking Party or authorised agent | No — every IN_JOURNEY booking starts in PRE_DEPARTURE | All Activity Components PENDING. CONFIRMED state immediately prior. | S4.1 |
| PRE_DEPARTURE | OUTBOUND_TRANSIT | OUTBOUND_TRANSIT_STARTED | Booking Party or authorised agent | Yes — if no transit leg booked | Traveler has physically commenced transit. Booking Party records departure. | S4.1.6 |
| PRE_DEPARTURE | ARRIVAL | ARRIVAL_STARTED (direct) | Booking Party or authorised agent | Yes — skips OUTBOUND_TRANSIT | No transit leg in booking. Traveler arrives directly at destination. | S4.1.6 |
| OUTBOUND_TRANSIT | ARRIVAL | ARRIVAL_STARTED | Booking Party or Carrier Party | No | Final transit leg completed. Traveler disembarked. | S4.2.6 |
| ARRIVAL | IN_DESTINATION | DESTINATION_REACHED | Host Party | No | Check-in complete. TRAVELER_RECEIVED event recorded. Host Party holds duty of care. | S4.3.6 |
| IN_DESTINATION | ACTIVITY_FULFILLMENT | ACTIVITY_STARTED | Fulfilling Party | Yes — if no activities or between activity cycles this transition may not occur until final activity | Scheduled Activity Component start time reached. Fulfilling Party ready. Duty of care transfers to Fulfilling Party. | S4.4.6 |
| ACTIVITY_FULFILLMENT | IN_DESTINATION | ACTIVITY_COMPLETED | Fulfilling Party | Yes — final activity transitions to RETURN_TRANSIT directly | Activity Component advances to FULFILLED. Duty of care returns to Host Party. | S4.5.6 |
| ACTIVITY_FULFILLMENT | IN_DESTINATION | ACTIVITY_FAILED | Booking Party | Yes — final activity transitions to RETURN_TRANSIT directly | SUPPLIER_FAILURE_AT_DELIVERY declared. Activity Component FAILED. Duty of care to Booking Party. | S4.5.6 |
| ACTIVITY_FULFILLMENT | RETURN_TRANSIT | RETURN_TRANSIT_STARTED (from final activity) | Booking Party or Fulfilling Party | Yes — only if this was the final Activity Component | Final Activity Component FULFILLED or FAILED. Transition directly from fulfillment to return transit. | S4.5.6 |
| IN_DESTINATION | RETURN_TRANSIT | RETURN_TRANSIT_STARTED | Booking Party or authorised agent | Yes — if no return transit leg | All Activity Components FULFILLED or CANCELLED. Traveler ready to depart. fit_to_continue gate applied if W2 event was open. | S4.6 |
| RETURN_TRANSIT | RETURN_ARRIVAL | RETURN_ARRIVAL_STARTED | Booking Party or Carrier Party | No | Final return transit leg completed. Traveler disembarked at home or next destination. | S4.6.6 |
| RETURN_ARRIVAL | COMPLETION (journey phase) | JOURNEY_COMPLETED (phase) | Booking Party | No | JOURNEY_COMPLETED gate conditions all satisfied. Kernel advances Booking Object to COMPLETION terminal state simultaneously. | S4.7.5 |

> **Phase cycling:** IN_DESTINATION → ACTIVITY_FULFILLMENT → IN_DESTINATION may repeat any number of times within a single IN_JOURNEY booking. Each cycle is a valid pair of ACTIVITY_STARTED and ACTIVITY_COMPLETED (or ACTIVITY_FAILED) events. The Booking Object records each cycle in the event log. There is no protocol-defined maximum cycle count.

> **BOOKING_SUSPENDED phase freeze:** When BOOKING_SUSPENDED is entered, the current journey phase is preserved. No phase transitions are permitted while BOOKING_SUSPENDED is active. On BOOKING_SUSPENDED exit via Path B or Path C, the journey resumes at the preserved phase. See S5 for the per-phase entry action sets.

---

## B.3 Activity Component status transitions

The following table enumerates every valid status transition for an Activity Component. Each Activity Component in a Booking Object transitions independently. Multiple Activity Components may be in different statuses simultaneously.

All Activity Component status transitions are Security Kernel operations recorded in the Booking Object event log.

| Source status | Target status | Transition event | Trigger authority | Conditions | BOOKING_SUSPENDED interaction | Section ref |
|---|---|---|---|---|---|---|
| — (component added) | PENDING | COMPONENT_ADDED | Booking Party (during INQUIRY or CONFIRMED) | Activity Component reference valid. Supplier Party registered and active. FEASIBILITY_CLEARED to be recorded before BOOKING_SUBMITTED. | Not applicable at creation. | S3.1.2 |
| PENDING | FULFILLING | ACTIVITY_STARTED | Fulfilling Party | Scheduled start time reached. Fulfilling Party records start. Journey phase is ACTIVITY_FULFILLMENT. Duty of care transfers to Fulfilling Party. | Frozen — must not transition to FULFILLING if BOOKING_SUSPENDED is entered before ACTIVITY_STARTED. | S4.5.2 |
| PENDING | CANCELLED | COMPONENT_CANCELLED | Booking Party or authorised agent (DT-2, human-confirmed) | Booking Party elects to cancel this component without cancelling the full booking. Cancellation policy evaluated per component. | Frozen — no status change permitted while BOOKING_SUSPENDED is active. | S3.1–S3.7 |
| FULFILLING | FULFILLED | ACTIVITY_COMPLETED | Fulfilling Party | Activity delivered as booked. Fulfilling Party records completion. Duty of care returns to Host Party (or Booking Party if final component). | Frozen at FULFILLING — must not be marked FULFILLED autonomously while BOOKING_SUSPENDED is active. Resume determination on exit. | S4.5.2 |
| FULFILLING | FAILED | SUPPLIER_FAILURE_AT_DELIVERY declared | Booking Party or authorised agent (within DISRUPTION_RESPONSE scope for SF-1, SF-3) | Supplier failed to deliver confirmed and attempted service. Incident category (SF-1, SF-2, SF-3) recorded. claim_initiation_ref activated. Duty of care to Booking Party. | Frozen at FULFILLING — must not be marked FAILED autonomously while BOOKING_SUSPENDED is active. | S8.3.6, S10.3.3 |
| FULFILLING | CANCELLED | COMPONENT_CANCELLED (during fulfillment) | Booking Party (human-confirmed; not autonomous) | Exceptional path — booking Party cancels a component already in FULFILLING. Requires human confirmation. Cancellation policy evaluated. Fulfilling Party notified via IPC. | Frozen — no status change permitted while BOOKING_SUSPENDED is active. | S4.5 |
| FAILED | — (terminal for component) | No transition — FAILED is terminal at component level | N/A | A FAILED Activity Component does not recover to PENDING or FULFILLED. Recovery requires a new Activity Component to be added (AMENDMENT path). claim_initiation_ref remains active. | No BOOKING_SUSPENDED interaction — FAILED is terminal. | S8.3.6 |
| FULFILLED | — (terminal for component) | No transition — FULFILLED is terminal at component level | N/A | A FULFILLED Activity Component is complete. It does not revert. | No BOOKING_SUSPENDED interaction — FULFILLED is terminal. | S4.5.6 |
| CANCELLED | — (terminal for component) | No transition — CANCELLED is terminal at component level | N/A | A CANCELLED Activity Component is complete. Cancellation policy terms applied at cancellation. | No BOOKING_SUSPENDED interaction — CANCELLED is terminal. | S3.1–S3.7 |

> **HOLD_AND_PRESERVE:** HOLD_AND_PRESERVE is not an Activity Component status — it is an instruction applied to a PENDING or FULFILLING component when the protocol requires a pause without status change. A component on HOLD_AND_PRESERVE retains its current status (PENDING or FULFILLING) and does not advance, cancel, or fail until the hold is explicitly released. HOLD_AND_PRESERVE is applied on: BOOKING_SUSPENDED entry (all PENDING and FULFILLING components), C1 reversal window (reversible downstream actions), and TU-2 / TU-6 chain entry. Release is a Kernel operation.

> **Component-level cancellation during full-booking cancellation:** When the Booking Object transitions to BOOKING_CANCELLED, BOOKING_CANCELLED_SUSPENDED, or COMPLETION, all Activity Components not already in a terminal status (FULFILLED, FAILED, CANCELLED) are moved to CANCELLED by the Kernel as part of the booking-level termination operation. These component-level transitions are not individually listed in this table — they are implicit consequences of the booking-level terminal transition.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Appendix B — April 2026*
