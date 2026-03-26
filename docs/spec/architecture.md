# Architecture Specification

**Activity Travel Protocol**
Version 0.2 — March 2026

---

## 1. Purpose and Scope

This document specifies the architectural foundation of the Activity Travel Protocol. It defines the runtime model, the layer structure, the twelve core OS functions, the key architectural concepts, and the design principles that govern all subsequent specification work.

The Activity Travel Protocol is not a message format specification. It is a runtime platform — a Travel Operating System — that manages the full lifecycle of a booking as a first-class runtime entity, with policy enforcement, trust chain construction, duty of care tracking, and AI agent participation built into the protocol itself.

---

## 2. Architectural Principles

### 2.1 Runtime Platform, Not Message Format

The protocol defines a shared runtime environment in which multiple Parties interact through a managed state machine. The Booking Object is the fundamental runtime entity — not the messages exchanged between parties. Every state transition, policy evaluation, and agent invocation is a first-class runtime operation with a recorded event log entry.

### 2.2 Cloud-Agnostic by Design

No protocol operation depends on a cloud-provider-specific service. The SDK provides provider-agnostic adapter interfaces. Reference implementations are provided for self-hosted, AWS, and Google Cloud deployments. A protocol implementation that requires a specific cloud provider is non-conformant.

### 2.3 Three-Tier Scaling

The same protocol operates across three deployment tiers. There is no protocol-level feature that is tier-specific:

| Tier | Target | Characteristics |
|------|--------|-----------------|
| **Tier 1** | Development / small operator | Single process, single machine. Full protocol compliance. Suitable for development, testing, and small-volume production. |
| **Tier 2** | Production | Containerised deployment. Horizontal scaling. Suitable for mid-scale operators and OTA integrations. |
| **Tier 3** | Hyperscale | Globally distributed. Multi-region. Kafka-class event streaming. Suitable for global platform operators. |

All tiers use identical protocol semantics. The adapter layer handles infrastructure differences.

### 2.4 AI Agent Participation as First-Class Design

The protocol is designed from the ground up for a world where AI agents negotiate and book on behalf of humans. AI agent participation is not an extension — it is a core architectural requirement, with defined authority scopes, human confirmation checkpoints, and a structured escalation path when the AI cannot resolve a situation.

---

## 3. Four-Layer Structure

The Activity Travel Protocol is organised into four layers. Each layer builds on the one below it. Layers are specified and published independently.

### Layer 1 — Identity and Trust (COMPLETE)

Establishes who the parties are, what they are authorised to do, and whether the transaction is legally compliant.

Components: Party Registry, Verifiable Credentials, Jurisdiction Compliance Registry, Trust Chain Declaration, Party Policy Declarations.

Standards: OpenID Federation 1.0, W3C VC Data Model 2.0, FAPI 2.0 Security Profile, did:web (minimum), TLS 1.3, AES-256-GCM.

### Layer 2 — Discovery and Capability (NOT YET STARTED)

Describes what suppliers offer before any booking begins.

Components: Capability Declarations, Activity Configuration Schema, Resource Reference Registry, Pre-Arrangement Declarations, Feasibility Check operation.

### Layer 3 — Workflow (NOT YET STARTED)

The state machine governing the booking lifecycle from INQUIRY through COMPLETION.

Components: State definitions, transition rules, message formats, timeout rules, Duty of Care handoffs, Disruption Event handling, AI agent participation rules.

### Layer 4 — Schema and SDK (PLACEHOLDER)

The complete API surface and developer toolkit.

Components: OpenAPI 3.1 (REST), GraphQL schema, AsyncAPI 3.0 events, JSON Schema objects, Zod schemas, AI agent interface schemas, MCP server, compatibility bridges (NDC, OpenTravel 1.0), conformance test suite.

---

## 4. The Runtime Model

### 4.1 The Booking Object

The Booking Object is the fundamental runtime entity. It is not a database record — it is a live runtime object with the following characteristics:

- **Identity**: UUID v7 (time-ordered, globally unique)
- **State machine**: XState v5 (TypeScript), runs in browser, edge functions, and Node.js
- **Shared state**: accessible to all Parties with appropriate role scope
- **Event log**: append-only, immutable audit trail for every state transition
- **Distributed lock**: prevents concurrent conflicting writes
- **Consistency model**: strong consistency for the `state` field; eventual consistency (500ms SLA) for attributes

The Booking Object lifecycle: create → active → suspended → resumed → completed / archived / terminated.

### 4.2 State Machine Specification

State machines are specified in BPMN 2.0 notation for human readability and published as protocol artifacts. Runtime execution uses XState v5.

XState v5 was selected because it runs in browser, edge functions (Deno/V8 isolate), and Node.js without a persistent server process — a requirement for Tier 1 and Tier 2 cloud-agnostic deployments.

### 4.3 Data Layer

The protocol requires five data storage types. Implementations may satisfy these with a single platform or multiple systems:

| Type | Purpose | Reference |
|------|---------|-----------|
| Relational (PostgreSQL-compatible) | Booking records, party registry | Supabase / PostgreSQL |
| Cache (Redis-compatible) | Current Booking Object state | Supabase / Redis |
| Property graph (GQL-compatible) | Policy dependency chains | Apache AGE (Postgres extension) |
| Append-only event log | Audit trail, state history | Supabase / custom |
| Object storage (S3-compatible) | Credentials, documents | Supabase Storage / S3 |

Supabase (open-source, self-hostable) is the Tier 1/2 reference platform and satisfies all five requirements.

---

## 5. The Twelve Runtime OS Functions

The Activity Travel Protocol runtime is an Operating System for travel transactions. Twelve core functions are defined and classified as Kernel-mode (non-bypassable, implemented by the protocol runtime) or User-mode (application responsibility, defined interface).

### Kernel Functions (Non-Bypassable)

**1. Process Management** — Booking Object lifecycle: create, suspend, resume, archive, terminate. Distributed lock for concurrent access. UUID v7 identity.

**2. Shared State (Memory)** — Booking Object shared across all Parties with role-scoped access. Runtime-only writes. Strong consistency for `state` field; eventual consistency (500ms) for attributes.

**3. Scheduler (Timeouts)** — Timeout events are state transitions. They go through the Policy Engine and produce event log entries. Timeout durations cannot be extended by Party Policy Declarations beyond the protocol-defined maximum.

**5. Inter-Party Communication (IPC)** — All inter-party communication routes through the runtime. No direct Party-to-Party channels that bypass the protocol. All messages are JWS-signed and verified.

**6. Security Kernel** — Non-bypassable. Every state transition: authenticate Party, authorise operation, evaluate OPA policy, validate Trust Chain, validate AI agent authority scope. See Section 6.

**8. Versioning and Compatibility** — Multiple protocol versions run simultaneously during transition periods. 12-month deprecation notice required for breaking changes. Robustness principle applied for minor version differences.

**9. Conflict Resolution** — Policy conflict hierarchy applied in order. Unresolvable same-tier conflicts trigger the Human Escalation Manager. All decisions recorded in event log.

**10. Observability** — OpenTelemetry for all operations. Event log retained for the jurisdiction-defined minimum period (JP: 5 years, EU: 3 years).

**12. Stable API (System Calls)** — OpenAPI 3.1 + GraphQL schema + AsyncAPI 3.0 = the complete stable API surface. Versioned independently of runtime internals.

### User Functions (Application Responsibility)

**4. Driver Model** — Capability Declarations (supplier drivers), Resource Reference Registry entries (data provider drivers), Jurisdiction entries (regulatory drivers). Validated against schema at registration.

**7. Crash Recovery** — Protocol defines recovery states and timeout rules. Application implements detection (heartbeat polling or circuit breaker). `PARTY-UNRESPONSIVE` triggers the Human Escalation Manager in FULFILLMENT states.

**11. Human Escalation Manager** — Protocol defines the trigger conditions, Context Package schema, and expected response format. Application implements delivery (push notification, dashboard, email, SMS). Cannot be disabled.

---

## 6. Security Kernel

The Security Kernel is a non-bypassable component of the runtime. It executes on every state transition before any business logic runs.

### 6.1 Execution Order

For every state transition request:

1. **Authenticate** — Verify the requesting Party's identity against the Party Registry. Validate credential currency.
2. **Authorise** — Verify the Party holds a role that permits the requested operation in the current state.
3. **Policy evaluation** — Evaluate the applicable ODRL policy set through OPA. All four policy tiers evaluated: Protocol, Jurisdiction, Party Operational, Party Preference.
4. **Trust Chain validation** — Verify the full Trust Chain from the requesting Party to the protocol root. Validate all intermediate Subordinate Statements.
5. **AI agent scope validation** — If the request originates from an AI agent, validate the agent's authority scope against the operation requested. Out-of-scope requests trigger the Human Escalation Manager, not an error.

### 6.2 Policy Engine

- **Declaration format**: ODRL (W3C Open Digital Rights Language) — human-readable, what parties write, what regulators read.
- **Runtime evaluation**: OPA (Open Policy Agent, CNCF-graduated). ODRL policies compiled to OPA/Rego at registration time.
- **Policy hierarchy** (highest to lowest): Protocol-Level, Jurisdiction Regulatory, Party Operational, Party Preference.

### 6.3 Transport and Encryption

- TLS 1.3 minimum for all transport
- AES-256-GCM for data at rest
- All messages JWS-signed
- FAPI 2.0 Security Profile for API-level security

---

## 7. Context Package and Decision Object

### 7.1 Context Package

The Context Package is the defined schema of everything an AI agent receives at a participation level boundary. It is a protocol artifact — not an implementation detail.

Contents of a Context Package:
- Current Booking Object state
- Applicable policy set (in ODRL)
- Feasibility constraints
- Authority scope granted to this agent invocation
- Decision history for this booking

The Context Package schema is specified in the AI Agent Interface Specification (forthcoming, Layer 3).

### 7.2 Decision Object

The Decision Object is the structured output an AI agent must return. Free-text responses are not accepted by the protocol runtime.

Required fields:
- `proposed_action` — enum of permitted actions for this participation level
- `reasoning` — structured explanation
- `confidence` — float 0.0 to 1.0
- `alternatives_considered` — array of alternatives evaluated
- `human_escalation_requested` — boolean

The runtime validates `proposed_action` against the agent's authority scope before executing. Out-of-scope proposals trigger the Human Escalation Manager.

### 7.3 AI Provider Agnosticism

Any model accepting structured JSON input and returning structured JSON output conforming to the Decision Object schema is compatible. The protocol imposes no constraint on AI provider, model, or inference infrastructure.

---

## 8. API Surface

The Activity Travel Protocol exposes four API surfaces. All four are first-class:

| Surface | Specification | Use |
|---------|--------------|-----|
| **REST** | OpenAPI 3.1 | All transactional operations (state-changing). Synchronous request-response. |
| **GraphQL** | GraphQL schema | Capability Discovery queries. Selective field fetching for OTA-scale catalogue queries. Real-time availability subscriptions. |
| **Events** | AsyncAPI 3.0 | Event streaming, state change notifications, Disruption Event feeds, AI agent subscriptions. |
| **AI Tools** | MCP (Model Context Protocol) | First-class AI tool exposure. Priority deliverable shipping with v1.0 SDK. |

### 8.1 MCP Server as First-Class Output

The MCP server is a protocol-level deliverable, not an optional integration. One well-designed MCP server makes every MCP-compatible AI assistant a capable travel booking agent without additional integration work.

The MCP server ships with the v1.0 SDK as the `atp-mcp` package.

---

## 9. SDK Package Structure

The SDK is delivered as a set of independently installable packages:

| Package | Contents | Environments |
|---------|----------|--------------|
| `atp-core` | Booking Object model, XState state machine, Zod validation, event log types. Zero network I/O. | All |
| `atp-client` | REST, GraphQL, AsyncAPI clients. Auth token management. | All |
| `atp-server` | Protocol runtime host. All 12 OS functions. | Node.js only |
| `atp-policy` | ODRL authoring, ODRL-to-OPA compiler, policy validation. | All |
| `atp-agent` | AI agent interface — Context Package, Decision Object validation, escalation. | All |
| `atp-mcp` | MCP server exposing protocol operations as LLM tools. | Node.js |
| `atp-graphql` | GraphQL schema and resolvers for Capability Discovery. | All |
| `atp-testing` | Conformance test suite runner. Issues Conformance Certificate. | Node.js |
| `atp-zod` | Zod schemas generated from JSON Schema 2020-12 source. | All |
| `atp-supabase` | Supabase adapter — booking storage, auth, edge functions, Realtime. | All |

All packages except `atp-server` must run in Deno/V8 isolate environments. Web Crypto API is used instead of Node.js crypto. No native Node.js dependencies in core packages.

---

## 10. Observability

Every state transition, policy evaluation, and AI agent invocation is traced via OpenTelemetry (CNCF-graduated). Event log retention is jurisdiction-defined: Japan 5 years minimum, EU 3 years minimum.

---

## 11. Workflow Coverage

The protocol covers the complete customer journey from inquiry to safe return home. Eight journey phases: PRE_DEPARTURE, OUTBOUND_TRANSIT, ARRIVAL, IN_DESTINATION, ACTIVITY_FULFILLMENT, RETURN_TRANSIT, RETURN_ARRIVAL, COMPLETION.

Disruption Events are a Layer 1 architectural requirement. AI agents cannot hold Duty of Care — it passes to the Party that issued the agent authorisation.

When a Disruption Event is declared during an IN_JOURNEY phase, the Booking Object enters the `DISRUPTION_REVIEW` state. This is a protocol-level construct — a dedicated state in the Booking Object lifecycle that suspends normal phase progression and activates the disruption resolution pathway. `DISRUPTION_REVIEW` exits to `AMENDMENT`, `CANCELLATION`, or back into the active IN_JOURNEY phase, depending on the resolution outcome. The protocol defines a three-category incident taxonomy — Category C1 (supplier-operational), Category C2 (environmental or force majeure), and Category A/B (life-safety and Duty of Care transfer events) — which determines declaration authority, escalation path, and the Security Kernel enforcement rules that apply. Category A and B declarations are permanently reserved for human Actors. Category C1 declarations may be pre-authorised for autonomous system or AI agent declaration via PP-005 in the Party Policy Declarations Specification.

---

## 12. Relationship to Published Specifications

This architecture specification governs all Layer 1 through Layer 4 documents. Where a layer specification conflicts with this document, this document takes precedence and the conflict must be resolved before the layer specification is ratified.

---

*Activity Travel Protocol — Architecture Specification v0.2 — March 2026*
