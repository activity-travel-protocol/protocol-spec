# ATP Mandate Model

*ATP MCP Server Specification · Section 3*

[← Overview](index) · [Tool Catalogue →](tool-catalogue)

## 3. ATP Mandate Model

### 3.1 Problem Statement

The ATP MCP Server exposes tools that operate on live Booking Objects
holding payment state, duty-of-care obligations, and legally binding
supplier commitments. In current MCP practice, every sub-agent spawned
by a parent agent inherits the parent's full credential. A sub-agent
spawned to send one notification can invoke a HEM. A sub-agent spawned
for read-only context retrieval can modify a Booking Object.

This is ambient authority applied to a system where the consequences are
real: cancelled bookings, stranded travellers, financial liability. The
ATP Mandate Model eliminates ambient authority from the MCP surface.

### 3.2 The Two Enforcement Layers

The mandate model is an enforcement sandwich. Both layers MUST permit
every tool call. Neither layer trusts the other.

**Layer 0 — NeMo Guardrails (LLM output filter)**

Evaluates tool calls at inference time, before the call is formed. Tier
2 and Tier 3 only. See Section 5.

**Layer 2 — Mandate Evaluation (delegation chain)**

Every MCP client connection MUST present a valid ATP Mandate JWT. The
MCP Server evaluates the tool call against the mandate's Cedar policy
before routing. Rejection: 403 Forbidden.

**Layer 1 — Security Kernel (human ceiling)**

The non-bypassable OPA/ODRL policy engine executing on every Booking
Object state transition. Cannot be overridden by any mandate. Rejection:
403 Forbidden.

**Enforcement sequence:** NeMo Guardrails → Mandate Evaluation →
Security Kernel → Tool Executes

### 3.3 ATP Mandate JWT Format

**Decision MCP-D1 (CLOSED):** The ATP Mandate is a JWT signed with
Ed25519, typed atp-mandate+jwt. It is a profile of the OVID format.

Header:

{ "alg": "EdDSA", "typ": "atp-mandate+jwt" }

Payload fields:

  **Field**           **Type**      **Description**

  jti                 string        Unique token ID: atp/agent-{uuid}

  iss                 string        Issuer: atp-runtime/{deployment-id}

  sub                 string        Subject: atp/agent-{uuid}

  iat / exp           Unix          Issued at / expires. Default TTL: 1800s
                      timestamp     (30 min)

  atp_version         string        Protocol version: 1.0

  booking_object_id   UUID v7 \|    CLOSED MCP-D1: Binds mandate to single
                      null          Booking Object instance. Null for root
                                    connection mandate.

  parent_chain        string\[\]    JTI array of parent mandates back to root

  agent_pub           base64url     Sub-agent Ed25519 public key
                      string        

  mandate.rarFormat   string        Always: cedar

  mandate.policySet   string        Cedar policy text — the actual
                                    authorization logic

### 3.4 The Narrowing Property

When a primary agent spawns a sub-agent, the sub-agent's mandate MUST
be a provable subset of the parent's Cedar policy set. The ATP MCP
Server mandate issuer MUST verify subset compliance at issuance time. A
mandate that would grant broader permissions than the parent's mandate
MUST NOT be issued — the minting operation fails and the
over-permissioned token never enters the system.

This is the OVID narrowing property applied to the Activity Travel
Protocol authority scope space. Privilege can only attenuate, never
escalate. The proof happens before the credential exists.

### 3.5 Authority Scopes as Cedar Action Namespace

**Decision MCP-D2 (CLOSED):** The eight Activity Travel Protocol
authority scopes map directly to Cedar action namespaces.

  **Authority Scope**     **Cedar Action(s)**                           **Permitted Tools**

  CONTEXT_READ            ATPAction::"get_context_package"            atp_get_context_package,
                          ATPAction::"get_booking_status"             atp_get_booking_status

  NOTIFICATION_SEND       ATPAction::"notify_traveller"               atp_notify_traveller

  PRE_ARRANGEMENT_WRITE   ATPAction::"update_pre_arrangement"         atp_update_pre_arrangement,
                          ATPAction::"collect_pre_arrangement_data"   atp_collect_pre_arrangement_data

  HEM_INVOKE              ATPAction::"invoke_hem"                     atp_invoke_hem (MCP Tasks,
                                                                        EXPERIMENTAL)

  SAFETY_WRITE            ATPAction::"record_safety_check"            atp_record_safety_check

  BOOKING_READ            ATPAction::"search_activities"              atp_search_activities

  BOOKING_WRITE           ATPAction::"initiate_booking" etc.          Booking lifecycle tools (v1.1+)

  DISRUPTION_MANAGE       ATPAction::"invoke_hem" + disruption        atp_invoke_hem with
                          context                                       DISRUPTION_REVIEW state access

### 3.6 HEM Mandate TTL

**Decision MCP-D3 (CLOSED):** For HEM sub-agents, the mandate issuer
sets exp to hem_timeout_budget + 5 minutes. The mandate expires after
task completion regardless of outcome. No HEM sub-agent accumulates
persistent authority.

**Decision MCP-D6 (CLOSED):** atp_invoke_hem requires explicit hem_id
enumeration in the Cedar mandate. Wildcard HEM_INVOKE mandates (permit
all HEM ids) are rejected by the Security Kernel. Example Cedar policy
for a HEM-12 sub-agent:

permit(principal, action == ATPAction::"invoke_hem", resource)

when { resource.booking_object_id == "{{uuid}}" &&

resource.hem_id == "HEM-12" &&

resource.booking_state == "DISRUPTION_REVIEW" };

### 3.7 Mode 1 (v1.0 Normative) and Mode 2 (Enterprise Forward Path)

  **Mode**   **Status**       **Signer**          **Use Case**

  Mode 1     NORMATIVE —    ATP Runtime         Tier 1/2, single-domain,
             v1.0             (embedded AS)       MyAuberge IaaS

  Mode 2     FORWARD-COMPAT   Enterprise IdP      Enterprise OTA, hotel group,
             —              (AS-issued via RFC  corporate SSO
             non-normative    9396 + Cedar)       

The ATP Mandate JWT format is designed to be issued by either the ATP
Runtime (Mode 1) or a conformant Authorization Server (Mode 2). The
token is identical; only the signer differs. Mode 2 requires AS support
for RAR with Cedar evaluation (draft-cecchetti-oauth-rar-cedar) — not
yet available in production AS software.

**OQ-MCP-1 RESOLVED (MCP-D1):** Cedar mandate semantics hold cleanly at
Booking Object instance granularity. The booking_object_id field is the
Cedar resource entity. A mandate bound to a specific UUID cannot be used
against any other Booking Object.

**Reference implementation:** OVID (@clawdreyhepburn/ovid,
@clawdreyhepburn/ovid-me) — Apache 2.0. The Activity Travel Protocol
SDK will provide @activity-travel-protocol/security implementing the
same format. Dependency decision deferred to Track 3 Sessions 5/6.
