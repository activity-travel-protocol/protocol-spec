# Appendix A: Decision Type Registry

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Appendix A | March 2026

---

This appendix is the normative registry of Decision Types defined in the Activity Travel Protocol Layer 3 Workflow Specification. It satisfies design rules **T-1-A** and **T-1-B** established in the Pre-Layer 3 Consistency Review.

Section A.1 defines the base set of Decision Types (DT-1 through DT-6). Section A.2 defines the Authority Scope Registry, listing all scope values that may appear in an AgentAuthorityDeclaration. Section A.3 specifies the rules governing extensibility of both registries.

> **Normative status:** All entries in this appendix are normative. Implementations claiming conformance to the Activity Travel Protocol Layer 3 Workflow Specification must support all DT values and scope values defined here. Sections A.1 and A.2 may only be extended, never narrowed — no entry in the base set may be removed or have its required fields reduced.

## A.1 Decision Type Registry — base set

The following table is the normative registry of DT-1 through DT-6. These are the Layer 1 base set established in the Context Package Specification Step 6. All six Decision Types are active in Layer 3 v1.0. No DT-7 or higher value is defined in this version of the specification.

| DT | Name | Description | Authority scope required (minimum) | source_signal_reference mandatory? | Human confirmation required? | Assembly trigger |
|---|---|---|---|---|---|---|
| **DT-1** | INFORMATION_PROVISION | Agent provides information, status updates, or query responses without proposing any state change to the Booking Object. | INFORMATION_PROVISION (minimum) | No | No — information provision does not change state. | Any phase. No phase restriction. |
| **DT-2** | CONFIGURATION_SUGGESTION | Agent proposes a booking configuration change or itinerary adjustment. Proposal is queued; no execution occurs until the Booking Party confirms. | CONFIGURATION_SUGGESTION (minimum) | No | Yes — Booking Party human_confirmation_token required before execution. | Pre-journey phases (INQUIRY, CONFIRMED, PRE_DEPARTURE) and DISRUPTION_REVIEW. See S9.2 phase table for permitted phases. |
| **DT-3** | BOOKING_NEGOTIATION | Agent proposes initiation of a multi-party negotiation step. All affected Parties are notified via IPC. OPA evaluates policy constraints on the negotiation. Gate on all Party confirmations before execution. | NEGOTIATION | No | Yes — gate on all affected Party confirmations before execution. OPA evaluation required. | Phases where two or more Fulfilling Parties have active Activity Components. Typically IN_DESTINATION and ACTIVITY_FULFILLMENT with multi-party bookings. |
| **DT-4** | AUTONOMOUS_INCIDENT_DECLARATION | Agent autonomously declares a disruption incident. The C1 reversal window (PT15M) is opened immediately. Reversible downstream actions are held. Booking Object enters DISRUPTION_REVIEW on C1 expiry or explicit confirmation. | DISRUPTION_RESPONSE | Yes — source_signal_reference must resolve to an event log entry for this booking_id. Missing or unresolvable reference: Decision Object rejected. | No for incident declaration (within C1 window). Yes for downstream irreversible actions. | Active travel phases: OUTBOUND_TRANSIT, ARRIVAL, IN_DESTINATION, ACTIVITY_FULFILLMENT, RETURN_TRANSIT. See S9.2. |
| **DT-5** | HUMAN_ESCALATION_REQUEST | Agent explicitly requests human intervention. The Human Escalation Manager (HEM) is invoked immediately with the agent's escalation_reason and reasoning. All autonomous actions are gated until escalation_resolved_at is recorded. | Any scope (minimum: INFORMATION_PROVISION) | No | N/A — the decision type is itself a request for human action. HEM invocation is the protocol response. | Any phase. No phase restriction. human_escalation_requested: true in the Decision Object also triggers this path regardless of DT value. |
| **DT-6** | COMPLETION_ACKNOWLEDGEMENT | Agent acknowledges successful completion of a phase or the full booking lifecycle. Triggers the JOURNEY_COMPLETED gate check (S4). If all gate conditions are met, the Kernel advances the Booking Object to COMPLETION state. | Any scope (minimum: INFORMATION_PROVISION) | No | No — acknowledgement itself is not a state-changing proposal requiring human confirmation. Gate conditions for JOURNEY_COMPLETED are evaluated by the Kernel, not the agent. | RETURN_ARRIVAL and COMPLETION phases only. |

> **DT-4 and source_signal_reference:** The mandatory source_signal_reference requirement for DT-4 is not extensible to other Decision Types by default. Any DT defined at DT-7 or higher that carries autonomous incident semantics — meaning the agent may take an action that triggers a reversal window or suspends downstream execution — must also declare source_signal_reference as mandatory in its registry entry. This requirement derives from DOR-5 (Context Package Specification Step 6 Section 1.4) and cannot be waived by a Layer 3 registry entry.

> **Out-of-scope proposals:** When a Decision Object's proposed_action falls outside the agent's registered authority scope, the Kernel does not reject the Decision Object with an error. It invokes HEM with escalation_reason: OUT_OF_SCOPE_PROPOSAL. This is a normal protocol path. Implementations must not treat OUT_OF_SCOPE_PROPOSAL as a monitoring error condition.

## A.2 Authority Scope Registry

The following table is the normative registry of all authority scope values recognised by the Activity Travel Protocol Layer 3 Workflow Specification. These are the scope values that may appear in an agent's AgentAuthorityDeclaration at registration time (Context Package Specification Step 6, Section 3.1). The Kernel validates scope at every ASSEMBLY POINT. Declared scope at registration is the ceiling; it cannot be elevated at runtime.

Five scopes (INFORMATION_PROVISION, CONFIGURATION_SUGGESTION, DISRUPTION_RESPONSE, CORPORATE_ACCOUNT, BUSINESS_GROUP_LEAD) are defined in S9.4. Two coordination scopes (AGENT_COORDINATE, AGENT_ESCALATE) are defined in S12.8.1. One scope (NEGOTIATION) is carried forward from the Pre-Layer 3 Consistency Review Section 1.2, where it was established as the required scope for DT-3 BOOKING_NEGOTIATION.

| Scope value | Permitted DTs | Typical use case | Human confirmation rules | Defined in | Notes |
|---|---|---|---|---|---|
| **INFORMATION_PROVISION** | DT-1 only | Customer-facing assistant; status and query bot. | No confirmation required. DT-1 does not change state. | S9.4 | Lowest authority scope. Suitable for public-facing or read-only agents. Cannot propose state changes. |
| **CONFIGURATION_SUGGESTION** | DT-1, DT-2 | Booking assistant during INQUIRY and CONFIRMED phases. | All DT-2 proposals require Booking Party human_confirmation_token before execution. | S9.4 | Superset of INFORMATION_PROVISION. Agent may propose changes but may not execute them autonomously. |
| **NEGOTIATION** | DT-1, DT-3 | Multi-party negotiation agent in bookings with two or more Fulfilling Parties. | All DT-3 proposals gate on all affected Party confirmations and OPA evaluation before execution. | Pre-Layer 3 Review Section 1.2 | Permits initiation of multi-party negotiation steps. Does not include CONFIGURATION_SUGGESTION authority — an agent holding NEGOTIATION scope but not CONFIGURATION_SUGGESTION may not propose DT-2 actions. |
| **DISRUPTION_RESPONSE** | DT-1, DT-2, DT-4 | Operations agent during active travel phases. | DT-4 declaration: no confirmation required within C1 window. DT-2 proposals: yes, Booking Party confirmation required. | S9.4 | Highest autonomous authority in the base set. Permits autonomous incident declaration (DT-4). The C1 reversal window provides a 15-minute human override opportunity for every DT-4 action. |
| **CORPORATE_ACCOUNT** | DT-1, DT-2 (on behalf of TravelerGroup where decision_authority = CORPORATE_ACCOUNT) | Corporate travel manager agent acting on behalf of a defined traveler group. | Yes for booking changes. Group decisions surfaced to corporate account holder. | S9.4 | The corporate account Party must hold a registered AgentAuthorityDeclaration with CORPORATE_ACCOUNT scope. Absence is a blocking registration error (TDI-Q3). |
| **BUSINESS_GROUP_LEAD** | DT-1, DT-2 (for all members of a TravelerGroup with CORPORATE_ACCOUNT decision_authority, per SAR-11) | Senior corporate account agent with group-wide authority. | Yes for booking changes affecting multiple travelers. | S9.4 | Superset of CORPORATE_ACCOUNT. Permits group-wide DT-2 actions. Requires explicit scope declaration at registration — CORPORATE_ACCOUNT scope alone is insufficient. |
| **AGENT_COORDINATE** | DT-1, DT-2; plus coordination actions: DUTY_OF_CARE_TRANSFER_INITIATED (with human confirmation), DUTY_OF_CARE_ACCEPTED (with human confirmation), COORDINATION_DELEGATION_REQUESTED (no confirmation — request only), PENDING_SYNCHRONISATION release trigger (no confirmation — Kernel gate evaluation) | AI agent acting for a Fulfilling Party in a multi-party booking coordination context. | See S12.8.1 per-action table. DoC transfer actions require confirmation. Coordination delegation requests do not (issuance is Host Party only). | S12.8.1 | Multi-party coordination scope defined in S12. Does not extend the agent's DT authority ceiling — it extends the operational context within which the agent's existing DT scope applies under an active Coordination Delegation. |
| **AGENT_ESCALATE** | DT-1; plus: HEM_INVOCATION_REQUESTED during DoC gap period (no confirmation — emergency escalation is agent-autonomous within scope) | Agent requiring emergency escalation authority during a Duty of Care gap period. | No — emergency escalation during DoC gap is agent-autonomous within this scope. | S12.8.1 | Narrow scope for emergency escalation in multi-party disruption contexts. An agent holding only AGENT_ESCALATE may not perform coordination or booking actions. |

> **Scope ceiling is registration-time only:** An agent's authority scope is fixed at registration. Runtime conditions — including active Coordination Delegations, disruption state, or Booking Party instruction — cannot elevate scope above the registered ceiling. An agent that needs higher authority for a specific situation must either be re-registered with the appropriate scope, or must submit a DT-5 HUMAN_ESCALATION_REQUEST so that a human principal may act at the required authority level.

> **Scope combinations:** An agent registration may declare exactly one scope value. Scope values are not combinable at registration time. The scope hierarchy (where a higher scope permits the DTs of all lower scopes) is defined per scope entry above, not by a general inclusion rule. Implementations must not infer scope permissions beyond what is stated in this registry.

## A.3 Extensibility rules

### A.3.1 Decision Type extensibility

The Decision Type enum carries implicit extensibility semantics (design rule **T-1-A**). Layer 3 and subsequent specification layers may define DT-7 and beyond without amending the Context Package Specification Step 6 and without raising a Specification Amendment Request.

Every new Decision Type defined in any layer of the Activity Travel Protocol must satisfy the following requirements (design rule **T-1-B**):

- The DT must be assigned a unique numeric identifier (DT-7, DT-8, ...) in strict sequence with no gaps.
- The DT must appear in this registry (Appendix A, Section A.1) with all required fields: DT identifier, name, description, authority scope required (minimum), source_signal_reference mandatory flag, human confirmation required, and assembly trigger.
- The DT must inherit all base schema requirements from the Context Package Specification Step 6: proposed_action (enum), reasoning, confidence, alternatives_considered, human_escalation_requested. No new DT may remove or narrow a required base field.
- If the new DT carries autonomous incident semantics — meaning the agent may take an action that opens a reversal window or suspends downstream execution — source_signal_reference must be declared mandatory in the registry entry, consistent with the DT-4 rule derived from DOR-5.

Layer 1 validators must accept unknown DT values without error (design rule **T-1-C**). Strict validation that rejects unknown DT values is a Layer 3 or higher validator behaviour.

### A.3.2 Authority scope extensibility

New scope values may be defined in Layer 3 or higher specification layers. Every new scope value must appear in this registry (Appendix A, Section A.2) with all required fields: scope value, permitted DTs, typical use case, human confirmation rules, and the specification section in which it is defined.

New scope values must not remove or narrow the permitted DTs of any existing scope value. Scope values are non-retractable once published: a scope value present in a ratified version of this registry may not be removed in subsequent versions, only deprecated with a successor scope noted.

Scope values defined in lower layers (Layer 1, Layer 2) that are used in Layer 3 contexts must be listed in this registry with a cross-reference to their defining document. The NEGOTIATION scope is an example of this pattern: it was established before Layer 3 authoring began and is listed here with a reference to the Pre-Layer 3 Consistency Review.

### A.3.3 Registry governance

This registry is a normative appendix of the Layer 3 Workflow Specification. Amendments require a versioned update to this specification. No mechanism exists to extend either registry by implementation-specific declaration outside of the specification publication process.

The registry does not define a testing or certification process for new Decision Types or scope values. Conformance testing provisions are a Layer 4 concern.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Appendix A — March 2026*
