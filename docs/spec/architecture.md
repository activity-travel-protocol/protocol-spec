# ATOP Protocol Architecture Specification

**Version:** 0.1 (Draft)  
**Status:** Founding Document  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**License:** Apache 2.0  

---

## Introduction

The global travel industry moves hundreds of millions of people across the world every
year. When it works, it is invisible — guests arrive, activities happen, experiences are
created. When it breaks down, the consequences fall entirely on travelers, who are left
stranded, uninformed, and unprotected, often in unfamiliar countries far from home.

The Activity and Travel Orchestration Protocol (ATOP) exists because the industry's
current digital infrastructure was not built for the world we live in. Existing protocols
handle the transaction — the booking, the confirmation, the payment. They do not handle
the experience. They were not designed for the complexity of multi-supplier activity
packages assembled in real time. They were not designed for AI agents acting on behalf
of travelers. And critically, they were not designed for disruption — the moments when
an airspace closes, a natural disaster strikes, or a geopolitical crisis puts thousands
of travelers in harm's way simultaneously.

Consumer protection is the foundational purpose of ATOP. Every design decision — the
Trust Chain, the Jurisdiction Compliance Registry, the Disruption Event framework, the
Duty of Care workflow — exists to ensure that when something goes wrong, the traveler is
not alone. The right party is notified. The right information flows. The right protections
are activated. This is what a modern travel protocol must do, and what no current standard
does adequately.

ATOP is open source, Apache 2.0 licensed, and designed to be adopted by any party in
the global travel industry — hotels, tour operators, airlines, OTAs, government bodies,
and AI platforms — without commercial lock-in or proprietary dependency. It is built to
become the infrastructure layer that makes coordinated, consumer-protective travel
commerce possible at global scale.

---

## Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [The Problem ATOP Solves](#2-the-problem-atop-solves)
3. [Architectural Principles](#3-architectural-principles)
4. [Parties, Actors, and Agents](#4-parties-actors-and-agents)
5. [The Four-Layer Architecture](#5-the-four-layer-architecture)
6. [The Workflow — End to End](#6-the-workflow--end-to-end)
7. [The Feasibility Check Operation](#7-the-feasibility-check-operation)
8. [Communication and Security Architecture](#8-communication-and-security-architecture)
9. [Party Policy Declarations](#9-party-policy-declarations)
10. [Disruption Events and Consumer Protection](#10-disruption-events-and-consumer-protection)
11. [Versioning and Compatibility](#11-versioning-and-compatibility)
12. [Scope Boundaries](#12-scope-boundaries)
13. [Relationship to Existing Standards](#13-relationship-to-existing-standards)
14. [Implementation Conformance](#14-implementation-conformance)

---

## 1. Purpose of This Document

This document describes the architecture of the Activity and Travel Orchestration Protocol
(ATOP). It is the primary reference for implementers, protocol contributors, regulatory
bodies, and consortium members seeking to understand how ATOP is structured and why.

This document does not define specific data schemas or API endpoints. Those are defined in
the individual specification documents for each layer. This document defines:

- The conceptual architecture and its four layers
- The definitions of Party, Actor, and Agent — the entities that participate in ATOP
- The end-to-end workflow from the customer's perspective
- The reasoning behind structural decisions
- The relationships between protocol components
- The scope of what ATOP covers and explicitly does not cover

Every architectural decision in this document is validated against three real-world
scenarios drawn from operational experience at MyAuberge and Ski Resort in Nagano,
Japan. These scenarios — a ski trip package, a business conference, and a multi-location
guided tour — represent the full range of complexity that ATOP must handle. They are
documented in full in `scenarios.md`.

---

## 2. The Problem ATOP Solves

### 2.1 What Existing Protocols Handle Well

Existing travel industry protocols were designed for transactional, catalogue-driven
commerce. A hotel room exists in a property management system with a defined price and
availability calendar. A flight seat exists in a global distribution system with a defined
fare. A car rental exists with a daily rate and a pickup location.

A customer queries, selects, pays, and receives confirmation. The product is pre-defined
before any customer interaction begins. The transaction is atomic — it either completes or
it does not.

IATA NDC, OpenTravel Alliance, and GDS/EDIFACT all operate on this model. They handle
this class of transaction extremely well. ATOP does not attempt to replace them for this
class of transaction. ATOP provides compatibility bridges to these standards so that
implementations can operate alongside them.

### 2.2 What No Existing Protocol Handles

A fundamentally different class of travel commerce exists that no current protocol
addresses. This class is defined by four characteristics that existing protocols cannot
accommodate:

**Co-constructed products.**  
A ski trip package, a corporate conference, a multi-location guided tour. These products
do not exist in a catalogue. They are assembled from components — gear rental, transport,
guides, venues, catering — through a structured exchange between supplier and customer.
The final product is co-constructed during the booking process, not defined before it.
Neither party can complete the transaction without the active participation of the other.

**Multi-party orchestration.**  
These bookings involve multiple independent suppliers whose services are interdependent.
A ski resort, an equipment rental shop, a taxi operator, and a hotel all participate in
delivering a single customer experience. Each party's availability, capacity, and terms
affect the others. A change by one party may make another party's commitment impossible
to fulfill. No existing protocol models this dependency chain or provides a mechanism for
coordinating changes across it.

**Regulatory complexity.**  
In many jurisdictions, the act of assembling and selling a multi-supplier experience
triggers licensing requirements, consumer protection obligations, and liability rules that
do not apply to single-supplier bookings. Japan's Travel Agency Law, the EU Package
Travel Directive, and US Seller of Travel laws all create regulatory boundaries that
existing protocols ignore entirely. This forces businesses into legally ambiguous
workarounds and leaves consumers without the protections the regulations were designed to
provide. ATOP is designed to make compliance explicit, machine-verifiable, and — where
regulations are outdated — to generate the evidence that supports regulatory reform.

**AI-agent participation.**  
The travel industry is in the early stages of a transition in which AI agents will
initiate, configure, negotiate, and confirm bookings on behalf of human travelers, travel
agents, and suppliers. These agents need machine-readable state descriptions, available
actions at each state, explicit authority boundaries, and structured human confirmation
checkpoints. No existing protocol was designed for this mode of operation. Without a
protocol that explicitly models AI participation, the result will be AI agents operating
without defined boundaries — a risk to consumers, suppliers, and the industry.

### 2.3 The Three Design Scenarios

Every architectural decision in ATOP is tested against three operational scenarios. If a
proposed design cannot handle these scenarios, it is not sufficient.

**Scenario A — Ski Trip (Ski Resort, Nagano)**  
Multi-supplier outdoor activity with gear configuration per person, post-booking
information collection (equipment sizing), transport coordination, weather-dependent
cancellation, insurance requirements, and emergency incident handling. Regulatory
context: Japan Travel Agency Law requires a licensed intermediary to package hotel and
off-premise activity — a constraint the protocol must accommodate without making the
legitimate business model impossible.

**Scenario B — Business Conference (Tateshina resort hotel, Nagano)**  
High-value venue booking with exhaustive facility requirements, multi-round price and
terms negotiation, contract execution, pre-event operational verification, and day-of
amendment handling. Regulatory context: international organizer, multiple possible
booking channels (direct, local land operator, overseas travel agent), each with
different regulatory implications.

**Scenario C — Multi-Location Car Tour**  
Dynamic itinerary assembly from 20 local attractions with routing feasibility
constraints, transport dependency, operating hours conflicts, traffic conditions, and
in-progress customer modification (customer wishes to skip a venue, stay longer, or
return early). Regulatory context: transport operator licensing, driver hour limits,
mixed pre-arranged and dynamically booked components.

---

## 3. Architectural Principles

Eight principles govern every design decision in ATOP. Where two principles appear to
conflict, the lower-numbered principle takes precedence.

**Principle 1 — The customer's journey is the scope.**  
ATOP covers the complete journey from the customer's first inquiry to their safe return
home. A booking confirmation is not the end of the protocol's responsibility. Ground
transport dispatch, activity check-in, in-progress modification, incident response,
return coordination, and post-activity settlement are all within scope. The protocol
exists to serve the customer's experience, not the booking system's convenience.

**Principle 2 — Workflow before schema.**  
The most common failure in travel standards is designing data structures before designing
the workflow that produces and consumes them. ATOP defines the state machine first — the
sequence of states, required actors, permitted messages, and timing rules at each state
— before defining the message schemas. Schema serves workflow, not the other way around.

**Principle 3 — Composability.**  
Travel products are modular assemblies of typed components. An ATOP booking is built from
components — accommodation, activity, transport, venue, resource — each with its own
schema, availability, supplier, and terms. The protocol defines how components combine
and how changes to one component propagate to dependent components. It does not define
what fixed products look like.

**Principle 4 — Trust is structural, not assumed.**  
Every party in an ATOP transaction declares its identity, roles, credentials, and
regulatory compliance status in a verifiable form. The protocol does not assume trust
based on business relationships or reputation. A party claiming a role must present the
credentials required for that role. An AI agent acting on behalf of a party must present
a signed, verifiable authorization. The Trust Chain travels with the transaction and is
updated at every state transition.

**Principle 5 — Regulatory awareness is built in.**  
Every ATOP transaction carries a Jurisdiction Compliance Declaration. It is not possible
to construct a transaction without declaring the regulatory configuration. Where that
configuration is compliant, the declaration records how. Where it is in a legal gray
zone, the protocol flags it explicitly, documents the compliant workaround, and records
the ambiguity — contributing to the evidence base for regulatory reform. The protocol
never silently ignores a regulatory constraint.

**Principle 6 — Parties declare policy; the protocol enforces structure.**  
The protocol does not prescribe commercial policies. It provides parties with a
standardized mechanism to declare their policies to counterparties — timing windows,
booking rate limits, AI agent permissions, cancellation terms, allocation rules — in a
machine-readable format that all parties and their systems must respect. The protocol
enforces that policies are declared and acknowledged. The content of those policies is
the party's right to set.

**Principle 7 — AI participation is graduated and declared.**  
Every workflow state declares which level of AI participation is permitted, from pure
deterministic logic to AI-autonomous operation with human confirmation. An AI agent
cannot act at a level higher than the state permits. Human confirmation is a required
checkpoint at defined states regardless of AI capability. The protocol does not prohibit
AI participation; it structures it.

**Principle 8 — Build on what exists; replace nothing.**  
ATOP extends OpenTravel 2.0 schemas where they cover the required ground. It provides
compatibility bridges to IATA NDC for air components, to OpenTravel 1.0 for legacy
system integration, and to Overture Maps/GERS for location identity. Implementers with
existing standards-based systems do not start from zero.

---

## 4. Parties, Actors, and Agents

This section defines the three categories of entity that participate in ATOP
transactions. These definitions are foundational — every other part of the protocol
builds on them.

### 4.1 What is a Party?

A **Party** is any entity that holds rights, obligations, or accountability in an ATOP
transaction.

A Party may be:
- A commercial organization (hotel, tour operator, taxi company, OTA)
- A government body (licensing authority, regulatory agency, national tourism board)
- A non-profit or industry association (standards body, consumer protection organization)
- An individual operating as a business (freelance guide, independent taxi driver)
- A platform or marketplace operating on behalf of multiple underlying suppliers

A Party is not defined by its size, its technology sophistication, or whether it
participates in the ATOP system directly. A small family-run ski rental shop with no
digital infrastructure is a Party. A multinational hotel chain running a modern PMS is
a Party. Both participate in the ATOP trust framework, though through different
implementation paths.

**What distinguishes a Party from other entities:**
- A Party can hold legal identity in one or more jurisdictions
- A Party can hold credentials (licenses, certifications, insurance)
- A Party can bear contractual liability
- A Party can authorize Actors to act on its behalf
- A Party is accountable for the actions of its Actors

**Roles.** A Party holds one or more Roles that define what it is permitted to do in a
transaction. The canonical Role taxonomy is defined in the Party Registry Specification.
Current roles include:

*Supply roles:* Activity Supplier, Accommodation Supplier, Transport Supplier, Venue
Supplier, Sub-Supplier, Resource Provider

*Distribution roles:* Tour Operator / DMC, Travel Agent, Online Travel Agency (OTA),
Aggregator, Channel Manager, Bed Bank / Wholesaler

*Demand roles:* Consumer (leisure), Corporate Traveler, Group Organizer, Event Planner,
Corporate Buyer

*Platform roles:* Protocol Operator, Technology Provider, Certification Body

*Regulatory roles:* Licensing Authority, Consumer Protection Body, Industry Association

A single Party may hold multiple roles simultaneously. A hotel that books activities
for its guests is both an Accommodation Supplier and, in some configurations, a Travel
Agent. The protocol handles role multiplicity explicitly — the Trust Chain declaration
records every role a Party holds in a given transaction.

**Unknown and future roles.** The travel industry creates new business models
continuously. The Role taxonomy is versioned and extensible. A Party may declare a role
not yet in the canonical taxonomy using a namespace-qualified extension. The governance
process for adding new roles to the canonical taxonomy is defined in the Protocol
Governance Document.

### 4.2 What is an Actor?

An **Actor** is an entity that takes actions within the ATOP workflow on behalf of a
Party.

A Party authorizes Actors. An Actor is not independently accountable — the Party that
authorized the Actor bears accountability for the Actor's actions within the scope of
that authorization.

An Actor may be:
- A human employee or contractor of the Party (hotel sales manager, tour guide, taxi
  driver, conference organizer, hotel concierge)
- A software system operated by the Party (booking engine, property management system,
  channel manager)
- An AI agent authorized by the Party (AI travel assistant, automated negotiation agent,
  itinerary assembly system)

The distinction between Actor types matters for audit, liability, and human confirmation
requirements. The protocol records whether an action was taken by a human Actor or a
software/AI Actor, and whether AI-generated actions were confirmed by a human before
becoming binding.

### 4.3 What is an Agent? (AI Agent Specifically)

An **AI Agent** is a software Actor that uses AI reasoning to take actions within the
ATOP workflow. It is not a Party. It acts under the authority of a Party.

This distinction is fundamental:
- An AI agent cannot hold a travel agency license. The Party that authorized it may.
- An AI agent cannot be held contractually liable. The Party that authorized it is.
- An AI agent cannot sign a binding agreement. A human Actor of the authorizing Party must confirm any binding commitment.

**Why this matters operationally.** When an AI agent acting on behalf of a traveler
negotiates a conference package with a hotel's AI agent, the resulting proposal has no
legal force until a human Actor of each Party explicitly confirms acceptance. The
protocol enforces this. No state transition that creates a binding obligation can be
completed by an AI Agent alone.

**The Agentic Authorization Framework.** When a Party authorizes an AI Agent to act on
its behalf, it issues a signed Authorization Declaration that specifies:
- The identity of the AI Agent
- The scope of authority (what the agent may agree to without human confirmation)
- The expiry of the authorization
- The human confirmation checkpoints that override agent authority
- Whether the agent may initiate bookings or only respond to them

Counterparties can verify this Authorization Declaration cryptographically before
accepting actions from the agent. If an AI Agent attempts to take an action outside its
declared scope, the protocol rejects it and requires human Actor confirmation.

**AI Participation Levels.** Every workflow state declares which level of AI
participation is permitted at that state:

| Level | Name | Description |
|---|---|---|
| 0 | Logic only | Deterministic rules. No AI reasoning. |
| 1 | AI-assisted | AI proposes options for human review and selection. Not binding. |
| 2 | AI-negotiated | AI negotiates within declared authority bounds. Human confirms before binding. |
| 3 | AI-autonomous | AI completes workflow step. Human reviews and confirms the result. |

The state machine specification defines the permitted AI level for each state. A Party
may restrict its AI Agents to a lower level than the state permits. A Party may not
authorize its AI Agents to operate at a higher level than the state permits.

### 4.4 The Party Registry

Every Party that participates in ATOP transactions must be registered in the Party
Registry. The Registry records:
- Party identifier (globally unique, persistent)
- Party name and jurisdiction of registration
- Declared roles
- Credential references (pointers to verifiable credentials)
- Jurisdiction Compliance status
- Authorized Actor declarations (including AI Agent authorizations)
- Protocol version support range

The Party Registry Specification defines the schema, registration process, and
maintenance requirements in detail.

---

## 5. The Four-Layer Architecture

ATOP is organized into four layers. The layers are designed in dependency order — each
layer depends on the layers below it being correctly defined and implemented. This
ordering reflects the actual dependencies in a live booking transaction.

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4 — Schema                                           │
│  Data structures · OpenAPI 3.1 · JSON Schema 2020-12        │
│  LLM artifacts · Compatibility bridges · SDK               │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3 — Workflow                                         │
│  State machine · Message flows · Timing rules               │
│  AI participation levels · Human confirmation checkpoints   │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 — Catalogue                                        │
│  Capability declarations · Activity configuration schemas   │
│  Resource references · Pre-arrangement declarations         │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1 — Identity and Trust                               │
│  Party registry · Credentials · Jurisdiction compliance     │
│  Trust chain · Agentic authorization · Party policy         │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1 — Identity and Trust

**What this layer answers:** Who are the parties? What are they authorized to do? Is this
transaction legally compliant? What policies govern this interaction?

This is the foundation of the protocol. No transaction can proceed without Layer 1
establishing the identity, roles, credentials, and compliance status of all parties.

#### 1a. Party Registry

The canonical registry of all ATOP participants, as described in Section 4.4. The Party
Registry is the source of truth for party identity and role authorization across all
transactions.

#### 1b. Verifiable Credentials

Credentials are the mechanism by which a Party proves its qualifications to hold a role.
ATOP recognizes a spectrum of credential assurance levels, reflecting the reality that
not all credentials exist in digital form in all jurisdictions:

**Assurance Level 1 — Self-declared.**  
The Party declares a credential without external verification. Lowest assurance. Used
only where no verification mechanism exists and the counterparty accepts the risk.

**Assurance Level 2 — Document-attested.**  
A physical or scanned document (government license, insurance certificate, safety
certification) is referenced. The document has been reviewed by a Protocol Operator or
certified third party. Used where digital government credentials do not exist. Example:
a taxi driver's license photographed and reviewed by a Protocol Operator.

**Assurance Level 3 — Third-party verified.**  
A recognized industry body or certification authority has verified the credential and
issued a digitally signed assertion. Example: ATOP Conformance Certificate issued by a
certified ATOP auditor.

**Assurance Level 4 — Cryptographically verifiable.**  
Credentials issued in W3C Verifiable Credential format with a Decentralized Identifier
(DID). Machine-verifiable without human review. Highest assurance. Example: a government
digital travel agency license issued by Japan Tourism Agency in VC format.

The Jurisdiction Compliance Registry specifies which assurance level is required for
which credential type in which jurisdiction. The protocol does not require Level 4
everywhere — it requires the highest level that is practically achievable in each
jurisdiction, with a documented upgrade path as digital credential infrastructure matures.

Credential types relevant to ATOP include (not exhaustive):
- Travel Agency License (government-issued, jurisdiction-specific)
- Activity Safety Certification (first aid, guide qualification, equipment inspection)
- Liability Insurance Certificate
- Insolvency Protection Certificate (required for EU Package Travel Directive compliance)
- Vehicle and Transport Operator License
- Food Handler / Catering License
- Venue Safety Certificate
- ATOP Protocol Conformance Certificate
- Individual qualifications (taxi driver license, ski instructor certification, tour
  guide license)

#### 1c. Jurisdiction Compliance Registry

A machine-readable registry of regulatory requirements per jurisdiction. This is one of
ATOP's most significant contributions to the travel industry.

For each jurisdiction entry, the registry declares:
- Which party role configurations require licensing
- What credential types those licenses require, at what assurance level
- What consumer protection mechanisms apply (insolvency protection, bonding, insurance)
- What transaction configurations trigger packaging obligations
- What disclosure requirements apply to the consumer

**The Regulatory Sandbox Flag.** When a proposed transaction configuration sits in a
legal gray zone — where the law is ambiguous, where reform is pending, or where a
compliant workaround exists but the law has not caught up with the business model — the
protocol flags this explicitly. The flag includes:
- The jurisdiction and regulation creating the ambiguity
- The nature of the ambiguity
- The documented compliant workaround (if one exists)
- A reference to any pending regulatory reform

This mechanism serves two purposes. First, it allows legitimate businesses to operate
transparently rather than pretending the regulatory complexity does not exist. Second,
and strategically more important, it generates an auditable dataset of regulatory
friction points. Every flagged transaction is a data point. Aggregated across thousands
of transactions, this dataset becomes a regulatory reform instrument — concrete evidence
showing government officials exactly where their regulations create consumer friction
without creating consumer protection. ATOP's goal is not merely to comply with travel
regulations as they exist but to provide the data infrastructure that enables regulators
to improve them.

#### 1d. Trust Chain Declaration

In a multi-party transaction, the relationships between all parties — who contracted
with whom, under what terms, in what regulatory configuration — are declared in a signed
Trust Chain object. This object is created at the INQUIRY state, travels with the
transaction, and is updated and re-signed at each major state transition.

The Trust Chain is the evidentiary record of the transaction. It is the document that
establishes accountability in a dispute, demonstrates compliance to a regulator, and
provides the chain of authorization that makes AI agent actions traceable to a
responsible Party.

#### 1e. Party Policy Declarations

Every Party may declare policies that govern how other parties and their Actors (including
AI Agents) may interact with them. These policies are declared in a machine-readable
format and must be acknowledged by counterparties before a transaction proceeds.

Policy types include:
- **Timing policies:** minimum confirmation window, maximum response time, booking
  cutoff before activity date
- **Allocation policies:** maximum bookings per party per period, per-person booking
  limits, group size constraints
- **AI interaction policies:** whether AI Agents may initiate bookings (or only respond),
  what AI participation level the party permits, whether AI-negotiated proposals require
  additional human review beyond the protocol minimum
- **Communication policies:** preferred contact channels, response time commitments,
  language requirements
- **Amendment policies:** what can be changed post-confirmation, by whom, within what
  window, subject to what conditions

The protocol does not prescribe the content of these policies. It provides the structure
for declaring them, the mechanism for acknowledging them, and the enforcement point that
prevents a transaction from proceeding if a required policy acknowledgment is missing.

**Example — The High-Demand Event Policy.** A hotel creating a Taylor Swift concert and
accommodation package wants to prevent AI agents from booking the entire allocation in
milliseconds, and wants to enforce one room per booking per guest. The hotel declares an
AI interaction policy (AI Agents may not initiate bookings for this product) and an
allocation policy (one unit per guest identifier per booking period). These are
machine-readable declarations. Any booking system — human or AI — receives and
acknowledges these policies before it can enter the CONFIGURATION state. Violation of
declared policy is a protocol error, not a business dispute.

---

### Layer 2 — Catalogue

**What this layer answers:** What can suppliers offer? In what configurations? What
external data does this activity depend on?

Layer 2 is the pre-booking layer. It describes the possible space of what can be booked
before any specific customer inquiry arrives. Layer 2 data is published by suppliers and
consumed by distributors, booking systems, and AI agents building configuration options.

#### 2a. Capability Declarations

Each supplier publishes a Capability Declaration describing what configurations are
possible. This is explicitly not a product catalogue — it is a structured description
of the configurable space.

A ski equipment rental supplier's Capability Declaration includes: available gear
categories (ski, snowboard, telemark), size ranges per category, rental vs. sale
classification per item type (with regulatory basis where applicable — e.g. Japan health
regulations prohibiting rental of skin-contact items), group size handling, advance
booking requirements, and operating season windows.

A conference venue's Capability Declaration includes: room inventory with capacity by
seating configuration (theater, classroom, boardroom, banquet), AV equipment inventory
by room, catering capability (menus, dietary accommodation, service styles), WiFi
availability by space, noise restrictions and permitted event types, and minimum lead
time by event size.

#### 2b. Activity Configuration Schema

The schema for describing configurable activities with their parameters. Unlike a hotel
room which has fixed attributes, a configurable activity has:

- **Required parameters:** must be specified before a Proposal can be submitted (e.g.
  activity date, party size, skill level for ski instruction)
- **Optional parameters:** may be specified by the customer (e.g. preferred language for
  guided tour, gear brand preference)
- **Per-person parameters:** collected individually for each participant (gear sizing,
  dietary restrictions, emergency contact)
- **Computed parameters:** derived from other parameters (price is typically a computed
  parameter — the Capability Declaration defines the computation rules)
- **Dependent parameters:** availability or validity depends on another parameter (ski
  school availability depends on both date and skill level)

#### 2c. Resource Reference Registry

A structured registry of external data sources that the protocol recognizes as valid
inputs to activity configuration and feasibility validation.

Each Registry entry defines: the resource type, the recommended provider(s), the data
format, the ATOP data object the resource populates, and the staleness tolerance (how
old the data can be before it must be refreshed).

Resource categories in the Registry include:

| Category | Examples | Used For |
|---|---|---|
| Weather | JMA (Japan), OpenWeatherMap, Google Weather API | Outdoor activity viability, cancellation triggers |
| Routing and Distance | Google Maps Directions, HERE Routing | Tour feasibility, drive time between venues |
| Location Data | Overture Maps / GERS, Google Places | Attraction identity, operating hours, capacity |
| Public Transit | GTFS feeds, Jorudan (Japan), HyperDia | Train schedule, station pickup coordination |
| Traffic | JARTIC (Japan), Google Maps Traffic | Real-time delay estimation |
| Ride-hailing | Uber API, local taxi APIs | Ground transport availability and booking |
| Emergency Services | Local emergency coordination systems | Incident response, rescue coordination |
| Communication | WhatsApp Business API, email, SMS | Post-booking customer contact |

The protocol does not call these APIs directly. It declares dependencies on them. The
implementing system resolves the dependency. The protocol defines what to do with the
result — proceed, flag, offer alternatives, or escalate to human review.

#### 2d. Pre-Arrangement Declarations

Where a hotel or tour operator has pre-negotiated terms with suppliers (attraction
operators, restaurants, transport providers), these terms are declared in a
Pre-Arrangement Declaration. This declaration records: the parties, the allocation
(maximum units available under the arrangement), the commission or net rate, the
cancellation terms, and the notification requirements when a customer books.

Pre-Arrangement Declarations are the foundation of pre-fixed tour packages. When a
customer books a pre-fixed tour, the booking system can automatically notify each
supplier based on the pre-arrangement without a new negotiation cycle.

---

### Layer 3 — Workflow

**What this layer answers:** How does a booking proceed from first inquiry to the
customer's safe return home? What can go wrong? Who handles it?

The ATOP workflow is defined as a formal state machine. Every state has:
- A canonical name and identifier
- The set of Actors who may initiate a transition from this state
- The message types that may be sent at this state
- The AI participation level permitted
- Whether human Actor confirmation is required before a transition becomes binding
- The timeout rule if no message is received within the allowed window
- The error and exception paths available

The detailed state machine — with full transition tables, required message schemas, and
timeout specifications — is defined in the Workflow Specification. This section provides
the architectural overview.

The workflow is defined from the customer's perspective. A booking system's work ends at
confirmation. ATOP's coverage ends when the customer is home. This distinction is
intentional.

---

### Layer 4 — Schema

**What this layer answers:** What is the exact data structure of every message and object?

Layer 4 is what implementers work with directly. It consists of:

- **OpenAPI 3.1 Specification:** all ATOP API endpoints, parameters, responses, and
  errors. Every element has a semantic description written for both human developers and
  AI agent tool use. Realistic examples are required — generic placeholders are
  prohibited.
- **JSON Schema 2020-12 Objects:** all ATOP data objects with full validation rules and
  semantic annotations.
- **OpenTravel 2.0 Alignment:** where OTA 2.0 defines a data object that overlaps with
  ATOP, ATOP adopts or extends the OTA 2.0 definition. ATOP does not define competing
  schemas for objects OTA 2.0 handles correctly.
- **Compatibility Bridges:** translation mappings to NDC message structures (air
  components) and OpenTravel 1.0 XML (legacy system integration).
- **LLM Distribution Artifacts:** `llms.txt` and `llms-full.txt` are first-class Layer 4
  outputs, generated from the OpenAPI specification and updated with every release.
- **SDK Libraries:** TypeScript and Python SDKs generated from the OpenAPI spec, with
  pre-built wrappers for common Resource Reference integrations.
- **Conformance Test Suite:** automated tests that verify an implementation correctly
  handles the required states, messages, and validation rules.
- **MCP Server:** an ATOP MCP server enabling AI agents to interact with the protocol
  using the Model Context Protocol, without custom integration code.

---

## 6. The Workflow — End to End

The ATOP workflow covers the complete customer journey. The following states are defined
at the architecture level. Each state is fully specified in the Workflow Specification
document.

```
DISCOVERY
    │
    ▼
INQUIRY ──────────────────────────────────────────────────┐
    │                                                      │
    ▼                                                      │
CONFIGURATION ◄──── Feasibility Check (iterative)         │
    │                                                      │
    ▼                                                      │
PROPOSAL                                                   │
    │                                                      │
    ▼                                                      │
NEGOTIATION ◄──────────────────────────────────────┐      │
    │                                               │      │
    ▼                                               │      │
CONFIRMATION ──── Contract signed. Liability active.│      │
    │                                               │      │
    ▼                                               │      │
PRE-ACTIVITY COLLECTION                             │      │
  (gear sizing, dietary needs, insurance, waivers)  │      │
    │                                               │      │
    ▼                                               │      │
READY ──── All pre-activity requirements met.       │      │
    │                                               │      │
    ▼                                               │      │
FULFILLMENT ──── Customer journey is live.          │      │
  ├─ Transport dispatch                             │      │
  ├─ Activity check-in                             │      │
  ├─ In-progress modification ───────────────────►─┘      │
  └─ INCIDENT ──► INCIDENT RESPONSE                        │
         │                                                 │
         ▼                                                 │
COMPLETION ──── Customer has returned home.                │
  ├─ Settlement triggered                                  │
  ├─ Review request sent                                   │
  └─ Trust Chain archived                                  │
                                                           │
         ◄── CANCELLATION ◄────────────────────────────────┘
               (from any state, subject to Party policy)
               │
               ▼
          SETTLEMENT
```

### State Summaries

**DISCOVERY**  
The customer is searching, browsing, or being assisted by an AI agent. No transaction
has been initiated. The protocol provides read access to Capability Declarations and
Resource Reference data. No party obligations exist.

**INQUIRY**  
The customer has declared intent. Minimum required fields: date range, party size,
activity type or intent, contact information. The Trust Chain is created. Jurisdiction
Compliance is checked. Party Policies are exchanged and acknowledged. AI participation:
Level 1 permitted.

**CONFIGURATION**  
The supplier presents capability data. The customer (or their AI Agent) builds a
configuration. Feasibility Checks may be invoked iteratively. Required parameters are
collected. Per-person parameters are identified (collection deferred to
PRE-ACTIVITY-COLLECTION). The Regulatory Sandbox Flag is applied if the proposed
configuration triggers a compliance concern. AI participation: Level 1 and 2 permitted.

**PROPOSAL**  
The customer submits a complete, validated configuration as a formal Proposal. All
required parameters are populated. Price is computed by the supplier and presented with
full breakdown. Business terms are declared. This is the first state that carries
commercial weight — the Proposal is a formal offer in many jurisdictions.

**NEGOTIATION**  
Multi-round exchange. Each round carries a version number and an expiry timestamp set
by the proposing party per their declared timing policy. Counter-proposals may modify
price, terms, configuration, or timing. AI Agents may negotiate at Level 2 within
declared authority bounds. No binding commitment exists until CONFIRMATION. All
negotiation rounds are archived in the Trust Chain.

**CONFIRMATION**  
All parties have agreed to terms. The Agreement is signed by authorized human Actors
of each Party. AI Agent signatures are not accepted at this state regardless of
authorization level — human confirmation is mandatory. Components are locked. Cancellation
terms activate. The Trust Chain is signed and archived at this point. All parties receive
a signed Confirmation Receipt.

**PRE-ACTIVITY COLLECTION**  
Post-confirmation, pre-fulfillment collection of information that could not be collected
earlier. The protocol defines a structured Pre-Activity Information Request message type
specifying: what data is required, the collection deadline, and the delivery channel
(WhatsApp, email, SMS, or app notification — declared in the supplier's Party Policy).

Typical data collected at this stage: equipment sizing per person, dietary restrictions
and allergies, emergency contact details, waiver acknowledgment, insurance confirmation,
arrival transport preferences, and any accessibility requirements.

**READY**  
All pre-activity requirements have been met. All parties have received the information
they need to execute their role. Transport arrangements are confirmed. The customer is
informed of all operational details: meeting point (with map reference from the Resource
Reference Registry), contact numbers, what to bring, weather forecast (from the Resource
Reference Registry), and emergency procedures.

**FULFILLMENT**  
The customer journey is live. This state covers the complete operational period from the
customer's departure from their accommodation to their return. Sub-states within
FULFILLMENT include:

- *Transport Dispatch:* ground transport operators are activated. Pickup confirmation
  sent to customer. Real-time delay monitoring active.
- *Activity Check-in:* customer arrives at activity location. Supplier confirms arrival.
  Gear fitting, orientation, and safety briefing completed and recorded.
- *In-Progress:* activity is underway. In-progress modification requests from the
  customer are handled here (skip a venue, return early, extend time). Modifications
  are assessed for feasibility and downstream impact before acceptance.
- *Incident:* an emergency or significant disruption has occurred. See below.

**INCIDENT**  
Triggered by any party reporting an emergency — customer injury, dangerous weather,
vehicle accident, medical event, or missing person. The INCIDENT state activates a
defined notification chain: the sequence of parties to be notified, the data each party
receives, and the timeouts for acknowledgment. The supplier on the ground (the Party
with primary operational responsibility) leads the response. The protocol does not
replace emergency services — it provides the coordination infrastructure between the
travel parties while emergency services operate.

**COMPLETION**  
The customer has returned to their accommodation or departed for home. All activity
components are closed. Settlement calculations are triggered. Review requests are sent
to the customer. The full Trust Chain, including all messages, state transitions, and
any incident records, is archived per the data retention requirements of each applicable
jurisdiction.

**CANCELLATION**  
Available from any state prior to COMPLETION, subject to the cancellation terms declared
at CONFIRMATION and the Party Policies declared at INQUIRY. The cancellation terms
define who bears what cost at each stage of the workflow. Cancellation triggers a
SETTLEMENT workflow for any payments already made or penalties owed.

---

## 7. The Feasibility Check Operation

The Feasibility Check is a pre-booking operation invoked during the CONFIGURATION state
to validate whether a proposed activity configuration can actually be executed given
real-world constraints. It is architecturally novel — no existing travel protocol has
an equivalent mechanism.

**Why it is necessary.** In a multi-location tour with eight stops, a driver operating
under hour limits, a restaurant with a fixed lunch service window, and a customer party
including a vegetarian, the question "is this tour feasible?" cannot be answered by
looking up availability in a database. It requires constraint evaluation across multiple
data sources, some of which are external (real-time routing, opening hours, weather).
Without a Feasibility Check, either the supplier manually validates every configuration
(slow, expensive, error-prone) or invalid configurations are confirmed and fail during
execution (catastrophic for customer experience).

**Input:** A partial or complete activity configuration — date, party size, selected
components, proposed itinerary sequence, and declared constraints.

**Process:** The Feasibility Check evaluates the configuration against:
- Supplier capacity declarations from Layer 2
- Resource Reference data (routing, weather, operating hours, transport availability)
- Regulatory constraints from Layer 1 (does this configuration trigger an obligation?)
- Component dependencies (if Component A requires Component B, is B available at the
  required time?)
- Party Policy constraints (does this configuration respect declared timing and
  allocation policies?)

**Output:** A structured Feasibility Response:
- *Feasible:* all constraints are satisfied. Configuration may proceed to PROPOSAL.
- *Infeasible — hard constraint:* one or more constraints cannot be met. Specific
  constraint identified. Alternative configurations suggested where possible.
- *Infeasible — soft constraint:* configuration is possible but marginal (tour schedule
  leaves 5 minutes between stops with a 20-minute drive). Risk is flagged. Party may
  choose to proceed or revise.
- *Uncertain:* required Resource Reference data is unavailable (weather forecast not yet
  available for the date, supplier has not confirmed seasonal opening). Manual review
  required.

**AI Participation in Feasibility Check.** Simple constraint checking (is the conference
room large enough? is the date within the booking window?) operates at Level 0 — pure
deterministic logic. Complex multi-constraint scenarios operate at Level 1 or 2 — AI
reasons about the configuration and proposes alternatives, but human confirmation is
required before a configuration becomes a Proposal.

The Feasibility Check Specification defines the constraint evaluation rules, the
Resource Reference resolution process, and the response schema in detail.

---

## 8. Communication and Security Architecture

### 8.1 Encryption by Default

Encrypted communication is not a configuration option in ATOP. It is a requirement.
All party-to-party API communications must use TLS 1.3 or higher. All messages carrying
personal data, commercial terms, or credential information must be encrypted at rest and
in transit. No ATOP implementation may transmit protocol messages over an unencrypted
channel. This requirement is absolute and applies to all implementations regardless of
jurisdiction, party size, or implementation maturity.

### 8.2 Party-to-Party API Security

All ATOP interactions between registered parties use the ATOP REST API defined in the
Layer 4 OpenAPI specification. Authentication and authorization use OAuth 2.1 with the
FAPI 2.0 (Financial-grade API Security Profile) security profile. This profile was
designed for financial transactions and provides:
- Mutual TLS (mTLS) for API client authentication
- Proof of Possession (DPoP) tokens preventing token theft and replay attacks
- Pushed Authorization Requests (PAR) for secure authorization initiation
- Signed and encrypted ID tokens

FAPI 2.0 is the right security baseline for ATOP because activity bookings involve
financial commitments and personal data that warrant the same protection as financial
transactions. The baseline is not optional for implementations handling payment data
or personal information.

### 8.3 Message Signing and Non-Repudiation

Every binding ATOP message — Proposal, Acceptance, Confirmation, Amendment, Cancellation
— is cryptographically signed by the sending party. The signature provides non-repudiation:
a party cannot later deny having sent a message. All signed messages are archived in the
Trust Chain. The signing key must be associated with the Party's registered identity in
the Party Registry.

### 8.4 Customer-Facing Communications

ATOP is channel-agnostic for customer-facing communications. The protocol defines the
content, timing, and required fields of customer messages — it does not prescribe the
delivery channel. Suppliers declare their preferred and supported communication channels
in their Party Policy. Current supported channel types: email, SMS, WhatsApp Business
API, and in-app notification.

The Pre-Activity Collection message type, for example, must be sent within the window
declared in the supplier's Party Policy following CONFIRMATION. The message must include
a structured form for collecting the required per-person parameters. The delivery channel
is the supplier's choice. The message content and timing are protocol-defined.

### 8.5 Event Notifications (Webhooks)

State change events are published as webhooks. All registered parties receive
notifications relevant to their role when a state transition occurs. Webhook definitions
follow the AsyncAPI 3.0 specification. Webhook endpoints must be HTTPS. Delivery
confirmation and retry logic are defined in the Webhook Specification.

---

## 9. Party Policy Declarations

Party Policy Declarations are a first-class protocol mechanism, defined here at the
architecture level because they affect every layer of the protocol.

A Party Policy Declaration is a structured, machine-readable document that a Party
publishes to declare the rules governing how other parties and their Actors (including
AI Agents) may interact with it. Policy Declarations are exchanged and acknowledged
during the INQUIRY state before any transaction proceeds.

### 9.1 What Policies Cover

**Timing Policies**  
Minimum time between booking and activity date. Maximum response time for each message
type. Booking confirmation window — how long a Proposal remains valid before it expires.
Cut-off time for same-day bookings.

**Allocation Policies**  
Maximum units per booking. Maximum bookings from a single party per period. Per-person
limits (one room per guest, one lift pass per person). Group size minimum and maximum.
Allocation holds — how long inventory can be held without confirmation.

**AI Interaction Policies**  
Whether AI Agents may initiate bookings for this product (or only respond to
human-initiated inquiries). Maximum AI participation level the Party will accept.
Whether AI-generated proposals require additional human review beyond the protocol
minimum. Whether the Party's own AI Agents are authorized to negotiate on its behalf
and at what authority level.

**Amendment Policies**  
What changes are permitted post-CONFIRMATION. Who may initiate amendments. What
amendments require full renegotiation vs. simple update. Amendment cut-off times.

**Communication Policies**  
Preferred and supported communication channels for customer-facing messages. Language
requirements. Escalation contacts for incidents.

**Data Policies**  
Data retention commitments. Data sharing permissions between parties in the Trust Chain.
Compliance with applicable privacy regulations (GDPR, Japan APPI, etc.).

### 9.2 Policy Acknowledgment

A transaction may not proceed from INQUIRY to CONFIGURATION until all parties have
acknowledged each other's Policy Declarations. Acknowledgment is a signed protocol
message — it creates a record that the party received, read, and agreed to abide by
the declared policies.

If a party's AI Agent later takes an action that violates a declared and acknowledged
policy, this is a protocol violation, and the Trust Chain provides the evidence that the
policy was known and accepted.

### 9.3 Policy Conflicts

Where two parties declare policies that directly conflict (Party A requires a 48-hour
booking window; Party B's policy states same-day bookings are permitted), the protocol
flags the conflict during the INQUIRY state. Resolution options: the parties negotiate
an exception, one party updates their policy for this transaction, or the transaction
does not proceed. The protocol does not resolve policy conflicts automatically — it
surfaces them early when resolution is least costly.

---

## 10. Disruption Events and Consumer Protection

### 10.1 The Problem No Existing Protocol Solves

When a major disruption occurs — an airspace closure, a natural disaster, a pandemic, a
geopolitical crisis — thousands of active travel bookings are simultaneously affected
across dozens of suppliers, operators, and jurisdictions. In the current state of the
industry, the response is largely manual: phone calls between tour operators and hotels,
WhatsApp chains between guides and drivers, travel agents calling airlines one by one,
government advisories published as PDFs that no booking system can read automatically.

Travelers in the middle of their journey — on the ground in an affected region, in
transit through a closing airspace, or hours away from departure — have no reliable
channel through which the parties responsible for their safety can coordinate in real
time. No existing travel protocol — NDC, GDS, OpenTravel — provides a machine-readable
mechanism for declaring a region-wide disruption, propagating it to affected bookings,
activating duty of care obligations, or coordinating the response across the multi-party
chains that modern travel involves.

ATOP addresses this gap directly. Disruption Event handling is a first-class feature of
the protocol, not an afterthought.

### 10.2 The Disruption Event Declaration

A **Disruption Event Declaration** is a protocol-level object that can be issued by an
authorized party to declare that a named region, route, or travel corridor is under a
disruption condition.

**Authorized issuers** (declared in the Party Registry with the Regulatory role):
- National tourism agencies and government bodies (e.g. Japan Tourism Agency, MOFA)
- International aviation authorities (IATA, ICAO, EASA)
- Protocol Operators
- Major carriers and transport operators for disruptions within their operational scope

**Declaration fields:**
- Unique declaration identifier
- Issuing authority (Party identifier from the Registry)
- Affected region (geographic boundary — countries, FIRs, specific routes, or named
  corridors)
- Disruption type: `AIRSPACE_CLOSURE`, `CIVIL_UNREST`, `NATURAL_DISASTER`,
  `PANDEMIC`, `INFRASTRUCTURE_FAILURE`, `SAFETY_ADVISORY`, or `OTHER`
- Severity level: `MONITOR`, `CAUTION`, `WARNING`, `CRITICAL`
- Valid from / valid until timestamps
- Advisory text (machine-readable structured data + human-readable summary)
- Reference to authoritative external source (government advisory URL, NOTAM reference,
  EASA CZIB number)
- Affected booking scope: which in-flight bookings are in scope (by destination region,
  transit region, or origin region)
- Recommended actions (structured list of protocol-level actions — not policy decisions)

### 10.3 Propagation and Booking State

When a Disruption Event Declaration is issued and matches one or more active bookings,
those bookings automatically transition to a **DISRUPTION-REVIEW** state. This state:

- Notifies all parties in the affected booking's Trust Chain
- Suspends any pending automated actions (AI agent negotiations, automated confirmations)
  until a human Actor reviews the situation
- Activates the Duty of Care obligation for the party declared as primary responsible
  party in the Trust Chain
- Records the Declaration reference in the booking's audit history
- Does not automatically cancel, rebook, or modify the booking — those are decisions for
  the responsible parties, not the protocol

The DISRUPTION-REVIEW state has a defined timeout: if the primary responsible party does
not acknowledge within the declared window, the protocol escalates the notification to
the next party in the Trust Chain and records the non-response.

### 10.4 Duty of Care as a Protocol Obligation

Every ATOP Trust Chain includes a **Duty of Care Declaration** — an explicit statement
of which party holds primary duty of care responsibility for the traveler at each phase
of the journey. This is not an assumption or a default — it is a declared, signed
commitment that travels with the booking from the moment of CONFIRMATION.

When a disruption occurs, the protocol knows immediately:
- Who is responsible for the traveler right now
- How to reach them (communication channels from their Party Policy Declaration)
- What their obligation is (defined by the jurisdiction compliance configuration)
- What the escalation path is if they do not respond

This is the mechanism that transforms a government travel advisory from a PDF on a
website into a machine-readable signal that reaches the right party, for the right
booking, in real time.

### 10.5 Government Advisory Integration

Government travel advisories are registered in the Resource Reference Registry as a
dedicated resource category: **Travel Safety Advisories**.

Registered advisory sources include:
- Japan Tourism Agency (JTA) overseas safety information
- Japan Ministry of Foreign Affairs (MOFA) Overseas Safety Information
- EASA Conflict Zone Information Bulletins (CZIBs)
- US State Department Travel Advisories
- UK Foreign Commonwealth and Development Office (FCDO) Travel Advice
- IATA Safety Advisories

When an advisory for a registered region changes severity level, implementing systems
can subscribe to receive the change as a protocol event. This event can be configured
to automatically trigger a Disruption Event Declaration review, or to notify Party
Actors for manual assessment, depending on the implementing system's configuration.

The protocol does not interpret advisories or make safety decisions. It provides the
infrastructure for advisory data to flow into the booking systems that need it, and for
the right parties to be notified when the risk level for their travelers' destinations
changes.

### 10.6 New Booking Restrictions Under Disruption

A party may declare a **Disruption Booking Restriction** — a policy applied to new
bookings (not existing ones) for a specified region during an active Disruption Event.

Restriction types include:
- `SUSPENDED`: no new bookings accepted for this region
- `ADVISORY_REQUIRED`: booking may proceed only after customer acknowledges the active
  advisory and confirms intent to travel
- `INSURANCE_REQUIRED`: booking may proceed only if the customer declares valid travel
  insurance covering the disruption type
- `MANUAL_REVIEW`: new bookings for this region require human Actor review before
  CONFIRMATION

These restrictions are machine-readable. AI agents and booking systems must check for
active Disruption Booking Restrictions before entering the CONFIGURATION state for any
itinerary that includes an affected region.

### 10.7 Consumer Protection as the Design Principle

Disruption Event handling is not a feature added for edge cases. It reflects the
foundational principle that **consumer protection is the primary purpose of ATOP**.

The traveler is the most vulnerable party in any travel transaction. They have the least
information, the least leverage, and the most at risk when something goes wrong. Every
layer of the protocol — the Trust Chain that establishes accountability, the Jurisdiction
Compliance Registry that enforces legal protections, the Duty of Care Declaration that
names responsibility, and the Disruption Event framework that activates when the world
changes — exists to ensure that the traveler is protected, informed, and reachable,
regardless of what happens.

ATOP's goal is not merely to make travel commerce more efficient. It is to make travel
commerce more trustworthy — for travelers, for suppliers, and for the governments and
regulatory bodies that are responsible for ensuring that trust is upheld.

---

## 11. Versioning and Compatibility

ATOP uses semantic versioning: MAJOR.MINOR.PATCH.

**MAJOR version changes** introduce breaking changes to the state machine, trust layer,
or Layer 1 fundamentals. A MAJOR version change requires explicit negotiation between
parties before a transaction can proceed. Parties must declare support for the new
MAJOR version in their Party Registry entry before using it.

**MINOR version changes** add new states, message types, schema fields, or resource
registry entries in a backward-compatible way. A party running MINOR version N can
interoperate with a party running MINOR version N+1 with defined degradation rules —
the newer party operates as if it were running the older version for this transaction.

**PATCH version changes** are documentation clarifications, Jurisdiction Compliance
Registry updates, and Resource Reference Registry additions. No implementation changes
are required.

**Version negotiation** is declared in the initial INQUIRY message. Both parties declare
their supported version range. The protocol selects the highest mutually supported
version. If no common version exists, the transaction cannot proceed and the parties
must update their implementations.

**Registry versioning.** The Jurisdiction Compliance Registry and Resource Reference
Registry are versioned independently from the core protocol. Registry updates that add
new entries follow a faster release cadence than core protocol versions. Registry
updates that modify or deprecate existing entries require a MINOR version increment.

---

## 12. Scope Boundaries

### 11.1 What ATOP V1.0 Covers

- Discovery, configuration, negotiation, confirmation, and fulfillment of complex,
  multi-supplier activity and experience bookings
- The complete customer journey from inquiry to safe return home
- Multi-party trust chain and compliance declaration
- Pre-activity information collection (equipment sizing, dietary requirements, waivers)
- Feasibility validation for configurable and multi-location activities
- Emergency incident coordination between travel parties
- Post-activity completion, settlement trigger, and Trust Chain archival
- Cancellation and amendment workflows at all stages
- AI agent participation within declared authority bounds
- External resource dependencies (weather, routing, transport, location data)
- Party Policy declarations for timing, allocation, AI interaction, and communication

### 11.2 What ATOP V1.0 Explicitly Does Not Cover

- **Airline seat booking.** NDC handles this. ATOP provides a compatibility bridge for
  including air components in multi-product bookings, but does not implement airline
  retailing.
- **Standard hotel room booking.** OpenTravel and GDS handle this. ATOP handles the
  activity and experience layer that attaches to accommodation.
- **Standard car rental.** GDS and OTA handle this.
- **Payment processing.** ATOP defines payment event hooks and the data required for
  settlement calculation. It does not implement payment processing. Payment processors
  integrate at the defined hooks.
- **Consumer financial instruments.** Credit card processing, loyalty point redemption,
  and instalment payment are outside scope.
- **Cruise line booking.**
- **Internal supplier operations.** How a hotel manages its own staff scheduling, kitchen
  operations, or housekeeping is outside ATOP's scope. ATOP defines what the supplier
  commits to delivering, not how they operate internally.

---

## 13. Relationship to Existing Standards

| Standard | Relationship to ATOP |
|---|---|
| IATA NDC 24.1 | Compatibility bridge. Air components in multi-product ATOP bookings are represented using NDC-compatible structures. |
| OpenTravel Alliance 2.0 | Schema alignment and extension. ATOP adopts OTA 2.0 data objects for activities, hospitality, and ground transportation where they exist. ATOP extends OTA 2.0 for activity-specific objects not yet covered. |
| Overture Maps / GERS | Location identity standard for attractions, stations, venues, and all geographic references in the Resource Reference Registry. |
| OpenAPI 3.1 | Primary specification format for all ATOP APIs. |
| AsyncAPI 3.0 | Specification format for ATOP webhook and event notification definitions. |
| JSON Schema 2020-12 | Underlying schema language for all ATOP data objects. |
| W3C Verifiable Credentials | Highest-assurance credential format (Level 4). Used where digital credential issuance infrastructure exists. |
| OpenID Federation | Framework for establishing trust between parties meeting for the first time on the ATOP network. |
| OAuth 2.1 | Authorization protocol for all ATOP API access. |
| FAPI 2.0 | Financial-grade security profile applied to all ATOP API interactions. |
| GTFS | Transit schedule data standard. Primary source for public transport data in the Resource Reference Registry. |
| WhatsApp Business API | Customer communication channel for Pre-Activity Collection and operational messages. One of several supported channels. |

---

## 14. Implementation Conformance

A conforming ATOP implementation must:

1. Register all represented parties in the Party Registry with correct roles and
   credentials at the required assurance level for each jurisdiction of operation.

2. Publish a Capability Declaration for each supplier it represents, covering all
   required parameters for the activity types it offers.

3. Implement the complete workflow state machine as defined in the Workflow
   Specification, with all required states, transitions, timeout rules, and exception
   paths.

4. Implement the Feasibility Check operation for each activity category offered, with
   integration to the required Resource Reference sources for that category.

5. Implement the Pre-Activity Collection workflow with at least one supported customer
   communication channel.

6. Implement the INCIDENT state and its defined notification chain.

7. Implement Party Policy Declaration publishing and acknowledgment.

8. Produce and consume all Layer 4 messages in conformance with the OpenAPI 3.1
   specification.

9. Implement FAPI 2.0 security profile for all party-to-party API communications.

10. Use TLS 1.3 or higher for all communications. No unencrypted transmission of
    protocol messages is permitted under any circumstances.

11. Pass the ATOP Conformance Test Suite at the level corresponding to the activity
    categories and workflow states the implementation supports.

A conforming implementation may operate entirely at AI Participation Level 0 (pure
deterministic logic, no AI reasoning) and remain conformant. AI participation is
optional. The protocol structures where AI can participate — it does not require it.

A conforming implementation may begin with Credential Assurance Level 2
(document-attested) for jurisdictions where Level 4 infrastructure does not yet exist,
provided it has a documented upgrade path and the counterparty accepts the assurance
level for the relevant credential type.

---

*Document status: Draft v0.1 — March 2026*  
*Next: Party Registry Specification v0.1*  
*Maintainer: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
