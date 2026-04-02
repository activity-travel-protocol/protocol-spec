# Activity Travel Protocol Charter

**Version:** 0.2  
**Status:** Governing Document  
**Date:** April 2026  
**Governed by:** Activity Travel Protocol Foundation  
**Founding Member:** MyAuberge K.K. (Tom Sato, Chino, Nagano, Japan)  
**License:** Apache 2.0  

---

## 1. What is the Activity Travel Protocol?

The Activity Travel Protocol is an open protocol standard for the global travel industry that enables the discovery, configuration, negotiation, booking, and fulfillment of complex travel activities and experience packages across multiple suppliers, jurisdictions, and AI agents.

The Activity Travel Protocol extends and complements existing travel industry standards (NDC, OpenTravel Alliance, HTNG) by addressing a fundamental gap: no existing standard handles the composition and orchestration of complex, multi-supplier travel experiences such as guided tours, adventure activities, ski packages, corporate events, and curated destination experiences.

The Activity Travel Protocol is designed for the age of agentic AI — where AI agents acting on behalf of travelers, travel agents, and suppliers will negotiate and construct travel experiences collaboratively, with humans in control of final decisions.

---

## 2. The Problem the Activity Travel Protocol Solves

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

The Activity Travel Protocol solves this by providing a universal protocol layer for complex travel experience commerce.

---

## 3. Design Principles

**1. Composability first**  
The Activity Travel Protocol treats travel products as composable components, not fixed packages. Any combination of accommodation, activity, transport, and service components can be assembled into a verified, bookable itinerary.

**2. Trust by design**  
Every party on the Activity Travel Protocol network has a verified identity and declared role. Business relationships, credentials, and regulatory compliance are machine-readable and cryptographically verifiable — not assumed.

**3. Regulatory awareness**  
The Activity Travel Protocol includes a jurisdiction compliance registry that makes regulatory requirements machine-readable. The protocol guides implementations toward compliant configurations and flags regulatory gray zones transparently rather than ignoring them.

**4. Agent-legible**  
Every protocol state, available action, and required data field is described with enough semantic richness that AI agents can participate in Activity Travel Protocol workflows on behalf of human principals — with appropriate authorization and human oversight at critical decision points.

**5. Backward compatible**  
The Activity Travel Protocol does not replace NDC, OpenTravel, or GDS systems. It provides a protocol layer that wraps and extends existing standards, allowing parties to participate using their existing infrastructure.

**6. Open and universal**  
The Activity Travel Protocol is an open standard governed by the Activity Travel Protocol Foundation. No single commercial entity controls it. The specification, SDK, conformance tests, and reference implementation are freely available under Apache 2.0 license.

**7. Implementer friendly**  
A developer with no prior travel industry knowledge should be able to publish their first Capability Declaration and receive their first protocol-compliant INQUIRY within one working day using the SDK. Full implementation scope varies by party type and integration complexity — the SDK and documentation are designed to make every step of that journey as direct as possible.

---

## 4. Protocol Architecture Overview

The Activity Travel Protocol is organized into four layers:

**Layer 1 — Identity and Trust**  
Party registry, verifiable credentials, jurisdiction compliance registry, agentic authorization framework. This layer establishes who the parties are, what they are authorized to do, and whether the transaction configuration is legally compliant.

**Layer 2 — Discovery and Capability**  
Supplier capability declarations, facility data, activity configurations, resource definitions, and pricing structures. This layer describes what suppliers offer before any booking begins.

**Layer 3 — Workflow**  
The state machine governing booking lifecycle — from inquiry through negotiation, confirmation, fulfillment, and completion. Defines required messages at each state transition, timeout rules, and human-in-the-loop accommodation.

**Layer 4 — Schema and SDK**  
The precise data structures for every object and message in Layers 2 and 3, defined in JSON Schema and OpenAPI 3.1 format, with client libraries in TypeScript and Python.

---

## 5. Scope of Version 1.0

The Activity Travel Protocol Version 1.0 addresses the following activity and experience types:

- Adventure and sports activities (ski packages, diving, trekking)
- Guided tours (single and multi-location, multi-language)
- Corporate and MICE events (conferences, team events, banquets)
- Cultural experiences (cooking classes, cultural tours, artisan workshops)
- Transportation-linked experiences (transfers with guided components)

Version 1.0 explicitly does not replace:

- Airline ticketing (NDC handles this)
- Standard hotel room booking (OpenTravel Alliance handles this)
- Car rental (OpenTravel Alliance handles this)

Version 1.0 provides compatibility bridges to NDC and OpenTravel Alliance so that complex experiences can be assembled alongside standard travel components.

---

## 6. Party Roles

The Activity Travel Protocol recognizes the following party roles. A single legal entity may hold multiple roles simultaneously.

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
| Protocol Operator | Entity operating an Activity Travel Protocol-compliant platform |
| Technology Provider | Entity building systems using the Activity Travel Protocol SDK |

---

## 7. Governance

The Activity Travel Protocol is governed by the **Activity Travel Protocol Foundation**, an independent standards body. The Foundation owns the protocol specification, the SDK, the conformance test suite, and the associated web properties. No single commercial entity controls the protocol.

**Foundation:** The Activity Travel Protocol Foundation holds governing authority over the protocol specification and all associated standards assets. The Foundation operates under the governance model defined in the Foundation Charter.

**Founding Member:** MyAuberge K.K. (Tom Sato, Chino, Nagano, Japan) is the Founding Member of the Activity Travel Protocol Foundation and the primary contributor to Version 1.0. MyAuberge K.K. operates commercial services on top of the protocol — it does not own or control the protocol itself. This separation is a foundational governance decision.

**Technical Steering Committee:** The TSC is responsible for protocol specification decisions. Membership, voting model, and amendment process are defined in the TSC Charter.

**Contributions:** All proposed changes to the specification are submitted as GitHub pull requests with a written rationale. The TSC reviews and merges accepted changes.

**Versioning:** The Activity Travel Protocol follows semantic versioning. Breaking changes require a major version increment. The specification clearly marks each element as stable, experimental, or deprecated.

**Regulatory Registry:** The jurisdiction compliance registry is maintained as a separate versioned document updated on an accelerated cycle as regulations change.

**Members:** The Foundation welcomes Founding Members — organizations that commit to implementing the Activity Travel Protocol and participating in specification development. Founding Members are listed on the Foundation governance page.

**Founding Members:**  
- MyAuberge K.K. *(Founding Member)*  
- *(Additional founding members — outreach in progress)*

---

## 8. Reference Implementation

MyAuberge K.K. (booking.myauberge.jp) operates as the Activity Travel Protocol reference implementation. It demonstrates Activity Travel Protocol conformance in a live production environment and is used as the basis for SDK development and conformance test design. The reference implementation is a commercial service operated by MyAuberge K.K. — it is distinct from the protocol specification, which is governed by the Foundation.

---

## 9. Relationship to Existing Standards

| Standard | Relationship to the Activity Travel Protocol |
|----------|----------------------------------------------|
| IATA NDC | Compatibility bridge for air components within Activity Travel Protocol itineraries |
| OpenTravel Alliance | Extends OTA schemas for activity and experience types not covered |
| HTNG | Aligns with HTNG hotel system integration for accommodation components |
| W3C Verifiable Credentials | Uses W3C VC Data Model 2.0 for all party credential declarations |
| OpenID Federation 1.0 | Adopts OpenID Federation for cross-organization trust establishment |
| FAPI 2.0 | Adopts FAPI 2.0 security profile for financial-grade API security |
| OpenAPI 3.1 | All Activity Travel Protocol APIs specified in OpenAPI 3.1 format |
| OCTO | Bridge adapter for 130+ activity aggregator members |
| MCP (Model Context Protocol) | ATP MCP Server exposes booking workflow as MCP tools for AI agents |

---

## 10. Contact and Participation

**GitHub:** https://github.com/activity-travel-protocol  
**Specification:** https://activitytravel.pro  
**Project home:** https://activitytravel.org  
**Governance:** https://activitytravel.org/governance  
**Contact:** via GitHub Issues on activity-travel-protocol/protocol-spec  

To propose changes to the specification, open an Issue on the `protocol-spec` repository.  
To enquire about Foundation membership, visit https://activitytravel.org/governance.

---

*The Activity Travel Protocol is an open standard governed by the Activity Travel Protocol Foundation. The protocol belongs to no single company. Everyone benefits from it.*
