# NeMo Guardrails & OAuth 2.1

*ATP MCP Server Specification · Sections 5–6*

[← Tool Catalogue](tool-catalogue) · [Guest Agent & OCTO →](guest-agent-octo)

## 5. NeMo Guardrails Composition Pattern

### 5.1 Position in the Enforcement Stack

NeMo Guardrails is Layer 0 — it operates earlier than the mandate and
Security Kernel. It evaluates the reasoning that produced a tool call,
not the tool call itself against policy. It is Tier 2 and Tier 3 only.

**Decision MCP-D8 (CLOSED):** Three normative rails.

### 5.2 Rail 1 — HEM Escalation Rail

**Trigger:** Any inference call producing an atp_invoke_hem tool call.

**Purpose:** Prevent over-escalation. HEM invocations trigger operator
confirmation, disrupt workflow, and may carry financial and duty-of-care
consequences.

**Lower-intervention check:** The rail evaluates whether
atp_notify_traveller (has the traveller been informed?),
atp_update_pre_arrangement (can the issue be resolved by a
pre-arrangement update?), and operator notification have been recorded
in the current session event log. If none have been attempted, the rail
blocks the HEM call and prompts reconsideration.

**Weather safety check precondition:** For HEM-07 (WEATHER_DISRUPTION)
and HEM-23, the rail enforces that a WEATHER_GO_NOGO safety check has
been recorded via atp_record_safety_check before the HEM fires.

### 5.3 Rail 2 — Notification Tone Rail

**Trigger:** Any inference call producing an atp_notify_traveller tool
call.

-   **2a — State-appropriate tone:** Messages in DISRUPTION_REVIEW
    > state MUST NOT communicate disruption decisions to the traveller
    > before operator confirmation. Blocked until the Decision Object is
    > committed.

-   **2b — No-promise filter:** Blocks messages committing to outcomes
    > the Booking Object state machine has not yet confirmed.

-   **2c — Language localisation check:** Flags (does not block)
    > messages sent in a language different from the guest's
    > preferred_language. Recorded as GuardrailWarningEvent.

### 5.4 Rail 3 — Scope Boundary Rail

**Trigger:** Any inference call producing a tool call.

The rail inspects the tool name against the agent's declared authority
scope in the system prompt. If the tool is outside scope, the rail
intercepts before the MCP call is made and returns a structured
self-correction message to the LLM. Converts a mandate rejection error
into actionable self-correction. Intercepted attempts recorded as
GuardrailInterceptEvent.

### 5.5 NIM Sidecar Deployment

**Decision MCP-D7 / OQ-SDK-3 RESOLVED (CLOSED):** NIM and NeMo
Guardrails are deployed as a separate sidecar container at Tier 2 and
Tier 3. The MCP server calls the sidecar via local HTTP
(http://guardrails-sidecar:8080/infer). The MCP server container has no
Python runtime dependency. At Tier 1, the sidecar is absent.

  **Tier**   **NeMo          **NIM**         **Deployment Pattern**
             Guardrails**                    

  Tier 1     Not applied     Not used        Direct LLM API call

  Tier 2     Applied via     Sidecar         Compose: mcp-server +
             sidecar         endpoint        guardrails-sidecar

  Tier 3     Applied via     AI Grid NIM     AI Grid managed — sidecar is
             NVIDIA stack                    the NIM/NeMo service

### 5.6 Guardrails Event Log Integration

All guardrail events are recorded to the Booking Object append-only
event log. Three event types:

  **Event Type**            **When Recorded**     **Fields**

  GuardrailPassEvent        HEM_INVOKE scope only rail_id, tool_name,
                            — full audit trail  mandate_scope

  GuardrailInterceptEvent   Tool call blocked by  rail_id, tool_attempted,
                            Rail 1 or Rail 3      mandate_scope,
                                                  intercept_reason,
                                                  self_correction_prompt_sent

  GuardrailWarningEvent     Advisory flag from    rail_id, warning_type,
                            Rail 2 or Rail 1      action_taken
                            override              

All three types are role-scoped read-only in the Context Package ---
visible to operator and Foundation audit roles, not to the
traveller-facing agent.

## 6. OAuth 2.1 Integration and Authority Scope Enforcement

### 6.1 Three Authentication Concerns — Distinguished

  **Concern**      **Mechanism**         **Layer**     **Scope**

  MCP connection   OAuth 2.1 bearer      Transport     Streamable HTTP only
  authentication   token                               (not stdio)

  Authority scope  ATP Mandate JWT       Application   Every tool call
  enforcement                                          

  Booking Object   Security Kernel       State machine Every state transition
  access control   (Cedar)                          

### 6.2 OAuth 2.1 — Grant Type and Flow

Primary grant: Client Credentials (grant_type=client_credentials) ---
correct for agent-to-server M2M flows. Implements the MCP OAuth Client
Credentials extension
(io.modelcontextprotocol/oauth-client-credentials).

**ATP Mandate co-issued at token time:** The Authorization Server issues
the access token and the ATP Mandate JWT simultaneously. The mandate is
returned in the custom claim atp_mandate in the token response. Access
token and mandate are co-issued and co-expire. No separate mandate
exchange step.

**Scopes:** The OAuth 2.1 scope parameter uses ATP authority scope names
directly as scope strings (e.g., scope=CONTEXT_READ NOTIFICATION_SEND
HEM_INVOKE).

**Token lifetime:** 1800 seconds (30 min) — aligned with ATP Mandate
TTL. For HEM operations, extended to hem_timeout_budget + 5 minutes at
issuance time. Refresh tokens are not issued for agent connections.

### 6.3 OpenID Connect Discovery

The ATP MCP Server publishes a discovery document at
/.well-known/openid-configuration. Key ATP extensions to the standard
document:

  atp_mandate_supported   true — server issues ATP Mandate JWTs
                          co-issued with access tokens

  atp_spec_version        1.0 — Activity Travel Protocol specification
                          version

  scopes_supported        CONTEXT_READ, NOTIFICATION_SEND,
                          PRE_ARRANGEMENT_WRITE, HEM_INVOKE, SAFETY_WRITE,
                          BOOKING_READ, BOOKING_WRITE, DISRUPTION_MANAGE

### 6.4 Scope Enforcement Sequence

On every tool call:

-   **Step 1 — Bearer token verification:** Extract Authorization:
    > Bearer token. Verify signature against JWKS. Check expiry.
    > Failure: 401.

-   **Step 2 — Mandate extraction:** Extract atp_mandate claim. Parse
    > ATP Mandate JWT. Verify Ed25519 signature. Check expiry. Failure:
    > 403.

-   **Step 3 — Scope-to-tool check:** Verify the called tool is
    > permitted by the mandate Cedar policy. Failure: 403 with
    > structured error { error: mandate_scope_violation, tool,
    > required_scope, mandate_scopes, atp_error_code: MCP-403-SCOPE }.

-   **Step 4 — Booking Object binding check:** If mandate contains
    > booking_object_id, verify the tool call parameter matches.
    > Cross-Booking-Object calls from bound mandate: 403.

-   **Step 5 — Route to Security Kernel:** All checks passed. Tool
    > call proceeds to Booking Object state machine.

### 6.5 Auth Modes

**Decision MCP-D9 (CLOSED):** Two auth modes — embedded (default) and
enterprise (IdP). Configured at deployment via atp-config.json. Protocol
surface is identical to MCP clients in both modes.

  **Mode**     **Status**   **Authorization        **Use Case**
                            Server**               

  embedded     Default —  ATP Runtime embedded   Development, MyAuberge,
               Tier 1/2     AS                     single-operator production

  enterprise   Tier 2/3     Enterprise IdP (Okta,  OTA, hotel group,
               with IdP     Azure AD, corporate    enterprise deployment
                            SSO)                   

### 6.6 Rate Limiting

  **Limit**              **Default       **Notes**
                         Value**         

  Tool calls per minute  60              Configurable per client
  (per client)                           registration

  atp_invoke_hem calls   10              Prevents operator attention
  per hour                               flooding — raise per client for
                                         automated disruption management

  atp_notify_traveller   100             Per client
  calls per hour                         

  Token refresh rate     1 per 25        Agents re-authenticate on expiry
                         minutes         
