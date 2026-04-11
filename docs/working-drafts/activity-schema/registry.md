# Activity Category Registry

*Activity Configuration Schema Design System · Section 6*

[← UI Generation](ui-generation) · [Decisions →](decisions)

## 6. Activity Category Registry

### 6.1 Registry Model

The Activity Travel Protocol Activity Category Registry follows the IANA
model for protocol registries. The Foundation is the registry authority.
The registry is published at activitytravel.pro/registry/ in
machine-readable JSON-LD format and human-readable HTML. The registry is
versioned alongside the protocol specification.

The IANA model was selected because it is the proven governance model
for extensible protocol registries. It provides: a clear authority
structure (Foundation as IANA equivalent), a defined registration
procedure (Category Proposal process), a published public registry, and
a community contribution pathway that does not require Foundation
involvement for every new integration.

### 6.2 Registry Entry Format

Each registry entry contains the following fields:

  -------------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  category_id                string            REQUIRED          SCREAMING_SNAKE_CASE
                                                                 identifier. Unique
                                                                 within the registry.

  display_name_en            string            REQUIRED          Human-readable name in
                                                                 English.

  display_name_ja            string            OPTIONAL          Human-readable name in
                                                                 Japanese.

  description                string            REQUIRED          Plain English
                                                                 description suitable
                                                                 for AI agent
                                                                 consumption.

  status                     string            REQUIRED          STARTER \| RATIFIED \|
                                                                 EXPERIMENTAL \|
                                                                 DEPRECATED.

  schema_version             string            REQUIRED          Semver. E.g. 1.0.0.

  capability_schema_uri      URI               REQUIRED          JSON Schema URI for
                                                                 the Capability layer.

  configuration_schema_uri   URI               REQUIRED          JSON Schema URI for
                                                                 the Configuration
                                                                 layer.

  collection_schema_uri      URI               REQUIRED          JSON Schema URI for
                                                                 the Collection layer.

  fragment_dependencies      string\[\]        REQUIRED          List of Fragment
                                                                 Library identifiers
                                                                 referenced by this
                                                                 category.

  regulatory_classes         string\[\]        REQUIRED          Permitted
                                                                 regulatory_class
                                                                 values for products of
                                                                 this category.

  starter_catalogue          boolean           REQUIRED          True if this category
                                                                 is a Foundation
                                                                 Starter Catalogue
                                                                 entry.

  octo_product_type          string            OPTIONAL          Corresponding OCTO
                                                                 product type if
                                                                 applicable. Enables
                                                                 OCTO Bridge mapping.

  registered_by              string            REQUIRED          Foundation TSC (for
                                                                 Starter entries) or
                                                                 community submitter
                                                                 identity.

  registered_at              ISO8601DateTime   REQUIRED          Registration
                                                                 timestamp.
  -------------------------------------------------------------------------------------

### 6.3 Registry Status Values

STARTER — Foundation-authored Starter Catalogue entry. Normative. All
SDK implementations must support all STARTER categories.

RATIFIED — Community-submitted category approved by Foundation TSC.
Normative. SDK implementations should support RATIFIED categories.

EXPERIMENTAL — Submitted but not yet reviewed by TSC. Non-normative.
Implementers may support for testing purposes.

DEPRECATED — Superseded by a newer category or removed from the
registry. Implementations should migrate to the replacement category.

### 6.4 Category Proposal Process

Any person or organisation may submit a Category Proposal to the
Foundation. The proposal process follows four stages:

Stage 1 — Submission. The proposer submits a Category Proposal
document to the activity-travel-protocol GitHub organisation as a pull
request on the protocol-spec repository. The proposal must include: the
proposed category_id, a complete Capability schema, Configuration
schema, and Collection schema in JSON Schema format, a list of fragment
dependencies, at least one worked example (real supplier), and a
statement of the regulatory context if relevant.

Stage 2 — Community Review. The pull request is open for community
comment for 30 days. Any Foundation member or registered community
member may comment. The proposer is expected to respond to substantive
comments and revise the proposal accordingly.

Stage 3 — TSC Review. After the community review period, the
Foundation TSC reviews the proposal. The TSC evaluates: schema
correctness, fragment reuse (new fragments should not be created when
existing ones suffice), regulatory accuracy, AI readability of field
descriptions, and interoperability with existing STARTER categories. The
TSC may approve, request revision, or reject.

Stage 4 — Publication. On TSC approval, the category is assigned
status RATIFIED and published to the registry. The Foundation provides
English and Japanese i18n strings for all required fields. Additional
language strings are contributed via the protocol-docs repository.

### 6.5 AI Agent Query Interface

The registry exposes an AI-native query interface at
activitytravel.pro/registry/query. AI agents building itineraries can
query the registry to discover available activity categories, retrieve
the Collection schema for a specific category, and identify which fields
they need to gather from the guest.

The query interface returns structured JSON responses designed for
direct consumption by LLMs. Each field includes its description
attribute, validation rules, and conditional logic expressed in the ATP
Condition Expression Syntax. An AI agent querying SKI_ALPINE receives a
complete, self-contained specification of every question it needs to ask
the guest — without requiring any additional context or training.

This is the mechanism by which the Activity Travel Protocol enables AI
agents to scaffold reference app integrations autonomously, as described
in the Agentic AI Contribution Strategy in ATP_SDK_Architecture_v2.docx
Section 8.
