# Pre-Layer 2 Consistency Review

**Activity Travel Protocol**
Version 1.0 — March 2026

> **Document Status:** Working Draft — Internal Review Document — MyAuberge K.K.
> This document performs the Pre-Layer 2 Consistency Review for the Activity Travel Protocol. It identifies architectural tensions in the Layer 2 design space and resolves them into normative design rules before Layer 2 authoring begins. It is the direct equivalent of the Pre-Layer 3 Consistency Review (published March 2026).

---

## Document Information

| Field | Value |
|-------|-------|
| **Document status** | Internal Working Document — not for external publication |
| **Version** | v1.0 — March 2026 |
| **Depends on** | Layer 1 (complete, 9 published specs); Layer 3 (complete, published March 2026) |
| **Purpose** | Identify architectural tensions in Layer 2 design; produce design rules governing Layer 2 authoring |
| **Output** | Design rules L2-T-x-y (normative) and deferred items (informational) |
| **Author** | Tom Sato, MyAuberge K.K. |

---

## 1. Purpose and Structure

This document is the Pre-Layer 2 Consistency Review for the Activity Travel Protocol. It performs the same function as the Pre-Layer 3 Consistency Review (published March 2026): it identifies architectural tensions that exist in the current specification base and resolves them into a set of normative design rules before Layer 2 authoring begins.

Layer 2 — Discovery and Capability — is the layer that bridges the gap between Layer 1 identity and trust infrastructure and the Layer 3 booking workflow. It defines how parties advertise what they offer, how agents discover suppliers, how feasibility is confirmed before a booking begins, and how the Capability Catalogue operates at runtime.

Layer 3 is now complete and published. Several open questions raised during Layer 3 authoring were formally deferred to Layer 2. This document collects those deferred items, adds tensions that emerge from the Layer 2 architecture itself, and resolves all of them before the first Layer 2 section is written.

### 1.1 Scope of This Review

This review covers:

- Five architectural tensions (T-L2-1 through T-L2-5) identified from the Layer 3 specification, the Architecture Specification v0.2, and the scope decisions recorded in this session.
- Two design decisions taken prior to this review: the Feasibility Check operation is asynchronous and event-driven; A2A Protocol is promoted to ADOPT for inter-party agent communication.
- Design rules derived from each tension resolution (L2-T-x-y format).
- Deferred items that are explicitly out of scope for Layer 2 v1.0.

### 1.2 What Layer 2 Must Deliver

The Architecture Specification v0.2 commits Layer 2 to five named components. All five must be specified in Layer 2 v1.0:

| Component | Role |
|-----------|------|
| **Capability Declarations** | Supplier-registered statements of what they offer. Static at registration; versioned for staleness management. Queried by INQUIRY-phase logic via the Capability Catalogue. |
| **Activity Configuration Schema** | The structure by which a generic offering in a Capability Declaration is parameterised for a specific booking. Produces a fully-specified Activity Component for Layer 3. |
| **Resource Reference Registry** | Data provider driver registry. Validated against schema at registration. Corresponds to OS Function 4 (Driver Model) in the Architecture Specification. |
| **Pre-Arrangement Declarations** | Pre-negotiated terms established before a booking begins. Must interact correctly with Layer 3 Security Kernel authority gates. |
| **Feasibility Check operation** | The protocol operation that produces FEASIBILITY_CLEARED per Activity Component. Asynchronous and event-driven (design decision, March 2026). Required before INQUIRY exits in Layer 3. |

---

## 2. Prior Design Decisions

Two design decisions were taken before this review document was drafted. They are recorded here as closed decisions. They are not tensions to be resolved — they are inputs to the tension resolution that follows.

### 2.1 PD-L2-1 — Feasibility Check Is Asynchronous

> **CLOSED. The Feasibility Check operation is asynchronous and event-driven. Suppliers push FEASIBILITY_CLEARED (or FEASIBILITY_FAILED) as events per Activity Component when ready. INQUIRY remains open until all required components have cleared or the feasibility window expires.**

**Rationale:** The Activity Travel Protocol's primary use case is multi-supplier activity bookings. Blocking INQUIRY exit on the slowest supplier introduces unacceptable latency and creates a single point of failure. The async model is consistent with the event-log architecture throughout Layer 3, naturally handles partial completion state across multiple Activity Components, and extends the existing timeout budget model (Layer 3 S11) to cover the feasibility window without a new mechanism.

A single-supplier scenario where the supplier responds immediately is the degenerate synchronous case — it is handled correctly by the async model without a separate code path.

### 2.2 PD-L2-2 — A2A Protocol Promoted to ADOPT

> **CLOSED. A2A Protocol (Google Agent2Agent) is promoted from MONITOR to ADOPT for inter-party AI agent communication in Layer 2. MCP remains the agent-to-protocol interface throughout all layers. A2A is the agent-to-agent interface for inter-party discovery and negotiation within Layer 2.**

**Rationale:** The core use case of the Activity Travel Protocol at scale is AI agents acting for travelers negotiating with AI agents acting for suppliers. MCP handles agent-to-protocol tool calls; A2A handles agent-to-agent delegation across party boundaries. These are complementary and operate at different levels. The Capability Catalogue at scale is an agent-to-agent problem and A2A is the emerging standard for exactly that interaction pattern.

The adoption boundary is precise: MCP governs all interactions between an agent and the protocol runtime (Booking Object operations, Security Kernel calls, state transitions). A2A governs interactions between a booking agent and a supplier agent during the discovery and negotiation phase, before a Booking Object exists. The two protocols do not compete for the same role.

**Graceful degradation path:** suppliers without A2A agent capability are reachable via the Capability Catalogue through MCP tool calls against static Capability Declarations. A2A is additive, not a replacement.

---

## 3. Tension Analysis and Resolution

Five architectural tensions are identified and resolved in this section. Each tension is presented with its source, the conflict it creates, the resolution, and the design rules that result. Design rules are normative — Layer 2 sections must satisfy them.

### T-L2-1 — Feasibility Window Ownership [RESOLVED]

**Tension**

Layer 3 S11 defines the master timeout budget for all protocol operations, but INQUIRY has no defined feasibility window. PD-L2-1 establishes that the Feasibility Check is asynchronous — suppliers push FEASIBILITY_CLEARED events when ready. This creates a question of ownership: who defines how long the INQUIRY state may remain open waiting for feasibility events, and where does that timeout live in the specification?

If the feasibility window is defined in Layer 3 S11, it becomes a Layer 3 concern that Layer 2 cannot control. If it is defined in Layer 2, Layer 3 S11's completeness claim is incorrect — the master timeout table is not actually complete.

**Resolution**

The feasibility window is a Layer 2 protocol parameter, defined in the Layer 2 Feasibility Check specification. Layer 3 S11 is amended to reference the Layer 2-defined feasibility window as an external parameter rather than specifying a fixed value. The INQUIRY state timeout in Layer 3 is the feasibility window duration — making them the same variable, not two separate timeouts.

This is consistent with the existing Layer 3 pattern for configurable timeout ranges: the protocol specifies minimum, maximum, and default; the implementing party configures within range. Layer 2 defines the feasibility window range and default; Layer 3 enforces the INQUIRY exit gate against it.

> **L2-T-1-A:** Layer 2 MUST define a Feasibility Window parameter with a minimum, maximum, and default duration for the period during which FEASIBILITY_CLEARED events are accepted per Activity Component.
>
> **L2-T-1-B:** The Feasibility Window is a Layer 2 parameter referenced by Layer 3 S11. It is not a separately configurable Party Policy Declaration override — parties cannot extend it beyond the Layer 2-defined maximum.
>
> **L2-T-1-C:** Layer 2 MUST define the behaviour on partial feasibility: what happens when some Activity Components have issued FEASIBILITY_CLEARED and others have timed out. The protocol must specify whether INQUIRY may proceed with partial confirmation or must fail entirely.

### T-L2-2 — MCP / A2A Interface Boundary [RESOLVED]

**Tension**

Layer 3 uses MCP as the sole AI agent interface. PD-L2-2 promotes A2A to ADOPT for Layer 2 inter-party agent communication. Both protocols involve AI agents and protocol operations. Without a precise normative boundary, implementers cannot determine which protocol to use for which interaction, and conformance testing cannot verify correctness.

The risk is ambiguity at the handoff point: when a booking agent has completed A2A-mediated supplier discovery and needs to initiate a Booking Object in Layer 3, the transition from A2A to MCP must be unambiguous.

**Resolution**

The boundary is defined by the existence of a Booking Object. Before a Booking Object exists — during discovery, negotiation, and feasibility assessment — the interaction is a Layer 2 concern and A2A is the inter-party agent communication mechanism. Once a Booking Object is created (the INQUIRY state is entered), the interaction is a Layer 3 concern and MCP is the agent-to-protocol interface.

Concretely: a booking agent uses A2A to query a supplier agent about capabilities, negotiate configuration options, and receive feasibility signals. The supplier agent pushes FEASIBILITY_CLEARED via the Layer 2 Feasibility Check mechanism. When all required Activity Components have cleared, the booking agent uses MCP to call the Layer 3 operation that transitions the Booking Object from INQUIRY to PENDING_CONFIRMATION.

> **L2-T-2-A:** The Booking Object creation event is the normative MCP/A2A boundary. All agent interactions before Booking Object creation are Layer 2 scope; A2A governs inter-party agent communication in this phase. All agent interactions on an existing Booking Object are Layer 3 scope; MCP governs agent-to-protocol interactions in this phase.
>
> **L2-T-2-B:** Layer 2 MUST define the A2A task schema for Capability Declaration queries and Feasibility Check interactions. These schemas are Layer 2 protocol artifacts, analogous to the Context Package and Decision Object schemas in Layer 3.
>
> **L2-T-2-C:** Suppliers without A2A agent capability MUST be reachable through the Capability Catalogue via MCP tool calls against static Capability Declarations. A2A is additive; its absence does not make a supplier non-conformant.
>
> **L2-T-2-D:** Layer 2 MUST document the graceful degradation path: when a booking agent cannot reach a supplier agent via A2A, the fallback is MCP-based query of the Capability Catalogue. The protocol MUST specify when fallback is permitted and when it is not.

### T-L2-3 — Capability Declaration Staleness [RESOLVED]

**Tension**

OQ-L3-1 (resolved in Layer 3 S1) established that INQUIRY operates against static Capability Declarations rather than live availability. This was the correct scoping decision for Layer 3. However, it creates a Layer 2 obligation that was not previously specified: Layer 2 must define the validity model for Capability Declarations.

Static declarations go stale. A supplier may update their offerings, change pricing, withdraw a service, or change their operational constraints after registering a Capability Declaration. If FEASIBILITY_CLEARED is issued against a stale declaration, the booking proceeds on incorrect assumptions — a consumer protection risk that is central to the protocol's purpose.

**Resolution**

Layer 2 defines a Capability Declaration validity model with three components: a version identifier on every declaration, a maximum staleness period after which a declaration must be revalidated, and a DECLARATION_SUPERSEDED event that the supplier must publish when a declaration is materially changed.

The Feasibility Check operation must verify that the Capability Declaration it is assessing against is within its validity period at the time FEASIBILITY_CLEARED is issued. If the declaration has expired or been superseded, the Feasibility Check must return FEASIBILITY_FAILED with reason DECLARATION_STALE, and the booking agent must obtain a fresh declaration before retrying.

> **L2-T-3-A:** Every Capability Declaration MUST carry a version identifier and a declared validity period. The Party Registry MUST store the current valid version of each declaration and reject FEASIBILITY_CLEARED events issued against expired or superseded versions.
>
> **L2-T-3-B:** Suppliers MUST publish a DECLARATION_SUPERSEDED event when a Capability Declaration is materially changed. The event MUST reference the superseded version identifier and the replacement version identifier.
>
> **L2-T-3-C:** The Feasibility Check operation MUST validate declaration currency before issuing FEASIBILITY_CLEARED. A FEASIBILITY_FAILED event with reason DECLARATION_STALE is the required response when the assessed declaration is expired or superseded.
>
> **L2-T-3-D:** Layer 2 MUST define 'material change' for the purposes of DECLARATION_SUPERSEDED. Minor changes (e.g. contact details, formatting) do not trigger DECLARATION_SUPERSEDED. Changes to offered services, pricing model, operational constraints, or jurisdiction coverage do.

### T-L2-4 — Pre-Arrangement Declarations and Layer 3 Authority Gates [RESOLVED]

**Tension**

Layer 2 defines Pre-Arrangement Declarations — pre-negotiated terms established before a booking begins. Layer 3's Security Kernel evaluates Party Policy Declarations at every state transition, enforcing authority gates that govern who may trigger which transitions under what conditions.

The tension is whether a Pre-Arrangement Declaration, established in Layer 2, can pre-satisfy or override a Layer 3 Security Kernel authority gate. If it can, the mechanism must be defined precisely — otherwise the Security Kernel's non-bypassable guarantee is undermined. If it cannot, Pre-Arrangement Declarations have no effect on booking execution, which limits their usefulness significantly.

**Resolution**

Pre-Arrangement Declarations do not override Layer 3 Security Kernel authority gates. They are inputs to OPA policy evaluation, not bypasses of it. The Security Kernel evaluates all four policy tiers in order (Protocol, Jurisdiction, Party Operational, Party Preference) for every state transition. A Pre-Arrangement Declaration is a Party Operational policy artifact registered at Layer 1 Party registration time.

Concretely: a Pre-Arrangement Declaration may grant a Booking Party pre-authorisation to trigger certain state transitions without requiring real-time supplier confirmation. But this pre-authorisation is expressed as a Party Policy Declaration — it goes through the Security Kernel's OPA evaluation, it is recorded in the event log, and it is subject to Jurisdiction and Protocol-tier policy override. It is not a bypass; it is a standing authorisation that the Security Kernel evaluates normally.

> **L2-T-4-A:** Pre-Arrangement Declarations are Layer 2 artifacts that are expressed as Party Policy Declarations in the Layer 1 Party Registry. They take effect through the Layer 3 Security Kernel's OPA evaluation at the Party Operational policy tier.
>
> **L2-T-4-B:** Pre-Arrangement Declarations MUST NOT be construed as bypasses of the Security Kernel. Every state transition that relies on a Pre-Arrangement Declaration still goes through the full Security Kernel execution order: authenticate, authorise, OPA evaluation (including Pre-Arrangement), Trust Chain validation, AI agent scope validation.
>
> **L2-T-4-C:** Layer 2 MUST define the schema for Pre-Arrangement Declarations, including the state transitions they may pre-authorise, the conditions under which they expire, and the jurisdiction constraints that limit their applicability.
>
> **L2-T-4-D:** Pre-Arrangement Declarations MUST be registered in the Party Registry before the booking begins. A Pre-Arrangement Declaration asserted for the first time during an active booking is not valid and MUST be rejected by the Security Kernel.

### T-L2-5 — n-Party Coordination Delegation Setup [RESOLVED]

**Tension**

Layer 3 v1.0 limits Coordination Delegation to exactly two Fulfilling Party subjects (OQ-L3-5, CLOSED). The extension to n-party delegation was formally deferred to Layer 2. However, the Layer 2 specification must define how multi-party delegation topology is established before a booking enters Layer 3 — which means the Capability Catalogue must carry delegation capability information, and the Feasibility Check must confirm delegation topology before FEASIBILITY_CLEARED is issued.

The tension is sequencing: Layer 3 begins when the Booking Object is created. By the time the Booking Object exists, the delegation topology for a multi-party booking must already be confirmed as feasible. Layer 2 is therefore responsible for a coordination function that Layer 3 will execute but cannot itself set up.

**Resolution**

Layer 2 defines a Delegation Topology Declaration as a component of the Capability Catalogue. A supplier who can participate in multi-party Coordination Delegation registers their delegation capability in their Capability Declaration, specifying the maximum delegation depth they support and any constraints on co-delegatee identity.

The Feasibility Check for a multi-supplier booking with n > 2 Fulfilling Parties must include a Delegation Topology feasibility step: confirming that all required Fulfilling Parties have registered compatible delegation capabilities and that a valid delegation chain can be constructed from them. FEASIBILITY_CLEARED is not issued until the delegation topology is confirmed.

Layer 3 v1.0 executes multi-party delegation as sequential two-party Coordination Delegation chains — Layer 2 must ensure that any n-party topology it confirms as feasible is expressible as such a chain. The n-party execution model (without chaining) is a Layer 3 extension deferred to post-v1.0.

> **L2-T-5-A:** Layer 2 MUST define a Delegation Topology Declaration as a component of Capability Declarations. Suppliers capable of participating in multi-party Coordination Delegation MUST declare their maximum delegation depth and co-delegatee constraints at registration.
>
> **L2-T-5-B:** The Feasibility Check operation for a booking with n > 2 Fulfilling Parties MUST include a Delegation Topology feasibility step. FEASIBILITY_CLEARED MUST NOT be issued until the delegation topology is confirmed as constructable from the registered capabilities of all required Fulfilling Parties.
>
> **L2-T-5-C:** Layer 2 delegation topologies MUST be expressible as sequential two-party Coordination Delegation chains compatible with Layer 3 v1.0. A topology that cannot be decomposed into such chains is not feasible under Layer 3 v1.0 and MUST result in FEASIBILITY_FAILED.

---

## 4. Design Rules Summary

All 18 normative design rules produced by this review are listed below for reference. Each rule is stated in full in the tension resolution section above.

| Rule | Source Tension | Summary |
|------|---------------|---------|
| **L2-T-1-A** | T-L2-1 | Layer 2 defines Feasibility Window parameter with minimum, maximum, and default duration. |
| **L2-T-1-B** | T-L2-1 | Feasibility Window is a Layer 2 parameter referenced by Layer 3 S11; not a Party Policy Declaration override. |
| **L2-T-1-C** | T-L2-1 | Layer 2 defines partial feasibility behaviour: proceed with partial confirmation or fail entirely. |
| **L2-T-2-A** | T-L2-2 | Booking Object creation is the normative MCP/A2A boundary. |
| **L2-T-2-B** | T-L2-2 | Layer 2 defines A2A task schemas for Capability Declaration queries and Feasibility Check interactions. |
| **L2-T-2-C** | T-L2-2 | Suppliers without A2A must be reachable via MCP against static Capability Declarations. |
| **L2-T-2-D** | T-L2-2 | Layer 2 documents graceful degradation path; MCP fallback conditions are normative. |
| **L2-T-3-A** | T-L2-3 | Every Capability Declaration carries version identifier and validity period; Party Registry rejects stale FEASIBILITY_CLEARED. |
| **L2-T-3-B** | T-L2-3 | Suppliers publish DECLARATION_SUPERSEDED on material change, referencing superseded and replacement version identifiers. |
| **L2-T-3-C** | T-L2-3 | Feasibility Check validates declaration currency; FEASIBILITY_FAILED with reason DECLARATION_STALE on expired or superseded declarations. |
| **L2-T-3-D** | T-L2-3 | Layer 2 defines 'material change' for DECLARATION_SUPERSEDED purposes. |
| **L2-T-4-A** | T-L2-4 | Pre-Arrangement Declarations are Party Operational policy artifacts; take effect through Security Kernel OPA evaluation. |
| **L2-T-4-B** | T-L2-4 | Pre-Arrangement Declarations are not Security Kernel bypasses; full execution order applies. |
| **L2-T-4-C** | T-L2-4 | Layer 2 defines Pre-Arrangement Declaration schema including pre-authorised transitions, expiry, and jurisdiction constraints. |
| **L2-T-4-D** | T-L2-4 | Pre-Arrangement Declarations must be registered before booking begins; runtime assertion is invalid. |
| **L2-T-5-A** | T-L2-5 | Layer 2 defines Delegation Topology Declaration as part of Capability Declarations. |
| **L2-T-5-B** | T-L2-5 | Feasibility Check for n > 2 Fulfilling Parties includes Delegation Topology feasibility step. |
| **L2-T-5-C** | T-L2-5 | Layer 2 delegation topologies must be expressible as sequential two-party Coordination Delegation chains for Layer 3 v1.0. |

---

## 5. Deferred Items

The following items are explicitly out of scope for Layer 2 v1.0. Each deferral records the rationale and the condition that would reopen the item.

| ID | Item | Rationale | Reopen trigger |
|----|------|-----------|----------------|
| **DL2-1** | MICE Extension for Layer 2 | OQ-L3-2 deferred MICE bookings to a named Layer 3 extension specification post-v1.0. Layer 2 discovery patterns for MICE follow the same extension track. | Layer 3 MICE Extension Specification published and stable. |
| **DL2-2** | CAAM Trust Chain mapping | OQ-SL-1 deferred CAAM Bridge Specification to stabilisation of draft-barney-caam beyond -00. Layer 2 Capability Declarations may carry CAAM act-claims but the normative mapping is deferred. | Stabilisation of draft-barney-caam beyond -00. |
| **DL2-3** | Full n-party Coordination Delegation execution | T-L2-5 defines topology setup in Layer 2 but Layer 3 v1.0 executes via two-party chaining. The n-party execution model (without chaining workaround) is a Layer 3 extension, not a Layer 2 concern. | Layer 3 n-party Coordination Delegation Extension Specification. |
| **DL2-4** | OpenTravel / NDC Capability Declaration mapping | Standards position BRIDGE. Mapping tables are a named appendix in Layer 2. Full conformance testing of bridge implementations is deferred to Layer 4 SDK conformance suite. | Layer 4 SDK conformance suite design. |

---

## 6. Layer 2 Section Structure

The following section structure is recommended for Layer 2 authoring. It follows the same pattern as Layer 3 (S0 index, S1 purpose and scope through S12 design rules compliance, plus appendices). Sections may be reordered before authoring begins but the coverage is normative — all five architecture-specified components must be addressed.

| Section | Title | Key content |
|---------|-------|-------------|
| **S0** | Index and Introduction | Layer 2 landing page. What Layer 2 defines, relationship to Layer 1 and Layer 3, section guide. |
| **S1** | Purpose and Scope | Layer 2 scope boundary. What Layer 2 does and does not define. Relationship to OQ-L3-1, OQ-L3-3, OQ-L3-5. |
| **S2** | Normative References and Definitions | Capability Declaration, Activity Configuration, Feasibility Check, Capability Catalogue, Delegation Topology Declaration, Pre-Arrangement Declaration, FEASIBILITY_CLEARED, FEASIBILITY_FAILED, DECLARATION_SUPERSEDED. |
| **S3** | Capability Declaration Schema | Structure of a supplier's declared offering. Version identifier, validity period, material change definition. Delegation Topology Declaration component. Rules L2-T-3-A/B/D, L2-T-5-A. |
| **S4** | Activity Configuration Schema | Parameterisation of a Capability Declaration for a specific booking. Output: fully-specified Activity Component for Layer 3. |
| **S5** | Resource Reference Registry | Data provider driver registration. Validation at registration. OS Function 4 Driver Model implementation. |
| **S6** | Pre-Arrangement Declarations | Schema, pre-authorised transitions, expiry, jurisdiction constraints. Interaction with Layer 3 Security Kernel (rules L2-T-4-A through L2-T-4-D). |
| **S7** | Feasibility Check Operation | Async event-driven operation. FEASIBILITY_CLEARED / FEASIBILITY_FAILED events. Feasibility Window parameter (rules L2-T-1-A/B/C). Partial feasibility behaviour. Declaration currency validation (rules L2-T-3-C). Delegation topology feasibility step (rules L2-T-5-B/C). |
| **S8** | Capability Catalogue | Discovery mechanism. MCP tool interface and A2A inter-party agent interface. Interface boundary definition (rules L2-T-2-A through L2-T-2-D). MCP fallback path. |
| **S9** | Live Availability | Resolution of OQ-L3-1 extension. Relationship between static Capability Declarations and live availability signals. Layer 2 defines if/when live signals supplement static declarations. |
| **S10** | AI Agent Participation | Discovery-phase agent authority. A2A task schemas for Capability Declaration queries and Feasibility Check (rule L2-T-2-B). Graceful degradation. |
| **S11** | Multi-Party Discovery | n-party Coordination Delegation topology setup (rules L2-T-5-A/B/C). Delegation Topology Declaration querying. Topology feasibility confirmation. |
| **S12** | Design Rules Compliance Trace | 18 design rules traced. Compliance verdict. |
| **App. A** | Standards Bridge — OpenTravel / NDC | BRIDGE position implementation. Capability Declaration mapping tables. |

---

*Activity Travel Protocol — Pre-Layer 2 Consistency Review v1.0 — March 2026*
