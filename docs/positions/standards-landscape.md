# Standards Positions and Interoperability Map

**Activity Travel Protocol**
Version 1.1 — March 2026

> **Document Status:** Standards Position — Activity Travel Protocol
> This document sets out the Activity Travel Protocol's positions on relevant external standards and maps interoperability relationships. Positions are assigned as: **Adopt**, **Bridge**, **Differentiate**, or **Monitor**.

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| v1.0 | March 2026 | Initial publication. |
| v1.1 | March 2026 | A2A — Agent2Agent Protocol promoted from MONITOR to ADOPT. Position updated per design decision PD-L2-2 (Pre-Layer 2 Review, March 2026). OQ-SL-3 closed. |

---

## How to Read This Document

| Position | Meaning |
|----------|---------|
| **ADOPT** | The Activity Travel Protocol uses this standard directly. We write conformant implementations and cite it in our specs. |
| **BRIDGE** | The Activity Travel Protocol is interoperable with this standard. We define a mapping or adapter layer. |
| **DIFFERENTIATE** | The Activity Travel Protocol consciously departs from this standard for defined reasons. The departure is documented. |
| **MONITOR** | The Activity Travel Protocol watches this standard but takes no position yet. A trigger condition for re-evaluation is defined. |

Standards are grouped into three domains: Agentic AI protocols, Travel industry standards, and Foundational internet and security standards.

---

## 1. Agentic AI Protocols

### 1.1 CAAM — Contextual Agent Authorization Mesh

**Position: BRIDGE**

IETF Internet-Draft draft-barney-caam-00, published 24 February 2026. Individual submission — not an IETF working group product. Expires August 2026.

CAAM defines the Post-Discovery Authorization Handshake — the runtime authorization layer between agent discovery and tool execution. Its five components: CAAM Sidecar, Post-Discovery Authorization Handshake, Relationship-Based Access Control (ReBAC), Purpose-Bound Delegation, and Cryptographically Verifiable Intent Propagation.

**Overlap with the Activity Travel Protocol:**

- *Purpose-Bound Delegation* maps directly to the Activity Travel Protocol's `AgentAuthorityDeclaration` and `authority_scope` on Context Packages. Both scope agent authority to a declared intent. The Activity Travel Protocol implements this at the protocol object layer; CAAM implements it at the OAuth/OIDC token layer.
- *Cryptographically Verifiable Intent Propagation* is structurally equivalent to the Activity Travel Protocol's Trust Chain. The Activity Travel Protocol uses OpenID Federation Subordinate Statements; CAAM uses `act` claims in JWT access tokens. The outputs are similar; the mechanisms differ.
- *CAAM Sidecar* and the Activity Travel Protocol's *Security Kernel* occupy the same architectural location — between the agent and execution — enforcing policies the agent cannot override.
- *Scope Attenuation* mirrors the Activity Travel Protocol's participation level model (Level 1 → Level 2 → Level 3).

**What CAAM does not cover:** booking state machines, multi-party workflows, ODRL policy declarations, duty of care, disruption handling, jurisdiction compliance, or Capability Declarations. These are the Activity Travel Protocol's value-add above CAAM's infrastructure layer.

**Actions required:**
- Define formal mapping between the Activity Travel Protocol Trust Chain (OpenID Federation Subordinate Statements) and CAAM delegation tokens (`act`-claim JWT chains).
- Verify Activity Travel Protocol Trust Chain construction produces `act`-claim-compatible audit records.
- Cite CAAM as an informative Related Work reference — not a normative dependency — in v1.0 specifications.
- Monitor for IETF working group adoption. WG adoption triggers upgrade to Adopt.

### 1.2 ARDP — Agent Registration and Discovery Protocol

**Position: MONITOR**

IETF Internet-Draft draft-pioli-agent-discovery-01. Companion to CAAM. Defines stable agent identities, dynamic endpoint resolution, and capability advertisement across MCP, A2A, HTTP, and gRPC.

ARDP's registry model — domain-scoped with explicit federation — is compatible with the Activity Travel Protocol's Party Registration model. Its Capability Advertisement is generic agent metadata, not Activity Travel Protocol Capability Declarations.

Re-evaluate when Layer 2 Capability Catalogue design begins, or if ARDP gains IETF working group status.

### 1.3 MCP — Model Context Protocol

**Position: ADOPT**

Origin: Anthropic, November 2024. Donated to Linux Foundation Agentic AI Foundation (AAIF), December 2025. Co-founded with Block and OpenAI. De facto standard for agent-to-tool integration.

The Activity Travel Protocol adopted MCP as a first-class deliverable. The `atp-mcp` package ships with v1.0. This position is closed.

**Scope boundary with A2A (established PD-L2-2, March 2026):** MCP governs all interactions between an agent and the protocol runtime — Booking Object operations, Security Kernel calls, and state transitions. A2A governs interactions between a booking agent and a supplier agent during discovery and negotiation, before a Booking Object exists. The two protocols are complementary and operate at different levels. The Booking Object creation event is the normative MCP/A2A boundary.

**2026 roadmap relevance:**
- `.well-known` URL discovery — align Activity Travel Protocol Capability Declaration hosting URL structure when MCP spec is published.
- Enterprise readiness (audit trails, SSO-integrated auth) — Activity Travel Protocol Security Kernel implementation should satisfy emerging MCP enterprise extension patterns.
- Tasks primitive lifecycle (retry semantics, expiry) — the Activity Travel Protocol's booking state machine already handles these. Document as prior art in Layer 3.

### 1.4 A2A — Agent2Agent Protocol

**Position: ADOPT**

> **Updated v1.1:** Promoted from MONITOR to ADOPT. Design decision PD-L2-2, Pre-Layer 2 Review, March 2026.

Google Cloud, April 2025. Donated to Linux Foundation June 2025. v0.3 current.

The Activity Travel Protocol's primary use case at scale is AI agents acting for travelers negotiating with AI agents acting for suppliers. A2A is the emerging standard for exactly this interaction pattern: agent-to-agent communication across party boundaries for discovery and negotiation.

**Role in the Activity Travel Protocol:** A2A governs inter-party agent communication during the Layer 2 discovery and feasibility phase — before a Booking Object exists. A booking agent uses A2A to query a supplier agent about capabilities, negotiate configuration options, and receive feasibility signals. When the supplier agent pushes `FEASIBILITY_CLEARED` and the Booking Object is created, the interaction transitions to MCP for all subsequent Layer 3 protocol operations.

**Scope boundary with MCP:** The Booking Object creation event is the normative boundary. All agent interactions before Booking Object creation are Layer 2 scope governed by A2A. All agent interactions on an existing Booking Object are Layer 3 scope governed by MCP.

**Graceful degradation:** Suppliers without A2A agent capability are reachable through the Capability Catalogue via MCP tool calls against static Capability Declarations. A2A is additive — its absence does not make a supplier non-conformant.

**Actions required:**
- Layer 2 S8 (Capability Catalogue) and S10 (AI Agent Participation) must define A2A task schemas for Capability Declaration queries and Feasibility Check interactions (design rule L2-T-2-B).
- Layer 2 must document the graceful degradation path: when a booking agent cannot reach a supplier agent via A2A, the fallback is MCP-based query of the Capability Catalogue (design rule L2-T-2-D).
- A2A Agent Card bridge opportunity: define mapping between Activity Travel Protocol Capability Declarations and A2A Agent Cards in Layer 2 App. A.

### 1.5 IETF Agentic AI Draft Cluster

**draft-klrc-aiagent-auth-00** — AI Agent Authentication and Authorization
Position: **BRIDGE** — OAuth 2.0 patterns compatible with the Activity Travel Protocol's FAPI 2.0 implementation. Cite as normative reference if it reaches RFC status.

**draft-goswami-agentic-jwt-00** — Agentic JWT / Secure Intent Protocol
Position: **MONITOR** — Agent checksum concept novel; may influence Context Package integrity in v1.1. Not relevant to v1.0.

**draft-oauth-transaction-tokens-for-agents-00** — Transaction Tokens for Agents
Position: **BRIDGE** — Actor/principal pattern is the flat-token representation of the Activity Travel Protocol's nested Trust Chain. Activity Travel Protocol audit log entries should be reconstructable from transaction token records.

**draft-ni-a2a-ai-agent-security-requirements-01** — Security Requirements for AI Agents
Position: **MONITOR** — Use as completeness checklist against Activity Travel Protocol Security Architecture v1.

### 1.6 W3C AI Agent Work

**Position: MONITOR**

W3C AI Agent Protocol Community Group (formed June 2025) and Web & AI Interest Group. WebMCP (joint Google-Microsoft, September 2025) enables browser-native agent-to-web-application calls — complementary to, not competing with, MCP.

Trigger for re-evaluation: W3C AI Agent Protocol CG produces a Recommendation-track document.

---

## 2. Travel Industry Standards

### 2.1 OpenTravel Alliance

**Position: BRIDGE**

Linux Foundation member (2025). Covers hotels, car rental, rail, golf, ground transportation, air. Does not cover complex multi-supplier activity experiences or AI agent participation.

Activity Travel Protocol Capability Declarations for hotel, transport, and car components should be mappable to OpenTravel message structures, enabling OTA-connected suppliers to participate in Activity Travel Protocol bookings without rewriting their stack. The Activity Travel Protocol's REST/OpenAPI 3.1 surface is directly compatible with the OAI-Travel workgroup direction.

Action: Seek observer participation in OAI-Travel workgroup when v1.0 spec is complete.

### 2.2 IATA NDC and One Order

**Position: BRIDGE**

NDC 24.1 current. One Order in active rollout. Covers airline ticketing and ancillary services only.

Activity Travel Protocol intersection: outbound and return transit phases. A ski trip booking may include flights. `iata_irops_category_code` (SAR-18) already seeds the bridge.

Actions: Define `FlightComponent` type in Layer 2 Capability Declaration schema accepting NDC order reference as foreign key. Complete IROPS taxonomy mapping in Layer 3 Disruption Events specification.

### 2.3 IATA IROPS

**Position: BRIDGE**

Already implemented via `iata_irops_category_code` in `SourceSignalRecord` (SAR-18). Complete taxonomy mapping in Layer 3 Disruption Events specification.

---

## 3. Foundational Standards (All ADOPT — Closed Decisions)

| Standard | Notes |
|----------|-------|
| **OpenID Federation 1.0** | Trust Chain = OpenID Federation. Compatible with CAAM's IPSIE identity provenance. |
| **FAPI 2.0 Security Profile** | API-level security. Compatible with draft-klrc-aiagent-auth-00 patterns. |
| **W3C VC Data Model 2.0** | Party credentials. ES256 signing confirmed (SAR-10 through SAR-21). |
| **DID Methods** (did:web, did:ion, did:key) | did:web required minimum. Compatible with ARDP's domain-anchored identity model. |
| **ODRL** | Canonical policy declaration. Confirmed differentiator vs. IETF OAuth-scope approach — human-readable, regulatory-legible. |
| **OPA / Open Policy Agent** | Runtime policy evaluation. ODRL compiled to Rego at registration. |
| **BPMN 2.0 / XState v5** | Workflow specification and runtime. Activity Travel Protocol's Context Package and state machine are ahead of IETF framework drafts. |
| **AsyncAPI 3.0** | Event streaming. Monitor MCP Tasks SEP for alignment opportunity. |
| **OpenTelemetry** | Audit trail spans. Confirmed by Security Architecture v1. |
| **SSF (Shared Signals Framework)** | Credential revocation. Hybrid Option C. CAEP and RISC event sets defined. |

---

## 4. Summary Decision Table

| Standard | Domain | Position | Key Action |
|----------|--------|----------|------------|
| CAAM | Agentic AI | ADOPT (layer) / BRIDGE (mapping) | Trust Chain ↔ act-claim mapping. Cite as Related Work. Monitor for WG adoption → full Adopt. |
| ARDP | Agentic AI | MONITOR | Re-evaluate at Layer 2 Capability Catalogue design. |
| MCP | Agentic AI | ADOPT | atp-mcp ships v1.0. Align .well-known URL. Monitor Tasks SEP. MCP/A2A boundary: Booking Object creation. |
| A2A | Agentic AI | **ADOPT** | Inter-party agent communication in Layer 2. A2A task schemas in S8/S10. Graceful degradation via MCP fallback. |
| AI Agent Auth (draft-klrc) | Agentic AI | BRIDGE | FAPI 2.0 compatible. Cite if reaches RFC. |
| Agentic JWT (draft-goswami) | Agentic AI | MONITOR | Agent checksum for v1.1 security review. |
| Txn Tokens for Agents | Agentic AI | BRIDGE | Audit log reconstructable from Txn Token records. |
| W3C AI Agent Protocol CG | Agentic AI | MONITOR | Trigger: Recommendation-track document. |
| OpenTravel Alliance | Travel | BRIDGE | Capability Declaration ↔ OTA mapping. Observer status in OAI-Travel WG. |
| IATA NDC / One Order | Travel | BRIDGE | FlightComponent in Layer 2. IROPS taxonomy in Layer 3. |
| IATA IROPS | Travel | BRIDGE | Complete taxonomy in Layer 3. |
| OpenID Federation 1.0 | Security | ADOPT | Closed. |
| FAPI 2.0 | Security | ADOPT | Closed. |
| W3C VC Data Model 2.0 | Security | ADOPT | Closed. |
| DID Methods | Security | ADOPT | Closed. |
| ODRL | Security | ADOPT | Confirmed differentiator. |
| OPA / Rego | Security | ADOPT | Closed. |
| BPMN 2.0 / XState v5 | Workflow | ADOPT | Closed. |
| AsyncAPI 3.0 | Integration | ADOPT | Monitor MCP Tasks SEP. |
| OpenTelemetry | Observability | ADOPT | Closed. |
| SSF | Security | ADOPT | Closed. |

---

## 5. Watch List

| Trigger | Action |
|---------|--------|
| CAAM or ARDP gains IETF working group sponsorship | Upgrade CAAM to Adopt for delegation token layer. Initiate normative reference discussion. |
| MCP .well-known URL discovery spec published | Align Activity Travel Protocol Capability Declaration hosting URL. Update atp-mcp. |
| A2A Agent Card converges with ARDP capability advertisement | Define three-way bridge: Activity Travel Protocol Capability Declaration ↔ A2A Agent Card ↔ ARDP. |
| Layer 2 Capability Catalogue design begins | Re-evaluate ARDP and OpenTravel mapping. Define A2A task schemas (L2-T-2-B). |
| W3C AI Agent Protocol CG produces Recommendation-track document | Assess alignment with Activity Travel Protocol agent identity and capability discovery model. |
| MCP Tasks SEP reaches Approved status | Review Activity Travel Protocol state machine lifecycle for compatibility. Document Activity Travel Protocol 8-phase lifecycle as prior art. |

---

## 6. Open Questions

- **OQ-SL-1:** Does Activity Travel Protocol Trust Chain construction already produce `act`-claim-compatible audit records, or is an additional field required? Verify in Layer 3 workflow design.
- **OQ-SL-2:** Where does the Activity Travel Protocol's equivalent of the CAAM Post-Discovery Authorization Handshake occur in the booking lifecycle? At Party registration? At INQUIRY receipt? At Context Package assembly?
- **OQ-SL-3 — CLOSED:** A2A is now ADOPT (PD-L2-2). Layer 2 S10 will define A2A task schemas for Capability Declaration queries and Feasibility Check interactions as Layer 2 protocol artifacts (design rule L2-T-2-B). A separate serialisation question does not arise — the Activity Travel Protocol Capability Declaration is the canonical form; A2A Agent Card mapping is a bridge artifact defined in Layer 2 App. A.
- **OQ-SL-4:** Should the Activity Travel Protocol seek observer participation in the OAI-Travel workgroup now, or wait until v1.0 spec is complete?
- **OQ-SL-5:** Is there a case for the Activity Travel Protocol to produce OAuth scope representations of ODRL policies as a Bridge artefact, or does this over-engineer v1.0?

---

*Activity Travel Protocol — Standards Positions and Interoperability Map v1.1 — March 2026*
