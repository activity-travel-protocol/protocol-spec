# Journey Phase Specification

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 4 | April 2026

---

This section specifies all eight journey phases that operate within the IN_JOURNEY booking state. Each phase definition includes: entry conditions, duty-of-care obligations, AI agent participation permissions, timeout rules, BOOKING_SUSPENDED interaction, and transition conditions to adjacent phases.

The Security Kernel executes non-bypassably on every phase transition. This is universally true and is not restated per phase. See Section 1.6.

BOOKING_SUSPENDED behaviour per phase is specified in Section 5. The per-phase duty-of-care level referenced in Section 5 is defined in each phase specification below.

## 4.0 Phase transition model

Journey phases advance in the sequence defined below. Phase transitions are not automatic — they are triggered by explicit events recorded in the Booking Object event log. A Booking Party or authorised agent records the transition event; the Security Kernel validates authority and records the transition.

Phase transitions may be skipped only where explicitly permitted in the phase specification. For example, a booking that includes no outbound transit (local activity booking) may transition directly from PRE_DEPARTURE to ARRIVAL without passing through OUTBOUND_TRANSIT.

| Phase sequence | Transition event | May be skipped? |
|---|---|---|
| PRE_DEPARTURE → OUTBOUND_TRANSIT | OUTBOUND_TRANSIT_STARTED | Yes — if no transit leg booked |
| OUTBOUND_TRANSIT → ARRIVAL | ARRIVAL_STARTED | No |
| ARRIVAL → IN_DESTINATION | DESTINATION_REACHED | No |
| IN_DESTINATION → ACTIVITY_FULFILLMENT | ACTIVITY_STARTED | Yes — phases cycle; traveler may return to IN_DESTINATION between activities |
| ACTIVITY_FULFILLMENT → IN_DESTINATION | ACTIVITY_COMPLETED or ACTIVITY_FAILED | Yes — final activity transitions directly to RETURN_TRANSIT |
| IN_DESTINATION → RETURN_TRANSIT | RETURN_TRANSIT_STARTED | Yes — if no return transit leg |
| RETURN_TRANSIT → RETURN_ARRIVAL | RETURN_ARRIVAL_STARTED | No |
| RETURN_ARRIVAL → COMPLETION | JOURNEY_COMPLETED | No |

> **Phase cycling:** IN_DESTINATION and ACTIVITY_FULFILLMENT may cycle multiple times within a single booking. The traveler moves between IN_DESTINATION (between activities) and ACTIVITY_FULFILLMENT (during each activity). Each Activity Component has its own fulfillment status. The journey phase reflects the current duty-of-care context, not a linear counter.

---

## 4.1 PRE_DEPARTURE — Phase 1 of 8

**Duty of care: Booking Party**

### 4.1.1 Purpose

PRE_DEPARTURE is entered when the journey begins and the traveler has not yet commenced transit. The booking is fully confirmed. All Activity Components are in PENDING status. The Booking Party holds duty of care and is the primary contact for pre-travel logistics, documentation, and last-minute changes.

### 4.1.2 Entry conditions

Entered from CONFIRMED via the Journey begins transition (Section 3.3.4). The JOURNEY_STARTED event must be recorded by the Booking Party or an authorised agent. Entry triggers:

- Booking Object phase field set to PRE_DEPARTURE.
- Duty of care assigned to Booking Party.
- All Activity Components confirmed as PENDING in the event log.
- Pre-departure checklist assembled by the Kernel: document requirements per jurisdiction, welfare contact references verified, any wellness declarations (W1/W4) confirmed with relevant suppliers.

### 4.1.3 AI agent participation

DT-1 (INFORMATION_PROVISION) and DT-2 (CONFIGURATION_SUGGESTION) permitted. Last-minute amendment proposals require Booking Party human confirmation before executing. No autonomous booking changes are permitted in PRE_DEPARTURE.

Typical agent actions in this phase: surface documentation reminders, check weather and travel advisories for the destination jurisdiction, propose itinerary optimisations if Activity Component timing allows amendment.

### 4.1.4 Timeout rules

| Timeout | Duration | Action on expiry |
|---|---|---|
| PRE_DEPARTURE maximum duration | No protocol maximum — phase ends when traveler departs | N/A |
| Supplier communication response | PT24H | PARTY_UNRESPONSIVE entered if supplier fails to respond to pre-departure communication |
| Amendment confirmation | PT2H | AMENDMENT timeout rules apply (Section 3.4) |

### 4.1.5 BOOKING_SUSPENDED in PRE_DEPARTURE

Duty of care level: NONE. Suspension is rare in this phase but technically possible (e.g. legal authority order received before departure). HEM invocation: recommended but not mandatory unless TU-5 or TU-6 applies, in which case mandatory. Exit paths per Section 5.

### 4.1.6 Transition to OUTBOUND_TRANSIT

The Booking Party or authorised agent records OUTBOUND_TRANSIT_STARTED. Conditions: traveler has physically commenced transit (boarded transport, departed origin). The Kernel records the transition, updates the phase, and notifies relevant suppliers of traveler departure status.

If no transit leg is booked, the Booking Party records ARRIVAL_STARTED directly, transitioning to ARRIVAL and skipping OUTBOUND_TRANSIT.

---

## 4.2 OUTBOUND_TRANSIT — Phase 2 of 8

**Duty of care: Booking Party / Carrier Party**

### 4.2.1 Purpose

OUTBOUND_TRANSIT covers the period during which the traveler is in transit to the destination — on a flight, train, ferry, or other carrier. The traveler is physically in motion and temporarily outside the immediate reach of the Booking Party. Duty of care is shared between the Booking Party and any Carrier Party registered in the booking.

### 4.2.2 Duty of care detail

The Booking Party retains primary duty of care throughout OUTBOUND_TRANSIT. If a Carrier Party is registered as an Activity Component supplier for a transit leg, that Carrier Party holds duty of care for the specific leg it is operating. Duty of care returns to the Booking Party between legs or during layovers.

IATA IROPS procedures apply to all airline-connected transit legs. If an IROPS event is declared during OUTBOUND_TRANSIT, DT-4 AUTONOMOUS_INCIDENT_DECLARATION rules apply and the IROPS category code should be recorded via the iata_irops_category_code field in SourceSignalRecord (SAR-18).

### 4.2.3 AI agent participation

DT-1 (INFORMATION_PROVISION) and DT-4 (AUTONOMOUS_INCIDENT_DECLARATION) are the primary decision types in OUTBOUND_TRANSIT. Agents may autonomously declare IROPS-type disruption events (DT-4) within their authority scope. Amendment proposals (DT-2) require Booking Party confirmation. Autonomous rebooking of alternative transit is permitted within agent authority scope if PARTY_UNRESPONSIVE rules apply and the phase is OUTBOUND_TRANSIT.

### 4.2.4 Timeout rules

| Timeout | Duration | Action on expiry |
|---|---|---|
| Transit leg overrun | PT2H beyond scheduled arrival | DISRUPTION_REVIEW entered. DT-4 declaration required. |
| Traveler unreachable (TU-1) | PT10M standard; PT5M in ACTIVITY_FULFILLMENT | Alt contact attempted. TU-1 rules apply (Security Architecture v1 Section 5.1). |
| PARTY_UNRESPONSIVE — carrier | PT30M | HEM invoked with escalation_reason: PARTY_UNRESPONSIVE |

### 4.2.5 BOOKING_SUSPENDED in OUTBOUND_TRANSIT

Duty of care level: MODERATE. If BOOKING_SUSPENDED is entered during OUTBOUND_TRANSIT, human escalation is required before resumption. The booking retains OUTBOUND_TRANSIT phase context. Any active transit leg is placed on HOLD_AND_PRESERVE. Per-phase behaviour detail in Section 5.

### 4.2.6 Transition to ARRIVAL

The Booking Party or Carrier Party records ARRIVAL_STARTED when the traveler has reached the destination and disembarked. Conditions: final transit leg completed. Kernel records the transition, phase advances to ARRIVAL, duty of care begins transfer to Host Party.

---

## 4.3 ARRIVAL — Phase 3 of 8

**Duty of care: Booking Party → Host Party**

### 4.3.1 Purpose

ARRIVAL covers the check-in and reception period at the destination. The traveler has arrived and is being received by the Host Party (hotel, resort, operator, or other accommodation/reception supplier). Duty of care transitions from the Booking Party to the Host Party during this phase.

### 4.3.2 Duty of care transfer

The duty-of-care transfer from Booking Party to Host Party is a Kernel operation. It is triggered when the Host Party records a TRAVELER_RECEIVED event. Until that event is recorded, the Booking Party retains duty of care. The transfer is recorded in the event log with:

- transferring_party: Booking Party ID
- receiving_party: Host Party ID
- transfer_timestamp: event log timestamp
- transfer_trigger: TRAVELER_RECEIVED

If the Host Party fails to record TRAVELER_RECEIVED within the arrival timeout, PARTY_UNRESPONSIVE is entered and duty of care remains with the Booking Party.

### 4.3.3 AI agent participation

DT-1 (INFORMATION_PROVISION) and DT-2 (CONFIGURATION_SUGGESTION) permitted. Check-in logistics, room assignment queries, accessibility requirement confirmations. No autonomous booking changes permitted in ARRIVAL. If a SUPPLIER_FAILURE_AT_DELIVERY incident is declared during ARRIVAL (e.g. accommodation not as booked), DT-4 rules apply and the claims path is activated.

### 4.3.4 Timeout rules

| Timeout | Duration | Action on expiry |
|---|---|---|
| TRAVELER_RECEIVED not recorded | PT2H from ARRIVAL_STARTED | PARTY_UNRESPONSIVE entered. HEM invoked. Booking Party duty of care retained. |
| Traveler unreachable during check-in | PT20M (TU-3a default) | TU-3a rules apply. Booking Party notified. |

### 4.3.5 BOOKING_SUSPENDED in ARRIVAL

Duty of care level: MODERATE. Human escalation required before resumption. The booking retains ARRIVAL phase context. If suspension occurs before TRAVELER_RECEIVED, duty of care remains with the Booking Party. If after, duty of care holder is recorded at suspension entry. Per-phase behaviour detail in Section 5.

### 4.3.6 Transition to IN_DESTINATION

Host Party records DESTINATION_REACHED when check-in is complete and the traveler is settled. Kernel records the transition. Duty of care is now fully with the Host Party. Phase advances to IN_DESTINATION.

---

## 4.4 IN_DESTINATION — Phase 4 of 8

**Duty of care: Host Party**

### 4.4.1 Purpose

IN_DESTINATION is the resting phase between activities. The traveler is at the destination — at the hotel, exploring independently, or otherwise between booked Activity Components. No Activity Component is in FULFILLING status during IN_DESTINATION. The Host Party holds duty of care.

IN_DESTINATION and ACTIVITY_FULFILLMENT are the two phases that cycle during the body of the trip. The traveler moves from IN_DESTINATION when an activity starts (ACTIVITY_FULFILLMENT) and returns to IN_DESTINATION when the activity is complete, until the final activity transitions to RETURN_TRANSIT.

### 4.4.2 Activity Component readiness

During IN_DESTINATION, the Kernel monitors the PENDING Activity Components scheduled for upcoming fulfillment. Suppliers of upcoming Activity Components are notified PT24H before the scheduled start time (configurable to tighter; not configurable to looser). If a supplier fails to acknowledge readiness within PT2H of notification, PARTY_UNRESPONSIVE is entered for that supplier.

### 4.4.3 AI agent participation

DT-1 (INFORMATION_PROVISION), DT-2 (CONFIGURATION_SUGGESTION), and DT-4 (AUTONOMOUS_INCIDENT_DECLARATION) permitted. Agents may surface local advisories, propose itinerary adjustments, and declare disruption events if external signals warrant. DT-2 proposals require Booking Party confirmation. DT-4 declarations open the C1 reversal window.

### 4.4.4 Timeout rules

| Timeout | Duration | Action on expiry |
|---|---|---|
| Supplier readiness acknowledgement | PT2H from notification | PARTY_UNRESPONSIVE entered for non-responding supplier |
| Traveler unreachable (TU-4 default) | PT20M | Autonomous action permitted within existing agent authority scope after timeout |

### 4.4.5 BOOKING_SUSPENDED in IN_DESTINATION

Duty of care level: HIGH. HEM invocation mandatory. DoC passes to Host Party immediately on entry. All upcoming Activity Components placed on HOLD_AND_PRESERVE. Jurisdiction Registry emergency contacts fetched and surfaced to human actor. Per-phase behaviour detail in Section 5.

### 4.4.6 Transition to ACTIVITY_FULFILLMENT

When a scheduled Activity Component start time is reached and the supplier is ready, the Fulfilling Party records ACTIVITY_STARTED. Kernel validates the ACTIVITY_STARTED event, advances the phase to ACTIVITY_FULFILLMENT, and transfers duty of care from the Host Party to the Fulfilling Party.

---

## 4.5 ACTIVITY_FULFILLMENT — Phase 5 of 8

**Duty of care: Fulfilling Party**

### 4.5.1 Purpose

ACTIVITY_FULFILLMENT is the phase during which the traveler is actively consuming a booked Activity Component. The Fulfilling Party holds duty of care. This phase carries the highest duty-of-care urgency in the protocol — it is the phase where the traveler is most directly under a supplier's care and most likely to require immediate response.

### 4.5.2 Activity Component status during fulfillment

The active Activity Component transitions to FULFILLING status on ACTIVITY_STARTED. It remains in FULFILLING status until one of:

- The Fulfilling Party records ACTIVITY_COMPLETED → status advances to FULFILLED.
- The Fulfilling Party or Booking Party declares SUPPLIER_FAILURE_AT_DELIVERY → status set to FAILED.
- A BOOKING_SUSPENDED entry freezes the component at FULFILLING — it must not be marked FAILED autonomously during suspension.

### 4.5.3 AI agent participation

DT-1 (INFORMATION_PROVISION) and DT-4 (AUTONOMOUS_INCIDENT_DECLARATION) are the primary decision types. Agents may declare disruption incidents autonomously within DISRUPTION_RESPONSE scope. The PT5M traveler unreachable timeout (TU-1) applies — shortened from the PT10M standard to reflect the elevated duty-of-care context.

### 4.5.4 Timeout rules

| Timeout | Duration | Action on expiry |
|---|---|---|
| Activity overrun | PT1H beyond scheduled end time | DISRUPTION_REVIEW entered. DT-4 declaration triggered. |
| Traveler unreachable (TU-1) | PT5M (shortened from PT10M standard) | Alt contact attempted. TU-1 rules apply immediately. |
| Traveler unreachable (TU-4) | PT10M | Autonomous action within existing scope after timeout. |
| PARTY_UNRESPONSIVE — fulfilling | PT30M | HEM invoked with escalation_reason: PARTY_UNRESPONSIVE (HEM-17). |

### 4.5.5 BOOKING_SUSPENDED in ACTIVITY_FULFILLMENT

Duty of care level: CRITICAL. HEM invocation mandatory — no exceptions. This is the highest-priority HEM invocation in the entire protocol (T-5-D). Shortest permitted protocol_deadline (PT5M floor). DoC passes to Booking Party immediately on suspension entry. Active Activity Component frozen at FULFILLING — must not be marked FAILED autonomously. Fulfilling Party, Host Party, and Booking Party notified simultaneously. Per-phase behaviour detail in Section 5.

### 4.5.6 Transition back to IN_DESTINATION

The Fulfilling Party records ACTIVITY_COMPLETED (or the Booking Party records ACTIVITY_FAILED for a failed component). The Kernel advances the Activity Component to FULFILLED or FAILED status, transfers duty of care back to the Host Party, and advances the phase to IN_DESTINATION — unless this was the final Activity Component, in which case the phase advances to RETURN_TRANSIT.

---

## 4.6 RETURN_TRANSIT — Phase 6 of 8

**Duty of care: Booking Party / Carrier Party**

### 4.6.1 Purpose

RETURN_TRANSIT mirrors OUTBOUND_TRANSIT for the homeward leg. The traveler is in transit away from the destination. The Booking Party holds primary duty of care; Carrier Parties hold duty of care for the specific legs they operate.

### 4.6.2 Duty of care detail

Duty of care structure is identical to OUTBOUND_TRANSIT (Section 4.2.2). IATA IROPS procedures apply to airline-connected return legs. The fit_to_continue gate applies: if a TravelerWellnessStatus W2 event is open at RETURN_TRANSIT entry, the duty-of-care Party must confirm the traveler is fit to travel before the RETURN_TRANSIT_STARTED event is accepted by the Kernel.

### 4.6.3 AI agent participation

DT-1 (INFORMATION_PROVISION) and DT-4 (AUTONOMOUS_INCIDENT_DECLARATION) are the primary decision types. Identical model to OUTBOUND_TRANSIT. Agents may autonomously declare IROPS-type disruption events within DISRUPTION_RESPONSE scope.

### 4.6.4 Timeout rules

| Timeout | Duration | Action on expiry |
|---|---|---|
| Transit leg overrun | PT2H beyond scheduled arrival | DISRUPTION_REVIEW entered. DT-4 declaration required. |
| PARTY_UNRESPONSIVE — carrier | PT30M | HEM invoked. |

### 4.6.5 BOOKING_SUSPENDED in RETURN_TRANSIT

Duty of care level: HIGH. HEM invocation mandatory. DoC transfer to Booking Party tracked and recorded. Active transit leg placed on HOLD_AND_PRESERVE. If an active W2 wellness event exists, it is linked to the BOOKING_SUSPENDED audit entry. Per-phase behaviour detail in Section 5.

### 4.6.6 Transition to RETURN_ARRIVAL

The Booking Party or Carrier Party records RETURN_ARRIVAL_STARTED when the traveler has arrived home or at the next destination and disembarked. Kernel records the transition. Phase advances to RETURN_ARRIVAL.

---

## 4.7 RETURN_ARRIVAL — Phase 7 of 8

**Duty of care: Booking Party**

### 4.7.1 Purpose

RETURN_ARRIVAL is the wind-down phase. The traveler has arrived home or at the next destination. The Booking Party holds duty of care. All Activity Components should be in FULFILLED or CANCELLED status by the time this phase is entered. The primary activities in this phase are administrative closure — claims, open TU chains, wellness follow-up, and TRAVELER_PII retention compliance.

### 4.7.2 AI agent participation

DT-1 (INFORMATION_PROVISION) and DT-6 (COMPLETION_ACKNOWLEDGEMENT) are the primary decision types. The agent may surface open claims, unresolved TU chains, and open W2 wellness events for human review before JOURNEY_COMPLETED is recorded. DT-6 triggers the JOURNEY_COMPLETED gate check.

### 4.7.3 Timeout rules

No operational timeouts are defined for RETURN_ARRIVAL beyond the general PARTY_UNRESPONSIVE rules. The JOURNEY_COMPLETED gate conditions (Section 3.9) must all be satisfied before COMPLETION can be entered — open TU-2, TU-5, or TU-6 chains and unresolved W2 events block the gate.

### 4.7.4 BOOKING_SUSPENDED in RETURN_ARRIVAL

Duty of care level: MODERATE. HEM invocation recommended; mandatory for C-BS-1 and C-BS-2. Administrative resolution acceptable for C-BS-3. No active transit or activity components expected. Per-phase behaviour detail in Section 5.

### 4.7.5 Transition to COMPLETION

The Booking Party records JOURNEY_COMPLETED once all gate conditions are satisfied. The Kernel evaluates the gate conditions, records the JOURNEY_COMPLETED event, and advances the Booking Object to the COMPLETION terminal state.

---

## 4.8 COMPLETION — Phase 8 of 8 (Journey Phase)

**Duty of care: Booking Party (wind-down)**

### 4.8.1 Purpose

The COMPLETION journey phase is entered when RETURN_ARRIVAL transitions to COMPLETION — it represents the brief period of administrative wind-down before the Booking Object reaches the COMPLETION terminal state. In most bookings, this phase is instantaneous: JOURNEY_COMPLETED is recorded and the Booking Object advances to COMPLETION terminal state immediately.

The COMPLETION journey phase is distinct from the COMPLETION terminal state (Section 3.9). The journey phase is the final phase within IN_JOURNEY. The terminal state is the final state of the Booking Object.

### 4.8.2 BOOKING_SUSPENDED in COMPLETION (journey phase)

Duty of care level: LOW. HEM invocation recommended; administrative resolution acceptable. No active components. Exceptional circumstance — the booking is functionally complete but legally suspended. Reason must be recorded in the event log. Per-phase behaviour detail in Section 5.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 4 — April 2026*
