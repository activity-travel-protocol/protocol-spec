# Purpose and Scope

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 1 | April 2026

| Field | Value |
|---|---|
| **Document status** | Working Draft — for review |
| **Layer** | Layer 3 — Workflow |
| **Depends on** | Layer 1 (complete); Context Package Step 6; Security Architecture v1; Pre-Layer 3 Review |
| **Does not depend on** | Layer 2 — Capability Catalogue (not yet written). No Layer 3 state logic references Layer 2 artifacts. |
| **Design rules applied** | T-1-A through T-5-D (all pre-conditions satisfied per Pre-Layer 3 Consistency Review) |

---

## 1.1 What this specification defines

The Activity Travel Protocol Layer 3 Workflow Specification defines the state machine that governs a Booking Object from the moment it is created through to its terminal state. It specifies every booking state, every state transition, every timeout rule, every duty of care obligation, every AI agent participation point, and every disruption handling path.

Layer 3 is the operational core of the Activity Travel Protocol. Layers 1 and 2 establish who the parties are and what they offer. Layer 3 defines what happens — the full governed lifecycle of a booking as a first-class runtime entity.

## 1.2 What this specification does not define

Layer 3 does not define:

- Party identity, trust chains, or jurisdiction compliance — these are Layer 1.
- Capability Declarations, Activity Configuration Schema, or the Capability Catalogue — these are Layer 2. No state machine logic in this specification depends on Layer 2 content. Design rule T-3-C applies.
- API surface, GraphQL schema, or SDK package internals — these are Layer 4. Layer 3 specifies state and transition semantics; Layer 4 specifies the technical interface that exposes them.
- The internal implementation of the Human Escalation Manager — Layer 3 specifies trigger conditions, escalation context, and execution gates. Handler implementation is application responsibility. Design rule T-5-C applies.
- AI provider, model, or inference infrastructure — Layer 3 specifies where AI agents participate and what authority they hold. Provider choice is application responsibility.

## 1.3 Relationship to prior specifications

Layer 3 is built on, and must be read alongside, the following documents:

| Document | Role in Layer 3 |
|---|---|
| Architecture Specification v1.0 | Defines the 12 OS functions, the Security Kernel execution order, the Booking Object runtime model, and the 8 journey phases that Layer 3 specifies in full. |
| Context Package Specification Step 6 | Defines the Context Package and Decision Object schemas that all AI agent participation points in Layer 3 use. SAR-1 through SAR-21 are the authoritative schema definitions. |
| Security Architecture v1 | Defines the TRAVELER_UNREACHABLE escalation chains (TU-1 through TU-6), BOOKING_SUSPENDED entry and exit conditions, SUPPLIER_FAILURE_AT_DELIVERY incident taxonomy, and TravelerWellnessStatus model. Layer 3 references these definitions without restating them. |
| Pre-Layer 3 Consistency Review | Resolves tensions T-1 through T-5 and produces 16 design rules (T-1-A through T-5-D) that this specification is required to follow. Open questions OQ-L3-1 through OQ-L3-3 and OQ-SL-1 are resolved within this specification. |
| Party Policy Declarations Spec v0.2 | Defines the PartyPolicyDeclaration structure, including the escalation_handler registration requirement enforced at Party registration time. |
| Trust Chain Declaration Spec v0.1 | Defines the Trust Unit model used in duty-of-care handoff tracking and the authority model for BOOKING_SUSPENDED exit paths. |

## 1.4 The two axes of the booking lifecycle

The Activity Travel Protocol booking lifecycle operates on two orthogonal axes. Understanding this distinction is essential for reading the rest of this specification correctly.

### Axis 1 — Booking Object state

The Booking Object moves through a single linear lifecycle: it is created, it is confirmed, it enters the journey period, and it reaches a terminal state. At any point in this lifecycle it may also carry the cross-cutting BOOKING_SUSPENDED modifier. The booking states are:

- **INQUIRY** — the booking is being configured and priced.
- **PENDING_CONFIRMATION** — the booking has been submitted and is awaiting supplier confirmation.
- **CONFIRMED** — the booking is confirmed. The traveler has not yet departed.
- **AMENDMENT** — an in-flight change to a confirmed booking is being negotiated.
- **DISRUPTION_REVIEW** — a disruption event has been declared and is being resolved. The booking retains its journey phase context.
- **PARTY_UNRESPONSIVE** — a party has become unreachable. Timeout rules and autonomous action permissions apply.
- **BOOKING_SUSPENDED** — a cross-cutting parallel state modifier. The booking retains its journey phase. No autonomous action proceeds. Human authority required to exit. (See Section 5.)
- **IN_JOURNEY** — the traveler is in transit or at the destination. Eight journey phases are active within this state (Axis 2).
- **COMPLETION** — the journey has concluded. Terminal state.
- **BOOKING_CANCELLED** — the booking was cancelled before or during the journey through a normal cancellation path. Terminal state.
- **BOOKING_CANCELLED_SUSPENDED** — the booking was cancelled while in BOOKING_SUSPENDED state. Carries distinct audit, retention, and claim obligations. Terminal state.

> **Design rule T-4-A:** BOOKING_SUSPENDED is modelled as a parallel state in the XState machine, not a phase-level state. The booking retains its current journey phase when BOOKING_SUSPENDED is entered.

### Axis 2 — Traveler journey phase

Within the IN_JOURNEY booking state, the Booking Object tracks which of eight journey phases the traveler is currently in. Journey phases describe the traveler's physical position and duty-of-care context — not the booking transaction state. Phases advance as the traveler moves from departure through return.

The eight phases are specified in full in Section 4. They are listed here for orientation:

| Phase | Traveler position | Duty of care holder |
|---|---|---|
| PRE_DEPARTURE | Preparing to travel; not yet in transit | Booking Party |
| OUTBOUND_TRANSIT | En route to destination | Booking Party / Carrier |
| ARRIVAL | Arriving at destination; check-in | Booking Party → Host Party |
| IN_DESTINATION | At destination; between activities | Host Party |
| ACTIVITY_FULFILLMENT | Actively consuming a booked activity | Fulfilling Party |
| RETURN_TRANSIT | En route home or to next destination | Booking Party / Carrier |
| RETURN_ARRIVAL | Arriving home or at next destination | Booking Party |
| COMPLETION | Journey concluded | Booking Party (wind-down) |

### Activity Components within a journey phase

The traveler's movement between individual suppliers — hotel, hot spring, restaurant, taxi, second hotel — is tracked at the Activity Component level within the Booking Object, not at the journey phase level. Journey phases are coarse-grained duty-of-care boundaries. Activity Components are the individual booked items within those boundaries.

An Activity Component carries its own fulfillment status: PENDING, FULFILLING, FULFILLED, FAILED, or CANCELLED. A sequence of activity components (hot spring → restaurant → return to hotel) all progress through their individual statuses while the journey phase remains IN_DESTINATION or ACTIVITY_FULFILLMENT throughout. Phase transitions occur at the coarser boundaries described in the table above.

The duty-of-care holder during ACTIVITY_FULFILLMENT is the Party currently fulfilling the active Activity Component. When the traveler moves from one Activity Component to the next, duty of care passes to the next fulfilling Party. This handoff is a Kernel operation recorded in the audit trail.

## 1.5 State machine notation

State machines in this specification are expressed in two forms:

- **BPMN 2.0 notation** — for human readability. BPMN diagrams are published as protocol artifacts alongside this specification. They are normative.
- **XState v5 TypeScript** — the runtime execution format. XState v5 runs in browser, edge functions (Deno/V8 isolate), and Node.js without a persistent server process, satisfying the cloud-agnostic Tier 1 and Tier 2 deployment requirements.

BPMN diagrams use four swimlanes throughout this specification:

| Swimlane | Contents |
|---|---|
| KERNEL | Non-bypassable Security Kernel operations: authenticate, authorise, OPA policy evaluation, Trust Chain validation, AI agent scope validation, ASSEMBLY POINT nodes, HEM dispatch gates, duty-of-care transfer notifications. |
| BOOKING PARTY | Booking Party operations: confirmation requests, amendment proposals, cancellation requests, duty-of-care actions within booking Party authority scope. |
| SUPPLIER | Supplier operations: confirmation, fulfillment acknowledgement, disruption declarations within supplier authority scope. |
| AI AGENT | AI agent participation: invocation following ASSEMBLY POINT, Decision Object submission, escalation requests. Agents operate only in this swimlane, never in KERNEL. |

> **Design rule T-2-A:** Every state transition requiring AI agent participation must include an explicit ASSEMBLY POINT node (KERNEL operation) in the BPMN diagram, preceding the USER-mode agent invocation. No direct path from raw booking data to AI agent invocation exists anywhere in this specification.

> **Design rule T-5-A:** HEM dispatch nodes appear in the KERNEL swimlane of BPMN diagrams in all cases.

## 1.6 Security Kernel execution on every transition

The Security Kernel runs non-bypassably on every state transition before any business logic executes. This is not restated throughout the specification — it is universally true. For every transition described in Sections 3 through 11, the following sequence has already completed before the transition takes effect:

- **Authenticate** — Party identity verified against the Party Registry; credential currency validated.
- **Authorise** — Party role verified as permitted for the requested operation in the current state.
- **Policy evaluation** — applicable ODRL policy set evaluated through OPA across all four policy tiers: Protocol, Jurisdiction, Party Operational, Party Preference.
- **Trust Chain validation** — full Trust Chain from requesting Party to protocol root verified.
- **AI agent scope validation** — if the request originates from an AI agent, authority scope validated against the operation requested. Out-of-scope requests trigger the Human Escalation Manager, not an error.

The Security Kernel is specified in Architecture Specification v1.0 Section 6 and Security Architecture v1. This specification does not restate its internal mechanics — it describes what happens after the Kernel has cleared a transition.

## 1.7 Open questions resolved by this specification

The Pre-Layer 3 Consistency Review identified four open questions carried into Layer 3. Their resolution points within this specification are recorded here for traceability.

| ID | Question | Resolved in |
|---|---|---|
| OQ-L3-1 | Live availability vs. static Capability Declaration — Layer 2 or Layer 3? | Section 3 (INQUIRY state design) |
| OQ-L3-2 | Conference / MICE workflow — distinct state machine variant? | Section 13 (Open Questions Resolution) |
| OQ-L3-3 | Does any Layer 3 inter-agent message format need to be A2A-compatible now? | Section 13 (Open Questions Resolution) |
| OQ-SL-1 | CAAM Trust Chain ↔ act-claim mapping — Layer 3 security appendix or standalone? | Section 13 (Open Questions Resolution) |

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 1 — April 2026*
