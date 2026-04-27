# Pre-Layer 3 Consistency Review

**Activity Travel Protocol**
Working Note — March 2026

> **Document Status:** Working Note
> This document records pre-specification consistency analysis completed before Layer 3 authoring. Layer 3 is now complete and published. The tensions documented here (T-1 through T-5) were resolved during Layer 3 authoring. This document is retained for transparency and cross-reference.

---

## Purpose

Before writing Layer 3, five latent tensions between existing specifications were identified and formally resolved. This document states each tension precisely, analyses alternatives, records the decision, and states the design rules that Layer 3 must follow.

No existing Layer 1 decisions are reopened. All resolutions are additive design rules or forward-compatibility constraints.

---

## Tension Summary

| ID | Tension | Decision | Layer 3 Rule |
|----|---------|----------|--------------|
| T-1 | DT enum (DT-1–DT-6) coverage | Open-ended extensible enum | DT-7+ may be defined in Layer 3 without amending Layer 1 |
| T-2 | Kernel/user split vs. SDK package split | Explicit sanitisation boundary documented as normative | atp-ai always receives sanitised Context Package from atp-server |
| T-3 | identity_tier forward-compatibility | Option B: Party declares permitted fields at registration | Kernel enforces Party declaration, not Capability Catalogue |
| T-4 | BOOKING_SUSPENDED per phase | Cross-cutting modifier, not a phase state | Layer 3 specifies per-phase behaviour for all 8 phases |
| T-5 | Human Escalation Manager: non-bypassable USER-mode | Windows driver model: mandatory registration, flexible implementation | Kernel enforces handler registration and dispatch gate |

---

## T-1 — Decision Type Coverage

### Tension

The Context Package specification defines six Decision Types (DT-1 through DT-6). Layer 3 will introduce workflow phases and disruption scenarios that may require additional action types. If the DT set is treated as a closed enum, Layer 3 authors cannot add DTs without reopening the Layer 1 Context Package specification.

### Existing Decision Types

| DT | Name | Description |
|----|------|-------------|
| DT-1 | INFORMATION_PROVISION | Agent provides information without proposing a state change |
| DT-2 | CONFIGURATION_SUGGESTION | Agent proposes an activity configuration change for human approval |
| DT-3 | BOOKING_NEGOTIATION | Agent proposes a multi-party negotiation step |
| DT-4 | AUTONOMOUS_INCIDENT_DECLARATION | Agent declares a disruption incident autonomously |
| DT-5 | HUMAN_ESCALATION_REQUEST | Agent requests human intervention explicitly |
| DT-6 | COMPLETION_ACKNOWLEDGEMENT | Agent acknowledges successful completion |

### Decision: CLOSED

**Option B adopted.** The DT enum is open-ended. DT-1 through DT-6 are the Layer 1 base set. Layer 3 may define DT-7 and beyond without amending the Context Package specification.

All new DT values defined in Layer 3 must appear in the Decision Type Registry (Layer 3 Appendix A). They inherit all base schema requirements. DT-4's mandatory `source_signal_reference` requirement applies to any DT carrying autonomous incident semantics.

### Layer 3 Rules

- **T-1-A:** The DT enum carries implicit x-extensible semantics. Layer 3 may define DT-7+ without a SAR.
- **T-1-B:** Every new DT must appear in the Layer 3 Decision Type Registry (Appendix A), specifying: DT identifier, name, authority_scope required, source_signal_reference mandatory flag, and assembly trigger.
- **T-1-C:** Layer 1 validators must accept unknown DT values without error.

---

## T-2 — Kernel/User Split vs. SDK Package Split

### Tension

The Security Kernel declares CUSTOMER_INPUT sanitisation as non-bypassable. The `atp-ai` package is where AI agent invocation logic lives. No document explicitly states the sanitisation dependency across the atp-ai / atp-server boundary — creating the risk that an implementation of `atp-ai` could call an AI model provider directly, bypassing the sanitisation pipeline.

### The Sanitisation Dependency Chain
### Decision: CLOSED

The sanitisation dependency between `atp-server` and `atp-ai` is an explicit, normative design rule. `atp-ai` MUST NOT invoke an AI model provider with raw field values from any CUSTOMER_INPUT or TRAVELER_PII classified field.

**Enforcement:** `atp-ai`'s AI provider call interface accepts a `ContextPackage` object (the signed JSON output of `atp-server`), not raw strings. Passing raw strings is a TypeScript compile-time type error.

### Layer 3 Rules

- **T-2-A:** Every state transition requiring AI agent participation must include an explicit ASSEMBLY POINT node (KERNEL operation) in the BPMN diagram, preceding the USER-mode agent invocation.
- **T-2-B:** No direct path from raw booking data to AI agent invocation. The Context Package is the mandatory intermediary.
- **T-2-C:** Layer 4 SDK: `atp-ai` invocation interface accepts `ContextPackage`, not raw field values.

---

## T-3 — identity_tier Forward-Compatibility

### Tension

`TravelerContext.identity_tier` constrains which Context Package fields are assembled for a traveler. The field-level permissions were expected to reference the Capability Catalogue — a Layer 2 artifact not yet written. If Layer 3 required Layer 2 to exist, the correct specification sequencing (Layer 3 before Layer 2) would be blocked.

### Identity Tier Definitions

| Tier | Verification | Field Access |
|------|-------------|--------------|
| T1 | Name + contact (self-asserted) | First name, last name, contact_reference only. No document fields. |
| T2 | Government ID verified | T1 fields plus: identity_document_type, document_number (masked), nationality, date_of_birth |
| T3 | Biometric / multi-factor | T2 fields plus: biometric_reference, secondary_document_type |

### Decision: CLOSED

**Option B adopted.** Each Party, at registration time, declares the field set permitted for each identity_tier in its Party Policy Declaration. The Security Kernel enforces what the Party declared — not what a future Capability Catalogue says.

The Capability Catalogue (Layer 2), when written, provides a recommended field set per tier. The Catalogue is advisory; the Party's declaration is normative. A Party may be more restrictive than the baseline; a Party may not be less restrictive.

### Layer 3 Rules

- **T-3-A:** Field access constraints reference Party-registered `identity_tier_permissions`, not the Capability Catalogue.
- **T-3-B:** New TravelerContext fields defined in Layer 3 must specify minimum tier requirement (T1/T2/T3).
- **T-3-C:** No state machine conditional logic may depend on Capability Catalogue content.

---

## T-4 — BOOKING_SUSPENDED Across Journey Phases

### Tension

SAR-16 added BOOKING_SUSPENDED to the state machine. Neither SAR-16 nor SAR-17 specifies how BOOKING_SUSPENDED interacts with the eight journey phases. Suspension during PRE_DEPARTURE is low urgency; suspension during ACTIVITY_FULFILLMENT requires immediate duty of care handoff. Without per-phase specification, Layer 3 authors have no guidance.

### Key Insight: BOOKING_SUSPENDED is a Cross-Cutting Modifier

Example: { phase: ACTIVITY_FULFILLMENT, booking_state: BOOKING_SUSPENDED }
```

The booking retains its current journey phase when suspended. Phase context is preserved for correct resumption.

### Per-Phase Behaviour

| Phase | Duty of Care | Exit Path |
|-------|-------------|-----------|
| PRE_DEPARTURE | None | Admin resolution → INQUIRY or CONFIRMED |
| OUTBOUND_TRANSIT | MODERATE | Human escalation required before resumption |
| ARRIVAL | MODERATE | Human escalation required before resumption |
| IN_DESTINATION | HIGH | Human escalation mandatory; DoC passes to host Party |
| ACTIVITY_FULFILLMENT | CRITICAL | Human Escalation Manager mandatory; DoC passes to fulfilling Party |
| RETURN_TRANSIT | HIGH | Human escalation required; DoC transfer tracked |
| RETURN_ARRIVAL | MODERATE | Admin resolution → COMPLETION or CANCELLED_SUSPENDED |
| COMPLETION | LOW | Admin resolution → BOOKING_CANCELLED_SUSPENDED (terminal) |

### Decision: CLOSED

BOOKING_SUSPENDED is confirmed as a cross-cutting state modifier. For phases IN_DESTINATION, ACTIVITY_FULFILLMENT, and RETURN_TRANSIT, entry into BOOKING_SUSPENDED triggers an automatic Duty of Care transfer notification — a KERNEL operation.

### Layer 3 Rules

- **T-4-A:** BOOKING_SUSPENDED is modelled as a parallel state in the XState machine, not a phase-level state.
- **T-4-B:** For each of the 8 journey phases, Layer 3 must define: (i) BOOKING_SUSPENDED entry action set, (ii) Duty of Care obligation level, (iii) mandatory or recommended HEM invocation, (iv) exit paths.
- **T-4-C:** BOOKING_SUSPENDED exit requires Kernel re-assembly of the Context Package and Cedar re-evaluation before autonomous agent actions resume.
- **T-4-D:** Audit trail must record: `suspension_entered_at`, `suspension_reason`, `current_phase`, `duty_of_care_holder`, and resolution timestamp.

---

## T-5 — Human Escalation Manager: Non-Bypassable USER-Mode

### Tension

The OS model classifies the Human Escalation Manager (HEM) as USER-mode — implementers choose their escalation mechanism. But in Trust Unit chains, HEM is treated as non-bypassable. If HEM is USER-mode, what exactly is the kernel enforcing?

### Resolution: The Windows Driver Model

The kernel does not prescribe what the HEM does internally. It requires that a registered escalation handler exists, records a dispatch receipt when invoked, and gates execution until the escalation is resolved. Handler registration is verified at Party registration time — an implementation without a registered handler fails registration.

### What the Kernel Enforces vs. Does Not Enforce

| Kernel DOES enforce | Kernel does NOT enforce |
|--------------------|------------------------|
| A registered HEM handler exists in Party Policy Declaration | The channel used (email, Slack, in-app, AI agent) |
| The handler was dispatched (`escalation_dispatched_at` recorded) | Time the human reads or acts on escalation |
| No autonomous action proceeds while escalation is pending | Content or format of the notification |
| The escalation is marked resolved before execution resumes | Whether resolution is human-manual or AI-assisted |
| HEM invocation recorded in audit trail | What confirmation UI the implementer uses |
| `human_confirmation_token` present where required | Whether the handler is a person, AI agent, or workflow |

### Decision: CLOSED

HEM is USER-mode in implementation but kernel-gated in invocation. The kernel enforces: (1) a registered handler exists; (2) the handler is dispatched when triggered; (3) no execution-gated action proceeds until `escalation_resolved_at` is recorded.

`PartyPolicyDeclaration` must include an `escalation_handler` registration with: `handler_ref`, `handler_endpoint` (URI), and `handler_type` (enum: HUMAN_DIRECT | AI_AGENT | AUTOMATED_WORKFLOW). Registration is rejected if absent.

### Layer 3 Rules

- **T-5-A:** HEM dispatch nodes appear in the Kernel swimlane of BPMN diagrams.
- **T-5-B:** For every HEM invocation: specify `escalation_reason`, whether `human_confirmation_token` is required, and the secondary escalation path if handler unreachable.
- **T-5-C:** Layer 3 must not prescribe `handler_type`. State machine specifies trigger and gate only.
- **T-5-D:** ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED is the highest-priority HEM invocation. Layer 3 must give it explicit treatment with the shortest permitted `protocol_deadline`.

---

## Layer 3 Readiness

All five tension points are resolved. All pre-conditions for Layer 3 authoring are satisfied:

| Pre-condition | Status |
|--------------|--------|
| Layer 1 Identity and Trust complete and published | Done |
| Context Package specification at Step 6 (SAR-1 through SAR-21) | Done |
| Security Architecture specification complete | Done |
| Standards Landscape Review A complete | Done |
| T-1 through T-5 resolved | Done |

## Consolidated Design Rules

| Rule | Statement | Origin |
|------|-----------|--------|
| T-1-A | DT enum is extensible. Layer 3 may define DT-7+ without a SAR. | T-1 |
| T-1-B | Every new DT must appear in the Layer 3 Decision Type Registry. | T-1 |
| T-1-C | Layer 1 validators must accept unknown DT values without error. | T-1 |
| T-2-A | Every AI agent participation step requires an ASSEMBLY POINT node (KERNEL) in BPMN. | T-2 |
| T-2-B | No direct path from raw booking data to AI agent invocation. | T-2 |
| T-2-C | Layer 4 SDK: atp-ai accepts ContextPackage, not raw field values. | T-2 |
| T-3-A | Field access references Party-registered identity_tier_permissions. | T-3 |
| T-3-B | New TravelerContext fields must specify minimum tier requirement. | T-3 |
| T-3-C | No state machine logic may depend on Capability Catalogue content. | T-3 |
| T-4-A | BOOKING_SUSPENDED is a parallel state (XState), not a phase-level state. | T-4 |
| T-4-B | Per-phase BOOKING_SUSPENDED behaviour specified for all 8 phases. | T-4 |
| T-4-C | BOOKING_SUSPENDED exit requires Kernel re-assembly and Cedar re-evaluation. | T-4 |
| T-4-D | Audit trail records: suspension timestamps, phase, DoC holder, resolution. | T-4 |
| T-5-A | HEM dispatch nodes in the Kernel swimlane of BPMN diagrams. | T-5 |
| T-5-B | Per HEM invocation: specify escalation_reason, token requirement, secondary path. | T-5 |
| T-5-C | Layer 3 must not prescribe handler_type. | T-5 |
| T-5-D | ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED: highest-priority HEM, shortest deadline. | T-5 |

## Open Questions Carried to Layer 3

- **OQ-L3-1:** Live availability vs. static Capability Declaration — Layer 2 or Layer 3? Resolve at Layer 3 INQUIRY state design.
- **OQ-L3-2:** Conference / MICE workflow — distinct state machine variant? Resolve after Layer 3 first draft.
- **OQ-L3-3:** Does any Layer 3 inter-agent message format need to be A2A-compatible now?
- **OQ-SL-1:** CAAM formal Trust Chain ↔ act-claim mapping document — author as Layer 3 Security appendix or standalone technical note?

---

*Activity Travel Protocol — Pre-Layer 3 Consistency Review — Working Note — March 2026*
*Content to be absorbed into Layer 3 Workflow Specification upon ratification.*
