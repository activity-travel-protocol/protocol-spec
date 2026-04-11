# Open Questions & Decision Register

*ATP MCP Server Specification · Sections 9–11*

[← Guest Agent & OCTO](guest-agent-octo)

## 9. Open Questions — Session 4 Status

  **ID**     **Question**                       **Status**   **Target**

  OQ-MCP-1   Object-instance resource boundary: RESOLVED — MCP-D1: booking_object_id
             do Cedar mandate semantics hold at CLOSED       field resolves this
             Booking Object UUID granularity?                

  OQ-SDK-2   OCTO Bridge ownership:             RESOLVED — MCP-D12:
             Foundation-maintained or OCTO      CLOSED       Foundation-scaffolded,
             member organisation?                            community-maintained with
                                                             transfer path

  OQ-SDK-3   NIM sidecar: bundled with MCP      RESOLVED — MCP-D7: separate sidecar
             server container or separate       CLOSED       at Tier 2/3
             deployment?                                     

  OQ-AS-5    SUPPLIER_VERIFIED                  RESOLVED — atp_record_safety_check
             SafetyCompliance: which MCP Server CLOSED       
             tool satisfies this?                            

  OQ-SDK-4   Prompt library versioning:         OPEN         Track 3 Session 5
             protocol-versioned or                           
             independently versioned?                        

  OQ-JP-1    Japan APPI: whole-object or        OPEN         GT-1C / Legal counsel
             PII-only residency for Booking                  
             Objects with Japanese parties?                  

  OQ-SG-1    Singapore PDPA: same question as   OPEN         GT-1E / Legal counsel
             OQ-JP-1 for Singapore                           
             jurisdiction.                                   

  OQ-RI-2    WhatsApp Business API approval     OPEN         Meta / WhatsApp
             timeline for ATP Guest Agent                    
             integration.                                    

  OQ-RI-3    8 Peaks OCTO Bridge: does 8 Peaks  OPEN         Tom Sato / 8 Peaks
             have IT capability to self-serve                
             the OCTO API, or does MyAuberge                 
             operate the adapter on their                    
             behalf?                                         

## 10. Decision Register — Session 4

  **Decision**   **Summary**                                         **Status**

  MCP-D1         booking_object_id is a first-class field in the ATP CLOSED
                 Mandate JWT, binding mandates to object-instance    
                 granularity. Resolves OQ-MCP-1.                     

  MCP-D2         The eight Activity Travel Protocol authority scopes CLOSED
                 map directly to Cedar action namespaces. Mapping    
                 table in Section 3.5 is normative.                  

  MCP-D3         HEM invocation uses MCP Tasks (EXPERIMENTAL, spec   CLOSED
                 2025-11-25). Mandate TTL for HEM sub-agents is      
                 hem_timeout_budget + 5 minutes.                     

  MCP-D4         JOURNEY_READ and NOTIFY retired. CONTEXT_READ and   CLOSED
                 NOTIFICATION_SEND are normative scope names.        

  MCP-D5         Eight tools total: six operational, one discovery   CLOSED
                 (atp_search_activities), one administrative         
                 (atp_get_booking_status). atp_invoke_hem is the     
                 sole async tool.                                    

  MCP-D6         atp_invoke_hem requires explicit hem_id enumeration CLOSED
                 in the Cedar mandate. Wildcard HEM_INVOKE mandates  
                 are Security Kernel-rejected.                       

  MCP-D7 /       NIM and NeMo Guardrails deployed as a separate      CLOSED
  OQ-SDK-3       sidecar container at Tier 2 and Tier 3. MCP server  
                 has no Python runtime dependency. Tier 1 exempt.    

  MCP-D8         Three normative NeMo Guardrails rails: HEM          CLOSED
                 Escalation (Rail 1), Notification Tone (Rail 2),    
                 Scope Boundary (Rail 3). Weather safety check       
                 precondition for HEM-07 and HEM-23.                 

  MCP-D9         Two auth modes: embedded (default, Tier 1/2) and    CLOSED
                 enterprise (IdP, Mode 2, Tier 2/3). Configured at   
                 deployment. Protocol surface identical to MCP       
                 clients in both modes.                              

  MCP-D10        No named commercial platform dependency in the      CLOSED
                 spec. ATP-native conversational agent is the        
                 normative guest integration pattern.                

  MCP-D11        ATP Guest Agent is the normative guest integration  CLOSED
                 pattern: MCP-native, WhatsApp Business API direct,  
                 LINE for Japan. Named atp-reference-guest-agent,    
                 REF-06 in Application Catalogue.                    

  MCP-D12 /      @atp/bridge-octo v1.0 is Foundation-scaffolded,    CLOSED
  OQ-SDK-2       community-maintained. Maintenance transfers to      
                 first OCTO member joining the Foundation.           

## 11. Document History

  1.0           April 2026   Tom Sato        Initial version. Track 3 Session 4
                                             complete. Sections 1-10 authored.
                                             12 decisions closed. 4 open
                                             questions resolved.

**Activity Travel Protocol Foundation** (in formation / 設立準備中) ---
ATP_MCPServer_v1.docx — Apache 2.0
