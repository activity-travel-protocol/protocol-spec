# Timeout Budget Model

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 11 | April 2026

---

This section consolidates every protocol_deadline and timeout value defined across the Layer 3 Workflow Specification into a single normative reference. Values stated here take precedence over any inconsistency with per-section descriptions. Where a section describes a timeout value and this section differs, this section is authoritative.

All timeout durations use ISO 8601 duration format: PT = period of time; M = minutes; H = hours; D = days.

## 11.1 Kernel Scheduler enforcement rules

The Kernel Scheduler (OS function 3, Architecture Specification v1.0 Section 5) enforces all timeout values defined in this section. The following rules govern how it does so:

- **Timeout events are state transitions.** They go through the Policy Engine (Cedar evaluation) and produce event log entries. A timeout is not a silent expiry — it is a protocol event.
- **The Kernel Scheduler uses the tighter of two values** wherever both a protocol maximum and a Party-declared value exist. A Party may configure a tighter deadline than the protocol default; they may never configure a looser one.
- **Timeout clocks begin at the event that starts the window** — not at message delivery, not at human reading of a notification. The starting event is the timestamp on the event log entry that opens the window.
- **Timeout clocks are frozen when BOOKING_SUSPENDED is active.** They do not expire while the booking is suspended. On exit from BOOKING_SUSPENDED via Path B or Path C, frozen clocks resume from where they were paused — they do not restart.
- **The C1 autonomous incident declaration reversal window (PT15M)** is also frozen when an SSF revocation event arrives during the window. It resumes only after HEM-12 human resolution.
- **No Party Policy Declaration may extend a timeout beyond its protocol maximum.** Cedar rejects any policy that attempts to do so.

> **Timeout duration notation:** All values in this section use ISO 8601 duration notation. PT5M = 5 minutes. PT1H = 1 hour. PT24H = 24 hours. PT4H = 4 hours. Where a timeout has no protocol maximum (e.g. PRE_DEPARTURE phase duration), this is stated explicitly as 'No maximum'.

## 11.2 Master timeout reference table

All timeouts are listed in priority order within each category. P1 timeouts are the strictest and govern the most safety-critical scenarios.

### 11.2.1 HEM protocol_deadline values

| HEM entry | Scenario | Protocol default | Party-configurable? | Floor | Frozen by BOOKING_SUSPENDED? |
|---|---|---|---|---|---|
| HEM-01 | ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED (T-5-D) | PT5M | Yes — tighter only | PT5M (no looser permitted) | N/A — suspension is already active |
| HEM-02 | TU-5 TRAVELER_DECEASED | PT15M | Yes — tighter only | No floor stated — operator discretion | Yes — clock pauses |
| HEM-03 | TU-6 TRAVELER_VICTIM_OF_CRIME | PT10M | Yes — tighter only | No floor stated | Yes |
| HEM-04 | TU-2 TRAVELER_MISSING | PT15M | Yes — tighter only | No floor stated | Yes |
| HEM-05 | IN_DESTINATION + BOOKING_SUSPENDED | PT10M | Yes — tighter only | No floor stated | N/A |
| HEM-06 | OUTBOUND_TRANSIT + BOOKING_SUSPENDED | PT15M | Yes — tighter only | No floor stated | N/A |
| HEM-07 | RETURN_TRANSIT + BOOKING_SUSPENDED | PT15M | Yes — tighter only | No floor stated | N/A |
| HEM-08 | ARRIVAL + BOOKING_SUSPENDED | PT15M | Yes — tighter only | No floor stated | N/A |
| HEM-09 | TU-1 unresolved — ACTIVITY_FULFILLMENT | PT30M | Yes — tighter only | No floor stated | Yes |
| HEM-10 | TU-3b TRAVELER_DEPARTED_IRREGULARLY | PT30M | Yes — tighter only | No floor stated | Yes |
| HEM-11 | OPA assembly failure — blocking DT | PT10M | Yes — tighter only | PT10M (protocol maximum) | Yes |
| HEM-12 | SSF revocation during C1 window | No separate deadline — C1 clock frozen | N/A | N/A | Yes — by definition |
| HEM-13 | TU-1 / TU-4 unreachable — standard phases | PT30M | Yes — tighter only | No floor stated | Yes |
| HEM-14 | CONFIRMATION_TIMEOUT | PT24H | Yes — tighter only | No floor stated | Yes |
| HEM-15 | AMENDMENT_TIMEOUT | PT2H | Yes — tighter only | No floor stated | Yes |
| HEM-16 | DISRUPTION_REVIEW_TIMEOUT | PT1H | Yes — tighter only | No floor stated | Yes |
| HEM-17 | PARTY_UNRESPONSIVE — fulfillment phase | PT30M | Yes — tighter only | No floor stated | Yes |
| HEM-18 | SF-2 substitution acceptance | PT2H | Yes — tighter only | No floor stated | Yes |
| HEM-19 | TRAVELER_FOUND condition assessment | PT30M | Yes — tighter only | No floor stated | Yes |
| HEM-20 | RECOVERED condition assessment | PT30M | Yes — tighter only | No floor stated | Yes |
| HEM-21 | BOOKING_SUSPENDED — RETURN_ARRIVAL | PT2H | Yes — tighter only | No floor stated | N/A |
| HEM-22 | BOOKING_SUSPENDED — COMPLETION phase | PT4H | Yes — tighter only | No floor stated | N/A |
| HEM-23 | TU-3a TRAVELER_OVERDUE | PT60M | Yes — tighter only | No floor stated | Yes |

### 11.2.2 State and phase timeout values

| Timeout | State / Phase | Protocol default | Party-configurable? | Action on expiry | Section ref |
|---|---|---|---|---|---|
| INQUIRY session | INQUIRY | PT4H | Yes — tighter only (any value <= PT4H) | Booking Object cancelled — BOOKING_CANCELLED with INQUIRY_TIMEOUT | 3.1.5 |
| Supplier confirmation | PENDING_CONFIRMATION | PT24H | Yes — tighter only | HEM-14 invoked. Cancel if no response. | 3.2.4 |
| Amendment confirmation | AMENDMENT | PT2H | Yes — tighter only | HEM-15 invoked. Original booking reinstated pending human decision. | 3.4.3 |
| Disruption review | DISRUPTION_REVIEW | PT1H | Yes — tighter only | HEM-16 invoked. Booking enters PARTY_UNRESPONSIVE. | 3.5.4 |
| PRE_DEPARTURE phase | PRE_DEPARTURE | No maximum | N/A | Phase ends when OUTBOUND_TRANSIT_STARTED recorded | 4.1.4 |
| ARRIVAL — TRAVELER_RECEIVED | ARRIVAL | PT2H from ARRIVAL_STARTED | Yes — tighter only | HEM invoked. Booking Party duty of care retained. | 4.3.4 |
| Supplier evidence window | Any — SUPPLIER_FAILURE_AT_DELIVERY | PT24H from declaration | Not configurable — fixed | SUPPLIER_EVIDENCE_DEADLINE_ELAPSED recorded. Claim proceeds automatically. | 8.3.4 / 10.3.5 |
| C1 autonomous reversal window | Any — DT-4 declaration | PT15M | Not configurable — fixed | Declaration confirmed. Reversible actions execute. | 8.2.3 |
| Secondary HEM dispatch | Any — HEM_DISPATCH_FAILED | PT5M from primary dispatch failure | Not configurable — fixed | HEM_NO_SECONDARY_PATH recorded if no secondary registered. | 5.7.3 |
| DOC_TRANSFER_ACK_TIMEOUT | Any — DUTY_OF_CARE_TRANSFER_INITIATED | PT15M | Yes — tighter only | HEM escalation per Section 12.3.4. Host Party Security Kernel assigns coordination ownership. | 12.3.2 |
| CD_ISSUANCE_TIMEOUT | Any — COORDINATION_DELEGATION_REQUESTED | PT30M | Yes — tighter only | Host Party refusal recorded if no response. Requesting party may re-request. | 12.4.3 |
| SYNCHRONISATION_TIMEOUT | Any — PENDING_SYNCHRONISATION | PT30M | Yes — tighter only | HEM invoked with escalation_reason: SYNCHRONISATION_TIMEOUT. | 12.5.3 |

> **DISRUPTION_ADJACENT carries no Security Kernel timeout.** This absence is normative. See Section 13 OQ-L3-6 for rationale.

### 11.2.3 TRAVELER_UNREACHABLE timeout values

| Sub-category | Phase | Alt contact timeout | HEM deadline | PARTY_UNRESPONSIVE timeout | Section ref |
|---|---|---|---|---|---|
| TU-1 DEVICE_UNAVAILABLE | Standard phases | PT10M | PT30M (HEM-13) | PT30M after HEM | 7.3.2 |
| TU-1 DEVICE_UNAVAILABLE | ACTIVITY_FULFILLMENT | PT5M | PT30M (HEM-09) | PT30M after HEM | 4.5.5 / 7.3.2 |
| TU-2 TRAVELER_MISSING | Any IN_JOURNEY | Immediate (parallel) | PT15M (HEM-04) — immediate, no timeout wait | N/A — HEM immediate | 7.4.2 |
| TU-3a TRAVELER_OVERDUE | Any IN_JOURNEY | PT20M | PT60M (HEM-23) | PT20M PARTY_UNRESPONSIVE | 7.5.2 |
| TU-3b TRAVELER_DEPARTED_IRREGULARLY | Any IN_JOURNEY | Parallel to HEM | PT30M (HEM-10) | N/A — all changes blocked | 7.6.2 |
| TU-4 CONTACT_SUSPENDED | Standard phases | After timeout | No HEM unless unresolved beyond PT30M | PT20M | 7.7.2 |
| TU-4 CONTACT_SUSPENDED | ACTIVITY_FULFILLMENT | After timeout | No HEM unless unresolved | PT10M | 4.5.5 / 7.7.2 |
| TU-5 TRAVELER_DECEASED | Any | Parallel (NEXT_OF_KIN) | PT15M (HEM-02) — immediate | N/A — BOOKING_SUSPENDED | 7.8.2 |
| TU-6 TRAVELER_VICTIM_OF_CRIME | Any IN_JOURNEY | Parallel (restricted) | PT10M (HEM-03) — immediate | N/A — all transitions frozen | 7.9.2 |

### 11.2.4 Audit and retention periods

| Obligation | Duration | Jurisdiction basis | Protocol rule |
|---|---|---|---|
| Event log retention — Japan | 5 years minimum | Japan Tourism Agency / Japanese law | Architecture Spec v0.2 Section 10 |
| Event log retention — EU | 3 years minimum | GDPR / EU travel regulation | Architecture Spec v0.2 Section 10 |
| TRAVELER_PII retention — standard | Per retention_deadline on TravelerContext | Jurisdiction-specific | Context Package Step 6 Section 1.3 |
| TRAVELER_PII retention — BOOKING_SUSPENDED | Suspended — purge deferred until authority confirms | Jurisdiction authority instruction | Section 5.3 |
| Contact reference nulling | Within PT24H of booking lifecycle end | Protocol rule — not jurisdiction-variable | Context Package Step 6 Section 1.3 |
| TRAVELER_PII — BOOKING_CANCELLED_SUSPENDED | Retained until jurisdiction authority confirms purge appropriate — normal retention_deadline does not apply | Jurisdiction authority instruction | Section 3.10 |
| Supplier evidence retention | PT24H window + standard event log retention | Protocol rule | Section 10.3.5 |

## 11.3 Timeout configurability rules

The following rules govern how Parties may configure timeout values in their Party Policy Declarations:

| Rule | Statement |
|---|---|
| **Tighter-only** | A Party may configure a timeout value tighter (shorter) than the protocol default. They may never configure a value looser (longer). Cedar rejects any Party Policy Declaration that attempts to set a timeout value exceeding the protocol maximum. |
| **Kernel uses tighter** | Where both a protocol default and a Party-declared value exist, the Kernel Scheduler uses the tighter of the two. The Party cannot override this behaviour. |
| **No floor except HEM-01 and HEM-11** | Only HEM-01 (PT5M floor — ACTIVITY_FULFILLMENT + BOOKING_SUSPENDED) and HEM-11 (PT10M — OPA assembly failure, also the protocol maximum) have stated floors. All other timeouts may be configured to any value tighter than the protocol default, including very short values. Operators choosing very short timeouts accept the operational consequences. |
| **Fixed timeouts** | Two timeouts are not configurable by any Party: the C1 autonomous reversal window (PT15M — fixed) and the secondary HEM dispatch window (PT5M — fixed). These are protocol constants. |
| **Supplier evidence window** | The PT24H supplier evidence window for SUPPLIER_FAILURE_AT_DELIVERY is fixed. No Party may extend or shorten it. This maintains the burden-of-proof inversion model's integrity. |
| **Frozen during BOOKING_SUSPENDED** | All Party-configured timeout values, like protocol defaults, are frozen when BOOKING_SUSPENDED is active. They resume from their paused position on BOOKING_SUSPENDED exit. |

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 11 — April 2026*
