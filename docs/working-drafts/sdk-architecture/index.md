# SDK Architecture Blueprint

*Track 3 Sessions 2, 6 & 7 · April 2026 · Apache 2.0*

**Sections:** [@atp/security — Fletcher Embassy](security-fletcher) · [Condition Expression Syntax](condition-expression) · [Category Registry](category-registry) · [Decisions](decisions)

**Activity Travel Protocol**

ATP_SDK_Architecture_v3.docx

Track 3 — Session 7 Output

April 2026

Activity Travel Protocol Foundation (in formation / 設立準備中)

+-----------------------------------------------------------------------+
| **Session 7 — COMPLETE**                                            |
|                                                                       |
| This document supersedes ATP_SDK_Architecture_v2.docx. New content in |
| this version: @atp/security package specification (Fletcher Embassy  |
| pattern, OQ-MCP-2 RESOLVED). ATP Condition Expression Syntax v1       |
| grammar and parser specification (OQ-AS-1 RESOLVED). Activity         |
| Category Registry community namespace governance (OQ-AS-4 RESOLVED).  |
| Decisions SEC-1 through SEC-4, CES-1 through CES-3, NS-1 through      |
| NS-3. SDK package count confirmed at twelve.                          |
+-----------------------------------------------------------------------+

## 1. Purpose and Scope

This document is the SDK Architecture Blueprint for the Activity Travel
Protocol. It specifies the SDK package structure, dependency injection
model, adapter interface catalogue, and agentic AI contribution
strategy. It is the output of Track 3 Sessions 2, 6, and 7.

Session 7 adds three new sections to this document:

-   **Section 6 ---** @atp/security package specification. The Fletcher
    Embassy pattern for Cedar trust boundary translation. Resolves
    OQ-MCP-2.

-   **Section 7 ---** ATP Condition Expression Syntax v1 full grammar
    and parser specification. Resolves OQ-AS-1.

-   **Section 8 ---** Activity Category Registry community namespace
    governance. Resolves OQ-AS-4.

All decisions from ATP_SDK_Architecture_v2.docx are carried forward
without modification.

## 2. SDK Package Structure (v3 — Twelve Packages)

The twelve-package structure extends the eleven packages established in
Session 6 (L4-5, CLOSED) by promoting @atp/security from PENDING to
v1.0-scoped with a full specification.

  @atp/core             **v1.0**     All TypeScript types and branded
                                      primitives. Zero SDK dependencies.

  @atp/adapters-tier1   **v1.0**     Tier 1 adapter implementations:
                                      SqliteBookingStore, InMemoryStateCache,
                                      AnthropicAgentRuntime,
                                      LocalFilesystemStorage.

  @atp/adapters-tier2   **v1.0**     Tier 2 adapter implementations:
                                      SupabasePostgresStore, ValKeyStateCache,
                                      OpenAIAgentRuntime, MinIOStorage.

  @atp/adapters-tier3   **v1.0**     Tier 3 adapter implementations:
                                      CockroachDBStore, RedisClusterStateCache,
                                      NIMAgentRuntime, S3CompatibleStorage,
                                      AIGridRoutingHint.

  @atp/rest-api         **v1.0**     OpenAPI 3.1 REST surface client.
                                      Auto-generated from
                                      activitytravel.pro/openapi.json.

  @atp/mcp-server       **v1.0**     ATP MCP Server — eight tools, OAuth 2.1 +
                                      mandate auth, NeMo Guardrails, Windley Loop
                                      implementation.

  @atp/security         **v1.0**     Fletcher Embassy pattern. Cedar trust
                                      boundary translation for non-Cedar domains.
                                      FletcherEmbassy interface,
                                      EmbassyRequest/EmbassyResponse types, OAuth
                                      2.1 scope translation and OIDC trust chain
                                      verification. Cedarling WASM runtime.
                                      Section 6 of this document.

  @atp/bridge-octo      **v1.0**     OCTO v2 → ATP bridge. Normative field
                                      mapping. Foundation-scaffolded,
                                      community-maintained (MCP-D12).

  @atp/llms-tooling     **v1.0**     Prompt Library. Windley context template,
                                      four persona templates, 15-placeholder
                                      composition model (atp/1.0+tooling/1.0.0).

  @atp/interop-tests    **v1.0**     Automated interop test suite.
                                      ATP-compatible certification gate.

  @atp/ai-agent         **v1.0**     ATPAgentProvider implementations:
                                      AnthropicAgentProvider (Tier 1),
                                      NIMAgentProvider (Tier 2/3).

  @atp/dev-tools        **v1.0**     Booking Object inspector, CLI scaffolding
                                      tools, local Docker Compose dev environment
                                      runner.

## 3. Decisions Carried Forward from v2

All decisions from ATP_SDK_Architecture_v2.docx are carried forward
without modification. These include: PKG-1 (ten-package minimum), DI-1
(three-profile DI model), DI-2 through DI-4, SDK-TECH-1 through
SDK-TECH-5, REST-1 through REST-3, and Section 8 Agentic AI Contribution
Strategy decisions. L4-5 (@atp/ai-agent addition) from Session 6 is also
carried forward. This section is a carry-forward marker only; the full
decision text is in ATP_SDK_Architecture_v2.docx.

## 4. HAB Adapter Interface Catalogue (Carried Forward)

The eight HAB adapter interfaces (IBookingObjectStore, IStateCache,
IAgentRuntime, IStorageProvider, INotificationProvider,
ISafetyCheckProvider, IPaymentProvider, IAuthProvider) are carried
forward from ATP_SDK_Architecture_v2.docx without modification.
@atp/security introduces one new interface, IEmbassyProvider, specified
in Section 6.

## 5. Dependency Injection Model (Carried Forward)

The three-profile DI model (TIER_1, TIER_2, TIER_3) is carried forward
from ATP_SDK_Architecture_v2.docx without modification. @atp/security
registers IEmbassyProvider as a TIER_2/3 dependency with a no-op default
at TIER_1 (Embassy translation is not expected at
development/single-operator scale).
