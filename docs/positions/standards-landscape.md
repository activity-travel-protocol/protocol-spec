# Standards Positions and Interoperability Map

**Activity Travel Protocol**
Version 1.0 — March 2026

> **Document Status:** Standards Position — Activity Travel Protocol
> This document sets out ATP's positions on relevant external standards and maps interoperability relationships. Positions are assigned as: **Adopt**, **Bridge**, **Differentiate**, or **Monitor**.

---

## How to Read This Document

| Position | Meaning |
|----------|---------|
| **ADOPT** | ATP uses this standard directly. We write conformant implementations and cite it in our specs. |
| **BRIDGE** | ATP is interoperable with this standard. We define a mapping or adapter layer. |
| **DIFFERENTIATE** | ATP consciously departs from this standard for defined reasons. The departure is documented. |
| **MONITOR** | ATP watches this standard but takes no position yet. A trigger condition for re-evaluation is defined. |

Standards are grouped into three domains: Agentic AI protocols, Travel industry standards, and Foundational internet and security standards.

---

## 1. Agentic AI Protocols

### 1.1 CAAM — Contextual Agent Authorization Mesh

**Position: BRIDGE**

IETF Internet-Draft draft-barney-caam-00, published 24 February 2026. Individual submission — not an IETF working group product. Expires August 2026.

CAAM defines the Post-Discovery Authorization Handshake — the runtime authorization layer between agent discovery and tool execution. Its five components: CAAM Sidecar, Post-Discovery Authorization Handshake, Relationship-Based Access Control (ReBAC), Purpose-Bound Delegation, and Cryptographically Verifiable Intent Propagation.

**Overlap with ATP:**

- *Purpose-Bound Delegation* maps directly to ATP's `AgentAuthorityDeclaration` and `authority_scope` on Context Packages. Both scope agent authority to a declared intent. ATP implements this at the protocol object layer; CAAM implements it at the OAuth/OIDC token layer.
- *Cryptographically Verifiable Intent Propagation* is structurally equivalent to ATP's Trust Chain. ATP uses OpenID Federation Subordinate Statements; CAAM uses `act` claims in JWT access tokens. The outputs are similar; the mechanisms differ.
- *CAAM Sidecar* and ATP's *Security Kernel* occupy the same architectural location — between the agent and execution — enforcing policies the agent cannot override.
- *Scope Attenuation* mirrors ATP's participation level model (Level 1 → Level 2 → Level 3).

**What CAAM does not cover:** booking state machines, multi-party workflows, ODRL policy declarations, duty of care, disruption handling, jurisdiction compliance, or Capability Declarations. These are ATP's value-add above CAAM's infrastructure layer.

**Actions required:**
- Define formal mapping between ATP Trust Chain (OpenID Federation Subordinate Statements) and CAAM delegation tokens (`act`-claim JWT chains).
- Verify ATP Trust Chain construction produces `act`-claim-compatible audit records.
- Cite CAAM as an informative Related Work reference — not a normative dependency — in v1.0 specifications.
- Monitor for IETF working group adoption. WG adoption triggers upgrade to Adopt.

### 1.2 ARDP — Agent Registration and Discovery Protocol

**Position: MONITOR**

IETF Internet-Draft draft-pioli-agent-discovery-01. Companion to CAAM. Defines stable agent identities, dynamic endpoint resolution, and capability advertisement across MCP, A2A, HTTP, and gRPC.

ARDP's registry model — domain-scoped with explicit federation — is compatible with ATP's Party Registration model. Its Capability Advertisement is generic agent metadata, not ATP Capability Declarations.

Re-evaluate when Layer 2 Capability Catalogue design begins, or if ARDP gains IETF working group status.

### 1.3 MCP — Model Context Protocol

**Position: ADOPT**

Origin: Anthropic, November 2024. Donated to Linux Foundation Agentic AI Foundation (AAIF), December 2025. Co-founded with Block and OpenAI. De facto standard for agent-to-tool integration.

ATP adopted MCP as a first-class deliverable. The `atp-mcp` package ships with v1.0. This position is closed.

**2026 roadmap relevance:**
- `.well-known` URL discovery — align ATP Capability Declaration hosting URL structure when MCP spec is published.
- Enterprise readiness (audit trails, SSO-integrated auth) — ATP Security Kernel implementation should satisfy emerging MCP enterprise extension patterns.
- Tasks primitive lifecycle (retry semantics, expiry) — ATP's booking state machine already handles these. Document as prior art in Layer 3.

### 1.4 A2A — Agent2Agent Protocol

**Position: MONITOR**

Google Cloud, April 2025. Donated to Linux Foundation June 2025. v0.3 current. MCP has become the primary developer standard; A2A retains enterprise support.

A2A's Agent Card — JSON capability metadata at a well-known URL — is structurally similar to ATP's Capability Declaration. A low-cost Bridge opportunity exists.

Re-evaluate at Layer 2 Capability Catalogue design. Trigger: A2A Agent Card format converges with ARDP capability advertisement, or A2A WG adoption at Linux Foundation.

### 1.5 IETF Agentic AI Draft Cluster

**draft-klrc-aiagent-auth-00** — AI Agent Authentication and Authorization
Position: **BRIDGE** — OAuth 2.0 patterns compatible with ATP's FAPI 2.0 implementation. Cite as normative reference if it reaches RFC status.

**draft-goswami-agentic-jwt-00** — Agentic JWT / Secure Intent Protocol
Position: **MONITOR** — Agent checksum concept novel; may influence Context Package integrity in v1.1. Not relevant to v1.0.

**draft-oauth-transaction-tokens-for-agents-00** — Transaction Tokens for Agents
Position: **BRIDGE** — Actor/principal pattern is the flat-token representation of ATP's nested Trust Chain. ATP audit log entries should be reconstructable from transaction token records.

**draft-ni-a2a-ai-agent-security-requirements-01** — Security Requirements for AI Agents
Position: **MONITOR** — Use as completeness checklist against ATP Security Architecture v1.

### 1.6 W3C AI Agent Work

**Position: MONITOR**

W3C AI Agent Protocol Community Group (formed June 2025) and Web & AI Interest Group. WebMCP (joint Google-Microsoft, September 2025) enables browser-native agent-to-web-application calls — complementary to, not competing with, MCP.

Trigger for re-evaluation: W3C AI Agent Protocol CG produces a Recommendation-track document.

---

## 2. Travel Industry Standards

### 2.1 OpenTravel Alliance

**Position: BRIDGE**

Linux Foundation member (2025). Covers hotels, car rental, rail, golf, ground transportation, air. Does not cover complex multi-supplier activity experiences or AI agent participation.

ATP Capability Declarations for hotel, transport, and car components should be mappable to OpenTravel message structures, enabling OTA-connected suppliers to participate in ATP bookings without rewriting their stack. ATP's REST/OpenAPI 3.1 surface is directly compatible with the OAI-Travel workgroup direction.

Action: Seek observer participation in OAI-Travel workgroup when v1.0 spec is complete.

### 2.2 IATA NDC and One Order

**Position: BRIDGE**

NDC 24.1 current. One Order in active rollout. Covers airline ticketing and ancillary services only.

ATP intersection: outbound and return transit phases. A ski trip booking may include flights. `iata_irops_category_code` (SAR-18) already seeds the bridge.

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
| **BPMN 2.0 / XState v5** | Workflow specification and runtime. ATP's Context Package and state machine are ahead of IETF framework drafts. |
| **AsyncAPI 3.0** | Event streaming. Monitor MCP Tasks SEP for alignment opportunity. |
| **OpenTelemetry** | Audit trail spans. Confirmed by Security Architecture v1. |
| **SSF (Shared Signals Framework)** | Credential revocation. Hybrid Option C. CAEP and RISC event sets defined. |

---

## 4. Summary Decision Table

| Standard | Domain | Position | Key Action |
|----------|--------|----------|------------|
| CAAM | Agentic AI | BRIDGE | Trust Chain ↔ act-claim mapping. Cite as Related Work. Monitor for WG adoption. |
| ARDP | Agentic AI | MONITOR | Re-evaluate at Layer 2 Capability Catalogue design. |
| MCP | Agentic AI | ADOPT | atp-mcp ships v1.0. Align .well-known URL. Monitor Tasks SEP. |
| A2A | Agentic AI | MONITOR | Re-evaluate at Layer 2. Agent Card bridge opportunity. |
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
| MCP .well-known URL discovery spec published | Align ATP Capability Declaration hosting URL. Update atp-mcp. |
| A2A Agent Card converges with ARDP capability advertisement | Define three-way bridge: ATP Capability Declaration ↔ A2A Agent Card ↔ ARDP. |
| Layer 2 Capability Catalogue design begins | Re-evaluate ARDP, A2A Agent Card, and OpenTravel mapping simultaneously. |
| W3C AI Agent Protocol CG produces Recommendation-track document | Assess alignment with ATP agent identity and capability discovery model. |
| MCP Tasks SEP reaches Approved status | Review ATP state machine lifecycle for compatibility. Document ATP 8-phase lifecycle as prior art. |

---

## 6. Open Questions

- **OQ-SL-1:** Does ATP Trust Chain construction already produce `act`-claim-compatible audit records, or is an additional field required? Verify in Layer 3 workflow design.
- **OQ-SL-2:** Where does ATP's equivalent of the CAAM Post-Discovery Authorization Handshake occur in the booking lifecycle? At Party registration? At INQUIRY receipt? At Context Package assembly?
- **OQ-SL-3:** Should ATP's Capability Declaration format be natively parseable as an A2A Agent Card, or is a separate serialisation format acceptable? Decide at Layer 2.
- **OQ-SL-4:** Should ATP seek observer participation in the OAI-Travel workgroup now, or wait until v1.0 spec is complete?
- **OQ-SL-5:** Is there a case for ATP to produce OAuth scope representations of ODRL policies as a Bridge artefact, or does this over-engineer v1.0?

---

*Activity Travel Protocol — Standards Positions and Interoperability Map v1.0 — March 2026*
