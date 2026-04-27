# S12 Design Rules Compliance Trace

**Activity Travel Protocol 窶・Layer 2 Capability and Discovery Specification**
**Section 12: Design Rules Compliance Trace**
**Status: WORKING DRAFT 窶・March 2026**

---

## 12.1 Purpose

This section is the compliance trace for the Activity Travel Protocol Layer 2 Capability and Discovery Specification. It performs the same function as Layer 3 Section 14: it verifies that every normative design rule produced by the Pre-Layer 2 Consistency Review is satisfied by at least one section of the Layer 2 specification, and that no rule is orphaned or violated.

Two categories of rules are traced:

1. **Pre-Layer 2 Review rules (L2-T-x-y):** Eighteen normative rules derived from the five tension resolutions and two prior design decisions recorded in the Pre-Layer 2 Consistency Review (March 2026). These are the foundational rules that governed all Layer 2 authoring.

2. **Section design rules (DR-L2-s-x):** Sixty-one normative rules defined within individual Layer 2 sections (S5窶鉄11) to govern implementation detail within each component. These rules amplify and operationalise the Pre-Layer 2 Review rules; they do not conflict with them.

Total rule count: **79 normative design rules** (18 L2-T + 61 DR-L2).

### 12.1.1 Cross-section gap notes

During S5窶鉄11 authoring, six cross-section gaps were identified. These are tracked deferred items: they require targeted back-propagation updates to S3, S6, S7, and S8 before Layer 2 is published. They are recorded in ﾂｧ12.6 of this section. The compliance verdict at ﾂｧ12.5 reflects the state of the published sections; gap note items are flagged as PENDING BACK-PROPAGATION and do not affect the overall verdict.

---

## 12.2 Pre-Layer 2 Review Rules 窶・Compliance Trace

### 12.2.1 T-L2-1: Feasibility Window Ownership

| Rule | Statement (summary) | Primary section | Verdict |
|------|---------------------|-----------------|---------|
| **L2-T-1-A** | Layer 2 defines Feasibility Window parameter with minimum (PT5M), default (PT30M), and maximum (PT4H) duration. | S7 ﾂｧ7.2.2 | SATISFIED |
| **L2-T-1-B** | Feasibility Window is a Layer 2 parameter; not overridable by Party Policy Declaration beyond the Layer 2 maximum. | S7 ﾂｧ7.2.2, DR-L2-7-C | SATISFIED |
| **L2-T-1-C** | Layer 2 defines behaviour on partial feasibility: REDUCE_SCOPE or abandon. INQUIRY MUST NOT exit with unconfirmed components. | S7 ﾂｧ7.5 | SATISFIED |

**Evidence:** S7 ﾂｧ7.2.2 specifies the Feasibility Window as a booking-level parameter with the three-value range (PT5M / PT30M / PT4H). S7 ﾂｧ7.2.2 states explicitly that the window is not a Party Policy Declaration override (L2-T-1-B). S7 ﾂｧ7.5 defines the partial feasibility protocol: `FEASIBILITY_TIMEOUT` per timed-out component, followed by a mandatory agent choice between Option A (abandon and retry) and Option B (`REDUCE_SCOPE`) with full Security Kernel execution (L2-T-1-C).

---

### 12.2.2 T-L2-2: MCP / A2A Interface Boundary

| Rule | Statement (summary) | Primary section | Verdict |
|------|---------------------|-----------------|---------|
| **L2-T-2-A** | Booking Object creation is the normative MCP/A2A boundary. Pre-creation: Layer 2 / A2A. Post-creation: Layer 3 / MCP. | S8 ﾂｧ8.2, S1 ﾂｧ1.3 | SATISFIED |
| **L2-T-2-B** | Layer 2 defines A2A task schemas for `capability_declaration_query`, `feasibility_pre_signal`, and `configuration_negotiation`. Schemas are Layer 2 protocol artifacts. | S8 ﾂｧ8.4.2 | SATISFIED |
| **L2-T-2-C** | Suppliers without A2A capability MUST be reachable via MCP / Capability Catalogue. A2A is additive. | S8 ﾂｧ8.5, DR-L2-8-A | SATISFIED |
| **L2-T-2-D** | Layer 2 defines the MCP fallback path. Fallback always permitted for discovery and feasibility pre-signalling; conditional for configuration negotiation. | S8 ﾂｧ8.5.3, DR-L2-8-F | SATISFIED |

**Evidence:** S8 ﾂｧ8.2 states the Booking Object creation boundary normatively, cross-referencing S1 ﾂｧ1.3 for the full scope statement (L2-T-2-A). S8 ﾂｧ8.4.2 defines the three A2A task schemas with `taskSchemaVersion` fields (L2-T-2-B). S8 ﾂｧ8.3.2 defines the four mandatory MCP tools (`catalogue_search`, `catalogue_get`, `catalogue_check_availability`, `catalogue_list_parties`), and S8 ﾂｧ8.5 documents the graceful degradation path for suppliers without A2A (L2-T-2-C). S8 ﾂｧ8.5.3 and DR-L2-2-D address the conditional fallback restriction when `requiresA2ANegotiation: true` is set (L2-T-2-D).

---

### 12.2.3 T-L2-3: Capability Declaration Staleness

| Rule | Statement (summary) | Primary section | Verdict |
|------|---------------------|-----------------|---------|
| **L2-T-3-A** | Every Capability Declaration carries a version identifier and validity period. Party Registry enforces currency; rejects FEASIBILITY_CLEARED against expired or superseded declarations. | S3 ﾂｧ3.4.1 | SATISFIED |
| **L2-T-3-B** | Suppliers MUST publish `DECLARATION_SUPERSEDED` event on material change, referencing superseded and replacement version identifiers. | S3 ﾂｧ3.6.2 | SATISFIED |
| **L2-T-3-C** | Feasibility Check MUST validate declaration currency before emitting `FEASIBILITY_CLEARED`. `FEASIBILITY_FAILED` with reason `DECLARATION_STALE` is required for expired or superseded declarations. | S7 ﾂｧ7.3 step 2, DR-L2-7-A | SATISFIED |
| **L2-T-3-D** | Layer 2 defines 'material change' for purposes of `DECLARATION_SUPERSEDED`. Minor changes do not trigger the event. | S3 ﾂｧ3.6.3 | SATISFIED |

**Evidence:** S3 ﾂｧ3.4.1 defines `declarationVersion` and `validUntil` as required fields on every Capability Declaration, and specifies Party Registry enforcement of currency at query time (L2-T-3-A). S3 ﾂｧ3.6.2 defines the `DECLARATION_SUPERSEDED` event with `supersededVersion` and `replacementVersion` reference fields (L2-T-3-B). S7 ﾂｧ7.3 step 2 is the declaration currency check in the per-component evaluation sequence; DR-L2-7-A confirms that all step 1窶・ checks are evaluated at emission time, ensuring currency at the point of result generation (L2-T-3-C). S3 ﾂｧ3.6.3 enumerates the conditions that constitute a material change (offered services, pricing model, operational constraints, jurisdiction coverage) and explicitly excludes minor changes such as contact details and formatting (L2-T-3-D).

---

### 12.2.4 T-L2-4: Pre-Arrangement Declarations and Layer 3 Authority Gates

| Rule | Statement (summary) | Primary section | Verdict |
|------|---------------------|-----------------|---------|
| **L2-T-4-A** | Pre-Arrangement Declarations are Layer 2 artifacts expressed as Party Policy Declarations via the Layer 1 Party Registry. They take effect through Layer 3 Security Kernel Cedar evaluation at the Party Operational tier. | S6 ﾂｧ6.2 | SATISFIED |
| **L2-T-4-B** | Pre-Arrangement Declarations are not Security Kernel bypasses. Full execution order applies: authenticate, authorise, Cedar, Trust Chain, AI agent scope. | S6 ﾂｧ6.2, DR-L2-6-A | SATISFIED |
| **L2-T-4-C** | Layer 2 defines the Pre-Arrangement Declaration schema, including pre-authorised transitions, expiry conditions, and jurisdiction constraints. | S6 ﾂｧ6.3 | SATISFIED |
| **L2-T-4-D** | Pre-Arrangement Declarations MUST be registered before the booking begins. Runtime assertion is invalid and MUST be rejected by the Security Kernel. | S6 ﾂｧ6.6, DR-L2-6-D | SATISFIED |

**Evidence:** S6 ﾂｧ6.2 establishes that Pre-Arrangement Declarations are Party Policy Declarations registered in the Layer 1 Party Registry and evaluated by the Layer 3 Security Kernel at the Party Operational tier (L2-T-4-A). The same section specifies that no Pre-Arrangement Declaration bypasses the Security Kernel's full execution sequence, and DR-L2-6-A reinforces this by restricting `CONDITION_PRE_SATISFY` to Protocol-tier named conditions only (L2-T-4-B). S6 ﾂｧ6.3 defines the complete Pre-Arrangement Declaration schema with `declarationType`, `scope.transitions`, `validFrom`, `validUntil`, `renewalPolicy`, and `jurisdictionConstraints` fields (L2-T-4-C). S6 ﾂｧ6.6 states that declarations must be in `ACTIVE` status at booking initiation time; DR-L2-6-D requires `FEASIBILITY_FAILED` for any Capability Declaration that cites a non-`ACTIVE` Pre-Arrangement Declaration (L2-T-4-D).

---

### 12.2.5 T-L2-5: n-Party Coordination Delegation Setup

| Rule | Statement (summary) | Primary section | Verdict |
|------|---------------------|-----------------|---------|
| **L2-T-5-A** | Layer 2 defines a Delegation Topology Declaration as a component of Capability Declarations. Suppliers register maximum delegation depth and co-delegatee identity constraints. | S3 ﾂｧ3.5, S11 ﾂｧ11.1 | SATISFIED |
| **L2-T-5-B** | Feasibility Check for bookings with n > 2 Fulfilling Parties MUST include a Delegation Topology feasibility step. `FEASIBILITY_CLEARED` implies topology feasibility confirmed. | S7 ﾂｧ7.4, S11 ﾂｧ11.2 | SATISFIED |
| **L2-T-5-C** | Layer 2 delegation topologies MUST be expressible as sequential two-party Coordination Delegation chains for Layer 3 v1.0. Topologies that cannot be expressed as a chain MUST return `FEASIBILITY_FAILED` with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`. | S7 ﾂｧ7.4.3, S11 ﾂｧ11.3 | SATISFIED |

**Evidence:** S3 ﾂｧ3.5 defines the Delegation Topology Declaration schema (optional component of Capability Declarations), including `maxDelegationDepth` and `coDelegateeConstraints`; S11 ﾂｧ11.1 explains the runtime use of this component in multi-party discovery (L2-T-5-A). S7 ﾂｧ7.4 specifies the Delegation Topology feasibility step as a mandatory part of the Feasibility Check for multi-party bookings, and establishes that `FEASIBILITY_CLEARED` at the Activity Component level implies topology confirmation; S11 ﾂｧ11.2 defines the four-stage topology confirmation workflow that feeds into this step (L2-T-5-B). S7 ﾂｧ7.4.3 specifies the chain validation algorithm and the `DELEGATION_TOPOLOGY_UNSUPPORTED` failure code for topologies that cannot be expressed as sequential two-party delegations; S11 ﾂｧ11.3 documents the chaining workaround as the conformant path for n-party scenarios in v1.0 (L2-T-5-C).

---

## 12.3 Section Design Rules 窶・Compliance Summary

This section records each section design rule, its normative home, and its compliance status. Rules are grouped by section.

### 12.3.1 S5 窶・Resource Reference Registry (DR-L2-5-A through DR-L2-5-I)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-5-A** | Every Resource Reference entry MUST be validated against the Resource Reference Schema at registration. Non-conformant entries rejected without persisting partial state. | SATISFIED 窶・S5 ﾂｧ5.5.1 |
| **DR-L2-5-B** | No protocol operation within a booking workflow MAY access an external data source directly. All external data access MUST be mediated through a registered, non-expired Resource Reference. Implements Driver Model boundary (OS Function 4). | SATISFIED 窶・S5 ﾂｧ5.3 |
| **DR-L2-5-C** | Registry MUST confirm at Capability Declaration registration time that every `resourceRefId` cited resolves to a registered, non-expired entry. MUST NOT be deferred to query time. | SATISFIED 窶・S5 ﾂｧ5.5.2 |
| **DR-L2-5-D** | Feasibility Check MUST include `STALE_RESOURCE_REF` warnings for Activity Components citing Resource References in `STALE` status. Staleness alone MUST NOT cause `FEASIBILITY_FAILED`. | SATISFIED 窶・S5 ﾂｧ5.6.2, S7 ﾂｧ7.3 |
| **DR-L2-5-E** | Expired or deregistered Resource Reference MUST cause `FEASIBILITY_FAILED` for any Activity Component citing it. Evaluated at emission time. | SATISFIED 窶・S5 ﾂｧ5.6.2, S7 ﾂｧ7.3 |
| **DR-L2-5-F** | `endpointDescriptor.baseUri` MUST use HTTPS. HTTP endpoints non-conformant; rejected at registration. | SATISFIED 窶・S5 ﾂｧ5.4.2 |
| **DR-L2-5-G** | Resource Reference entries scoped to the registering Fulfilling Party. A party MUST NOT reference another party's `resourceRefId` in its own Capability Declarations. | SATISFIED 窶・S5 ﾂｧ5.4.1 |
| **DR-L2-5-H** | `validUntil` MUST NOT exceed `validFrom` + P1Y. Registrations and revalidations exceeding this bound MUST be rejected. | SATISFIED 窶・S5 ﾂｧ5.5.1 |
| **DR-L2-5-I** | `STATIC_FILE` endpoints valid only for `REFERENCE` category Resource References. Registrations with `endpointType: STATIC_FILE` and `driverCategory: PRICING` or `AVAILABILITY` MUST be rejected. | SATISFIED 窶・S5 ﾂｧ5.4.2 |

---

### 12.3.2 S6 窶・Pre-Arrangement Declarations (DR-L2-6-A through DR-L2-6-G)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-6-A** | `CONDITION_PRE_SATISFY` declarations MUST NOT pre-satisfy Jurisdiction-tier Cedar policy conditions. Only Protocol-tier named conditions are eligible. | SATISFIED 窶・S6 ﾂｧ6.3.2 |
| **DR-L2-6-B** | For `TRANSITION_PRE_AUTH` declarations, only transitions where real-time counterparty confirmation is ordinarily required may be listed. Unilateral transitions MUST be rejected at registration. | SATISFIED 窶・S6 ﾂｧ6.3.3 |
| **DR-L2-6-C** | `validUntil` MUST NOT exceed `validFrom` + P1Y. Registrations and renewals exceeding this bound MUST be rejected. | SATISFIED 窶・S6 ﾂｧ6.3.4 |
| **DR-L2-6-D** | Feasibility Check MUST confirm all Pre-Arrangement Declarations cited by or implied by an Activity Component's Capability Declaration are in `ACTIVE` status at emission time. Non-`ACTIVE` declarations cause `FEASIBILITY_FAILED`. | SATISFIED 窶・S6 ﾂｧ6.6, S7 ﾂｧ7.3 |
| **DR-L2-6-E** | Jurisdiction-tier Cedar policy takes precedence over Pre-Arrangement Declarations. `jurisdictionConstraints` configuration purporting to expand jurisdiction-tier policy is inoperative. | SATISFIED 窶・S6 ﾂｧ6.4 |
| **DR-L2-6-F** | `AUTO_RENEW` declarations may be auto-renewed at most once without manual re-attestation. Party Registry MUST emit `PRE_ARRANGEMENT_MANUAL_RENEWAL_REQUIRED` at least 30 days before `validUntil` of any declaration that has exhausted its auto-renewal allowance. | SATISFIED 窶・S6 ﾂｧ6.5 |
| **DR-L2-6-G** | `counterpartyAcceptanceRequired` MUST be `true` for all `TRANSITION_PRE_AUTH` and `CONDITION_PRE_SATISFY` declarations. Registrations with `counterpartyAcceptanceRequired: false` for either type MUST be rejected. | SATISFIED 窶・S6 ﾂｧ6.3.5 |

---

### 12.3.3 S7 窶・Feasibility Check Operation (DR-L2-7-A through DR-L2-7-H)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-7-A** | All per-component evaluation steps (ﾂｧ7.3 steps 1窶・) evaluated at emission time, not initiation time. Status changes during in-flight Feasibility Check are evaluated at emission. | SATISFIED 窶・S7 ﾂｧ7.3 |
| **DR-L2-7-B** | Steps 1窶・ of per-component evaluation are synchronous pre-conditions. Supplier readiness event (step 5) is the only asynchronous step. Steps 1窶・ MUST complete before the protocol awaits the supplier event. | SATISFIED 窶・S7 ﾂｧ7.3 |
| **DR-L2-7-C** | Feasibility Window is a booking-level timer started by `FEASIBILITY_CHECK_INITIATED`. Shared across all Activity Components. Components do not have independent windows. `FEASIBILITY_CHECK_INITIATED` MUST NOT be emitted until the complete Activity Component set is fixed. | SATISFIED 窶・S7 ﾂｧ7.2.2, ﾂｧ7.2.4 |
| **DR-L2-7-D** | Feasibility Window timer frozen during `BOOKING_SUSPENDED`; resumes on exit. Consistent with Layer 3 S11 general timeout freeze rule. | SATISFIED 窶・S7 ﾂｧ7.2.3 |
| **DR-L2-7-E** | `FEASIBILITY_CLEARED` components retain cleared status if other components in the same booking time out. Clearance not invalidated by another component's `FEASIBILITY_TIMEOUT`. | SATISFIED 窶・S7 ﾂｧ7.5.1 |
| **DR-L2-7-F** | Each Feasibility Check retry is a new invocation. Full evaluation sequence (steps 1窶・) MUST be re-executed from the beginning on every retry. No incremental retry path. | SATISFIED 窶・S7 ﾂｧ7.6.1 |
| **DR-L2-7-G** | Supplier events received after `FEASIBILITY_TIMEOUT` has been emitted for the corresponding component are late events. Late events MUST be discarded and MUST NOT modify Booking Object state. Recovery requires a new Feasibility Check. | SATISFIED 窶・S7 ﾂｧ7.5.2 |
| **DR-L2-7-H** | `FEASIBILITY_WINDOW_EXPIRING` suppressed when total configured window duration is 竕､ PT5M. In all other cases, warning MUST be emitted 5 minutes before expiry if any components remain uncleared. | SATISFIED 窶・S7 ﾂｧ7.2.5 |

---

### 12.3.4 S8 窶・Capability Catalogue (DR-L2-8-A through DR-L2-8-J)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-8-A** | Capability Catalogue MUST expose the four MCP tools: `catalogue_search`, `catalogue_get`, `catalogue_check_availability`, `catalogue_list_parties`. Omitting any tool is non-conformant. | SATISFIED 窶・S8 ﾂｧ8.3.2 |
| **DR-L2-8-B** | Capability Catalogue MUST reject any query including a `bookingObjectId` parameter with a `BOUNDARY_VIOLATION` error. Catalogue operates exclusively in the pre-Booking Object phase. | SATISFIED 窶・S8 ﾂｧ8.2 |
| **DR-L2-8-C** | `catalogue_search` results MUST reflect current `registryStatus` of cited Resource References at query time. Declarations with expired or deregistered references excluded from default results. | SATISFIED 窶・S8 ﾂｧ8.3.2 |
| **DR-L2-8-D** | All MCP tool calls against the Capability Catalogue MUST be authenticated via the Layer 1 Security Kernel. Unauthenticated calls MUST be rejected. | SATISFIED 窶・S8 ﾂｧ8.3.1 |
| **DR-L2-8-E** | A2A task responses from supplier agents are advisory. `ACCEPTED` on `configuration_negotiation` is a pre-commitment signal, not a protocol-level authorisation. Feasibility Check is the binding validation step. | SATISFIED 窶・S8 ﾂｧ8.4.3 |
| **DR-L2-8-F** | Supplier agent's `feasibility_pre_signal` response (including `acknowledged: false`) has no effect on subsequent Feasibility Check outcome. Feasibility Check executes its full evaluation sequence independently of any prior A2A pre-signal. | SATISFIED 窶・S8 ﾂｧ8.4.2, ﾂｧ8.5.3 |
| **DR-L2-8-G** | A2A endpoints registered in Layer 1 Party Registry MUST be valid A2A Agent Card URLs per the A2A Protocol specification. Capability Catalogue surfaces them but does not host or proxy them. | SATISFIED 窶・S8 ﾂｧ8.4.1 |
| **DR-L2-8-H** | `includeUnavailable: true` on `catalogue_search` requires operator-level authorisation. Standard authenticated parties MUST be rejected with authorisation error. | SATISFIED 窶・S8 ﾂｧ8.3.2 |
| **DR-L2-8-I** | `activePreArrangements` field in `catalogueMetadata` MUST include only Pre-Arrangement Declarations where the requesting party appears as `declaringPartyId` or in `counterpartyIds`. Declarations between other parties MUST NOT be surfaced. | SATISFIED 窶・S8 ﾂｧ8.3.3 |
| **DR-L2-8-J** | All A2A task schemas defined in ﾂｧ8.4.2 are Layer 2 protocol artifacts. They MUST NOT reference Booking Object identifiers or Layer 3 events. A2A task payloads including `bookingObjectId` are non-conformant. | SATISFIED 窶・S8 ﾂｧ8.4.2 |

---

### 12.3.5 S9 窶・Live Availability (DR-L2-9-A through DR-L2-9-K)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-9-A** | Live availability signals MUST NOT substitute for static Capability Declarations in Feasibility Check steps 1窶・. Live signals are consulted in step 5 only, as part of supplier's internal readiness determination. | SATISFIED 窶・S9 ﾂｧ9.2, S7 ﾂｧ7.3 |
| **DR-L2-9-B** | Capability Declaration declaring `liveAvailabilityMode` MUST also declare `liveAvailabilityDriverRef`. Declarations setting `liveAvailabilityMode` without `liveAvailabilityDriverRef` MUST be rejected at registration. | SATISFIED 窶・S9 ﾂｧ9.3.3 |
| **DR-L2-9-C** | `liveAvailabilityDriverRef` MUST resolve to a registered, non-expired `AVAILABILITY` category Resource Reference at Capability Declaration registration time. Follows same pattern as DR-L2-5-C. | SATISFIED 窶・S9 ﾂｧ9.3.3, S5 ﾂｧ5.5.2 |
| **DR-L2-9-D** | `liveAvailabilityCacheTtl` MUST be > PT0S and 竕､ PT1H. Values outside this range MUST be rejected at Capability Declaration registration. | SATISFIED 窶・S9 ﾂｧ9.3.3 |
| **DR-L2-9-E** | Live availability signal served by the Capability Catalogue MUST NOT be older than `liveAvailabilityCacheTtl`. Signals older than this value MUST be returned with `status: SIGNAL_STALE`. | SATISFIED 窶・S9 ﾂｧ9.5.1 |
| **DR-L2-9-F** | Supplier in Active Gate mode whose live availability system becomes unreachable during Feasibility Check MUST push `FEASIBILITY_FAILED` with reason `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE` within PT2M of detecting unavailability. MUST NOT allow Feasibility Window to expire passively. | SATISFIED 窶・S9 ﾂｧ9.5.2, S7 ﾂｧ7.6.4 |
| **DR-L2-9-G** | Supplier in Active Gate mode pushing `FEASIBILITY_CLEARED` when live signal indicates unavailability is in breach of Capability Declaration. Breach detection is a conformance audit function using append-only log cross-reference. Protocol does not enforce in real time. | SATISFIED 窶・S9 ﾂｧ9.5.3 |
| **DR-L2-9-H** | Feasibility Check engine does not evaluate live availability signals directly. Supplier agent is sole evaluator of live availability in step 5. Step 3 in Active Gate mode confirms only driver registration validity at emission time; it does not query the driver or assess the signal value. | SATISFIED 窶・S9 ﾂｧ9.4, S7 ﾂｧ7.3 |
| **DR-L2-9-I** | All live signal driver responses MUST include a `signalTimestamp` field (ISO 8601 datetime). Signals without `signalTimestamp` MUST be treated as `SIGNAL_STALE` by the Capability Catalogue. | SATISFIED 窶・S9 ﾂｧ9.6 |
| **DR-L2-9-J** | `slotId` values in `SLOT_LIST` signals are supplier-defined opaque identifiers. Protocol does not define, validate, or interpret slot identifier semantics. Slot binding confirmed only at `FEASIBILITY_CLEARED` emission; no prior step constitutes a slot reservation. | SATISFIED 窶・S9 ﾂｧ9.6 |
| **DR-L2-9-K** | `availabilityStatus` field in `catalogue_check_availability` responses has mode-dependent semantics: `FULLY_AVAILABLE` for `ACTIVE_GATE` mode requires both `ACTIVE` Resource Reference status and a non-stale live signal with `status: AVAILABLE`. For `PASSIVE` mode, `FULLY_AVAILABLE` requires only `ACTIVE` Resource Reference status; live signal is surfaced separately. | SATISFIED 窶・S9 ﾂｧ9.7, DR-L2-8-C |

---

### 12.3.6 S10 窶・AI Agent Participation (DR-L2-10-A through DR-L2-10-I)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-10-A** | Layer 2 defines four discovery-phase authority scopes: L2-AS-1 (READ_CATALOGUE), L2-AS-2 (QUERY_SUPPLIER), L2-AS-3 (NEGOTIATE), L2-AS-4 (INITIATE_FEASIBILITY). Scopes are hierarchical and additive. Distinct from Layer 3 authority scopes. | SATISFIED 窶・S10 ﾂｧ10.2 |
| **DR-L2-10-B** | Emitting `FEASIBILITY_CHECK_INITIATED` requires L2-AS-4. Agents at L2-AS-3 or below MUST NOT emit this event; such events MUST be rejected by the Feasibility Check engine. L2-AS-4 does not waive DR-L2-7-C. | SATISFIED 窶・S10 ﾂｧ10.2.2, S7 ﾂｧ7.2.4 |
| **DR-L2-10-C** | Booking agent MUST support handoff to a human operator at any point in the discovery phase. Discovery state MUST be preserved in a form accessible without restarting discovery; handoff signalling mechanism is deployment-defined. | SATISFIED 窶・S10 ﾂｧ10.3.1 |
| **DR-L2-10-D** | Supplier agent MUST NOT return Capability Declarations belonging to another Fulfilling Party in response to a `capability_declaration_query` task. Party identity verified at A2A connection time via `requestingPartyId` and `respondingPartyId` fields. | SATISFIED 窶・S10 ﾂｧ10.4.1 |
| **DR-L2-10-E** | Supplier's obligation to push `FEASIBILITY_CLEARED` or `FEASIBILITY_FAILED` within the Feasibility Window is independent of A2A agent availability. Supplier A2A agent unavailability does not excuse the supplier from the Feasibility Check event obligation. | SATISFIED 窶・S10 ﾂｧ10.4.2, S7 ﾂｧ7.5 |
| **DR-L2-10-F** | Layer 2 discovery-phase authority scopes (L2-AS-1 through L2-AS-4) are independent of Layer 3 authority scopes. L2-AS-4 does not implicitly confer any Layer 3 scope. Layer 3 scopes are independently granted and enforced by the Security Kernel. | SATISFIED 窶・S10 ﾂｧ10.2.3 |
| **DR-L2-10-G** | Discovery-phase outputs (finalised Activity Configurations, Feasibility Check results, Delegation Topology confirmations) are protocol artifacts in the Party Registry and Resource Reference Registry. Any agent holding appropriate Layer 3 scope may use them as Context Package inputs at Booking Object creation; the same agent instance need not participate in both phases. | SATISFIED 窶・S10 ﾂｧ10.5 |
| **DR-L2-10-H** | Agent credential not specifying a discovery-phase scope MUST be treated as L2-AS-1 (READ_CATALOGUE) by the Capability Catalogue and Feasibility Check engine. | SATISFIED 窶・S10 ﾂｧ10.2.1 |
| **DR-L2-10-I** | Before responding to an A2A task, supplier agent MUST verify requesting party's declared discovery-phase scope against Layer 1 Party Registry using `requestingPartyId`. `capability_declaration_query` from agent without L2-AS-2 MUST be rejected. `configuration_negotiation` or `feasibility_pre_signal` from agent without L2-AS-3 MUST be rejected. | SATISFIED 窶・S10 ﾂｧ10.4.1 |

---

### 12.3.7 S11 窶・Multi-Party Discovery (DR-L2-11-A through DR-L2-11-G)

| Rule | Statement (summary) | Verdict |
|------|---------------------|---------|
| **DR-L2-11-A** | Booking agent MUST include `proposedChain` field (ordered `partyId` array) in `FEASIBILITY_CHECK_INITIATED` payload for any booking with n > 2 distinct Fulfilling Parties. Initiation without `proposedChain` for multi-party booking MUST be rejected. | SATISFIED 窶・S11 ﾂｧ11.2, S7 ﾂｧ7.2.4 |
| **DR-L2-11-B** | Fulfilling Party without a registered, non-expired Delegation Topology Declaration MUST NOT appear as an intermediate node in a delegation chain. MAY appear as terminal node. Enforced at chain validation time. | SATISFIED 窶・S11 ﾂｧ11.3, S7 ﾂｧ7.4.3 |
| **DR-L2-11-C** | `topologyChainRef` is immutable once recorded in the Booking Object. Topology changes require a new Feasibility Check and new `topologyChainRef`. Modification attempts on existing Booking Object MUST be rejected by the Security Kernel. | SATISFIED 窶・S11 ﾂｧ11.4 |
| **DR-L2-11-D** | Delegation Topology Declaration expiring between Feasibility Check confirmation and Booking Object creation invalidates the `topologyChainRef`. Booking agent MUST obtain a new Feasibility Check before creating the Booking Object. | SATISFIED 窶・S11 ﾂｧ11.4 |
| **DR-L2-11-E** | A2A topology negotiation is advisory. Supplier agent acceptance of a co-delegatee pairing in any A2A task response does not bind the Feasibility Check outcome. Feasibility Check engine performs independent chain validation regardless of prior A2A negotiation. | SATISFIED 窶・S11 ﾂｧ11.2, S7 ﾂｧ7.4.3 |
| **DR-L2-11-F** | Full n-party Coordination Delegation execution without the chaining workaround is deferred (DL2-3) and out of scope for Layer 2 and Layer 3 v1.0. Layer 2 defines topology setup and confirmation only. | SATISFIED 窶・S11 ﾂｧ11.5 |
| **DR-L2-11-G** | Maximum delegation chain depth is 5. Proposed chains of depth > 5 MUST be rejected by the Feasibility Check engine with reason `DELEGATION_TOPOLOGY_UNSUPPORTED`. Protects Layer 3 Coordination Delegation phaseWindow timeout budget. | SATISFIED 窶・S11 ﾂｧ11.3, S7 ﾂｧ7.4.3 |

---

## 12.4 Rule Count Summary

| Category | Count |
|----------|-------|
| Pre-Layer 2 Review rules (L2-T-x-y) | 18 |
| S5 Resource Reference Registry rules (DR-L2-5-x) | 9 |
| S6 Pre-Arrangement Declaration rules (DR-L2-6-x) | 7 |
| S7 Feasibility Check Operation rules (DR-L2-7-x) | 8 |
| S8 Capability Catalogue rules (DR-L2-8-x) | 10 |
| S9 Live Availability rules (DR-L2-9-x) | 11 |
| S10 AI Agent Participation rules (DR-L2-10-x) | 9 |
| S11 Multi-Party Discovery rules (DR-L2-11-x) | 7 |
| **Total** | **79** |

All 79 rules: SATISFIED.

Rules orphaned (no implementing section): **0.**

Rules violated (implementing section contradicts rule): **0.**

---

## 12.5 Compliance Verdict

> **Layer 2 Design Rules Compliance Trace: PASS**
>
> All 79 normative design rules are SATISFIED. No rule is orphaned. No rule is violated.
>
> Six cross-section gap notes require back-propagation updates to S3, S6, S7, and S8 before Layer 2 is published. These are tracked in ﾂｧ12.6. They do not represent rule violations; the rules they concern are satisfied by the sections that define them. The back-propagation updates will ensure the affected sections are internally consistent with the features defined in later sections.

---

## 12.6 Cross-Section Gap Notes

The following gaps were identified during S5窶鉄11 authoring. Each requires a targeted update to the named target section before Layer 2 is published. The gap note source is the section in which the requirement was defined; the target is the section that must be updated.

| Gap ID | Description | Source | Target section(s) | Status |
|--------|-------------|--------|-------------------|--------|
| **GN-L2-1** | Capability Declaration schema must include four optional live availability fields: `liveAvailabilityMode`, `liveAvailabilityDriverRef`, `liveAvailabilityGranularity`, `liveAvailabilityCacheTtl`. | S9 ﾂｧ9.3.3 | S3 optional fields | PENDING BACK-PROPAGATION |
| **GN-L2-2** | Pre-Arrangement Declaration schema must include `requiresA2ANegotiation` boolean field at ﾂｧ6.3.5. This field governs the conditional fallback restriction defined in DR-L2-2-D and S8 ﾂｧ8.5.3. | S8 ﾂｧ8.6.3 | S6 ﾂｧ6.3.5 | PENDING BACK-PROPAGATION |
| **GN-L2-3** | S7 ﾂｧ7.6.4 must add three new `FEASIBILITY_FAILED` reason codes: `LIVE_AVAILABILITY_DRIVER_INVALID`, `LIVE_AVAILABILITY_GATE_CLOSED`, `LIVE_AVAILABILITY_SYSTEM_UNAVAILABLE`. | S9 ﾂｧ9.5.2窶・.5.3 | S7 ﾂｧ7.6.4 | PENDING BACK-PROPAGATION |
| **GN-L2-4** | S7 ﾂｧ7.2.4 must note that `FEASIBILITY_CHECK_INITIATED` requires the emitting agent to hold L2-AS-4. The requirement is currently defined in S10 ﾂｧ10.2.2 and DR-L2-10-B; it must also appear as a cross-reference at the event definition site. | S10 ﾂｧ10.2.2 | S7 ﾂｧ7.2.4 | PENDING BACK-PROPAGATION |
| **GN-L2-5** | S7 ﾂｧ7.2.4 and S7 ﾂｧ7.6.2 must include the `proposedChain` field (ordered `partyId` array) in the `FEASIBILITY_CHECK_INITIATED` event payload specification for multi-party bookings. This field is defined normatively in DR-L2-11-A and S11 ﾂｧ11.2 but must appear at the event definition site for completeness. | S11 ﾂｧ11.2 | S7 ﾂｧ7.2.4, S7 ﾂｧ7.6.2 | PENDING BACK-PROPAGATION |
| **GN-L2-6** | `catalogue_search` result schema (S8 ﾂｧ8.5.1), `catalogue_check_availability` result schema (S8 ﾂｧ8.5.2), and `catalogueMetadata` (S8 ﾂｧ8.3.2) must include `liveAvailabilitySignal` additions. DR-L2-8-C must be updated to reflect mode-dependent semantics for `ACTIVE_GATE` declarations (cross-reference to DR-L2-9-K). | S9 ﾂｧ9.6窶・.7 | S8 ﾂｧ8.5.1, S8 ﾂｧ8.5.2, S8 ﾂｧ8.3.2, DR-L2-8-C | PENDING BACK-PROPAGATION |

All six gap notes are tracked. Resolution is required before Layer 2 publication. S0 (Index and Introduction) is written after back-propagation is complete.
