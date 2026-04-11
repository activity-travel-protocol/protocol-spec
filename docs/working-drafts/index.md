---
title: Working Drafts & Specification Preview
description: Active development documents and specification preview releases for the Activity Travel Protocol. Working Drafts are pre-ratification materials. Specification Preview documents are substantially complete and normative for implementation purposes.
---

# Working Drafts & Specification Preview

These documents are active development materials published ahead of formal ratification. Two categories are used:

**Working Draft** — internal design and review documents. Not yet normative. Published for transparency and community review.

**Specification Preview** — substantially complete specifications. Normative for implementation purposes. Subject to editorial revision before final ratification.

---

## Specification Preview

| Document | Package / Track | Description |
|---|---|---|
| [MCP Server Specification](./mcp-server/index) | `@atp/mcp-server` | Eight MCP tools, ATP Mandate Model, OAuth 2.1 authentication, NeMo Guardrails, three-tier deployment. The primary AI agent integration surface. |
| [MCP Server Addendum — Windley Loop](./mcp-server-addendum) | `@atp/mcp-server` | Windley Loop pre-session policy query (normative, v1.0). Re-query triggers and escalation precision. Closes MCP-D13–MCP-D15. |
| [Activity Configuration Schema](./activity-schema/index) | `@atp/core` | Three-layer schema model (Capability / Configuration / Collection). 15-fragment library. IANA-model Activity Category Registry. |
| [Layer 4 Schema and SDK](./layer4-schema/index) | `@atp/core`, `@atp/rest-api` | `@atp/core` TypeScript type surface, branded primitives, OpenAPI 3.1 REST surface (17 endpoints), `@atp/ai-agent` package, ATPAgentProvider interface. |
| [SDK Architecture Blueprint](./sdk-architecture/index) | All `@atp/` packages | Twelve-package SDK structure, three-profile DI model, HAB adapter interface catalogue, `@atp/security` Fletcher Embassy pattern, ATP Condition Expression Syntax v1. |
| [Prompt Library](./prompt-library/index) | `@atp/llms-tooling` | System prompt templates for all ATP agent personas. Windley context template, four persona templates, 15-placeholder composition model. Versioned `atp/1.0+tooling/1.0.0`. |

---

## Foundation and Governance

| Document | Description |
|---|---|
| [Foundation Charter](./foundation-charter) | Governing document of the Activity Travel Protocol Foundation (一般社団法人アクティビティトラベルプロトコールファウンデーション). Purpose, membership model, TSC composition, decision process, amendment rules. |
| [Individual Contributor Licence Agreement](./cla) | CLA required for all contributors submitting code, specification text, or documentation to Foundation repositories. Signed via GitHub CLA Assistant bot. |

---

## Working Drafts

| Document | Status | Description |
|---|---|---|
| [Pre-Layer 3 Review](./pre-layer3-review) | Working Note | Routing and transport analysis ahead of Layer 3 spec. |
| [Security Architecture](./security-architecture) | Working Draft | Security Kernel, trust zones, threat model. |
| [Context Package](./context-package) | Working Draft | Context Package and Decision Object architecture. |
| [Context Package — Design Rationale](./context-package-design) | Working Draft | Design rationale for Context Package schema decisions. |

---

*Activity Travel Protocol — Working Drafts & Specification Preview — April 2026*\
*Apache 2.0 — Activity Travel Protocol Foundation (in formation / 設立準備中)*
