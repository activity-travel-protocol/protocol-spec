# S7 Feasibility Check Operation

**Activity Travel Protocol 窶・Layer 2 Capability and Discovery Specification**
**Section 7: Feasibility Check Operation**
**Status: WORKING DRAFT 窶・March 2026**

---

## 7.1 Purpose

The Feasibility Check is the protocol operation that produces `FEASIBILITY_CLEARED` per Activity Component. It is the gate between the INQUIRY phase and the continuation of the booking workflow: INQUIRY MUST NOT exit until every required Activity Component has either cleared feasibility or the feasibility window has expired and the partial-feasibility behaviour defined in ﾂｧ7.5 has been applied.

The Feasibility Check is **asynchronous and event-driven** (design decision PD-L2-1, closed). Suppliers push `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` as events per Activity Component when their internal readiness assessment is complete. The protocol does not poll; it waits on events within the feasibility window. A single-supplier scenario where the supplier responds immediately is the degenerate synchronous case and is handled correctly by this model without a separate code path.

This section defines:

- The Feasibility Window parameter (satisfying L2-T-1-A and L2-T-1-B).
- The per-Activity-Component evaluation sequence.
- The declaration currency validation (satisfying L2-T-3-C).
- The Delegation Topology feasibility step (satisfying L2-T-5-B).
- The partial feasibility behaviour (satisfying L2-T-1-C).
- The event model and result schema.
- The design rules governing this operation.

---

## 7.2 Feasibility Window

### 7.2.1 Definition

The Feasibility Window is the maximum duration for which INQUIRY remains open waiting for `FEASIBILITY_CLEARED` events across all required Activity Components. It is a Layer 2 protocol parameter. Layer 3 S11 references the Layer 2-defined Feasibility Window as an external parameter rather than specifying a fixed value; the INQUIRY state timeout in Layer 3 is the Feasibility Window duration 窶・they are the same variable, not two separate timeouts.

### 7.2.2 Parameter Values

| Parameter | Value | Notes |
|---|---|---|
| Minimum | PT5M (5 minutes) | A Feasibility Window shorter than 5 minutes is non-conformant. |
| Default | PT30M (30 minutes) | Applied when no explicit window is configured. |
| Maximum | PT4H (4 hours) | A Feasibility Window longer than 4 hours is non-conformant. |

These are ISO 8601 duration values. The minimum and maximum are protocol constants. The default is the value applied in the absence of explicit configuration.

### 7.2.3 Configuration and Override Constraints

The Feasibility Window may be configured by the operator or Booking Party within the minimum窶杜aximum range. It is not a Party Policy Declaration override: parties cannot extend the window beyond the Layer 2-defined maximum, and no Pre-Arrangement Declaration may override it (L2-T-1-B). A configuration value outside the min窶杜ax range MUST be rejected at configuration time.

### 7.2.4 Window Start

The Feasibility Window is a booking-level timer. It starts when the booking agent emits `FEASIBILITY_CHECK_INITIATED` on the Booking Object, signalling that the full Activity Component set for this INQUIRY is fixed and feasibility evaluation may begin. The window does not start on the first per-component submission; it starts on the booking-level initiation event. This ensures the full declared window duration is available to suppliers as supplier response time, independently of the time consumed by synchronous pre-condition steps (ﾂｧ7.3 steps 1窶・) for each component.

A booking agent MUST NOT emit `FEASIBILITY_CHECK_INITIATED` until the complete Activity Component set for the INQUIRY is known and registered.

**Authority scope requirement:** The emitting agent MUST hold discovery-phase authority scope L2-AS-4 (INITIATE_FEASIBILITY) as defined in S10 ﾂｧ10.2.2. An agent holding L2-AS-3 or below MUST NOT emit this event; such an event MUST be rejected by the Feasibility Check engine (DR-L2-10-B). Holding L2-AS-4 does not waive the component-set requirement above.

**Multi-party payload requirement:** For bookings involving n > 2 distinct Fulfilling Parties, the `FEASIBILITY_CHECK_INITIATED` payload MUST include a `proposedChain` field 窶・an ordered array of `partyId` values representing the candidate delegation chain. The Feasibility Check engine uses this ordering when executing the topology validation step (ﾂｧ7.4.3). A Feasibility Check initiation for a multi-party booking without a `proposedChain` field MUST be rejected (DR-L2-11-A). See also ﾂｧ7.6.2 for the complete event payload schema.

### 7.2.5 Window Suspension

If the Booking Object enters `BOOKING_SUSPENDED` during an open Feasibility Window, the window timer is frozen for the duration of the suspension, consistent with the general timeout freeze rule applied to all timeout budgets in Layer 3 S11. The remaining window duration resumes when the Booking Object exits `BOOKING_SUSPENDED`.

---

## 7.3 Per-Component Evaluation Sequence

The Feasibility Check executes the following sequence for each Activity Component. Steps 1窶・ are synchronous pre-conditions executed by the protocol engine before the supplier event is awaited. Step 5 is the asynchronous step. All steps are evaluated at the time the feasibility result is emitted, not at the time the check is initiated (DR-L2-7-A).

**Step 1 窶・Resource Reference validation.**
Confirm that all `resourceRefId` values cited in the Activity Component's Capability Declaration are registered, non-expired entries in the Resource Reference Registry (ﾂｧ5). If any are expired or deregistered: emit `FEASIBILITY_FAILED` with reason `RESOURCE_REF_INVALID`. If any are stale: include `STALE_RESOURCE_REF` warning in the result payload and continue.

**Step 2 窶・Capability Declaration currency validation.**
Confirm that the Capability Declaration the Activity Component is assessed against is the current valid version and has not expired or been superseded (L2-T-3-C). If the declaration has expired: emit `FEASIBILITY_FAILED` with reason `DECLARATION_EXPIRED`. If the declaration has been superseded by a `DECLARATION_SUPERSEDED` event (defined in S3): emit `FEASIBILITY_FAILED` with reason `DECLARATION_STALE`. The booking agent must obtain a fresh declaration before retrying.

**Step 3 窶・Pre-Arrangement Declaration validation.**
Confirm that all Pre-Arrangement Declarations cited in or implied by the Capability Declaration are in `ACTIVE` status (ﾂｧ6.8). If any are expired, deregistered, `REJECTED`, or `ACCEPTANCE_TIMEOUT`: emit `FEASIBILITY_FAILED` with reason `PRE_ARRANGEMENT_INVALID`. If any have `validUntil` within 7 days of emission time: include `PRE_ARRANGEMENT_EXPIRY_WARNING` in the result payload and continue.

**Step 4 窶・Delegation Topology feasibility step (multi-party bookings only).**
For bookings involving more than two Fulfilling Parties (n > 2), confirm that a valid delegation chain can be constructed from the registered Delegation Topology Declarations of all required Fulfilling Parties (L2-T-5-B). The Delegation Topology Declaration schema is defined in S3 as a component of the Capability Declaration. If a valid chain cannot be constructed: emit `FEASIBILITY_FAILED` with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`. See ﾂｧ7.4 for the full delegation topology step specification.

**Step 5 窶・Supplier readiness event.**
Await the supplier's `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` event for this Activity Component within the remaining Feasibility Window. If the supplier pushes `FEASIBILITY_FAILED`, the protocol records the supplier-provided reason in `supplierPayload` and propagates it in the result. A supplier event received after `FEASIBILITY_TIMEOUT` has been emitted for this component is a late event and MUST be discarded (DR-L2-7-G).

**Step 6 窶・Emit result.**
On `FEASIBILITY_CLEARED` from the supplier (and with all steps 1窶・ passed): emit `FEASIBILITY_CLEARED` for this Activity Component, including any warnings accumulated in steps 1窶・. On any failure in steps 1窶・ or a supplier `FEASIBILITY_FAILED` in step 5: emit `FEASIBILITY_FAILED` with the accumulated reason set.

---

## 7.4 Delegation Topology Feasibility Step

### 7.4.1 Trigger Condition

Step 4 of the per-component evaluation is triggered when the booking's Activity Component set includes components from more than two distinct Fulfilling Parties. A two-party booking (one Booking Party, one Fulfilling Party) has no delegation topology step. A booking with a single Booking Party and three or more Fulfilling Parties triggers step 4 for every Activity Component in the set.

### 7.4.2 Delegation Topology Declaration

The Delegation Topology Declaration is defined in S3 as a component of the Capability Declaration. This section specifies how S7 uses that declaration during the feasibility step; the schema definition is normatively located in S3. The fields consumed by S7 are:

| Field | Description |
|---|---|
| `maxDelegationDepth` | Maximum number of sequential two-party delegation steps this party supports. The feasibility step confirms this value is sufficient for the party's position in the required chain. |
| `coDelegateeConstraints` | Constraints on which parties may appear as co-delegatees in a chain involving this party. The feasibility step validates these constraints for every consecutive pair. |
| `topologyVersion` | Version of the Delegation Topology Declaration. The feasibility step records the version used in the `topologyChainRef`. |

### 7.4.3 Chain Construction

The Feasibility Check engine constructs a candidate delegation chain by:

1. Ordering the required Fulfilling Parties by their role in the booking workflow.
2. Verifying that each Fulfilling Party has a registered, non-expired Delegation Topology Declaration.
3. Verifying that the chain depth does not exceed the minimum `maxDelegationDepth` across all parties in the chain.
4. Verifying that no `coDelegateeConstraints` are violated for any consecutive pair in the chain.

A valid chain satisfies all four conditions and is expressible as sequential two-party Coordination Delegation operations in Layer 3 v1.0 (L2-T-5-C). Topologies that require simultaneous multi-party delegation 窶・not expressible as a chain 窶・are non-conformant in v1.0 and MUST cause `FEASIBILITY_FAILED` with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`.

### 7.4.4 Topology Confirmation

`FEASIBILITY_CLEARED` at the Activity Component level implies that the delegation topology has been confirmed feasible for that component's Fulfilling Party's position in the chain (L2-T-5-B). The confirmed chain is recorded in the Booking Object as a `topologyChainRef` and referenced by Layer 3 Coordination Delegation operations at runtime.

---

## 7.5 Partial Feasibility Behaviour

### 7.5.1 Definition

Partial feasibility is the state in which, at the expiry of the Feasibility Window, some Activity Components have emitted `FEASIBILITY_CLEARED` and others have neither cleared nor explicitly failed 窶・they have timed out without a supplier response.

### 7.5.2 Normative Behaviour

The protocol defines the following behaviour on partial feasibility (satisfying L2-T-1-C):

**INQUIRY MUST NOT proceed with unconfirmed Activity Components.** An Activity Component that has not issued `FEASIBILITY_CLEARED` by the end of the Feasibility Window is treated as a timeout failure.

On Feasibility Window expiry with one or more timed-out components, the protocol emits `FEASIBILITY_TIMEOUT` for each timed-out Activity Component and propagates this to the Booking Object. The booking agent then has two conformant options:

**Option A 窶・Abandon and retry.** The booking agent abandons the current INQUIRY and initiates a new one, potentially with a different Activity Component set or a longer feasibility window (within the maximum).

**Option B 窶・Reduce scope.** If the timed-out Activity Components are optional to the booking (the booking can satisfy the consumer's requirements without them), the booking agent MAY invoke the `REDUCE_SCOPE` operation on the Booking Object to remove the timed-out components. `REDUCE_SCOPE` is a protocol-defined operation that goes through the full Security Kernel execution sequence (authenticate, authorise, Cedar evaluation, Trust Chain validation, agent scope validation). The Booking Object MUST record which components were removed and the reason (`FEASIBILITY_TIMEOUT`). The Layer 3 state machine definition of `REDUCE_SCOPE` is the normative reference for the transition mechanics.

### 7.5.3 Cleared Components on Timeout

Activity Components that have emitted `FEASIBILITY_CLEARED` before the Feasibility Window expires retain their cleared status (DR-L2-7-E). Their clearance is not invalidated by the timeout of other components in the same booking. If the booking agent selects Option B, the cleared components proceed without re-evaluation.

---

## 7.6 Event Model

### 7.6.1 Input Events (supplier-pushed)

| Event | Source | Description |
|---|---|---|
| `FEASIBILITY_CLEARED` | Fulfilling Party | The supplier confirms this Activity Component is feasible. Includes `activityComponentId`, `declarationVersion`, and optional `supplierPayload`. |
| `FEASIBILITY_FAILED` | Fulfilling Party | The supplier cannot confirm feasibility for this Activity Component. Includes `activityComponentId`, `failureReason`, and optional `supplierPayload`. |

Suppliers MUST push one of these two events per Activity Component within the Feasibility Window. A supplier that does not push either event within the window causes a `FEASIBILITY_TIMEOUT` for that component.

### 7.6.2 Output Events (protocol-emitted)

| Event | Trigger | Key payload fields |
|---|---|---|
| `FEASIBILITY_CHECK_INITIATED` | Booking agent signals complete component set and starts the window. | `bookingObjectId`, `activityComponentIds[]`, `windowDuration`, `windowExpiresAt`, `proposedChain[]` (required when n > 2 distinct Fulfilling Parties; ordered `partyId` array of the candidate delegation chain). |
| `FEASIBILITY_CLEARED` | Step 6: all steps passed and supplier cleared. | `activityComponentId`, `declarationVersion`, `warnings[]`, `topologyChainRef` (if delegation step ran). |
| `FEASIBILITY_FAILED` | Steps 1窶・: any failure condition. | `activityComponentId`, `failureReasons[]`, `warnings[]`. |
| `FEASIBILITY_TIMEOUT` | Feasibility Window expired without supplier response for this component. | `activityComponentId`, `windowDuration`, `windowExpiredAt`. |
| `FEASIBILITY_WINDOW_EXPIRING` | 5 minutes before Feasibility Window expiry, if components remain uncleared. Suppressed if total window duration is 竕､ PT5M. | `bookingObjectId`, `unclearedComponents[]`, `windowExpiresAt`. |

### 7.6.3 The supplierPayload Field

`supplierPayload` is an opaque, optional JSON object with a maximum size of 4 KB. It carries no protocol semantics; the protocol engine does not evaluate its contents. It is appended to the event record in the append-only log for audit purposes and MAY be surfaced to the booking agent for informational use. `supplierPayload` MUST NOT affect any protocol evaluation step.

### 7.6.4 Failure Reason Vocabulary

`FEASIBILITY_FAILED` events carry a `failureReasons[]` array. The protocol defines the following normative reason codes:

| Reason Code | Source | Description |
|---|---|---|
| `RESOURCE_REF_INVALID` | Step 1 | One or more Resource References cited in the Capability Declaration are expired or deregistered. |
| `DECLARATION_EXPIRED` | Step 2 | The Capability Declaration has passed its validity period. |
| `DECLARATION_STALE` | Step 2 | The Capability Declaration has been superseded by a `DECLARATION_SUPERSEDED` event. |
| `PRE_ARRANGEMENT_INVALID` | Step 3 | One or more required Pre-Arrangement Declarations are not in `ACTIVE` status. |
| `DELEGATION_TOPOLOGY_UNSUPPORTED` | Step 4 | A valid delegation chain cannot be constructed for this multi-party booking. |
| `SUPPLIER_DECLINED` | Step 5 | The supplier pushed `FEASIBILITY_FAILED`. The supplier's own reason is carried in `supplierPayload`. |
| `LIVE_AVAILABILITY_DRIVER_INVALID` | Step 3 (Active Gate mode) | The Capability Declaration cites a `liveAvailabilityDriverRef` that is expired or deregistered in the Resource Reference Registry at emission time. |
| `LIVE_AVAILABILITY_GATE_CLOSED` | Step 5 (Active Gate mode) | The supplier pushed `FEASIBILITY_FAILED` because their live availability signal indicates no capacity is available for the requested configuration. |
| `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE` | Step 5 (Active Gate mode) | The supplier's live availability system became unreachable during the Feasibility Window. The supplier MUST push this code within PT2M of detecting system unavailability (DR-L2-9-F). |

Multiple reason codes MAY appear in a single `FEASIBILITY_FAILED` event if steps 1窶・ produce independent failures before the supplier event is awaited.

---

## 7.7 Retry Behaviour

A booking agent MAY retry the Feasibility Check for a failed Activity Component after addressing the cause of failure. Retry rules:

- A retry after `DECLARATION_EXPIRED` or `DECLARATION_STALE` requires a fresh Capability Declaration to be obtained and registered before re-initiating. The updated declaration is the normative source for retry evaluation.
- A retry after `RESOURCE_REF_INVALID` requires the Fulfilling Party to re-register or revalidate the affected Resource Reference entry before re-initiating.
- A retry after `PRE_ARRANGEMENT_INVALID` requires the Pre-Arrangement Declaration to be renewed or re-registered and accepted before re-initiating.
- A retry after `SUPPLIER_DECLINED` is subject to the supplier's retry policy. Suppliers publish their retry policy in their Capability Declaration (S3); booking agents SHOULD consult the declaration before retrying.
- A retry after `FEASIBILITY_TIMEOUT` MAY use a longer feasibility window, within the Layer 2 maximum (PT4H). A new `FEASIBILITY_CHECK_INITIATED` event is required to start the new window.
- `DELEGATION_TOPOLOGY_UNSUPPORTED` is not retryable without a change to the set of Fulfilling Parties or their registered Delegation Topology Declarations.

Each retry is a new Feasibility Check invocation. The full evaluation sequence (steps 1窶・) MUST be re-executed from the beginning on every retry (DR-L2-7-F). There is no incremental or partial retry path.

---

## 7.8 Design Rules

The following design rules govern the Feasibility Check Operation. Rules L2-T-1-A through L2-T-1-C, L2-T-3-C, and L2-T-5-B/C are reproduced from the Pre-Layer 2 Review for traceability. They are traced in S12 (Design Rules Compliance Trace).

**L2-T-1-A:** Layer 2 defines a Feasibility Window parameter with a minimum (PT5M), default (PT30M), and maximum (PT4H) duration for the period during which `FEASIBILITY_CLEARED` events are accepted per Activity Component.

**L2-T-1-B:** The Feasibility Window is a Layer 2 parameter referenced by Layer 3 S11. It is not a Party Policy Declaration override; parties cannot extend it beyond the Layer 2-defined maximum of PT4H.

**L2-T-1-C:** INQUIRY MUST NOT exit with unconfirmed Activity Components. On Feasibility Window expiry with timed-out components, `FEASIBILITY_TIMEOUT` is emitted per timed-out component. The booking agent chooses between abandoning and retrying (Option A) or invoking `REDUCE_SCOPE` to proceed with a reduced confirmed component set (Option B). `REDUCE_SCOPE` goes through the full Security Kernel execution sequence. The Booking Object MUST record removed components and reason.

**L2-T-3-C:** The Feasibility Check MUST validate Capability Declaration currency before emitting `FEASIBILITY_CLEARED`. A `FEASIBILITY_FAILED` event with reason `DECLARATION_STALE` is the required response when the assessed declaration is expired or superseded.

**L2-T-5-B:** The Feasibility Check for bookings involving n > 2 Fulfilling Parties MUST include a Delegation Topology feasibility step. `FEASIBILITY_CLEARED` at the Activity Component level implies delegation topology feasibility has been confirmed.

**L2-T-5-C:** Layer 2 delegation topology configuration MUST produce a valid delegation chain expressible as sequential two-party Coordination Delegation operations in Layer 3 v1.0. Topologies that cannot be expressed as a chain MUST return `FEASIBILITY_FAILED` with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`.

**DR-L2-7-A:** All per-component evaluation steps (ﾂｧ7.3 steps 1窶・) are evaluated at the time the feasibility result is emitted, not at the time the check is initiated. A Resource Reference, Capability Declaration, or Pre-Arrangement Declaration that changes status during an in-flight Feasibility Check is evaluated at emission time.

**DR-L2-7-B:** Steps 1窶・ of the per-component evaluation are synchronous pre-conditions. The supplier readiness event (step 5) is the only asynchronous step. Steps 1窶・ MUST complete before the protocol awaits the supplier event.

**DR-L2-7-C:** The Feasibility Window is a booking-level timer started by `FEASIBILITY_CHECK_INITIATED`. It is shared across all Activity Components in the booking. Components do not have independent windows. A booking agent MUST NOT emit `FEASIBILITY_CHECK_INITIATED` until the complete Activity Component set for the INQUIRY is fixed.

**DR-L2-7-D:** The Feasibility Window timer is frozen during `BOOKING_SUSPENDED` and resumes on exit from that state, consistent with the general timeout freeze rule in Layer 3 S11.

**DR-L2-7-E:** `FEASIBILITY_CLEARED` components retain their cleared status if other components in the same booking time out. Their clearance is not invalidated by another component's `FEASIBILITY_TIMEOUT`.

**DR-L2-7-F:** Each Feasibility Check retry is a new invocation. The full evaluation sequence (steps 1窶・) MUST be re-executed from the beginning on every retry. There is no incremental retry path.

**DR-L2-7-G:** A supplier event (`FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED`) received after `FEASIBILITY_TIMEOUT` has been emitted for the corresponding Activity Component is a late event. Late events MUST be discarded and MUST NOT modify the Booking Object state. If the booking agent wishes to recover a timed-out component, they must initiate a new Feasibility Check.

**DR-L2-7-H:** `FEASIBILITY_WINDOW_EXPIRING` is suppressed when the total configured Feasibility Window duration is 竕､ PT5M, since the warning emission time and the window start would be simultaneous or past. In all other cases, the warning MUST be emitted 5 minutes before window expiry if any components remain uncleared.

---

*End of Section 7*
