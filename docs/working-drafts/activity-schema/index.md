# Activity Configuration Schema Design System

*Track 3 Session 3.5 · April 2026 · Apache 2.0*

**Sections:** [Fragment Library](fragment-library) · [Starter Catalogue](starter-catalogue) · [UI Generation](ui-generation) · [Category Registry](registry) · [Decisions](decisions)

**Activity Travel Protocol**

ATP_ActivitySchema_v1.docx

Track 3 — Session 3.5 Output

April 2026

*Activity Travel Protocol Foundation (in formation / 設立準備中)*

## 1. Purpose and Scope

This document specifies the Activity Configuration Schema Design System
--- the framework by which any activity type in the global travel
industry can be formally described, validated, and integrated into the
Activity Travel Protocol. It is the output of Track 3 Session 3.5 and is
a prerequisite for Track 3 Session 6 (Layer 4 Schema and SDK).

The design system solves a fundamental problem: every activity type has
a different shape. A farm experience needs seasonal availability and
clothing guidance. A ski rental needs per-person body measurements and
skill assessment. A cultural performance needs group size minimums and
noise ordinance windows. A guided tour needs sub-supplier coordination
for transport. No flat schema can cover all of these without becoming
either unusable or meaningless.

The solution is a three-layer schema model (Capability, Configuration,
Collection) combined with a reusable Fragment Library and an IANA-model
Activity Category Registry. Together they allow any supplier — from a
Nagano boutique farm to a major ski resort — to describe their
offering in machine-readable terms that the Activity Travel Protocol SDK
can validate, price, and operationally manage without bespoke
integration work.

The reference cases throughout this document are drawn from two real
implementations: Ponyhouse Farm (Chino, Nagano — the simple,
self-contained case) and 8 Peaks Resort (Nagano ski region — the
complex, multi-supplier case). These two cases were selected because
they expose the maximum range of schema requirements within the Activity
Travel Protocol's primary operating region.

## 2. Core Architecture

### 2.1 The Three-Layer Schema Model

Every activity in the Activity Travel Protocol is described by three
independent but linked schema objects. The three schemas have a strict
dependency chain: Capability constrains Configuration; Configuration
constrains Collection. No layer can reference a field that the layer
above it has not declared.

  **Layer**      **Name**        **Author**     **Lifecycle**       **Purpose**
  1              Capability      Supplier       Static — set at   Declares what the
                                                onboarding          supplier can offer.
                                                                    Maximum
                                                                    participants,
                                                                    equipment stock,
                                                                    operating season,
                                                                    sub-supplier
                                                                    dependencies,
                                                                    pricing bands. The
                                                                    Capability schema
                                                                    is the supplier's
                                                                    machine-readable
                                                                    product catalogue
                                                                    entry.

  2              Configuration   Operator / TA  Semi-static — set Specifies how this
                                                at package build    activity is
                                                time                included in a
                                                                    particular package.
                                                                    Which participant
                                                                    types are included.
                                                                    Which equipment
                                                                    categories are
                                                                    pre-selected. Which
                                                                    sub-suppliers are
                                                                    engaged. The
                                                                    Configuration
                                                                    schema is the
                                                                    operator's
                                                                    instructions to the
                                                                    activity supplier.

  3              Collection      Guest / AI     Dynamic —         Defines what data
                                 agent          gathered            must be collected
                                                post-CONFIRMATION   from each
                                                in PRE_JOURNEY      participant before
                                                phase               the activity can be
                                                                    fulfilled. Dietary
                                                                    requirements, body
                                                                    measurements, skill
                                                                    level, safety
                                                                    acknowledgements.
                                                                    The Collection
                                                                    schema drives the
                                                                    pre-arrangement
                                                                    form rendered to
                                                                    the guest.

### 2.2 Discriminated Union Pattern

Every activity declares a category field. The category value is a
registered string identifier (e.g. SKI_ALPINE, FARM_EXPERIENCE) that
resolves to exactly one registry entry. The registry entry points to
three schemas — one per layer. This is the discriminated union
pattern: the category discriminates which schemas apply.

Activities do not inherit from a common base class. There is no
AbstractActivity. Instead, schemas are composed from reusable Fragments
declared in the Fragment Library (Section 3). A Fragment is a named,
versioned sub-schema that can be referenced by any category schema. The
fragment \$uses syntax creates a composition relationship without
inheritance.

This distinction is critical. Inheritance forces all activities to share
a common shape, which either over-constrains novel types or produces
meaningless common ancestors. Composition via fragments allows each
category to declare exactly the structure it needs, while reusing proven
sub-schemas across categories.

  **Principle**           **Inheritance           **Composition via
                          (rejected)**            Fragments (adopted)**
  Schema reuse            Child class extends     \$uses fragment
                          parent                  reference

  Novel activity types    Must fit into class     Declare new category,
                          hierarchy               reference existing
                                                  fragments

  Schema validation       Class-level type        Per-fragment
                          checking                validation,
                                                  category-level
                                                  composition check

  AI agent readability    Agent must understand   Agent queries registry,
                          hierarchy               reads flat fragment
                                                  list

  Registry evolution      Hierarchy changes break New fragments are
                          subclasses              additive; existing
                                                  schemas unaffected

### 2.3 Schema Authoring Rules

All schemas in the Activity Travel Protocol registry conform to the
following authoring rules. These rules are normative. A Category
Proposal that violates them is rejected by the Foundation TSC without
review.

**Rule 1 — Field naming**

All field names are snake_case. Abbreviations are not used. Field names
must be unambiguous without context (boot_size_eu not just size).
Boolean fields are prefixed with is\_ or has\_ or requires\_.

**Rule 2 — Type system**

Permitted scalar types are: string, integer, number, boolean,
ISO8601Date, ISO8601DateTime, ISO8601Duration, UUID7, URI, EmailAddress,
PhoneNumber, ISO3166Alpha2, ISO4217, LanguageTag. Collection types are
typed arrays (e.g. string\[\]) and typed maps (Record\<string, T\>).
Untyped object is not permitted.

**Rule 3 — Required vs optional**

Every field is explicitly marked REQUIRED, OPTIONAL, or CONDITIONAL.
CONDITIONAL fields carry a when clause that references another field in
the same schema layer or a declared fragment field. Example: when:
skill_level == BEGINNER implies requires: instructor_requested.

**Rule 4 — Fragment references**

Fragment references use the \$uses syntax at the schema level. A
fragment reference imports all fields of the fragment into the schema at
the declared scope (capability, configuration, or collection). Fragment
fields may be overridden only to make an OPTIONAL field REQUIRED — not
to change types or add fields. Adding fields requires either a new
fragment or a category-level field.

**Rule 5 — Versioning**

Schema versions follow semver (MAJOR.MINOR.PATCH). A PATCH change fixes
a documentation error and is backward compatible. A MINOR change adds
optional fields and is backward compatible. A MAJOR change removes or
renames fields and is not backward compatible. Consumers pin to a MAJOR
version. The registry serves the latest MINOR/PATCH within each MAJOR.

**Rule 6 — i18n keys**

Every field that produces user-visible text in the Collection form
carries an i18n_key attribute. The key format is
atp.collection.{category_lower}.{field_name}. The Foundation provides
English and Japanese strings for all Starter Catalogue entries.
Additional languages are community-contributed via the protocol-docs
repository.

**Rule 7 — AI readability**

Every field carries a description attribute written in plain English,
suitable for direct inclusion in an LLM prompt. Descriptions must be
self-contained — they cannot reference other documents or assume
domain knowledge. The registry exposes descriptions as the primary
interface for AI agents building itineraries.
