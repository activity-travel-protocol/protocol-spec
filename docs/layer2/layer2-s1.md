# 1. Purpose and Scope

**Activity Travel Protocol — Layer 2 — Discovery and Capability Specification**

*Working Draft — Section 1: Purpose and Scope*

March 2026

| **Document status** | Working Draft — for review |
|---|---|
| **Layer** | Layer 2 — Discovery and Capability |
| **Depends on** | Layer 1 (complete, 9 published specs); Layer 3 (complete, published March 2026); Pre-Layer 2 Review v1.0 |
| **Does not depend on** | Layer 4 — Schema and SDK (not yet written). No Layer 2 discovery logic references Layer 4 SDK internals. |
| **Design rules applied** | L2-T-1-A through L2-T-5-C (all pre-conditions satisfied per Pre-Layer 2 Consistency Review v1.0) |

---

## 1.1 What This Specification Defines

The Activity Travel Protocol Layer 2 Discovery and Capability Specification defines the layer that bridges Layer 1 identity and trust infrastructure with Layer 3 booking workflow execution. It specifies how parties advertise what they offer, how agents discover and query suppliers, how feasibility is confirmed before a booking begins, and how pre-negotiated terms are established and enforced.

Layer 2 is the discovery and configuration layer of the Activity Travel Protocol. Layer 1 establishes who the parties are. Layer 3 defines what happens during a booking. Layer 2 defines what is available and whether it can be booked — before the Booking Object exists.

This specification defines five components, all committed by the Architecture Specification v0.2:

| Component | What it defines |
|-----------|----------------|
| **Capability Declarations** | The structure and validity model for supplier-registered statements of what they offer. Static at registration; versioned for staleness management. |
| **Activity Configuration Schema** | The parameterisation structure by which a generic offering in a Capability Declaration is configured for a specific booking. Output: a fully-specified Activity Component ready for Layer 3 INQUIRY. |
| **Resource Reference Registry** | The data provider driver registry. Registration-time validation against schema. Corresponds to OS Function 4 (Driver Model) in the Architecture Specification. |
| **Pre-Arrangement Declarations** | Pre-negotiated terms established before a booking begins, registered as Party Policy Declarations and enforced through the Layer 3 Security Kernel at the Party Operational policy tier. |
| **Feasibility Check operation** | The asynchronous, event-driven protocol operation that produces FEASIBILITY_CLEARED per Activity Component. Required before INQUIRY may exit in Layer 3. Defines the Feasibility Window parameter referenced by Layer 3 S11. |

## 1.2 What This Specification Does Not Define

Layer 2 does not define:

- Party identity, credentials, trust chains, or jurisdiction compliance entries — these are Layer 1.

- The Booking Object state machine, booking states, state transitions, timeout budgets, or duty of care obligations during an active booking — these are Layer 3. Layer 2 produces the inputs Layer 3 consumes; it does not govern booking execution.

- API surface, GraphQL schema, or SDK package internals — these are Layer 4. Layer 2 specifies discovery semantics and schema structures; Layer 4 specifies the technical interface that exposes them.

- Live availability signals — Layer 2 defines how static Capability Declarations are registered and queried, and the conditions under which live availability signals may supplement them (Section 9). The boundary between static declarations and live signals is a Layer 2 concern; Layer 3 INQUIRY operates against static declarations only.

- Supplier inventory systems — the determination of real-time slot availability within a declared offering is a supplier system responsibility. It is surfaced to the protocol via the Feasibility Check mechanism but its internal implementation is out of scope.

- The internal implementation of supplier booking systems, pricing engines, or inventory management — Layer 2 specifies the protocol artifacts and operations. Supplier system internals are application responsibility.

- AI provider, model, or inference infrastructure — Layer 2 specifies where AI agents participate in discovery and feasibility operations and what authority they hold. Provider choice is application responsibility.

## 1.3 Relationship to Prior Specifications

Layer 2 is built on, and must be read alongside, the following documents:

| Document | Role in Layer 2 |
|----------|----------------|
| Architecture Specification v0.2 | Defines the five Layer 2 components, OS Function 4 (Driver Model) for the Resource Reference Registry, and the three-tier scaling model that Layer 2 registration and discovery operations must satisfy at all tiers. |
| Party Registry Specification v0.2 | Defines the Party registration model. Capability Declarations and Pre-Arrangement Declarations are registered as Party artifacts in the Party Registry. Layer 2 extends, but does not redefine, the Party Registry. |
| Party Policy Declarations Spec v0.2 | Defines the PartyPolicyDeclaration structure. Pre-Arrangement Declarations are a category of Party Policy Declaration; their schema and enforcement rules are defined in this specification (Section 6) and enforced by the Layer 3 Security Kernel. |
| Trust Chain Declaration Spec v0.1 | Defines the Trust Unit model used in Delegation Topology feasibility confirmation. Multi-party Coordination Delegation topology validation in the Feasibility Check operation (Section 7) uses Trust Chain constructs defined here. |
| Layer 3 Workflow Specification | Layer 3 INQUIRY state logic requires that FEASIBILITY_CLEARED has been issued per Activity Component before INQUIRY may exit — the OQ-L3-1 resolution recorded in Layer 3 S1 Section 1.7 and enforced in Layer 3 S3. The Feasibility Window defined in this specification (Section 7) is referenced as an external parameter by Layer 3 S11. Pre-Arrangement Declarations registered under this specification take effect through the Layer 3 Security Kernel OPA evaluation at the Party Operational policy tier. |
| Pre-Layer 2 Consistency Review v1.0 | Resolves tensions T-L2-1 through T-L2-5 and produces 18 design rules (L2-T-1-A through L2-T-5-C) that this specification is required to follow. Prior decisions PD-L2-1 and PD-L2-2 are inputs to this specification. Open questions OQ-L3-1, OQ-L3-3, and OQ-L3-5 are resolved within this specification. |
| Jurisdiction Compliance Specification v0.2 | Defines jurisdiction compliance obligations that constrain party operations. Pre-Arrangement Declarations defined in this specification must incorporate jurisdiction constraint fields per design rule L2-T-4-C. Jurisdiction policy is evaluated by the Layer 3 Security Kernel at the Jurisdiction policy tier on every state transition that a Pre-Arrangement Declaration touches. |
| Standards Positions and Interoperability Map v1.1 | Defines the Activity Travel Protocol's ADOPT positions on MCP and A2A, the normative MCP/A2A boundary at Booking Object creation, and the BRIDGE positions on OpenTravel Alliance and IATA NDC that govern Layer 2 Appendix A content. |

## 1.4 The Layer 2 / Layer 3 Boundary

The Activity Travel Protocol divides the booking lifecycle at a single, precise boundary: the creation of the Booking Object.

**Before the Booking Object exists — Layer 2 governs.** A booking agent discovers suppliers via the Capability Catalogue, queries Capability Declarations, negotiates configuration options, and receives feasibility signals. All of this occurs in Layer 2 scope. No Booking Object exists yet. No Layer 3 state machine is running.

**After the Booking Object is created — Layer 3 governs.** The Booking Object is created in the INQUIRY state. From this point forward, all protocol operations on the booking are Layer 3 scope. The Layer 2 outputs — a configured Activity Component, confirmed Feasibility Window, validated delegation topology — become inputs to the Layer 3 runtime but are not modified by it.

This boundary has two important consequences:

**MCP/A2A protocol boundary.** A2A governs inter-party agent communication in the Layer 2 phase — before the Booking Object exists. MCP governs agent-to-protocol interactions in the Layer 3 phase — on an existing Booking Object. The Booking Object creation event is the normative boundary between these two protocols. Design rules L2-T-2-A through L2-T-2-D govern this boundary in full.

> **Design rule L2-T-2-A:** The Booking Object creation event is the normative MCP/A2A boundary. All agent interactions before Booking Object creation are Layer 2 scope; A2A governs inter-party agent communication in this phase. All agent interactions on an existing Booking Object are Layer 3 scope; MCP governs agent-to-protocol interactions in this phase.

**Feasibility confirmation is a precondition, not a Layer 3 operation.** The Feasibility Check operation runs in Layer 2 scope. FEASIBILITY_CLEARED events are Layer 2 artifacts. Layer 3 requires that all required Activity Components have cleared before INQUIRY may exit — but it does not run or control the Feasibility Check itself. The Feasibility Window parameter is defined in this specification; Layer 3 S11 references it as an external parameter.

## 1.5 The Five Layer 2 Components and Their Relationships

The five components defined in this specification are not independent. They form a structured pipeline from supplier registration through to Layer 3 handoff.

**Capability Declarations** are the foundation. A supplier registers a Capability Declaration in the Party Registry, declaring what they offer, under what conditions, with what validity period. The Capability Declaration includes a Delegation Topology Declaration component for suppliers capable of participating in multi-party Coordination Delegation.

**The Capability Catalogue** is the runtime query interface over registered Capability Declarations. A booking agent queries the Catalogue — via MCP tool calls against static declarations, or via A2A inter-party agent communication for richer negotiation — to discover suppliers and obtain declaration details.

**Activity Configuration Schema** defines how a generic declared offering is parameterised into a fully-specified Activity Component. The output of Activity Configuration is a concrete booking item ready for Layer 3 INQUIRY: specific dates, participants, configuration options, and price.

**Pre-Arrangement Declarations** are pre-negotiated terms — standing authorisations, agreed pricing frameworks, or pre-confirmed delegation arrangements — registered in the Party Registry as Party Policy Declarations before any booking begins. They take effect during Layer 3 execution through the Security Kernel's OPA evaluation.

**The Feasibility Check operation** is the final Layer 2 step before Booking Object creation. It confirms, per Activity Component, that the configured offering is available and the declared capability is current. Suppliers push FEASIBILITY_CLEARED (or FEASIBILITY_FAILED) as events. When all required components have cleared, the booking agent may create the Booking Object and enter Layer 3.

The Resource Reference Registry underpins all five: it is the data provider driver registry that validates the external data sources that Capability Declarations, Activity Configuration, and Feasibility Check operations may reference.

The pipeline sequence is fixed: a Capability Declaration must be in hand before Activity Configuration can proceed; Activity Configuration must be complete before the Feasibility Check can run; all required Activity Components must have issued FEASIBILITY_CLEARED before the Booking Object may be created and Layer 3 entered. No step in this sequence may be skipped.

## 1.6 Agent Participation in Layer 2

Layer 2 defines agent participation in discovery and feasibility — a distinct model from Layer 3 agent participation in booking execution.

In Layer 2, agents operate before a Booking Object exists. A booking agent may use A2A to communicate with a supplier agent during Capability Declaration discovery and Feasibility Check negotiation. The supplier agent may respond to capability queries via A2A. FEASIBILITY_CLEARED and FEASIBILITY_FAILED events are formal Layer 2 protocol artifacts issued via the Feasibility Check mechanism (Section 7) — they are distinct from the A2A discovery conversation and are not A2A messages. The A2A task schemas governing this interaction are defined in Section 10.

Suppliers without A2A agent capability are reachable through the Capability Catalogue via MCP tool calls against static Capability Declarations. A2A capability is additive — its absence does not make a supplier non-conformant with this specification.

> **Design rule L2-T-2-C:** Suppliers without A2A agent capability MUST be reachable through the Capability Catalogue via MCP tool calls against static Capability Declarations. A2A is additive; its absence does not make a supplier non-conformant.

When a booking agent cannot reach a supplier agent via A2A, the graceful degradation path is MCP-based query of the Capability Catalogue. Section 8 specifies when fallback is permitted and when it is not.

## 1.7 Open Questions Resolved by This Specification

Three open questions deferred from Layer 3 are resolved within this specification. Their resolution points are recorded here for traceability.

| ID | Question | Resolved in |
|----|----------|-------------|
| OQ-L3-1 | Live availability vs. static Capability Declaration — Layer 2 scope. Layer 3 INQUIRY operates against static declarations. The extension to live availability signals is a Layer 2 obligation defined in this specification. | Section 9 (Live Availability) |
| OQ-L3-3 | A2A Protocol integration — Layer 2 or Layer 3? Layer 3 AI agent model is complete on MCP alone. Inter-party agent communication via A2A is resolved at Layer 2, governing the discovery and feasibility phase before Booking Object creation. | Section 8 (Capability Catalogue) and Section 10 (AI Agent Participation) |
| OQ-L3-5 | n-party Coordination Delegation setup — Layer 3 v1.0 limits delegation to exactly two Fulfilling Party subjects. The topology setup for multi-party bookings is a Layer 2 obligation. | Section 7 (Feasibility Check Operation) and Section 11 (Multi-Party Discovery) |

---

*Activity Travel Protocol — Layer 2 Discovery and Capability Specification — Working Draft — Section 1 — March 2026*
