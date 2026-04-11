# Decisions & Open Questions

*Activity Configuration Schema Design System · Sections 7–9*

[← Category Registry](registry)

## 7. Session 3.5 Decisions

  **ID**                  **Decision**                        **Status**
  **S3.5-1**              The three-layer schema model        **CLOSED**
                          (Capability / Configuration /       
                          Collection) is the normative        
                          structure for all activity          
                          categories in the Activity Travel   
                          Protocol registry. All three layers 
                          are required for every category.    

  **S3.5-2**              Discriminated union with fragment   **CLOSED**
                          composition is the normative schema 
                          architecture. Inheritance is        
                          explicitly rejected. The \$uses     
                          syntax is the normative fragment    
                          reference mechanism.                

  **S3.5-3**              Fragment Library v1 contains 15     **CLOSED**
                          fragments as specified in Section   
                          3. Fragment identifiers are stable  
                          across registry versions. New       
                          fragments require a Category        
                          Proposal or Foundation TSC          
                          amendment.                          

  **S3.5-4**              The IANA registry model governs the **CLOSED**
                          Activity Category Registry. The     
                          Foundation is the registry          
                          authority.                          
                          activitytravel.pro/registry/ is the 
                          canonical publication endpoint.     

  **S3.5-5**              The Starter Catalogue contains six  **CLOSED**
                          categories: ACCOMMODATION_ROOM,     
                          FARM_EXPERIENCE, SKI_ALPINE,        
                          CULTURAL_EXPERIENCE,                
                          CULINARY_CLASS, ENTRANCE_TICKET.    
                          All SDK implementations must        
                          support all six.                    

  **S3.5-6**              SafetyCompliance has three modes:   **CLOSED**
                          SOFT_ADVISORY,                      
                          HARD_ACKNOWLEDGEMENT,               
                          SUPPLIER_VERIFIED.                  
                          HARD_ACKNOWLEDGEMENT produces an    
                          IEventLog entry. SUPPLIER_VERIFIED  
                          additionally requires MCP Server    
                          confirmation by supplier staff.     

  **S3.5-7**              SubSupplierDependency uses a        **CLOSED**
                          ResolutionChain of ordered          
                          FulfilmentOptions. The system       
                          attempts each option in rank order. 
                          FALLBACK options with               
                          requires_guest_consent == true      
                          require explicit guest consent      
                          before activation.                  

  **S3.5-8**              PricingRule conditions may          **CLOSED**
                          reference Collection schema field   
                          values using the ATP Condition      
                          Expression Syntax. This enables     
                          measurement-based pricing           
                          (height-dependent gear pricing) and 
                          behaviour-based pricing (instructor 
                          fee on skill level).                

  **S3.5-9**              InventoryFeed fragment with         **CLOSED**
                          feed_type MANUAL causes the SDK to  
                          set an AVAILABILITY_UNVERIFIED flag 
                          on the Booking Object. CONFIRMED    
                          state requires operator manual      
                          confirmation before the flag is     
                          cleared.                            

  **S3.5-10**             The UI Generation Contract is       **CLOSED**
                          normative for the @atp/ui package. 
                          Third-party frontend                
                          implementations must produce        
                          equivalent UI behaviour for all     
                          form element types,                 
                          SafetyCompliance modes, and         
                          conditional display rules.          

  **S3.5-11**             The registry AI query interface at  **CLOSED**
                          activitytravel.pro/registry/query   
                          is a first-class ATP interface.     
                          Field description attributes are    
                          written to AI agent readability     
                          standards and are normative         
                          registry content.                   

  **S3.5-12**             GearCategory is an open enumeration **CLOSED**
                          maintained in the registry. v1      
                          values are defined in Section 3,    
                          Fragment 6. New gear categories are 
                          added via Category Proposal without 
                          requiring a MAJOR schema version    
                          bump.                               

## 8. Open Questions

  **ID**            **Question**                   **Priority**      **Owner**
  OQ-AS-1           ATP Condition Expression       HIGH              Session 6
                    Syntax v1 covers the field                       
                    reference and comparison cases                   
                    identified in this document.                     
                    Full expression grammar and                      
                    parser specification is                          
                    deferred to Session 6 (Layer 4                   
                    SDK). Is the v1 syntax                           
                    sufficient for the Starter                       
                    Catalogue PricingRule cases?                     

  OQ-AS-2           HarvestCalendar fragment:      MEDIUM            Foundation TSC
                    Ponyhouse's produce                             
                    availability depends on what                     
                    is actually growing at the                       
                    time of visit. This is more                      
                    specific than                                    
                    SeasonalAvailability (season                     
                    dates) and WeatherDependency                     
                    (weather cancellation). A                        
                    HarvestCalendar fragment would                   
                    allow the operator to declare                    
                    current produce and have the                     
                    Collection schema present it                     
                    to the guest. Defer to                           
                    Fragment Library v2?                             

  OQ-AS-3           OCTO Bridge: the registry      HIGH              Session 4
                    entry includes an                                
                    octo_product_type field for                      
                    mapping. The complete mapping                    
                    between ATP category schemas                     
                    and OCTO product types                           
                    requires validation against                      
                    the OCTO v2 specification.                       
                    This mapping is an input to                      
                    Session 4 (MCP Server) and                       
                    Session 6 (SDK).                                 

  OQ-AS-4           Community namespace:           MEDIUM            Foundation TSC
                    community-submitted categories                   
                    use a namespace prefix (e.g.                     
                    atp_community.WINE_TASTING).                     
                    The namespace governance rules                   
                    — who may claim a namespace,                   
                    collision resolution — are                     
                    not specified in this                            
                    document. Required before the                    
                    registry accepts community                       
                    submissions.                                     

  OQ-AS-5           SUPPLIER_VERIFIED              HIGH              Session 4
                    SafetyCompliance uses                            
                    atp_record_safety_check MCP                      
                    Server tool. This tool is not                    
                    yet specified. It is an input                    
                    to Session 4 (MCP Server                         
                    Specification).                                  

## 9. Next Session

Session 4 — ATP MCP Server Specification
(ATP_MCP_Server_Spec_v1.docx). Inputs from this session:
atp_record_safety_check tool (OQ-AS-5), OCTO Bridge product type mapping
(OQ-AS-3), atp_collect_pre_arrangement_data tool contract (Section 5, UI
Generation Contract), Seasalt.AI integration guide (from
ATP_RefImpl_MyAuberge_v1.docx Section 5.3). Upload at session start:
ATP_ProjectBrief_v41.docx, ATP_RefImpl_MyAuberge_v1.docx, and
ATP_ActivitySchema_v1.docx.

**Appendix A — Fragment Dependency Map**

The following table shows which Starter Catalogue categories reference
which fragments. A filled cell indicates the fragment is referenced by
that category.

  **Fragment**            **ACCOM**   **FARM**   **SKI**    **CULTURAL**   **CULINARY**   **TICKET**
  SeasonalAvailability    ✓           ✓          ✓          ✓              ✓              ✓

  CapacityModel           ✓           ✓          ✓          ✓              ✓              ✓

  AgeEligibility          ✓           ✓          ✓          ✓              ✓              ✓

  GroupSizeConstraint     —         ✓          ✓          ✓              ✓              ---

  MeasurementRecord       —         —        ✓          —            —            ---

  EquipmentAssignment     —         —        ✓          —            —            ---

  SkillLevel              —         —        ✓          —            —            ---

  SafetyCompliance        —         ✓          ✓          ✓              ✓              ---

  DietaryRequirement      ✓           ✓          —        —            ✓              ---

  MeetingPoint            ✓           ✓          ✓          ✓              ✓              ✓

  GuideAllocation         —         ✓          ✓          ✓              ✓              ---

  WeatherDependency       —         ✓          ✓          —            —            ---

  SubSupplierDependency   —         —        ✓          —            —            ---

  PricingRule             —         —        ✓          —            —            ---

  InventoryFeed           —         —        ✓          —            —            ✓

**Appendix B — Version History**

  v1.0                    April 2026              Initial release ---
                                                  Track 3 Session 3.5
                                                  output. Three-layer
                                                  schema model defined.
                                                  Fragment Library v1 (15
                                                  fragments). Starter
                                                  Catalogue (6
                                                  categories). UI
                                                  Generation Contract.
                                                  IANA-model registry
                                                  specification. 12
                                                  decisions closed. 5
                                                  open questions.

*Activity Travel Protocol Foundation — ATP_ActivitySchema_v1.docx ---
Apache 2.0*
