# ATP MCP Server Specification

*Track 3 Session 4 · April 2026 · Apache 2.0*

**Sections:** [Mandate Model](mandate-model) · [Tool Catalogue](tool-catalogue) · [NeMo & OAuth](nemo-oauth) · [Guest Agent & OCTO](guest-agent-octo) · [Decisions](decisions)

**ACTIVITY TRAVEL PROTOCOL**

## 1. Purpose and Scope

This document is the normative specification for the Activity Travel
Protocol MCP Server — the primary AI agent integration surface for the
Activity Travel Protocol runtime. It is the deliverable of Track 3
Session 4.

The ATP MCP Server exposes the Activity Travel Protocol Booking Object
lifecycle to MCP-native AI agents. It implements the MCP specification
version 2025-11-25 over Streamable HTTP transport (remote) and stdio
(Tier 1 local). It is the package @atp/mcp-server in the Activity
Travel Protocol SDK.

**Decisions closed in this document:** MCP-D1 through MCP-D12, OQ-SDK-2,
OQ-SDK-3, OQ-AS-5, OQ-MCP-1.

### 1.1 Relationship to Protocol Architecture

**MCP/A2A boundary (CLOSED):** MCP governs Layer 3 (Workflow). A2A
governs Layer 2 (inter-agent communication). The boundary is the Booking
Object creation event. This is a foundational architectural decision and
is not revisited.

The ATP MCP Server sits at the Layer 3 boundary. It translates MCP tool
calls into Booking Object state machine events, enforced by the Security
Kernel on every transition.

### 1.2 Three-Tier Deployment Posture

  **Tier**   **Transport**   **NeMo          **Auth**        **Use Case**
                             Guardrails**                    

  Tier 1     stdio (local)   Not applied     OS-level        Development,
                                                             MyAuberge
                                                             reference impl

  Tier 2     Streamable HTTP Sidecar         OAuth 2.1 /     Production,
                             container       embedded AS     single operator

  Tier 3     Streamable HTTP NVIDIA AI Grid  OAuth 2.1 /     Hyperscale,
                             stack           enterprise IdP  managed IaaS

## 2. Pre-Session Design Decisions

### 2.1 MCP Specification Version

The ATP MCP Server targets MCP specification version 2025-11-25 — the
current stable release, now governed by the Agentic AI Foundation under
the Linux Foundation. All normative references to MCP in this document
are to this version.

### 2.2 MCP Tasks for HEM Invocation

**Decision MCP-D3 (CLOSED):** HEM invocations use MCP Tasks
(experimental in spec 2025-11-25). The atp_invoke_hem tool is the sole
async tool in the catalogue. This path is flagged EXPERIMENTAL, tracking
MCP Tasks promotion to stable. The Activity Travel Protocol Foundation
will re-evaluate at the next MCP spec revision.

### 2.3 Mandate Model Approach

**Decision (Option C, CLOSED):** The ATP Mandate model is specified
normatively in this document. OVID (@clawdreyhepburn/ovid) is cited as
the reference implementation and design source. The SDK dependency
decision (adopt OVID directly vs. independent implementation in
@activity-travel-protocol/security) is deferred to Track 3 Sessions
5/6.
