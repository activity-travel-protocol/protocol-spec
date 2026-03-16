# ATOP Protocol Charter
## Activity and Travel Orchestration Protocol

**Version:** 0.1 (Draft)  
**Status:** Founding Document  
**Date:** February 2026  
**Maintainer:** MyAuberge (atop-protocol organization on GitHub)  
**License:** Apache 2.0  

---

## 1. What is ATOP?

ATOP (Activity and Travel Orchestration Protocol) is an open protocol standard for the global travel industry that enables the discovery, configuration, negotiation, booking, and fulfillment of complex travel activities and experience packages.

ATOP extends and complements existing travel industry standards (NDC, OpenTravel Alliance, HTNG) by addressing a fundamental gap: no existing standard handles the composition and orchestration of complex, multi-supplier travel experiences such as guided tours, adventure activities, ski packages, corporate events, and curated destination experiences.

ATOP is designed for the age of agentic AI — where AI agents on behalf of travelers, travel agents, and suppliers will negotiate and construct travel experiences collaboratively, with humans in control of final decisions.

---

## 2. The Problem ATOP Solves

Existing travel protocols were designed for a world of pre-packaged, catalogue-driven inventory. A hotel room, an airline seat, a car rental — these are discrete, pre-defined products that can be queried and booked transactionally.

The global travel industry is rapidly moving beyond this model. Travelers, corporate clients, and groups increasingly demand:

- Multi-supplier experience packages assembled on demand
- Activities requiring configuration (equipment, guides, group size, language, skill level)
- Collaborative itinerary building between customer and supplier
- Real-time availability across dependent resources
- Verified, trustworthy supplier relationships across jurisdictions

No existing protocol addresses these needs. The result is a fragmented, custom-integration-heavy industry where:

- Activity suppliers cannot reach OTA distribution without bilateral integrations
- Hotels cannot legally or technically package activities with accommodation
- Travel agents cannot build complex itineraries from verified supplier data
- AI agents cannot orchestrate bookings without bespoke implementations

ATOP solves this by providing a universal protocol layer for complex travel experience commerce.

---

## 3. ATOP Design Principles

**1. Composability first**  
ATOP treats travel products as composable components, not fixed packages. Any combination of accommodation, activity, transport, and service components can be assembled into a verified, bookable itinerary.

**2. Trust by design**  
Every party on the ATOP network has a verified identity and declared role. Business relationships, credentials, and regulatory compliance are machine-readable and cryptographically verifiable — not assumed.

**3. Regulatory awareness**  
ATOP includes a jurisdiction compliance registry that makes regulatory requirements machine-readable. The protocol guides implementations toward compliant configurations and flags regulatory gray zones transparently rather than ignoring them.

**4. Agent-legible**  
Every protocol state, available action, and required data field is described with enough semantic richness that AI agents can participate in ATOP workflows on behalf of human principals — with appropriate authorization and human oversight at critical decision points.

**5. Backward compatible**  
ATOP does not replace NDC, OpenTravel, or GDS systems. It provides a protocol layer that wraps and extends existing standards, allowing parties to participate using their existing infrastructure.

**6. Open and universal**  
ATOP is an open standard governed by its community. No single commercial entity controls it. The specification, SDK, conformance tests, and reference implementation are freely available under Apache 2.0 license.

**7. Implementer friendly**  
A developer with no prior travel industry knowledge should be able to read the ATOP specification, use the SDK, and pass conformance tests within one working day. Complexity lives in the protocol design, not in the implementation burden.

---

## 4. Protocol Architecture Overview

ATOP is organized into four layers:

**Layer 1 — Identity and Trust**  
Party registry, verifiable credentials, jurisdiction compliance registry, agentic authorization framework. This layer establishes who the parties are, what they are authorized to do, and whether the transaction configuration is legally compliant.

**Layer 2 — Catalogue**  
Supplier capability declarations, facility data, activity configurations, resource definitions, and pricing structures. This layer describes what suppliers offer before any booking begins.

**Layer 3 — Workflow**  
The state machine governing booking lifecycle — from inquiry through negotiation, confirmation, fulfillment, and completion. Defines required messages at each state transition, timeout rules, and human-in-the-loop accommodation.

**Layer 4 — Schema**  
The precise data structures for every object and message in Layers 2 and 3, defined in JSON Schema and OpenAPI 3.1 format, optimized for both machine validation and AI agent legibility.

---

## 5. Scope of Version 1.0

ATOP Version 1.0 will address the following activity and experience types:

- Adventure and sports activities (ski packages, diving, trekking)
- Guided tours (single and multi-location, multi-language)
- Corporate and MICE events (conferences, team events, banquets)
- Cultural experiences (cooking classes, cultural tours, artisan workshops)
- Transportation-linked experiences (transfers with guided components)

ATOP Version 1.0 explicitly does not replace:

- Airline ticketing (NDC handles this)
- Standard hotel room booking (OTA Alliance handles this)
- Car rental (OTA Alliance handles this)

ATOP Version 1.0 provides compatibility bridges to NDC and OpenTravel Alliance so that complex experiences can be assembled alongside standard travel components.

---

## 6. Party Roles

ATOP recognizes the following party roles. A single legal entity may hold multiple roles simultaneously.

| Role | Description |
|------|-------------|
| Activity Supplier | Provides bookable activities, experiences, or services |
| Accommodation Supplier | Provides lodging (hotel, ryokan, lodge) |
| Transport Supplier | Provides ground or local transportation |
| Venue Supplier | Provides event or conference space and facilities |
| Sub-supplier | Individual or micro-business providing a component (guide, instructor) |
| Tour Operator / DMC | Assembles multi-supplier packages |
| Travel Agent | Sells travel products to consumers on behalf of suppliers |
| OTA | Online platform selling travel products direct to consumers |
| Aggregator | Consolidates supplier inventory for resellers |
| Corporate Buyer | Organization purchasing travel for employees or events |
| Consumer | Individual traveler or group organizer |
| Protocol Operator | Entity operating an ATOP-compliant platform |
| Technology Provider | Entity building systems using the ATOP SDK |

---

## 7. Governance

ATOP is governed as an open protocol under the following principles:

**Maintainer:** MyAuberge holds the role of founding maintainer and is responsible for Version 1.0 and the reference implementation.

**Contributions:** All proposed changes to the specification are submitted as GitHub pull requests with a written rationale. The maintainer reviews and merges accepted changes.

**Versioning:** ATOP follows semantic versioning. Breaking changes require a major version increment. The specification clearly marks each element as stable, experimental, or deprecated.

**Regulatory Registry:** The jurisdiction compliance registry is maintained as a separate versioned document updated on an accelerated cycle as regulations change.

**Consortium:** ATOP welcomes founding consortium members — organizations that commit to implementing ATOP and participating in specification development. Consortium members are listed in this charter.

**Founding Consortium Members:**  
*(To be confirmed — outreach in progress)*

---

## 8. Reference Implementation

MyAuberge (booking.myauberge.jp) serves as the ATOP reference implementation. It demonstrates ATOP protocol conformance in a live production environment and is used as the basis for SDK development and conformance test design.

---

## 9. Relationship to Existing Standards

| Standard | Relationship to ATOP |
|----------|---------------------|
| IATA NDC | ATOP provides a compatibility bridge for air components within ATOP itineraries |
| OpenTravel Alliance | ATOP extends OTA schemas for activity and experience types not covered |
| HTNG | ATOP aligns with HTNG hotel system integration for accommodation components |
| W3C Verifiable Credentials | ATOP uses W3C VC format for all party credential declarations |
| OpenID Federation | ATOP adopts OpenID Federation for cross-organization trust establishment |
| FAPI 2.0 | ATOP adopts FAPI 2.0 security profile for financial-grade API security |
| OpenAPI 3.1 | All ATOP APIs are specified in OpenAPI 3.1 format |

---

## 10. Contact and Participation

**GitHub:** https://github.com/atop-protocol  
**Specification:** https://github.com/atop-protocol/atop-spec  
**Documentation:** https://github.com/atop-protocol/atop-docs  
**Maintainer contact:** via GitHub Issues on atop-protocol/atop-spec  

To propose changes, open an Issue on the `atop-spec` repository.  
To join the founding consortium, open an Issue titled "Consortium Membership — [Your Organization Name]".

---

*ATOP is an open protocol. No single company owns it. Everyone benefits from it.*
