# Context Package — Design Rationale

::: info Working Draft
This document explains the design decisions behind the Context Package Specification. It is the companion to the [Context Package Reference](/working-drafts/context-package), which contains the current canonical schema. Read this document to understand *why* the schema is the way it is. Read the reference to look things up.
:::

The Context Package specification was developed in six sessions. This document traces the reasoning across all six: the taxonomy that drove the schema design, the key decisions made at each step, and the security constraints applied last. Every decision in the reference schema is traceable to a numbered decision or closed question here.

---

## The Core Problem

An AI agent participating in a travel booking needs to make a decision — propose a configuration, assess feasibility, flag a policy conflict, respond to a disruption. To do that well, it needs exactly the right information: no more (which wastes context and creates noise), no less (which forces inference from general knowledge, producing plausible but incorrect results).

The Context Package is the answer to: *what exactly does an AI agent need to know, right now, for this specific decision?*

The Decision Object is the answer to: *what exactly does the agent propose, and how do we audit that proposal?*

Neither is a generic AI prompt. Both are first-class protocol artifacts with defined schemas, signing requirements, and Security Kernel enforcement.

---

## Step 1 — The Taxonomy

### Two Design Axes

The specification starts with two axes. The first is the booking lifecycle state machine — every state in which an AI agent might be invoked. The second is the participation level — the degree of AI authority granted by the booking Party.

**Booking lifecycle states:**

| Phase | States |
|---|---|
| Pre-booking | `INQUIRY` → `NEGOTIATION` → `PROPOSAL` → `CONFIRMATION` |
| Fulfillment | `PRE_DEPARTURE` → `OUTBOUND_TRANSIT` → `ARRIVAL` → `IN_DESTINATION` → `ACTIVITY_FULFILLMENT` (7 sub-states) → `RETURN_TRANSIT` → `RETURN_ARRIVAL` → `COMPLETION` |
| Exception | `DISRUPTION_REVIEW`, `AMENDMENT`, `INCIDENT`, `PARTY_UNRESPONSIVE`, `CANCELLATION` |

**Participation levels:**

| Level | Name | Human role | AI authority |
|---|---|---|---|
| L0 | No AI | Full human control | None |
| L1 | AI-Assisted | Human confirms every action | Suggest only |
| L2 | AI-Negotiated | Human confirms at boundaries only | Act within declared authority bounds |
| L3 | AI-Autonomous | Human escalation on exception only | Full authority within declared scope |

::: danger Hard Protocol Rule — No Level 4
Level 4 (fully autonomous, no human escalation path) is excluded from all real-money transactions. Enforced by the Security Kernel — not a configuration option.
:::

### Six Decision Types

| ID | Name | Description | Primary states | Levels |
|---|---|---|---|---|
| DT-1 | Configuration Assembly | Agent assembles a structured Activity Configuration from natural language or partial input | `INQUIRY`, `NEGOTIATION` | L1–L3 |
| DT-2 | Feasibility Evaluation | Agent evaluates whether a proposed configuration is achievable given resources, policies, jurisdictions, and dependencies | `INQUIRY`, `NEGOTIATION`, `AMENDMENT`, `DISRUPTION_REVIEW` | L1–L3 |
| DT-3 | Policy Navigation | Agent identifies policy conflicts and compliance gaps. Cedar handles deterministic evaluation; AI handles novel conflicts and gap identification | `NEGOTIATION`, `CONFIRMATION`, any policy-conflict trigger | L1–L2 |
| DT-4 | Disruption Response | Agent evaluates an active disruption, generates ranked alternatives, proposes a response path | `DISRUPTION_REVIEW`, `AMENDMENT`, `INCIDENT`, `PARTY_UNRESPONSIVE` | L2–L3 |
| DT-5 | Fulfillment Monitoring | Agent monitors active fulfillment sub-states, detects anomalies against threshold rules, decides whether to self-resolve, escalate, or trigger incident assessment | All fulfillment sub-states, `RETURN_TRANSIT`, `RETURN_ARRIVAL` | L2–L3 |
| DT-6 | Negotiation Counterparty | Agent evaluates or proposes terms as a negotiating party. A2A multi-agent is a forward reference excluded from initial scope | `NEGOTIATION`, `AMENDMENT` | L1–L2 (in scope); L2–L3 A2A (deferred) |

These are not field definitions. They are the design axes that determine which fields appear in each Context Package variant.

### The Incident Discovery Taxonomy

The `INCIDENT` state required special treatment. The protocol's permissible AI behaviour depends entirely on how the incident was *discovered*.

| Category | Discovery mode | AI authority | Human required |
|---|---|---|---|
| A | Human — direct observation | Reactive assistance only | Always — declaration authority only |
| B | Human — third-party discovery | Prepare and recommend declaration | Always — single confirmation action |
| C1 | Machine — deterministic booking link | Autonomous declaration permitted under four mandatory conditions | Pre-authorised + immediate notification + PT15M reversal window |
| C2 | Machine — inferred booking impact | Assess scope, recommend `DISRUPTION_REVIEW` | Always — confirm state transitions |
| C3 | Machine — no direct booking link | Surface and recommend human review only | Always |

::: tip The C1 Four Conditions
All four must be satisfied simultaneously: (1) registered authoritative source signal, (2) deterministic booking match — not inferred, (3) Party pre-authorisation in their Policy Declaration, (4) immediate human notification with PT15M reversal window. Missing any one reverts to Category B.
:::

### Hard Constraints Established in Step 1

- **`CONFIRMATION` state:** Level 3 autonomy is prohibited. `human_escalation_requested = true` is enforced by the Security Kernel regardless of participation level declaration. Confirmation is a legally binding moment.
- **`INCIDENT` Category A:** AI cannot declare the incident. The human actor holding Duty of Care authority is the sole valid declarant.

### The Invocation Matrix

| State | DT-1 | DT-2 | DT-3 | DT-4 | DT-5 | DT-6 |
|---|---|---|---|---|---|---|
| `INQUIRY` | L1–L3 | L1–L3 | — | — | — | — |
| `NEGOTIATION` | L1–L2 | L1–L3 | L1–L2 | — | — | L2–L3 † |
| `PROPOSAL` | — | L1–L3 | L1–L2 | L1–L2 | — | L1–L2 |
| `CONFIRMATION` | — | — | L1–L2 * | — | — | — |
| Fulfillment sub-states | — | — | L1–L2 | — | L2–L3 | — |
| `DISRUPTION_REVIEW` | — | L2–L3 | L1–L2 | L2–L3 | L2–L3 | — |
| `AMENDMENT` | — | L1–L3 | L1–L2 | — | — | L2–L3 |
| `INCIDENT` Cat A | — | — | — | L1 | L1 | — |
| `INCIDENT` Cat B | — | — | — | L1–L2 | L1–L2 | — |
| `INCIDENT` Cat C1 | — | — | — | L2–L3 ‡ | L2–L3 ‡ | — |
| `INCIDENT` Cat C2/C3 | — | — | — | L1–L2 | L1–L2 | — |
| `PARTY_UNRESPONSIVE` | — | — | — | L2–L3 | L2–L3 | — |

\* Security Kernel enforces `human_escalation_requested = true` at all levels.
† A2A multi-agent forward reference — excluded from initial scope.
‡ Only under all four mandatory C1 conditions.

---

## Step 2 — Five Dimensions Per Decision Type

Step 1 defined *what* decisions exist. Step 2 defined *what the agent needs for each one*.

### The Five Dimensions

| Dimension | Design question answered | Why it cannot be omitted |
|---|---|---|
| Decision Scope | What specific decision is the agent being asked to make? | Without it, the agent may solve a different problem than the runtime expects. |
| Authority Scope | What is this agent authorised to propose? | Without it, the agent may propose valid actions outside this Party's authorisation, flooding the Human Escalation Manager. |
| State Snapshot | Where is the Booking Object right now? | Without it, the agent must infer context from general knowledge — producing plausible but incorrect decisions. |
| Available Actions | What can the agent actually propose? | Without it, the agent guesses. Guesses not in the enum are rejected, wasting the invocation. The agent must never have to guess. |
| Relevant Precedents | What similar decisions have been made before? | Without it, the agent cannot calibrate confidence. Precedents are how Level 2–3 autonomy becomes safe at scale. |

### Key Decisions Made in Step 2

**Q1 — DT-1 state snapshot scope:** Intent-parsed subset, not the full Activity Configuration Schema. The `completeness_map` (per-field: `PRESENT` | `MISSING_REQUIRED` | `MISSING_OPTIONAL` | `CONFIDENCE_LOW`) is a first-class field.

**Q2 — Precedent retrieval mechanism:** Structured similarity index as primary; vector search as secondary augmentation only. Feasibility and policy decisions are high-stakes and must be auditable. *"Structured index matched on activity_type=SKI_LESSON, jurisdiction=JP-19, constraint_profile=RESOURCE+LICENSING"* is auditable. *"Vector similarity returned these results"* is not.

**Q3 — Policy representation in DT-3 (most consequential):** Three-layer representation. Raw Cedar policy sets are never sent to an AI agent under any circumstances.

| Layer | Content | Purpose |
|---|---|---|
| 1 — Evaluated Action Set | Per-action Cedar evaluation result: `PERMITTED` \| `PROHIBITED` \| `REQUIRES_CONFIRMATION`, plus `policy_id` | Agent knows immediately what it can and cannot propose. No policy interpretation required. |
| 2 — Conflict Record | Present only if Cedar evaluation detected an unresolvable conflict | Agent understands why actions are blocked and can reason about resolution paths. |
| 3 — Policy Rationale | Per-action natural language string explaining the status | Enables plain-language communication to humans without interpreting legal text. |

Policy Rationale strings are generated by the runtime at assembly time from the policy's `human_description` field — not by the AI agent.

**Q4 — DT-4 `available_actions` scoping:** Two-level filter. Primary: state (`DISRUPTION_REVIEW` gets full DT-4 action set; `INCIDENT` gets a subset). Secondary: `discovery_mode`. Runtime enforces the filter; the agent does not apply it.

**Q5 — DT-5 authority scope:** Named `threshold_profile` object. Each `threshold_rule` defines: `monitored_field`, `comparison_operator`, `threshold_value`, `threshold_unit`, and `authorised_action` (`SELF_RESOLVE` | `ESCALATE` | `INCIDENT_ASSESS`). `INCIDENT_DECLARE` is never in the DT-5 `available_actions` set — the agent produces `INCIDENT_ASSESS`; the human produces `INCIDENT_DECLARE`.

**Q6 — DT-6 scope boundary:** A2A multi-agent negotiation excluded from initial scope. In-scope: single-agent counterparty evaluation (L1–L2). DT-6 Context Package is a composition: DT-2 snapshot + DT-3 policy layer + `negotiation_authority_bounds` + `proposal_history`.

### Cross-Cutting Design Decisions from Step 2

**CP-2.1 — Structured Index as Primary Retrieval.** The Context Package must carry a `precedent_retrieval_key` with structured similarity components — used for both retrieval and the audit log entry.

**CP-2.2 — Three-Layer Policy Representation.** Raw Cedar policy sets are never sent to an AI agent. Hard constraint enforced by the Security Kernel — not configurable by any Party Policy Declaration.

**CP-2.3 — Explicit Size Bounding.** Every Context Package has explicit size bounds derived from the specific decision type and current booking state. A Context Package exceeding its size bound is rejected by the runtime assembler before delivery. Only fields listed as required/optional for each Decision Type may be included.

**CP-2.4 — Customer-Supplied Text is Never in Instruction Position.** Customer-supplied natural language is always delivered as a labelled data field with `x-data-classification: CUSTOMER_INPUT`, never concatenated into the agent's instruction context. This is the prompt injection mitigation requirement.

---

## Steps 3 & 4 — Schema Design

Steps 3 and 4 translated the Step 2 catalogue into formal JSON Schema definitions.

### Design Decisions Made in Schema Design

**CP-3.1 — `field_availability_manifest` as First-Class Field.** Optional fields are never silently omitted. Each tracked optional field carries `PRESENT` | `ABSENT_STATE` | `ABSENT_UNAVAILABLE`. The distinction matters: `ABSENT_STATE` means not applicable in the current booking state; `ABSENT_UNAVAILABLE` means applicable but the data source was unreachable.

**CP-3.2 — Precedents at L2–L3 Only.** At L1, the agent is suggesting and the human is confirming — precedent overhead adds cost without changing the outcome. L1 omission is recorded in the `field_availability_manifest` explicitly as `ABSENT_STATE`.

**CP-3.3 — Context Package is Signed.** `context_package_signature` is required in `ContextPackageBase`. The Decision Object carries a corresponding `decision_object_signature` signed by the AI agent's key declared in `AgentAuthorityDeclaration`.

**CP-4.1 — Re-invocation on First Failure.** When a Decision Object fails a DOR check, the runtime re-invokes once with explicit annotation flagging the failure. If the re-invocation also fails, the Human Escalation Manager is invoked.

**CP-4.2 — DOR-5 Source Signal Mandatory for Autonomous Incident Declaration.** Every Decision Object proposing `AUTONOMOUS_INCIDENT_DECLARATION` must carry a `source_signal_reference`. The audit chain must be complete: *AI declared an incident because source X published signal Y which matched booking component Z at timestamp T.*

**CP-4.3 — Precedent Confidence Floor.** Decision Objects with `confidence < 0.70` are logged but not added to the precedent index. Prevents precedent poisoning via marginal decisions.

**CP-4.4 — `delta_summary` Security Kernel Override Prefix.** When a decision was forced to human escalation by the Security Kernel, the `delta_summary` in the `PrecedentRecord` must begin with `SECURITY_KERNEL_OVERRIDE: [rule_id] [override_reason]`.

### Schema Amendment Requests from Steps 3–4 (SAR-1 through SAR-9)

| SAR | Description |
|---|---|
| SAR-1 | `AgentAuthorityDeclaration`: add `ssf_stream_id`, `revocation_endpoint`, `ssf_subject_identifier_format` |
| SAR-2 | `DecisionObject`: per-action `reasoning` `minLength` overrides for high-risk actions |
| SAR-3 | `PrecedentRecord`: add `original_confidence` field |
| SAR-4 | `ContextPackageBase`: add `activity_time_context` (`ActivityTimeContext` object) |
| SAR-5 | Meta-schema: add `TRAVELER_PII` to `x-data-classification` enum |
| SAR-6 | New schema object: `TravelerContext` (with `TravelDocumentRef` sub-object) |
| SAR-7 | New schema object: `TravelerGroup` |
| SAR-8 | Party Capability Declaration: add `identity_verification_capabilities` |
| SAR-9 | `TravelerContext`: add `traveler_unreachable_category` enum |

---

## Step 5 — Assembly and Caching Rules

### Assembly Timeout Budgets

| DT | Total budget | Notes |
|---|---|---|
| DT-1 | 400 ms | No blocking Cedar. Parallel jurisdiction fetch permitted. |
| DT-2 | 350 ms | No Cedar. Parallel resource and jurisdiction fetches permitted. |
| DT-3 | 300 ms | Cedar is **blocking**. Budget dominated by Cedar sub-budget (50 ms). |
| DT-4 | 350 ms | Cedar blocking for `DISRUPTION_REVIEW` contexts. |
| DT-5 | 250 ms | Live query parallel sub-budget: 150 ms. Timeout → `ABSENT_UNAVAILABLE` — no silent substitution. |
| DT-6 | 350 ms | Cedar blocking. Composition of DT-2 + DT-3 patterns. |

Cedar is blocking for DT-3, DT-4 (`DISRUPTION_REVIEW`), and DT-6. If Cedar evaluation times out, assembly fails — the Context Package is not delivered. Human Escalation Manager invoked with `escalation_reason: ASSEMBLY_FAILURE`.

### Caching Rules

`cache_valid_until = min(all component TTLs, state_dependent_max_ttl)`.

| Source | TTL | Notes |
|---|---|---|
| `BOOKING_OBJECT` — `current_state` | 0 ms (always live) | No caching. Every assembly reads live. |
| `BOOKING_OBJECT` — attribute fields | 500 ms | Eventual consistency window. |
| `PARTY_REGISTRY` — `AgentAuthorityDeclaration` | `valid_until` − now | Invalidated by SSF session-revoked on `agent_id`. |
| `CEDAR_POLICY_ENGINE` — evaluation result | 0 ms (never cached) | Re-evaluated on every invocation without exception. |
| `JURISDICTION_COMPLIANCE_REGISTRY` | 21,600 s (6 hours) | Most aggressively cacheable tier. |
| `RESOURCE_REFERENCE_REGISTRY` — `SourceSignalRecord` | 0 ms (never cached) | CPR-2 audit chain requires current source signal. |
| `CAPABILITY_CATALOGUE` | 300 s | |
| `LIVE_QUERY` (DT-5) | 0 ms (not cacheable) | Timeout → `ABSENT_UNAVAILABLE`. Previous value must not be substituted. |

**State-dependent maximum TTL caps:**

| Booking state | Max `cache_valid_until` |
|---|---|
| `INCIDENT` / `DISRUPTION_REVIEW` | 15 seconds |
| `ACTIVITY_FULFILLMENT` sub-states | 30 seconds |
| `CONFIRMATION` | 60 seconds |
| `RETURN_TRANSIT` / `RETURN_ARRIVAL` | 60 seconds |
| `NEGOTIATION` / `AMENDMENT` | 120 seconds |
| `INQUIRY` / `PRE_DEPARTURE` | 300 seconds |

### Time Governance

The ATP runtime is the sole authoritative time source. Party systems and AI agents never supply or override timestamps. Runtime nodes must synchronise to Stratum 1 or 2 NTP with maximum 100 ms clock skew between nodes.

`ActivityTimeContext` (SAR-4) was introduced to solve a specific agent limitation: AI agents lack intrinsic clocks and cannot reliably perform timezone-aware schedule arithmetic. It provides pre-computed schedule context — `minutes_until_activity_start`, `minutes_until_departure_deadline`, `schedule_status`, `booking_day_local` — enabling correct urgency reasoning without raw timestamp arithmetic.

### Protocol Deadline Committed Values

| `escalation_reason` | `protocol_deadline` |
|---|---|
| `INCIDENT_DECLARATION_AUTHORITY` | PT15M |
| `POLICY_DEADLOCK` | PT30M |
| `PARTY_UNRESPONSIVE` | PT20M (PT10M during `ACTIVITY_FULFILLMENT`) |
| `CONFIRMATION_STATE_RULE` (DOR-3 override) | PT60M |
| `CONFIDENCE_UNDERRUN` | PT45M |
| `ASSEMBLY_FAILURE` | PT10M |

Parties may not extend these deadlines. Parties may configure shorter internal escalation SLAs.

---

## Step 6 — Security Constraints

### Signing Algorithm

Both `context_package_signature` and `decision_object_signature` use ES256 (ECDSA with P-256 and SHA-256), aligning with FAPI 2.0 and W3C VC Data Model 2.0.

### Sanitisation Pipeline

`CUSTOMER_INPUT` fields must pass through the sanitisation pipeline before inclusion in any Context Package: strip HTML and JavaScript protocol handlers, normalise Unicode to NFC, enforce `maxLength`, apply prompt injection pattern detection. Non-bypassable Security Kernel function.

`TRAVELER_PII` fields carry additional constraints: encryption at rest (AES-256-GCM), jurisdiction-specific retention deadlines, exclusion from the precedent index, exclusion from all OpenTelemetry span attributes, access limited to the level required by the current decision type.

### New States and Events

- **`BOOKING_SUSPENDED`** — full stop with three entry conditions, absolute halt on autonomous actions, and three authority-gated exit paths.
- **`BOOKING_CANCELLED_SUSPENDED`** — terminal state with distinct audit and retention obligations from normal `CANCELLATION`.
- **`TRAVELER_FOUND`** — named protocol event (not a field update) applicable to TU-2 and TU-6. Does not auto-resume booking.
- **`RECOVERED`** — wellness equivalent of `TRAVELER_FOUND` for `TravelerWellnessStatus` W2 resolution.

### Schema Amendment Requests from Step 6 (SAR-10 through SAR-21)

| SAR | Description |
|---|---|
| SAR-10 | Retire `TU_3_TRAVELER_ABSCONDED`; replace with `TU_3A_TRAVELER_OVERDUE` and `TU_3B_TRAVELER_DEPARTED_IRREGULARLY` |
| SAR-11 | `AgentAuthorityDeclaration`: add `BUSINESS_GROUP_LEAD` to scope enum |
| SAR-12 | `EscalationContext`: add `REASONING_INSUFFICIENT` to `escalation_reason` enum |
| SAR-13 | `ContextPackageBase`: add `location_disclosure_blocked` flag |
| SAR-14 | New schema object: `TravelerWellnessStatus` |
| SAR-15 | Booking Object: add `claim_initiation_ref` |
| SAR-16 | State machine: add `BOOKING_SUSPENDED` |
| SAR-17 | State machine: add `BOOKING_CANCELLED_SUSPENDED` terminal state |
| SAR-18 | `SourceSignalRecord`: add IATA IROPS category code |
| SAR-19 | New schema: `SUPPLIER_FAILURE_AT_DELIVERY` incident type |
| SAR-20 | New named protocol event: `TRAVELER_FOUND` |
| SAR-21 | New named protocol event: `RECOVERED` |

**Why `TU_3_TRAVELER_ABSCONDED` was retired:** the word carries serious legal and reputational weight. Applying it to someone who simply extended their stay could cause real harm. The replacement is a two-tier model: TU-3a is the benign default; TU-3b requires human confirmation and triggers commercial/legal notification chains.

**Why `REASONING_INSUFFICIENT` was separated from `CONFIDENCE_UNDERRUN`:** SAR-2 introduced per-action minimum `reasoning` lengths for high-risk actions. Step 6 makes the distinction explicit — `CONFIDENCE_UNDERRUN` is for confidence value below the per-action floor; `REASONING_INSUFFICIENT` is for reasoning field shorter than the per-action minimum. The distinction matters for operators diagnosing agent quality issues.

---

## What Remains Open

| Item | Status |
|---|---|
| NDC compatibility bridge | OPEN — Layer 4 deliverable |
| `SUPPLIER_FAILURE_AT_DELIVERY` commercial specification | OPEN — separate commercial specification |
| SSF/RISC remediation policy gap | OPEN — requires live implementation validation |
| TU chain live operational testing | OPEN — all chains require testing against real operational events |
| Cross-invocation anomaly thresholds | OPEN — cannot be committed without live data |
| A2A multi-agent DT-6 | OPEN — deferred pending Google A2A protocol maturity |
