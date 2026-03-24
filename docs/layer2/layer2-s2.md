# 2. Normative References and Definitions

**Activity Travel Protocol — Layer 2 — Discovery and Capability Specification**

*Working Draft — Section 2: Normative References and Definitions*

March 2026

---

This section provides the normative reference list and the complete glossary of terms used in the Activity Travel Protocol Layer 2 Discovery and Capability Specification. It must be read in conjunction with the full specification. Cross-references in this section point to the sections where terms are used authoritatively.

Section 2.1 lists the external standards and specifications normatively referenced by this document. Section 2.2 lists the internal Activity Travel Protocol documents on which this specification depends. Section 2.3 defines all terms used normatively in this specification.

> **Normative vs. informative:** All entries in Section 2.1 and 2.2 are normative — implementations claiming conformance must implement these standards as referenced. Definitions in Section 2.3 are normative — the meaning of each term is fixed by this section. Where a term is defined differently in another document, this specification's definition applies within the Layer 2 Discovery and Capability Specification.

---

## 2.1 External Normative References

The following external standards and specifications are normatively referenced by this document. All ADOPT-position standards must be implemented as specified. BRIDGE-position standards define the mapping boundary between the Activity Travel Protocol and adjacent industry systems — implementations must support the bridge interface as defined.

| Ref | Standard / specification | Position | Used in this specification |
|-----|--------------------------|----------|---------------------------|
| ***Identity, Trust, and Security*** | | | |
| **[OIDF]** | OpenID Federation 1.0. OpenID Foundation. Defines the federation model for establishing trust between parties at scale without bilateral pre-registration. | ADOPT | Party identity verification at Capability Declaration registration. Trust Chain validation in Delegation Topology feasibility confirmation. Referenced in S3, S7.4. |
| **[FAPI2]** | FAPI 2.0 Security Profile. OpenID Foundation. Defines the security profile for high-value API interactions, including ES256 signing requirements. | ADOPT | Capability Catalogue API security profile. Feasibility Check operation signing. Referenced in S7, S8. |
| **[ES256]** | ECDSA using P-256 and SHA-256. IETF RFC 7518 Section 3.4. The signing algorithm used for Capability Declaration signing and Feasibility Check operation authentication. | ADOPT | Capability Declaration signing at registration. Feasibility Check event signing. Referenced in S3.1, S7.3. |
| **[VC2]** | W3C Verifiable Credentials Data Model 2.0. W3C Recommendation. Defines the credential format for verifiable identity and authority claims. | ADOPT | Delegation Topology Declaration credential format. Pre-Arrangement Declaration credential binding. Referenced in S3.4, S6. |
| **[TLS13]** | TLS 1.3. IETF RFC 8446. Defines the transport security protocol required for all protocol communications. | ADOPT | All inter-party Layer 2 communications. Capability Catalogue query transport. Referenced in Architecture Specification v0.2. |
| ***Policy and Authorisation*** | | | |
| **[ODRL]** | Open Digital Rights Language (ODRL) Information Model 2.2. W3C Recommendation. Defines the policy declaration format compiled to OPA Rego for evaluation. | ADOPT | Pre-Arrangement Declaration policy expression. Capability Declaration operational constraints. Referenced in S6. |
| **[OPA]** | Open Policy Agent. CNCF Graduated Project. The policy evaluation engine to which ODRL declarations are compiled as Rego. | ADOPT | Pre-Arrangement Declaration evaluation at Layer 3 Security Kernel. Capability Declaration constraint validation at registration. Referenced in S6, S3. |
| ***Agent Communication Protocols*** | | | |
| **[MCP]** | Model Context Protocol. Anthropic. Defines the server protocol for AI model tool integration. atp-mcp ships as a first-class protocol deliverable. | ADOPT | Capability Catalogue MCP tool interface. Static Capability Declaration queries. Graceful degradation fallback path. MCP/A2A boundary at Booking Object creation. Referenced in S8, S10, S1.4. |
| **[A2A]** | Agent2Agent Protocol. Google Cloud / Linux Foundation. v0.3. Defines the agent-to-agent communication protocol for inter-party discovery and negotiation. | ADOPT | Inter-party agent communication during discovery and feasibility phase. A2A task schemas for Capability Declaration queries and Feasibility Check interactions. Referenced in S8, S10. |
| **[ARDP]** | Agent Registration and Discovery Protocol. IETF Internet-Draft draft-pioli-agent-discovery-01. Defines stable agent identities, dynamic endpoint resolution, and capability advertisement across MCP, A2A, HTTP, and gRPC. | MONITOR | Re-evaluation triggered by Layer 2 Capability Catalogue design (Standards Positions v1.1 Watch List). ARDP capability advertisement model is a candidate for alignment with the Capability Catalogue. No normative dependency in v1.0. Referenced in Standards Positions v1.1. |
| ***Messaging and Schema*** | | | |
| **[ASYNCAPI3]** | AsyncAPI 3.0. AsyncAPI Initiative. Defines the asynchronous messaging format for event delivery between parties. | ADOPT | FEASIBILITY_CLEARED and FEASIBILITY_FAILED event delivery. DECLARATION_SUPERSEDED event notification. Referenced in S7. |
| **[ISO8601]** | ISO 8601:2019. International Organisation for Standardisation. Defines date, time, and duration notation. Duration format PT[n]M/H/D used for all timeout values in this specification. | ADOPT | Feasibility Window parameter duration values. Capability Declaration validity period notation. All timeout values in S7. Referenced throughout. |
| **[UUIDV7]** | UUID Version 7. IETF RFC 9562. Time-ordered UUID format. | ADOPT | Capability Declaration version identifiers. Pre-Arrangement Declaration identifiers. Referenced in S3.1, S6.2. |
| ***Travel Industry Standards*** | | | |
| **[IATA-NDC]** | IATA New Distribution Capability (NDC) and One Order. IATA. Defines airline distribution messaging standards. The Activity Travel Protocol bridges to NDC for airline-connected components. | BRIDGE | FlightComponent Capability Declaration type. NDC order reference as foreign key in Activity Configuration. Mapping tables in Appendix A. Referenced in S3.5, S4.3, App. A. |
| **[OTA]** | OpenTravel Alliance 2.0 message specifications. OpenTravel Alliance. Defines travel industry XML/JSON message formats. | BRIDGE | Capability Declaration ↔ OTA message structure mapping. Mapping tables in Appendix A. Referenced in App. A. |
| **[CAAM]** | draft-barney-caam-00. IETF Internet-Draft. Consumer Attribute and Authentication Mechanisms. Defines act-claim model for identity assertions. | BRIDGE | Capability Declarations may carry CAAM act-claims. Normative Trust Chain ↔ act-claim mapping deferred to CAAM Bridge Specification (DL2-2). Referenced in S3.3. |
| ***Observability and Telemetry*** | | | |
| **[OTEL]** | OpenTelemetry. CNCF Graduated Project. Defines the observability framework for distributed tracing, metrics, and logging. | ADOPT | Capability Catalogue query telemetry. Feasibility Check operation tracing. Referenced in Architecture Specification v0.2 Section 5. |

---

## 2.2 Internal Normative References

The following Activity Travel Protocol documents are normatively referenced by this specification. Layer 2 does not restate definitions from these documents — it references them by document name and section. Implementations must obtain and apply the referenced documents.

| Document | Full title | Role in this specification |
|----------|-----------|---------------------------|
| **Architecture Spec v0.2** | Activity Travel Protocol Architecture Specification v0.2 | Defines the five Layer 2 components, OS Function 4 (Driver Model) for the Resource Reference Registry, the three-tier scaling model, the cloud-agnostic principle, and the Security Kernel execution order. Layer 2 implements the discovery and configuration layer; this document defines the runtime it feeds. |
| **Party Registry Spec v0.2** | Activity Travel Protocol Party Registry Specification v0.2 | Defines the Party registration model. Capability Declarations and Pre-Arrangement Declarations are registered as Party artifacts in the Party Registry. Layer 2 extends the Party Registry with Capability Declaration and Pre-Arrangement Declaration registration operations — it does not redefine Party identity or trust chain registration. |
| **Party Policy Declarations Spec v0.2** | Activity Travel Protocol Party Policy Declarations Specification v0.2 | Defines the PartyPolicyDeclaration structure. Pre-Arrangement Declarations are a category of Party Policy Declaration. Their schema is defined in this specification (Section 6); their enforcement runs through the Layer 3 Security Kernel OPA evaluation at the Party Operational policy tier. |
| **Jurisdiction Compliance Spec v0.2** | Activity Travel Protocol Jurisdiction Compliance Specification v0.2 | Defines jurisdiction compliance obligations constraining party operations. Pre-Arrangement Declaration schema must incorporate jurisdiction constraint fields (L2-T-4-C). Capability Declarations must declare the jurisdictions in which they are valid. Jurisdiction coverage is a material change trigger for DECLARATION_SUPERSEDED. |
| **Trust Chain Spec v0.1** | Activity Travel Protocol Trust Chain Declaration Specification v0.1 | Defines the Trust Unit model used in Delegation Topology feasibility confirmation. Delegation Topology Declaration credential format builds on the W3C VC 2.0 trust model defined here. Multi-party delegation chain construction in the Feasibility Check operation (Section 7) uses Trust Chain constructs defined here. |
| **Layer 3 Workflow Specification** | Activity Travel Protocol Layer 3 Workflow Specification (complete, March 2026) | Layer 3 INQUIRY state logic requires FEASIBILITY_CLEARED per Activity Component before INQUIRY may exit (Layer 3 S1 Section 1.7, OQ-L3-1; enforced in Layer 3 S3). The Feasibility Window defined in this specification (Section 7) is referenced as an external parameter by Layer 3 S11. Pre-Arrangement Declarations take effect through the Layer 3 Security Kernel at the Party Operational policy tier. |
| **Pre-Layer 2 Review v1.0** | Activity Travel Protocol Pre-Layer 2 Consistency Review v1.0 | Resolves tensions T-L2-1 through T-L2-5 and produces 18 design rules (L2-T-1-A through L2-T-5-C) that this specification is required to follow. Prior decisions PD-L2-1 (Feasibility Check is asynchronous) and PD-L2-2 (A2A promoted to ADOPT) are inputs to this specification. Open questions OQ-L3-1, OQ-L3-3, and OQ-L3-5 are resolved within this specification. |
| **Standards Positions v1.1** | Activity Travel Protocol Standards Positions and Interoperability Map v1.1 | Defines the ADOPT positions on MCP and A2A, the normative MCP/A2A boundary at Booking Object creation, and the BRIDGE positions on OpenTravel Alliance and IATA NDC that govern Layer 2 Appendix A content. |
| **Context Package Spec** | Activity Travel Protocol Context Package Specification (Step 6) | Defines the Context Package and Decision Object schemas used by Layer 3 AI agent participation points. Layer 2 A2A task schemas defined in this specification (Section 10) are the Layer 2 analog — they are distinct artifacts, not extensions of the Context Package. |

---

## 2.3 Definitions

The following terms are used normatively throughout this specification. Terms defined in external standards (Section 2.1) or internal documents (Section 2.2) are listed here with the Layer 2-specific meaning applied to them. Where a term has a general meaning in the industry, this definition specifies the precise meaning in the Activity Travel Protocol context.

Terms carried from Layer 1 or Layer 3 are listed here with a pointer to their authoritative definition — Layer 2 does not redefine them, but applies them in the discovery and configuration context.

---

### A

**Activity Component**

A single booked service item within a Booking Object, representing one supplier's delivery obligation. In Layer 2, an Activity Component is the unit of Feasibility Check assessment — FEASIBILITY_CLEARED and FEASIBILITY_FAILED events are issued per Activity Component. An Activity Component is produced by the Activity Configuration process: a fully-specified, parameterised booking item ready for Layer 3 INQUIRY. Its fulfillment lifecycle (PENDING → FULFILLING → FULFILLED / FAILED / CANCELLED) is a Layer 3 concern.

*Authoritative definition: Layer 3 Workflow Specification S2.3 (definitions), S3.7.3. Layer 2 usage: S4, S7.*

**Activity Configuration**

The process by which a generic offering in a Capability Declaration is parameterised for a specific booking. Activity Configuration takes a Capability Declaration and a set of booking parameters (dates, participants, configuration options) as inputs and produces a fully-specified Activity Component as output. The Activity Component output of Activity Configuration is the unit handed off to the Layer 3 INQUIRY phase. Activity Configuration is defined by the Activity Configuration Schema (Section 4).

*Cross-reference: S4, S1.5.*

**Activity Configuration Schema**

The normative schema defining the structure and validation rules for the Activity Configuration process. Defines: the parameterisation fields that map a Capability Declaration offering to a specific booking; the required and optional configuration fields; the price resolution rules; and the output format of a fully-specified Activity Component. Defined in Section 4.

*Cross-reference: S4.*

---

### B

**Booking Object**

The fundamental runtime entity of the Activity Travel Protocol. In Layer 2, the Booking Object does not yet exist — it is created at the conclusion of the Layer 2 pipeline, when all required Activity Components have issued FEASIBILITY_CLEARED and the booking agent initiates Booking Object creation. The Booking Object creation event is the normative Layer 2 / Layer 3 boundary (L2-T-2-A).

*Authoritative definition: Layer 3 Workflow Specification S1.4 (Axis 1), S3. Layer 2 usage: S1.4, S7.*

---

### C

**Capability Catalogue**

The runtime query interface over registered Capability Declarations. The Capability Catalogue is not a separate registry — it is the query layer that enables booking agents to discover and retrieve Capability Declarations from the Party Registry. The Capability Catalogue exposes two interfaces: an MCP tool interface for static Capability Declaration queries, and an A2A inter-party agent interface for richer discovery and negotiation. Suppliers without A2A capability are reachable via the MCP tool interface only (L2-T-2-C). Defined in Section 8.

*Cross-reference: S8, S1.5.*

**Capability Declaration**

A supplier-registered statement of what they offer, under what conditions, and for which jurisdictions. Capability Declarations are static at registration time — they describe the supplier's offering in general terms, not the availability of a specific slot. Every Capability Declaration carries: a version identifier; a declared validity period; operational constraints; jurisdiction coverage; and, where applicable, a Delegation Topology Declaration component. The Party Registry stores the current valid version of each declaration. The Feasibility Check operation assesses against the registered Capability Declaration at the time of assessment. Defined in Section 3.

*Cross-reference: S3, S1.5.*

---

### D

**DECLARATION_SUPERSEDED**

A protocol event that a supplier must publish when a Capability Declaration is materially changed. DECLARATION_SUPERSEDED must reference both the superseded version identifier and the replacement version identifier. On receipt, the Party Registry marks the superseded version as invalid and activates the replacement. Any FEASIBILITY_CLEARED events issued against the superseded version after the DECLARATION_SUPERSEDED event are rejected (L2-T-3-B). See also: material change.

*Cross-reference: S3.3, S7.3.*

**Delegation Topology Declaration**

A component of a Capability Declaration that declares a supplier's capability to participate in multi-party Coordination Delegation. A Delegation Topology Declaration specifies: the maximum delegation depth the supplier supports; and any constraints on co-delegatee identity (e.g. jurisdiction, trust tier). Phase window assignment is a Layer 3 concern — it is part of the Coordination Delegation credential issued at Layer 3 execution time (Layer 3 S12), not the Layer 2 declaration. Delegation Topology Declarations are used by the Feasibility Check operation to confirm that a valid delegation chain can be constructed for multi-supplier bookings with more than two Fulfilling Parties (L2-T-5-A, L2-T-5-B). Defined in Section 3.4.

*Cross-reference: S3.4, S7.4, S11.*

---

### F

**Feasibility Check operation**

The asynchronous, event-driven Layer 2 protocol operation that confirms, per Activity Component, that the configured offering is available and the assessed Capability Declaration is current. The Feasibility Check is initiated after Activity Configuration is complete. Suppliers push FEASIBILITY_CLEARED or FEASIBILITY_FAILED as protocol events per Activity Component. The Feasibility Check remains open until all required Activity Components have cleared or the Feasibility Window expires. For multi-supplier bookings with more than two Fulfilling Parties, the Feasibility Check includes a Delegation Topology feasibility step. Defined in Section 7.

*Cross-reference: S7, S1.5.*

**Feasibility Window**

The Layer 2 protocol parameter defining the maximum duration for which the Feasibility Check operation may remain open for a given Activity Component. Defined in this specification as a range with minimum, maximum, and default values (L2-T-1-A). The Feasibility Window is not a Party Policy Declaration override — parties may not extend it beyond the Layer 2-defined maximum (L2-T-1-B). Layer 3 S11 references the Feasibility Window as an external parameter; it is not independently defined in Layer 3.

*Cross-reference: S7.2, Layer 3 S11.*

**FEASIBILITY_CLEARED**

A formal Layer 2 protocol event, issued per Activity Component by the supplier, confirming that the Feasibility Check has passed. FEASIBILITY_CLEARED is recorded in the Booking Object event log. The Party Registry validates that the assessed Capability Declaration is current at the time of issuance — if the declaration is expired or superseded, the Party Registry rejects the event and FEASIBILITY_FAILED with reason DECLARATION_STALE must be returned instead (L2-T-3-C). FEASIBILITY_CLEARED events issued against expired or superseded declaration versions are rejected by the Party Registry (L2-T-3-A). All required Activity Components must carry FEASIBILITY_CLEARED before the Booking Object may be created and Layer 3 entered.

*Cross-reference: S7.3, S1.4, Layer 3 S1 Section 1.7 (OQ-L3-1).*

**FEASIBILITY_FAILED**

A formal Layer 2 protocol event indicating that the Feasibility Check has not passed for a specific Activity Component. FEASIBILITY_FAILED carries a mandatory reason field. Issued by the supplier for: DECLARATION_STALE (the assessed Capability Declaration is expired or superseded); OFFERING_UNAVAILABLE (the configured Activity Component is not available for the requested parameters); DELEGATION_TOPOLOGY_INFEASIBLE (a valid delegation chain cannot be constructed for a multi-party booking). Issued by the protocol runtime for: FEASIBILITY_WINDOW_EXPIRED (the Feasibility Window elapsed before FEASIBILITY_CLEARED was received from the supplier). Additional reason values may be defined in future versions.

*Cross-reference: S7.3, S7.4.*

---

### L

**Live availability signal**

A real-time signal from a supplier system indicating the current availability of a specific offering slot, supplementing the static Capability Declaration. Live availability signals are a Layer 2 concern (OQ-L3-1 CLOSED). The conditions under which live signals may supplement static Capability Declarations, and the protocol obligations they carry, are defined in Section 9. A live availability signal does not replace the Feasibility Check operation — FEASIBILITY_CLEARED remains required regardless of whether a live availability signal has been received.

*Cross-reference: S9.*

---

### M

**Material change**

A change to a Capability Declaration that requires the supplier to publish a DECLARATION_SUPERSEDED event. Material changes include: changes to offered services; changes to pricing model; changes to operational constraints; changes to jurisdiction coverage. The following are not material changes: contact detail updates; formatting changes; clarifications that do not alter the substance of the declaration. Layer 2 defines material change normatively to protect against FEASIBILITY_CLEARED being issued against a stale declaration (L2-T-3-D).

*Cross-reference: S3.3.*

**MCP/A2A boundary**

The Booking Object creation event. All agent interactions before Booking Object creation are Layer 2 scope, governed by A2A for inter-party communication and MCP for Capability Catalogue queries. All agent interactions on an existing Booking Object are Layer 3 scope, governed by MCP. This boundary is normative and non-configurable (L2-T-2-A).

*Cross-reference: S1.4, S8.*

---

### P

**Pre-Arrangement Declaration**

A Layer 2 artifact establishing pre-negotiated terms between parties before a booking begins. Pre-Arrangement Declarations are registered in the Party Registry as Party Policy Declarations at Layer 1 Party registration time. They take effect during Layer 3 booking execution through the Security Kernel's OPA evaluation at the Party Operational policy tier. Pre-Arrangement Declarations are not Security Kernel bypasses — every state transition that relies on a Pre-Arrangement Declaration still goes through the full Security Kernel execution order (L2-T-4-B). Pre-Arrangement Declarations must be registered before the booking begins; a declaration first asserted during an active booking is invalid (L2-T-4-D). Defined in Section 6.

*Cross-reference: S6, S1.5.*

---

### R

**Resource Reference Registry**

The Layer 2 data provider driver registry. Suppliers and parties register external data sources (pricing APIs, availability systems, content feeds) as Resource References, validated against schema at registration time. Corresponds to OS Function 4 (Driver Model) in the Architecture Specification v0.2. Capability Declarations, Activity Configuration operations, and Feasibility Check operations may only reference external data sources registered in the Resource Reference Registry. Defined in Section 5.

*Cross-reference: S5.*

---

### S

**Security Kernel**

The non-bypassable enforcement layer of the Activity Travel Protocol runtime. In Layer 2, the Security Kernel enforces: Party identity verification at Capability Declaration registration; FEASIBILITY_CLEARED event validation against registered declaration versions; Pre-Arrangement Declaration registration rules (L2-T-4-D). The Security Kernel's full execution order (authenticate, authorise, OPA policy evaluation, Trust Chain validation, AI agent scope validation) applies to all Layer 3 operations that touch Layer 2 artifacts.

*Authoritative definition: Architecture Specification v0.2 Section 6. Layer 2 usage: S3.1, S6, S7.3.*

**Static Capability Declaration**

A Capability Declaration as registered in the Party Registry, without live availability supplementation. INQUIRY in Layer 3 operates against Static Capability Declarations (OQ-L3-1 CLOSED). The Static Capability Declaration describes the supplier's offering in general terms; whether a specific slot is available is determined by the Feasibility Check operation or, where defined, by live availability signals (Section 9).

*Cross-reference: S3, S9, Layer 3 S1 Section 1.7 (OQ-L3-1).*

---

### T

**Trust Chain**

The chain of cryptographic attestations linking a Party's identity from the protocol root through the OpenID Federation hierarchy. In Layer 2, Trust Chain validation is required at Capability Declaration registration and during Delegation Topology feasibility confirmation. A supplier's Delegation Topology Declaration is only valid if the supplier's Trust Chain is current and verified.

*Authoritative definition: Trust Chain Specification v0.1. Layer 2 usage: S3.1, S7.4.*

---

## Abbreviations

The following abbreviations are used throughout this specification:

| Abbreviation | Expansion |
|-------------|-----------|
| **A2A** | Agent2Agent Protocol (Google Cloud / Linux Foundation) |
| **ARDP** | Agent Registration and Discovery Protocol (IETF draft) |
| **ASYNCAPI** | AsyncAPI (asynchronous messaging specification) |
| **CAAM** | Consumer Attribute and Authentication Mechanisms (IETF draft) |
| **DL2-n** | Deferred item, Layer 2 (n = item number) |
| **FAPI** | Financial-grade API Security Profile |
| **IPC** | Inter-Party Communication |
| **ISO 8601** | International Organisation for Standardisation date/duration standard |
| **L2-T-n-X** | Layer 2 design rule (n = tension number, X = sub-rule letter) |
| **MCP** | Model Context Protocol |
| **NDC** | New Distribution Capability (IATA) |
| **ODRL** | Open Digital Rights Language |
| **OIDF** | OpenID Foundation |
| **OPA** | Open Policy Agent |
| **OQ-L3-n** | Open Question, Layer 3 (n = question number, resolved in this specification) |
| **OTA** | OpenTravel Alliance |
| **PD-L2-n** | Prior Design Decision, Layer 2 (n = decision number) |
| **PII** | Personally Identifiable Information |
| **T-L2-n** | Tension number, Layer 2 (n = tension number, as used in Pre-Layer 2 Review) |
| **TLS** | Transport Layer Security |
| **UUID v7** | Universally Unique Identifier version 7 (time-ordered, RFC 9562) |
| **VC** | Verifiable Credential (W3C) |
| **W3C** | World Wide Web Consortium |

---

*Activity Travel Protocol — Layer 2 Discovery and Capability Specification — Working Draft — Section 2 — March 2026*
