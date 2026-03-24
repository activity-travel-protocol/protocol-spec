# S10 AI Agent Participation

**Activity Travel Protocol — Layer 2 Capability and Discovery Specification**
**Section 10: AI Agent Participation**
**Status: WORKING DRAFT — March 2026**

---

## 10.1 Purpose

The Activity Travel Protocol is designed from the ground up for AI agent participation. Layer 3 defines a complete AI agent model for Booking Object operations: five authority scopes, six Decision Type routings, the Context Package and Decision Object schemas, and Security Kernel agent scope validation at every state transition.

Layer 2's AI agent model covers the pre-Booking Object phase: how agents discover suppliers, how they negotiate configurations, and how they interact with the Feasibility Check mechanism. The Layer 2 agent model is distinct from the Layer 3 model in scope and tooling:

- **Layer 2 agent interactions** use A2A (inter-party, peer-to-peer) and MCP (agent-to-protocol, against the Capability Catalogue). They occur before a Booking Object exists.
- **Layer 3 agent interactions** use MCP exclusively. They occur on an existing Booking Object via Security Kernel-mediated operations.

The boundary between these two models is the Booking Object creation event (L2-T-2-A, §8.7).

This section defines:

- The Layer 2 authority scope model for AI agents in the discovery phase.
- The agent roles in the Capability Catalogue and Feasibility Check operations.
- Graceful degradation when an agent is unavailable or limited.
- The relationship between Layer 2 agent authority and the Layer 3 Security Kernel.

---

## 10.2 Layer 2 Authority Scope Model

### 10.2.1 Scope Principle

In Layer 3, AI agent authority is enforced by the Security Kernel at every state transition. In Layer 2, there is no Booking Object and therefore no Security Kernel-mediated state transition. Layer 2 agent authority is instead governed by the scope declared in the agent's registered credentials and enforced at two points: MCP tool authentication (§8.3.3) against the Layer 1 Security Kernel, and A2A task response filtering by the supplier agent after verifying the requesting party's scope against the Layer 1 Party Registry (DR-L2-10-I).

Layer 2 defines four discovery-phase authority scopes for AI agents. These scopes are additive and hierarchical: each scope includes all permissions of the scopes below it. They are distinct from the Layer 3 authority scope identifiers defined in Layer 3 S9 and App. A; implementers must not conflate the two sets.

### 10.2.2 Discovery-Phase Authority Scopes

**Scope L2-AS-1 — READ_CATALOGUE**
The agent may call `catalogue_search`, `catalogue_get`, `catalogue_check_availability`, and `catalogue_list_parties`. The agent may not initiate A2A tasks. This is the minimum scope for any AI agent participating in Layer 2 discovery. An agent credential that does not specify a discovery-phase scope is treated as L2-AS-1 by default (DR-L2-10-H).

**Scope L2-AS-2 — QUERY_SUPPLIER**
Includes L2-AS-1. The agent may additionally initiate `capability_declaration_query` A2A tasks against supplier agents. The agent may not propose configurations or pre-signal feasibility.

**Scope L2-AS-3 — NEGOTIATE**
Includes L2-AS-2. The agent may additionally initiate `configuration_negotiation` and `feasibility_pre_signal` A2A tasks. The agent may assemble Activity Configurations (S4) for submission to the Feasibility Check. This is the scope required for full discovery-phase participation short of feasibility initiation.

**Scope L2-AS-4 — INITIATE_FEASIBILITY**
Includes L2-AS-3. The agent may additionally emit `FEASIBILITY_CHECK_INITIATED`, starting the Feasibility Window (S7, §7.2.4). This scope authorises the agent to commit the Booking Party to a feasibility evaluation. It is the highest discovery-phase scope and MUST be explicitly granted; it is not implied by L2-AS-3.

L2-AS-4 authorises the emission of `FEASIBILITY_CHECK_INITIATED` but does not waive the S7 requirement (DR-L2-7-C) that the complete Activity Component set must be fixed before initiation. An agent holding L2-AS-4 that emits `FEASIBILITY_CHECK_INITIATED` before the component set is fixed is in violation of DR-L2-7-C regardless of its scope.

*S7 §7.2.4 has been updated to include the L2-AS-4 authority scope requirement at the `FEASIBILITY_CHECK_INITIATED` event definition site (GN-L2-4, resolved).*

The Layer 3 authority scopes are independently granted and enforced by the Security Kernel. An agent holding L2-AS-4 does not automatically hold any Layer 3 scope.

### 10.2.3 Scope Registration

Discovery-phase authority scopes are registered in the Layer 1 Party Registry as part of the agent's credential profile. The Capability Catalogue and Feasibility Check engine enforce scopes at authentication time using the Layer 1 Security Kernel.

---

## 10.3 Booking Agent Role

A booking agent is an AI agent acting on behalf of a Booking Party. In the discovery phase, the booking agent's responsibilities are:

1. **Discovery.** Query the Capability Catalogue via MCP tools (L2-AS-1 minimum) to identify candidate Fulfilling Parties whose Capability Declarations match the consumer's requirements.

2. **Negotiation.** Engage supplier agents via A2A `capability_declaration_query` and `configuration_negotiation` tasks (L2-AS-2 / L2-AS-3) to refine the Activity Configuration for each candidate.

3. **Pre-signalling.** Optionally send `feasibility_pre_signal` A2A tasks (L2-AS-3) to allow supplier agents to begin internal readiness assessment before the formal Feasibility Check is initiated.

4. **Feasibility initiation.** Emit `FEASIBILITY_CHECK_INITIATED` (L2-AS-4) once the complete Activity Component set is fixed, starting the Feasibility Window.

5. **Booking Object creation.** After all required Activity Components have cleared feasibility, call the Layer 3 MCP operation to create the Booking Object, crossing the Layer 2/Layer 3 boundary.

A booking agent holding only L2-AS-1 or L2-AS-2 MUST NOT initiate feasibility; it must escalate to a principal with L2-AS-4 or hand off to a human operator (§10.3.1).

### 10.3.1 Human-in-the-Loop Handoff

A booking agent MUST support handoff to a human operator at any point in the discovery phase. Handoff is triggered when:

- The agent reaches a decision point that exceeds its declared authority scope.
- A configuration negotiation produces `REJECTED` from a supplier agent with no counter-proposal.
- The agent's confidence in an assembled Activity Configuration falls below a deployment-defined threshold.
- The booking agent receives `FEASIBILITY_FAILED` for a required Activity Component after exhausting its retry policy.

Handoff is an implementation concern: the protocol does not mandate a pre-booking event bus or a specific signalling mechanism. The protocol requirement is that the booking agent preserves the current discovery state — assembled Activity Configurations, Feasibility Check results to date, pending component status — in a form accessible to a human operator or a replacement agent, without requiring discovery to restart. The mechanism for state preservation and handoff notification is deployment-defined.

---

## 10.4 Supplier Agent Role

A supplier agent is an AI agent acting on behalf of a Fulfilling Party. Supplier agent participation is optional (A2A is additive, L2-T-2-C). When deployed, the supplier agent's responsibilities in the discovery phase are:

1. **Respond to `capability_declaration_query` tasks.** Return current Capability Declarations matching the query criteria. The supplier agent MUST only return declarations registered under its own party identity.

2. **Respond to `configuration_negotiation` tasks.** Evaluate proposed Activity Configurations and respond with `ACCEPTED`, `COUNTER_PROPOSED`, or `REJECTED`. Counter-proposals MUST conform to the Capability Declaration (S3) and Activity Configuration Schema (S4).

3. **Acknowledge `feasibility_pre_signal` tasks.** Register the pre-signal and begin internal readiness assessment. The `estimatedClearanceTime` in the response is advisory.

4. **Push feasibility events.** Within the Feasibility Window, push `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` to the Activity Travel Protocol event bus for each Activity Component the party is responsible for. This is a protocol obligation separate from A2A agent availability (DR-L2-10-E). These events are not A2A responses; they are protocol events emitted via the protocol event bus API.

Step 4 marks the transition from A2A peer-to-peer communication to protocol event emission. A supplier without any AI agent deployment fulfils step 4 via a direct integration that calls the protocol event bus API to emit `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` without an AI agent layer; this is a fully conformant implementation.

### 10.4.1 Supplier Agent Constraints

A supplier agent MUST NOT:

- Return Capability Declarations belonging to another Fulfilling Party in response to a `capability_declaration_query` task.
- Emit `FEASIBILITY_CLEARED` for an Activity Component without consulting its internal readiness systems.
- Accept a configuration that violates the registered Capability Declaration constraints.
- Initiate A2A tasks toward a booking agent unprompted. Supplier agents respond to booking agent task initiations; they do not initiate discovery-phase A2A tasks.

The prohibition on A2A task initiation applies to A2A inter-party task calls only. Protocol event emission (`FEASIBILITY_CLEARED`, `FEASIBILITY_FAILED`) is supplier-initiated by design and is not governed by this constraint.

---

## 10.5 Graceful Degradation

### 10.5.1 Booking Agent Degradation

If a booking agent is unavailable or its authority scope is insufficient for a required step, the degradation path is:

- **Agent unavailable:** A human operator or a lower-capability agent (L2-AS-1) falls back to MCP-only Catalogue queries (§8.6.2). Discovery proceeds against static declarations without A2A negotiation.
- **Scope insufficient for negotiation (L2-AS-1 or L2-AS-2):** The booking agent proceeds with Activity Configurations assembled directly from static Capability Declarations without supplier-agent pre-validation. The Feasibility Check is the binding validation step.
- **Scope insufficient for feasibility initiation (L2-AS-3 and below):** The `FEASIBILITY_CHECK_INITIATED` event must be emitted by a principal holding L2-AS-4. The booking agent escalates or hands off to a human operator per §10.3.1.

### 10.5.2 Supplier Agent Degradation

If a supplier agent is unavailable during the discovery phase:

- The booking agent falls back to the MCP Catalogue fallback path (S8, §8.6.2).
- Activity Configurations are assembled from static Capability Declarations without A2A negotiation.
- The Feasibility Check (S7) proceeds normally. The supplier still pushes `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` via the protocol event bus during step 5 — this is a protocol obligation independent of A2A agent availability (DR-L2-10-E).

### 10.5.3 Partial Agent Participation

It is valid for one party in a multi-supplier booking to have an A2A-capable agent while others do not. The booking agent uses A2A for the capable supplier and MCP Catalogue queries for the rest. The Feasibility Check proceeds with the same evaluation sequence for all components regardless of whether A2A pre-signalling occurred.

---

## 10.6 Relationship to Layer 3 Agent Model

### 10.6.1 Boundary Enforcement

The Layer 2/Layer 3 boundary (L2-T-2-A) is enforced at Booking Object creation. An AI agent participating in Layer 2 discovery does not automatically inherit any Layer 3 authority. To operate on the Booking Object in Layer 3, the agent must hold a Layer 3 authority scope issued via the Layer 1 Party Registry and validated by the Security Kernel.

### 10.6.2 Context Package Continuity

When an agent transitions from Layer 2 discovery to Layer 3 Booking Object operations, the discovery-phase outputs — finalised Activity Configurations, Feasibility Check results, Delegation Topology confirmation — are available as inputs to the initial Context Package assembled at Booking Object creation. The mechanics of initial Context Package assembly are defined in the Layer 3 Context Package Specification (context-package.md); this section establishes only that Layer 2 discovery artifacts are available as protocol-registered inputs at that point.

The protocol does not mandate that the same agent instance participates in both phases. Discovery outputs are registered protocol artifacts accessible from the Party Registry and Resource Reference Registry; any agent holding appropriate Layer 3 scope may use them as Context Package inputs.

### 10.6.3 Security Kernel Continuity

Pre-Arrangement Declarations established in Layer 2 (S6) that confer agent authority for specific Layer 3 transitions are evaluated by the Security Kernel as Party Operational policy — they are not Layer 2 artifacts that bypass the Security Kernel. The same OPA evaluation model applies (§6.2). Layer 2 agent authority scopes (L2-AS-1 through L2-AS-4) are not evaluated by the Layer 3 Security Kernel; they govern only the pre-Booking Object phase.

---

## 10.7 Design Rules

The following design rules govern AI Agent Participation. They are traced in S12 (Design Rules Compliance Trace).

**DR-L2-10-A:** Layer 2 defines four discovery-phase authority scopes: L2-AS-1 (READ_CATALOGUE), L2-AS-2 (QUERY_SUPPLIER), L2-AS-3 (NEGOTIATE), L2-AS-4 (INITIATE_FEASIBILITY). Scopes are hierarchical and additive. An agent holding a higher scope implicitly holds all lower scopes. These scopes are distinct from Layer 3 authority scopes.

**DR-L2-10-B:** Emitting `FEASIBILITY_CHECK_INITIATED` requires L2-AS-4. An agent holding L2-AS-3 or below MUST NOT emit this event. A `FEASIBILITY_CHECK_INITIATED` event from an agent without L2-AS-4 MUST be rejected by the Feasibility Check engine. Holding L2-AS-4 does not waive DR-L2-7-C; the complete component set must still be fixed before emission.

**DR-L2-10-C:** A booking agent MUST support handoff to a human operator at any point in the discovery phase. The protocol requires that discovery state is preserved in a form accessible without restarting discovery; the handoff signalling mechanism is deployment-defined.

**DR-L2-10-D:** A supplier agent MUST NOT return Capability Declarations belonging to another Fulfilling Party in response to a `capability_declaration_query` task. The agent's party identity, verified at A2A connection time via the `requestingPartyId` and `respondingPartyId` fields, bounds the declarations it may serve.

**DR-L2-10-E:** The supplier's obligation to push `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` within the Feasibility Window is a protocol obligation independent of A2A agent availability. Supplier A2A agent unavailability does not excuse the supplier from the Feasibility Check event obligation.

**DR-L2-10-F:** Layer 2 discovery-phase authority scopes (L2-AS-1 through L2-AS-4) are independent of Layer 3 authority scopes. An agent holding L2-AS-4 does not hold any Layer 3 scope implicitly. Layer 3 scopes are independently granted and enforced by the Security Kernel.

**DR-L2-10-G:** Discovery-phase outputs (finalised Activity Configurations, Feasibility Check results, Delegation Topology confirmations) are protocol artifacts available from the Party Registry and Resource Reference Registry. Any agent holding appropriate Layer 3 scope may use them as Context Package inputs at Booking Object creation; the same agent instance need not participate in both phases.

**DR-L2-10-H:** An agent credential that does not specify a discovery-phase scope MUST be treated as L2-AS-1 (READ_CATALOGUE) by the Capability Catalogue and Feasibility Check engine.

**DR-L2-10-I:** Before responding to an A2A task from a booking agent, a supplier agent MUST verify the requesting party's declared discovery-phase scope against the Layer 1 Party Registry using the `requestingPartyId` in the task payload. A `capability_declaration_query` task from an agent without at least L2-AS-2 MUST be rejected. A `configuration_negotiation` or `feasibility_pre_signal` task from an agent without at least L2-AS-3 MUST be rejected.

---

*End of Section 10*
