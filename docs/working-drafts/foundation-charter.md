# Foundation Charter

*Activity Travel Protocol Foundation · Track 4 Session 1 · April 2026 · Apache 2.0*

## Preamble

The Activity Travel Protocol is an open protocol standard for the global
travel industry. It enables the discovery, configuration, negotiation,
booking, fulfilment, and disruption management of complex travel
activities and experience packages across multiple suppliers,
jurisdictions, and AI agents. It is a runtime platform — a Travel
Operating System — that manages the full lifecycle of a booking as a
first-class runtime entity, with policy enforcement, trust chain
construction, duty of care tracking, and AI agent participation built
into the protocol itself.
The Activity Travel Protocol was created by Tom Sato, CEO of MyAuberge
K.K., Chino, Nagano, Japan, drawing on experience operating
accommodation and activity packages in the Japanese market and as a
former Microsoft Windows and SDK engineer. The protocol is designed to
be scale-neutral, jurisdiction-aware, and AI-native from its
foundations.
This Charter establishes the Activity Travel Protocol Foundation as the
independent governing body for the protocol. The Foundation holds the
protocol, its intellectual property, its online presence, and its
standards process in trust for the global travel and technology
communities. MyAuberge K.K. is the Founding Member of the Foundation and
the primary commercial operator of managed services on top of the
protocol. These are structurally distinct and formally separated
identities.

## 1 Name and Legal Form

### 1.1 Full name

Activity Travel Protocol Foundation
(一般社団法人アクティビティトラベルプロトコールファウンデーション)

### 1.2 Short form

The Foundation. Not abbreviated to ATPF in formal documents.

### 1.3 Legal form and jurisdiction

The Foundation is constituted as a general incorporated association
(一般社団法人) under Japanese law. This jurisdiction reflects the
founding context: the protocol was created in Japan, the Founding Member
is a Japanese entity, and Japan is a primary target market for the first
commercial deployments of the protocol.
Incorporation is the intended long-term structure. Pending formal
incorporation, this Charter constitutes the governing document of the
Foundation as an unincorporated association. The Foundation will seek
formal incorporation before the first external Founding Member is
admitted or before v1.0 public launch, whichever comes first.
+-----------------------------------------------------------------------+
| **T4-OQ-1 RESOLVED — Legal entity jurisdiction: Japan               |
| (一般社団法人)**                                                      |
|                                                                       |
| Rationale: operationally simple for a solo founder, home jurisdiction |
| of Founding Member, domestically credible. Defers formal              |
| incorporation to the milestone event (first external member or v1.0   |
| launch), whichever is first. This Charter is the operative governance |
| document in the interim.                                              |
+-----------------------------------------------------------------------+

### 1.4 Registered address

Chino-shi, Nagano-ken, Japan. (Full registered address to be set at
incorporation.)

### 1.5 Contact

hello@activitytravel.org

## 2 Purpose and Scope

### 2.1 Mission

The Foundation's mission is to develop, maintain, and promote the
Activity Travel Protocol as a free, open, and independently governed
standard for the global travel industry, enabling AI-native booking,
fulfilment, and disruption management across multiple suppliers and
jurisdictions.

### 2.2 Founding principles

-   Open and free. The protocol specification, SDK, and conformance test
    suite are published under the Apache 2.0 licence. No party may
    relicense, enclose, or impose proprietary restrictions on the
    protocol.
-   Independent governance. Protocol decisions are made by the Technical
    Steering Committee, not by any commercial operator. No single
    organisation — including MyAuberge K.K. — has unilateral
    authority over the protocol.
-   Consumer protection first. Duty of care, safety, and traveller
    rights are foundational design requirements, not optional
    extensions. The protocol shall not be amended in ways that weaken
    these protections.
-   AI-native by design. AI agent participation is a first-class
    protocol requirement, not an add-on. Authority scopes, human
    escalation, and the CONFIRMATION hard cap are core protocol
    constructs and shall not be removed.
-   Scale-neutral. The protocol defines signal infrastructure and
    authority models without prescribing human-facing implementation. A
    single ryokan and a global OTA operate the same protocol semantics.
-   Jurisdiction-aware. The protocol provides conformance infrastructure
    for multi-jurisdiction compliance. It does not prescribe or replace
    local law; it makes compliance addressable.

### 2.3 What the Foundation does

-   Publishes and maintains the Activity Travel Protocol specification
    (Layers 1--4).
-   Holds and manages the activitytravel.pro and activitytravel.org
    domains and associated online presence.
-   Holds the activity-travel-protocol GitHub organisation and all
    repositories within it.
-   Manages the Technical Steering Committee and the protocol amendment
    process.
-   Publishes and maintains the SDK, llms.txt, Prompt Library, and
    reference application catalogue under Apache 2.0.
-   Operates the interoperability test suite and the ATP-compatible
    certification mark.
-   Manages membership, working groups, and community processes.
-   Engages with regulators, standards bodies, and industry
    organisations on behalf of the protocol.

### 2.4 What the Foundation does not do

-   The Foundation does not operate commercial services, managed
    infrastructure, or IaaS products.
-   The Foundation does not endorse or recommend any commercial
    operator, including MyAuberge K.K.
-   The Foundation does not hold equity in any commercial entity.
-   The Foundation does not enter commercial contracts with end
    customers.

## 3 Intellectual Property

### 3.1 IP assignment

MyAuberge K.K. hereby assigns to the Foundation all intellectual
property rights in the Activity Travel Protocol specification (Layers
1--4), the SDK, the llms.txt surface and Prompt Library, the
interoperability test suite, the reference application catalogue, and
all associated documentation as they existed at the date of this
Charter.
This assignment is irrevocable. No party may reclaim assigned IP, and
the Foundation may not transfer protocol IP to any single commercial
entity.

### 3.2 Licence

All Foundation-held protocol artefacts are published under the Apache
2.0 licence. Contributions accepted into Foundation repositories under
the Contributor Licence Agreement (Track 4 Session 2) transfer copyright
to the Foundation and are re-published under Apache 2.0. The Foundation
shall not relicense the protocol under a more restrictive licence.

### 3.3 Trademarks

"Activity Travel Protocol", "ATP-compatible", and the Foundation's
name and logo are trademarks held by the Foundation. The ATP-compatible
certification mark may be used only by implementations that have passed
the interoperability test suite and have been approved by the
Foundation. MyAuberge K.K. may not use the Foundation's name or marks
in a manner that implies Foundation endorsement of MyAuberge's
commercial services.

### 3.4 Ownership separation (summary)

  **Activity Travel Protocol          **MyAuberge K.K. owns**
  Foundation owns**                   
  Protocol specification (Layers      MyAuberge webapp
  1--4)                               (booking.myauberge.jp)
  activitytravel.pro —              Managed ATP IaaS service
  specification site                  
  activitytravel.org — landing page Nvidia AI Grid infrastructure
  and blog                            operation
  GitHub org:                         MyAuberge brand and commercial
  activity-travel-protocol            relationships
  SDK (Apache 2.0 licence)            Japan market expertise and
                                      regulatory position
  llms.txt and Prompt Library         "Built by the team that founded
                                      ATP" narrative
  Interoperability test suite         Revenue from IaaS customers
  Reference application catalogue     MyAuberge-specific marketing
                                      content
  ATP-compatible certification mark   
  Technical Steering Committee and    
  governance process                  

## 4 Membership

### 4.1 Membership model

The Foundation operates a two-tier membership model. Founding Member
status carries full governance rights. Community Members participate in
the protocol community without governance rights.
                        **Founding Member**      **Community Member**
  **Current holder**    MyAuberge K.K.           Any individual,
                                                 organisation, or AI
                                                 project
  **Admission**         Designated in this       Self-registration via
                        Charter                  Foundation site
  **TSC voting rights** Yes — full voting      No
                        member                   
  **TSC seat**          Yes — guaranteed seat  No
  **Protocol amendment  Yes                      No (may raise GitHub
  proposal**                                     issues)
  **Working group       Yes — all working      Yes — open working
  participation**       groups                   groups only
  **CLA required**      Yes                      Yes (for code
                                                 contributions)
  **IaaS pricing        Negotiated separately    Standard pricing
  benefit**             with MyAuberge           
  **Foundation page     Yes — Founding Member  Community page listing
  listing**             logo and bio             
  **Future expansion**  Additional Founding      Open registration
                        Members by TSC unanimous 
                        vote                     

### 4.2 Founding Member

MyAuberge K.K. is the sole Founding Member of the Foundation at the date
of this Charter. Tom Sato, CEO of MyAuberge K.K., serves as Founding
Maintainer and initial sole member of the Technical Steering Committee.
Additional Founding Members may be admitted by unanimous vote of the
Technical Steering Committee. An additional Founding Member must be an
organisation (not an individual) and must make a material contribution
to the protocol — in the form of specification work, reference
implementation, tooling, or governance participation — as a condition
of admission. Candidates identified in Track 4 Session 6 include
organisations from the Japan Tourism Agency, JATA, OCTO member
organisations, and academic institutions.
+-----------------------------------------------------------------------+
| **Membership model decision — CLOSED**                              |
|                                                                       |
| Two tiers: Founding Member (full governance rights, TSC seat) and     |
| Community Members (community participation, no governance).           |
| Additional Founding Members admitted by TSC unanimous vote. Partner   |
| and Contributor tiers deferred to Track 4 Session 6 review.           |
+-----------------------------------------------------------------------+

### 4.3 Community Members

Community membership is open to any individual, organisation, or AI
project that registers via the Foundation website and agrees to the
Foundation's Code of Conduct. Community Members may:
-   Participate in open working groups and public consultation
    processes.
-   Raise issues and feature requests in Foundation repositories.
-   Submit pull requests (subject to the Contributor Licence Agreement).
-   Be listed on the Foundation's community page.

### 4.4 Code of Conduct

All members and contributors are subject to the Foundation's Code of
Conduct. The Code of Conduct will be published as a separate document
(CONDUCT.md) in the Foundation's primary repository. The Foundation
adopts the Contributor Covenant v2.1 as its baseline, with
travel-industry-specific additions regarding consumer protection and
duty of care obligations.

## 5 Technical Steering Committee

### 5.1 Purpose

The Technical Steering Committee (TSC) is the supreme decision-making
body of the Foundation. It is responsible for the technical direction of
the protocol, the amendment process, and the admission of additional
Founding Members.

### 5.2 Initial composition

At the date of this Charter, the TSC consists of a single member:
-   Tom Sato — Founding Maintainer, MyAuberge K.K., Chino, Nagano,
    Japan.
Tom Sato serves as TSC Chair by default during the sole-member period.
The sole-member period ends when the first additional Founding Member is
admitted. At that point the TSC expands to include a representative of
the incoming Founding Member, and the TSC elects a Chair from among its
members.
+-----------------------------------------------------------------------+
| **TSC composition decision — CLOSED**                               |
|                                                                       |
| Tom Sato as sole TSC member until first external Founding Member      |
| joins (then TSC expands by one seat per admitted Founding Member). No |
| reserved seats; structure accommodates future members naturally. Full |
| TSC Charter to be produced in Track 4 Session 5.                      |
+-----------------------------------------------------------------------+

### 5.3 TSC responsibilities

-   Approve protocol amendments (see Section 6).
-   Approve new Founding Members (unanimous vote required).
-   Approve the Foundation's governance documents and policies.
-   Approve the ATP-compatible certification mark programme (Track 4
    Session 7).
-   Approve partner membership terms (Track 4 Session 8).
-   Oversee the interoperability test suite and conformance programme.
-   Appoint and oversee working group chairs.

### 5.4 Decision-making during sole-member period

During the sole-member period, the TSC Chair (Tom Sato) has full
decision-making authority in all TSC matters. All decisions shall be
recorded as TSC decisions in the Foundation's decision log
(decisions.md in the protocol-docs repository). This maintains the
governance record that incoming TSC members and community members can
inspect.

### 5.5 Decision-making after expansion

Once the TSC has two or more members, the following rules apply:
-   Ordinary decisions: simple majority of TSC members present at a
    quorate meeting.
-   Protocol amendments: two-thirds majority of all TSC members (not
    just those present).
-   Admission of new Founding Members: unanimous vote of all TSC
    members.
-   Amendment to this Charter: two-thirds majority of all TSC members.
-   Quorum: a majority of TSC members.
A full voting model, meeting procedures, tie-breaking rules, and member
term lengths will be specified in the TSC Charter (Track 4 Session 5
deliverable: ATP_TSC_Charter_v1.md).

## 6 Protocol Amendment Process

### 6.1 Amendment principles

The Activity Travel Protocol is a living specification. Amendments are
expected and governed. The amendment process is designed to be
transparent, deliberate, and resistant to capture by any single
commercial interest.

### 6.2 Amendment categories

-   
-   
-   
-   

### 6.3 Amendment process

1.  Any Community Member may raise a GitHub issue proposing a protocol
    amendment.
2.  The TSC Chair assigns the issue to the appropriate working group or
    takes it directly.
3.  A Protocol Amendment (PA-xx) is drafted and published for community
    comment. Minimum comment period: 14 days for NORMATIVE amendments.
4.  The TSC votes on the amendment at its next scheduled meeting.
5.  Approved amendments are merged into the specification and recorded
    in the amendment log.

### 6.4 Consumer protection amendments

No amendment may weaken the following protocol protections:
-   The CONFIRMATION hard cap at authority Level 1 or below (DR-v6-D5).
    AI agents shall not confirm bookings autonomously above this level.
-   Duty of care tracking and the IN_JOURNEY phase model.
-   The Security Kernel's non-bypassable execution guarantee.
-   Human escalation requirement for irreversible decisions at HEM-16
    and above.
Any amendment that proposes to modify these protections requires a
unanimous TSC vote and a 30-day public comment period.

## 7 Working Groups

The TSC may establish working groups to manage specific areas of
protocol work. Working groups report to the TSC and may include
Community Members. Working group output is advisory until ratified by
TSC vote.
Initial working groups anticipated from Track 3 and Track 4 work:
-   
-   
-   
-   

## 8 Relationship with MyAuberge K.K.

### 8.1 The Red Hat model

MyAuberge K.K. is the Founding Member of the Foundation and the primary
commercial operator of managed services on top of the Activity Travel
Protocol. This relationship is modelled on the Red Hat model: Red Hat
built a substantial commercial business (acquired by IBM for US\$34
billion) selling enterprise support and managed infrastructure for Linux
--- a protocol and operating system it did not own and could not
control.
MyAuberge K.K. competes on execution quality, Japan market expertise,
managed infrastructure, and Nvidia AI Grid integration — not on
protocol control. The protocol's openness and the Foundation's
independence are the source of MyAuberge's commercial credibility, not
threats to it. Adopters choose MyAuberge IaaS knowing that the exit ramp
to any other conformant implementation exists.

### 8.2 Conflict of interest provisions

The following provisions apply specifically to manage the conflict of
interest arising from MyAuberge K.K.'s dual role as Founding Member and
commercial operator:
-   Protocol amendments that directly affect pricing, data access, or
    competitive dynamics for IaaS operators require a 30-day public
    comment period, regardless of amendment category.
-   MyAuberge K.K. shall not use data from Booking Objects processed
    through its IaaS platform to influence TSC decisions.
-   MyAuberge K.K. shall publish its position on any contested protocol
    amendment separately from its TSC vote, disclosing its commercial
    interest.
-   The Foundation's governance documents shall be publicly accessible
    at all times, enabling the community to inspect all TSC decisions
    and their rationale.

### 8.3 Founding narrative

The Foundation celebrates the MyAuberge origin story. The protocol was
created by Tom Sato from lived experience operating in the Japanese
travel market and from a career building developer platforms at
Microsoft. This origin gives the protocol its authenticity and practical
grounding. The Foundation's About page will carry this founding
narrative prominently.
The distinction is: the creator's identity gives the protocol
authenticity; the Foundation's independence gives it credibility. Both
are true simultaneously.

## 9 Financial Model

During the sole-member period, the Foundation's operational costs are
funded by MyAuberge K.K. as Founding Member. No separate Foundation
revenue stream is required at this stage.
As the Foundation grows, the following revenue sources may be developed:
-   Founding Member and Partner Member fees (to be defined in Track 4
    Sessions 6 and 8).
-   ATP-compatible certification mark fees (Track 4 Session 7).
-   Grants from standards bodies, academic institutions, or government
    programmes.
The Foundation shall not distribute surplus to members. All surplus
shall be reinvested in protocol development, tooling, and community
operations.

## 10 Track 4 — Foundation and Governance Programme

This Charter is the deliverable of Track 4 Session 1. The full Track 4
programme is:
  1             Foundation Charter ATP_FoundationCharter_v1.docx    COMPLETE ---
                                                                    this document
  2             Contributor        ATP_CLA_v1.md — Apache 2.0     NEXT ---
                Licence Agreement  baseline                         blocks OSS
                                                                    launch
  3             Site Re-signing    activitytravel.pro and .org →    High priority
                                   Foundation identity              
  4             MyAuberge          ATP_CommercialPosition_v1.docx   Needed
                Commercial                                          pre-launch
                Position                                            
  5             Technical Steering ATP_TSC_Charter_v1.md            Needed for
                Committee Charter                                   v1.0
  6             Founding Member    Outreach plan + invitation       High leverage
                Outreach           document                         
  7             Interop            ATP_CertificationModel_v1.docx   Post v1.0
                Certification                                       
                Programme                                           
  8             Partner Membership Google Cloud and Nvidia          Post v1.0
                                   positioning one-pagers           

## 11 Decisions Recorded This Session

  -----------------------------------------------------------------------
  **DECISION GOV-1 ---** Governance separation — Activity Travel
  Protocol Foundation (CLOSED)
  -----------------------------------------------------------------------
The Activity Travel Protocol is governed by the Activity Travel Protocol
Foundation, an independent standards body. MyAuberge K.K. is the
Founding Member and primary contributor. Commercial services on top of
the protocol are operated by MyAuberge. These are formally separated
identities. Protocol governance and commercial operation are
structurally independent. This is the Red Hat model applied to the
Activity Travel Protocol. CLOSED.
  -----------------------------------------------------------------------
  **DECISION GOV-2 ---** IaaS business model — Red Hat framing (CLOSED)
  -----------------------------------------------------------------------
MyAuberge K.K. operates managed ATP runtime as a commercial service
(Nvidia AI Grid + NIM infrastructure). The protocol is free and
Foundation-governed. MyAuberge competes on execution quality, Japan
market expertise, managed infrastructure, and Nvidia AI Grid integration
--- not on protocol control. CLOSED.
  -----------------------------------------------------------------------
  **DECISION GOV-3 ---** Site re-signing — MyAuberge K.K. → Activity
  Travel Protocol Foundation
  -----------------------------------------------------------------------
activitytravel.pro and activitytravel.org to be re-signed as Foundation
property. Track 4 Session 3 is the formal execution session. Founding
narrative (Tom Sato / MyAuberge origin) preserved on About page.
  -----------------------------------------------------------------------
  **DECISION T4-S1-1 ---** Legal entity jurisdiction — Japan
  (一般社団法人)
  -----------------------------------------------------------------------
T4-OQ-1 RESOLVED. Foundation constituted as a 一般社団法人 under
Japanese law. Formal incorporation targeted before first external
Founding Member admission or v1.0 public launch, whichever is first.
This Charter is the operative governance document in the interim.
  -----------------------------------------------------------------------
  **DECISION T4-S1-2 ---** Membership model — two tiers
  -----------------------------------------------------------------------
Two-tier model: Founding Member (full governance rights, TSC seat,
guaranteed by Charter) and Community Members (open registration, no
governance rights). Additional Founding Members admitted by TSC
unanimous vote. Partner and Contributor tiers deferred to Track 4
Session 6 review.
  -----------------------------------------------------------------------
  **DECISION T4-S1-3 ---** TSC initial composition — Tom Sato as sole
  member pending first external Founding Member
  -----------------------------------------------------------------------
Tom Sato serves as sole TSC member and TSC Chair during the sole-member
period. TSC expands by one seat per admitted Founding Member. No
reserved seats. Full TSC Charter in Track 4 Session 5.

## 12 Open Questions

  **ID**     **Question**                           **Target**
  T4-OQ-2    Blog author attribution after site     Track 4 Session 3
             re-signing: 'Tom Sato — Founding    
             Maintainer' → 'Tom Sato — Founder, 
             Activity Travel Protocol Foundation'? 
  T4-OQ-3    Google Cloud positioning document:     Track 4 Sessions 4/8
             Track 3 or Track 4 deliverable?        
             Required before Google Maps contact    
             outreach.                              
  T4-OQ-4    Founding member incentives for future  Track 4 Session 6
             external members: TSC seat, Foundation 
             page logo, preferred IaaS pricing from 
             MyAuberge?                             
  IaaS-1     Per-Booking-Object IaaS price point:   Track 3 Session 3 /
             requires modelling Nvidia AI Grid      Track 4 Session 4
             infrastructure costs.                  
  IaaS-2     Does MyAuberge operate IaaS directly,  Track 4 Sessions 4/8
             or in partnership with Google Cloud as 
             infrastructure layer?                  

## 13 Ratification

This Charter is ratified by the Founding Member of the Activity Travel
Protocol Foundation.
+-----------------------------------+-----------------------------------+
| **Founding Member**               | **Founding Maintainer / TSC       |
|                                   | Chair**                           |
| MyAuberge K.K.                    |                                   |
|                                   | Tom Sato                          |
| Tom Sato, CEO                     |                                   |
|                                   | Activity Travel Protocol          |
| Chino, Nagano, Japan              | Foundation                        |
|                                   |                                   |
| April 2026                        | April 2026                        |
+-----------------------------------+-----------------------------------+
Activity Travel Protocol Foundation · Foundation Charter v1.0 · April
2026 · Apache 2.0