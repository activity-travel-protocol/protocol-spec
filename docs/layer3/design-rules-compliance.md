# Design Rules Compliance Trace

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 14 | March 2026

| Field | Value |
|---|---|
| **Source document** | ATP_PreLayer3Review_v1 — 17 rules across T-1 through T-5 |
| **Rules traced** | 24 total: T-1-A through T-5-D (17), DoC-1 through SP-1 (7) |
| **Compliance status** | 21 SATISFIED, 1 PARTIALLY ADDRESSED, 2 LAYER 4 PENDING, 1 VACUOUSLY SATISFIED |

---

## 14.1 Purpose and scope

Before Layer 3 authoring began, five latent tensions between the existing Layer 1 specifications were identified and formally resolved in ATP_PreLayer3Review_v1 (the Pre-Layer 3 Consistency Review). That review produced 17 named design rules — T-1-A through T-5-D — that Layer 3 authors were required to follow. A further 7 design rules were produced during Layer 3 authoring itself (DoC-1 through SP-1, defined in Section 12). This section provides the compliance trace for all 24 rules.

The trace is bidirectional, organised into two tracks:

- **Track 1 — Tension Coverage Matrix (Section 14.3):** for each of the five pre-Layer 3 tensions, which sections of the specification address it and to what degree. Confirms that no tension is left partially or fully unresolved across the specification as a whole.
- **Track 2 — Rule Provenance Matrix (Section 14.4):** for each of the 24 named design rules, the tension it addresses, the section where it is satisfied, and its compliance status. Confirms that no rule is orphaned and no rule is violated.

Section 14.5 addresses the relationship between the pre-Layer 3 T-x rules and the Layer 3 DoC/CD/SP rules, confirming that the S12 rules extend the pre-Layer 3 model consistently and do not conflict with it.

Section 14.6 records the rules that are not fully satisfied within Layer 3 alone, and the forward references to Layer 4 or future specifications where they will be addressed.

> **Reading note:** Compliance status SATISFIED means the rule is fully addressed within the Layer 3 specification. PARTIALLY ADDRESSED means the Layer 3 specification addresses the substantive intent but a further step (typically Layer 4 SDK design) is required for complete enforcement. LAYER 4 PENDING means the rule is explicitly an SDK or runtime concern and Layer 3 cannot satisfy it alone. VACUOUSLY SATISFIED means the rule was not triggered because the condition it governs did not arise during Layer 3 authoring.

## 14.2 Design rule inventory

| Rule | Series | Statement (abbreviated) | Home Section | Status |
|---|---|---|---|---|
| **T-1-A** | T-1: DT Extensibility | DT enum is extensible; Layer 3 may define DT-7+ without a SAR. | Appendix A | **SATISFIED** |
| **T-1-B** | T-1: DT Extensibility | Every new DT must appear in the Decision Type Registry (Appendix A). | Appendix A | **SATISFIED** |
| **T-1-C** | T-1: DT Extensibility | Layer 1 validators must accept unknown DT values without error. | S9, Layer 4 | **LAYER 4 PENDING** |
| **T-2-A** | T-2: Sanitisation | Every AI agent step requires an explicit ASSEMBLY POINT (KERNEL) in BPMN. | S9 | **SATISFIED** |
| **T-2-B** | T-2: Sanitisation | No direct path from raw booking data to AI agent invocation. | S9 | **SATISFIED** |
| **T-2-C** | T-2: Sanitisation | Layer 4 SDK: atp-ai invocation interface accepts ContextPackage, not raw fields. | Layer 4 | **LAYER 4 PENDING** |
| **T-3-A** | T-3: identity_tier | Field access constraints reference Party-registered identity_tier_permissions. | S9 | **SATISFIED** |
| **T-3-B** | T-3: identity_tier | New TravelerContext fields in Layer 3 must specify minimum tier requirement. | — | **VACUOUSLY SATISFIED** |
| **T-3-C** | T-3: identity_tier | No state machine conditional logic may depend on Capability Catalogue content. | S3–S12 | **SATISFIED** |
| **T-4-A** | T-4: BOOKING_SUSPENDED | BOOKING_SUSPENDED is a parallel XState modifier, not a phase-level state. | S3, S5 | **SATISFIED** |
| **T-4-B** | T-4: BOOKING_SUSPENDED | Per-phase BOOKING_SUSPENDED entry/exit defined for all 8 phases. | S5 | **SATISFIED** |
| **T-4-C** | T-4: BOOKING_SUSPENDED | Exit requires Kernel re-assembly and OPA re-evaluation before agent actions. | S5 | **SATISFIED** |
| **T-4-D** | T-4: BOOKING_SUSPENDED | Audit trail records suspension_entered_at, reason, phase, DoC holder, resolution. | S5 | **SATISFIED** |
| **T-5-A** | T-5: HEM | HEM dispatch nodes appear in the Kernel swimlane of BPMN diagrams. | S6, S7 | **SATISFIED** |
| **T-5-B** | T-5: HEM | Every HEM invocation specifies: escalation_reason, confirmation token, secondary path. | S6, S7, S11, S12 | **SATISFIED** |
| **T-5-C** | T-5: HEM | Layer 3 does not prescribe handler_type. Trigger and gate only. | S6 | **SATISFIED** |
| **T-5-D** | T-5: HEM | ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED: highest-priority HEM, shortest deadline. | S4, S5, S6, S11 | **SATISFIED** |
| **DoC-1** | S12: Multi-Party | DoC transfer not complete until DUTY_OF_CARE_ACCEPTED recorded by receiving party. | S12 — 12.3.2 | **SATISFIED** |
| **DoC-2** | S12: Multi-Party | Both parties carry concurrent DoC obligations during the gap period. | S12 — 12.3.3 | **SATISFIED** |
| **DoC-3** | S12: Multi-Party | Host Party Security Kernel leads HEM when disruption occurs during DoC gap. | S12 — 12.7.3 | **SATISFIED** |
| **DoC-4** | S12: Multi-Party | Active Fulfilling Party owns TU chain operationally in multi-party TRAVELER_UNREACHABLE. | S12 — 12.7.4 | **SATISFIED** |
| **CD-1** | S12: Multi-Party | Coordination Delegation is a W3C VC 2.0 credential: two subjects, scoped, phase-bound. | S12 — 12.4.1 | **SATISFIED** |
| **CD-2** | S12: Multi-Party | Fulfilling Party may request delegation; Host Party must respond within CD_ISSUANCE_TIMEOUT. | S12 — 12.4.3 | **SATISFIED** |
| **SP-1** | S12: Multi-Party | Security Kernel enforces Synchronisation Point gates; unnamed components concurrent by default. | S12 — 12.5.1 | **SATISFIED** |

## 14.3 Track 1 — Tension coverage matrix

### T-1 — Decision Type coverage — DT enum extensibility

**Decision:** Option B adopted. DT enum is open-ended. DT-7+ may be defined in Layer 3 without amending the Context Package specification.

| Section | Rule(s) | Coverage provided | Status |
|---|---|---|---|
| **S8** | T-1-A, T-1-B | DT-4 AUTONOMOUS_INCIDENT_DECLARATION used with mandatory source_signal_reference, satisfying the DT-4 special-status constraint from T-1. Confirms the base DT set operates correctly in the disruption context. | **SATISFIED** |
| **S9** | T-1-A, T-1-B | DT routing table maps all six base DTs (DT-1 through DT-6) to authority scopes and assembly triggers per phase. Extensibility noted: DT-7+ values are routed to the AGENT_COORDINATE scope by default pending explicit registry entry. No DT-7+ values were required during Layer 3 authoring. | **SATISFIED** |
| **Appendix A** | T-1-A, T-1-B, T-1-C | Decision Type Registry defines the base set DT-1 through DT-6 with all required fields per T-1-B. Extensibility rule stated: DT-7+ entries follow the same schema. T-1-C noted as Layer 4 validator responsibility. | **SATISFIED** |

> **T-1 coverage:** T-1-C (Layer 1 validators accept unknown DT values) cannot be fully addressed within the Layer 3 specification. It is a runtime validator behaviour requirement. Layer 3 states the requirement; enforcement is Layer 4 SDK responsibility. See Section 14.6.

---

### T-2 — Kernel/user split — sanitisation boundary

**Decision:** The sanitisation dependency between atp-server (Context Package Assembly) and atp-ai (AI Agent Invocation) is an explicit normative cross-package contract.

| Section | Rule(s) | Coverage provided | Status |
|---|---|---|---|
| **S9** | T-2-A, T-2-B | S9 is the primary satisfaction point for T-2. The AI Agent Participation Model defines assembly points per phase as Kernel operations preceding USER-mode agent invocation (T-2-A). The Context Package is established as the mandatory intermediary between Booking Object data and agent invocation throughout (T-2-B). No direct data-to-agent path exists anywhere in S9. | **SATISFIED** |
| **S3–S8** | T-2-B | Every section that describes AI agent participation in state transitions references the Context Package as the agent's information source. No section provides a path that bypasses Context Package assembly. | **SATISFIED** |
| **S12** | T-2-A, T-2-B | S12 Section 12.6 specifies AI agent coordination authority in the multi-party context. The AGENT_COORDINATE scope and Context Package stale-handling rules confirm that the sanitisation boundary holds in multi-party coordination: an AI agent acting under a Coordination Delegation still receives only the assembled, signed Context Package. | **SATISFIED** |
| **Layer 4** | T-2-C | T-2-C requires that the atp-ai TypeScript invocation interface accepts ContextPackage, not raw field values, enforced at compile time. This is an SDK design constraint. Layer 3 states the requirement normatively; the TypeScript interface design is a Layer 4 deliverable. | **LAYER 4 PENDING** |

---

### T-3 — identity_tier forward-compatibility

**Decision:** identity_tier field access constraints are registration-driven, not hardcoded. New tiers may be introduced without breaking existing implementations.

| Section | Rule(s) | Coverage provided | Status |
|---|---|---|---|
| **S9** | T-3-A | The Context Package contents table (S9.2) explicitly references Party-registered identity_tier_permissions as the access control mechanism for TravelerContext fields. T-3-A is satisfied: no hardcoded tier-to-field mappings exist in S9; access is determined at runtime by the Party's registered permissions. | **SATISFIED** |
| **S3–S12** | T-3-C | No section of the Layer 3 state machine contains conditional logic that depends on Capability Catalogue content. Layer 3 references Capability Declarations only at the FEASIBILITY_CLEARED event level (S3.1.3) — the content of those declarations is outside Layer 3 scope. T-3-C is confirmed satisfied across all 12 main sections. | **SATISFIED** |
| **—** | T-3-B | T-3-B requires that any new TravelerContext fields introduced in Layer 3 specify their minimum identity_tier requirement. No new TravelerContext fields were introduced during Layer 3 authoring. The existing schema from Context Package Specification Step 6 is used without extension. T-3-B is vacuously satisfied. | **VACUOUSLY SATISFIED** |

---

### T-4 — BOOKING_SUSPENDED parallel state model

**Decision:** BOOKING_SUSPENDED is a parallel XState state modifier, not a sequential booking state.

| Section | Rule(s) | Coverage provided | Status |
|---|---|---|---|
| **S3** | T-4-A | S3.8 explicitly classifies BOOKING_SUSPENDED as a parallel state modifier, not a sequential active state. The state inventory table in S3.0 marks BOOKING_SUSPENDED as class "Parallel modifier". T-4-A satisfied. | **SATISFIED** |
| **S5** | T-4-A, T-4-B, T-4-C, T-4-D | S5 is the primary satisfaction section for all four T-4 rules. T-4-B: the per-phase table in S5.4 covers all eight journey phases with explicit entry action sets and exit paths. T-4-C: S5.5 specifies that Context Package re-assembly and OPA re-evaluation are required on Path B and Path C exit. T-4-D: S5.6 provides the mandatory audit trail field list for BOOKING_SUSPENDED entry and exit events. | **SATISFIED** |

---

### T-5 — Human Escalation Manager mandatory presence

**Decision:** A registered HEM handler is a mandatory condition for Party registration. The Security Kernel gates all execution-blocking transitions on HEM invocation. The highest-priority invocation (ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED) has the shortest protocol deadline.

| Section | Rule(s) | Coverage provided | Status |
|---|---|---|---|
| **S6** | T-5-A, T-5-B, T-5-C | S6 is the primary satisfaction section for T-5-A, T-5-B, and T-5-C. T-5-A: all 23 HEM catalogue entries specify the Kernel swimlane placement of dispatch nodes. T-5-B: every entry specifies escalation_reason, human_confirmation_token requirement, and secondary path. T-5-C: S6.1 explicitly states that the protocol does not prescribe handler_type. | **SATISFIED** |
| **S4, S5** | T-5-D | T-5-D is satisfied jointly by S4.5.5 (ACTIVITY_FULFILLMENT duty-of-care level CRITICAL, shortest permitted protocol_deadline), S5.4 (ACTIVITY_FULFILLMENT entry action set — immediate DoC transfer, simultaneous triple-party notification), and S5 generally (BOOKING_SUSPENDED as absolute halt). | **SATISFIED** |
| **S7, S11, S12** | T-5-B | Supporting satisfaction across all 23 HEM entries. S7 specifies HEM connections for all TU sub-categories. S11 consolidates all protocol_deadline values. S12 adds DoC gap escalation paths. | **SATISFIED** |

---

## 14.4 Track 2 — Rule provenance matrix

The full rule provenance is recorded in the inventory table in Section 14.2. This section provides narrative confirmation for the three rules that are not fully satisfied within Layer 3 alone, and the one vacuously satisfied rule.

### Narrative: T-1-C — LAYER 4 PENDING

T-1-C requires that Layer 1 validators accept unknown DT values without error. This is a runtime behaviour requirement on the validator component that ships with the SDK. Layer 3 states the requirement normatively in Appendix A Section A.3.1 ("Layer 1 validators must accept unknown DT values without error"). Enforcement is a TypeScript SDK design concern: the validator must use an open enum pattern (or equivalent) rather than a closed switch statement for DT values. This is a Layer 4 deliverable. Layer 3 is fully compliant with T-1-C to the extent that a specification layer can be — the requirement is stated; its implementation is Layer 4's responsibility.

### Narrative: T-2-C — LAYER 4 PENDING

T-2-C requires that the atp-ai TypeScript invocation interface accepts a ContextPackage object rather than raw field values, enforced at compile time as a type error. This is an SDK interface design constraint. Layer 3 states the requirement normatively in S9.1.3. The TypeScript interface signature (`invoke(context: ContextPackage): Promise<DecisionObject>`) is a Layer 4 deliverable. Layer 3 is fully compliant with T-2-C to the extent that a specification layer can be.

### Narrative: T-3-B — VACUOUSLY SATISFIED

T-3-B requires that any new TravelerContext fields introduced in Layer 3 must specify their minimum identity_tier requirement. During the entire Layer 3 authoring process, no new TravelerContext fields were introduced. The TravelerContext schema as defined in Context Package Specification Step 6 is used unchanged. T-3-B is vacuously satisfied: the rule applies to a class of events (new field introductions) that did not occur during Layer 3 authoring. The rule remains active for future Layer 3 amendments that introduce TravelerContext fields.

## 14.5 Relationship between T-x rules and S12 DoC/CD/SP rules

The seven S12 design rules (DoC-1 through SP-1) were produced during Layer 3 authoring and were not part of the Pre-Layer 3 Consistency Review. They address coordination mechanics that only arise in multi-party bookings and were not foreseeable at the tension-resolution stage.

The S12 rules extend the pre-Layer 3 model in the following ways:

- **DoC-1 and DoC-2** extend the duty-of-care transfer model established by T-4 (BOOKING_SUSPENDED parallel state). The concurrent obligation window introduced by DoC-2 is consistent with T-4-A: duty of care holder is always tracked and recorded.
- **DoC-3 and DoC-4** extend the HEM model established by T-5. The Host Party adjudication step (DoC-3) is consistent with T-5-B's requirement that escalation ownership is unambiguous before HEM proceeds.
- **CD-1 and CD-2** introduce the Coordination Delegation mechanism. This mechanism is consistent with the Layer 1 Trust Chain model and does not conflict with any T-1 through T-5 rule.
- **SP-1** introduces Synchronisation Points. These are Kernel-mode gates consistent with the Security Kernel's non-bypassable character established throughout the specification.

No S12 rule conflicts with any T-1 through T-5 rule. All seven S12 rules are satisfied within Section 12.

## 14.6 Forward references for unsatisfied rules

| Rule | Status | Forward reference |
|---|---|---|
| T-1-C | LAYER 4 PENDING | Layer 4 SDK — atp-validator package. Validator must use open enum pattern for DT values. Required at SDK v1.0 release. |
| T-2-C | LAYER 4 PENDING | Layer 4 SDK — atp-ai package. Invocation interface TypeScript signature: `invoke(context: ContextPackage): Promise<DecisionObject>`. Raw string parameters are a compile-time type error. Required at SDK v1.0 release. |

Both LAYER 4 PENDING rules are SDK design constraints, not specification ambiguities. Layer 3 is unambiguous on both requirements. The pending status reflects that TypeScript interface enforcement can only be demonstrated in the Layer 4 deliverable, not in this specification text.

**Overall compliance verdict:** 21 of 24 design rules are SATISFIED within Layer 3. T-1-C and T-2-C are LAYER 4 PENDING (SDK enforcement). T-3-B is VACUOUSLY SATISFIED. No rule is violated. No rule is orphaned.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 14 — March 2026*
