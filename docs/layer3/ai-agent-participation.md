# AI Agent Participation Model

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 9 | April 2026

---

AI agent participation is a first-class architectural requirement of the Activity Travel Protocol — not an extension. This section specifies the complete model by which AI agents participate in the booking lifecycle: how they receive context, what decisions they may make, how those decisions are validated, and what happens when they exceed their authority or cannot reach a decision.

The model is built on four components: the ASSEMBLY POINT (where the Kernel prepares context for agent invocation), the Context Package (what the agent receives), the Decision Object (what the agent returns), and the authority scope validation (what the Kernel does with the response). These four components are specified in the Context Package Specification Step 6 as protocol schemas. This section specifies how they operate within the Layer 3 workflow.

> **AI provider agnosticism:** The protocol imposes no constraint on AI provider, model, or inference infrastructure. Any model accepting structured JSON input and returning structured JSON output conforming to the Decision Object schema is compatible. Provider choice is application responsibility.

## 9.1 The ASSEMBLY POINT

### 9.1.1 Definition

An ASSEMBLY POINT is a mandatory Kernel operation that precedes every AI agent invocation in the protocol. It appears in the KERNEL swimlane of every BPMN diagram that includes agent participation. No agent invocation may occur without a preceding ASSEMBLY POINT.

> **T-2-A:** Every state transition requiring AI agent participation must include an explicit ASSEMBLY POINT node (Kernel operation) in the BPMN diagram, preceding the USER-mode agent invocation.
>
> **T-2-B:** No direct path from raw booking data to AI agent invocation exists anywhere in this specification.

### 9.1.2 What the ASSEMBLY POINT does

At an ASSEMBLY POINT, the Security Kernel:

- **Authenticates** the requesting Party and validates their authority to invoke an agent for this operation.
- **Assembles the Context Package** — collecting current Booking Object state, applicable policy set (ODRL), feasibility constraints, decision history, and TravelerContext — from authoritative sources.
- **Applies the CUSTOMER_INPUT sanitisation pipeline** to all fields carrying x-data-classification: CUSTOMER_INPUT (strip HTML, normalise Unicode, enforce maxLength, detect prompt injection patterns). Sanitisation is non-bypassable.
- **Applies TRAVELER_PII access rules** — assembles only the TravelerContext fields permitted by the Party's registered identity_tier_permissions at the declared identity_tier. No T2/T3 fields are included for an agent operating at a scope that does not require them.
- **Applies location_disclosure_blocked** — if TU-6 is active, any assembly that would expose traveler location, accommodation, or itinerary fields is blocked regardless of authority scope.
- **Signs the assembled Context Package** (ES256, FAPI 2.0 profile) and records context_package_assembled_at in the event log.
- **Passes the signed Context Package** to the atp-ai invocation interface.

### 9.1.3 The sanitisation boundary

The atp-ai package's AI provider call interface accepts a ContextPackage object — the signed JSON output of atp-server — not raw strings. Passing raw field values from any CUSTOMER_INPUT or TRAVELER_PII classified field directly to an AI model provider is a protocol violation.

> **T-2-C:** Layer 4 SDK: atp-ai invocation interface accepts ContextPackage, not raw field values. Passing raw strings is a TypeScript compile-time type error.

> **DR-v5 RULE 3 — OPA policy boundary (normative):** AI agents receive evaluated policy results in their Context Package — never raw ODRL policy declarations for the agent to interpret. OPA evaluation occurs before Context Package assembly: the Security Kernel compiles Party ODRL declarations to Rego at registration time and evaluates the compiled policy set at the ASSEMBLY POINT. The evaluated policy outcomes (permitted actions, constraints, overrides) are included in the assembled Context Package as structured fields. No raw ODRL is passed to any agent at any participation level. This boundary is non-bypassable.

## 9.2 Context Package contents by phase

The Context Package schema is defined in full in the Context Package Specification Step 6 (SAR-1 through SAR-21). This section specifies which fields are active and relevant at each phase of the workflow. Fields not listed for a given phase are present in the schema but will be null or empty at that phase.

| Phase | Key Context Package fields active | Authority scope ceiling | Primary DTs permitted |
|---|---|---|---|
| INQUIRY | Booking Object (incomplete), Capability Declaration references, applicable ODRL policy set, TravelerContext (T1 minimum), feasibility constraints | CONFIGURATION_SUGGESTION | DT-1, DT-2 |
| PENDING_CONFIRMATION | Booking Object (submitted), supplier ConfirmationRequest status, applicable ODRL policy set, TravelerContext | INFORMATION_PROVISION only | DT-1 |
| CONFIRMED (pre-journey) | Full Booking Object, all confirmed Activity Components, applicable ODRL policy set, TravelerContext, PrecedentRecord (prior bookings) | CONFIGURATION_SUGGESTION | DT-1, DT-2 |
| PRE_DEPARTURE | Full Booking Object, pre-departure checklist, travel advisories, wellness declarations (W1/W4), jurisdiction contacts | CONFIGURATION_SUGGESTION | DT-1, DT-2 |
| OUTBOUND_TRANSIT | Active transit leg details, Carrier Party context, IROPS feed reference, TravelerContext, alt_contact_ref | DISRUPTION_RESPONSE (if declared) | DT-1, DT-4 |
| ARRIVAL | Host Party context, TRAVELER_RECEIVED status, check-in component, accessibility requirements (W4) | CONFIGURATION_SUGGESTION | DT-1, DT-2, DT-4 |
| IN_DESTINATION | Host Party context, upcoming Activity Components (PENDING), local advisories, TravelerWellnessStatus, alt_contact_ref | DISRUPTION_RESPONSE (if declared) | DT-1, DT-2, DT-4 |
| ACTIVITY_FULFILLMENT | Active Activity Component (FULFILLING), fulfilling Party context, TravelerWellnessStatus, source signal feed, duty_of_care_holder | DISRUPTION_RESPONSE (if declared) | DT-1, DT-4 |
| DISRUPTION_REVIEW | Disruption incident record, source_signal_reference, alternative arrangement proposals, duty_of_care_holder, SourceSignalRecord | DISRUPTION_RESPONSE (if declared) — proposals require human confirmation | DT-1, DT-2 (proposals only), DT-4 |
| RETURN_TRANSIT | Active transit leg, Carrier Party context, IROPS feed, TravelerWellnessStatus (fit_to_continue gate), alt_contact_ref | DISRUPTION_RESPONSE (if declared) | DT-1, DT-4 |
| RETURN_ARRIVAL | Wind-down summary, open TU chains, open W2 events, claim references, TRAVELER_PII retention obligations | COMPLETION_ACKNOWLEDGEMENT | DT-1, DT-6 |

> **TRAVELER_PII in Context Package:** TRAVELER_PII fields are assembled only at the access level required by the current decision type. An agent operating at participation Level 1 must not receive T2/T3 document fields not required for the DT. The Kernel enforces this at ASSEMBLY POINT — the agent never sees fields it is not permitted to see.

> **DR-v5 RULE 1 — CONFIRMATION state hard cap (normative):** Level 3 AI autonomy is prohibited at PENDING_CONFIRMATION state. The Security Kernel enforces `human_escalation_requested = true` on any Decision Object received while the Booking Object is in PENDING_CONFIRMATION, regardless of the agent's declared participation level or authority scope. An agent operating at Level 3 in another state does not retain that authority at PENDING_CONFIRMATION. This is non-bypassable Security Kernel enforcement — it cannot be overridden by Party Policy Declaration or AgentAuthorityDeclaration. Decision: DR-v6-D5.

## 9.3 Decision Object and authority scope validation

### 9.3.1 Decision Object structure

The Decision Object schema is defined in Context Package Specification Step 6 Section 7. Required fields:

- `proposed_action` — enum of permitted actions for this participation level.
- `reasoning` — structured explanation meeting the per-action minimum length (DOR-7). Must not be empty or boilerplate.
- `confidence` — float 0.0 to 1.0. Must meet the per-action minimum threshold.
- `alternatives_considered` — array of alternatives evaluated. Must contain at least one entry for DT-2, DT-3, and DT-4.
- `human_escalation_requested` — boolean. If true, triggers HEM regardless of other fields.
- `decision_object_signature` — ES256 signature over the Decision Object payload.
- `source_signal_reference` — mandatory for DT-4. Must resolve to an event log entry for this booking_id.

### 9.3.2 Kernel validation sequence

On receipt of a Decision Object from an agent, the Security Kernel executes the following validation sequence before any proposed action is considered:

1. **Signature verification** — decision_object_signature validated against the agent's registered public key.
2. **Replay detection** — prior_decision_hash compared against the Redis cache entry for this booking_id. Exact hash match on a different invocation_id triggers DECISION_REPLAY_DETECTED escalation.
3. **Stale package detection** — assembled_at timestamp compared against SSF event log. If an SSF revocation event arrived after assembled_at, the Decision Object is treated as originating from a stale Context Package (Section 9.6).
4. **Authority scope validation** — proposed_action validated against the agent's AgentAuthorityDeclaration scope. Out-of-scope proposals do not produce an error — they trigger the Human Escalation Manager.
5. **Confidence floor check** — confidence value compared against the per-action DOR-7 minimum. Below-floor confidence triggers CONFIDENCE_UNDERRUN escalation.
6. **Reasoning length check** — reasoning field length compared against the per-action DOR-7 minimum. Below-minimum length triggers REASONING_INSUFFICIENT escalation.
7. **source_signal_reference validation** — for DT-4, the reference must resolve to an event log entry. Missing or unresolvable reference: Decision Object rejected.

### 9.3.3 Out-of-scope proposals

When a Decision Object's proposed_action falls outside the agent's registered authority scope, the protocol response is HEM invocation — not rejection with an error code. This is intentional: an agent that identifies a situation requiring action beyond its scope is doing the right thing by surfacing it. The Kernel records the out-of-scope proposal in the event log, invokes HEM with escalation_reason: OUT_OF_SCOPE_PROPOSAL, and surfaces the agent's reasoning to the human actor.

> **Out-of-scope is not an error:** Implementers must not treat OUT_OF_SCOPE_PROPOSAL as a failure condition in monitoring systems. It is a normal protocol path for situations that exceed agent authority. Alerting on this escalation_reason as an error will produce false positives in disruption scenarios.

## 9.4 Authority scopes

An agent's authority scope is declared in its AgentAuthorityDeclaration (Context Package Specification Step 6, Section 3.1). The scope determines which proposed_action values the agent may include in a Decision Object. The Kernel validates scope at every invocation — declared scope at registration time is the ceiling; it cannot be elevated at runtime.

| Scope value | Permitted proposed actions | Typical use case | Human confirmation required? |
|---|---|---|---|
| INFORMATION_PROVISION | DT-1 actions only: surface information, provide status updates, answer queries | Customer-facing assistant, status bot | No — information provision does not change state |
| CONFIGURATION_SUGGESTION | DT-1 and DT-2 actions: propose booking configuration changes, itinerary adjustments | Booking assistant during INQUIRY and CONFIRMED phases | Yes — all DT-2 proposals require Booking Party confirmation before execution |
| DISRUPTION_RESPONSE | DT-1, DT-2, and DT-4 actions: autonomous incident declaration, alternative arrangement proposals | Operations agent during active travel phases | DT-4 declaration: no (within C1 window). DT-2 proposals: yes. |
| CORPORATE_ACCOUNT | DT-1 and DT-2 actions on behalf of TravelerGroup where decision_authority = CORPORATE_ACCOUNT | Corporate travel manager agent | Yes for booking changes. Group decisions surfaced to corporate account holder. |
| BUSINESS_GROUP_LEAD | DT-1 and DT-2 actions for all members of a TravelerGroup with CORPORATE_ACCOUNT decision_authority | Senior corporate account agent with group-wide authority | Yes for booking changes affecting multiple travelers. |
| NEGOTIATION | DT-1 and DT-3 actions: multi-party negotiation initiation | Multi-party negotiation agent in bookings with two or more Fulfilling Parties | Yes — gate on all affected Party confirmations and OPA evaluation before execution. |
| AGENT_COORDINATE | DT-1, DT-2, plus coordination actions (DUTY_OF_CARE_TRANSFER_INITIATED, DUTY_OF_CARE_ACCEPTED, COORDINATION_DELEGATION_REQUESTED, PENDING_SYNCHRONISATION release trigger) | AI agent acting for a Fulfilling Party in multi-party booking coordination | DoC transfer actions require confirmation. Coordination delegation requests do not. |
| AGENT_ESCALATE | DT-1, plus HEM_INVOCATION_REQUESTED during DoC gap period | Emergency escalation authority during a Duty of Care gap period | No — emergency escalation is agent-autonomous within this scope. |

## 9.5 Agent invocation in BOOKING_SUSPENDED

While BOOKING_SUSPENDED is active, all agent invocations are rejected by the Security Kernel. The rejection reason returned is BOOKING_SUSPENDED_ACTIVE. This applies regardless of the agent's authority scope.

- No ASSEMBLY POINT is executed while BOOKING_SUSPENDED is active.
- No Context Package is assembled or delivered.
- No Decision Object is accepted.
- Any in-flight Decision Object received after the BOOKING_SUSPENDED_ENTERED event timestamp is rejected.

On exit from BOOKING_SUSPENDED via Path B or Path C (Section 5.5), the Kernel re-assembles the Context Package (T-4-C) and re-evaluates OPA policy before any agent action resumes. Agents do not resume automatically — the first post-suspension invocation goes through a fresh ASSEMBLY POINT.

> **Design rule T-4-C:** Exit from BOOKING_SUSPENDED requires Kernel re-assembly of the Context Package and OPA re-evaluation before any autonomous agent action resumes.

## 9.6 Stale Context Package handling

A Context Package is considered stale if an SSF event (CAEP Session Revoked or RISC Credential Compromised) arrives for any agent in the booking after the context_package_assembled_at timestamp recorded at the ASSEMBLY POINT.

On stale package detection:

- The Decision Object is not processed.
- The Kernel records STALE_PACKAGE_DETECTED in the event log.
- If the stale event occurred during the C1 window: HEM-12 is invoked (Section 6.3.3).
- If outside the C1 window: the agent is re-invoked with a fresh Context Package assembled after the SSF event was processed.
- The stale agent's credentials are rechecked against the SSF event before the fresh Context Package is assembled.

## 9.7 What agents cannot do

The following actions are outside agent authority regardless of declared scope. Any attempt by an agent to perform these actions is a protocol violation and triggers HEM with escalation_reason: OUT_OF_SCOPE_ACTION.

- **Enter or exit BOOKING_SUSPENDED** — BOOKING_SUSPENDED entry requires human confirmation of a C-BS condition. Exit requires human authority confirmation. Agents cannot trigger either direction.
- **Set TU-3b, TU-5, or TU-6 sub-categories** — all three require human confirmation before the Kernel applies them.
- **Declare force majeure** — C-BS-3 requires a Booking Party authorised representative. Agent assessment of force majeure conditions is DT-2 (CONFIGURATION_SUGGESTION), not a declaration.
- **Declare TRAVELER_FOUND or RECOVERED** — both named protocol events require human authority confirmation (Section 10).
- **Transfer duty of care directly** — duty-of-care transfers are Kernel operations. Agents may request coordination delegation (AGENT_COORDINATE scope) but may not execute DoC transfers.
- **Null traveler_unreachable_category** — the Kernel nulls this field on resolution. Agents may propose resolution but the field update is a Kernel operation.
- **Execute irreversible actions during C1 window** — cancellations with financial consequence and confirmed rebookings are blocked during the C1 reversal window.
- **Modify the event log** — the append-only event log is a Kernel-exclusive resource.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 9 — April 2026*
