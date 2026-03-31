# Normative References and Definitions

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 2 | March 2026

---

This section provides the normative reference list and the complete glossary of terms used in the Activity Travel Protocol Layer 3 Workflow Specification. It must be read in conjunction with the full specification. Cross-references in this section point to the sections where terms are used authoritatively.

Section 2.1 lists the external standards and specifications normatively referenced by this document. Section 2.2 lists the internal Activity Travel Protocol documents on which this specification depends. Section 2.3 defines all terms used normatively in this specification.

> **Normative vs. informative:** All entries in Section 2.1 and 2.2 are normative — implementations claiming conformance must implement these standards as referenced. Definitions in Section 2.3 are normative — the meaning of each term is fixed by this section. Where a term is defined differently in another document, this specification's definition applies within the Layer 3 Workflow Specification.

## 2.1 External Normative References

The following external standards and specifications are normatively referenced by this document. All ADOPT-position standards must be implemented as specified. BRIDGE-position standards define the mapping boundary between the Activity Travel Protocol and adjacent industry systems — implementations must support the bridge interface as defined.

### Identity, Trust, and Security

| Ref | Standard / specification | Position | Used in this specification |
|---|---|---|---|
| **[OIDF]** | OpenID Federation 1.0. OpenID Foundation. Defines the federation model for establishing trust between parties at scale without bilateral pre-registration. | ADOPT | Party Registry identity establishment. Trust Chain construction. AgentAuthorityDeclaration issuance. Referenced in S1.3, S9.1.2. |
| **[FAPI2]** | FAPI 2.0 Security Profile. OpenID Foundation. Defines the security profile for high-value API interactions, including ES256 signing requirements. | ADOPT | Context Package signing (ES256, FAPI 2.0 profile). Decision Object signature validation. Referenced in S9.1.2, S9.3. |
| **[VC2]** | W3C Verifiable Credentials Data Model 2.0. W3C Recommendation. Defines the credential format for verifiable identity and authority claims. | ADOPT | Coordination Delegation credential format (CD-1). AgentAuthorityDeclaration. Trust Chain declarations. Referenced in S12.4.1. |
| **[TLS13]** | TLS 1.3. IETF RFC 8446. Defines the transport security protocol required for all protocol communications. | ADOPT | All inter-party protocol communications. Minimum transport security requirement. Referenced in Architecture Specification v0.2. |
| **[AES256]** | AES-256-GCM. NIST FIPS 197 / SP 800-38D. Defines the symmetric encryption standard for TRAVELER_PII at rest. | ADOPT | TRAVELER_PII encryption at rest from PENDING_CONFIRMATION onwards. Referenced in S3.2.5. |
| **[ES256]** | ECDSA using P-256 and SHA-256. IETF RFC 7518 Section 3.4. The algorithm used for Context Package and Decision Object signing. | ADOPT | Context Package signing. Decision Object signature. Coordination Delegation proof. Referenced in S9.1.2, S12.4.1. |

### Policy and Authorisation

| Ref | Standard / specification | Position | Used in this specification |
|---|---|---|---|
| **[ODRL]** | Open Digital Rights Language (ODRL) Information Model 2.2. W3C Recommendation. Defines the policy declaration format compiled to OPA Rego for evaluation. | ADOPT | Party Policy Declarations. Cancellation policy evaluation. All four-tier policy set evaluation. Referenced throughout S3–S8. |
| **[OPA]** | Open Policy Agent. CNCF Graduated Project. The policy evaluation engine to which ODRL declarations are compiled as Rego. Evaluates all policy decisions at state transitions. | ADOPT | Every Security Kernel transition gate. DT-3 negotiation policy evaluation. Cancellation policy. Force majeure OPA evaluation. Referenced in S1.6, S6, S8. |
| **[SSF]** | Shared Signals Framework. OpenID Foundation. Defines the push and poll delivery mechanisms for CAEP and RISC events. | ADOPT | Agent credential revocation detection. SSF events during C1 window (HEM-12). BOOKING_SUSPENDED SSF interaction (S5.8). Referenced in S5.8, S8.2.3, S9.3.2. |
| **[CAEP]** | Continuous Access Evaluation Profile. OpenID Foundation. Defines session revocation event types delivered via SSF. | ADOPT | CAEP Session Revoked event handling in Context Package stale detection (S9.6). BOOKING_SUSPENDED SSF interaction (S5.8). |
| **[RISC]** | Risk and Incident Sharing and Coordination Profile. OpenID Foundation. Defines credential compromise events delivered via SSF. | ADOPT | RISC Credential Compromised event — CREDENTIAL_COMPROMISED_GATE activation. Stale package handling. Referenced in S9.6, S5.8, S7.9.3. |

### Workflow, State Machine, and Messaging

| Ref | Standard / specification | Position | Used in this specification |
|---|---|---|---|
| **[BPMN2]** | Business Process Model and Notation 2.0. Object Management Group (OMG). Defines the diagram notation used for all workflow diagrams in this specification. | ADOPT | All state machine diagrams (BPD-01 through BPD-10). BPMN notation rules defined in Appendix C. Referenced in S1.5. |
| **[XSTATE5]** | XState v5. TypeScript state machine and statechart library. The runtime execution format for the Layer 3 state machine. Runs in browser, edge (Deno/V8 isolate), and Node.js. | ADOPT | Booking Object state machine runtime. BOOKING_SUSPENDED parallel state model. XState v5 mapping in Appendix C.6. Referenced in S1.5. |
| **[ASYNCAPI3]** | AsyncAPI 3.0. AsyncAPI Initiative. Defines the asynchronous messaging format for IPC channel event delivery between parties. | ADOPT | Inter-Party Communication (IPC) channel (OS function 5). Supplier confirmation notification. HEM handler dispatch. Referenced in Architecture Specification v0.2. |
| **[ISO8601]** | ISO 8601:2019. International Organisation for Standardisation. Defines date, time, and duration notation. Duration format PT[n]M/H/D used for all timeout values in this specification. | ADOPT | All timeout values throughout S3–S11. Audit trail timestamps. Event log entries. Referenced in S11 throughout. |
| **[UUIDV7]** | UUID Version 7. IETF RFC 9562. Time-ordered UUID format used for booking_id assignment on Booking Object creation. | ADOPT | booking_id field on all Booking Objects. Referenced in S3.1.5. |

### Travel Industry Standards

| Ref | Standard / specification | Position | Used in this specification |
|---|---|---|---|
| **[IATA-NDC]** | IATA New Distribution Capability (NDC) and One Order. IATA. Defines airline distribution messaging standards. The Activity Travel Protocol bridges to NDC for airline-connected components. | BRIDGE | IROPS category code (iata_irops_category_code in SourceSignalRecord SAR-18). FlightComponent reserved for Layer 2. Referenced in S4.2.2, S8.5. |
| **[IATA-735d]** | IATA Resolution 735d. IATA. Defines airline welfare obligations for stranded or significantly delayed passengers. | BRIDGE | Welfare obligations surfaced to duty-of-care Party during IROPS disruption handling. Referenced in S7.8.2, S8.5.3. |
| **[OTA]** | OpenTravel Alliance 2.0 message specifications. OpenTravel Alliance. Defines travel industry XML/JSON message formats. The Activity Travel Protocol bridges at Capability Declaration level. | BRIDGE | Capability Declaration ↔ OTA message mapping (Layer 2 concern). Referenced in Standards Positions document. Not used directly in Layer 3 state machine. |
| **[CAAM]** | draft-barney-caam-00. IETF Internet-Draft. Consumer Attribute and Authentication Mechanisms. Defines act-claim model for identity assertions. | BRIDGE | Trust Chain ↔ act-claim mapping deferred to CAAM Bridge Specification (OQ-SL-1 CLOSED/DEFERRED). Referenced in S13. |

### Observability and Telemetry

| Ref | Standard / specification | Position | Used in this specification |
|---|---|---|---|
| **[OTEL]** | OpenTelemetry. CNCF Graduated Project. Defines the observability framework for distributed tracing, metrics, and logging. | ADOPT | Protocol runtime observability. Event log telemetry. Referenced in Architecture Specification v0.2 Section 5. |
| **[MCP]** | Model Context Protocol. Anthropic. Defines the server protocol for AI model tool integration. atp-mcp ships as a first-class Layer 1 deliverable. | ADOPT | AI agent invocation interface. atp-mcp package (first-class protocol deliverable). MCP server as primary AI agent integration point. Referenced in S9, Architecture Specification v0.2. |

## 2.2 Internal Normative References

The following Activity Travel Protocol documents are normatively referenced by this specification. Layer 3 does not restate definitions from these documents — it references them by document name and section. Implementations must obtain and apply the referenced documents.

| Document | Full title | Role in this specification |
|---|---|---|
| **Architecture Spec v0.2** | Activity Travel Protocol Architecture Specification v0.2 | Defines the 12 OS functions (Kernel-mode and User-mode), the Security Kernel execution order, the Booking Object runtime model (UUID v7, XState v5, append-only event log), the three-tier scaling model, the cloud-agnostic principle, and the eight journey phases. Layer 3 implements the state machine; this document defines the runtime it runs on. |
| **Context Package Step 6** | Activity Travel Protocol Context Package Specification Step 6 (SAR-1 through SAR-21) | Defines the Context Package schema (SAR-1 through SAR-18), the Decision Object schema, the AgentAuthorityDeclaration, the named protocol event schemas (SAR-19 SUPPLIER_FAILURE_AT_DELIVERY, SAR-20 TRAVELER_FOUND, SAR-21 RECOVERED), and the DT enum extensibility model. The authoritative source for all AI agent participation schemas used in Layer 3. |
| **Security Architecture v1** | Activity Travel Protocol Security Architecture v1 | Defines the TRAVELER_UNREACHABLE escalation chains (TU-1 through TU-6), BOOKING_SUSPENDED entry and exit conditions (C-BS-1/2/3), the SUPPLIER_FAILURE_AT_DELIVERY incident taxonomy (SF-1/2/3), TravelerWellnessStatus model (W0–W4), the C1 autonomous incident reversal window, SSF integration, and the Human Escalation Manager model (T-5-A through T-5-D). Layer 3 references these definitions; this document is the authoritative source. |
| **Pre-Layer 3 Review** | Activity Travel Protocol Pre-Layer 3 Consistency Review v1 | Resolves five latent architectural tensions (T-1 through T-5) and produces 17 design rules (T-1-A through T-5-D) that this specification is required to follow. Establishes the DT enum extensibility model, the Kernel/user sanitisation boundary, the identity_tier forward-compatibility approach, the BOOKING_SUSPENDED parallel state model, and the HEM mandatory presence rule. The authority_scope NEGOTIATION for DT-3 is defined in this document. |

## 2.3 Definitions

The following terms are used normatively in this specification. Where a term is defined in an external standard or an internal Activity Travel Protocol document, the definition here is the Layer 3 application of that term — it does not supersede the source definition.

**Activity Component** — A single supplier's contribution to a Booking Object, representing one booked service (accommodation, transport leg, activity, dining reservation, etc.). Each Activity Component is assigned to exactly one Fulfilling Party and carries its own fulfillment status (PENDING, FULFILLING, FULFILLED, FAILED, CANCELLED).

**ASSEMBLY POINT** — A mandatory Kernel-mode operation that precedes every AI agent invocation in the protocol. Appears in the KERNEL swimlane of BPMN diagrams. Responsible for assembling and signing the Context Package delivered to the agent. No agent invocation may occur without a preceding ASSEMBLY POINT.

**Booking Object** — The fundamental runtime entity of the Activity Travel Protocol. A Booking Object is created on INQUIRY entry, assigned a UUID v7 booking_id on submission, and persists through to a terminal state. It carries the complete booking state, journey phase, Activity Component inventory, event log, and duty-of-care record.

**Booking Party** — The party that creates and holds a Booking Object. Responsible for the booking lifecycle from INQUIRY through COMPLETION. Holds duty of care in pre-journey and transit phases. Defined in Layer 1 Party Registry Specification.

**BOOKING_SUSPENDED** — A cross-cutting parallel state modifier that may overlay any active booking state or journey phase. Entered only on one of three authority-gated conditions (C-BS-1, C-BS-2, C-BS-3). While active: all autonomous agent actions halt, all state machine transitions freeze, no decision objects are accepted. Exited only via three authority-gated paths (Path A, Path B, Path C). Specified in full in Section 5.

**C1 window** — The 15-minute autonomous incident reversal window opened on every DT-4 declaration. During the C1 window, reversible downstream actions are held and irreversible actions are blocked. The declaring agent may reverse the declaration within PT15M without audit consequence. The C1 window is frozen when an SSF revocation event arrives during the window.

**Carrier Party** — A Fulfilling Party that operates a transit leg (airline, rail operator, ferry, ground transport). Holds duty of care for the specific leg it operates during OUTBOUND_TRANSIT or RETURN_TRANSIT.

**Context Package** — The signed, sanitised JSON document assembled by the Security Kernel at an ASSEMBLY POINT and delivered to an AI agent. Contains current Booking Object state, applicable ODRL policy set, TravelerContext (at the permitted identity_tier), feasibility constraints, and decision history. Schema defined in Context Package Specification Step 6 (SAR-1 through SAR-18).

**Coordination Delegation** — A W3C VC 2.0 credential issued by the Host Party, naming exactly two Fulfilling Parties as subjects, scoped to one or more Activity Components, and valid for a defined phase window. Enables direct inter-supplier coordination without routing all communication through the Host Party. Specified in Section 12.4.

**Decision Object** — The signed JSON response returned by an AI agent following Context Package consumption. Contains proposed_action, reasoning, confidence, alternatives_considered, human_escalation_requested, and decision_object_signature. Schema defined in Context Package Specification Step 6 Section 7.

**Decision Type (DT)** — An enumerated category of AI agent decision, from DT-1 (INFORMATION_PROVISION) through DT-6 (COMPLETION_ACKNOWLEDGEMENT). Each Decision Type has a defined authority scope requirement, human confirmation rule, and assembly trigger. Defined in full in Appendix A.

**Duty of care** — The active obligation of a Party to monitor the traveler's welfare, respond to incidents, and take protective action where required. Duty of care is assigned to a specific Party at all times during the booking lifecycle. Its holder changes at defined handoff points recorded in the event log as Kernel operations.

**Fulfilling Party** — A Party responsible for delivering one or more Activity Components. Holds duty of care during ACTIVITY_FULFILLMENT for the component(s) it is fulfilling. May be a Host Party, Carrier Party, or specialist activity operator.

**HOLD_AND_PRESERVE** — An instruction applied to an Activity Component or downstream booking action when the protocol requires a pause without cancellation. A component on HOLD_AND_PRESERVE is not advanced, not cancelled, and not modified until the hold is explicitly released by an authorised party.

**Host Party** — The primary supplier at a destination, typically an accommodation provider or tour operator. Receives duty of care transfer at ARRIVAL. Acts as trust anchor for the multi-party coordination model in Section 12.

**Human Escalation Manager (HEM)** — The kernel-gated, user-mode component responsible for dispatching escalation events to human actors. The protocol specifies trigger conditions and execution gates. Handler implementation (channel, notification format, confirmation UI, handler_type) is application responsibility. Specified in Section 6.

**IN_JOURNEY** — The booking state entered when the traveler departs. Within IN_JOURNEY, the Booking Object tracks one of eight journey phases (Section 4). IN_JOURNEY is not a single undifferentiated state — it is a state that carries phase context.

**identity_tier** — The level of traveler identity verification declared by the Booking Party at booking creation (T1 minimum; T2 and T3 require additional verified fields). Controls which TravelerContext fields are assembled into the Context Package. Defined in Party Registry Specification and Context Package Specification Step 6.

**Jurisdiction Registry** — The protocol's registry of jurisdiction-specific compliance rules, emergency service contacts, and regulatory authority endpoints. Consulted at ASSEMBLY POINT for applicable policy sets and at TRAVELER_UNREACHABLE escalation for authority contacts.

**Kernel Scheduler** — OS function 3. Enforces all timeout values defined in Section 11. Timeout events are state transitions — they go through the Policy Engine and produce event log entries. Timeout clocks are frozen when BOOKING_SUSPENDED is active.

**named protocol event** — A first-class protocol event with its own schema, authority gate, and state effects. Cannot be implemented as a simple field update. The seven named protocol events in Layer 3 are: TRAVELER_FOUND, RECOVERED, SUPPLIER_FAILURE_AT_DELIVERY, DUTY_OF_CARE_TRANSFER_INITIATED, DUTY_OF_CARE_ACCEPTED, COORDINATION_OWNER_ASSIGNED, COORDINATION_DELEGATION_REQUESTED.

**ODRL policy set** — The four-tier set of ODRL policy declarations evaluated by OPA at every Security Kernel transition: Protocol tier, Jurisdiction tier, Party Operational tier, Party Preference tier. ODRL declarations are compiled to Rego at Party registration time.

**PARTY_UNRESPONSIVE** — The active booking state entered when a Party with an active obligation fails to respond within a defined timeout. Carries defined timeout rules and, in some phases, limited autonomous action permissions. Distinct from BOOKING_SUSPENDED: PARTY_UNRESPONSIVE has a timeout mechanism and permits some autonomous action.

**protocol_deadline** — The maximum time allowed for a human actor to respond to a Human Escalation Manager dispatch before secondary escalation. Each HEM invocation entry in Section 6 specifies a protocol_deadline. Values are Party-configurable to tighter bounds only.

**Security Kernel** — The non-bypassable runtime enforcement layer that executes on every state transition. Performs authentication, authorisation, OPA policy evaluation, Trust Chain validation, and AI agent scope validation before any business logic executes. Specified in Architecture Specification v0.2 Section 6 and Security Architecture v1.

**SourceSignalRecord** — The structured record of the external signal that triggered a disruption declaration (SAR-18 in Context Package Specification Step 6). Mandatory for DT-4 declarations — a DT-4 Decision Object without a valid source_signal_reference resolving to an event log entry is rejected by the Security Kernel.

**Synchronisation Point** — A Kernel-enforced gate in a multi-party booking that requires one or more Activity Components to reach a defined status before the booking may advance. Named Synchronisation Points are declared in the Booking Object. Unnamed components are concurrent by default. Specified in Section 12.5.

**TRAVELER_PII** — Personally identifiable information fields on the TravelerContext, subject to AES-256-GCM encryption at rest from PENDING_CONFIRMATION onwards and jurisdiction-specific retention deadlines. Access rules are enforced at ASSEMBLY POINT — the agent receives only the fields permitted at the declared identity_tier.

**TRAVELER_UNREACHABLE** — The protocol condition entered when a traveler cannot be reached by the duty-of-care Party. Six sub-categories are defined (TU-1 through TU-6), each with distinct severity, autonomous action permissions, and HEM invocation requirements. Specified in full in Security Architecture v1; workflow interactions specified in Section 7.

**TravelerWellnessStatus** — The structured model of a traveler's health and welfare state during the booking lifecycle. Five levels: W0 (no declared condition), W1 (pre-existing condition, stable), W2 (active wellness event), W3 (wellness support package), W4 (disability/reduced mobility). Defined in Security Architecture v1.

**Trust Chain** — The cryptographically verified chain of trust from a Party to the protocol root, established via OpenID Federation 1.0. Required for all state transitions. The Trust Chain model is defined in Trust Chain Declaration Spec v0.1.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 2 — March 2026*
