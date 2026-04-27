# MCP Server Specification — Section 3 Addendum

*Windley Loop and OQ-SDK-4 Resolution · Track 3 Session 5A · April 2026 · Apache 2.0*

**ATP MCP Server Specification — Section 3 Addendum**

  Addendum to             ATP_MCPServer_v1.docx

  Version                 1.0

  Date                    April 2026

  Status                  TRACK 3 SESSION 5A — COMPLETE

  Produced by             Activity Travel Protocol Foundation (in

  Primary author          Tom Sato, Founding Maintainer

  Licence                 Apache 2.0

## 1. Purpose

This document is the normative addendum to ATP_MCPServer_v1.docx,
Section 3 (ATP Mandate Model). It adds two specification elements
identified as architectural gaps following the Clawdrey Part 3 blog post
("The Windley Loop and the Fletcher Embassy", 7 April 2026):

-   The Windley Loop — a mandatory pre-session Cedar query pattern
    that moves scope enforcement earlier than the gate (before the agent
    plans, not only when it attempts a tool call).

-   Re-query triggers — defined as Booking Object state transitions,
    not TTL alone.

-   Precise escalation pattern — structured mandate expansion request
    when a mandate gap is detected.

This addendum also closes OQ-SDK-4 (Prompt Library versioning
convention), which was required before the llms.txt versioning
convention could be set.

+-----------------------------------------------------------------------+
| **Decisions closed in this document**                                 |
|                                                                       |
| MCP-D13 — Windley Loop is normative at Section 3 of the ATP MCP     |
| Server Specification.                                                 |
|                                                                       |
| MCP-D14 — Re-query triggers are Booking Object state transitions    |
| (not TTL alone).                                                      |
|                                                                       |
| MCP-D15 — Escalation precision: structured Cedar action + resource  |
| condition request to parent mandate issuer.                           |
|                                                                       |
| OQ-SDK-4 RESOLVED — Prompt Library versioning: protocol-versioned   |
| primary with independent tooling patch suffix.                        |
+-----------------------------------------------------------------------+

## 2. Section 3 Addendum — Windley Loop

The following content is normative and is to be read as inserted after
Section 3.4 (The Narrowing Property) in ATP_MCPServer_v1.docx.

**3.4A. The Windley Loop — Pre-Session Policy Query (Normative)**

**3.4A.1 Problem Statement**

ATP_MCPServer_v1.docx specifies scope enforcement at the gate: mandate
evaluation (Layer 2) rejects tool calls outside the Cedar policy; the
Security Kernel (Layer 1) rejects state transitions that violate Cedar policy
policy; NeMo Guardrails Rail 3 intercepts out-of-scope tool calls at
inference time before the MCP call is formed.

What the original specification does not address is how the agent
reasons about its own mandate before planning. An agent that does not
know what it is permitted to do will generate tool call sequences that
include calls it cannot complete. Those calls hit Rail 3, producing
GuardrailInterceptEvents and self-correction prompts — a reactive
mechanism. The Windley Loop makes scope enforcement proactive: the agent
knows its permitted action space before planning and never generates an
out-of-scope tool call.

The conceptual model is Cedar partial evaluation as a planning oracle,
not only as a gate. Phil Windley (dynamic authorization) articulated
this as "authorization as a map, not a wall". The agent queries the
map before choosing a route.

**3.4A.2 Mandatory Pre-Session Query**

+-----------------------------------------------------------------------+
| **DECISION MCP-D13 (CLOSED)**                                         |
|                                                                       |
| The Windley Loop is normative at v1.0. Every ATP MCP Server session   |
| MUST begin with a Cedar partial evaluation query against the agent's  |
| mandate before any planning or tool call generation.                  |
|                                                                       |
| Implementation: @activity-travel-protocol/security Cedarling WASM    |
| interface.                                                            |
|                                                                       |
| The residual policy set is injected into the agent's system prompt    |
| context via the @atp/llms-tooling Windley context template.          |
|                                                                       |
| NeMo Guardrails Rail 3 remains in the enforcement stack as            |
| belt-and-suspenders. The Windley Loop does not replace Rail 3; it     |
| reduces Rail 3 intercept events to near zero under normal operation.  |
+-----------------------------------------------------------------------+

The mandatory pre-session query sequence:

-   Step 1 — Query. The agent calls Cedar partial evaluation against
    its mandate (via @activity-travel-protocol/security Cedarling WASM
    interface). Input: the full Cedar mandate.policySet from the ATP
    Mandate JWT, plus the current Booking Object state from
    atp_get_booking_status.

-   Step 2 — Receive residual policy set. Cedar partial evaluation
    returns the set of (action, resource condition) pairs permitted by
    the mandate in the current Booking Object state. The residual policy
    set includes: permitted ATPAction values, permitted
    booking_object_id binding, permitted hem_id values (if HEM_INVOKE
    scoped), and state-dependent conditions.

-   Step 3 — Inject into system prompt context. The @atp/llms-tooling
    Windley context template formats the residual policy set as a
    structured system prompt block. The block names: permitted tool
    names, the booking_object_id this session is bound to, explicit
    hem_id values if HEM_INVOKE is in scope, and the current Booking
    Object state.

-   Step 4 — Plan within permitted space. The agent reasons over the
    injected permitted action space and plans only tool calls within
    that space.

-   Step 5 — Execute. Tool calls execute. The enforcement stack (Rail
    3, mandate evaluation, Security Kernel) still operates; under normal
    operation, no intercept or rejection occurs.

-   Step 6 — Observe and re-query on state transition. See Section
    3.4A.3.

**Tier applicability:** The Windley Loop is normative at all tiers. At
Tier 1 (no NeMo Guardrails sidecar), it is the primary mechanism
preventing out-of-scope tool calls. At Tier 2 and Tier 3, it operates in
combination with Rail 3.

**3.4A.3 Re-Query Triggers**

+-----------------------------------------------------------------------+
| **DECISION MCP-D14 (CLOSED)**                                         |
|                                                                       |
| Re-query triggers are Booking Object state transitions, not TTL       |
| alone.                                                                |
|                                                                       |
| TTL expiry triggers re-authentication (new OAuth 2.1 token + new      |
| co-issued mandate), which implicitly includes re-query against the    |
| new mandate.                                                          |
|                                                                       |
| State transitions trigger re-query without re-authentication, because |
| the permitted action space changes when the Booking Object state      |
| changes (e.g., atp_update_pre_arrangement is only permitted in        |
| PRE_JOURNEY state; this permission disappears on JOURNEY transition). |
+-----------------------------------------------------------------------+

Re-query is triggered by the following events:

-   Booking Object state machine transition. The agent calls
    atp_get_booking_status after any tool call that may have produced a
    state transition. If the state field has changed, the agent re-runs
    the pre-session query (Steps 1--3) against the unchanged mandate
    with the new state. The updated residual policy set replaces the
    previously injected context.

-   HEM invocation completion. atp_invoke_hem is async (MCP Tasks). On
    poll resolution — whether status: COMPLETE or status: DECLINED ---
    the agent calls atp_get_booking_status and re-queries if the state
    has changed.

-   Mandate update. If the parent mandate issuer provides a new ATP
    Mandate JWT within the session (expanded scope via the escalation
    pattern in Section 3.4A.4), the agent re-runs the query against the
    new mandate immediately.

**What does NOT trigger re-query:** TTL countdown alone. The agent does
not re-query on a timer. TTL expiry triggers re-authentication via OAuth
2.1 Client Credentials refresh, which produces a new ATP Mandate JWT and
a new pre-session query as part of session reinitialisation.

**3.4A.4 Precise Escalation Pattern**

+-----------------------------------------------------------------------+
| **DECISION MCP-D15 (CLOSED)**                                         |
|                                                                       |
| When a Windley Loop residual query reveals a mandate gap, the agent   |
| MUST NOT attempt the tool call.                                       |
|                                                                       |
| The agent constructs a structured mandate expansion request           |
| identifying the exact Cedar action and resource condition missing     |
| from the mandate.                                                     |
|                                                                       |
| This request is sent to the parent agent (or to the operator via      |
| atp_invoke_hem with trigger_reason: MANDATE_GAP_DETECTED, if the      |
| parent is the operator).                                              |
|                                                                       |
| The parent issues a narrowed sub-mandate covering the requested scope |
| (subject to the narrowing property — must be subset of parent's own |
| mandate).                                                             |
|                                                                       |
| Generic "access denied" errors from Rail 3 or mandate evaluation are  |
| a signal of a Windley Loop implementation gap, not a normal operating |
| condition.                                                            |
+-----------------------------------------------------------------------+

The escalation sequence when a mandate gap is detected:

-   Step 1 — Identify gap. The residual policy set (from Step 2 of the
    pre-session query) does not include the ATPAction required for the
    planned next step.

-   Step 2 — Construct structured request. The agent constructs a
    mandate expansion request containing: (a) the required ATPAction
    namespace value; (b) the resource.booking_object_id it is bound
    to; (c) for HEM_INVOKE gaps: the specific resource.hem_id and
    resource.booking_state required; (d) the agent_assessment explaining
    why the action is required.

-   Step 3 — Route to parent. If the parent is another ATP agent: the
    request is sent via the A2A Layer 2 communication channel. If the
    parent is the operator: the agent calls atp_invoke_hem with
    trigger_reason: MANDATE_GAP_DETECTED and the structured gap
    description in context.agent_assessment.

-   Step 4 — Receive new mandate. The parent issues a new ATP Mandate
    JWT with the additional Cedar action in the policy set, subject to
    the narrowing property. The narrowing property guarantees: the new
    mandate cannot grant broader permissions than the parent's own
    mandate. If the parent's mandate does not include the requested
    action, the expansion request is refused.

-   Step 5 — Re-query and proceed. The agent re-runs the pre-session
    query (Section 3.4A.2, Steps 1--3) against the new mandate, updates
    the injected context, and proceeds with planning.

+-----------------------------------------------------------------------+
| **Implementation note — Trigger reason field in atp_invoke_hem**    |
|                                                                       |
| The atp_invoke_hem tool input schema (ATP_MCPServer_v1.docx Section   |
| 4.4, Tool 5) includes context.trigger_reason. The value               |
| MANDATE_GAP_DETECTED is added as a normative trigger_reason value by  |
| this addendum.                                                        |
|                                                                       |
| When context.trigger_reason == MANDATE_GAP_DETECTED, the operator     |
| receives a structured escalation (not a workflow disruption). The HEM |
| confirmation prompt presents the specific Cedar action gap and asks   |
| the operator to approve the mandate expansion.                        |
|                                                                       |
| The hem_id used for MANDATE_GAP_DETECTED escalations is               |
| HEM-MANDATE-01 (to be added to the HEM catalogue in a subsequent      |
| addendum).                                                            |
+-----------------------------------------------------------------------+

## 3. Updated Enforcement Stack

The complete enforcement sequence for all tool calls, incorporating the
Windley Loop, is:

  **Layer**        **Component**       **Timing**    **Notes**

  Pre-planning     Windley Loop —    Before LLM    Normative at all tiers.
  (new)            Cedar partial eval  plans         Injects permitted action
                                                     space into system prompt.

  Layer 0 (Tier    NeMo Guardrails     At inference  Rail 1 (HEM), Rail 2
  2/3)                                 time          (tone), Rail 3 (scope).
                                                     Belt-and-suspenders after
                                                     Windley Loop.

  Layer 2          Mandate Evaluation  On tool call  Cedar policy check.
                                                     Rejection: 403.

  Layer 1          Security Kernel     On state      Non-bypassable. Rejection:
                   (Cedar)          transition    403.

  Execution        Tool executes       —           ---

  Post-execution   Re-query check      After state   atp_get_booking_status →
  (new)                                transition    re-query if state changed.

## 4. OQ-SDK-4 — Prompt Library Versioning

+-----------------------------------------------------------------------+
| **OQ-SDK-4: RESOLVED — CLOSED**                                     |
|                                                                       |
| Question: Prompt library versioning — protocol-versioned or         |
| independently versioned?                                              |
|                                                                       |
| Resolution: Dual-version convention:                                  |
| atp/{protocol-version}+tooling/{tooling-version}                      |
|                                                                       |
| Example: atp/1.0+tooling/1.0.0 at launch. atp/1.0+tooling/1.0.3 for a |
| Prompt Library patch that does not touch the protocol spec.           |
| atp/1.1+tooling/1.1.0 when the protocol increments (tooling patch     |
| resets to .0).                                                        |
|                                                                       |
| This decision unblocks the llms.txt versioning convention             |
| (ATP_llms_v2.md) and the @atp/llms-tooling package versioning        |
| header.                                                               |
+-----------------------------------------------------------------------+

The versioning convention rests on three requirements:

-   AI agents parsing llms.txt must be able to determine both the
    protocol version they are targeting and whether their cached Prompt
    Library is current from a single version string. A single compound
    string satisfies this with no second lookup.

-   Prompt Library content (system prompt templates, persona
    definitions, Windley context template) can and will be corrected or
    extended between protocol releases without bumping the protocol
    version. An independent patch suffix (tooling/x.y.z) permits this
    without creating false impressions of a protocol change.

-   Protocol version bumps reset tooling patch to .0 because a protocol
    version change may invalidate Prompt Library assumptions (scope
    names, tool names, state machine states). The reset makes it
    unambiguous that the Prompt Library has been reviewed and aligned
    with the new protocol version.

  **Current version**     **atp/1.0+tooling/1.0.0**

  Prompt Library patch    atp/1.0+tooling/1.0.N
  (no protocol change)    

  Protocol version        atp/1.1+tooling/1.1.0 (patch resets to .0)
  increment               

  Published at            activitytravel.pro/llms.txt (header line)

  Machine-readable        Predictable URL alongside each spec release
  changelog               

**Impact on @atp/llms-tooling package versioning:** The npm package
version field follows standard semver (e.g. 1.0.3). The compound
atp/1.0+tooling/1.0.0 string is published in the llms.txt header line
and in the package.json atp_version field. Both are machine-readable.
OQ-SDK-4: RESOLVED — CLOSED.

## 5. Decision Register — Addendum

  MCP-D13        Windley Loop is normative at v1.0. Pre-session     CLOSED
                 Cedar partial evaluation query is mandatory before 
                 any planning. Residual policy set injected into    
                 system prompt via @atp/llms-tooling Windley       
                 context template. NeMo Rail 3 is                   
                 belt-and-suspenders.                               

  MCP-D14        Re-query triggers are Booking Object state         CLOSED
                 transitions, not TTL alone. TTL expiry triggers    
                 re-authentication (which includes re-query). State 
                 transitions trigger re-query without               
                 re-authentication.                                 

  MCP-D15        Escalation precision: structured mandate expansion CLOSED
                 request naming the exact Cedar action and resource 
                 condition. Routed to parent agent (A2A) or         
                 operator (atp_invoke_hem with trigger_reason:      
                 MANDATE_GAP_DETECTED). Narrowing property          
                 constrains all expansions.                         

  OQ-SDK-4       Prompt Library versioning:                         RESOLVED ---
                 atp/{protocol-version}+tooling/{tooling-version}   CLOSED
                 compound convention. Protocol bump resets tooling  
                 patch to .0. Tooling patches independently between 
                 protocol releases. Unblocks llms.txt versioning    
                 convention.                                        

## 6. Open Questions — Status Update

  OQ-SDK-4   Prompt library versioning  RESOLVED — atp/{protocol-version}+tooling/{tooling-version}.
             — protocol-versioned or  CLOSED       See Section 4.
             independently versioned?                

  OQ-MCP-2   Fletcher Embassy —       OPEN         Track 3 Session 6. Cross-domain OTA integration
             @atp/security OTA trust                when destination domain does not speak Cedar.
             boundary translation                    
             pattern.                                

  OQ-MCP-3   HEM catalogue addition:    OPEN         Subsequent addendum. Triggered by
             HEM-MANDATE-01 (mandate                 MANDATE_GAP_DETECTED escalation pattern (Section
             gap escalation).                        3.4A.4).

  OQ-SDK-2   OCTO Bridge ownership      RESOLVED — MCP-D12
                                        CLOSED       

  OQ-JP-1    Japan APPI Booking Object  OPEN         GT-1C / Legal counsel
             residency                               

  OQ-SG-1    Singapore PDPA same        OPEN         GT-1E / Legal counsel
             question                                

## 7. Document History

  1.0           April 2026  Tom Sato      Initial addendum. Track 3 Session 5A
                                          complete. Windley Loop (MCP-D13), Re-query
                                          triggers (MCP-D14), Escalation precision
                                          (MCP-D15), OQ-SDK-4 resolved. Closes
                                          architectural gaps identified in
                                          ATP_DiscussionBrief_ClawdreyCAMINO_v2.docx
                                          Section 2.4.

ATP_MCPServer_v1_Addendum.docx — Apache 2.0
