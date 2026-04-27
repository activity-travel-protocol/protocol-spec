# Security Architecture Specification

::: info Working Draft
This document is a Working Draft. Decisions recorded here are closed for the purposes of Layer 1. Items marked as Implementation Discussion Items or deferred to Step 6 remain open for the relevant session.
:::

| Field | Value |
|---|---|
| Document ref | ATP_SecurityArchitecture_v1 |
| Status | Security Architecture session complete — ready for Step 6 |
| Contributor | Tom Sato (MyAuberge K.K.) |
| Depends on | ATP_ContextPackage_Step3_4_v3 · ATP_ContextPackage_Step5_v1 · ATP_TravelerIdentity_SessionBrief_v2 |
| Produces | ATP_ContextPackage_Step6_v1 |
| Date | March 2026 |

---

## Design Philosophy — Scale-Neutral Escalation

The Activity Travel Protocol defines signal infrastructure, escalation triggers, and authority models. It does not prescribe the human-facing implementation layer.

At small-operator scale — such as MyAuberge — the same protocol signal that triggers an escalation reaches the operator directly and immediately. At large OTA scale, the same signal routes through an AI customer support agent handling thousands of concurrent incidents. Both are valid implementations of the same protocol chain.

::: tip Core Principle
ATP is scale-neutral by design. The protocol must not over-specify the human implementation layer in a way that advantages large-scale implementations or burdens small ones.

ATP has a second obligation beyond the protocol specification itself: companion implementation guidance papers covering best practices for escalation handling, customer support workflows, and incident resolution — written for both small operators and large OTAs.
:::

---

## 1. Session Scope and Inputs

This document records the decisions of the Security Architecture session. It resolves all open questions carried forward from prior sessions and defines the security, escalation, and incident handling architecture for ATP v1.

| Input document | Role |
|---|---|
| ATP_ContextPackage_Step3_4_v3 | Schema with SAR-1 through SAR-9 applied. Primary schema reference. |
| ATP_ContextPackage_Step5_v1 | Assembly and caching rules. FR-5.1 through FR-5.4 forward references. |
| ATP_TravelerIdentity_SessionBrief_v2 | TDI-Q1 through Q5 closed. TU-1 through TU-6 taxonomy. SAR-5 through SAR-9. |

---

## 2. Shared Signals Framework (SSF) Integration

### 2.1 Receiver Model (SSF-Q1)

ATP adopts a hybrid push/pull SSF receiver model (Option C). Push delivery is the primary path; poll-on-assembly is the mandatory fallback.

- **Push receiver:** the runtime registers as an SSF Receiver at Party registration time. The Party's SSF transmitter delivers Security Event Tokens (SETs) to the runtime's `revocation_endpoint` via HTTP POST.
- **Poll-on-assembly (fallback):** if the push listener is unavailable — cold start, edge deployment, or listener failure — the runtime polls the `revocation_endpoint` at the start of each assembly involving a cached `AgentAuthorityDeclaration`.
- The `revocation_endpoint` field (SAR-1, `AgentAuthorityDeclaration`) must support both delivery modes.

::: details Implementation Discussion Item — SSF Receiver Model
Options A (pure push) and B (pure poll) were considered and rejected. Pure push is architecturally clean but brittle at the edge. Pure poll introduces a revocation latency gap proportional to assembly frequency.

SSF failure modes and remediation behaviours should be validated against a live implementation before being protocol-committed. The hybrid model gives implementers a safe path without over-specifying behaviour that genuinely needs runtime experience to calibrate.
:::

### 2.2 SSF Event Set and Cache Response Matrix (SSF-Q2)

ATP v1 responds to seven SSF events. Recovery Information Changed is excluded — deprecated in the current RISC specification. It is noted as a v2 extension point if the spec reverses course.

| Event | Cache purge scope | CP stale flag | Party Registry notify | Execution gate | Clearing condition |
|---|---|---|---|---|---|
| CAEP: Session Revoked | `agent_id` only | Yes | No | None | N/A |
| RISC: Account Purged | All `agent_id`s under `party_id` | Yes | Yes — flag `party_id` | None | N/A |
| RISC: Account Disabled | All `agent_id`s under `party_id` | Yes | No | None | Account Enabled |
| RISC: Account Enabled | N/A — proactive re-fetch | No | No | Clears Disabled and Recovery gates | N/A |
| RISC: Credential Compromised | `agent_id` only | Yes | Yes — flag `party_id` | Full gate — `CREDENTIAL_COMPROMISED_GATE` | Account Enabled OR new AAD with `valid_from` after event timestamp |
| RISC: Recovery Activated | None | No | No | Soft gate — DT-4 autonomous actions require human confirmation | Account Enabled |
| RISC: Account Credential Change Required | `agent_id` only | Yes | No | Soft gate — `CREDENTIAL_CHANGE_REQUIRED` warning | New AAD with `valid_from` after event timestamp |

::: details Implementation Discussion Item — SSF/RISC Remediation Policy Gap
The RISC specification does not define remediation workflow or policy guidelines. ATP's Credential Compromised handling (dual clearing conditions, `CREDENTIAL_COMPROMISED_GATE`) represents ATP-specific policy built on top of RISC, not RISC-derived behaviour.

This should be validated against a live SSF implementation before being protocol-committed. The broader adoption barrier for RISC — absence of implementation-stage workflow guidance — may require ATP to develop its own SSF implementation guide as a companion document.
:::

### 2.3 Stale Package Handling (FR-5.1)

When an SSF event arrives, the runtime records the event timestamp and the affected `agent_id`. If a Decision Object subsequently arrives from that `agent_id` with an `assembled_at` timestamp predating the SSF event, the Decision Object is treated as originating from a stale Context Package.

- **Non-Credential-Compromised events:** runtime re-invokes assembly and re-presents the decision context to the agent before executing.
- **Credential Compromised:** `CREDENTIAL_COMPROMISED_GATE` applies regardless of `assembled_at` timestamp.

### 2.4 AgentAuthorityDeclaration Cache Invalidation (FR-5.2)

The runtime subscribes to SSF events at Party registration time. Invalidation scope is event-type-aware:

| Event | Invalidation scope |
|---|---|
| CAEP: Session Revoked | `agent_id` named in SSF subject only |
| RISC: Credential Compromised | `agent_id` named in SSF subject only |
| RISC: Account Credential Change Required | `agent_id` named in SSF subject only |
| RISC: Recovery Activated | `agent_id` named in SSF subject only |
| RISC: Account Disabled | All `agent_id`s under the `party_id` |
| RISC: Account Purged | All `agent_id`s under the `party_id` |
| RISC: Account Enabled | All `agent_id`s under the `party_id` — proactive re-fetch for each |

### 2.5 Policy Assembly Failure (FR-5.3)

When Cedar evaluation times out or fails for a blocking DT (DT-3, DT-4 `DISRUPTION_REVIEW`, DT-6), assembly fails. The Human Escalation Manager is invoked with `escalation_reason: ASSEMBLY_FAILURE`.

- `protocol_deadline`: PT10M. This is a protocol maximum — Parties may declare a tighter value in their Party Policy Declaration. The runtime uses the tighter of the two values.

### 2.6 SSF Session-Revoked During C1 Reversal Window (SSF-Q4 / FR-5.4)

If one of the four C1 trigger events arrives for the declaring `agent_id` during the PT15M autonomous incident declaration reversal window:

| C1 window trigger event | Notes |
|---|---|
| CAEP: Session Revoked | Primary trigger — agent session no longer valid |
| RISC: Account Purged | Account-level — at least as serious as session revocation |
| RISC: Account Disabled | Account suspension during reversal window is a strong signal |
| RISC: Credential Compromised | Escalation context must explicitly note credential compromise as material factor |

- Reversal window clock frozen on SSF event receipt — does not expire while escalation is pending.
- Human Escalation Manager invoked with `escalation_reason: SSF_REVOCATION_DURING_C1_WINDOW`.
- Human must choose one of three explicit paths: (A) confirm declaration and resume countdown, (B) reverse declaration, or (C) escalate to named authority.
- Reversible downstream actions placed on hold pending human confirmation.
- Irreversible downstream actions already executed flagged with `tainted_by_ssf_revocation` for audit.
- No autonomous action proceeds while escalation is pending.

---

## 3. Decision Traceability

### 3.1 Fraud Detection Span Attributes (DT-Q2)

Three attribute groups are added to the Step 5 baseline assembly span set for fraud detection coverage.

**Group 1 — Agent Behavioural Baseline** — added to `atp.context_package.assembly_start`:

| Attribute | Purpose |
|---|---|
| `agent_id` | The declaring agent. Required for all fraud detection correlation. |
| `participation_level_history_hash` | Hash of the agent's recent participation level sequence for this booking. Detects sudden level escalations. |
| `invocation_count_this_booking` | Running count of invocations for this `agent_id` on this `booking_id`. Anomalously high counts are a manipulation signal. |

**Group 2 — Decision Object Integrity** — added to new span `atp.decision_object.received`:

| Attribute | Purpose |
|---|---|
| `proposed_action` | What the agent proposed. |
| `confidence` | The declared confidence value. |
| `reasoning_length` | Character count of the reasoning field — not content. Privacy-safe. |
| `alternatives_considered_count` | Number of alternatives the agent listed. |
| `human_escalation_requested` | Boolean from the Decision Object. |
| `decision_object_signature_valid` | Boolean result of signature verification. |

**Group 3 — Cross-Invocation Anomaly** — added to `atp.context_package.precedent_retrieval`:

| Attribute | Purpose |
|---|---|
| `prior_decision_hash` | Hash of the most recent Decision Object for this `booking_id`. Enables detection of exact decision replay. |
| `confidence_delta` | Difference between current and previous confidence for the same `decision_type` on this booking. Sharp drops are a signal. |

The runtime maintains per-booking decision history in the Redis-compatible cache tier: one hash and one confidence value per `booking_id`, session-scoped.

### 3.2 Cross-Invocation Pattern Detection (DT-Q4)

::: danger Hard Protocol Rule — DECISION_REPLAY_DETECTED
Exact decision replay is unambiguously anomalous. A legitimate agent should never produce an identical Decision Object hash on two separate invocations for the same booking, because the Context Package always differs at minimum in `invocation_id` and `assembled_at`.

If `prior_decision_hash` matches on a different `invocation_id` for the same `booking_id`, the runtime must invoke the Human Escalation Manager with `escalation_reason: DECISION_REPLAY_DETECTED`.
:::

::: details Implementation Discussion Item — Cross-Invocation Anomaly Thresholds
Frequency, confidence drift, and escalation pattern thresholds cannot be responsibly protocol-committed without live implementation data. Party implementations should log findings from the Group 3 attributes for contribution to a future ATP anomaly threshold specification.
:::

---

## 4. Escalation Reason Values

| Value | Source | Description |
|---|---|---|
| `ASSEMBLY_FAILURE` | FR-5.3 | Cedar evaluation timeout or failure on blocking DT (DT-3, DT-4 `DISRUPTION_REVIEW`, DT-6). `protocol_deadline`: PT10M maximum. |
| `CONFIDENCE_UNDERRUN` | Step 5 / SAR-2 | Decision Object reasoning below per-action minimum. Interim until `REASONING_INSUFFICIENT` defined in Step 6. |
| `CREDENTIAL_COMPROMISED_GATE` | NEW — SSF-Q2 | Decision Object received from `agent_id` with active RISC Credential Compromised event. Full execution gate. |
| `SSF_REVOCATION_DURING_C1_WINDOW` | NEW — SSF-Q4 | C1 trigger SSF event received during PT15M autonomous incident declaration reversal window. |
| `DECISION_REPLAY_DETECTED` | NEW — DT-Q4 | Exact Decision Object hash match on different `invocation_id` for same `booking_id`. |
| `TRAVELER_UNREACHABLE_UNRESOLVED` | NEW — TU-1 | Alt contact not confirmed within timeout on TU-1 incident. |
| `TRAVELER_MISSING` | NEW — TU-2 | TU-2 `TRAVELER_MISSING` incident declared. Invoked immediately — no timeout wait. |
| `TRAVELER_OVERDUE` | NEW — TU-3a | TU-3a alt contact not confirmed within PT20M timeout. |
| `TRAVELER_DEPARTED_IRREGULARLY` | NEW — TU-3b | TU-3b classification confirmed by human actor. |
| `TRAVELER_DECEASED` | NEW — TU-5 | TU-5 `TRAVELER_DECEASED` confirmed or strongly suspected. Invoked immediately. |
| `TRAVELER_VICTIM_OF_CRIME` | NEW — TU-6 | TU-6 `TRAVELER_VICTIM_OF_CRIME` confirmed. Invoked immediately. PT10M deadline. |

---

## 5. TRAVELER_UNREACHABLE Escalation Chains

::: warning Implementation Memo — Live Operational Testing Required
TU-1 through TU-6 escalation chains represent the protocol's best design position based on available knowledge. All chains must be tested against real live operational events before being considered stable. Implementors are expected to log deviations and contribute findings back to the working group for v2.
:::

### 5.0 General Rules

::: tip Classification and Precedence Rules
**Default Classification Rule:** when a `TRAVELER_UNREACHABLE` incident is first declared and available evidence does not support a more specific sub-category, the runtime must default to `TU_4_CONTACT_SUSPENDED`. The starting position is always the least severe classification justified by available evidence.

**Sub-category Precedence Rule:** when TU sub-categories overlap, the more restrictive chain always applies. TU-6 takes precedence over TU-2. TU-5 takes precedence over all other sub-categories.

**Unaccompanied Minor Rule:** any TU sub-category other than TU-4 escalates immediately to `GUARDIAN_ONLY` authority for unaccompanied minors, bypassing the standard timeout.

**Sub-category Upgrade:** always permitted on new evidence. **Sub-category Downgrade:** requires authority confirmation. Exception: `TRAVELER_FOUND` declaration is the sole downgrade path that does not require separate authority confirmation.
:::

### 5.1 TU-1 — DEVICE_UNAVAILABLE

**Characteristic:** traveler physically present, reachable through alternative means. Phone broken, lost, flat battery, or compromised. No welfare concern.

1. Runtime sets `traveler_unreachable_category` to `TU_1_DEVICE_UNAVAILABLE` on `TravelerContext`.
2. Runtime immediately attempts `alt_contact_ref`. Timeout: PT10M standard states; PT5M during `ACTIVITY_FULFILLMENT` states.
3. If alt contact confirmed within timeout: autonomous rebooking and accommodation changes permitted within existing agent authority scope.
4. If alt contact not confirmed within timeout: Human Escalation Manager invoked with `escalation_reason: TRAVELER_UNREACHABLE_UNRESOLVED`. `protocol_deadline`: PT30M.
5. If no human response within PT30M: booking placed in `PARTY_UNRESPONSIVE` state. No autonomous rebooking without alt contact confirmation.

### 5.2 TU-2 — TRAVELER_MISSING

**Characteristic:** traveler cannot be physically located. Welfare concern. Examples: skier lost in avalanche zone, passenger absent at gate.

1. Runtime sets `traveler_unreachable_category` to `TU_2_TRAVELER_MISSING`.
2. Runtime immediately places DT-4 autonomous hold on all downstream bookings. HOLD AND PRESERVE only — no rebooking, cancellation, or autonomous action of any kind.
3. Human Escalation Manager invoked immediately. `escalation_reason: TRAVELER_MISSING`. `protocol_deadline`: PT15M.
4. `alt_contact_ref` attempted in parallel. Jurisdiction Registry law enforcement and emergency services contacts fetched and surfaced in escalation context.
5. All subsequent state changes require explicit human confirmation from duty-of-care Party or confirmed authority contact.
6. No human response within PT15M: escalation re-issued with increased urgency flag. PT10M deadline for re-issue.
7. **Resolution:** `TRAVELER_FOUND` event — see Section 5.8.

### 5.3 TU-3a — TRAVELER_OVERDUE

**Characteristic:** traveler has not appeared or returned as expected. No evidence of distress or deliberate evasion. Default assumption: benign.

::: info TU-3 Retirement Notice
`TU_3_TRAVELER_ABSCONDED` has been retired and replaced by TU-3a and TU-3b. The word "absconded" carries serious legal and reputational weight — applying it to someone who simply extended their stay could cause real harm. Schema amendment applied in Step 6.
:::

1. Runtime sets `traveler_unreachable_category` to `TU_3A_TRAVELER_OVERDUE`. Default assumption: benign. No welfare escalation.
2. Runtime attempts `alt_contact_ref`. PT20M timeout.
3. If contact established and traveler confirms voluntary extension: booking updated. `traveler_unreachable_category` nulled.
4. If no contact within PT20M: Human Escalation Manager invoked. `escalation_reason: TRAVELER_OVERDUE`. `protocol_deadline`: PT60M.
5. If financial loss incurred: `claim_initiation_ref` hook activated on Booking Object.
6. Sub-category may be upgraded to TU-3b, TU-2, or TU-6 on new evidence.

### 5.4 TU-3b — TRAVELER_DEPARTED_IRREGULARLY

**Characteristic:** traveler has left the jurisdiction or booking context in a manner raising commercial or legal concern. Human confirmation required before this sub-category is set.

::: details Implementation Discussion Item — TU-3a vs TU-3b Classification
The default assumption must always be TU-3a (benign) until evidence supports TU-3b. The companion implementation guidance paper must provide explicit classification criteria and worked examples. ATP is not a law enforcement tool — it does not report traveler behaviour to authorities, make legal determinations, or store information beyond defined retention limits.
:::

1. `TU_3B_TRAVELER_DEPARTED_IRREGULARLY` requires human confirmation before being set — must not be set autonomously.
2. Human Escalation Manager invoked immediately. `escalation_reason: TRAVELER_DEPARTED_IRREGULARLY`. `protocol_deadline`: PT30M.
3. Booking Party commercial and legal team notified. If immigration violation suspected: Jurisdiction Registry consulted for authority contacts. ATP surfaces contacts only — does not make immigration determinations or report to authorities autonomously.
4. If financial loss incurred: `claim_initiation_ref` hook activated.
5. No autonomous actions of any kind. All booking state changes require explicit human confirmation.

### 5.5 TU-4 — CONTACT_SUSPENDED

**Characteristic:** traveler has deliberately switched off phone or suspended contact. No welfare concern inferred. Most common sub-category. Default classification when no evidence supports a more specific sub-category.

1. Runtime sets `traveler_unreachable_category` to `TU_4_CONTACT_SUSPENDED`. Default assumption: deliberate and benign.
2. Standard `PARTY_UNRESPONSIVE` timeout applies. PT20M standard states; PT10M during `ACTIVITY_FULFILLMENT` states.
3. If timeout elapses: standard autonomous action permitted within existing agent authority scope per DT-4 rules.
4. `traveler_unreachable_category` nulled when contact is re-established through any channel.

### 5.6 TU-5 — TRAVELER_DECEASED

**Characteristic:** confirmed or strongly suspected death of traveler during the booking lifecycle. Most severe sub-category. Triggers `BOOKING_SUSPENDED` state. `TRAVELER_FOUND` does not apply to TU-5.

::: warning
TU-5 covers both confirmed death and strong suspicion. ATP does not wait for a death certificate when a traveler is found unresponsive in an avalanche zone. The human confirmation requirement is the safeguard — a responsible human actor makes the determination on available evidence.
:::

1. `TU_5_TRAVELER_DECEASED` requires human confirmation before being set — never set autonomously.
2. IMMEDIATE and absolute halt of all autonomous actions. No exceptions.
3. Booking transitions to `BOOKING_SUSPENDED` state immediately.
4. Human Escalation Manager invoked immediately. `escalation_reason: TRAVELER_DECEASED`. `protocol_deadline`: PT15M. `alt_contact_ref NEXT_OF_KIN` attempted immediately in parallel.
5. All subsequent actions require confirmation from next-of-kin OR legal authority. Booking Party commercial team has no autonomous authority in `BOOKING_SUSPENDED` state.
6. `TRAVELER_PII` retention rules suspended pending next-of-kin or authority instruction.
7. Sub-category cannot be downgraded. `BOOKING_SUSPENDED` exits only via conditions defined in Section 6.
8. IATA welfare obligations apply to all airline-connected segments per IATA Resolution 735d.

### 5.7 TU-6 — TRAVELER_VICTIM_OF_CRIME

**Characteristic:** traveler is victim of crime — kidnap, serious assault, robbery, detention by non-state actor. May overlap with TU-2 and TU-5.

::: danger TU-6 Location Disclosure Block — Named Security Rule
Authority scope does not override location disclosure restrictions during an active TU-6 incident. Any request for traveler location, accommodation details, onward travel plans, or contact information — from any Party, any agent, any system — is refused without explicit law enforcement confirmation. Law enforcement confirmation is the sole unlocking mechanism.
:::

1. `TU_6_TRAVELER_VICTIM_OF_CRIME` requires human confirmation before being set — never set autonomously.
2. HOLD AND PRESERVE immediately. DT-4 autonomous hold on all downstream bookings.
3. Location and itinerary blackout activated immediately. `LOCATION_DISCLOSURE_BLOCKED` flag set. Applies even to Parties with valid authority scope.
4. Human Escalation Manager invoked immediately. `escalation_reason: TRAVELER_VICTIM_OF_CRIME`. `protocol_deadline`: PT10M. Escalation context must NOT include traveler location or itinerary — escalation channel itself may be compromised.
5. Jurisdiction Registry law enforcement contacts fetched and surfaced to human actor only — not to any automated system.
6. SSF stream checked immediately for CAEP Session Revoked and RISC Credential Compromised events on `device_session_ref`.
7. All subsequent state changes require law enforcement confirmation OR duty-of-care Party confirmation with explicit law enforcement acknowledgement. Next-of-kin alone is insufficient for TU-6.
8. `TRAVELER_FOUND` applies to TU-6. Location blackout lifted only after law enforcement explicitly confirms it is safe to do so.
9. Unaccompanied minor rule: `GUARDIAN_ONLY` authority immediately. Law enforcement engagement mandatory.

### 5.8 TRAVELER_FOUND — Named Protocol Event

`TRAVELER_FOUND` is a first-class protocol event applicable to TU-2 and TU-6. It does not apply to TU-5.

| Property | Definition |
|---|---|
| Authority gate | Declarable only by: (a) duty-of-care Party, (b) confirmed Jurisdiction Registry authority contact, or (c) traveler via re-established contact reference. For TU-6: law enforcement confirmation required. |
| On declaration | `traveler_unreachable_category` nulled. DT-4 autonomous hold released. Active escalation marked resolved. Incident record preserved and closed but not purged. |
| Sub-category downgrade | `TRAVELER_FOUND` is the sole protocol-permitted downgrade path that does not require separate authority confirmation. |
| Autonomous action | Does not auto-resume on `TRAVELER_FOUND`. Duty-of-care Party must issue explicit booking resumption confirmation as a separate step. |
| Condition assessment | Three-path prompt to duty-of-care Party: (A) traveler able to continue — booking resumes; (B) traveler requires medical or authority assistance — booking held; (C) traveler wishes to cancel and return home — cancellation and repatriation authorised. |

---

## 6. BOOKING_SUSPENDED State Definition

### 6.1 Entry Conditions — three and only three

1. TU-5 (`TRAVELER_DECEASED`) confirmed or strongly suspected — the primary entry path.
2. Legal authority order received via Jurisdiction Registry contact requiring booking suspension.
3. Booking Party declaration of force majeure affecting the entire booking.

### 6.2 State Characteristics

| Characteristic | Definition |
|---|---|
| Autonomous actions | HALTED — absolute, no exceptions. |
| State machine transitions | FROZEN — booking cannot move to any other state without explicit human unlock. |
| `available_actions` | EMPTY for all agent invocations — Security Kernel returns empty set regardless of authority scope. |
| Context Package assembly | PERMITTED for read-only purposes. No Decision Object can be executed. |
| `TRAVELER_PII` retention deadlines | SUSPENDED — data preserved until suspension is resolved. |
| SSF monitoring | CONTINUES — runtime does not stop listening for security events during suspension. |

### 6.3 Exit Conditions — authority-gated

1. **Path A** — Next-of-kin or legal authority confirmation that the booking should be cancelled. Booking transitions to `BOOKING_CANCELLED_SUSPENDED` terminal state.
2. **Path B** — Legal authority order lifting the suspension. Booking returns to pre-suspension state with `suspension_lifted_by` audit record.
3. **Path C** — Booking Party determination with authority confirmation that the suspension trigger was incorrect. Booking returns to pre-suspension state with full audit record of the erroneous declaration.

### 6.4 BOOKING_CANCELLED_SUSPENDED — Terminal State

- Terminal state — no exit path.
- `TRAVELER_PII` retained until jurisdiction authority confirms purge is appropriate.
- Distinct from normal `CANCELLATION` — carries `suspended_cancellation: true` flag. Must not be treated identically by audit or supplier claim systems.
- Supplier claim path via `claim_initiation_ref` remains active.

::: tip
`BOOKING_SUSPENDED` is not `PARTY_UNRESPONSIVE` (which has timeouts and autonomous action permissions). It is not `DISRUPTION_REVIEW` (which has an active resolution path). It is not a terminal state. It is a full stop requiring human authority to exit.
:::

---

## 7. SUPPLIER_FAILURE_AT_DELIVERY

A `SUPPLIER_FAILURE_AT_DELIVERY` incident is declared when a supplier has failed to deliver a booked service at the point of delivery. The service was confirmed, the traveler was present or attempted to be present, and the supplier did not fulfil their obligation.

::: info Scope
Distinct from a pre-delivery cancellation (normal amendment/cancellation rules) and from an IROPS-type disruption (DT-4 rules). The defining characteristic: delivery was attempted and failed at the moment of delivery. Full schema defined in Step 6. Payment mechanism, compensation, and settlement deferred to a separate commercial specification.
:::

### 7.1 Incident Type Taxonomy

| Category | Label | Definition | Human confirm? |
|---|---|---|---|
| SF-1 | `NO_SHOW_SUPPLIER` | Supplier failed to appear or open at confirmed time and location. | No |
| SF-2 | `SERVICE_NOT_AS_DESCRIBED` | Supplier appeared but delivered a materially different service. | **YES — material difference requires human judgment** |
| SF-3 | `FORCED_CANCELLATION_AT_DELIVERY` | Supplier cancelled at point of delivery citing reasons within their control. Distinguished from force majeure. | No |

### 7.2 Burden-of-Proof Inversion Rule

::: tip
Once a booking reaches `CONFIRMATION` state and the delivery window opens, the supplier bears the burden of proving delivery occurred — not the traveler proving non-delivery. The `claim_initiation_ref` hook is activated by default on declaration. Modelled on the IATA IROPS principle that the carrying carrier is responsible for re-accommodation once a disruption occurs.
:::

---

## 8. Traveler Wellness Status

### 8.1 Wellness Tier Model

| Tier | Label | Definition |
|---|---|---|
| W0 | No declared condition | Default for all bookings. No wellness record required. |
| W1 | Pre-existing declared condition | Managed at booking time via MEDIF-equivalent declaration. Stable, known condition. |
| W2 | Active wellness event | Traveler ill, injured, or incapacitated during the booking lifecycle. Runtime incident. |
| W3 | Medical purpose travel | Destination is the treatment location. Configured at booking time. Not a runtime incident. |
| W4 | Disability or reduced mobility | Permanent or long-term condition requiring accommodation. Configured at booking time. |

### 8.2 W2 Active Wellness Event Fields

| Field | Definition |
|---|---|
| `wellness_event_type` | `ILLNESS_MILD` \| `ILLNESS_SERIOUS` \| `INJURY` \| `HOSPITALISED` \| `REQUIRES_REPATRIATION` \| `RECOVERED` |
| `wellness_event_declared_by` | `BOOKING_PARTY` \| `DUTY_OF_CARE_PARTY` \| `TRAVELER` \| `AUTHORITY` |
| `treating_facility_ref` | Encrypted reference to hospital or medical facility if `HOSPITALISED`. `TRAVELER_PII`. |
| `fit_to_continue` | Boolean: medical professional or traveler has confirmed fitness to continue. |
| `repatriation_required` | Boolean: duty-of-care Party has determined traveler needs to return home. |

### 8.3 RECOVERED — Named Protocol Event

`RECOVERED` is the wellness equivalent of `TRAVELER_FOUND` — a named protocol event with authority-gated declaration. On `RECOVERED` declaration: `wellness_event_type` updated to `RECOVERED`, `fit_to_continue` assessment required, three-path condition assessment surfaced to duty-of-care Party.

### 8.4 Intersection with TU Chains

- W2 `HOSPITALISED` or `ILLNESS_SERIOUS` may escalate to TU-5 if death occurs or is strongly suspected.
- W2 `RECOVERED` is the wellness equivalent of `TRAVELER_FOUND`.
- W4 (disability) affects Capability Catalogue requirements — not a runtime incident.

---

## 9. IATA Standards Alignment

### 9.1 Adopt Directly

| IATA Standard | ATP Adoption |
|---|---|
| MEDIF | `TravelerWellnessStatus` W1 declaration structure modelled on MEDIF. Maps directly to `TRAVELER_PII` classification and encrypted reference model. |
| SSR Codes | ATP adopts IATA SSR codes as standard vocabulary for traveler needs. `ssr_codes` array field in `TravelerWellnessStatus`. Key codes: `MEDA`, `WCHR`/`WCHS`/`WCHC`, `BLND`, `DEAF`, `DPNA`, `STCR`, `OXYG`. |
| FREMEC | ATP adopts `wellness_clearance_ref` for FREMEC-equivalent clearances — avoids re-submission of full medical documentation on every booking. |
| IATA Resolution 735d | ATP DT-4 disruption chain and `duty_of_care_party_id` model explicitly reference Resolution 735d for airline-connected bookings. |
| IATA One ID (RP1701p) | `TravelerContext` Tier 3 digital wallet identity references IATA One ID RP1701p. `vc_presentation_ref` and `vc_format` fields align with One ID digital credential model. |

### 9.2 Align and Bridge

| IATA Standard | ATP Bridge |
|---|---|
| NDC Offer/Order model | NDC compatibility bridge defined as a named Layer 4 deliverable. Maps ATP booking states to NDC Order states. |
| IATA IROPS taxonomy | ATP `SourceSignalRecord` (Cat C) adopts IATA IROPS category codes as standard vocabulary for airline-originated disruption signals. |
| IATA Passenger Welfare obligations | Jurisdiction Compliance Registry entries for JP, EU, GB, US incorporate IATA welfare obligation thresholds as baseline duty-of-care parameters. |

### 9.3 Differentiate

| IATA Standard | ATP Position |
|---|---|
| NDC XML format | ATP uses JSON Schema, OpenAPI 3.1, AsyncAPI 3.0. NDC compatibility bridge handles interoperability without requiring ATP to become an XML protocol. |
| GDS/PNR model | ATP's booking model is a first-class runtime entity with a state machine, not a PNR. The PNR bridge (Layer 4) defines coexistence. |
| IATA member-only governance | ATP is Apache 2.0 open governance. Compatibility bridges are ATP's interoperability layer, not its governance layer. |

---

## 10. Open Questions and Deferred Items

| Item | Status | Next action |
|---|---|---|
| All SSF-Q and DT-Q questions | CLOSED | Applied above. |
| FR-5.1 through FR-5.4 | CLOSED | Applied above. |
| TU-1 through TU-6 escalation chains | CLOSED | Specified in Section 5. |
| `BOOKING_SUSPENDED` and `BOOKING_CANCELLED_SUSPENDED` states | CLOSED | Defined in Section 6. Step 6 for state machine addition. |
| `SUPPLIER_FAILURE_AT_DELIVERY` skeleton | CLOSED | Defined in Section 7. Full schema in Step 6. |
| `REASONING_INSUFFICIENT` escalation_reason | CLOSED in Step 6 | SAR-12 applied. |
| `TravelerWellnessStatus` full schema | CLOSED in Step 6 | SAR-14 applied. |
| IATA SSR codes integration | CLOSED in Step 6 | SAR-14 applied. |
| NDC compatibility bridge | OPEN — Layer 4 | Named Layer 4 deliverable. |
| `SUPPLIER_FAILURE_AT_DELIVERY` commercial spec | OPEN — separate spec | Payment, compensation, dispute resolution outside ATP core scope. |
| SSF/RISC remediation policy gap | OPEN — implementation guidance | Validate against live implementation before protocol-committing. |
| TU chain live operational testing | OPEN — implementation guidance | All chains must be tested against real operational events. |
| Cross-invocation anomaly thresholds | OPEN — implementation guidance | Cannot be committed without live data. Party implementations log findings for v2. |
