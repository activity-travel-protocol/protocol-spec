# Open Question Resolutions

*Layer 4 Schema and SDK · Sections 4–7*

*OQ-MCP-3 (HEM-MANDATE-01) · OQ-AS-3 (OCTO v2 mapping) · OQ-MCP-2 (Fletcher Embassy status)*

[← REST API](rest-api) · [Decisions →](decisions)

## 4. OQ-MCP-3 Resolution — HEM-MANDATE-01

### 4.1 The Question

OQ-MCP-3 (opened in Track 3 Session 5A): Should HEM-MANDATE-01 ---
mandate gap escalation triggered by MANDATE_GAP_DETECTED — be added to
the formal HEM scenario catalogue in ATP_MCPServer_v1_Addendum.docx?

### 4.2 Analysis

The Windley Loop (MCP-D13, CLOSED) specifies that when the Cedar partial
evaluation query detects a residual policy set that cannot be resolved
by the agent's current mandate, the trigger_reason MANDATE_GAP_DETECTED
is set. MCP-D15 specifies that the agent constructs a structured Cedar
action + resource condition request to its parent agent or human
operator.

The question is whether MANDATE_GAP_DETECTED constitutes a HEM
escalation or a separate intra-agent protocol event. The distinction
matters because HEM escalations: (1) set hem_escalation_active: true on
the Booking Object; (2) block all further state transitions until
resolved; (3) are logged as HEMEscalation records; (4) require a formal
HEMResolution from a human operator.

MANDATE_GAP_DETECTED should always result in a HEM escalation when it
cannot be resolved by a parent agent within one delegation hop. The
rationale: an agent that cannot determine whether it is authorised to
act is in an indeterminate state. Allowing it to continue acting ---
even conservatively — risks violating the CONFIRMATION hard cap
(DR-v6-D5). The correct resolution is always to surface to a human, with
full context, and await explicit authorisation.

### 4.3 Resolution

+-----------------------------------------------------------------------+
| **OQ-MCP-3 — RESOLVED — CLOSED**                                  |
|                                                                       |
| HEM-MANDATE-01 is added to the HEM scenario catalogue as the 24th     |
| scenario. Trigger condition: MANDATE_GAP_DETECTED during Windley Loop |
| Cedar partial evaluation, unresolved after one parent delegation hop  |
| or when no parent agent is available. Effect: hem_escalation_active   |
| set to true; all Booking Object state transitions blocked;            |
| HEMEscalation record created with trigger_reason:                     |
| MANDATE_GAP_DETECTED and the structured Cedar action + resource       |
| condition as context_package content. Resolution requires human       |
| operator with ADMIN scope to issue a mandate extension or confirm the |
| action directly.                                                      |
+-----------------------------------------------------------------------+

The HEM-MANDATE-01 scenario specification is as follows:

  **HEM-MANDATE-01    
  — Mandate Gap     
  Escalation**        

  **Scenario ID**     HEM-MANDATE-01

  **Category**        Authorisation

  **Trigger**         MANDATE_GAP_DETECTED during Windley Loop Cedar partial
                      evaluation. Unresolvable by parent agent in one hop,
                      or no parent agent available.

  **Reversibility**   REVERSIBLE — no state change has occurred at trigger
                      time. The Booking Object remains in its pre-trigger
                      state.

  **HEM block**       All state transitions blocked. hem_escalation_active:
                      true.

  **Context package** Includes: the Cedar action requested; the resource
                      (BookingObjectId + state); the residual policy set;
                      the current mandate_id; the agent_id; conversation
                      history since last confirmed state.

  **Resolution path** Human operator reviews context package. Options: (a)
                      issue a mandate extension via POST /mandates covering
                      the requested action; (b) confirm the action directly
                      via POST /booking-objects/{id}/hem/resolve with
                      decision: APPROVED; (c) reject with decision:
                      REJECTED, triggering agent notification.

  **NeMo Rail**       NeMo Guardrails Rail 3 (Scope Boundary) fires on
                      MANDATE_GAP_DETECTED before Windley Loop escalation
                      — belt-and-suspenders.

**5. OQ-AS-3 Resolution — OCTO v2 → Activity Configuration Schema
Mapping**

### 5.1 Status

OQ-AS-3 was partially resolved in Track 3 Session 5B (PL-D6, CLOSED
partial): the OCTO v2 product type → ATP Activity Category mapping table
was produced. Full field-level mapping was deferred to this session.

### 5.2 Complete Field-Level Mapping

The following table provides the full field-level mapping between OCTO
v2 product schema fields and their Activity Travel Protocol equivalents.
This mapping is implemented in the @atp/bridge-octo package as a
normative transformation layer.

  --------------------------------------------------------------------------------------------------------------------------
  **OCTO v2 Field**                        **ATP Equivalent**                         **Layer**    **Notes**
  product.id                               SupplierId                                 Identity     OCTO product.id maps to
                                                                                                   the ATP SupplierId for
                                                                                                   the activity supplier.

  product.internalName                     capability.display_name_en                 Capability   Internal name used as
                                                                                                   English display name in
                                                                                                   ATP registry.

  product.locale\[\].name                  capability.display_name\_{lang}            Capability   Per-locale name mapped to
                                                                                                   ATP LanguageTag-keyed
                                                                                                   display name fields.

  product.availabilityType                 CapacityModel.inventory_feed_supported     Capability   START_TIME →
                                                                                                   session-based;
                                                                                                   OPENING_HOURS →
                                                                                                   continuous; PASS → no
                                                                                                   feed.

  option.id                                CategoryId (discriminant)                  Capability   OCTO option maps to an
                                                                                                   ATP category. The
                                                                                                   @atp/bridge-octo
                                                                                                   maintains the option_id →
                                                                                                   CategoryId mapping table.

  option.restrictions.minAge               AgeEligibility.minimum_age_years           Capability   Direct numeric mapping.

  option.restrictions.maxAge               AgeEligibility.maximum_age_years           Capability   Direct numeric mapping.

  option.units\[\].type                    ParticipantType enum                       Capability   ADULT, CHILD, INFANT map
                                                                                                   to ATP ParticipantType.
                                                                                                   YOUTH mapped to CHILD.

  availability.localDateTimeStart          SeasonalAvailability.session_start_times   Capability   HH:MM extracted and
                                                                                                   deduplicated across
                                                                                                   availability windows.

  availability.vacancies                   CapacityModel.max_participants             Capability   Maximum vacancies across
                                                                                                   all availability windows.

  booking.unitItems\[\].unitId             GuestId\[\] participant records            Collection   Each OCTO unitItem maps
                                                                                                   to one ATP Guest
                                                                                                   participant record.

  booking.contact.fullName                 guest.full_name                            Collection   Direct string mapping.

  booking.contact.emailAddress             guest.email_address                        Collection   Typed as EmailAddress
                                                                                                   branded primitive.

  booking.contact.phoneNumber              guest.phone_number                         Collection   Typed as PhoneNumber
                                                                                                   branded primitive.

  booking.unitItems\[\].contact.fullName   participant.full_name                      Collection   Per-participant name
                                                                                                   within Collection layer.

  booking.status                           BookingObjectState                         State        ON_HOLD →
                                                                                                   PENDING_CONFIRMATION;
                                                                                                   CONFIRMED → CONFIRMED;
                                                                                                   CANCELLED → CANCELLED.
                                                                                                   OCTO has no PRE_JOURNEY
                                                                                                   or IN_JOURNEY equivalent.

  booking.price.original                   PaymentObject.total_amount                 Payment      OCTO original price maps
                                                                                                   to ATP total before
                                                                                                   discount. Currency from
                                                                                                   booking.price.currency.

  booking.cancellationCutoff               PricingRule cancellation condition         Payment      OCTO cutoff timestamp
                                                                                                   converted to
                                                                                                   ISO8601Duration relative
                                                                                                   to session start.

  product.capabilities\[\]                 @atp/bridge-octo feature flags            Bridge       OCTO capability strings
                                                                                                   (PRICING, PICKUPS, OFFERS
                                                                                                   etc.) determine which ATP
                                                                                                   fragments are populated
                                                                                                   by the bridge.
  --------------------------------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **OQ-AS-3 — RESOLVED — CLOSED**                                   |
|                                                                       |
| Full field-level OCTO v2 → ATP Activity Configuration Schema mapping  |
| complete (Section 5.2). The mapping is normative for                  |
| @atp/bridge-octo v1.0. Fields without an OCTO equivalent             |
| (SubSupplierDependency, SafetyCompliance, Collection-layer body       |
| measurements, HarvestCalendar) are ATP-native and populated by the    |
| operator at Configuration layer or collected from the guest at        |
| Collection layer. OQ-AS-3: RESOLVED — CLOSED.                       |
+-----------------------------------------------------------------------+

## 6. Activity Category Registry Publication

### 6.1 Publication Specification

The Activity Category Registry is published at
activitytravel.pro/registry/ per decision S3.5-4 (CLOSED). This section
specifies the technical publication format and the AI query interface
(S3.5-11, CLOSED).

+-----------------------------------------------------------------------+
| **DECISION L4-4**                                                     |
|                                                                       |
| The Activity Category Registry is published in two formats: (1)       |
| Human-readable HTML at activitytravel.pro/registry/ —               |
| VitePress-rendered, one page per category, fragment reference list,   |
| schema field tables. (2) Machine-readable JSON-LD at                  |
| activitytravel.pro/registry/index.json — full registry, all         |
| entries, all field descriptions, fragment dependency graph. The       |
| JSON-LD document is the authoritative source for @atp/bridge-octo    |
| and for AI agent category queries. Both formats are generated from a  |
| single YAML source in the protocol-spec repository and auto-deployed  |
| on push to main.                                                      |
+-----------------------------------------------------------------------+

### 6.2 Starter Catalogue Registry Entries

The six Starter Catalogue categories (S3.5-5, CLOSED) are published as
the initial registry content. All six carry status: STARTER.

  -------------------------------------------------------------------------------------
  **category_id**       **display_name_en**   **OCTO           **Key Fragments**
                                              product_type**   
  ACCOMMODATION_ROOM    Accommodation Room    ACCOMMODATION    SeasonalAvailability,
                                                               CapacityModel,
                                                               AgeEligibility,
                                                               PricingRule

  FARM_EXPERIENCE       Farm Experience       TOUR             SeasonalAvailability,
                                                               CapacityModel,
                                                               AgeEligibility,
                                                               SafetyCompliance,
                                                               HarvestCalendar (v2)

  SKI_ALPINE            Alpine Skiing         ACTIVITY         SeasonalAvailability,
                                                               CapacityModel,
                                                               AgeEligibility,
                                                               GroupSizeConstraint,
                                                               GearRental,
                                                               SkillAssessment,
                                                               SubSupplierDependency,
                                                               SafetyCompliance

  CULTURAL_EXPERIENCE   Cultural Experience   TOUR             SeasonalAvailability,
                                                               CapacityModel,
                                                               AgeEligibility,
                                                               GroupSizeConstraint,
                                                               LanguageOptions

  CULINARY_CLASS        Culinary Class        ACTIVITY         SeasonalAvailability,
                                                               CapacityModel,
                                                               AgeEligibility,
                                                               DietaryRequirements,
                                                               SafetyCompliance

  ENTRANCE_TICKET       Entrance Ticket       ATTRACTION       SeasonalAvailability,
                                                               CapacityModel,
                                                               AgeEligibility,
                                                               PricingRule
  -------------------------------------------------------------------------------------

### 6.3 Registry AI Query Interface

The AI query interface at activitytravel.pro/registry/query (S3.5-11,
CLOSED) accepts a natural language query and returns matching registry
entries ranked by relevance. The interface is implemented as a static
JSON-LD search over field description attributes — no LLM inference
required for the query interface itself at v1.0.

> // Example query response — GET
> /registry/query?q=ski+equipment+rental
>
> {
>
> "query": "ski equipment rental",
>
> "matches": \[
>
> {
>
> "category_id": "SKI_ALPINE",
>
> "relevance_score": 0.94,
>
> "matched_fragments": \["GearRental", "SkillAssessment"\],
>
> "description": "Alpine skiing activity including equipment rental,
> skill assessment, and optional instruction.",
>
> "capability_schema_uri":
> "https://activitytravel.pro/schemas/SKI_ALPINE/capability/1.0.0.json"
>
> }
>
> \]
>
> }

## 7. OQ-MCP-2 — Fletcher Embassy Status

### 7.1 Current Status

OQ-MCP-2 (Fletcher Embassy / @atp/security package design) remains
OPEN. The Fletcher Embassy concept — trust boundary translation for
domains that do not speak Cedar — is the subject of ongoing design
engagement with George Fletcher (co-creator) and Sarah Cecchetti (OVID
project).

George Fletcher connected on LinkedIn on 8 April 2026, the same day the
Arc 4 blog posts covering the Windley Loop and mandate delegation were
published. The LinkedIn thread on his December 2025 article on encoding
user intent in agentic AI systems has been engaged with the Activity
Travel Protocol named as a concrete OTA cross-domain use case.

### 7.2 Design Placeholder

The @atp/security package is scoped in the ten-package SDK structure
(PKG-1, CLOSED) and reserved for this pattern. The following design
constraints are established for when the full specification is produced:

-   The Fletcher Embassy pattern addresses domains that cannot evaluate
    Cedar policies natively — e.g. an OTA running a proprietary
    authorisation system, or a supplier using OAuth scopes without
    Cedar.

-   The Embassy acts as a trust boundary translator: it receives an ATP
    Mandate JWT, evaluates the Cedar policy set against its own
    authorisation model, and returns a domain-specific access token or
    confirmation.

-   The @atp/security package will export: FletcherEmbassy interface,
    EmbassyRequest / EmbassyResponse types, and reference
    implementations for OAuth 2.1 scope translation and OpenID Connect
    trust chain verification.

-   The design must not create a bypass path around the Security Kernel.
    Embassy translation produces evidence of authorisation; the Security
    Kernel evaluates that evidence. The two components are
    complementary, not alternatives.

Target: Track 3 Session 7, following George Fletcher's review of Arc 4
blog material and the concrete @atp/core type surface produced in this
session.
