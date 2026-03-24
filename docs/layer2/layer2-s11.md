# S11 Multi-Party Discovery

**Activity Travel Protocol — Layer 2 Capability and Discovery Specification**
**Section 11: Multi-Party Discovery**
**Status: WORKING DRAFT — March 2026**

---

## 11.1 Purpose

A multi-party booking is one that requires Activity Components from more than two distinct Fulfilling Parties. Layer 3 v1.0 limits Coordination Delegation to exactly two Fulfilling Party subjects per delegation act (OQ-L3-5, CLOSED); multi-party scenarios at runtime use delegation chaining — a sequence of two-party delegations — as the conformant workaround.

The chaining workaround places a Layer 2 obligation: the delegation chain topology must be determined and confirmed feasible before the Booking Object is created. Once the Booking Object exists, Layer 3 executes the topology; it cannot set it up. Layer 2 is therefore responsible for the full multi-party discovery and topology confirmation flow.

The Delegation Topology Declaration schema fields are normatively defined in S3 (as a component of the Capability Declaration) and their use in the Feasibility Check is specified in S7 (§7.4). This section defines the preceding step: how booking agents discover multi-party topologies from the Capability Catalogue, how they evaluate topology compatibility before initiating a Feasibility Check, and how the confirmed topology flows into Layer 3 at Booking Object creation.

This section defines:

- The multi-party discovery flow.
- Topology compatibility evaluation at the Catalogue level.
- Chain ordering and the `topologyChainRef` artifact.
- Topology querying via the Capability Catalogue and A2A.
- The Layer 3 handoff model for confirmed topologies.
- Design rules governing multi-party discovery.

---

## 11.2 Multi-Party Discovery Flow

The multi-party discovery flow precedes the Feasibility Check. It is the booking agent's responsibility to assemble a candidate topology — a proposed ordering of Fulfilling Parties into a delegation chain — before emitting `FEASIBILITY_CHECK_INITIATED`.

The flow proceeds in four stages:

**Stage 1 — Component identification.** The booking agent identifies the set of Activity Components required to satisfy the consumer's booking. Each component maps to one Fulfilling Party. Where multiple components map to the same Fulfilling Party, they are evaluated together as a single party's contribution; the delegation topology step applies to the number of distinct Fulfilling Parties, not the number of components.

**Stage 2 — Delegation capability discovery.** For each distinct Fulfilling Party in the component set, the booking agent queries the Capability Catalogue to determine whether the party has registered a Delegation Topology Declaration. The `delegationTopologySupported` field in `CapabilityDeclarationSummary` (S8, §8.5.1) indicates this. A party without a Delegation Topology Declaration cannot participate as an intermediate node in a delegation chain; it may only appear as the terminal Fulfilling Party.

**Stage 3 — Candidate chain construction.** The booking agent constructs a candidate delegation chain from the identified Fulfilling Parties. The chain must satisfy the structural constraints defined in §11.3. If no valid candidate chain can be constructed from the discovered parties, the booking agent has two options: reduce the component set (removing parties that cannot participate in a valid chain), or abandon this topology and search for alternative Fulfilling Parties whose declarations are compatible.

**Stage 4 — Topology submission to the Feasibility Check.** The booking agent submits the candidate chain as part of the Feasibility Check initiation, as a `proposedChain` field (ordered `partyId` array) in the `FEASIBILITY_CHECK_INITIATED` event payload. The Feasibility Check engine validates the chain against the registered Delegation Topology Declarations of all parties (S7, §7.4.3) and confirms feasibility as part of the per-component evaluation.

*S7 §7.2.4 and S7 §7.6.2 have been updated to include the `proposedChain` field in the `FEASIBILITY_CHECK_INITIATED` payload specification (GN-L2-5, resolved).*

---

## 11.3 Topology Compatibility Evaluation

Before initiating a Feasibility Check, the booking agent SHOULD perform a preliminary topology compatibility evaluation at the Catalogue level. This is not a binding validation — the Feasibility Check is authoritative — but it allows the booking agent to identify obviously incompatible topologies before committing to a Feasibility Window.

### 11.3.1 Compatibility Checks

The booking agent evaluates the following against the Delegation Topology Declarations retrieved from the Capability Catalogue:

**Check 1 — Declaration presence.** Every Fulfilling Party in the proposed chain except the terminal party MUST have a registered, non-expired Delegation Topology Declaration. A party without a declaration cannot serve as an intermediate node.

**Check 2 — Depth sufficiency.** The required chain depth must not exceed the minimum `maxDelegationDepth` declared by any party in the chain, and must not exceed the Layer 2 protocol maximum chain depth of 5 (DR-L2-11-G). The binding depth check is performed by the Feasibility Check engine (S7, §7.4.3 step 3); the Catalogue-level check is preliminary.

**Check 3 — Co-delegatee constraints.** For each consecutive pair in the proposed chain, the `coDelegateeConstraints` of both parties must be mutually satisfiable. A constraint declared by party A that excludes party B as a co-delegatee makes the (A, B) consecutive pairing invalid.

**Check 4 — Chain expressibility.** The proposed topology must be expressible as a sequence of two-party Coordination Delegation operations in Layer 3 v1.0 (L2-T-5-C). A topology that requires simultaneous multi-party delegation — rather than a sequential chain — is non-conformant in v1.0.

### 11.3.2 Catalogue Query for Topology Evaluation

The `catalogue_search` MCP tool (S8, §8.3.2) supports topology-aware filtering via the `maxDelegationDepth` parameter. A booking agent assembling a chain of depth D queries with `maxDelegationDepth: D` to return only parties whose declarations support at least that depth.

The `catalogue_get` MCP tool returns the full Delegation Topology Declaration fields for a specific Capability Declaration, allowing the booking agent to evaluate `coDelegateeConstraints` for a specific proposed pairing.

There is no dedicated topology-query MCP tool; topology evaluation is composed from existing Catalogue tools. This is by design: the Capability Catalogue surfaces declaration data per party; topology reasoning requires multi-party context that no single tool call can assemble, making it inherently a booking-agent-level composition responsibility.

---

## 11.4 Chain Ordering

The ordering of Fulfilling Parties in the delegation chain has operational significance: it determines the sequence of two-party delegation acts that Layer 3 will execute at runtime. The booking agent is responsible for proposing chain ordering; the Feasibility Check confirms it; Layer 3 executes it.

### 11.4.1 Ordering Principles

The protocol does not mandate a specific chain ordering algorithm. The booking agent may order parties based on operational considerations (e.g., geographic proximity, trust relationships, contractual obligations). The following constraints apply:

- The Booking Party is not a node in the delegation chain; it is the initiating principal.
- The first node in the chain is the primary Fulfilling Party: the party that holds the primary Coordination Delegation from the Booking Party.
- Each subsequent node is delegated to by the preceding node in a sequential two-party delegation act.
- The terminal node is the Fulfilling Party that delivers the final Activity Component in the chain. The terminal node's `maxDelegationDepth` need only be ≥ 0 (it receives delegation but does not delegate further).
- The chain depth MUST NOT exceed 5 (DR-L2-11-G). This cap protects the Layer 3 timeout budget: each delegation step consumes time from the Coordination Delegation phaseWindow, and chains longer than 5 steps create compounding timeout risk.

### 11.4.2 Chain Representation

The booking agent represents the proposed chain as an ordered `partyId` array submitted in the `proposedChain` field of the `FEASIBILITY_CHECK_INITIATED` payload. The Feasibility Check engine uses this ordering when executing the topology validation step (S7, §7.4.3).

On Feasibility Check success, the confirmed chain is recorded as the `topologyChainRef` artifact. This artifact is produced by the Layer 2 Feasibility Check and recorded in the Booking Object by Layer 3 at creation time (§11.6.2); it is not a free-standing Layer 2 registry entry. The `topologyChainRef` contains:

| Field | Type | Description |
|---|---|---|
| `chainId` | string | Protocol-assigned unique identifier for this confirmed topology. |
| `orderedPartyIds` | string array | The confirmed delegation chain, in execution order. |
| `chainDepth` | integer | The number of sequential two-party delegation steps in the chain. |
| `confirmedAt` | ISO 8601 datetime | Time of Feasibility Check confirmation. |
| `topologyVersions` | map (partyId → string) | The `topologyVersion` of each party's Delegation Topology Declaration used in confirmation. |

The `topologyChainRef` is immutable once recorded. Changes to the delegation topology require a new Feasibility Check and a new `topologyChainRef`.

---

## 11.5 Topology Querying via A2A

In addition to MCP Catalogue queries, booking agents MAY query supplier agents directly via A2A to obtain richer topology information before constructing a candidate chain. The `capability_declaration_query` A2A task (S8, §8.4.2) returns the full Capability Declaration including the Delegation Topology Declaration fields, which may include supplier-agent-maintained context not yet reflected in the registered static declaration.

Booking agents MAY use `configuration_negotiation` A2A tasks to informally probe co-delegatee pairing acceptability by including a `delegatingTo` indicator in the proposed Activity Configuration. A supplier agent's `ACCEPTED` or `COUNTER_PROPOSED` response may convey implicit acceptance or rejection of the proposed pairing. This is an informal use of the existing task type: no dedicated topology negotiation task is defined in Layer 2 v1.0. A future layer or extension may define a formal topology negotiation task if demand warrants it.

A2A topology negotiation is advisory in all cases. The Feasibility Check is the binding validation. A supplier agent's acceptance of a co-delegatee pairing does not bind the Feasibility Check outcome. The Feasibility Check engine performs independent chain validation (S7, §7.4.3) regardless of prior A2A negotiation (DR-L2-11-E).

---

## 11.6 Layer 3 Handoff

### 11.6.1 Pre-Creation Obligations

Before the Booking Object is created, the booking agent MUST ensure:

1. A `topologyChainRef` has been produced by a successful Feasibility Check for all Activity Components that require multi-party delegation.
2. All Fulfilling Parties in the confirmed chain are registered, active parties in the Layer 1 Party Registry at the time of Booking Object creation.
3. The Delegation Topology Declarations of all chain parties remain non-expired at the time of Booking Object creation. A declaration that expires between Feasibility Check confirmation and Booking Object creation invalidates the `topologyChainRef`; a new Feasibility Check is required (DR-L2-11-D).

### 11.6.2 Booking Object Creation with Topology

When creating the Booking Object, the booking agent includes the `topologyChainRef` in the creation payload. Layer 3 establishes the obligation that this handoff is validated at creation time: the Layer 3 Security Kernel confirms that all `partyId` values in `orderedPartyIds` are active Layer 1 parties and that the referenced `topologyVersions` remain current. The normative definition of this Security Kernel validation is in Layer 3 S12 (Multi-Party Coordination); this section establishes the Layer 2 side of the handoff — what the booking agent must supply and under what conditions.

A `topologyChainRef` that fails Layer 3 Security Kernel validation at creation time causes Booking Object creation to fail. The booking agent must obtain a fresh Feasibility Check and a new `topologyChainRef` before retrying.

### 11.6.3 Layer 3 Runtime Execution

At runtime in Layer 3, Coordination Delegation executes as a sequence of two-party delegation acts following the `orderedPartyIds` in the `topologyChainRef`. Layer 3 does not re-derive the topology; it executes the confirmed chain.

The full n-party execution model without the chaining workaround is deferred (DL2-3, Pre-Layer 2 Review §3.4) and is out of scope for Layer 2 and Layer 3 v1.0. DL2-3 is targeted at the Layer 3 n-party Coordination Delegation Extension Specification.

The `topologyChainRef` is immutable during the Booking Object lifecycle. If a Fulfilling Party in the chain withdraws during an active booking (e.g., during a disruption event), Layer 3 disruption handling governs; there is no Layer 2 re-discovery path for an active booking.

---

## 11.7 Design Rules

The following design rules govern Multi-Party Discovery. Rules L2-T-5-A through L2-T-5-C are reproduced from the Pre-Layer 2 Review for traceability. They are traced in S12 (Design Rules Compliance Trace).

**L2-T-5-A:** Layer 2 defines a Delegation Topology Declaration as a component of Capability Declarations (normatively in S3). Suppliers who support multi-party Coordination Delegation MUST register their maximum supported delegation depth and any co-delegatee identity constraints.

**L2-T-5-B:** The Feasibility Check for bookings involving n > 2 Fulfilling Parties MUST include a Delegation Topology feasibility step (specified in S7, §7.4). `FEASIBILITY_CLEARED` at the Activity Component level implies delegation topology feasibility has been confirmed.

**L2-T-5-C:** Layer 2 delegation topology configuration MUST produce a valid delegation chain expressible as sequential two-party Coordination Delegation operations in Layer 3 v1.0. Topologies that cannot be expressed as a chain MUST return `FEASIBILITY_FAILED` with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`.

**DR-L2-11-A:** The booking agent MUST include a `proposedChain` field (ordered `partyId` array) in the `FEASIBILITY_CHECK_INITIATED` payload for any booking with n > 2 distinct Fulfilling Parties. A Feasibility Check initiation for a multi-party booking without a `proposedChain` field MUST be rejected by the Feasibility Check engine.

**DR-L2-11-B:** A Fulfilling Party without a registered, non-expired Delegation Topology Declaration MUST NOT appear as an intermediate node in a delegation chain. It MAY appear as the terminal node. The Feasibility Check engine enforces this constraint at chain validation time (S7, §7.4.3 step 2).

**DR-L2-11-C:** The `topologyChainRef` is immutable once recorded in the Booking Object. Changes to the delegation topology require a new Feasibility Check and a new `topologyChainRef`. An attempt to modify the `topologyChainRef` on an existing Booking Object MUST be rejected by the Security Kernel.

**DR-L2-11-D:** A Delegation Topology Declaration that expires between Feasibility Check confirmation and Booking Object creation invalidates the `topologyChainRef`. The booking agent MUST obtain a new Feasibility Check before creating the Booking Object.

**DR-L2-11-E:** A2A topology negotiation is advisory. A supplier agent's acceptance of a co-delegatee pairing in any A2A task response does not bind the Feasibility Check outcome. The Feasibility Check engine performs independent chain validation (S7, §7.4.3) regardless of prior A2A negotiation.

**DR-L2-11-F:** Full n-party Coordination Delegation execution without the chaining workaround is deferred (DL2-3) and is out of scope for Layer 2 and Layer 3 v1.0. Layer 2 defines topology setup and confirmation only; Layer 3 executes the confirmed chain as sequential two-party delegations.

**DR-L2-11-G:** The maximum delegation chain depth is 5. A proposed chain of depth > 5 MUST be rejected by the Feasibility Check engine with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`. This cap protects the Layer 3 Coordination Delegation phaseWindow timeout budget from compounding across excessive delegation steps.

---

*End of Section 11*
