# S8 Capability Catalogue

**Activity Travel Protocol — Layer 2 Capability and Discovery Specification**
**Section 8: Capability Catalogue**
**Status: WORKING DRAFT — March 2026**

---

## 8.1 Purpose

The Capability Catalogue is the discovery mechanism through which booking agents find and evaluate supplier offerings before a Booking Object is created. It aggregates registered Capability Declarations, exposes them through two complementary interfaces — an MCP tool interface for agent-to-protocol access and an A2A inter-party agent interface for agent-to-agent discovery — and enforces the interface boundary defined by design rule L2-T-2-A.

The Capability Catalogue operates exclusively in the pre-Booking Object phase. Once a Booking Object is created, discovery is complete and the Capability Catalogue is no longer in scope for that booking; Layer 3 MCP operations govern all subsequent interactions.

This section defines:

- The Capability Catalogue's role in the protocol architecture.
- The MCP tool interface (satisfying L2-T-2-C).
- The A2A inter-party agent interface (satisfying L2-T-2-B).
- The MCP/A2A interface boundary (satisfying L2-T-2-A).
- The graceful degradation path (satisfying L2-T-2-D).
- The query model, filtering, and result schema.
- The design rules governing this component.

---

## 8.2 Architectural Role

### 8.2.1 Position in the Discovery Flow

The Capability Catalogue sits between the Resource Reference Registry (§5), the Capability Declaration Schema (S3), and the Feasibility Check Operation (§7). Its position in the pre-booking discovery flow is:

1. Fulfilling Parties register Capability Declarations (S3) and Resource References (§5) before any booking begins.
2. Booking agents query the Capability Catalogue to find suppliers whose declared capabilities match the consumer's requirements.
3. Booking agents (or their AI agents, via A2A) negotiate configuration options with supplier agents.
4. The Feasibility Check (§7) is initiated, still within the pre-Booking Object phase.
5. Once all required Activity Components have cleared feasibility, the booking agent creates the Booking Object via MCP, crossing the Layer 2/Layer 3 boundary.

### 8.2.2 Relationship to the Resource Reference Registry

The Capability Catalogue queries the Resource Reference Registry (§5) to surface Resource Reference metadata in its responses. A Capability Declaration returned by the Catalogue MUST include the `registryStatus` of each cited `resourceRefId`. Declarations with all Resource References in `ACTIVE` status are returned as `FULLY_AVAILABLE`. Declarations with one or more `STALE` Resource References are returned with a `STALE_RESOURCE_REFS` flag. Declarations with any expired or deregistered Resource References are excluded from Catalogue results by default; they may be retrieved explicitly using the `includeUnavailable` query parameter for diagnostic purposes. Use of `includeUnavailable: true` requires operator-level authorisation and MUST be rejected for standard authenticated parties (DR-L2-8-H).

### 8.2.3 Named Protocol-Internal Component

The Capability Catalogue is a named protocol-internal component (as established in §5.7 and §6.7). It is permitted to query the Resource Reference Registry and the Party Registry across parties in order to assemble and serve discovery results.

---

## 8.3 MCP Tool Interface

### 8.3.1 Role

The MCP tool interface is the conformance baseline for Capability Catalogue access. Every protocol implementation MUST expose the Capability Catalogue via MCP tools. This interface is used by booking agents that do not have AI agent capability (direct tool calls) and by AI agents that interact with the protocol runtime directly rather than peer-to-peer with supplier agents.

MCP tool calls against the Capability Catalogue are agent-to-protocol interactions. They go through the Layer 1 Security Kernel (authenticate, authorise). They do not cross party boundaries; they query the centralised Catalogue.

### 8.3.2 MCP Tool Definitions

The Capability Catalogue exposes the following MCP tools:

**`catalogue_search`**
Searches registered Capability Declarations by filter criteria. Returns a ranked list of matching declarations with summary metadata. Default ranking: exact jurisdiction match ranked above partial match, ranked above no jurisdiction filter applied; within equal jurisdiction match, sorted by `validUntil` descending (fresher declarations first).

Input schema:

| Field | Type | Constraints |
|---|---|---|
| `activityCategories` | string array | Filter by activity category. Optional. |
| `jurisdictions` | string array | ISO 3166-1 alpha-2. Filter by jurisdiction coverage. Optional. |
| `validAt` | ISO 8601 datetime | Return declarations valid at this time. Default: current time. |
| `maxDelegationDepth` | integer | If present, return only suppliers whose Delegation Topology Declaration supports at least this depth. Optional. |
| `includeStale` | boolean | Include declarations with stale Resource References. Default: `false`. |
| `includeUnavailable` | boolean | Include declarations with expired/deregistered Resource References. Default: `false`. Requires operator-level authorisation. |
| `pageSize` | integer | Results per page. Default: 20. Maximum: 100. |
| `pageToken` | string | Pagination token from a prior response. |

Output: paginated list of `CapabilityDeclarationSummary` objects (§8.5.1) plus a `nextPageToken` if further results exist.

**`catalogue_get`**
Retrieves a single Capability Declaration by identifier, including full schema detail.

Input schema:

| Field | Type | Constraints |
|---|---|---|
| `declarationId` | string | Required. The `declarationId` of the Capability Declaration to retrieve. |
| `declarationVersion` | string | Optional. If omitted, returns the current valid version. |

Output: full `CapabilityDeclaration` object (S3 schema) with appended `catalogueMetadata` (§8.5.2).

**`catalogue_check_availability`**
Checks the current availability status of a specific Capability Declaration's Resource References without retrieving the full declaration. Lightweight pre-check before initiating a Feasibility Check.

Input schema:

| Field | Type | Constraints |
|---|---|---|
| `declarationId` | string | Required. |

Output: `availabilityStatus` (`FULLY_AVAILABLE`, `STALE_RESOURCE_REFS`, `UNAVAILABLE`), per-`resourceRefId` status array, `checkedAt` timestamp, and `liveAvailabilitySignal` (present for `PASSIVE` mode declarations when a non-stale signal is available; contains `status`, `signalTimestamp`, and `cachedAt`). For `ACTIVE_GATE` mode declarations, live signal outcome is reflected in `availabilityStatus` only, not in a separate `liveAvailabilitySignal` field. Mode-dependent semantics are as defined in DR-L2-9-K.

**`catalogue_list_parties`**
Lists Fulfilling Parties with active Capability Declarations, optionally filtered by activity category or jurisdiction. Each result includes an `a2aEndpoint` field if the party has a registered A2A agent. The `a2aEndpoint` URI MUST be a valid A2A Agent Card URL per the A2A Protocol specification; booking agents use it to initiate A2A discovery with the supplier agent.

Input schema:

| Field | Type | Constraints |
|---|---|---|
| `activityCategories` | string array | Optional. |
| `jurisdictions` | string array | Optional. |
| `pageSize` | integer | Default: 20. Maximum: 100. |
| `pageToken` | string | Optional. |

Output: paginated list of `PartyCapabilitySummary` objects (§8.5.3).

### 8.3.3 MCP Tool Authentication

All MCP tool calls against the Capability Catalogue MUST be authenticated via the Layer 1 Security Kernel. Unauthenticated calls MUST be rejected. The authenticated party's identity is used to apply party-scoped visibility rules (e.g., Pre-Arrangement Declarations that limit which parties may discover a given supplier's capabilities, and `includeUnavailable` authorisation checks).

---

## 8.4 A2A Inter-Party Agent Interface

### 8.4.1 Role

The A2A interface enables direct agent-to-agent communication between a booking agent and a supplier agent during the discovery and negotiation phase. It is used when the supplier has deployed an A2A-capable agent. A2A interactions are peer-to-peer across party boundaries; they are not mediated by the centralised Capability Catalogue runtime, though the supplier agent draws on the same registered Capability Declarations.

A2A is additive (L2-T-2-C): a supplier without A2A agent capability is fully reachable via the MCP tool interface against static Capability Declarations. A2A absence does not make a supplier non-conformant.

All A2A interactions defined in this section occur before any Booking Object is created. They are Layer 2 scope. No A2A task schema defined here references a Booking Object identifier or any Layer 3 event.

### 8.4.2 A2A Task Schemas

Layer 2 defines the following A2A task schemas as protocol artifacts (satisfying L2-T-2-B). All request and response payloads carry a `taskSchemaVersion` field (semantic version string) to support schema evolution across protocol versions.

**Task: `capability_declaration_query`**

A booking agent queries a supplier agent for current Capability Declarations matching specified criteria.

Request payload:

| Field | Type | Description |
|---|---|---|
| `taskSchemaVersion` | string | Schema version. Current: `1.0.0`. |
| `queryId` | string | Booking-agent-generated unique identifier for this query. |
| `activityCategories` | string array | Optional filter. |
| `jurisdictions` | string array | Optional filter. |
| `validAt` | ISO 8601 datetime | Optional. Default: current time. |
| `requestingPartyId` | string | The booking agent's `partyId`. Used by the supplier agent to apply visibility rules. |

Response payload:

| Field | Type | Description |
|---|---|---|
| `taskSchemaVersion` | string | Schema version echoed from request. |
| `queryId` | string | Echoed from request. |
| `declarations` | array | Array of `CapabilityDeclaration` objects conforming to the S3 schema. |
| `respondingPartyId` | string | The supplier agent's `partyId`. |
| `responseAt` | ISO 8601 datetime | Time of response. |

**Task: `feasibility_pre_signal`**

A booking agent signals to a supplier agent that it intends to include a specific Activity Component in an upcoming feasibility phase, allowing the supplier agent to begin internal readiness assessment before the formal Feasibility Check is initiated. This task is purely advisory and pre-Booking Object; it does not reference any Booking Object event or identifier.

Request payload:

| Field | Type | Description |
|---|---|---|
| `taskSchemaVersion` | string | Schema version. Current: `1.0.0`. |
| `preSignalId` | string | Unique identifier for this pre-signal. |
| `declarationId` | string | The Capability Declaration this component is based on. |
| `declarationVersion` | string | The specific version being used. |
| `activityConfiguration` | object | The Activity Configuration (S4 schema) the booking agent intends to submit. |
| `requestingPartyId` | string | The booking agent's `partyId`. |
| `anticipatedFeasibilityStart` | ISO 8601 datetime | The booking agent's anticipated time of initiating the feasibility phase. Advisory only; not a commitment. |

Response payload:

| Field | Type | Description |
|---|---|---|
| `taskSchemaVersion` | string | Schema version echoed from request. |
| `preSignalId` | string | Echoed from request. |
| `acknowledged` | boolean | `true` if the supplier agent has registered the pre-signal and will begin readiness assessment. `false` if the supplier agent cannot honour the pre-signal (e.g., capacity constraints). |
| `estimatedClearanceTime` | ISO 8601 datetime | Optional. The supplier agent's estimate of when it will push `FEASIBILITY_CLEARED`. Advisory only. |
| `respondingPartyId` | string | The supplier agent's `partyId`. |

A `feasibility_pre_signal` is advisory only. It does not constitute a commitment from the supplier. The Feasibility Check still runs the full evaluation sequence (§7.3). A `false` acknowledgement does not prevent the booking agent from including the component in a Feasibility Check; it is a signal to expect a potentially slower or negative response.

**Task: `configuration_negotiation`**

A booking agent and supplier agent negotiate configuration options for an Activity Component before finalising the Activity Configuration (S4). Multi-round negotiation is supported via the optional `priorNegotiationId` field, which allows the booking agent to reference a previous round.

Request payload:

| Field | Type | Description |
|---|---|---|
| `taskSchemaVersion` | string | Schema version. Current: `1.0.0`. |
| `negotiationId` | string | Unique identifier for this negotiation round. |
| `priorNegotiationId` | string | Optional. The `negotiationId` of the immediately preceding round, if this is a continuation. |
| `declarationId` | string | The Capability Declaration being configured. |
| `proposedConfiguration` | object | A candidate Activity Configuration (S4 schema, partial or complete). |
| `requestingPartyId` | string | The booking agent's `partyId`. |

Response payload:

| Field | Type | Description |
|---|---|---|
| `taskSchemaVersion` | string | Schema version echoed from request. |
| `negotiationId` | string | Echoed from request. |
| `outcome` | enum | One of: `ACCEPTED`, `COUNTER_PROPOSED`, `REJECTED`. |
| `counterProposal` | object | Present when `outcome` is `COUNTER_PROPOSED`. A modified Activity Configuration (S4 schema) the supplier agent proposes instead. |
| `rejectionReason` | string | Present when `outcome` is `REJECTED`. Human-readable. |
| `respondingPartyId` | string | The supplier agent's `partyId`. |

Configuration negotiation via A2A is not binding. An `ACCEPTED` response from a supplier agent is a pre-commitment signal, not a protocol-level authorisation. The Activity Configuration is only binding when it is submitted as part of a Feasibility Check and `FEASIBILITY_CLEARED` is issued (DR-L2-8-E).

### 8.4.3 A2A Agent Discovery

Booking agents discover which suppliers have A2A-capable agents via the `catalogue_list_parties` MCP tool (§8.3.2). Each `PartyCapabilitySummary` includes an `a2aEndpoint` field: if present, the supplier has a registered A2A agent endpoint (an A2A Agent Card URL). If absent, the supplier is MCP-only and the fallback path (§8.6) applies.

A2A endpoints are registered by Fulfilling Parties in the Layer 1 Party Registry as part of their party profile. The Capability Catalogue surfaces them; it does not host or proxy them. Routing to a supplier A2A agent is the booking agent's responsibility after endpoint discovery.

---

## 8.5 Result Schemas

### 8.5.1 CapabilityDeclarationSummary

Returned by `catalogue_search`:

| Field | Type | Description |
|---|---|---|
| `declarationId` | string | Unique identifier of the Capability Declaration. |
| `partyId` | string | The registering Fulfilling Party. |
| `declarationVersion` | string | Current valid version. |
| `activityCategories` | string array | Declared activity categories. |
| `jurisdictions` | string array | Declared jurisdiction coverage. |
| `validUntil` | ISO 8601 datetime | Expiry of the current version. |
| `availabilityStatus` | enum | `FULLY_AVAILABLE`, `STALE_RESOURCE_REFS`. (Unavailable declarations excluded by default.) For `ACTIVE_GATE` mode declarations, `FULLY_AVAILABLE` requires both `ACTIVE` Resource Reference status and a non-stale live signal with `status: AVAILABLE` (DR-L2-9-K). For `PASSIVE` mode declarations, `FULLY_AVAILABLE` requires only `ACTIVE` Resource Reference status; the live signal is surfaced separately in `liveAvailabilitySignal`. |
| `hasA2AAgent` | boolean | Whether the registering party has a registered A2A endpoint. |
| `delegationTopologySupported` | boolean | Whether the Capability Declaration includes a Delegation Topology Declaration. |
| `liveAvailabilitySignal` | object or null | Present when the Capability Declaration carries `liveAvailabilityMode: PASSIVE` and a non-stale signal is available. Contains `status` (`AVAILABLE`, `LIMITED`, `UNAVAILABLE`), `signalTimestamp` (ISO 8601), and `cachedAt` (ISO 8601). Absent for `liveAvailabilityMode: NONE` declarations and for `ACTIVE_GATE` mode declarations (whose signal outcome is reflected in `availabilityStatus` only). Absent when the signal is stale (i.e., older than `liveAvailabilityCacheTtl`); a stale signal is surfaced as `status: SIGNAL_STALE` by `catalogue_check_availability` instead. |

### 8.5.2 catalogueMetadata

Appended to full `CapabilityDeclaration` objects returned by `catalogue_get`:

| Field | Type | Description |
|---|---|---|
| `retrievedAt` | ISO 8601 datetime | Time of retrieval. |
| `resourceRefStatuses` | object array | Per-`resourceRefId` status from the Resource Reference Registry at retrieval time. |
| `activePreArrangements` | object array | Pre-Arrangement Declarations in `ACTIVE` status that reference this declaration AND in which the requesting party appears as a `counterpartyId` or `declaringPartyId`. Declarations between other parties MUST NOT be surfaced to the requesting party. |
| `catalogueVersion` | string | Version of the Capability Catalogue schema used to assemble this response. |
| `liveAvailabilitySignal` | object or null | Present when the Capability Declaration carries `liveAvailabilityMode: PASSIVE` and a non-stale signal is available at retrieval time. Contains `status` (`AVAILABLE`, `LIMITED`, `UNAVAILABLE`), `signalTimestamp` (ISO 8601), `cachedAt` (ISO 8601), and `granularity` (the value of `liveAvailabilityGranularity` from the Capability Declaration). Absent for `liveAvailabilityMode: NONE` declarations, for `ACTIVE_GATE` mode declarations, and when the signal is stale. |

### 8.5.3 PartyCapabilitySummary

Returned by `catalogue_list_parties`:

| Field | Type | Description |
|---|---|---|
| `partyId` | string | The Fulfilling Party identifier. |
| `partyName` | string | Human-readable party name. |
| `activityCategories` | string array | Activity categories across all active declarations for this party. |
| `jurisdictions` | string array | Jurisdictions across all active declarations. |
| `declarationCount` | integer | Number of active Capability Declarations. |
| `a2aEndpoint` | string | A2A Agent Card URL for the party's A2A agent. Absent if the party has no registered A2A agent. |

---

## 8.6 Graceful Degradation Path

### 8.6.1 When Degradation Applies

The graceful degradation path applies when a booking agent attempts to reach a supplier agent via A2A and the attempt fails for any of the following reasons:

- The supplier has no registered A2A endpoint (`hasA2AAgent: false` in the Capability Declaration summary).
- The supplier's A2A agent is unreachable (connection failure, timeout).
- The supplier's A2A agent returns an unrecoverable error on a task request.

Degradation does not apply when the supplier agent returns a valid task response indicating a substantive outcome (e.g., `REJECTED` on `configuration_negotiation`). A substantive response is a successful A2A interaction; the booking agent acts on the outcome rather than degrading.

### 8.6.2 Fallback Path

On degradation, the booking agent falls back to MCP-based query of the Capability Catalogue against static Capability Declarations:

1. Use `catalogue_get` to retrieve the full Capability Declaration for the supplier.
2. Use `catalogue_check_availability` to confirm Resource Reference status.
3. Proceed to the Feasibility Check (§7) without A2A pre-signalling or configuration negotiation. The Activity Configuration is assembled by the booking agent from the static declaration without supplier-agent input.

Fallback is always permitted for `capability_declaration_query` interactions. For `configuration_negotiation` interactions, fallback is permitted but the booking agent accepts that the Activity Configuration has not been pre-validated by the supplier agent; the Feasibility Check is the binding validation step in all cases (DR-L2-8-E). For `feasibility_pre_signal` interactions, the absence of a pre-signal has no effect on the Feasibility Check; the supplier receives the check via the standard protocol mechanism and the absence of prior A2A contact is not an error condition (DR-L2-8-F).

### 8.6.3 When Fallback Is Not Permitted

Fallback is not permitted as a substitute for A2A in the following case: where a Pre-Arrangement Declaration explicitly requires A2A-mediated negotiation as a precondition for `TRANSITION_PRE_AUTH` activation. This is expressed via a `requiresA2ANegotiation: true` field in the Pre-Arrangement Declaration schema.

*The `requiresA2ANegotiation` field is defined in the Pre-Arrangement Declaration schema at S6 §6.3.5. This constraint is normatively enforceable via S6.*

When this field is set, the Feasibility Check step 3 (§7.3) will fail with `PRE_ARRANGEMENT_INVALID` if A2A negotiation has not been completed for the relevant Pre-Arrangement Declaration. This is an operator choice; it is not a default protocol behaviour.

---

## 8.7 MCP/A2A Boundary

Design rule L2-T-2-A defines the normative boundary:

- **Before Booking Object creation:** Layer 2 scope. A2A governs inter-party agent communication. MCP governs agent-to-protocol tool calls against the Capability Catalogue.
- **After Booking Object creation:** Layer 3 scope. MCP governs all agent-to-protocol interactions on the Booking Object.

The Capability Catalogue enforces this boundary by refusing to accept Booking Object identifiers in any query parameter. A query that references an existing `bookingObjectId` is operating in the wrong layer and MUST be rejected with a `BOUNDARY_VIOLATION` error.

At the transition point — when the booking agent moves from completed feasibility to Booking Object creation — the agent calls the Layer 3 MCP operation that creates the Booking Object. This MCP call is the first Layer 3 interaction for this booking. The Capability Catalogue is no longer consulted after this point for the lifecycle of that booking.

---

## 8.8 Design Rules

The following design rules govern the Capability Catalogue. Rules L2-T-2-A through L2-T-2-D are reproduced from the Pre-Layer 2 Review for traceability. They are traced in S12 (Design Rules Compliance Trace).

**L2-T-2-A:** The Booking Object creation event is the normative MCP/A2A boundary. All agent interactions before Booking Object creation are Layer 2 scope; A2A governs inter-party agent communication in this phase. All agent interactions on an existing Booking Object are Layer 3 scope; MCP governs agent-to-protocol interactions in this phase.

**L2-T-2-B:** Layer 2 defines the A2A task schemas for Capability Declaration queries (`capability_declaration_query`), Feasibility Check pre-signalling (`feasibility_pre_signal`), and configuration negotiation (`configuration_negotiation`). These schemas are Layer 2 protocol artifacts. All task schemas carry a `taskSchemaVersion` field.

**L2-T-2-C:** Suppliers without A2A agent capability MUST be reachable through the Capability Catalogue via MCP tool calls against static Capability Declarations. A2A is additive; its absence does not make a supplier non-conformant.

**L2-T-2-D:** The graceful degradation path is MCP-based query of the Capability Catalogue. Fallback is always permitted for capability discovery and feasibility pre-signalling. Fallback for configuration negotiation is permitted unless a Pre-Arrangement Declaration explicitly requires A2A-mediated negotiation as a precondition (`requiresA2ANegotiation: true`).

**DR-L2-8-A:** The Capability Catalogue MUST expose the four MCP tools defined in §8.3.2 (`catalogue_search`, `catalogue_get`, `catalogue_check_availability`, `catalogue_list_parties`). An implementation that omits any of these tools is non-conformant.

**DR-L2-8-B:** The Capability Catalogue MUST reject any query that includes a `bookingObjectId` parameter with a `BOUNDARY_VIOLATION` error. The Capability Catalogue operates exclusively in the pre-Booking Object phase.

**DR-L2-8-C:** A Capability Declaration returned by `catalogue_search` MUST reflect the current `registryStatus` of its cited Resource References at query time. Declarations with expired or deregistered Resource References MUST be excluded from default results; they MAY be included when `includeUnavailable: true` is specified by an operator-level authenticated party. For Capability Declarations with `liveAvailabilityMode: ACTIVE_GATE`, the `availabilityStatus` field in the result MUST reflect both Resource Reference status and the most recent non-stale live signal: `FULLY_AVAILABLE` requires both `ACTIVE` Resource Reference status and a non-stale live signal with `status: AVAILABLE`. For `PASSIVE` mode declarations, `FULLY_AVAILABLE` requires only `ACTIVE` Resource Reference status; the live signal is surfaced separately in the `liveAvailabilitySignal` field. See DR-L2-9-K for the normative mode-dependent semantics.

**DR-L2-8-D:** All MCP tool calls against the Capability Catalogue MUST be authenticated via the Layer 1 Security Kernel. Unauthenticated calls MUST be rejected.

**DR-L2-8-E:** A2A task responses from a supplier agent are advisory. An `ACCEPTED` response on `configuration_negotiation` is a pre-commitment signal, not a protocol-level authorisation. The Feasibility Check is the binding validation step for all Activity Configurations regardless of prior A2A negotiation outcome.

**DR-L2-8-F:** A supplier agent's `feasibility_pre_signal` response (including `acknowledged: false`) has no effect on the outcome of a subsequent Feasibility Check. The Feasibility Check executes its full evaluation sequence (§7.3 steps 1–6) independently of any prior A2A pre-signal.

**DR-L2-8-G:** A2A endpoints registered in the Layer 1 Party Registry MUST be valid A2A Agent Card URLs per the A2A Protocol specification. The Capability Catalogue surfaces them but does not host or proxy them.

**DR-L2-8-H:** Use of `includeUnavailable: true` on `catalogue_search` requires operator-level authorisation. Standard authenticated parties MUST be rejected with an authorisation error if they specify this parameter.

**DR-L2-8-I:** The `activePreArrangements` field in `catalogueMetadata` MUST include only Pre-Arrangement Declarations where the requesting party appears as a `declaringPartyId` or in `counterpartyIds`. Pre-Arrangement Declarations between other parties MUST NOT be surfaced to the requesting party.

**DR-L2-8-J:** All A2A task schemas defined in §8.4.2 are Layer 2 protocol artifacts. They MUST NOT reference Booking Object identifiers or any Layer 3 events. A2A task payloads that include a `bookingObjectId` field are non-conformant.

---

*End of Section 8*
