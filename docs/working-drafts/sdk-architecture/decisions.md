# Open Questions & Decisions

*SDK Architecture Blueprint · Sections 9–11*

[← Category Registry](category-registry)

## 10. Decisions Closed This Session

  **Decision   **Title**                      **Section**
  ID**                                        

  SEC-1        booking_object_id stays inside 6.2 / 6.3
               ATP (Option B)                 

  SEC-2        EmbassyResponse carries        6.3
               CedarEvaluationResult in       
               evaluationLog                  

  SEC-3        Embassy holds all              6.4
               foreign-domain credentials;    
               agent holds none               

  SEC-4        Cedarling WASM as Cedar engine 6.6
               in @atp/security;             
               string-match fallback          
               normative for WASM-constrained 
               environments                   

  CES-1        ATP Condition Expression       7.2
               Syntax v1 EBNF grammar is      
               normative                      

  CES-2        Condition Expression parser    7.5
               ships in @atp/core;           
               recursive-descent; normative   
               reference                      

  CES-3        CES versioned independently;   7.5
               v1 frozen; version string      
               'atp-ces/1.0'                

  NS-1         atp_community open to any CLA  8.3
               signatory; no claim process    
               required                       

  NS-2         Org namespace claiming via TSC 8.3
               GitHub issue; 30-day approval  
               window                         

  NS-3         Collision resolution rules for 8.3
               all namespace interaction      
               scenarios                      

## 11. Version History

  v3.0          April 2026 @atp/security package specification added
                           (Section 6). Fletcher Embassy pattern ---
                           FletcherEmbassy interface,
                           EmbassyRequest/EmbassyResponse, OAuth 2.1 scope
                           translation, OIDC trust chain verification,
                           Cedarling WASM runtime. SEC-1 through SEC-4
                           closed. OQ-MCP-2 RESOLVED. ATP Condition
                           Expression Syntax v1 full EBNF grammar and parser
                           specification added (Section 7). CES-1 through
                           CES-3 closed. OQ-AS-1 RESOLVED. Activity Category
                           Registry community namespace governance added
                           (Section 8). NS-1 through NS-3 closed. OQ-AS-4
                           RESOLVED. SDK package count confirmed at twelve.

  v2.0          April 2026 Section 8 Agentic AI Contribution Strategy added.
                           @atp/ai-agent added as eleventh package (L4-5).
                           ATPAgentProvider interface,
                           AnthropicAgentProvider, NIMAgentProvider. REST
                           API surface. OQ-SDK-1, OQ-SDK-5, CAT-OQ-2,
                           CAT-OQ-4 resolved.

  v1.0          April 2026 Initial release. SDK architecture:
                           TypeScript-first, Python analytics sidecar,
                           three-profile DI model (TIER_1/2/3), ten-package
                           structure, eight HAB adapter interfaces, REST API
                           surface for Java adopters at v1.0.

Activity Travel Protocol — SDK Architecture Blueprint v3.0 — April
2026 \| Activity Travel Protocol Foundation (in formation / 設立準備中)
\| Apache 2.0
