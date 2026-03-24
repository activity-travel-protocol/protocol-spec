# S9 Live Availability

**Activity Travel Protocol — Layer 2 Capability and Discovery Specification**
**Section 9: Live Availability**
**Status: WORKING DRAFT — March 2026**

---

## 9.1 Purpose

OQ-L3-1, resolved in Layer 3 S1, established that INQUIRY operates against static Capability Declarations rather than live availability. That resolution was correct for Layer 3: the protocol requires only that a `FEASIBILITY_CLEARED` event is recorded per Activity Component before INQUIRY exits, and does not mandate how a supplier determines feasibility internally.

The Layer 2 obligation created by OQ-L3-1 is this: Layer 2 must define the relationship between static Capability Declarations and live availability signals — specifically, when and how live signals may supplement static declarations, and what constraints apply to that supplementation.

This section defines:

- The boundary between static declarations and live signals.
- The two supplementation modes: Passive Availability Reflection and Active Availability Gate.
- The registration and lifecycle of live availability signal sources.
- The interaction between live signals and the Feasibility Check.
- The design rules governing live availability use.

---

## 9.2 The Static/Live Boundary

### 9.2.1 What Static Declarations Govern

A Capability Declaration (S3) is a static artifact. It declares what a supplier offers, under what conditions, and within what validity period. It does not represent current inventory state. A supplier with ten slots available on a given date and a Capability Declaration covering that date has one Capability Declaration, not ten. The declaration says "I offer this; here are the terms." It does not say "I have N units available right now."

This distinction is deliberate. Static declarations are versionable, cacheable, and auditable. They support the Feasibility Check validity model (S7, L2-T-3-C) without requiring real-time data exchange for every discovery query.

### 9.2.2 What Live Signals Are

A live availability signal is a real-time data point — sourced from a registered `AVAILABILITY` driver (S5, §5.3) — that reflects current inventory state for a specific offering. Examples: the number of remaining slots on a specific date, a capacity flag indicating a session is full, a pricing tier change triggered by demand.

Live signals are not protocol artifacts in the sense that Capability Declarations are. They are data inputs that a supplier agent may consult when determining whether to emit `FEASIBILITY_CLEARED`. They do not appear in the Booking Object. They do not affect Capability Declaration versioning.

### 9.2.3 The Supplementation Principle

Live signals MUST NOT replace static Capability Declarations for the purposes of discovery or Feasibility Check pre-condition evaluation. The Feasibility Check steps 1–4 (S7, §7.3) operate against registered protocol artifacts — Capability Declarations, Resource References, Pre-Arrangement Declarations, Delegation Topology Declarations. Live signals are consulted only in step 5 (supplier readiness event), where they inform the supplier's decision to push `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED`.

The supplementation principle: live signals inform step 5; they do not substitute for steps 1–4.

---

## 9.3 Supplementation Modes

Layer 2 defines two modes by which live availability signals may supplement static Capability Declarations. The mode is declared per-offering in the Capability Declaration.

### 9.3.1 Mode 1 — Passive Availability Reflection

In Passive Availability Reflection mode, the supplier registers an `AVAILABILITY` driver (S5) in their Capability Declaration. The driver endpoint reflects current inventory state. The Capability Catalogue surfaces a derived `liveAvailabilitySignal` field alongside the static declaration summary when queried.

The `liveAvailabilitySignal` is informational. It assists booking agents in prioritising which suppliers to include in a Feasibility Check — suppliers with healthy availability signals are more likely to return `FEASIBILITY_CLEARED`. It does not constitute a commitment. The Feasibility Check step 5 remains the binding determination.

A supplier in Passive mode MUST still push `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` as events during the Feasibility Check (S7, §7.6.1). The live signal is not a substitute for the feasibility event.

Passive mode is the default. A Capability Declaration with a registered `AVAILABILITY` driver and no explicit `liveAvailabilityMode` field is treated as Passive.

Divergence between the Catalogue's cached signal and the supplier's step 5 determination is expected and is not an error condition. The Catalogue signal reflects inventory state at cache time; the supplier's determination reflects inventory state at the moment of the Feasibility Check. The step 5 result governs in all cases.

### 9.3.2 Mode 2 — Active Availability Gate

In Active Availability Gate mode, the supplier's `AVAILABILITY` driver is configured as a hard gate: if the live signal indicates unavailability at step 5, the supplier MUST push `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_GATE_CLOSED`. The protocol engine does not evaluate the live signal directly; the supplier agent does. The gate is a supplier-internal constraint expressed through the protocol's event mechanism.

Active mode is declared by setting `liveAvailabilityMode: ACTIVE_GATE` in the Capability Declaration.

A supplier who declares Active mode but pushes `FEASIBILITY_CLEARED` when their live signal indicates unavailability is in breach of their Capability Declaration. This breach is a conformance audit function, not a real-time protocol enforcement function: the protocol does not evaluate live signals itself (DR-L2-9-H) and cannot detect the breach at emission time. The `FEASIBILITY_CLEARED` event and the driver's signal history are both recorded in the append-only log; conformance testing may cross-reference them post-hoc (DR-L2-9-G).

Active mode does not shorten the Feasibility Window (S7, §7.2). If the supplier's live availability system is unavailable during the Feasibility Check, the supplier MUST push `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE` within PT2M of detecting the system unavailability, and MUST NOT wait for the Feasibility Window to expire passively (DR-L2-9-F).

### 9.3.3 Mode Declaration in Capability Declarations

The Capability Declaration schema (S3) is extended by this section with the following fields, applicable to any declaration that cites an `AVAILABILITY` driver:

| Field | Type | Constraints |
|---|---|---|
| `liveAvailabilityMode` | enum | One of: `PASSIVE`, `ACTIVE_GATE`. Default: `PASSIVE`. |
| `liveAvailabilityDriverRef` | string | The `resourceRefId` of the registered `AVAILABILITY` driver to use for live signals. MUST resolve to a registered, non-expired `AVAILABILITY` category entry in the Resource Reference Registry. |
| `liveAvailabilityGranularity` | enum | One of: `BOOLEAN`, `CAPACITY_COUNT`, `SLOT_LIST`. Declares the signal format the driver provides. See §9.4.3. |
| `liveAvailabilityCacheTtl` | ISO 8601 duration | The maximum age of a cached live signal that the Catalogue may serve. MUST be > PT0S and ≤ PT1H. This is a conformance ceiling; operators SHOULD set shorter values for dynamic inventory — a PT1H cache is appropriate only for low-volatility reference data, not for capacity-constrained sessions or slot-based offerings. |

A Capability Declaration that declares `liveAvailabilityMode` MUST also declare `liveAvailabilityDriverRef`. A declaration that sets `liveAvailabilityMode` without `liveAvailabilityDriverRef` MUST be rejected at registration.

*S3 gap note: the fields defined in §9.3.3 extend the Capability Declaration schema. S3 must be updated to include these fields in its optional fields section before Layer 2 is published. This item is tracked as GN-L2-1 in S12 §12.6 (PENDING BACK-PROPAGATION).*

---

## 9.4 Live Availability Signal Lifecycle

### 9.4.1 Signal Source Registration

A live availability signal source is an `AVAILABILITY` driver registered in the Resource Reference Registry (S5). The registration requirements of S5 apply in full. The `liveAvailabilityDriverRef` in the Capability Declaration references the `resourceRefId` of this registration.

No separate registration step is required for a live availability signal source beyond the S5 Resource Reference registration. The link between the signal source and the Capability Declaration is established by the `liveAvailabilityDriverRef` field.

### 9.4.2 Signal Freshness

The Capability Catalogue caches live availability signals for the duration specified in `liveAvailabilityCacheTtl`. Cached signals are served by `catalogue_search` and `catalogue_get` in the `liveAvailabilitySignal` field of the response. A signal older than `liveAvailabilityCacheTtl` MUST NOT be served; the Catalogue returns a `liveAvailabilitySignal` with `status: SIGNAL_STALE` instead.

The Feasibility Check engine does not cache live availability signals. When step 5 is reached, the supplier agent queries its live availability system directly via the registered `AVAILABILITY` driver. The Catalogue's cached signal and the supplier's real-time query may differ; the supplier's real-time determination governs.

### 9.4.3 Signal Format by Granularity

The `liveAvailabilityGranularity` field declares the format of the live signal emitted by the driver. All driver responses MUST include a `signalTimestamp` field (ISO 8601 datetime) indicating when the signal was generated. Signals without a `signalTimestamp` MUST be treated as `SIGNAL_STALE` by the Catalogue (DR-L2-9-I).

**`BOOLEAN`:** The driver returns `{ "available": true | false, "signalTimestamp": "..." }`. The Catalogue surfaces this as a simple availability indicator. Booking agents use it to filter out clearly unavailable suppliers before initiating a Feasibility Check.

**`CAPACITY_COUNT`:** The driver returns `{ "remainingUnits": <integer>, "signalTimestamp": "..." }`. A value of 0 indicates unavailability. The Catalogue surfaces the count alongside the declaration summary, allowing booking agents to assess capacity before committing to a Feasibility Check.

**`SLOT_LIST`:** The driver returns `{ "availableSlots": [ { "slotId": "...", "startTime": "...", "capacity": <integer> }, ... ], "signalTimestamp": "..." }`. The Catalogue surfaces a slot count and earliest available slot time. `slotId` values are supplier-defined opaque identifiers; the protocol does not define or validate their format or semantics. The Activity Configuration Schema (S4) treats slot references included in a configuration as opaque strings. Slot binding is confirmed only when the supplier pushes `FEASIBILITY_CLEARED`; the protocol does not validate slot identifier semantics at any prior step.

---

## 9.5 Interaction with the Feasibility Check

### 9.5.1 Passive Mode

In Passive mode, the live availability signal has no protocol effect on the Feasibility Check. Steps 1–4 proceed as defined in S7. Step 5 awaits the supplier's `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` event. The supplier may consult their live availability system as part of their internal readiness assessment; the protocol does not mandate or observe this.

Divergence between the Catalogue's cached signal and the supplier's step 5 determination is expected and is not an error condition (§9.3.1). The step 5 result governs.

### 9.5.2 Active Gate Mode

In Active Gate mode, the Feasibility Check step 3 (Pre-Arrangement Declaration validation, S7 §7.3) is extended to also confirm that the Capability Declaration's `liveAvailabilityDriverRef` resolves to a registered, non-expired `AVAILABILITY` entry in the Resource Reference Registry. If the driver is expired or deregistered at step 3 emission time, the Feasibility Check MUST emit `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_DRIVER_INVALID`.

At step 5, a supplier in Active Gate mode who pushes `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_GATE_CLOSED` signals that the live gate was consulted and returned unavailable. The booking agent receives this as a definitive supplier determination, not a timeout. Retry behaviour follows the `SUPPLIER_DECLINED` rules in S7 §7.7; the supplier's retry policy (published in their Capability Declaration) governs how soon a retry is appropriate.

A supplier in Active Gate mode who pushes `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE` signals that the live availability system itself is unreachable. The booking agent MAY retry. If no retry policy is specified in the Capability Declaration for this reason code, the default is: minimum PT5M wait before retry, maximum 3 retries within a 24-hour period.

### 9.5.3 New Failure Reason Codes

This section extends the Feasibility Check failure reason vocabulary (S7, §7.6.4) with the following additional codes:

| Reason Code | Source | Description |
|---|---|---|
| `LIVE_AVAILABILITY_DRIVER_INVALID` | Step 3 (Active Gate) | The `liveAvailabilityDriverRef` cited in the Capability Declaration does not resolve to a registered, non-expired `AVAILABILITY` driver at emission time. |
| `LIVE_AVAILABILITY_GATE_CLOSED` | Step 5 (Active Gate, supplier) | The supplier's live availability system was consulted and returned unavailable for this Activity Component. |
| `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE` | Step 5 (Active Gate, supplier) | The supplier's live availability system was unreachable at the time of the Feasibility Check. |

*S7 §7.6.4 has been updated to include these three reason codes (GN-L2-3, resolved).*

---

## 9.6 Catalogue Surfacing of Live Signals

The Capability Catalogue surfaces live availability signals in the following locations:

**`catalogue_search` results:** Each `CapabilityDeclarationSummary` (S8, §8.5.1) includes an optional `liveAvailabilitySignal` object when the declaration has a registered `liveAvailabilityDriverRef`. The object contains `status` (`AVAILABLE`, `UNAVAILABLE`, `SIGNAL_STALE`, `NO_SIGNAL`), `granularity` (echoing `liveAvailabilityGranularity`), `signalValue` (format per granularity), and `signalAge` (ISO 8601 duration since `signalTimestamp`).

**`catalogue_get` results:** The full live availability signal is included in `catalogueMetadata` (S8, §8.5.2), with the same fields plus `liveAvailabilityMode` and the full `signalTimestamp`.

**`catalogue_check_availability` results:** The `availabilityStatus` field (S8, §8.3.2) has mode-dependent semantics for declarations with `liveAvailabilityDriverRef`:

- For `PASSIVE` mode declarations: `FULLY_AVAILABLE` requires all cited Resource References to be in `ACTIVE` status. The live signal is surfaced separately and does not affect `availabilityStatus`.
- For `ACTIVE_GATE` mode declarations: `FULLY_AVAILABLE` requires all cited Resource References in `ACTIVE` status AND a non-stale live signal with `status: AVAILABLE`. A stale signal or an `UNAVAILABLE` signal causes `availabilityStatus: UNAVAILABLE`.

This mode-dependent behaviour extends the definition of `FULLY_AVAILABLE` in S8 DR-L2-8-C. DR-L2-8-C has been updated to reflect this distinction (GN-L2-6, resolved).

*S8 §8.5.1, §8.5.2, §8.3.2, and DR-L2-8-C have been updated to include the `liveAvailabilitySignal` additions and mode-dependent `availabilityStatus` semantics (GN-L2-6, resolved).*

---

## 9.7 Design Rules

The following design rules govern Live Availability. They are traced in S12 (Design Rules Compliance Trace).

**DR-L2-9-A:** Live availability signals MUST NOT substitute for static Capability Declarations in Feasibility Check steps 1–4. Steps 1–4 operate against registered protocol artifacts. Live signals are consulted in step 5 only, as part of the supplier's internal readiness determination.

**DR-L2-9-B:** A Capability Declaration that declares `liveAvailabilityMode` MUST also declare `liveAvailabilityDriverRef`. A declaration that sets `liveAvailabilityMode` without `liveAvailabilityDriverRef` MUST be rejected at registration.

**DR-L2-9-C:** The `liveAvailabilityDriverRef` MUST resolve to a registered, non-expired `AVAILABILITY` category entry in the Resource Reference Registry at Capability Declaration registration time. This validation follows the same pattern as DR-L2-5-C.

**DR-L2-9-D:** `liveAvailabilityCacheTtl` MUST be > PT0S and ≤ PT1H. Values outside this range MUST be rejected at Capability Declaration registration.

**DR-L2-9-E:** A live availability signal served by the Capability Catalogue MUST NOT be older than `liveAvailabilityCacheTtl`. Signals older than this value MUST be returned with `status: SIGNAL_STALE`.

**DR-L2-9-F:** A supplier in Active Gate mode whose live availability system becomes unreachable during a Feasibility Check MUST push `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE` within PT2M of detecting system unavailability. A supplier in Active Gate mode MUST NOT allow the Feasibility Window to expire passively in response to live system unavailability.

**DR-L2-9-G:** A supplier in Active Gate mode who pushes `FEASIBILITY_CLEARED` when their live signal indicates unavailability is in breach of their Capability Declaration. Breach detection is a conformance audit function: the protocol records both the `FEASIBILITY_CLEARED` event and the driver signal history in the append-only log; conformance testing may cross-reference them post-hoc. The protocol does not enforce this constraint in real time.

**DR-L2-9-H:** The Feasibility Check engine does not evaluate live availability signals directly. The supplier agent is the sole evaluator of live availability in step 5. Step 3 in Active Gate mode confirms only that the driver registration is valid at emission time; it does not query the driver or assess the signal value.

**DR-L2-9-I:** All live signal driver responses MUST include a `signalTimestamp` field (ISO 8601 datetime). Signals without a `signalTimestamp` MUST be treated as `SIGNAL_STALE` by the Capability Catalogue.

**DR-L2-9-J:** `slotId` values in `SLOT_LIST` signals are supplier-defined opaque identifiers. The protocol does not define, validate, or interpret slot identifier semantics. Slot binding is confirmed only at `FEASIBILITY_CLEARED` emission; no prior step constitutes a slot reservation.

**DR-L2-9-K:** The `availabilityStatus` field in `catalogue_check_availability` responses has mode-dependent semantics for declarations with `ACTIVE_GATE` mode: `FULLY_AVAILABLE` requires both `ACTIVE` Resource Reference status and a non-stale live signal with `status: AVAILABLE`. For `PASSIVE` mode declarations, `FULLY_AVAILABLE` requires only `ACTIVE` Resource Reference status; the live signal is surfaced separately.

---

*End of Section 9*
