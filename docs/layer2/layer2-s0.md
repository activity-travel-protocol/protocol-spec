---
title: Layer 2 — Discovery and Capability Specification
description: The Activity Travel Protocol Layer 2 Discovery and Capability Specification defines how parties advertise what they offer, how agents discover suppliers, how feasibility is confirmed before a booking begins, and how the Capability Catalogue operates at runtime.
---

# Layer 2 — Discovery and Capability Specification

**Status:** Working Draft — March 2026  
**Layer:** 2 of 4  
**Depends on:** Layer 1 (Identity and Trust)  
**Required by:** Layer 3 (Workflow)

---

## What Layer 2 defines

Layer 2 is the discovery and capability layer of the Activity Travel Protocol. It specifies how a supplier makes their offering known to the protocol, how a booking agent discovers and evaluates that offering before a booking begins, and how feasibility is confirmed at the Activity Component level before the Layer 3 booking workflow is entered.

Where Layer 1 establishes who the parties are and how they trust each other, and Layer 3 establishes how a confirmed booking is executed and protected, Layer 2 defines the space between them: the structured negotiation and confirmation process that must complete before a Booking Object can be created.

Layer 2 is the layer in which AI agents do most of their work. A booking agent acting for a traveler uses Layer 2 to query the Capability Catalogue, assess supplier offerings, negotiate configuration options, and obtain FEASIBILITY_CLEARED confirmation per Activity Component. Only when all required Activity Components have cleared does the agent cross the Layer 2/Layer 3 boundary and initiate a Booking Object.

The specification is built around five architecture-mandated components, each of which addresses a distinct aspect of the pre-booking lifecycle:

- **Capability Declarations**  — supplier-registered statements of what they offer, versioned for staleness management, queried by INQUIRY-phase logic in Layer 3 via the Capability Catalogue.
- **Activity Configuration Schema**  — the structure by which a generic offering in a Capability Declaration is parameterised for a specific booking, producing a fully-specified Activity Component for Layer 3.
- **Resource Reference Registry**  — the data provider driver registry, validated against schema at registration, implementing OS Function 4 (Driver Model) from the Architecture Specification.
- **Pre-Arrangement Declarations**  — pre-negotiated terms established before a booking begins, expressed as Party Policy Declarations and evaluated by the Layer 3 Security Kernel at the Party Operational policy tier.
- **Feasibility Check operation**  — the asynchronous, event-driven protocol operation that produces FEASIBILITY_CLEARED (or FEASIBILITY_FAILED) per Activity Component. INQUIRY in Layer 3 remains open until all required components clear or the Feasibility Window expires.

These five components are not independent. A Capability Declaration is the input to Activity Configuration, which produces the Activity Component that the Feasibility Check assesses. A Pre-Arrangement Declaration registered at Layer 1 may pre-authorise state transitions that the Security Kernel will evaluate when the booking is active. The Resource Reference Registry underpins the data access model throughout. Layer 2 specifies each component individually and defines how they interact.

---

## The pre-booking boundary

Layer 2 occupies the protocol interval between two precisely defined boundaries.

**The lower boundary** is Layer 1 party registration. Before a supplier can participate in Layer 2, they must be registered in the Party Registry with a valid Trust Chain, identity credentials (OpenID Federation 1.0, FAPI 2.0, W3C VC 2.0), and any Pre-Arrangement Declarations they wish to make available to booking agents. These prerequisites are Layer 1 obligations; Layer 2 assumes they are satisfied.

**The upper boundary** is Booking Object creation. The moment a Booking Object is created  — the moment the INQUIRY state is entered in Layer 3  — the booking is a Layer 3 concern. Every agent interaction on an existing Booking Object uses MCP as the agent-to-protocol interface. Every Security Kernel authority gate applies from that moment forward. Layer 2 cannot be invoked on an existing Booking Object.

The Feasibility Check is the mechanism that bridges these two boundaries. It is the last Layer 2 operation in the pre-booking sequence, and its successful completion  — FEASIBILITY_CLEARED for all required Activity Components  — is the precondition for Booking Object creation. This boundary is normative. It is not an implementation choice.

---

## AI agent participation model

Layer 2 is where agent-to-agent interaction occurs. The Activity Travel Protocol at scale is a system in which AI agents acting for travelers negotiate with AI agents acting for suppliers. Layer 2 defines the protocol infrastructure for that interaction.

Two complementary protocols govern Layer 2 agent interactions:

**A2A Protocol (Agent2Agent)** governs inter-party agent communication during discovery and negotiation. A booking agent uses A2A to query a supplier agent about Capability Declarations, negotiate Activity Configuration options, receive feasibility signals, and confirm delegation topology. A2A is the correct protocol for interactions that cross party boundaries before a Booking Object exists.

**MCP (Model Context Protocol)** governs agent-to-protocol interactions throughout all layers. In Layer 2, MCP is used for Capability Catalogue queries against static Capability Declarations, and for the handoff operation that creates the Booking Object when all Activity Components have cleared. MCP is also the fallback path for booking agents that cannot reach a supplier agent via A2A: a supplier without A2A agent capability remains reachable through the Capability Catalogue via MCP tool calls against their static Capability Declarations. A2A is additive; its absence does not make a supplier non-conformant.

The normative boundary between these two protocols is Booking Object creation. This boundary is defined in design rule L2-T-2-A and is not subject to implementation interpretation.

Layer 2 also defines the A2A task schemas for Capability Declaration queries and Feasibility Check interactions. These schemas are Layer 2 protocol artifacts, analogous to the Context Package and Decision Object schemas in Layer 3.

---

## Feasibility Window and the INQUIRY gate

The Feasibility Check is asynchronous and event-driven. Suppliers push FEASIBILITY_CLEARED (or FEASIBILITY_FAILED) as events per Activity Component when they are ready to confirm. INQUIRY in Layer 3 remains open until all required components have cleared or the Feasibility Window expires.

The Feasibility Window is a Layer 2 protocol parameter. It is not a Party Policy Declaration override  — parties cannot extend it beyond the Layer 2-defined maximum. Layer 3 Section 11 (Timeout Budget Model) references the Feasibility Window as an external parameter defined here.

The Feasibility Window has a minimum duration of PT5M, a default of PT30M, and a maximum of PT4H. These values are normative. The implementing party configures within this range; no party may configure below the minimum or above the maximum.

Partial feasibility  — the condition in which some Activity Components have issued FEASIBILITY_CLEARED and others have timed out  — is defined in Layer 2. The protocol specifies whether INQUIRY may proceed with partial confirmation or must fail entirely, and the conditions under which partial feasibility is acceptable are normative.

---

## Capability Declaration validity model

Capability Declarations are static at the time of querying: INQUIRY in Layer 3 operates against the declaration as it was registered, not against live supplier availability. This is the resolution of OQ-L3-1 from the Layer 3 specification. However, this scoping decision creates a Layer 2 obligation  — Layer 2 must define how declarations stay current and what happens when they do not.

Every Capability Declaration carries a version identifier and a declared validity period. The Party Registry stores the current valid version of each declaration and rejects FEASIBILITY_CLEARED events issued against expired or superseded versions. When a supplier makes a material change to their offering, they must publish a DECLARATION_SUPERSEDED event referencing both the superseded version and its replacement.

The Feasibility Check must validate declaration currency before issuing FEASIBILITY_CLEARED. If the declaration being assessed is expired or has been superseded, the Feasibility Check must return FEASIBILITY_FAILED with reason DECLARATION_STALE. The booking agent must obtain a fresh declaration before retrying.

Layer 2 defines what constitutes a material change for the purposes of DECLARATION_SUPERSEDED. Minor changes  — contact details, formatting, non-substantive corrections  — do not trigger DECLARATION_SUPERSEDED. Changes to offered services, pricing model, operational constraints, or jurisdiction coverage do.

---

## Relationship to other layers

| Layer | Name | Relationship to Layer 2 |
|---|---|---|
| Layer 1 | Identity and Trust | Normative foundation. Party registration, Trust Chain, W3C VC 2.0, FAPI 2.0, Party Policy Declarations, and the Party Registry are all defined in Layer 1. Pre-Arrangement Declarations are registered via the Layer 1 Party Registry. Layer 2 assumes all participating parties have valid Layer 1 registrations. |
| Layer 2 | Discovery and Capability | This specification. |
| Layer 3 | Workflow | Consumer of Layer 2 outputs. INQUIRY assumes that Capability Declarations are known and that FEASIBILITY_CLEARED has been issued for all required Activity Components. Layer 3 Section 11 references the Feasibility Window parameter defined here. The Security Kernel evaluates Pre-Arrangement Declarations defined here at the Party Operational policy tier. |
| Layer 4 | Schema and SDK | Co-designed with Layer 2 completion. Appendix A of this specification (Standards Bridge  — OpenTravel / NDC) defines mapping tables whose full conformance testing is deferred to the Layer 4 SDK conformance suite. |

---

## Scope

Layer 2 covers:

- Capability Declaration schema  — version identifier, validity period, material change definition, Delegation Topology Declaration component
- Activity Configuration Schema  — parameterisation of a Capability Declaration for a specific booking, producing a fully-specified Activity Component for Layer 3
- Resource Reference Registry  — data provider driver registration and validation, implementing OS Function 4 (Driver Model)
- Pre-Arrangement Declarations  — schema, pre-authorised state transitions, expiry conditions, jurisdiction constraints, and interaction with the Layer 3 Security Kernel
- Feasibility Check operation  — asynchronous event model, FEASIBILITY_CLEARED and FEASIBILITY_FAILED events, Feasibility Window parameter, partial feasibility behaviour, declaration currency validation, delegation topology feasibility step
- Capability Catalogue  — discovery mechanism, MCP tool interface, A2A inter-party agent interface, interface boundary definition, MCP fallback path
- Live availability  — relationship between static Capability Declarations and live availability signals; conditions under which live signals supplement static declarations
- AI agent participation  — A2A task schemas for Capability Declaration queries and Feasibility Check, graceful degradation rules
- Multi-party discovery  — n-party Coordination Delegation topology setup, Delegation Topology Declaration querying, topology feasibility confirmation
- Design rule compliance trace  — 79 rules (18 L2-T + 61 DR-L2), compliance verdict: PASS

Layer 2 does not cover:

- Party identity, Trust Chain construction, or credential issuance  — those are Layer 1 concerns
- Booking Object state lifecycle, journey phase management, or Security Kernel execution  — those are Layer 3 concerns
- SDK enforcement of schema constraints or conformance test harness  — those are Layer 4 concerns
- MICE booking discovery patterns  — deferred to the Layer 3 MICE Extension Specification (DL2-1)
- CAAM Trust Chain mapping  — deferred to the CAAM Bridge Specification pending stabilisation of draft-barney-caam beyond -00 (DL2-2)
- Full n-party Coordination Delegation execution without the two-party chaining workaround  — deferred to the Layer 3 n-party Coordination Delegation Extension Specification (DL2-3)

---

## Section guide

### [Section 1  — Purpose and Scope](./layer2-s1)

The Layer 2 scope boundary. What Layer 2 does and does not define. The five architecture-mandated components and their relationships. Formal closure of the OQ-L3-1 extension obligation, OQ-L3-3 A2A integration, and OQ-L3-5 n-party topology setup. The pre-booking boundary definition. Relationship to the Pre-Layer 2 Consistency Review design rules.

### [Section 2  — Normative References and Definitions](./layer2-s2)

All terms used normatively in this specification: Capability Declaration, Activity Configuration Schema, Resource Reference Registry, Pre-Arrangement Declaration, Feasibility Check operation, Capability Catalogue, Delegation Topology Declaration, Feasibility Window, FEASIBILITY_CLEARED, FEASIBILITY_FAILED, DECLARATION_SUPERSEDED, material change, and others. External standards references including A2A Protocol, MCP, OpenTravel Alliance, IATA NDC.

### [Section 3  — Capability Declaration Schema](./layer2-s3)

Structure of a supplier's declared offering. Version identifier and validity period model. Material change definition and DECLARATION_SUPERSEDED trigger conditions. Delegation Topology Declaration as a Capability Declaration component  — maximum supported delegation depth and co-delegatee identity constraints. Registration and update procedures. Party Registry enforcement of declaration currency.

### [Section 4  — Activity Configuration Schema](./layer2-s4)

Parameterisation of a Capability Declaration for a specific booking. The transformation from a generic supplier offering to a fully-specified Activity Component ready for Layer 3 INQUIRY. Configuration option negotiation model. Validation rules. Output schema and the Activity Component handoff contract.

### [Section 5  — Resource Reference Registry](./layer2-s5)

Data provider driver registration. Schema validation at registration time. OS Function 4 (Driver Model) implementation. Driver versioning and update model. Registry query interface. Relationship to Capability Declaration supplier data references.

### [Section 6  — Pre-Arrangement Declarations](./layer2-s6)

Schema for Pre-Arrangement Declarations. State transitions that a Pre-Arrangement Declaration may pre-authorise. Expiry conditions. Jurisdiction constraints on applicability. Registration requirement  — Pre-Arrangement Declarations must be registered in the Party Registry before the booking begins; runtime assertion is invalid and must be rejected by the Security Kernel. Interaction with the Layer 3 Security Kernel OPA evaluation at the Party Operational policy tier. Design rules L2-T-4-A through L2-T-4-D.

### [Section 7  — Feasibility Check Operation](./layer2-s7)

The asynchronous, event-driven operation that produces FEASIBILITY_CLEARED or FEASIBILITY_FAILED per Activity Component. Event model and push mechanism. Feasibility Window parameter  — minimum PT5M, default PT30M, maximum PT4H  — and configurability constraints. Partial feasibility behaviour  — conditions under which INQUIRY may proceed with partial confirmation versus full failure. Declaration currency validation before FEASIBILITY_CLEARED issuance. Delegation topology feasibility step for bookings with n > 2 Fulfilling Parties. Design rules L2-T-1-A through L2-T-1-C, L2-T-3-A through L2-T-3-D, L2-T-5-B, L2-T-5-C.

### [Section 8  — Capability Catalogue](./layer2-s8)

The discovery mechanism through which booking agents find and assess supplier offerings. MCP tool interface for static Capability Declaration queries. A2A inter-party agent interface for dynamic discovery and negotiation. The normative MCP/A2A boundary  — Booking Object creation as the dividing event. MCP fallback path for suppliers without A2A agent capability  — when fallback is permitted and when it is not. Design rules L2-T-2-A through L2-T-2-D.

### [Section 9  — Live Availability](./layer2-s9)

Resolution of the OQ-L3-1 extension obligation. The relationship between static Capability Declarations (queried by Layer 3 INQUIRY) and live availability signals. Conditions under which live availability supplements static declarations without replacing them. Live signal schema. Stale signal handling. Interaction with the declaration currency model defined in Section 3.

### [Section 10  — AI Agent Participation](./layer2-s10)

Discovery-phase agent authority model. A2A task schemas for Capability Declaration queries and Feasibility Check interactions  — normative Layer 2 protocol artifacts. Graceful degradation path when a booking agent cannot reach a supplier agent via A2A. Authority scope for agents operating in the pre-booking phase. Human confirmation checkpoints in the discovery and configuration flow. Design rules L2-T-2-B, L2-T-2-C, L2-T-2-D.

### [Section 11  — Multi-Party Discovery](./layer2-s11)

n-party Coordination Delegation topology setup. Delegation Topology Declaration querying  — how a booking agent confirms that all required Fulfilling Parties support compatible delegation depths and have no conflicting co-delegatee identity constraints. Topology feasibility confirmation as a component of the Feasibility Check for bookings with n > 2 Fulfilling Parties. Delegation chain construction  — the requirement that every Layer 2 topology be expressible as sequential two-party Coordination Delegation operations in Layer 3 v1.0. FEASIBILITY_FAILED with reason DELEGATION_TOPOLOGY_UNSUPPORTED for topologies that cannot be so expressed. Maximum delegation chain depth: 5 (DR-L2-11-G). Design rules L2-T-5-A through L2-T-5-C.

### [Section 12  — Design Rules Compliance Trace](./layer2-s12)

Compliance trace for all 79 design rules: 18 L2-T rules from the Pre-Layer 2 Consistency Review and 61 DR-L2 section-specific rules defined in Sections 5 through 11. Full traceability from each rule to the section and clause that satisfies it. **Compliance verdict: PASS.**

---

## Appendices

### [Appendix A  — Standards Bridge: OpenTravel / NDC](./layer2-appendix-a)

BRIDGE position implementation for OpenTravel Alliance and IATA NDC. Capability Declaration mapping tables from OpenTravel OTA_ message types and NDC OrderCreate/OrderView schema to Activity Travel Protocol Capability Declaration structure. Conformance testing of bridge implementations is deferred to the Layer 4 SDK conformance suite (DL2-4).

---

## How to read this specification

**For implementers registering as a supplier:** Section 3 defines the Capability Declaration you must publish. Section 4 covers how your declaration is parameterised by a booking agent into an Activity Component. Section 7 defines the Feasibility Check events you must push and the timing obligations you must meet. Section 6 covers Pre-Arrangement Declarations if you offer pre-negotiated terms.

**For implementers building a booking agent:** Section 8 is your primary reference for Capability Catalogue interaction. Section 10 covers the A2A task schemas your agent must implement and the graceful degradation path if A2A is unavailable. Section 7 defines the Feasibility Window your agent must respect and the partial feasibility conditions it must handle. Section 11 covers multi-party topology confirmation if your bookings involve n > 2 Fulfilling Parties.

**For implementers building a Host Party platform:** Section 1 defines the Layer 2/Layer 3 boundary and the Booking Object creation gate. Section 7 gives the Feasibility Window parameter your platform enforces. Section 9 covers live availability signal handling. Section 12 is the compliance trace entry point for all 79 design rules.

**For implementers integrating AI agents:** Section 10 is the primary reference for discovery-phase agent authority. Section 8 defines the MCP/A2A boundary and the fallback model. Section 11 covers multi-party delegation topology from the agent's perspective.

**For auditors and conformance testing:** Section 12 is the compliance trace entry point. All 79 design rules are traced to their implementing sections.

---

## Deferred items

Four items are explicitly out of scope for Layer 2 v1.0. Each deferral is recorded with its reopen trigger.

| ID | Item | Reopen trigger |
|---|---|---|
| DL2-1 | MICE Extension for Layer 2 | Layer 3 MICE Extension Specification published and stable |
| DL2-2 | CAAM Trust Chain mapping | Stabilisation of draft-barney-caam beyond -00 |
| DL2-3 | Full n-party Coordination Delegation execution | Layer 3 n-party Coordination Delegation Extension Specification |
| DL2-4 | OpenTravel / NDC Capability Declaration conformance testing | Layer 4 SDK conformance suite design |

---

## Document status and versioning

This specification is a **Working Draft**. All sections (S1窶鉄12 and Appendix A) have been validated as working drafts. S0 (this document) completes the Layer 2 specification set. The specification will advance to Candidate Specification status following review by the founding consortium.

Layer 4 co-design items identified during Layer 2 authoring will be recorded in Section 12 and tracked as LAYER 4 PENDING in the same manner as the Layer 3 precedent.

::: info
Layer 2 depends on Layer 1. Implementers must be familiar with the [Architecture Specification](/spec/architecture), [Party Registry Specification](/spec/party-registry), [Trust Chain Declaration Specification](/spec/trust-chain), and [Party Policy Declarations Specification](/spec/party-policy-declarations) before implementing Layer 2 discovery and capability behaviour.
:::

---

*Activity Travel Protocol  — Layer 2 Discovery and Capability Specification  — Working Draft  — March 2026*\
*Apache 2.0  — MyAuberge K.K.*

