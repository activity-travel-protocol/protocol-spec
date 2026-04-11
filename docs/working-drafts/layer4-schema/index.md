# Layer 4 Schema and SDK

*Track 3 Session 6 · April 2026 · Apache 2.0*

**Sections:** [REST Surface Contract](rest-api) · [OQ Resolutions](resolutions) · [Decisions](decisions)

**Activity Travel Protocol**

**Layer 4 Schema and SDK**

*ATP_Layer4_Schema_v1.docx · Track 3 Session 6*

  **Governed**    Activity Travel Protocol Foundation (in formation /

+-----------------------------------------------------------------------+
| **Purpose**                                                           |
|                                                                       |
| This document is the output of Track 3 Session 6. It specifies: (1)   |
| the @atp/core TypeScript type surface for Layer 4; (2) the OpenAPI   |
| 3.1 REST surface contract; (3) the @atp/ai-agent package design      |
| including the ATPAgentProvider interface; (4) resolution of OQ-MCP-3  |
| (HEM-MANDATE-01 catalogue addition); (5) resolution of OQ-AS-3 full   |
| field-level OCTO v2 → Activity Configuration Schema mapping; (6) the  |
| Activity Category Registry publication specification at               |
| activitytravel.pro/registry/. The Fletcher Embassy pattern (OQ-MCP-2  |
| / @atp/security) is scoped as a standing open question pending       |
| further design collaboration with George Fletcher.                    |
+-----------------------------------------------------------------------+

## 1. Context and Foundations

This session builds on six completed prior Track 3 deliverables:
ATP_TechStack_v2.docx (13 decisions), ATP_SDK_Architecture_v2.docx (DI
model, package structure, HAB interfaces), ATP_RefImpl_MyAuberge_v1.docx
(Booking Object schema, Japan regulatory classification),
ATP_ActivitySchema_v1.docx (three-layer schema model, 15-fragment
library, six-category Starter Catalogue), ATP_MCPServer_v1.docx (eight
MCP tools, ATP Mandate Model, NeMo Guardrails), and
ATP_MCPServer_v1_Addendum.docx (Windley Loop, Prompt Library).

All decisions recorded in those documents are confirmed and not
revisited here. The following inputs from the pre-session design
discussion are adopted as normative design constraints for this
document:

-   **AI Agent:** The ATP AI Agent is a MyAuberge-hosted managed
    service, not an adopter-built component. Tier 1 OSS adopters receive
    the ATPAgentProvider interface with a general LLM fallback. Tier 2+
    adopters call the MyAuberge-hosted NVIDIA NIM endpoint.

-   **Training:** No model training is required at v1.0. The
    @atp/llms-tooling Prompt Library (ATP_PromptLibrary_v1.docx) is the
    behavioural specification injected at inference time. Fine-tuning is
    a post-v1.0 optimisation driven by production booking trace data.

-   **Kernel:** The Security Kernel is CPU-bound deterministic policy
    logic (Cedar + XState v5). It has no GPU dependency and a separate
    scaling profile from AI inference. This is a normative architectural
    constraint reflected in the DI model (IAgentRuntime vs. Security
    Kernel are distinct components).

## 2. @atp/core — TypeScript Type Surface

### 2.1 Design Principles

The @atp/core package is the single source of truth for all Activity
Travel Protocol types. Every other SDK package imports from @atp/core
and from nowhere else for protocol types. This creates a strict
dependency hierarchy: @atp/core has zero SDK dependencies; all other
packages depend on it.

Three principles govern the type design:

-   Branded primitives over raw strings. Every identifier type
    (BookingObjectId, SupplierId, MandateId, etc.) is a branded
    TypeScript type. This makes it impossible to accidentally pass a
    SupplierId where a BookingObjectId is expected at compile time.

-   Discriminated unions throughout. Every polymorphic type uses a
    discriminant field (type, category, status, mode) that TypeScript
    can narrow exhaustively. No untyped object or any in the public
    surface.

-   Schema-first, not class-first. Types are plain TypeScript interfaces
    derived from the JSON Schema specification (Section 3). No class
    hierarchies. No inheritance. Composition via intersection types
    mirrors the fragment composition model in the Activity Configuration
    Schema.

### 2.2 Branded Primitive Types

The following branded primitive types constitute the identity layer of
@atp/core. All are string brands unless otherwise noted.

  ------------------------------------------------------------------------
  **Type**              **Base**        **Description**
  **BookingObjectId**   UUID v7 string  Unique identifier for a Booking
                                        Object instance. UUID v7 ensures
                                        time-sortable ordering for
                                        append-only event log queries.

  **SupplierId**        UUID v7 string  Identifier for a registered
                                        supplier in the ATP participant
                                        registry.

  **OperatorId**        UUID v7 string  Identifier for a registered
                                        operator (travel agent or OTA
                                        acting as package operator).

  **GuestId**           UUID v7 string  Identifier for a guest participant
                                        record within a Booking Object.

  **MandateId**         UUID v7 string  Identifier for an ATP Mandate JWT.
                                        Bound to a single BookingObjectId
                                        via the booking_object_id claim.

  **AgentId**           UUID v7 string  Identifier for an AI agent
                                        instance participating in a
                                        Booking Object session.

  **CategoryId**        string          SCREAMING_SNAKE_CASE Activity
                                        Category Registry identifier. E.g.
                                        SKI_ALPINE, FARM_EXPERIENCE.

  **FragmentId**        string          Fragment Library identifier. E.g.
                                        SeasonalAvailability,
                                        CapacityModel.

  **SchemaVersion**     semver string   Protocol schema version in
                                        MAJOR.MINOR.PATCH semver format.

  **ISO8601Date**       string          Date in ISO 8601 format YYYY-MM-DD
                                        or year-agnostic \--MM-DD for
                                        seasonal fields.

  **ISO8601DateTime**   string          Datetime in ISO 8601 format with
                                        timezone offset. E.g.
                                        2026-04-08T09:00:00+09:00.

  **ISO8601Duration**   string          Duration in ISO 8601 format. E.g.
                                        PT2H for two hours, P1D for one
                                        day.

  **ISO3166Alpha2**     string          Two-letter country code per ISO
                                        3166-1 alpha-2. E.g. JP, SG, GB.

  **ISO4217**           string          Three-letter currency code per ISO
                                        4217. E.g. JPY, USD, EUR.

  **LanguageTag**       string          BCP 47 language tag. E.g. ja-JP,
                                        en-US.
  ------------------------------------------------------------------------

### 2.3 Booking Object Type

The BookingObject interface is the central runtime entity. All other
types either compose into it or reference it by BookingObjectId.

> // @atp/core — BookingObject
>
> export interface BookingObject {
>
> readonly id: BookingObjectId;
>
> readonly created_at: ISO8601DateTime;
>
> readonly updated_at: ISO8601DateTime;
>
> readonly schema_version: SchemaVersion;
>
> // Participants
>
> readonly operator_id: OperatorId;
>
> readonly supplier_ids: ReadonlyArray\<SupplierId\>;
>
> readonly guest_ids: ReadonlyArray\<GuestId\>;
>
> // State machine
>
> readonly state: BookingObjectState;
>
> readonly state_history: ReadonlyArray\<StateTransitionEvent\>;
>
> // Activity configuration
>
> readonly category: CategoryId;
>
> readonly capability: ActivityCapability;
>
> readonly configuration: ActivityConfiguration;
>
> readonly collection: ActivityCollection \| null;
>
> // Policy and trust
>
> readonly mandate_id: MandateId \| null;
>
> readonly jurisdiction_routing: JurisdictionRoutingHint;
>
> readonly regulatory_class: RegulatoryClass;
>
> // Payment
>
> readonly payment: PaymentObject;
>
> // Flags
>
> readonly availability_verified: boolean;
>
> readonly safety_acknowledged: boolean;
>
> readonly hem_escalation_active: boolean;
>
> }

### 2.4 Booking Object State Machine Types

The BookingObjectState type is a discriminated union covering all states
in the XState v5 state machine. State transitions are recorded as
append-only StateTransitionEvent entries in the IEventLog.

> export type BookingObjectState =
>
> \| 'ENQUIRY'
>
> \| 'AVAILABILITY_CHECK'
>
> \| 'CONFIGURATION'
>
> \| 'NEGOTIATION'
>
> \| 'PENDING_CONFIRMATION'
>
> \| 'CONFIRMED'
>
> \| 'PRE_JOURNEY'
>
> \| 'IN_JOURNEY'
>
> \| 'POST_JOURNEY'
>
> \| 'CANCELLED'
>
> \| 'DISPUTED'
>
> \| 'ARCHIVED';
>
> export interface StateTransitionEvent {
>
> readonly event_id: string;
>
> readonly from_state: BookingObjectState;
>
> readonly to_state: BookingObjectState;
>
> readonly triggered_by: AgentId \| 'HUMAN' \| 'SYSTEM';
>
> readonly mandate_id: MandateId \| null;
>
> readonly timestamp: ISO8601DateTime;
>
> readonly cedar_action: string;
>
> readonly hem_scenario_id: HEMScenarioId \| null;
>
> }

### 2.5 Activity Configuration Schema Types

The three-layer Activity Configuration Schema (S3.5-1, CLOSED) is
represented as three generic interfaces parameterised by CategoryId. The
discriminated union is resolved at runtime via the Activity Category
Registry (Section 5).

> // Generic three-layer schema — parameterised by category
>
> export interface ActivityCapability\<C extends CategoryId =
> CategoryId\> {
>
> readonly category: C;
>
> readonly schema_version: SchemaVersion;
>
> readonly supplier_id: SupplierId;
>
> // Category-specific fields resolved by registry discriminant
>
> readonly \[key: string\]: unknown;
>
> }
>
> export interface ActivityConfiguration\<C extends CategoryId =
> CategoryId\> {
>
> readonly category: C;
>
> readonly schema_version: SchemaVersion;
>
> readonly operator_id: OperatorId;
>
> readonly \[key: string\]: unknown;
>
> }
>
> export interface ActivityCollection\<C extends CategoryId =
> CategoryId\> {
>
> readonly category: C;
>
> readonly schema_version: SchemaVersion;
>
> readonly guest_id: GuestId;
>
> readonly collected_at: ISO8601DateTime;
>
> readonly \[key: string\]: unknown;
>
> }
>
> **※** *Concrete typed variants (e.g. SkiAlpineCapability,
> FarmExperienceCollection) are generated from JSON Schema by
> @atp/core's build pipeline and exported as named types. Adopters
> import the concrete type for their category; the generic form is used
> by SDK internals that handle all categories.*

### 2.6 ATP Mandate Types

The ATP Mandate Model (MCP-D1 through MCP-D6, CLOSED) is represented by
the following types. The ATPMandate interface maps to the Ed25519-signed
JWT payload. Cedar policy sets are represented as opaque strings ---
evaluation is delegated to @clawdreyhepburn/ovid-me (Cedarling/WASM).

> export interface ATPMandate {
>
> readonly jti: MandateId;
>
> readonly iss: string; // Issuer — operator or sub-agent
>
> readonly sub: AgentId; // Subject — the agent holding the mandate
>
> readonly aud: string; // ATP MCP Server endpoint
>
> readonly iat: number; // Issued at (Unix timestamp)
>
> readonly exp: number; // Expiry (Unix timestamp)
>
> readonly booking_object_id: BookingObjectId; // Object-instance
> binding (MCP-D1)
>
> readonly scope: ReadonlyArray\<ATPAuthorityScope\>;
>
> readonly cedar_policy_set: string; // Opaque Cedar policy set
>
> readonly parent_mandate_id: MandateId \| null; // Delegation chain
>
> }
>
> export type ATPAuthorityScope =
>
> \| 'BOOKING_READ' \| 'BOOKING_WRITE'
>
> \| 'CONTEXT_READ' \| 'NOTIFICATION_SEND'
>
> \| 'PAYMENT_READ' \| 'PAYMENT_WRITE'
>
> \| 'SAFETY_WRITE' \| 'ADMIN';

### 2.7 HEM Scenario Types

The Human Escalation Manager catalogue (ATP_MCPServer_v1.docx, Section
5) is represented as a discriminated union of 23 defined scenario types
plus the new HEM-MANDATE-01 addition resolved in Section 4 of this
document (OQ-MCP-3).

> export type HEMScenarioId =
>
> // Original 23 scenarios (ATP_MCPServer_v1.docx)
>
> \| 'HEM-CANCEL-01' \| 'HEM-CANCEL-02' \| 'HEM-CANCEL-03'
>
> \| 'HEM-REFUND-01' \| 'HEM-REFUND-02'
>
> \| 'HEM-MEDICAL-01' \| 'HEM-MEDICAL-02' \| 'HEM-MEDICAL-03'
>
> \| 'HEM-SAFETY-01' \| 'HEM-SAFETY-02'
>
> \| 'HEM-DISRUPT-01' \| 'HEM-DISRUPT-02' \| 'HEM-DISRUPT-03'
>
> \| 'HEM-LEGAL-01' \| 'HEM-LEGAL-02'
>
> \| 'HEM-PAYMENT-01' \| 'HEM-PAYMENT-02'
>
> \| 'HEM-CONSENT-01' \| 'HEM-CONSENT-02'
>
> \| 'HEM-MINOR-01'
>
> \| 'HEM-SUPPLIER-01' \| 'HEM-SUPPLIER-02'
>
> \| 'HEM-FORCE-01'
>
> // New — Session 6 (OQ-MCP-3 resolved)
>
> \| 'HEM-MANDATE-01';
>
> export interface HEMEscalation {
>
> readonly scenario_id: HEMScenarioId;
>
> readonly booking_object_id: BookingObjectId;
>
> readonly trigger_reason: string;
>
> readonly triggered_by: AgentId \| 'SYSTEM';
>
> readonly triggered_at: ISO8601DateTime;
>
> readonly context_package: ContextPackage;
>
> readonly resolution: HEMResolution \| null;
>
> }
>
> export interface HEMResolution {
>
> readonly resolved_by: string; // Human operator identity
>
> readonly resolved_at: ISO8601DateTime;
>
> readonly decision: 'APPROVED' \| 'REJECTED' \| 'MODIFIED';
>
> readonly notes: string \| null;
>
> }

### 2.8 ATPAgentProvider Interface

The ATPAgentProvider interface is the new @atp/core type introduced in
Session 6 based on the pre-session design discussion. It abstracts over
the hosted NVIDIA NIM endpoint (Tier 2+) and any general LLM provider
(Tier 1 fallback). All agent inference calls in the SDK go through this
interface — no SDK package calls an LLM directly.

> export interface ATPAgentProvider {
>
> /\*\*
>
> \* Execute an ATP agent inference call.
>
> \* The prompt is composed by @atp/llms-tooling before this is called.
>
> \* The provider handles transport, authentication, and response
> parsing.
>
> \*/
>
> complete(request: ATPAgentRequest): Promise\<ATPAgentResponse\>;
>
> /\*\* Provider identity — used in audit log entries. \*/
>
> readonly provider_id: string;
>
> /\*\* Tier — determines which NeMo Guardrails rails are applied. \*/
>
> readonly tier: 'TIER_1' \| 'TIER_2' \| 'TIER_3';
>
> }
>
> export interface ATPAgentRequest {
>
> readonly booking_object_id: BookingObjectId;
>
> readonly mandate_id: MandateId;
>
> readonly windley_context: string; // Rendered by @atp/llms-tooling
>
> readonly persona_template: string; // Rendered by @atp/llms-tooling
>
> readonly user_message: string;
>
> readonly conversation_history: ReadonlyArray\<ConversationTurn\>;
>
> }
>
> export interface ATPAgentResponse {
>
> readonly content: string;
>
> readonly tool_calls: ReadonlyArray\<ATPToolCall\>;
>
> readonly hem_triggered: boolean;
>
> readonly hem_scenario_id: HEMScenarioId \| null;
>
> readonly provider_id: string;
>
> readonly latency_ms: number;
>
> }

+-----------------------------------------------------------------------+
| **DECISION L4-1**                                                     |
|                                                                       |
| The ATPAgentProvider interface is the normative abstraction for all   |
| AI inference calls in the Activity Travel Protocol SDK. No SDK        |
| package invokes an LLM endpoint directly. Built-in implementations:   |
| AnthropicAgentProvider (TIER_1 default, maps to IAgentRuntime:        |
| AnthropicAgentRuntime in DI model), NIMAgentProvider (TIER_2/3, calls |
| MyAuberge-hosted NVIDIA NIM endpoint). The provider_id field is       |
| logged in every StateTransitionEvent for full audit traceability.     |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DECISION L4-2**                                                     |
|                                                                       |
| No model training is required at v1.0. The @atp/llms-tooling Prompt  |
| Library is the behavioural specification for ATP-compliant agent      |
| behaviour. Fine-tuning a domain-specific model (Nemotron variant at   |
| 8B--13B parameters) is a post-v1.0 MyAuberge IaaS optimisation,       |
| triggered when production booking trace volume makes training data    |
| available and inference cost reduction justifies the work. This       |
| decision is CLOSED.                                                   |
+-----------------------------------------------------------------------+

### 2.9 Payment Object Types

The PaymentObject type covers the split-seller payment model specified
in ATP_RefImpl_MyAuberge_v1.docx. This is a Layer 4 schema gap
identified in ATP_SDK_Architecture_v2.docx Appendix A and is resolved
here.

> export interface PaymentObject {
>
> readonly booking_object_id: BookingObjectId;
>
> readonly currency: ISO4217;
>
> readonly total_amount: number; // Minor currency units
>
> readonly pricing_snapshot: PricingSnapshot;
>
> readonly payment_state: PaymentState;
>
> readonly split_seller_model: SplitSellerRecord\[\];
>
> readonly tax_records: TaxRecord\[\];
>
> readonly refund_state: RefundState \| null;
>
> }
>
> export type PaymentState =
>
> \| 'UNPAID' \| 'DEPOSIT_PAID' \| 'PAID_IN_FULL'
>
> \| 'REFUND_PENDING' \| 'REFUNDED' \| 'DISPUTED';
>
> export interface SplitSellerRecord {
>
> readonly seller_id: SupplierId \| OperatorId;
>
> readonly seller_role: 'OPERATOR_COLLECTING' \| 'SUPPLIER_DIRECT';
>
> readonly amount: number;
>
> readonly currency: ISO4217;
>
> }
>
> export interface TaxRecord {
>
> readonly jurisdiction: ISO3166Alpha2;
>
> readonly tax_type: string; // e.g. 'ACCOMMODATION_TAX',
> 'CONSUMPTION_TAX'
>
> readonly rate_pct: number;
>
> readonly amount: number;
>
> }
