# ATP Prompt Library v1.0

*@atp/llms-tooling · Track 3 Session 5B · April 2026 · Apache 2.0*

**Templates:** [Windley Context](windley-context) · [Guest Agent](guest-agent) · [Operator Agent](operator-agent) · [Supplier Agent](supplier-agent) · [Discovery Agent](discovery-agent)

**ACTIVITY TRAVEL PROTOCOL**

**Prompt Library v1.0**

*@atp/llms-tooling — System Prompt Templates for ATP Agent Personas*

  **Tooling          atp/1.0+tooling/1.0.0
  version**          

                     ATP_MCPServer_v1_Addendum.docx

## Decisions closed in this document
>
> PL-D1 — Template format: literal text with {{placeholder}} syntax
> (not schema description).
>
> PL-D2 — Five template files in @atp/llms-tooling: windley-context,
> guest-agent,
>
> operator-agent, supplier-agent, discovery-agent.
>
> PL-D3 — Persona templates compose as: base-structure block +
> persona-specific block
>
> \+ Windley context block (injected at session initialisation).
>
> PL-D4 — Placeholder syntax: {{UPPER_SNAKE_CASE}} for runtime values;
> all placeholders
>
> documented in Section 2.3.
>
> PL-D5 — Tool surface enumeration in persona templates is normative:
> agents MUST NOT
>
> call tools not listed in their persona template's \[TOOLS\] block.
>
> PL-D6 — OQ-AS-3 PARTIALLY RESOLVED: OCTO v2 product type → ATP
> Activity Category
>
> mapping table produced (Section 6). Full schema mapping deferred to
> Session 6.
>
## 1. Purpose and Package Structure

### 1.1 What This Document Specifies

This document is the specification for the @atp/llms-tooling package
--- the tenth package in the Activity Travel Protocol SDK. It defines
the system prompt templates that ATP-compatible AI agents use to
understand their authority, tool surface, and behavioural constraints
when operating within the protocol.

The Prompt Library has three functions within the protocol:

-   **Planning oracle input:** the Windley context template (Section 3)
    is the structured block injected into an agent's system prompt by
    the pre-session Cedar partial evaluation query (MCP-D13). It tells
    the agent what it is permitted to do before it plans.

-   **Persona definition:** the four persona templates (Sections 4--7)
    define the authority scope, tool surface, escalation pattern, and
    behavioural constraints for each ATP agent type. They are the source
    of truth for how a correctly configured ATP agent introduces itself
    to an LLM.

-   **Composition model:** templates compose in a defined order (PL-D3).
    Runtime operators inject the three blocks — base structure,
    persona block, and Windley context — in sequence to produce the
    complete agent system prompt.

### 1.2 Package Contents

The @atp/llms-tooling package ships five template files:

  **File**                    **Purpose**
  windley-context.md          Windley Loop pre-session context block.
                              Injected at session init.

  guest-agent.md              Guest Agent persona template. Pre-journey +
                              in-journey guest support.

  operator-agent.md           Operator Agent persona template. Disruption
                              management, HEM invocation.

  supplier-agent.md           Supplier Agent persona template. Safety
                              checks, equipment assignment.

  discovery-agent.md          Discovery Agent persona template. Activity
                              search, capability matching.

Each template is a Markdown file. The placeholder syntax is
{{UPPER_SNAKE_CASE}} throughout (PL-D4). A complete placeholder
reference is in Section 2.3.

### 1.3 Versioning

This package follows the compound versioning convention established in
OQ-SDK-4 (CLOSED):

> atp/{protocol-version}+tooling/{tooling-version}
>
> Current: atp/1.0+tooling/1.0.0

Protocol version bumps (e.g. 1.0 → 1.1) reset tooling patch to .0. The
Prompt Library may patch independently between protocol releases (e.g.
atp/1.0+tooling/1.0.3 for a persona correction that does not touch the
protocol spec). The version string appears in every template header.

### 1.4 Relationship to Other Specifications

  ATP_MCPServer_v1.docx            Normative source for all eight MCP tools,
                                   authority scopes, mandate model, NeMo
                                   Guardrails rails, OAuth 2.1 integration.

  ATP_MCPServer_v1_Addendum.docx   Normative source for Windley Loop (MCP-D13),
                                   re-query triggers (MCP-D14), escalation
                                   precision (MCP-D15).

  ATP_llms_v2.md                   llms.txt + llms-full.txt content. References
                                   @atp/llms-tooling by name and documents the
                                   Windley Loop for AI agent consumers.

## 2. Composition Model

### 2.1 Three-Block Composition

Every ATP agent system prompt is composed of three blocks assembled in
sequence by the runtime operator:

  **Block**             **Source / Timing**
  Block 1 — Persona   Loaded at agent startup from the persona template
  block                 file (e.g. guest-agent.md). Static for the
                        duration of the session.

  Block 2 — Windley   Generated at session initialisation by Cedar
  context block         partial evaluation (MCP-D13). Injected
                        immediately after the persona block. Re-injected
                        on re-query triggers (MCP-D14).

  Block 3 —           Injected by the runtime at each inference call:
  Conversation context  current message, conversation history, Context
                        Package fields relevant to the query.

Block 1 is stable. Block 2 is dynamic — it changes when the Booking
Object state transitions. Block 3 is ephemeral — it changes at every
inference call.

The persona template files in this document specify Block 1. Section 3
specifies Block 2 (the Windley context template). Block 3 is defined by
the ATP runtime implementation and is outside the scope of this
document.

### 2.2 Assembly Pattern

> // Runtime assembly (TypeScript pseudocode)
>
> const systemPrompt = \[
>
> personaTemplate, // Block 1 — loaded once at startup
>
> windleyContextBlock, // Block 2 — generated at session init,
> re-injected on state transition
>
> conversationContext, // Block 3 — injected at each inference call
>
> \].join('\\n\\n\-\--\\n\\n');

### 2.3 Placeholder Reference

All placeholders use {{UPPER_SNAKE_CASE}} syntax. The table below lists
every placeholder used across the five templates, its source, and when
it is resolved.

  **Placeholder**                 **Resolved by**          **Notes**
  {{BOOKING_OBJECT_ID}}           Runtime — from mandate UUID v7 of the bound Booking
                                                           Object. Present in Windley context
                                                           block.

  {{BOOKING_OBJECT_STATE}}        Runtime —              Current XState state machine state
                                  atp_get_booking_status   (e.g. PRE_JOURNEY, JOURNEY).

  {{PERMITTED_ACTIONS}}           Cedar partial evaluation Newline-separated list of
                                                           permitted ATPAction values from
                                                           residual policy set.

  {{PERMITTED_TOOL_NAMES}}        Cedar partial evaluation Newline-separated list of MCP tool
                                                           names derived from permitted
                                                           actions.

  {{PERMITTED_HEM_IDS}}           Cedar partial evaluation Comma-separated hem_id values if
                                                           HEM_INVOKE is in scope. Empty
                                                           string if not.

  {{STATE_TRANSITION_TRIGGERS}}   Cedar partial evaluation List of state transitions that
                                                           will trigger a Windley Loop
                                                           re-query.

  {{MANDATE_TTL_SECONDS}}         Runtime — from mandate Remaining TTL of the current ATP
                                  JWT                      Mandate JWT. Used for session
                                                           awareness.

  {{DEPLOYMENT_TIER}}             Runtime — operator     TIER_1, TIER_2, or TIER_3.
                                  config                   Determines NeMo Guardrails
                                                           availability.

  {{OPERATOR_NAME}}               Runtime — operator     Human-readable name of the
                                  config                   operating entity (e.g. MyAuberge
                                                           K.K.).

  {{GUEST_PREFERRED_LANGUAGE}}    Context Package          ISO 639-1 language code. Used by
                                                           Guest Agent for notification
                                                           language.

  {{NOTIFICATION_CHANNELS}}       Context Package          Comma-separated list of available
                                                           channels: WHATSAPP, SMS, EMAIL.

  {{ACTIVITY_CATEGORY}}           Context Package          ATP Activity Category Registry
                                                           value (e.g. SKI_ALPINE,
                                                           FARM_EXPERIENCE).

  {{SUPPLIER_NAME}}               Context Package          Name of the supplier in context.
                                                           Used by Supplier Agent.

  {{SEARCH_REGION}}               Runtime — operator     Geographic region for activity
                                  config                   search. Used by Discovery Agent.

  {{OCTO_BRIDGE_ENABLED}}         Runtime — operator     true or false. Indicates whether
                                  config                   OCTO Bridge adapter is active.
