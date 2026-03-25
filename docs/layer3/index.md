---
title: Layer 3 — Workflow Specification
description: The Activity Travel Protocol Layer 3 Workflow Specification defines the complete runtime behaviour of a booking from first inquiry through journey completion, including booking states, journey phases, disruption handling, AI agent participation, and multi-party coordination.
---

# Layer 3 — Workflow Specification

**Status:** Working Draft — March 2026  
**Layer:** 3 of 4  
**Depends on:** Layer 1 (Identity and Trust)

---

## What Layer 3 defines

Layer 3 is the runtime layer of the Activity Travel Protocol. It specifies how a Booking Object behaves across its full lifecycle — from the first INQUIRY through to JOURNEY_COMPLETED or terminal cancellation — and how every party involved in that lifecycle must behave with respect to it.

Where Layer 1 establishes who the parties are and how they trust each other, Layer 3 establishes what they must do, in what order, under what authority, and with what obligations to traveler welfare at every point.

The specification is built around two orthogonal axes:

- **The Booking Object state lifecycle** — eleven states from INQUIRY to BOOKING_CANCELLED_SUSPENDED, governing the legal and operational status of a booking at any point in time.
- **The IN_JOURNEY phase model** — eight sequential phases (PRE_DEPARTURE through COMPLETION) that govern the operational obligations of parties while a booking is active.

These axes are independent. A Booking Object in the IN_JOURNEY state may be in any of the eight journey phases. A Booking Object in BOOKING_SUSPENDED retains its current phase — the suspension modifier overlays the phase without replacing it.

A third structural element, the **Activity Component**, tracks supplier-level fulfillment within phases. Each Fulfilling Party's obligations are scoped to the Activity Components assigned to it.

---

## Scope

Layer 3 covers:

- All booking state transitions and their authority gates
- All eight IN_JOURNEY phases and their phase transition conditions
- The BOOKING_SUSPENDED cross-cutting behaviour, including all three entry conditions and all three exit paths
- The Human Escalation Manager (HEM) invocation catalogue — 23 entries, P1 through P4 priority
- The TRAVELER_UNREACHABLE chain — six sub-categories, TU-1 through TU-6
- Disruption event handling — IROPS, SUPPLIER_FAILURE_AT_DELIVERY, force majeure
- AI agent participation — eight authority scopes, six Decision Type routings, Context Package assembly by phase
- Seven named protocol events — three traveler welfare events and four multi-party coordination events
- The complete timeout budget — all protocol deadlines, configurable ranges, and freeze rules
- Multi-party coordination — Duty of Care handoff protocol, Coordination Delegation, Synchronisation Points
- Design rule compliance trace — 24 rules, compliance verdict: PASS

Layer 3 does not cover capability advertisement, supplier discovery, or commercial agreement terms — those are Layer 2 concerns. It does not cover the SDK enforcement of schema constraints — those are Layer 4 concerns.

---

## Relationship to other layers

| Layer | Name | Relationship to Layer 3 |
|---|---|---|
| Layer 1 | Identity and Trust | Normative foundation. Party roles, Trust Chain, W3C VC 2.0, FAPI 2.0, Security Kernel, and Party Policy Declarations are all defined in Layer 1 and used without redefinition here. |
| Layer 2 | Discovery and Capability | Written after Layer 3. Layer 2 will define how parties advertise and discover capabilities; Layer 3 assumes those capabilities are known at booking time. |
| Layer 3 | Workflow | This specification. |
| Layer 4 | Schema and SDK | Co-designed with Layer 3 completion. Two Layer 3 design rules (T-1-C, T-2-C) are marked LAYER 4 PENDING — SDK enforcement of Context Package and Decision Object schema constraints. |

---

## Section guide

### [Section 1 — Purpose and Scope](./purpose-and-scope)

The two-axis model (Booking Object state lifecycle and IN_JOURNEY phase model) and the Activity Component. Defines the scope boundary between Layer 3 and Layers 2 and 4. Closes OQ-L3-1.

### [Section 2 — Normative References and Definitions](./normative-references)

All terms used normatively in this specification: Host Party, Fulfilling Party, Booking Party, Activity Component, Duty of Care, Human Escalation Manager, Coordination Delegation, Synchronisation Point, and others. External standards references.

### [Section 3 — Booking States](./booking-states)

The eleven Booking Object states from INQUIRY through BOOKING_CANCELLED_SUSPENDED, with transition conditions, authority gates, and terminal state rules. Activity Component status model.

### [Section 4 — Journey Phase Specification](./journey-phases)

The eight IN_JOURNEY phases from PRE_DEPARTURE through COMPLETION. Phase transition conditions, per-phase Duty of Care levels, phase cycling model, and Duty of Care transfer as a Security Kernel operation.

### [Section 5 — BOOKING_SUSPENDED Cross-Cutting Behaviour](./booking-suspended)

The parallel state modifier that may overlay any active booking state or journey phase. Three entry conditions (TU-5, legal authority order, force majeure). Three exit paths. Per-phase entry action sets. Audit trail requirements. Coordination Delegation freeze rule. SSF interaction.

### [Section 6 — HEM Invocation Catalogue](./hem-invocation-catalogue)

The complete catalogue of Human Escalation Manager entries — HEM-01 through HEM-23, organised by priority P1 through P4. Each entry specifies the triggering condition, escalation_reason, protocol_deadline, and required escalation context fields.

### [Section 7 — TRAVELER_UNREACHABLE Chains](./traveler-unreachable)

Six sub-categories: TU-1 DEVICE_UNAVAILABLE, TU-2 TRAVELER_MISSING, TU-3a TRAVELER_OVERDUE, TU-3b TRAVELER_DEPARTED_IRREGULARLY, TU-4 CONTACT_SUSPENDED, TU-5 TRAVELER_DECEASED, TU-6 TRAVELER_VICTIM_OF_CRIME. State machine interaction per sub-category, upgrade and downgrade map, JOURNEY_COMPLETED gate table.

### [Section 8 — Disruption Event Handling](./disruption-handling)

Three disruption classes: IROPS, SUPPLIER_FAILURE_AT_DELIVERY, and force majeure. The DT-4 C1 autonomous assessment window. Disruption interaction matrix. Resolution paths and claim initiation hook.

### [Section 9 — AI Agent Participation Model](./ai-agent-participation)

Eight authority scopes (INFORMATION_PROVISION, CONFIGURATION_SUGGESTION, NEGOTIATION, DISRUPTION_RESPONSE, CORPORATE_ACCOUNT, BUSINESS_GROUP_LEAD, AGENT_COORDINATE, AGENT_ESCALATE). Six Decision Type routings. Context Package assembly by phase. Decision Object validation. Stale package handling. Human confirmation checkpoints.

### [Section 10 — Named Protocol Events](./named-protocol-events)

Seven first-class protocol events with defined authority gates, triggering conditions, and state effects. Three traveler welfare events: TRAVELER_FOUND, RECOVERED, SUPPLIER_FAILURE_AT_DELIVERY. Four multi-party coordination events: DUTY_OF_CARE_TRANSFER_INITIATED, DUTY_OF_CARE_ACCEPTED, COORDINATION_OWNER_ASSIGNED, COORDINATION_DELEGATION_REQUESTED.

### [Section 11 — Timeout Budget Model](./timeout-budget)

The authoritative master reference for all protocol deadlines and timeout values. Twenty-three HEM protocol_deadline values, state and phase timeouts, TRAVELER_UNREACHABLE timeout values, multi-party coordination timeouts, and audit retention periods. Freeze-during-BOOKING_SUSPENDED rules. Configurability constraints.

### [Section 12 — Multi-Party Coordination](./multi-party-coordination)

Protocol obligations for Booking Objects with two or more Fulfilling Parties. Duty of Care handoff protocol (DoC-1, DoC-2, DoC-3, DoC-4). Coordination Delegation as a W3C VC 2.0 credential (CD-1, CD-2). Synchronisation Points and the PENDING_SYNCHRONISATION gate model (SP-1). AI agent coordination authority.

### [Section 13 — Open Questions Resolution](./open-questions)

Disposition of OQ-L3-1 through OQ-L3-7 and OQ-SL-1. Three closed (OQ-L3-5, OQ-L3-6, OQ-L3-7), three deferred (OQ-L3-2, OQ-L3-3, OQ-SL-1), one transferred (OQ-L3-1).

### [Section 14 — Design Rules Compliance Trace](./design-rules-compliance)

Compliance trace for all 24 design rules: seventeen T-x rules from the pre-Layer 3 review and seven rules from Section 12. Twenty-one SATISFIED, one VACUOUSLY SATISFIED, two LAYER 4 PENDING. No rule violated. No rule orphaned. **Compliance verdict: PASS.**

---

## Appendices

### [Appendix A — Decision Type Registry](./appendix-decision-types)

DT-1 through DT-6 base Decision Types. Full Authority Scope Registry — eight scopes with triggering conditions and human confirmation requirements. Extensibility rules for DT-7 and beyond.

### [Appendix B — State Transition Table](./appendix-state-transitions)

Machine-readable summary of all states and transitions in three tables: Booking Object state transitions, Journey Phase transitions, and Activity Component status transitions.

### [Appendix C — BPMN Notation Guide](./appendix-bpmn-notation)

Four swimlane definitions (KERNEL, BOOKING PARTY, SUPPLIER, AI AGENT), node type reference, design rules for diagram authorship, standard flow patterns, XState v5 mapping.

---

## How to read this specification

**For implementers building a Host Party platform:** Start with Section 1 for the overall model, then Section 3 (states) and Section 4 (phases) for the core state machine. Section 5 (BOOKING_SUSPENDED) and Section 6 (HEM) govern the most safety-critical paths. Section 11 gives the authoritative timeout reference.

**For implementers integrating as a Fulfilling Party:** Section 2 defines your obligations. Section 4 covers phase-level duties. Section 12 covers multi-party coordination obligations if your bookings involve concurrent suppliers.

**For implementers building AI agent integrations:** Section 9 is the primary reference. Section 10 covers the named events your agents may encounter. Appendix A defines the authority scope model your agent must operate within.

**For auditors and conformance testing:** Section 14 is the compliance trace entry point. All 24 design rules are traced to their implementing sections.

---

## Document status and versioning

This specification is a **Working Draft**. All sections have been validated as `.docx` working drafts and are published here in their converted Markdown form. The specification will advance to Candidate Specification status following review by the founding consortium.

Sections marked **LAYER 4 PENDING** (design rules T-1-C and T-2-C) will be fully satisfied when the Layer 4 SDK Specification is complete.

::: info
Layer 3 depends on Layer 1. Implementers must be familiar with the [Architecture Specification](/spec/architecture), [Trust Chain Declaration Specification](/spec/trust-chain), and [Party Policy Declarations Specification](/spec/party-policy-declarations) before implementing Layer 3 runtime behaviour.
:::

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — March 2026*\
*Apache 2.0 — MyAuberge K.K.*
