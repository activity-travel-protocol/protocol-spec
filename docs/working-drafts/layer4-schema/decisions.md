# SDK Package Structure, Blocker Review & Decisions

*Layer 4 Schema and SDK · Sections 8–11*

[← OQ Resolutions](resolutions)

## 8. Updated SDK Package Structure

### 8.1 Revised Ten-Package Structure

The ten-package structure (PKG-1, CLOSED) is updated to reflect the
ATPAgentProvider interface introduced in this session. The
@atp/ai-agent package is added as an eleventh package. This does not
reopen PKG-1 — PKG-1 specified the minimum package set; additions are
additive.

  **@atp/core**             v1.0         All TypeScript types and branded
                                          primitives. Zero SDK dependencies. This
                                          document specifies the v1.0 type surface.

  **@atp/adapters-tier1**   v1.0         Tier 1 adapter implementations:
                                          SqliteBookingStore, InMemoryStateCache,
                                          AnthropicAgentRuntime,
                                          LocalFilesystemStorage.

  **@atp/adapters-tier2**   v1.0         Tier 2 adapter implementations:
                                          SupabasePostgresStore, ValKeyStateCache,
                                          OpenAIAgentRuntime, MinIOStorage.

  **@atp/adapters-tier3**   v1.0         Tier 3 adapter implementations:
                                          CockroachDBStore, RedisClusterStateCache,
                                          NIMAgentRuntime, S3CompatibleStorage,
                                          AIGridRoutingHint.

  **@atp/rest-api**         v1.0         OpenAPI 3.1 REST surface client.
                                          Auto-generated from
                                          activitytravel.pro/openapi.json.
                                          TypeScript types from @atp/core.

  **@atp/mcp-server**       v1.0         ATP MCP Server — eight tools, OAuth
                                          2.1 + mandate auth, NeMo Guardrails
                                          integration, Windley Loop implementation.

  **@atp/bridge-octo**      v1.0         OCTO v2 → ATP bridge. Normative field
                                          mapping from Section 5.
                                          Foundation-scaffolded,
                                          community-maintained (MCP-D12).

  **@atp/llms-tooling**     v1.0         Prompt Library. Windley context template,
                                          four persona templates, 15-placeholder
                                          composition model (atp/1.0+tooling/1.0.0).

  **@atp/interop-tests**    v1.0         Automated interop test suite.
                                          ATP-compatible certification gate. All
                                          Starter Catalogue categories covered.

  **@atp/security**         PENDING      Fletcher Embassy pattern. OQ-MCP-2 OPEN.
                                          Placeholder reserved. Target: Track 3
                                          Session 7.

  **@atp/ai-agent**         v1.0 NEW     ATPAgentProvider implementations.
                                          AnthropicAgentProvider (Tier 1 default).
                                          NIMAgentProvider (Tier 2/3,
                                          MyAuberge-hosted NIM endpoint). Prompt
                                          composition via @atp/llms-tooling.

+-----------------------------------------------------------------------+
| **DECISION L4-5**                                                     |
|                                                                       |
| @atp/ai-agent is added as the eleventh SDK package. It exports       |
| AnthropicAgentProvider and NIMAgentProvider as built-in               |
| ATPAgentProvider implementations. The DI model (DI-1, CLOSED) binds   |
| AnthropicAgentRuntime to AnthropicAgentProvider at TIER_1, and        |
| NIMAgentRuntime to NIMAgentProvider at TIER_2/3. The NIMAgentProvider |
| calls the MyAuberge-hosted NVIDIA NIM endpoint by default; the        |
| endpoint URL is configurable for adopters running their own NIM       |
| deployment.                                                           |
+-----------------------------------------------------------------------+

## 9. Blocker Review — OQ-JP-1 and OQ-SG-1

OQ-JP-1 (Japan APPI: whole-object or PII-only data residency for Booking
Objects including a Japanese party) and OQ-SG-1 (Singapore PDPA: same
question) remain OPEN — CRITICAL. These are prerequisites for
Asia-Pacific launch commitments.

Status as of Session 6: No legal opinion has been obtained. David Case
(Rimon P.C.) is identified as legal counsel in the seed deck. The 8%
regulatory and legal allocation in the seed round use-of-funds is
earmarked for OQ-JP-1 and OQ-SG-1 opinions.

No Asia-Pacific go-to-market commitments are made until legal opinions
are received. The IRoutingHint adapter takes the conservative
whole-object residency position at v1.0 (SDK Architecture v2,
confirmed). This is a deliberate conservative default — not a
permanent architectural constraint.

Action: Initiate legal opinion engagement with David Case as a first use
of seed capital. Target receipt of opinions before Series A.

## 10. Decision Register

  **ID**         **Status**   **Decision**                               **Document**
  **L4-1**       CLOSED       ATPAgentProvider is the normative          Layer 4 v1
                              abstraction for all AI inference. No SDK   
                              package calls an LLM directly. provider_id 
                              logged in every StateTransitionEvent.      

  **L4-2**       CLOSED       No model training required at v1.0. Prompt Layer 4 v1
                              Library is the behavioural specification.  
                              Fine-tuning is a post-v1.0 IaaS            
                              optimisation.                              

  **L4-3**       CLOSED       OpenAPI 3.1 published at                   Layer 4 v1
                              activitytravel.pro/openapi.json            
                              (canonical) and openapi.yaml. JSON Schema  
                              objects at activitytravel.pro/schemas/.    
                              All non-registry endpoints require OAuth   
                              2.1.                                       

  **L4-4**       CLOSED       Registry published as HTML (VitePress) and Layer 4 v1
                              JSON-LD from single YAML source.           
                              Auto-deployed on push to main.             

  **L4-5**       CLOSED       @atp/ai-agent added as eleventh SDK       Layer 4 v1
                              package. AnthropicAgentProvider (Tier 1)   
                              and NIMAgentProvider (Tier 2/3) are        
                              built-in implementations.                  

  **OQ-MCP-3**   RESOLVED — HEM-MANDATE-01 added as 24th HEM scenario. Layer 4 v1
                 CLOSED       Trigger: MANDATE_GAP_DETECTED unresolved   
                              after one delegation hop. Effect:          
                              hem_escalation_active, all transitions     
                              blocked. Resolution: ADMIN scope human     
                              operator.                                  

  **OQ-AS-3**    RESOLVED — Full field-level OCTO v2 → ATP Activity    Layer 4 v1
                 CLOSED       Configuration Schema mapping complete.     
                              Normative for @atp/bridge-octo v1.0.      

  **OQ-MCP-2**   OPEN         Fletcher Embassy / @atp/security. Pending Layer 4 v1
                              design collaboration with George Fletcher. 
                              Target: Track 3 Session 7.                 

## 11. Next Session

+-----------------------------------------------------------------------+
| **Track 3 Session 7 — @atp/security and Fletcher Embassy**         |
|                                                                       |
| Upload at session start: ATP_ProjectBrief_v46.docx,                   |
| ATP_Layer4_Schema_v1.docx, ATP_MCPServer_v1.docx,                     |
| ATP_MCPServer_v1_Addendum.docx.                                       |
|                                                                       |
| Objectives: (1) @atp/security package — Fletcher Embassy pattern   |
| for Cedar trust boundary translation. Resolve OQ-MCP-2. (2) OQ-AS-1   |
| — ATP Condition Expression Syntax v1 grammar and parser             |
| specification. (3) OQ-AS-4 — community namespace governance for     |
| registry. (4) Track 4 Session 4 — MyAuberge Commercial Position     |
| document.                                                             |
|                                                                       |
| *Prerequisite: George Fletcher's review of Arc 4 blog material and   |
| @atp/core type surface (this document).*                             |
+-----------------------------------------------------------------------+

Activity Travel Protocol Foundation (in formation / 設立準備中) ·
ATP_Layer4_Schema_v1.docx · Apache 2.0 · April 2026
