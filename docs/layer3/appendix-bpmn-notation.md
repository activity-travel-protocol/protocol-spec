# Appendix C: BPMN Notation Guide

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Appendix C | April 2026

---

This appendix defines the BPMN 2.0 notation conventions used in all Activity Travel Protocol Layer 3 workflow diagrams. It also specifies how the BPMN model maps to the XState v5 runtime implementation. Both the BPMN diagrams and the XState v5 state machine are normative artifacts of the Activity Travel Protocol. Where a discrepancy exists between a BPMN diagram and this notation guide, this appendix governs notation. Where a discrepancy exists between a BPMN diagram and the text of the main specification, the text of the main specification governs semantics.

Section C.1 defines the swimlane structure. Section C.2 defines node types and their shapes. Section C.3 defines edge types and their line styles. Section C.4 specifies per-swimlane rules. Section C.5 specifies the annotation conventions for HEM invocations, ASSEMBLY POINT nodes, and named protocol events. Section C.6 specifies the XState v5 mapping.

## C.1 Swimlane structure

All Layer 3 BPMN diagrams use exactly four swimlanes. The swimlane boundaries are absolute — a node placed in the wrong swimlane is a notation error, regardless of whether the diagram otherwise makes sense. The four swimlanes and their permitted contents are:

| Swimlane | Label | Permitted node types | Prohibited node types |
|---|---|---|---|
| **KERNEL** | `KERNEL` | ASSEMBLY POINT nodes, Security Kernel operations (authentication, authorisation, Cedar evaluation, Trust Chain validation, AI agent scope validation), duty-of-care transfer records, HEM dispatch gates, event log write operations, Kernel Scheduler timeout triggers, named protocol event recordings. | AI agent invocation nodes, Booking Party decision nodes, Supplier action nodes. |
| **BOOKING PARTY** | `BOOKING PARTY` | Booking Party decisions and actions: confirmation requests, amendment proposals, cancellation requests, duty-of-care actions within Booking Party authority scope, human confirmation nodes. | Kernel operations, Supplier actions, AI agent invocations. |
| **SUPPLIER** | `SUPPLIER` | Supplier operations: confirmation events, fulfillment acknowledgements, disruption declarations within supplier authority scope, TRAVELER_RECEIVED recordings, ACTIVITY_STARTED and ACTIVITY_COMPLETED events. In multi-supplier diagrams, this swimlane may be subdivided by supplier role (HOST PARTY, CARRIER PARTY, FULFILLING PARTY) using a nested swimlane structure. | Kernel operations, Booking Party decisions, AI agent invocations. |
| **AI AGENT** | `AI AGENT` | AI agent participation nodes: invocation following ASSEMBLY POINT, Decision Object submission, human_escalation_requested flag dispatch. In multi-agent diagrams, subdivide by agent role (BOOKING AGENT, OPERATIONS AGENT, etc.). | Kernel operations, Booking Party decisions, Supplier actions. Agents operate only in this swimlane, never in KERNEL. |

> **Swimlane assignment is authority assignment.** A node's swimlane declares which actor performs that operation. Placing an AI agent node in the KERNEL swimlane would imply the agent bypasses Security Kernel validation — this is a notation error that violates T-2-A. Placing a Kernel operation in the AI AGENT swimlane would imply an agent can write to the event log — also a violation.

## C.2 Node type reference

| Node type | BPMN shape | Fill | Description | Swimlane |
|---|---|---|---|---|
| **Start event** | Circle, thin border | White | Entry point for a flow. One per swimlane that initiates the depicted flow. | Any |
| **End event** | Circle, thick border | White | Terminal point for a flow. Terminal booking states (COMPLETION, BOOKING_CANCELLED, BOOKING_CANCELLED_SUSPENDED) use an end event with a filled circle interior. | Any |
| **ASSEMBLY POINT** | Rectangle with double border | Light blue (#D6E4F7) | Mandatory Kernel operation preceding AI agent invocation. Contains the label `ASSEMBLY POINT`. Sub-label identifies the Context Package assembly trigger (e.g., `DT-2 configuration suggestion`). Never appears in any swimlane other than KERNEL. | KERNEL only |
| **AI agent invocation** | Rectangle with rounded corners | Light yellow (#FFF9C4) | User-mode AI agent operation following an ASSEMBLY POINT. Contains the label `AGENT INVOKE` and the Decision Type(s) applicable (e.g., `DT-4 AUTONOMOUS_INCIDENT_DECLARATION`). Always in the AI AGENT swimlane. Always follows an ASSEMBLY POINT in the KERNEL swimlane via a sequence flow. | AI AGENT only |
| **Decision Object submission** | Rectangle with rounded corners | Light yellow (#FFF9C4) | AI agent returns Decision Object to Kernel. Sub-label: `DECISION OBJECT`. Follows the AI agent invocation node. Edge goes from AI AGENT swimlane back to KERNEL swimlane for validation. | AI AGENT → KERNEL edge |
| **Kernel validation gate** | Diamond | White | The Kernel's evaluation of a Decision Object: authority scope, confidence, reasoning, source_signal_reference. Gate exits: VALID (sequence flow) or INVALID / OUT_OF_SCOPE (HEM dispatch path). | KERNEL |
| **HEM dispatch** | Rectangle with thick border and envelope icon | Light orange (#FFE0B2) | Human Escalation Manager dispatch node. Label: `HEM-[NN]: [escalation_reason]`. Always in the KERNEL swimlane. Always has a protocol_deadline annotation (see C.5). | KERNEL |
| **Human confirmation** | Rectangle with person icon | Light green (#E8F5E9) | Human actor confirmation checkpoint — required before an execution-gated action proceeds. human_confirmation_token annotation (see C.5). | BOOKING PARTY (or SUPPLIER for supplier-side confirmations) |
| **Booking state transition** | Rectangle, standard | White | A state transition in the Booking Object. Label states the target state (e.g., `→ CONFIRMED`). Sub-label: the transition event (e.g., `BOOKING_CONFIRMED`). | KERNEL |
| **Activity Component transition** | Rectangle, standard, dashed border | White | An Activity Component status change. Label states the component and new status (e.g., `Component → FULFILLING`). Sub-label: transition event. | KERNEL |
| **Named protocol event** | Rectangle with star icon | Light purple (#EDE7F6) | Recording of a named protocol event (TRAVELER_FOUND, RECOVERED, SUPPLIER_FAILURE_AT_DELIVERY, DUTY_OF_CARE_TRANSFER_INITIATED, DUTY_OF_CARE_ACCEPTED, COORDINATION_OWNER_ASSIGNED, COORDINATION_DELEGATION_REQUESTED). Always in KERNEL swimlane. | KERNEL |
| **BOOKING_SUSPENDED entry** | Hexagon | Light red (#FFCDD2) | Entry into BOOKING_SUSPENDED parallel modifier. Label: `BOOKING_SUSPENDED ENTRY`. Sub-label: entry condition (C-BS-1, C-BS-2, or C-BS-3). Requires human confirmation node immediately preceding in BOOKING PARTY swimlane. | KERNEL (entry gate); BOOKING PARTY (confirmation) |
| **BOOKING_SUSPENDED exit** | Hexagon, dashed border | Light red (#FFCDD2) | Exit from BOOKING_SUSPENDED via Path A, B, or C. Label: `BOOKING_SUSPENDED EXIT [Path]`. Sub-label: authority required. | KERNEL (exit gate); BOOKING PARTY or external authority (confirmation) |
| **Timer event** | Circle with clock icon | White | Kernel Scheduler timeout event. Label: the timeout identifier (e.g., `INQUIRY_TIMEOUT`). Sub-label: ISO 8601 duration (e.g., `PT4H`). | KERNEL |
| **Intermediate event** | Circle, double border | White | An event that occurs during a flow and may change the flow direction without starting or ending the flow (e.g., SSF revocation event arrival during C1 window). | KERNEL |
| **Boundary event** | Circle, double border, attached to node border | White | An event attached to a node that may interrupt the node's execution (e.g., C1 window SSF revocation interrupting the DT-4 reversal window timer node). | KERNEL (attached to timer nodes) |

## C.3 Edge type reference

| Edge type | BPMN line style | Arrowhead | Description |
|---|---|---|---|
| **Sequence flow** | Solid | Filled | Normal execution sequence. Used between nodes within the same or adjacent swimlanes. |
| **Message flow** | Dashed | Open | Communication between swimlanes — e.g., KERNEL dispatching a HEM notification to BOOKING PARTY, or a Supplier sending a SUPPLIER_CONFIRMED message to KERNEL. Does not represent execution sequence. |
| **Data association** | Dashed, no arrow | Dot at source | Association between a data object (Context Package, Decision Object, Booking Object) and the node that reads or writes it. |
| **Conditional flow** | Solid with mini-diamond at source | Filled | Flow from a gateway with a condition label. Label states the evaluation outcome (e.g., `[confidence >= floor]`, `[in scope]`). |
| **Default flow** | Solid with hash at source | Filled | Default exit from a gateway when no other condition is met. |
| **Exception flow** | Solid, red | Filled, red | Error or exception path — e.g., Decision Object rejected, TU sub-category escalation, BOOKING_SUSPENDED_ERRONEOUS exit. |

## C.4 Per-swimlane rules

The following rules apply to each swimlane. These are notation requirements — a diagram that violates any of these rules is non-conformant with this appendix.

### KERNEL swimlane rules

- Every AI agent invocation node in the AI AGENT swimlane must have a corresponding ASSEMBLY POINT node in the KERNEL swimlane, connected by a sequence flow that precedes the invocation. There are no exceptions (T-2-A).
- Every HEM dispatch node appears in the KERNEL swimlane. HEM is never initiated from the BOOKING PARTY or SUPPLIER swimlane directly (T-5-A).
- The Security Kernel validation gate following each Decision Object submission must have at least two exits: a VALID exit (sequence flow, filled arrowhead) and an escalation exit for out-of-scope or invalid proposals (exception flow, red).
- BOOKING_SUSPENDED entry and exit hexagons always appear in the KERNEL swimlane. The human confirmation node that precedes them appears in the BOOKING PARTY swimlane and connects via message flow.
- Named protocol event nodes always appear in the KERNEL swimlane.
- Timer event nodes (Kernel Scheduler timeouts) always appear in the KERNEL swimlane.

### AI AGENT swimlane rules

- AI agents operate only in the AI AGENT swimlane, never in KERNEL (T-2-A).
- Every AI agent invocation node is preceded by an ASSEMBLY POINT node in the KERNEL swimlane. The connection is a sequence flow going from KERNEL to AI AGENT.
- Every AI agent invocation node is followed by a Decision Object submission node. The Decision Object submission connects back to the KERNEL swimlane via a message flow to the Kernel validation gate.
- If human_escalation_requested: true is shown as an explicit flow, it originates from the AI AGENT swimlane via message flow to the KERNEL swimlane HEM dispatch node.

### BOOKING PARTY swimlane rules

- Human confirmation nodes always appear in the BOOKING PARTY swimlane (or SUPPLIER for supplier-side confirmations). The confirmation node precedes the corresponding Kernel operation via message flow.
- Booking Party decision nodes (amendment proposals, cancellation requests, journey start confirmations) appear in the BOOKING PARTY swimlane.
- HEM response acknowledgements appear in the BOOKING PARTY swimlane and connect back to the KERNEL swimlane via message flow.

### SUPPLIER swimlane rules

- Supplier-side events (SUPPLIER_CONFIRMED, TRAVELER_RECEIVED, ACTIVITY_STARTED, ACTIVITY_COMPLETED) appear in the SUPPLIER swimlane and connect to the KERNEL swimlane via message flow.
- In multi-supplier diagrams: nested swimlanes within SUPPLIER are labelled by role (HOST PARTY, CARRIER PARTY, FULFILLING PARTY). Coordination Delegation scope is indicated by a dashed box overlay on the relevant Activity Component nodes.

## C.5 Annotation conventions

### HEM dispatch annotations

Every HEM dispatch node in the KERNEL swimlane carries the following annotations, placed in a text annotation box attached to the node via a data association:

```
HEM-[NN]
escalation_reason: [value]
protocol_deadline: [ISO 8601 duration]
human_confirmation_token: [required | not required]
secondary_path: [description or HEM_NO_SECONDARY_PATH]
priority: [P1 | P2 | P3 | P4]
```

The values must match the catalogue entry in Section 6. A HEM dispatch node without these annotations is incomplete but not a notation error — in overview diagrams where annotation space is limited, abbreviated annotations (HEM number and escalation_reason only) are acceptable.

### ASSEMBLY POINT annotations

Every ASSEMBLY POINT node in the KERNEL swimlane carries the following annotations:

```
ASSEMBLY POINT
trigger: [DT being assembled for]
sanitisation: CUSTOMER_INPUT pipeline applied
TRAVELER_PII: [identity_tier access level]
location_disclosure: [unblocked | blocked — TU-6 active]
signed: ES256, FAPI 2.0 profile
```

In overview diagrams, the abbreviated annotation `ASSEMBLY POINT — [DT]` is acceptable.

### Named protocol event annotations

Named protocol event nodes carry:

```
EVENT: [event name]
schema: [SAR reference or S10 reference]
authority: [who may declare]
blocks_JOURNEY_COMPLETED: [yes | no]
```

### C1 window annotations

DT-4 autonomous incident declaration flows include a C1 reversal window timer annotation:

```
C1 WINDOW
duration: PT15M (fixed — not configurable)
reversible actions: HELD
irreversible actions: BLOCKED
SSF interrupt: BOOKING_SUSPENDED check → HEM-12 if revocation event
```

### BOOKING_SUSPENDED entry/exit annotations

BOOKING_SUSPENDED entry hexagons carry:

```
BOOKING_SUSPENDED ENTRY
condition: [C-BS-1 | C-BS-2 | C-BS-3]
phase at entry: [current phase]
DoC holder at entry: [Party]
HEM: [HEM-NN invoked immediately]
```

BOOKING_SUSPENDED exit hexagons carry:

```
BOOKING_SUSPENDED EXIT
path: [Path A | Path B | Path C]
authority required: [description]
CP re-assembly: [required for Path B and C]
Cedar re-evaluation: [required for Path B and C]
```

## C.6 XState v5 mapping

The XState v5 state machine is the runtime execution format for the Layer 3 state machine. This section defines how the BPMN model maps to XState v5 constructs.

### C.6.1 Booking Object states

Each BPMN booking state maps to an XState v5 state node.

| BPMN state | XState v5 construct | Notes |
|---|---|---|
| INQUIRY | `{ id: 'INQUIRY', type: 'atomic' }` | Atomic state — no sub-states. |
| PENDING_CONFIRMATION | `{ id: 'PENDING_CONFIRMATION', type: 'atomic' }` | Atomic state. |
| CONFIRMED | `{ id: 'CONFIRMED', type: 'atomic' }` | Atomic state. |
| AMENDMENT | `{ id: 'AMENDMENT', type: 'atomic' }` | Atomic state. Returns to CONFIRMED or IN_JOURNEY on resolution. |
| DISRUPTION_REVIEW | `{ id: 'DISRUPTION_REVIEW', type: 'atomic' }` | Atomic state. Returns to prior state on resolution. |
| PARTY_UNRESPONSIVE | `{ id: 'PARTY_UNRESPONSIVE', type: 'atomic' }` | Atomic state. Returns to prior state on party response. |
| IN_JOURNEY | `{ id: 'IN_JOURNEY', type: 'compound', initial: 'PRE_DEPARTURE', states: { PRE_DEPARTURE, OUTBOUND_TRANSIT, ARRIVAL, IN_DESTINATION, ACTIVITY_FULFILLMENT, RETURN_TRANSIT, RETURN_ARRIVAL, COMPLETION } }` | Compound state with 8 child states representing journey phases. |
| BOOKING_SUSPENDED | `{ id: 'BOOKING_SUSPENDED', type: 'parallel' }` | Parallel state. Layered over active state. XState v5 parallel regions used. The underlying booking state persists as a sibling region. |
| COMPLETION | `{ id: 'COMPLETION', type: 'final' }` | Final state — terminal. |
| BOOKING_CANCELLED | `{ id: 'BOOKING_CANCELLED', type: 'final' }` | Final state — terminal. |
| BOOKING_CANCELLED_SUSPENDED | `{ id: 'BOOKING_CANCELLED_SUSPENDED', type: 'final' }` | Final state — terminal. |

### C.6.2 Journey phase sub-states

The eight journey phases are represented as child states within the IN_JOURNEY compound state.

```typescript
IN_JOURNEY: {
  type: 'compound',
  initial: 'PRE_DEPARTURE',
  states: {
    PRE_DEPARTURE:        { type: 'atomic', on: { OUTBOUND_TRANSIT_STARTED: 'OUTBOUND_TRANSIT', ARRIVAL_STARTED: 'ARRIVAL' } },
    OUTBOUND_TRANSIT:     { type: 'atomic', on: { ARRIVAL_STARTED: 'ARRIVAL' } },
    ARRIVAL:              { type: 'atomic', on: { DESTINATION_REACHED: 'IN_DESTINATION' } },
    IN_DESTINATION:       { type: 'atomic', on: { ACTIVITY_STARTED: 'ACTIVITY_FULFILLMENT', RETURN_TRANSIT_STARTED: 'RETURN_TRANSIT' } },
    ACTIVITY_FULFILLMENT: { type: 'atomic', on: { ACTIVITY_COMPLETED: 'IN_DESTINATION', ACTIVITY_FAILED: 'IN_DESTINATION', RETURN_TRANSIT_STARTED: 'RETURN_TRANSIT' } },
    RETURN_TRANSIT:       { type: 'atomic', on: { RETURN_ARRIVAL_STARTED: 'RETURN_ARRIVAL' } },
    RETURN_ARRIVAL:       { type: 'atomic', on: { JOURNEY_COMPLETED: 'COMPLETION_PHASE' } },
    COMPLETION_PHASE:     { type: 'atomic' }
  }
}
```

> **Phase cycling:** The IN_DESTINATION ↔ ACTIVITY_FULFILLMENT cycle is expressed as bidirectional transitions in XState v5. XState v5 does not require a special construct for cycles — the standard `on` transition syntax handles arbitrary repetition.

### C.6.3 BOOKING_SUSPENDED as a parallel region

BOOKING_SUSPENDED is implemented as an XState v5 parallel state encompassing two regions: the `booking_lifecycle` region (the active booking state) and the `suspension` region (the BOOKING_SUSPENDED modifier and its entry conditions, exit paths, and audit logic).

```typescript
bookingMachine: {
  type: 'parallel',
  states: {
    booking_lifecycle: {
      initial: 'INQUIRY',
      states: { INQUIRY, PENDING_CONFIRMATION, CONFIRMED, AMENDMENT, DISRUPTION_REVIEW, PARTY_UNRESPONSIVE, IN_JOURNEY, COMPLETION, BOOKING_CANCELLED, BOOKING_CANCELLED_SUSPENDED }
    },
    suspension: {
      initial: 'NOT_SUSPENDED',
      states: {
        NOT_SUSPENDED: { on: { C_BS_1_CONFIRMED: 'SUSPENDED', C_BS_2_CONFIRMED: 'SUSPENDED', C_BS_3_CONFIRMED: 'SUSPENDED' } },
        SUSPENDED: {
          entry: ['assembleAuditEntry', 'haltAgentInvocations', 'freezeTimeouts', 'dispatchHEM'],
          on: {
            PATH_A_CONFIRMED: '#bookingMachine.booking_lifecycle.BOOKING_CANCELLED_SUSPENDED',
            PATH_B_CONFIRMED: 'NOT_SUSPENDED',
            PATH_C_CONFIRMED: 'NOT_SUSPENDED'
          },
          exit: ['reassembleContextPackage', 'reEvaluateCedar']
        }
      }
    }
  }
}
```

> **Freeze semantics in XState v5:** XState v5 does not have a built-in state freeze primitive. The `haltAgentInvocations` and `freezeTimeouts` actions on SUSPENDED entry are implemented as guards on all transitions in the `booking_lifecycle` region — while the suspension region is in the SUSPENDED state, all booking_lifecycle transitions are guarded to reject unless they are the BOOKING_CANCELLED_SUSPENDED terminal path.

### C.6.4 Kernel Scheduler timeout implementation

XState v5 supports delay-based transitions via the `after` property. Kernel Scheduler timeouts map to `after` transitions on the relevant state nodes.

```typescript
INQUIRY: {
  type: 'atomic',
  after: {
    INQUIRY_TIMEOUT_DURATION: { target: 'BOOKING_CANCELLED', actions: ['recordInquiryTimeout'] }
  },
  on: {
    BOOKING_SUBMITTED: { target: 'PENDING_CONFIRMATION', guard: 'allComponentsFeasibilityCleared' },
    INQUIRY_ABANDONED: 'BOOKING_CANCELLED'
  }
}
```

The `INQUIRY_TIMEOUT_DURATION` constant is resolved at machine instantiation from the Party Policy Declaration or the protocol default (PT4H), whichever is tighter. The Kernel Scheduler service injects the resolved value at machine creation time — it is not hardcoded in the machine definition.

> **Timeout freeze during BOOKING_SUSPENDED:** XState v5 `after` transitions are cancelled when a state is exited. Since BOOKING_SUSPENDED is a parallel region (not a child state), active timers in the `booking_lifecycle` region continue to fire unless explicitly cancelled. The Activity Travel Protocol implementation cancels all active Kernel Scheduler timers on SUSPENDED entry via the `freezeTimeouts` action, and restores them with their remaining durations on SUSPENDED exit via the context-restoration logic in the `reassembleContextPackage` action. This is an implementation responsibility — XState v5 provides the mechanism; the protocol specifies the freeze semantics.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Appendix C — April 2026*
