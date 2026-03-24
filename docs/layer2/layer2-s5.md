# S5 Resource Reference Registry

**Activity Travel Protocol — Layer 2 Capability and Discovery Specification**
**Section 5: Resource Reference Registry**
**Status: WORKING DRAFT — March 2026**

---

## 5.1 Purpose

The Resource Reference Registry is the Layer 2 implementation of OS Function 4 (Driver Model) defined in the Architecture Specification, Section 5. It is the normative registry of data provider drivers through which Activity Travel Protocol participants resolve external data dependencies — pricing feeds, inventory sources, availability signals, geospatial data, and similar runtime data sources — into protocol-managed references.

The Registry provides three guarantees:

1. **Validation at registration.** Every driver entry is validated against the Resource Reference Schema at registration time. Malformed or non-conformant entries are rejected. No downstream protocol operation may reference an unregistered driver.

2. **Protocol mediation.** No participant MAY access an external data source directly from within a booking workflow. All data source access MUST pass through a registered Resource Reference. This is the Driver Model boundary.

3. **Staleness management.** Registered Resource References carry a validity period and revalidation interval. The Registry enforces these constraints and raises events when references approach or cross their staleness boundary.

The Resource Reference Registry is a Layer 2 artifact. It is populated before booking workflows commence and queried by the Capability Catalogue during the INQUIRY phase of Layer 3 workflows.

---

## 5.2 Relationship to Other Layer 2 Components

The Resource Reference Registry interacts with the following Layer 2 components:

**Capability Declaration Schema (S3).** A Capability Declaration MAY reference one or more Resource References by `resourceRef` identifier. A Capability Declaration is invalid if any referenced `resourceRefId` does not resolve to a registered, non-expired entry in the Resource Reference Registry. This validation is performed by the Registry at Capability Declaration registration time, as specified in S3. DR-L2-5-C (§5.8) states the Registry's corresponding obligation.

**Activity Configuration Schema (S4).** An Activity Configuration MAY inherit Resource References from its parent Capability Declaration. Overriding a Resource Reference at configuration time is permitted only where the Capability Declaration explicitly marks the reference as `configurable: true`. The semantics of this override are defined in S4; this section records only the Registry's role in validating that any override target is itself a registered, non-expired entry. *Cross-reference gap: the precise override mechanics are to be resolved when S4 and S5 are reviewed together.*

**Pre-Arrangement Declarations (S6).** Pre-Arrangement Declarations MAY reference Resource References that are active at the time of pre-arrangement. The Registry MUST validate that referenced drivers remain registered and non-expired when a Pre-Arrangement Declaration is presented for admission into a booking workflow.

**Feasibility Check Operation (S7).** The Feasibility Check MUST validate, per Activity Component, that all Resource References cited in the Component's Capability Declaration are registered, non-expired, and not flagged for revalidation failure at the time the feasibility result is emitted. An Activity Component with an expired or deregistered Resource Reference MUST yield `FEASIBILITY_FAILED`. An Activity Component with a stale Resource Reference MUST yield a `STALE_RESOURCE_REF` warning; staleness alone does not cause failure.

**Capability Catalogue (S8).** The Capability Catalogue queries the Registry to surface which Resource References are available to a given Fulfilling Party. MCP tool calls against the Capability Catalogue may return Resource Reference metadata in their payloads. The Capability Catalogue is a named protocol-internal component permitted to query entries across parties (§5.7).

---

## 5.3 OS Function 4 — Driver Model

The Architecture Specification classifies OS Function 4 as a **User-mode** function (application responsibility), meaning the protocol defines the interface and validation rules but does not mandate a specific runtime implementation. The Resource Reference Registry is the normative Layer 2 realisation of that interface.

The Driver Model defines three categories of data provider driver:

| Driver Category | Description | Examples |
|---|---|---|
| `PRICING` | Pricing and rate data sources | Rate sheets, dynamic pricing APIs, GDS fare feeds |
| `AVAILABILITY` | Inventory and availability signals | Property management systems, slot calendars, capacity feeds |
| `REFERENCE` | Static reference data | Geospatial datasets, classification tables, taxonomy feeds |

A registered Resource Reference MUST declare exactly one driver category. A Capability Declaration MAY cite Resource References from multiple categories.

The Driver Model boundary is the registration act. Once a driver is registered and its Resource Reference entry is valid, the protocol treats it as an opaque, trusted data source for the validity period. The protocol does not mandate how the driver fetches, caches, or refreshes its underlying data.

---

## 5.4 Resource Reference Schema

Each entry in the Resource Reference Registry conforms to the following schema.

### 5.4.1 Required Fields

| Field | Type | Constraints |
|---|---|---|
| `resourceRefId` | string | Globally unique. URI format. Issued by the Registry on registration. |
| `partyId` | string | The `partyId` of the Fulfilling Party registering this driver. MUST match the authenticated party at registration time. |
| `driverCategory` | enum | One of: `PRICING`, `AVAILABILITY`, `REFERENCE`. |
| `driverName` | string | Human-readable name. 1–128 characters. |
| `driverVersion` | string | Semantic version string (MAJOR.MINOR.PATCH). |
| `schemaVersion` | string | Version of the Resource Reference Schema this entry conforms to. |
| `validFrom` | ISO 8601 datetime | Inclusive lower bound of validity period. |
| `validUntil` | ISO 8601 datetime | Exclusive upper bound of validity period. MUST be after `validFrom`. MUST NOT exceed `validFrom` + P1Y (one calendar year). |
| `revalidationInterval` | ISO 8601 duration | Maximum age before the entry must be revalidated. MUST be ≤ (`validUntil` − `validFrom`). |
| `endpointDescriptor` | object | See §5.4.2. |

### 5.4.2 Endpoint Descriptor

The `endpointDescriptor` object describes how the SDK layer resolves and contacts the data provider at runtime. It contains:

| Field | Type | Constraints |
|---|---|---|
| `endpointType` | enum | One of: `REST`, `GRAPHQL`, `GRPC`, `STATIC_FILE`. `STATIC_FILE` is valid only for `REFERENCE` category entries; it MUST be rejected for `PRICING` and `AVAILABILITY` categories. |
| `baseUri` | string | URI of the data provider endpoint. MUST use HTTPS. HTTP endpoints are non-conformant and MUST be rejected at registration. |
| `authScheme` | enum | One of: `BEARER_TOKEN`, `API_KEY`, `MTLS`, `NONE`. |
| `credentialRef` | string | Reference to a Layer 1 credential entry. Required unless `authScheme` is `NONE`. |
| `timeoutMs` | integer | Maximum response time in milliseconds the SDK layer will wait before treating the call as failed. MUST be > 0. |

### 5.4.3 Optional Fields

| Field | Type | Description |
|---|---|---|
| `configurable` | boolean | If `true`, a downstream Activity Configuration MAY override this reference. Default: `false`. |
| `jurisdiction` | string array | ISO 3166-1 alpha-2 country codes. If present, the Resource Reference is valid only for bookings whose primary jurisdiction matches. |
| `tags` | string array | Operator-defined classification tags. No protocol semantics. |
| `deprecationNotice` | string | If present, this entry is deprecated. Value is a human-readable explanation. A deprecated entry remains usable until `validUntil` but MUST NOT be referenced in new Capability Declarations. |

---

## 5.5 Registration Operation

### 5.5.1 Registration Request

A Fulfilling Party submits a registration request containing a candidate Resource Reference entry. The Registry validates the request in the following sequence:

1. **Authentication.** The submitting party MUST be authenticated via the Layer 1 Security Kernel. The `partyId` in the candidate entry MUST match the authenticated party identity.

2. **Schema validation.** The candidate entry MUST conform to the Resource Reference Schema defined in §5.4. Any field constraint violation causes immediate rejection. No partial state is persisted on rejection.

3. **Duplicate check.** If an entry with the same `partyId`, `driverName`, and `driverVersion` already exists and is not expired, the Registry MUST reject the request with a `DUPLICATE_RESOURCE_REF` error. To update an existing driver, the Fulfilling Party MUST increment `driverVersion` (auto-supersession path) or explicitly deregister the existing entry first.

4. **Credential validation.** If `authScheme` is not `NONE`, the Registry MUST confirm that `credentialRef` resolves to a valid, non-expired Layer 1 credential entry for the submitting party.

5. **Validity period sanity.** `validFrom` MUST be ≤ current time + 24 hours (pre-registration is permitted up to 24 hours in advance). `validUntil` MUST be > current time and MUST NOT exceed `validFrom` + P1Y.

On successful validation, the Registry assigns a `resourceRefId` (URI format, Registry-issued) and returns the complete registered entry to the submitting party.

### 5.5.2 Registration Events

The Registry MUST emit the following events on the Activity Travel Protocol event bus:

| Event | Trigger |
|---|---|
| `RESOURCE_REF_REGISTERED` | Successful registration of a new entry with no active prior version for the same `partyId`/`driverName`. |
| `RESOURCE_REF_UPDATED` | Successful registration of a new entry with incremented `driverVersion` while a prior version entry for the same `partyId`/`driverName` is still active (auto-supersession path). The prior entry is automatically moved to `DEREGISTERED` status. |
| `RESOURCE_REF_DEREGISTERED` | A Fulfilling Party explicitly deregisters an entry before its `validUntil`. |
| `RESOURCE_REF_EXPIRED` | The Registry detects that an entry has passed its `validUntil` without renewal. |
| `RESOURCE_REF_STALE` | An entry has exceeded its `revalidationInterval` without revalidation. Emitted at the interval boundary, not at `validUntil`. |
| `RESOURCE_REF_REVALIDATED` | A Fulfilling Party successfully revalidates a stale entry. |

All events MUST include `resourceRefId`, `partyId`, `driverCategory`, and `driverName` in their payload.

---

## 5.6 Staleness Management

Staleness management is distinct from expiry. An entry is **expired** when the current time exceeds `validUntil`; an expired entry is unusable and MUST be treated as deregistered for all protocol purposes. An entry is **stale** when the current time exceeds `validFrom` + `revalidationInterval`; a stale entry is still usable but MUST be flagged in any Feasibility Check response that cites it.

### 5.6.1 Evaluation Point

Expiry and staleness status are evaluated at the time the Feasibility Check result is emitted, not at the time the Feasibility Check is initiated. If a Resource Reference transitions from active to expired or stale during an in-flight Feasibility Check, the emitted result MUST reflect the status at emission time.

### 5.6.2 Stale Entry Behaviour

When the Feasibility Check Operation (S7) encounters an Activity Component whose Capability Declaration references a stale Resource Reference, it MUST:

- Continue the feasibility evaluation (do not fail automatically on staleness alone).
- Include a `STALE_RESOURCE_REF` warning in the feasibility response payload, identifying the `resourceRefId` and the elapsed duration since `revalidationInterval` was exceeded.
- Propagate the warning to the Booking Object so that it is visible in the INQUIRY phase audit trail.

### 5.6.3 Revalidation

A Fulfilling Party revalidates a stale entry by submitting an updated `revalidationInterval` and/or `validUntil` to the Registry. The Registry validates the updated values using the same rules as registration (§5.5.1, steps 1 and 5). On success, the Registry emits `RESOURCE_REF_REVALIDATED` and resets the staleness clock.

A Fulfilling Party MAY revalidate an entry that is not yet stale (pre-emptive revalidation). The Registry MUST accept pre-emptive revalidation.

---

## 5.7 Query Interface

The Resource Reference Registry exposes a query interface used by the Capability Catalogue (S8) and the Feasibility Check engine (S7). All other queries are party-scoped: an authenticated Fulfilling Party may only query entries registered by that party. The Capability Catalogue and the Feasibility Check engine are named protocol-internal components and are permitted to query entries across parties in order to perform their protocol functions.

### 5.7.1 Supported Query Parameters

| Parameter | Description |
|---|---|
| `partyId` | Filter by registering party. |
| `driverCategory` | Filter by `PRICING`, `AVAILABILITY`, or `REFERENCE`. |
| `validAt` | Return only entries valid at the specified datetime. Default: current time. |
| `includeStale` | If `true`, include stale entries in results (default: `false`). |
| `includeDeprecated` | If `true`, include deprecated entries in results (default: `false`). |
| `jurisdiction` | Filter by jurisdiction code. Returns entries with no `jurisdiction` field plus entries whose `jurisdiction` array includes the specified code. |
| `resourceRefId` | Direct lookup by identifier. |

### 5.7.2 Query Response

Each result entry in the query response MUST include all required fields from §5.4.1, the `endpointDescriptor` (§5.4.2), and a `registryStatus` field with one of the following values: `ACTIVE`, `STALE`, `DEPRECATED`, `EXPIRED`, `DEREGISTERED`.

---

## 5.8 Design Rules

The following design rules govern the Resource Reference Registry. They are traced in S12 (Design Rules Compliance Trace).

**DR-L2-5-A:** Every Resource Reference entry MUST be validated against the Resource Reference Schema at registration time. The Registry MUST reject non-conformant entries without persisting any partial state.

**DR-L2-5-B:** No protocol operation within a booking workflow MAY access an external data source directly. All external data access MUST be mediated through a registered, non-expired Resource Reference. This rule implements the Driver Model boundary (OS Function 4).

**DR-L2-5-C:** The Registry MUST, at Capability Declaration registration time, confirm that every `resourceRefId` cited in the Capability Declaration resolves to a registered, non-expired entry. This validation MUST NOT be deferred to query time. (The corresponding obligation on the Capability Declaration registration operation is specified in S3.)

**DR-L2-5-D:** The Feasibility Check Operation MUST include `STALE_RESOURCE_REF` warnings in its emitted result for any Activity Component whose cited Resource References are in `STALE` status at emission time. Staleness alone MUST NOT cause `FEASIBILITY_FAILED`; it produces a warning propagated to the audit trail.

**DR-L2-5-E:** An expired or deregistered Resource Reference MUST cause `FEASIBILITY_FAILED` for any Activity Component that cites it. Expiry and deregistration status are evaluated at the time the feasibility result is emitted.

**DR-L2-5-F:** The `endpointDescriptor.baseUri` MUST use HTTPS. HTTP endpoints are non-conformant and MUST be rejected at registration.

**DR-L2-5-G:** Resource Reference entries are scoped to the registering Fulfilling Party. A Fulfilling Party MUST NOT reference another party's `resourceRefId` in its own Capability Declarations.

**DR-L2-5-H:** `validUntil` MUST NOT exceed `validFrom` + P1Y. Registrations and revalidations that would set `validUntil` beyond this bound MUST be rejected.

**DR-L2-5-I:** `STATIC_FILE` endpoints are valid only for `REFERENCE` category Resource References. Registrations specifying `endpointType: STATIC_FILE` with `driverCategory: PRICING` or `driverCategory: AVAILABILITY` MUST be rejected.

---

## 5.9 Relationship to Layer 1

The Resource Reference Registry depends on Layer 1 for two services:

1. **Party authentication.** All registration and query operations require an authenticated party identity from the Layer 1 Security Kernel. The Registry MUST NOT process unauthenticated requests.

2. **Credential references.** The `credentialRef` field in the `endpointDescriptor` resolves against the Layer 1 credential store. The Registry validates credential existence and non-expiry at registration time (§5.5.1, step 4). The SDK layer is responsible for resolving the actual credential value at data access time; the Registry stores only the reference, never the credential value itself.

The Resource Reference Registry does not define new Layer 1 identity constructs. It consumes the party identity and credential infrastructure defined in the Layer 1 Specification.

---

*End of Section 5*
