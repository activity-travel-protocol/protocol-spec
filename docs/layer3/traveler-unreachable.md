# TRAVELER_UNREACHABLE Chains in Workflow Context

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 7 | March 2026

---

The TRAVELER_UNREACHABLE escalation chains are defined in full in Security Architecture v1 Sections 5.0 through 5.8. That document is the authoritative source for chain definitions, timeout values, authority models, and named protocol events. This section does not restate those definitions.

This section specifies how each TRAVELER_UNREACHABLE sub-category interacts with the Layer 3 state machine: which booking states and journey phases are affected, which state transitions are blocked, how the chain connects to the HEM catalogue (Section 6), and what conditions allow the chain to be closed.

## 7.1 Shared rules — all TU sub-categories

The following rules apply to all TU sub-categories unless explicitly overridden in the sub-category specification.

- The traveler_unreachable_category field on TravelerContext is set by the Kernel on chain entry. It is nulled by the Kernel on chain resolution — not by an agent.
- Sub-category upgrades (e.g. TU-4 → TU-2) may be triggered by the arrival of new evidence. Downgrades require human confirmation.
- Multiple travelers in a single booking may hold different TU sub-categories simultaneously. The Booking Object-level response applies the most restrictive active sub-category across all travelers.
- The Default Classification Rule applies: when a TRAVELER_UNREACHABLE incident is first declared and available evidence does not support a more specific sub-category, the Kernel defaults to TU-4 (CONTACT_SUSPENDED).
- The Unaccompanied Minor Rule applies to all sub-categories: any sub-category other than TU-4 escalates immediately to GUARDIAN_ONLY authority for unaccompanied minors, bypassing standard timeout.
- Sub-category Precedence Rule: TU-6 takes precedence over TU-2. TU-5 takes precedence over all other sub-categories.

## 7.2 State machine interaction summary

| Sub-category | Autonomous action | Phase transitions blocked? | BOOKING_SUSPENDED triggered? | JOURNEY_COMPLETED permitted? | HEM entry |
|---|---|---|---|---|---|
| TU-1 DEVICE_UNAVAILABLE | Permitted after alt_contact confirmed | No | No | Yes, if resolved | HEM-09 / HEM-13 |
| TU-2 TRAVELER_MISSING | None — HOLD_AND_PRESERVE only | Yes — all transitions frozen | No (but may escalate) | No — chain must close first | HEM-04 |
| TU-3a TRAVELER_OVERDUE | Limited — no rebooking | No | No | Yes, if resolved | HEM-23 |
| TU-3b TRAVELER_DEPARTED_IRREGULARLY | None | Yes — all changes require human confirmation | No | No — requires resolution | HEM-10 |
| TU-4 CONTACT_SUSPENDED | Permitted after timeout — per DT-4 rules | No | No | Yes, nulled on arrival | HEM-13 (if unresolved) |
| TU-5 TRAVELER_DECEASED | None — absolute halt | Yes — all transitions frozen | Yes — mandatory C-BS-1 | No — Path A or Path B only | HEM-02 |
| TU-6 TRAVELER_VICTIM_OF_CRIME | None | Yes — all transitions frozen | No (but may escalate to TU-5) | No — chain must close first | HEM-03 |

---

## 7.3 TU-1 — DEVICE_UNAVAILABLE \[LOW\]

*Traveler physically present, reachable through alternative means. No welfare concern.*

### 7.3.1 Workflow effect

TU-1 is the lowest-severity sub-category. The traveler is present and contactable — their device is broken, lost, flat, or compromised. The protocol's primary response is to attempt alt_contact_ref immediately.

Phase transitions are not blocked by TU-1 alone. Activity Component transitions (PENDING → FULFILLING → FULFILLED) continue normally. The only restriction is that autonomous rebooking actions that depend on traveler confirmation require alt_contact to be established first.

### 7.3.2 Timeout and escalation

- Standard phases: PT10M to establish alt_contact. If unresolved: HEM-13 (TRAVELER_UNREACHABLE_UNRESOLVED, PT30M).
- ACTIVITY_FULFILLMENT: PT5M to establish alt_contact. If unresolved: HEM-09 (PT30M).
- If no resolution within HEM deadline: PARTY_UNRESPONSIVE entered. Sub-category TU-1 recorded in incident record.

### 7.3.3 Resolution

traveler_unreachable_category nulled when alt_contact confirmed or traveler re-establishes contact through any channel. No human_confirmation_token required for TU-1 resolution. The Kernel records TU_RESOLVED in the event log.

---

## 7.4 TU-2 — TRAVELER_MISSING \[HIGH\]

*Traveler cannot be physically located. Welfare concern active.*

### 7.4.1 Workflow effect

TU-2 is a welfare-concern sub-category. The traveler is not where they are expected to be and cannot be physically located. All downstream booking actions are placed on HOLD_AND_PRESERVE immediately — no rebooking, no cancellation, no autonomous action of any kind.

All phase transitions are frozen on TU-2 entry. The Booking Object retains its current phase but no forward or backward transitions are permitted until the chain is resolved. JOURNEY_COMPLETED cannot be recorded while TU-2 is open.

### 7.4.2 HEM and authority

HEM-04 (TRAVELER_MISSING, PT15M) invoked immediately — no timeout wait. Jurisdiction Registry law enforcement and emergency services contacts fetched for the active jurisdiction code and surfaced to the human actor. alt_contact_ref attempted in parallel.

All subsequent state changes require explicit human confirmation from the duty-of-care Party or a confirmed authority contact.

### 7.4.3 Sub-category upgrade paths

- TU-2 → TU-6: if evidence of crime emerges during the missing period.
- TU-2 → TU-5: if death is confirmed or strongly suspected.

Downgrades require human confirmation. A traveler subsequently found safe triggers the TRAVELER_FOUND named protocol event (Section 10.1).

### 7.4.4 Resolution

TRAVELER_FOUND event declared by an authorised party. Three-path condition assessment triggered (HEM-19). traveler_unreachable_category nulled on assessment completion. JOURNEY_COMPLETED gate reopens if no other blocking conditions remain.

---

## 7.5 TU-3a — TRAVELER_OVERDUE \[LOW\]

*Traveler has not appeared or returned as expected. No evidence of distress. Default assumption: benign.*

### 7.5.1 Workflow effect

TU-3a is the benign overdue case — the traveler has simply not shown up or not returned at the expected time, with no evidence of distress or deliberate evasion. Phase transitions are not blocked. Activity Components that are PENDING may remain so; FULFILLING components continue normally.

If financial loss is incurred by a supplier (no-show, late return charges), claim_initiation_ref is activated on the Booking Object and the SUPPLIER_FAILURE_AT_DELIVERY claim path is connected.

### 7.5.2 Timeout and escalation

- alt_contact_ref attempted. PT20M timeout — standard PARTY_UNRESPONSIVE rules apply.
- If contact established: traveler confirms voluntary extension → booking updated, traveler_unreachable_category nulled.
- If no contact within PT20M: HEM-23 (TRAVELER_OVERDUE, PT60M).

### 7.5.3 Sub-category upgrade paths

- TU-3a → TU-3b: if evidence of irregular departure emerges.
- TU-3a → TU-2: if welfare concern emerges.
- TU-3a → TU-6: if evidence of crime emerges.

### 7.5.4 Resolution

traveler_unreachable_category nulled on traveler contact re-established or voluntary extension confirmed. No named protocol event required — simple field update via Kernel on confirmation. JOURNEY_COMPLETED not blocked by TU-3a alone.

---

## 7.6 TU-3b — TRAVELER_DEPARTED_IRREGULARLY \[MODERATE\]

*Traveler has left the jurisdiction or booking context in a manner raising commercial or legal concern. Human confirmation required before setting.*

### 7.6.1 Workflow effect

TU-3b must not be set autonomously. Human confirmation is required before the sub-category is applied. Once set, all booking state changes require explicit human confirmation — no autonomous actions of any kind.

Phase transitions are not blocked in the same way as TU-2, but every transition requires human sign-off. The Kernel treats TU-3b as a blanket human-confirmation requirement on all state changes for the duration of the incident.

### 7.6.2 HEM and authority

HEM-10 (TRAVELER_DEPARTED_IRREGULARLY, PT30M) invoked immediately on classification confirmation. Booking Party commercial and legal team notified. alt_contact_ref attempted in parallel.

If immigration violation is suspected: Jurisdiction Registry consulted for immigration authority contacts. These are surfaced to the human actor only — the Activity Travel Protocol does not make immigration determinations and does not report to authorities autonomously.

### 7.6.3 Financial loss and claims

claim_initiation_ref activated if financial loss is incurred. Claim direction (traveler claim vs supplier claim) determined by the incident record type. Booking Party may initiate no-show procedures per their own terms — this is outside Activity Travel Protocol scope.

### 7.6.4 Resolution

Requires human confirmation that the departure situation is resolved. Downgrade to TU-3a requires confirmation that irregular departure evidence was incorrect. traveler_unreachable_category nulled by Kernel on resolution confirmation. JOURNEY_COMPLETED blocked until TU-3b is resolved.

---

## 7.7 TU-4 — CONTACT_SUSPENDED \[LOW\]

*Traveler has deliberately suspended contact. No welfare concern inferred. Most common sub-category and default classification.*

### 7.7.1 Workflow effect

TU-4 is the default — it is applied by the Kernel when a TRAVELER_UNREACHABLE incident is declared and no evidence supports a more specific sub-category. The assumption is deliberate and benign contact suspension (phone off, do-not-disturb mode, poor signal).

Phase transitions are not blocked. Standard PARTY_UNRESPONSIVE timeout rules apply. After timeout elapses, autonomous action is permitted within existing agent authority scope per DT-4 rules.

### 7.7.2 Timeout

- PT20M in standard phases. PT10M during ACTIVITY_FULFILLMENT.
- After timeout: autonomous rebooking and accommodation changes permitted within existing agent authority scope.
- alt_contact_ref attempted after timeout elapses if available.

### 7.7.3 Resolution

traveler_unreachable_category nulled automatically by the Kernel when the traveler re-establishes contact through any channel. No human action required. The field is also nulled by the Kernel on RETURN_ARRIVAL entry if TU-4 was the only active sub-category — arrival home constitutes implicit contact re-establishment.

---

## 7.8 TU-5 — TRAVELER_DECEASED \[CRITICAL\]

*Confirmed or strongly suspected death of traveler during booking lifecycle. Most severe sub-category. Triggers BOOKING_SUSPENDED.*

> **Absolute halt rule:** TU-5 is the only sub-category with an unconditional halt on all autonomous actions. No exceptions exist. No agent Decision Object is accepted by the Kernel while TU-5 is active.

### 7.8.1 Workflow effect

TU-5 must not be set autonomously. Human confirmation is required before the sub-category is applied. On TU-5 confirmation:

- All autonomous actions halt immediately and unconditionally.
- BOOKING_SUSPENDED is entered (C-BS-1). No autonomous entry into BOOKING_SUSPENDED — human confirmation of C-BS-1 triggers both TU-5 and BOOKING_SUSPENDED simultaneously.
- All phase transitions are frozen. The Booking Object retains its current phase.
- JOURNEY_COMPLETED is blocked. The only valid terminal state from TU-5 is BOOKING_CANCELLED_SUSPENDED (Path A) or, in exceptional circumstances, BOOKING_SUSPENDED lifted (Path B) where death was incorrectly classified.

### 7.8.2 HEM and authority

HEM-02 (TRAVELER_DECEASED, PT15M) invoked immediately. alt_contact_ref NEXT_OF_KIN attempted in parallel. SSF stream checked for concurrent credential events. IATA Resolution 735d welfare obligations apply to airline-connected segments.

The BOOKING_SUSPENDED authority model (Section 5.5) governs all exit paths. Next-of-kin or legal authority confirmation is required for Path A. Path B (suspension lifted) is exceptional and requires evidence that TU-5 was incorrectly applied.

### 7.8.3 Resolution

TU-5 has no standard resolution path. The booking terminates via BOOKING_CANCELLED_SUSPENDED (Path A) in the overwhelming majority of cases. traveler_unreachable_category is cleared only on Path B or Path C exit from BOOKING_SUSPENDED, where it is established that TU-5 was incorrectly applied.

---

## 7.9 TU-6 — TRAVELER_VICTIM_OF_CRIME \[HIGH\]

*Traveler is a confirmed or suspected victim of crime. Safety concern. Location blackout mandatory.*

### 7.9.1 Workflow effect

TU-6 must not be set autonomously. Human confirmation is required. On TU-6 confirmation:

- Location blackout (location_disclosure_blocked) set immediately on TravelerContext and propagated to all Context Package assemblies. Any ASSEMBLY POINT that would expose traveler location, accommodation address, or itinerary details is blocked regardless of agent authority scope.
- All phase transitions are frozen. The Booking Object retains its current phase.
- HOLD_AND_PRESERVE applied to all downstream booking actions.
- JOURNEY_COMPLETED blocked until chain is resolved.

### 7.9.2 HEM and authority

HEM-03 (TRAVELER_VICTIM_OF_CRIME, PT10M) invoked immediately. alt_contact_ref is restricted to NEXT_OF_KIN or CORPORATE_ACCOUNT only — the contact method must not reveal traveler location. Law enforcement engagement is mandatory for unaccompanied minors (GUARDIAN_ONLY authority).

Escalation context must NOT include traveler location or itinerary. The escalation channel itself may be compromised — location blackout applies to the HEM escalation payload as well as the Context Package.

### 7.9.3 Sub-category upgrade and resolution

- TU-6 → TU-5: if death is confirmed or strongly suspected.

Resolution requires law enforcement confirmation that the traveler has been found and it is safe to proceed. This triggers the TRAVELER_FOUND named protocol event (Section 10.1) at the TU-6 sub-category level, requiring law enforcement confirmation (not duty-of-care Party confirmation alone). Location blackout is not lifted automatically on TRAVELER_FOUND — it remains active until law enforcement explicitly confirms it is safe to lift.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 7 — March 2026*
