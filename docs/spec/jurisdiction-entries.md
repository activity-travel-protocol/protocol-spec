# ATOP Jurisdiction Entries

**Version:** 0.1 (Draft)  
**Status:** Layer 1 — Identity and Trust  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**Depends on:** Jurisdiction Compliance Registry Specification v0.2  
**Related documents:** Global Jurisdiction Comparison v0.1  
**License:** Apache 2.0  

---

## About This Document

This document contains the jurisdiction entries for the ATOP Jurisdiction Compliance
Registry. It is versioned independently from the Specification — regulatory changes
update this document without requiring schema changes.

Each entry follows the structure defined in the Jurisdiction Compliance Registry
Specification v0.2. All four primary jurisdictions are given equal treatment and
consistent depth.

**Entry status key:**

| Status | Meaning |
|---|---|
| `partial` | Some sections complete. Gaps explicitly noted. Not for comprehensive compliance checking. |
| `full` | All sections complete. Suitable for production use. |
| `authoritative` | Co-maintained with the jurisdiction's primary regulatory body. |

All entries in this document are currently `partial` v0.1. Target for `full` status
is v0.2, following review engagement with each jurisdiction's regulatory body.

**Identifier convention for this document:**

- Licensing requirements: `{JJ}-LIC-{NNN}`
- Consumer protection: `{JJ}-CP-{NNN}`
- Packaging obligations: `{JJ}-PKG-{NNN}`
- Disclosure requirements: `{JJ}-DISC-{NNN}`
- Associated domains: `{JJ}-DOM-{TYPE}-{NNN}`
- Sandbox flags: `{JJ}-{CATEGORY}-{SLUG}`
- Advisory sources: `advisory:{jj}:{authority}`

---

## Table of Contents

- [Japan (JP)](#japan-jp)
- [European Union (EU)](#european-union-eu)
- [United Kingdom (GB)](#united-kingdom-gb)
- [United States (US)](#united-states-us)
- [Advisory Sources Registry](#advisory-sources-registry)
- [Planned Entries](#planned-entries)

---

## Japan (JP)

```
jurisdiction_code:    JP
jurisdiction_name:    Japan
entry_version:        0.1
entry_status:         partial
last_updated:         2026-03-04
co_maintained_by:     (target: atop:party:jp:jta-licensing-authority)
primary_regulatory_body:
  name:               Japan Tourism Agency
  name_local:         観光庁
  parent:             Ministry of Land, Infrastructure, Transport and Tourism (MLIT / 国土交通省)
  website:            https://www.mlit.go.jp/kankocho/
  licensing_website:  https://www.mlit.go.jp/kankocho/shotokai/toroku/index.html
```

### Regulatory Framework

Japan's travel industry is governed primarily by the **Travel Agency Act (旅行業法)**,
first enacted 1952, substantially revised 2018. The Act is administered by the Japan
Tourism Agency (JTA) under MLIT. It establishes a tiered licensing system and defines
which activities constitute regulated "travel agency business" (旅行業).

The Act predates AI-assisted booking, digital marketplaces, and the hotel-led activity
packaging model. This gap creates several gray zones addressed by the sandbox flags
in this entry.

Secondary framework:
- **Hotel Business Act (旅館業法)** — governs accommodation operations
- **Road Transportation Act (道路運送法)** — governs commercial passenger transport
- **Food Sanitation Act (食品衛生法)** — governs food handling and food businesses
- **Act on Protection of Personal Information (APPI / 個人情報保護法)** — data protection

### JP Licensing Requirements

---

**JP-LIC-001 — Travel Agency License: Package Sales**

Any party selling a combination of transportation with accommodation or other services
at an inclusive price to a customer must hold a Travel Agency License (旅行業登録).

*Trigger:* selling_roles = any; product_type = package_two_components or
package_three_or_more where one component is transportation; customer_type = consumer
or corporate; sale_jurisdiction = JP

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY, and any party
acting as primary seller of a qualifying package

*License classes:*

| Class | Scope | Bond Requirement | Licensing Authority |
|---|---|---|---|
| Class 1 (第一種) | All packages, domestic and international | ¥7M base + ¥1.5M/branch | Japan Tourism Agency |
| Class 2 (第二種) | Domestic + inbound international; cannot independently sell outbound | ¥1.1M base | Prefectural governor |
| Class 3 (第三種) | Single prefecture or adjacent prefectures within defined radius | ¥300K base | Prefectural governor |
| Agent-only (旅行業者代理業) | Acts as agent for licensed operator; cannot hold money | No bond required | Prefectural governor |

*Required credential:* TRAVEL_AGENCY_LICENSE, Assurance Level 2 minimum

*Legal basis:* Travel Agency Act Articles 2–6
https://elaws.e-gov.go.jp/document?lawid=327AC0000000239

*Sandbox flag:* JP-TRAVEL-LAW-SPLIT-SELLER (where party lacks license but has compliant path)

---

**JP-LIC-002 — Licensed Intermediary for Hotel Activity Packaging**

A hotel or accommodation provider wishing to include off-premise activities in a
package sold to guests must either hold a Class 3 or above Travel Agency License, or
use a licensed intermediary in a split-seller (手配旅行) configuration.

*Trigger:* selling_roles = ACCOMMODATION_SUPPLIER; product_type = package_two_components
where second component is an off-premise activity; sale_jurisdiction = JP

*Applies to roles:* ACCOMMODATION_SUPPLIER acting as package seller

*Required credential:* TRAVEL_AGENCY_LICENSE Class 3 or above, OR documented
split-seller configuration

*Legal basis:* Travel Agency Act Article 2; JTA Interpretation Guidance 2019-03

*Sandbox flag:* JP-TRAVEL-LAW-SPLIT-SELLER

---

**JP-LIC-003 — Inbound Tour Operator**

A party operating inbound tours for foreign visitors may require registration as an
inbound tour operator depending on scope of services.

*Trigger:* selling_roles = TOUR_OPERATOR; customer_type = foreign visitor; consumption_jurisdiction = JP

*Required credential:* TRAVEL_AGENCY_LICENSE Class 1 or 2 for international scope, or
INBOUND_TOUR_OPERATOR_REGISTRATION

*Legal basis:* Travel Agency Act Article 12-6

---

**JP-LIC-004 — Travel Agency Manager Qualification**

Each licensed travel agency location must designate a qualified Travel Agency Manager
(旅行業務取扱管理者) who has passed the national examination.

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Required credential:* TRAVEL_AGENCY_MANAGER_CERT (national exam pass certificate)

*ATOP note:* This credential applies to individuals (Actors), not the Party entity.
It is declared as an Actor credential, not a Party credential.

*Legal basis:* Travel Agency Act Articles 11-2 through 11-3

---

### JP Consumer Protection Requirements

---

**JP-CP-001 — Compensation Insurance (損害賠償責任保険)**

Licensed travel agents must maintain compensation insurance covering customer losses
from errors or negligence in travel arrangement.

*Protection type:* liability_insurance

*Trigger:* whenever Travel Agency License is required

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Minimum coverage by class:*
- Class 1: ¥1,000,000,000 (¥1 billion) aggregate annual
- Class 2: ¥500,000,000 aggregate annual
- Class 3: ¥100,000,000 aggregate annual

*Legal basis:* Travel Agency Act Article 22

---

**JP-CP-002 — Travel Business Bond (営業保証金)**

Licensed Class 1 and Class 2 agents must deposit a business bond with JTBF (Japan
Tourism Business Foundation) or maintain equivalent approved insurance. Protects
customers if the agent becomes insolvent.

*Protection type:* bonding

*Applies to roles:* TOUR_OPERATOR (Class 1 and 2), TRAVEL_AGENT (Class 1 and 2)

*Minimum bond:*
- Class 1: ¥7,000,000 base + ¥1,500,000 per branch
- Class 2: ¥1,100,000 base

*Legal basis:* Travel Agency Act Article 7

---

**JP-CP-003 — Written Contract Requirement (書面交付義務)**

All travel contracts above ¥10,000 must be accompanied by a written contract document
issued to the customer.

*Protection type:* payment_protection

*Trigger:* transaction_value ≥ ¥10,000; customer_type = consumer

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*ATOP mapping:* Fulfilled by the CONFIRMATION document generated at CONFIRMATION state.
Document must include all fields required under JP-DISC-002.

*Legal basis:* Travel Agency Act Article 12-4

---

### JP Packaging Obligations

---

**JP-PKG-001 — Organized Package Tour (募集型企画旅行)**

A pre-planned package tour sold to customers constitutes 募集型企画旅行 and triggers
full Travel Agency Act obligations.

*Threshold:* ≥2 component types including transportation; sold at inclusive price;
pre-planned (not assembled in response to a specific customer request); any duration

*Obligations triggered:*
- TRAVEL_AGENCY_LICENSE required
- Written contract required (JP-CP-003)
- Compensation insurance required (JP-CP-001)
- Business bond required (JP-CP-002)
- Pre-trip information required (JP-DISC-001)
- Standard cancellation fee schedule applies (Article 16 schedule)

*Split-seller exemption:* Available via JP-TRAVEL-LAW-SPLIT-SELLER

---

**JP-PKG-002 — Custom-Arranged Package (受注型企画旅行)**

A package assembled in response to a specific customer request. This is the primary
product type ATOP is designed to enable — a customer initiates an INQUIRY, a
configuration is assembled through ATOP's INQUIRY → CONFIGURATION → PROPOSAL flow,
and the result is a 受注型企画旅行.

*Threshold:* Same components as JP-PKG-001 but assembled in direct response to
customer INQUIRY rather than pre-planned

*Obligations triggered:* Same as JP-PKG-001

*ATOP mapping:* ATOP's full booking workflow from INQUIRY through CONFIRMATION is the
technical implementation of the 受注型企画旅行 booking process.

---

**JP-PKG-003 — Arranged Travel / Split-Seller (手配旅行)**

Where each component is contracted separately by its direct provider with no single
party selling an inclusive package, this is classified as 手配旅行. Package obligations
do not apply. This is the legal basis for ATOP's split-seller configuration.

*Threshold NOT triggered when:*
- Each service component contracted separately with its direct provider
- No single party sells an inclusive or combined price
- Customer enters separate contracts for each component

*Consumer protection note:* Full package protections do not apply in this configuration.
Customer does not have a single contract covering the whole experience.
Disclosure JP-DISC-003 is REQUIRED.

---

### JP Disclosure Requirements

---

**JP-DISC-001 — Pre-Contractual Information (契約前説明)**

Written information covering all key terms must be provided before the contract is
concluded.

*Delivery timing:* at_proposal (before CONFIRMATION)  
*ATOP workflow state:* PROPOSAL  
*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Content required:*
- Travel agent name, registration number, license class
- Travel itinerary: destinations, dates, transport, accommodation
- Prices: total, per person, inclusions and exclusions
- Minimum participant number if applicable
- Cancellation fee schedule
- Travel agent liability limits
- Complaint contact information

*Legal basis:* Travel Agency Act Article 12-4 and Implementing Regulations

---

**JP-DISC-002 — Confirmation Document (契約書面)**

Upon conclusion of the travel contract, the agent must issue a written confirmation.

*Delivery timing:* at_confirmation  
*ATOP workflow state:* CONFIRMATION  
*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Content required:* All JP-DISC-001 fields plus:
- Confirmation of payment received
- Emergency contact numbers for destination
- Insurance information if included
- Customer rights under Travel Agency Act

*Legal basis:* Travel Agency Act Article 12-5

---

**JP-DISC-003 — Split-Seller Configuration Notice**

When a transaction uses the split-seller configuration, the customer MUST be informed
that they are entering separate contracts with each provider and do not have the
protections of a package travel contract.

*Delivery timing:* before_booking  
*ATOP workflow state:* INQUIRY acknowledgment; repeated in CONFIRMATION  
*Trigger:* sandbox_flags_active includes JP-TRAVEL-LAW-SPLIT-SELLER

*Required disclosure text (Japanese):*
このご予約は、宿泊と体験活動が別々の事業者との個別契約となります。旅行業法に基づく
パッケージ旅行の消費者保護（旅行業者の弁済業務保証金等）は適用されません。各サービスに
つきましては、それぞれの事業者の規約が適用されます。

*Required disclosure text (English):*
This booking comprises separate contracts with each service provider. The consumer
protections that apply to package travel under Japan's Travel Agency Act — including
operator insolvency protection — do not apply to this booking. Each service is governed
by the terms of its individual provider.

---

### JP Associated Regulatory Domains

---

**JP-DOM-FOOD-001 — Food Safety**

*Domain type:* food_safety · Tier 1  
*Activity types:* restaurant, catering, cooking_class, tour_with_meals,
conference_catering, food_tour, hotel_breakfast, welcome_dinner

*Governing authority:* Prefectural public health authorities under MHLW
(Ministry of Health, Labour and Welfare — 厚生労働省)

*Required credentials:*
- FOOD_ESTABLISHMENT_LICENSE — issued by prefectural authority, required for each
  premises, renewed every 5–8 years depending on food type (Assurance Level 2–3)
- FOOD_HANDLER_SUPERVISOR — 食品衛生責任者, one per establishment, requires completion
  of designated training course (Assurance Level 2)
- HACCP_COMPLIANCE — mandatory for all food businesses since June 2021 amendment to
  Food Sanitation Act (Assurance Level 2 for small operators, L3 for large)

*Legal basis:* Food Sanitation Act (食品衛生法); revised 2018 effective 2021
https://elaws.e-gov.go.jp/document?lawid=322AC0000000233

---

**JP-DOM-TRANSPORT-001 — Ground Transport**

*Domain type:* ground_transport · Tier 1  
*Activity types:* taxi, private_hire, bus, shuttle, minibus, transfer

*Governing authority:* Regional Transport Bureaus (地方運輸局) under MLIT

*Required credentials:*
- TRANSPORT_OPERATOR_LICENSE — 一般旅客自動車運送事業許可, issued by regional transport
  bureau (Assurance Level 3)
- DRIVER_LICENSE — Type 2 (第二種運転免許) required for commercial passenger transport
  (Assurance Level 2)
- VEHICLE_ROADWORTHINESS_CERT — 車検証, biennial vehicle inspection (Assurance Level 2)

*Driver hour limits:* 13 hours/day maximum driving time; 65 hours/week; mandatory
rest periods governed by MLIT notification

*Legal basis:* Road Transportation Act (道路運送法)
https://elaws.e-gov.go.jp/document?lawid=326AC0000000183

---

**JP-DOM-MARITIME-001 — Maritime Operations**

*Domain type:* maritime · Tier 1  
*Activity types:* boat_tour, diving, snorkeling, fishing_charter, kayaking_guided,
water_taxi, whale_watching, coastal_tour

*Governing authority:* Japan Coast Guard (海上保安庁)

*Required credentials:*
- VESSEL_REGISTRATION — 船舶検査証書, Japan Coast Guard inspection certificate,
  annual renewal (Assurance Level 2–3)
- MARITIME_OPERATOR_LICENSE — 一般旅客定期航路事業 or 不定期航路事業 for passenger vessels
  (Assurance Level 3)
- MASTER_CERTIFICATE — 船長資格, qualification level depends on vessel size and route
  (Assurance Level 2–3)
- MARINE_LIABILITY_INSURANCE — required for commercial passenger operations (Assurance Level 2)

*Legal basis:* Marine Transportation Act (海上運送法); Small Vessel Safety Act (小型船舶
安全規則)

---

**JP-DOM-SLOPE-001 — Ski Slope Safety**

*Domain type:* slope_safety · Tier 2  
*Activity types:* skiing, snowboarding, ski_resort

*Governing authority:* Municipal government (varies by resort location); MLIT guidelines

*Required credentials:*
- SKI_SLOPE_SAFETY_INSPECTION — annual municipal inspection (Assurance Level 2)
- SKI_PATROL_CERTIFICATION — qualified patrol required on all open slopes (Assurance Level 2)
- LIFT_SAFETY_INSPECTION — annual inspection of lift machinery (Assurance Level 2–3)

*Note:* Nagano Prefecture has the most developed regulatory framework given its
concentration of ski resorts. Requirements vary significantly by municipality.

---

### JP Sandbox Flags

---

**JP-TRAVEL-LAW-SPLIT-SELLER**

*Flag name:* Hotel Activity Packaging — Split-Seller Configuration  
*Category:* licensing · *Status:* active

*Regulatory context:* Travel Agency Act Article 2 defines "travel agency business"
broadly enough that a hotel facilitating activity bookings for its guests may be
construed as conducting travel agency business without a license.

*Ambiguity:* JTA's 2019 guidance memo acknowledged the gray zone for hotels curating
local activities but did not issue definitive clarification. Hotels operating this
model in good faith face legal uncertainty.

*Compliant path available:* Yes — the 手配旅行 (arranged travel) configuration:
1. Hotel contracts with guest for accommodation only (accommodation license sufficient)
2. Each activity, transport, and equipment provider contracts directly with the guest
3. No single party sells an inclusive package price
4. Each component invoiced separately
5. Customer informed via JP-DISC-003

*Consumer disclosure required:* Yes — JP-DISC-003 in Japanese and English

*Reform reference:* JTA "Future of Travel DX" working group (2024–2025) discussed
updating the Travel Agency Act for digital platforms. No reform bill introduced as of
March 2026.

---

**JP-AI-AGENT-001**

*Flag name:* AI Agent Booking Initiation  
*Category:* ai_agent · *Status:* active

*Regulatory context:* The Travel Agency Act does not address AI agents acting on behalf
of consumers. Whether an AI agent initiating a booking constitutes conducting travel
agency business is unaddressed in any JTA guidance.

*Compliant path available:* Yes — ATOP Agentic Authorization Framework:
1. AI agent operates under signed Authorization Declaration from consumer
2. Agent operates at Level 2 maximum (negotiates but does not confirm)
3. Human consumer provides binding signature at CONFIRMATION
4. Agent identified in Trust Chain as acting under consumer authorization
5. Contracting party in all agreements remains the human consumer

*Consumer disclosure required:* No — agent acts under consumer's own authorization

*Reform reference:* JTA AI in Tourism working group ongoing as of March 2026

---

### JP Government Advisory Sources

| Source ID | Authority | Feed URL | Format | ATOP Mapping |
|---|---|---|---|---|
| `advisory:jp:mofa` | MOFA (外務省) | https://www.anzen.mofa.go.jp/rss/anzen_situa.xml | RSS | Danger/Evacuation→CRITICAL, Caution→WARNING, Watch→CAUTION, Info→MONITOR |
| `advisory:jp:jta-disruption` | Japan Tourism Agency | https://www.mlit.go.jp/kankocho/ | manual | As published |
| `advisory:jp:jma` | Japan Meteorological Agency (気象庁) | https://www.jma.go.jp/bosai/feed/json/overview_forecast.json | JSON | Typhoon/Earthquake Special Warning→CRITICAL, Warning→WARNING, Advisory→CAUTION |

---

## European Union (EU)

```
jurisdiction_code:    EU
jurisdiction_name:    European Union (Member States)
entry_version:        0.1
entry_status:         partial
last_updated:         2026-03-04
co_maintained_by:     (target: atop:party:eu:ec-dg-grow)
primary_regulatory_body:
  name:               European Commission — Directorate-General for Internal Market,
                      Industry, Entrepreneurship and SMEs (DG GROW)
  website:            https://ec.europa.eu/growth/sectors/tourism
  enforcement:        Individual member state consumer protection authorities
  coordination:       CPC Network (Consumer Protection Cooperation)
```

### Regulatory Framework

The EU travel industry is governed primarily by the **Package Travel Directive (PTD)**
2015/2302/EU, transposed into national law by each member state. The PTD provides
comprehensive consumer protection for packages and introduces the concept of Linked
Travel Arrangements (LTAs) — a lower-obligation category for digitally connected
bookings that fall short of a full package.

The PTD applies when:
- Two or more different types of travel service are combined for the same trip
- From a single point of sale
- At an inclusive or total price
- For a period of more than 24 hours or including an overnight stay

**Linked Travel Arrangements (LTAs)** apply when a customer purchases additional
travel services from a seller who has access to their payment details from a prior
booking within 24 hours, or via a click-through link. LTAs require insolvency
protection and disclosure but not the full PTD package obligations.

**Member state variation:** While the PTD is harmonized at minimum level, member states
may exceed these protections. Germany (Reiserecht), France (Code du Tourisme), and
Italy (Codice del Turismo) have significant additional requirements. This entry covers
the EU-level baseline; member-state entries will be added in v0.2.

Secondary framework:
- **GDPR (2016/679)** — personal data protection, applies to all customer data
- **EU AI Act (2024/1689)** — AI system obligations; travel AI classification ongoing
- **Consumer Rights Directive (2011/83/EU)** — withdrawal rights, pre-contractual info
- **Unfair Commercial Practices Directive (2005/29/EC)** — misleading practices

### EU Licensing Requirements

---

**EU-LIC-001 — Package Organizer Registration**

Any party organizing packages as defined by the PTD must be registered as a package
organizer in its member state of establishment.

*Trigger:* selling_roles = any; product_type = package_two_components or
package_three_or_more meeting PTD definition; customer_type = consumer

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Required credential:* National travel organizer registration (varies by member state);
INSOLVENCY_PROTECTION documentation (Assurance Level 2–3)

*Licensing authority:* Member state authority (varies). Examples:
- Germany: Landesbehörde (state authority)
- France: Atout France (Immatriculation)
- Italy: Regione (regional government)
- Spain: Comunidad Autónoma (autonomous community)

*Legal basis:* PTD 2015/2302/EU Articles 11–18
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32015L2302

---

**EU-LIC-002 — Linked Travel Arrangement Facilitator**

Any party facilitating an LTA — providing a click-through to additional travel
services or retaining payment details — must provide insolvency protection and
disclosure, even if they do not qualify as a package organizer.

*Trigger:* Platform provides booking facilitation where customer purchases additional
travel services within 24 hours of initial booking, using retained payment details
or via targeted click-through

*Applies to roles:* ONLINE_TRAVEL_AGENCY, CHANNEL_MANAGER, ACCOMMODATION_SUPPLIER
(where facilitating activity bookings)

*Required credential:* INSOLVENCY_PROTECTION for LTA value (Assurance Level 2)

*Legal basis:* PTD Article 3(5) and Annex II

*Sandbox flag:* EU-PTD-LTA-BOUNDARY (where the facilitation/package boundary is unclear)

---

**EU-LIC-003 — IATA Accreditation for Air Components**

Any party selling air tickets as part of a package or independently must hold IATA
accreditation or sell through an IATA-accredited agent.

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Required credential:* IATA_ACCREDITATION (Assurance Level 3)

---

### EU Consumer Protection Requirements

---

**EU-CP-001 — Package Insolvency Protection**

Package organizers must provide insolvency protection covering 100% of customer
payments plus repatriation costs if the organizer becomes insolvent.

*Protection type:* insolvency_protection

*Trigger:* product_type = package (meeting PTD definition); customer_type = consumer

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT acting as organizer

*Minimum coverage:* 100% of all payments made by or on behalf of travelers, plus
repatriation cost for travelers already on their trip

*Mechanism options:* Insurance policy, bank guarantee, ring-fenced trust account,
or approved industry guarantee fund (varies by member state)

*Legal basis:* PTD Article 17
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32015L2302

---

**EU-CP-002 — LTA Insolvency Protection**

LTA facilitators must provide insolvency protection for the value of travel services
they have facilitated.

*Protection type:* insolvency_protection

*Trigger:* transaction constitutes LTA under PTD Article 3(5)

*Minimum coverage:* Value of travel services for which the facilitator has received
payment or through which payment was processed

*Legal basis:* PTD Article 19

---

**EU-CP-003 — GDPR Compliance for Customer Data**

All parties processing personal data of EU residents must comply with GDPR, including
legal basis for processing, data subject rights, data retention limits, and breach
notification.

*Protection type:* payment_protection (data category)

*Applies to roles:* All roles processing EU resident personal data

*Required credential:* DATA_PROTECTION_COMPLIANCE — documented GDPR compliance
program (Assurance Level 2–3)

*Legal basis:* GDPR 2016/679
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679

---

### EU Packaging Obligations

---

**EU-PKG-001 — Package Travel Obligations**

A combination meeting the PTD package definition triggers the full suite of package
organizer obligations.

*Threshold:* 2+ types of travel services (transport, accommodation, car rental, or
other tourist services); combined for the same trip; at inclusive/total price OR
from single point of sale; duration > 24h or includes overnight stay

*Obligations triggered:*
- Package organizer registration (EU-LIC-001)
- Insolvency protection (EU-CP-001)
- Pre-travel information (EU-DISC-001)
- Confirmation document (EU-DISC-002)
- Price revision: increases permitted only above 8% of package price with right to
  cancel without penalty
- Right of transfer: customer may transfer booking to another person with reasonable notice
- Significant alteration rights: customer may cancel without penalty if organizer makes
  significant changes
- Termination rights: customer may cancel for unavoidable extraordinary circumstances
  at destination
- Organizer liable for all services in the package (even those provided by third parties)
- Assistance obligation: organizer must provide assistance if traveler is in difficulty

*Split-seller exemption:* Available where services are booked from separate sellers
with separate contracts, no inclusive price, and no single point of sale that gives
the impression of a package

*Legal basis:* PTD Articles 5–21

---

**EU-PKG-002 — Linked Travel Arrangement Obligations**

Where the transaction constitutes an LTA rather than a package, a reduced set of
obligations applies.

*Threshold:* Click-through from one booking to another within 24 hours using retained
payment details, or targeted click-through (Article 3(5))

*Obligations triggered:*
- LTA facilitator registration (EU-LIC-002)
- Insolvency protection for facilitated value (EU-CP-002)
- LTA disclosure (EU-DISC-003)
- No liability for performance of individual services (unlike full package)

---

### EU Disclosure Requirements

---

**EU-DISC-001 — Pre-Travel Information**

Standardized pre-contractual information covering all key package terms, as specified
in PTD Annex I Part A, must be provided before the traveler is bound by the contract.

*Delivery timing:* before_booking  
*ATOP workflow state:* PROPOSAL

*Content required (PTD Annex I Part A):*
- Main characteristics of travel services (destinations, transport, accommodation,
  meal plan, visits, excursions, languages)
- Trade name and geographical address of organizer
- Total price including all taxes and fees
- Payment arrangements
- Minimum group size if applicable
- General passport and visa requirements
- Health formalities
- Withdrawal rights and cancellation conditions
- Insolvency protection information (name of insolvency protection body and contact)

*Legal basis:* PTD Article 5 and Annex I

---

**EU-DISC-002 — Confirmation Document**

A confirmation document or booking confirmation on durable medium must be provided
at or promptly after conclusion of the package travel contract.

*Delivery timing:* at_confirmation  
*ATOP workflow state:* CONFIRMATION

*Content required:* All Annex I Part A information plus:
- Receipt of advance payment
- Emergency telephone number or contact point
- Information on optional and compulsory insurance
- Guidance on trip interruption insurance

*Legal basis:* PTD Article 7

---

**EU-DISC-003 — Linked Travel Arrangement Notice**

Before conclusion of an LTA, the facilitator must provide a standardized notice
informing the traveler that they are not purchasing a package and do not have full
package protections.

*Delivery timing:* before_booking  
*ATOP workflow state:* INQUIRY acknowledgment

*Required content:* PTD Annex II standard notice form, in the language of the
transaction

*Legal basis:* PTD Article 19(4) and Annex II

---

**EU-DISC-004 — AI Agent Disclosure (Pending)**

The EU AI Act Article 50 requires disclosure when AI systems interact with natural
persons. Application to travel AI agents is under regulatory clarification.

*Status:* Pending — EU-AI-ACT-TRAVEL sandbox flag active  
*ATOP workflow state:* INQUIRY (where AI agent initiates)

---

### EU Associated Regulatory Domains

---

**EU-DOM-FOOD-001 — Food Safety**

*Domain type:* food_safety · Tier 1  
*Governing authority:* EFSA (European Food Safety Authority) for standards; member
state food safety authorities for enforcement. Examples: BfR (Germany), ANSES (France),
FSA (formerly UK, now separate — see GB entry)

*Required credentials:*
- FOOD_ESTABLISHMENT_LICENSE — registration with competent authority (Assurance Level 2)
- HACCP_CERTIFICATION — mandatory for all food businesses above micro-enterprise
  (Assurance Level 3 for certified operators, Level 2 for documented self-assessment)
- FOOD_ALLERGY_MANAGEMENT — Allergen labeling compliance required (Regulation 1169/2011)

*Legal basis:* Regulation (EC) 852/2004 (food hygiene); Regulation (EU) 1169/2011
(food information to consumers)

---

**EU-DOM-TRANSPORT-001 — Ground Transport**

*Domain type:* ground_transport · Tier 1  
*Governing authority:* National transport ministries; European Commission DG MOVE

*Required credentials:*
- TRANSPORT_OPERATOR_LICENSE — Community licence for international transport; national
  licence for domestic (Assurance Level 3)
- DRIVER_CPC — Certificate of Professional Competence, mandatory for commercial
  passenger vehicle drivers (Assurance Level 3)
- VEHICLE_ROADWORTHINESS_CERT — Annual technical inspection (Assurance Level 2)

*Driver hour limits (Regulation (EC) 561/2006):* 9h/day (extendable to 10h twice per
week); 56h/week; 90h per two consecutive weeks; mandatory 45-minute break after 4.5h

*Legal basis:* Regulation (EC) 1071/2009 (operator licensing); Regulation (EC) 561/2006
(driver hours)

---

**EU-DOM-MARITIME-001 — Maritime Operations**

*Domain type:* maritime · Tier 1  
*Governing authority:* Member state maritime authorities; EMSA (European Maritime
Safety Agency) for coordination

*Required credentials:*
- VESSEL_SAFETY_CERT — annual inspection by flag state authority (Assurance Level 2–3)
- MARITIME_OPERATOR_LICENSE — national license for commercial passenger operations
  (Assurance Level 3)
- MASTER_CERTIFICATE — STCW Certificate of Competency (Assurance Level 3)

*Legal basis:* Directive 2009/45/EC (passenger ships); STCW Convention (seafarer
certification)

---

### EU Sandbox Flags

---

**EU-PTD-LTA-BOUNDARY**

*Flag name:* Package vs. LTA Boundary — Hotel Activity Facilitation  
*Category:* packaging · *Status:* active

*Ambiguity:* When a hotel presents activity options to guests and facilitates booking
through a third-party system, the boundary between "facilitation" (not an LTA) and
an actual LTA under Article 3(5) is unclear. Specifically: does embedding a third-party
booking widget on a hotel website constitute "targeted click-through" triggering LTA
status? ECJ has not ruled.

*Compliant path available:* Yes — separate booking flows with clear visual separation,
separate payment processing, no retention of payment details between bookings, and
explicit disclosure that each is a separate contract.

*Consumer disclosure required:* Yes — informing customer that accommodation and activity
are separate contracts

*Reform reference:* EC PTD review process, scheduled for 2026

---

**EU-AI-ACT-TRAVEL**

*Flag name:* EU AI Act Application to Travel AI Agents  
*Category:* ai_agent · *Status:* active

*Ambiguity:* EU AI Act Article 6 defines high-risk AI systems. Whether AI agents that
initiate travel bookings involving financial commitments qualify as high-risk under
Annex III is under review. If classified as high-risk, additional conformity assessment,
transparency, and human oversight requirements apply.

*Compliant path available:* Yes — ATOP's Agentic Authorization Framework implements
human oversight requirements consistent with EU AI Act Article 14 regardless of final
classification.

*Reform reference:* EC implementing regulations under EU AI Act, expected 2026–2027

---

### EU Government Advisory Sources

| Source ID | Authority | Feed URL | Format | ATOP Mapping |
|---|---|---|---|---|
| `advisory:eu:easa-czib` | EASA | https://www.easa.europa.eu/en/domains/air-operations/czibs | HTML/manual | CZIB issued→WARNING or CRITICAL depending on severity |
| `advisory:eu:ec-travel` | European Commission | https://ec.europa.eu/consularprotection/content/travel-advice_en | manual | As published |
| `advisory:eu:ecdc` | ECDC (health) | https://www.ecdc.europa.eu/en/threats-and-outbreaks | RSS | Outbreak→WARNING, Pandemic→CRITICAL |

---

## United Kingdom (GB)

```
jurisdiction_code:    GB
jurisdiction_name:    United Kingdom
entry_version:        0.1
entry_status:         partial
last_updated:         2026-03-04
co_maintained_by:     (target: atop:party:gb:cma)
primary_regulatory_body:
  name:               Competition and Markets Authority (CMA)
  website:            https://www.gov.uk/government/organisations/competition-and-markets-authority
secondary_bodies:
  - Civil Aviation Authority (CAA) — ATOL scheme
    website: https://www.caa.co.uk/atol-protection/
  - Financial Conduct Authority (FCA) — insurance components
```

### Regulatory Framework

The UK retained the EU Package Travel Directive post-Brexit as the **Package Travel
and Linked Travel Arrangements Regulations 2018** (SI 2018/634), substantively
identical to the PTD. The UK framework is therefore closely aligned with the EU entry
above, with the following key differences:

**ATOL (Air Travel Organiser's Licence):** The CAA's ATOL scheme is the UK's most
distinctive consumer protection mechanism. Any party selling flight-inclusive holidays
to UK customers must hold an ATOL certificate. ATOL covers repatriation and refund if
the licence holder becomes insolvent — and is one of the most tested insolvency
protection schemes in the world, having paid out in multiple major airline and tour
operator insolvencies.

**Post-Brexit divergence potential:** The UK government has indicated potential for
divergence from EU rules in digital services and AI. The DSIT AI governance framework
is principles-based, potentially allowing more flexible AI deployment than the EU AI
Act's risk-based classification system.

### GB Licensing Requirements

---

**GB-LIC-001 — Package Organizer Registration**

Same threshold as EU-LIC-001. Registration with the relevant national authority.

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Licensing authority:* No central licensing body equivalent to some EU member states.
Package organizers must comply with the Regulations and maintain insolvency protection.
ABTA membership provides a recognized insolvency protection mechanism.

*Required credential:* INSOLVENCY_PROTECTION (Assurance Level 2); ATOL_CERTIFICATE
if selling flight-inclusive packages (Assurance Level 3)

*Legal basis:* Package Travel and Linked Travel Arrangements Regulations 2018 (SI 2018/634)
https://www.legislation.gov.uk/uksi/2018/634

---

**GB-LIC-002 — ATOL Certificate for Flight-Inclusive Packages**

Any party selling flight-inclusive packages to UK customers must hold an ATOL
certificate from the CAA.

*Trigger:* product includes flight; customer_type = consumer; sale_jurisdiction = GB

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Required credential:* ATOL_CERTIFICATE (Assurance Level 3)

*Licensing authority:* Civil Aviation Authority
https://www.caa.co.uk/atol-protection/

*Legal basis:* Civil Aviation Act 1982 Section 71; ATOL Regulations 2012

---

**GB-LIC-003 — PSV Operator Licence for Transport**

Commercial passenger vehicles above 8 passenger seats require a Public Service Vehicle
(PSV) operator licence.

*Applies to roles:* TRANSPORT_SUPPLIER

*Required credential:* PSV_OPERATOR_LICENCE (Assurance Level 3)

*Licensing authority:* Driver and Vehicle Licensing Agency (DVLA) / Traffic
Commissioners

*Legal basis:* Public Passenger Vehicles Act 1981

---

### GB Consumer Protection Requirements

---

**GB-CP-001 — Package Insolvency Protection**

Same requirements as EU-CP-001. 100% of payments plus repatriation costs.

*Mechanism options in GB:*
- ATOL certificate (for flight-inclusive packages)
- ABTA bonding scheme
- Insurance policy approved by the CAA
- Ring-fenced trust account

*Legal basis:* PTL Regulations 2018 Regulation 20

---

**GB-CP-002 — ATOL Financial Protection**

ATOL-certified operators must contribute to the Air Travel Trust Fund (ATT).
Consumer receives ATOL certificate confirming protection.

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY (flight-inclusive)

*ATOP note:* The ATOL certificate number must be included in the CONFIRMATION document
and in all marketing materials. This is a GB-specific field in the disclosure schema.

*Legal basis:* ATOL Regulations 2012 Regulation 14

---

### GB Packaging Obligations

**GB-PKG-001 — Package Travel Obligations**

Identical to EU-PKG-001. The PTL Regulations 2018 replicate PTD obligations.

**GB-PKG-002 — Linked Travel Arrangement Obligations**

Identical to EU-PKG-002. LTA concept retained in UK regulations.

---

### GB Disclosure Requirements

**GB-DISC-001 — Pre-Travel Information**

Identical to EU-DISC-001 (PTD Annex I Part A), adapted for UK law.

Additional GB-specific requirement: ATOL certificate number in all pre-contractual
information where ATOL applies.

**GB-DISC-002 — Confirmation Document**

Identical to EU-DISC-002 with ATOL certificate number where applicable.

**GB-DISC-003 — LTA Notice**

Identical to EU-DISC-003 (PTD Annex II standard notice), in English.

---

### GB Associated Regulatory Domains

**GB-DOM-FOOD-001 — Food Safety**

*Governing authority:* Local Authority Environmental Health departments; Food Standards
Agency (FSA)

*Required credentials:*
- FOOD_BUSINESS_REGISTRATION — free registration with local authority (Assurance Level 2)
- FOOD_HYGIENE_RATING — Food Hygiene Rating Scheme (FHRS) score publicly available
  (Assurance Level 2)
- FOOD_HANDLER_TRAINING — Food Safety Level 2 Award minimum for food handlers
  (Assurance Level 2)

*Legal basis:* Food Safety Act 1990; Food Hygiene (England) Regulations 2006

**GB-DOM-TRANSPORT-001 — Ground Transport**

*Driver hours:* UK retained EU driver hours rules for HGVs; PSV (coach/bus) rules:
10h driving/day, 11h duty/day. Taxi/private hire: no formal hour limits but licensing
conditions apply.

*Required credentials:*
- PSV_OPERATOR_LICENCE — Traffic Commissioner (Assurance Level 3)
- DRIVER_CPC — Certificate of Professional Competence for PSV drivers (Assurance Level 3)
- PHV_LICENCE — Private Hire Vehicle licence from local authority for taxis (Assurance Level 2–3)

**GB-DOM-MARITIME-001 — Maritime Operations**

*Governing authority:* Maritime and Coastguard Agency (MCA)

*Required credentials:*
- MCA_VESSEL_CERT — Coding Certificate or Class VI/VIA passenger vessel certificate
  depending on vessel type and route (Assurance Level 3)
- MASTER_CERTIFICATE — RYA Yachtmaster Commercial or MCA OOW depending on vessel
  (Assurance Level 3)

*Legal basis:* Merchant Shipping Act 1995; MSN 1672(M) (small commercial vessels)

---

### GB Sandbox Flags

**GB-PTD-LTA-DIGITAL**

*Flag name:* Digital Platform LTA Boundary — Post-Brexit Uncertainty  
*Category:* packaging · *Status:* active

*Ambiguity:* The UK retained EU PTD's LTA concept but the CMA's interpretation of
the digital facilitation boundary may diverge from EU as the two frameworks develop
independently post-Brexit. UK platforms must monitor both UK and EU interpretations
if they operate in both markets.

*Compliant path:* Same as EU-PTD-LTA-BOUNDARY

---

**GB-AI-AGENT-001**

*Flag name:* AI Agent Booking — UK Principles-Based Framework  
*Category:* ai_agent · *Status:* active

*Ambiguity:* UK AI governance is principles-based (DSIT 2023 framework) with no
sector-specific travel rules. No binding obligation addresses AI agents in travel.
Whether AI-assisted booking requires disclosure is unresolved.

*Compliant path:* ATOP Agentic Authorization Framework with Level 2 maximum; human
confirmation at CONFIRMATION state

*Reform reference:* DSIT AI regulation consultation ongoing; no sector-specific
travel rules anticipated in near term

---

### GB Government Advisory Sources

| Source ID | Authority | Feed URL | Format | ATOP Mapping |
|---|---|---|---|---|
| `advisory:gb:fcdo` | UK FCDO | https://www.gov.uk/foreign-travel-advice | RSS/HTML | Advise against all travel→CRITICAL; Advise against all but essential→WARNING; Some risk→CAUTION |
| `advisory:gb:met-office` | Met Office | https://www.metoffice.gov.uk/weather/warnings-and-advice/uk-warnings | RSS | Red warning→CRITICAL, Amber→WARNING, Yellow→CAUTION |

---

## United States (US)

```
jurisdiction_code:    US
jurisdiction_name:    United States of America
entry_version:        0.1
entry_status:         partial
last_updated:         2026-03-04
note:                 US travel regulation is primarily state-level. This entry
                      covers the federal baseline and key state regimes. Full
                      state-by-state entries will be added in v0.2.
primary_regulatory_body:
  name:               Federal Trade Commission (FTC) — consumer protection baseline
  website:            https://www.ftc.gov
  note:               No federal travel agency licensing law exists. State Attorneys
                      General are the primary enforcement bodies for travel fraud.
```

### Regulatory Framework

The United States has no federal travel agency licensing law. Regulation is primarily
at the state level through **Seller of Travel (SOT)** statutes. Approximately 7 states
have active SOT registration requirements; the most significant are California, Florida,
Hawaii, Iowa, Nevada, and Washington. California's regime is the most comprehensive
and most relevant because of its extraterritorial reach — it applies to any seller
offering travel services to California residents regardless of where the seller is
located.

Federal-level consumer protection is provided by:
- **FTC Act Section 5** — prohibits unfair or deceptive acts or practices; applies to
  travel but no travel-specific rules
- **DOT regulations** — govern air travel (14 CFR); not addressed in this entry
- **FTC Travel Guides** (non-binding) — guidance on disclosure in travel advertising

The absence of federal harmonization means a global OTA must track each relevant state
separately. The compliance burden is disproportionate to the size of the market in some
states, and the rules are not always consistent with each other.

### US Licensing Requirements

---

**US-LIC-001 — California Seller of Travel Registration**

Any party selling travel services to California residents — regardless of where the
seller is located — must register as a Seller of Travel with the California Attorney
General and participate in the Travel Consumer Restitution Corporation (TCRC) or
maintain equivalent restitution program participation.

*Trigger:* customer_jurisdiction includes California; product_type = any travel service
with prepayment; any value

*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY

*Required credential:* CA_SELLER_OF_TRAVEL_REGISTRATION (Assurance Level 2)

*Exemption:* Sellers whose principal place of business is outside the US are not
required to register if they do not have a physical presence in California and do
not sell to California residents using a California-resident agent.

*Legal basis:* California Business & Professions Code § 17550 et seq.
https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=17550

---

**US-LIC-002 — Florida Seller of Travel Registration**

Florida requires Seller of Travel registration for any entity selling travel to Florida
residents or from Florida.

*Required credential:* FL_SELLER_OF_TRAVEL_REGISTRATION (Assurance Level 2)

*Legal basis:* Florida Statutes § 559.926 et seq.

---

**US-LIC-003 — Washington Seller of Travel Registration**

Washington State requires registration for travel sellers. Unlike California, the
Washington regime does not have explicit extraterritorial reach but applies to any
seller with a nexus in Washington.

*Required credential:* WA_SELLER_OF_TRAVEL_REGISTRATION (Assurance Level 2)

*Legal basis:* Washington Revised Code § 19.138 et seq.

---

**US-LIC-004 — FMCSA Operating Authority for Interstate Transport**

Any motor carrier transporting passengers across state lines for compensation must
obtain FMCSA Operating Authority (MC Number) in addition to state-level licensing.

*Applies to roles:* TRANSPORT_SUPPLIER

*Required credential:* FMCSA_MC_NUMBER (Assurance Level 3)

*Legal basis:* 49 CFR Part 365

---

### US Consumer Protection Requirements

---

**US-CP-001 — California TCRC Participation**

California SOT-registered sellers must participate in the Travel Consumer Restitution
Corporation (TCRC) unless they maintain a surety bond of at least $20,000 and maintain
an escrow account for customer advance payments.

*Protection type:* insolvency_protection (partial)

*Minimum coverage:* TCRC maximum restitution: $15,000 per consumer; $50,000 per year
per seller

*Note:* TCRC coverage is significantly lower than EU insolvency protection requirements.
This is a meaningful gap for high-value packages.

*Legal basis:* California Business & Professions Code § 17550.7

---

**US-CP-002 — FTC Disclosure Requirements for Online Travel**

While not sector-specific legislation, FTC enforcement actions establish baseline
disclosure requirements for online travel sellers: clear display of total price
(including all fees before checkout), clear cancellation policy disclosure, and
honest representation of availability and ratings.

*Protection type:* payment_protection (disclosure-based)

*Legal basis:* FTC Act Section 5; FTC Enforcement Policy Statement on Deceptive
Pricing (2022)

---

### US Packaging Obligations

The United States has no statutory definition of a "travel package" with equivalent
obligations to the EU PTD. Package obligations in the US are primarily contractual —
defined by the seller's own terms — with FTC oversight for deceptive practices.

**US-PKG-001 — Effective Package Rule (FTC enforcement)**

While there is no statute, FTC enforcement has established that:
- A seller who represents a combination of services as a "package" must honor the
  representation
- Bundled pricing that obscures individual component costs may be deceptive if the
  bundle cannot actually be purchased at the advertised price
- Cancellation and refund terms for packages must be clearly disclosed before purchase

*ATOP note:* The absence of a statutory package definition in the US means ATOP's
split-seller vs. package distinction is primarily relevant for EU/UK/JP compliance
when US customers are traveling to those jurisdictions. For US-domestic travel, the
contractual and FTC framework governs.

---

### US Disclosure Requirements

---

**US-DISC-001 — Price Transparency (FTC)**

Total price including all mandatory fees must be clearly displayed before checkout.
Hidden or drip pricing — revealing fees incrementally — is an FTC enforcement priority.

*Delivery timing:* before_booking  
*ATOP workflow state:* PROPOSAL

---

**US-DISC-002 — Cancellation Policy (FTC / State)**

Cancellation terms must be clearly disclosed before purchase. California requires
specific cancellation policy disclosure for travel sellers.

*Delivery timing:* before_booking  
*ATOP workflow state:* PROPOSAL and CONFIRMATION

---

**US-DISC-003 — Seller Identity and Registration**

California SOT-registered sellers must display their SOT registration number and the
TCRC participation notice in all advertising and at point of sale.

*Delivery timing:* before_booking  
*Applies to roles:* TOUR_OPERATOR, TRAVEL_AGENT, ONLINE_TRAVEL_AGENCY (CA-registered)

---

### US Associated Regulatory Domains

**US-DOM-FOOD-001 — Food Safety**

*Governing authority:* State health departments (FDA Food Code is model code, state-
adopted). FDA (federal) for manufactured food; USDA for meat and poultry.

*Required credentials:*
- FOOD_ESTABLISHMENT_PERMIT — state/county permit (Assurance Level 2)
- FOOD_HANDLER_CERT — state-specific food handler certification (Assurance Level 2)
- HACCP_PLAN — required for certain food service operations (Assurance Level 2–3)

*Note:* Requirements vary significantly by state and county. California, New York,
and Texas have comprehensive frameworks; rural jurisdictions vary.

**US-DOM-TRANSPORT-001 — Ground Transport**

*Governing authority:* FMCSA (interstate); state DMVs and PUCs (intrastate)

*Required credentials:*
- FMCSA_MC_NUMBER — interstate operations (Assurance Level 3)
- STATE_LIVERY_LICENSE — varies by state (Assurance Level 2)
- VEHICLE_INSPECTION_CERT — annual state inspection (Assurance Level 2)

*Driver hours (49 CFR Part 395):* 10h driving after 8h off-duty; 15h on-duty window;
60/70h in 7/8 consecutive days

**US-DOM-MARITIME-001 — Maritime Operations**

*Governing authority:* United States Coast Guard (USCG)

*Required credentials:*
- USCG_COI — Certificate of Inspection for passenger vessels carrying more than 6
  passengers for hire (Assurance Level 3)
- OUPV_LICENSE — Operator of Uninspected Passenger Vessel ("6-pack" licence) for
  vessels carrying up to 6 passengers (Assurance Level 3)
- MARINE_LIABILITY_INSURANCE — required for commercial operations (Assurance Level 2)

*Legal basis:* 46 CFR Subchapter T (small passenger vessels); 46 CFR Subchapter K
(small passenger vessels — international)

---

### US Sandbox Flags

---

**US-SOT-EXTRATERRITORIAL**

*Flag name:* California SOT Extraterritorial Application to Non-US Sellers  
*Category:* licensing · *Status:* active

*Ambiguity:* California's SOT law applies to "any person" selling travel to California
residents. The extraterritorial reach to non-US sellers with no California physical
presence is untested in litigation but implied by the statute. Non-US sellers serving
California customers face legal uncertainty about whether they must register.

*Compliant path available:* Yes — registration with California Attorney General is
straightforward and relatively low-cost. Recommended for any non-US seller with
material California customer volume.

---

**US-SOT-AI-AGENT**

*Flag name:* AI Agent Booking Initiation — No State SOT Law Addresses  
*Category:* ai_agent · *Status:* active

*Ambiguity:* No US state Seller of Travel law addresses AI agents acting on behalf of
consumers. Whether the AI agent, the platform deploying it, or the consumer is the
"seller" for SOT purposes is unresolved.

*Compliant path:* ATOP Agentic Authorization Framework: human consumer provides binding
confirmation, agent acts under declared authorization, Platform holds any required SOT
registration as the technology provider

---

### US Government Advisory Sources

| Source ID | Authority | Feed URL | Format | ATOP Mapping |
|---|---|---|---|---|
| `advisory:us:state-dept` | US State Department | https://travel.state.gov/content/travel/en/traveladvisories/RSS.xml | RSS | Level 4→CRITICAL, Level 3→WARNING, Level 2→CAUTION, Level 1→MONITOR |
| `advisory:us:cdc-travel` | CDC | https://wwwnc.cdc.gov/travel/rss/destinationlist.xml | RSS | Warning Level 3→WARNING, Alert Level 2→CAUTION, Watch Level 1→MONITOR |
| `advisory:us:noaa` | NOAA (weather) | https://alerts.weather.gov/cap/us.atom | ATOM | Extreme→CRITICAL, Severe→WARNING, Moderate→CAUTION |

---

## Advisory Sources Registry

Full registry of all government advisory sources referenced in this document and
available for ATOP Disruption Event integration.

| Source ID | Jurisdiction | Authority | Feed Type | ATOP Severity Mapping |
|---|---|---|---|---|
| `advisory:jp:mofa` | JP | Ministry of Foreign Affairs | RSS | Danger/Evacuation→CRITICAL, Caution→WARNING, Watch→CAUTION, Info→MONITOR |
| `advisory:jp:jma` | JP | Japan Meteorological Agency | JSON | Special Warning→CRITICAL, Warning→WARNING, Advisory→CAUTION |
| `advisory:jp:jta-disruption` | JP | Japan Tourism Agency | manual | As published |
| `advisory:eu:easa-czib` | EU | EASA | manual | Per CZIB severity |
| `advisory:eu:ecdc` | EU | European Centre for Disease Prevention | RSS | Outbreak→WARNING, Pandemic→CRITICAL |
| `advisory:gb:fcdo` | GB | UK Foreign Commonwealth & Development Office | HTML/RSS | Against all→CRITICAL, Against non-essential→WARNING, Some risk→CAUTION |
| `advisory:gb:met-office` | GB | Met Office | RSS | Red→CRITICAL, Amber→WARNING, Yellow→CAUTION |
| `advisory:us:state-dept` | US | US Department of State | RSS | L4→CRITICAL, L3→WARNING, L2→CAUTION, L1→MONITOR |
| `advisory:us:cdc-travel` | US | Centers for Disease Control | RSS | L3→WARNING, L2→CAUTION, L1→MONITOR |
| `advisory:iata:czib` | Global | IATA | manual | Per IATA severity classification |
| `advisory:icao:nob` | Global | ICAO | manual | Per NOTAM/NOB type |
| `advisory:un:ocha` | Global | UN OCHA | RSS | Flash→CRITICAL, Alert→WARNING, Update→CAUTION |

---

## Planned Entries

The following jurisdiction entries are planned for v0.2 of this document:

| Jurisdiction | Priority | Notes |
|---|---|---|
| Australia (AU) | High | ATAS (Australian Travel Accreditation Scheme); significant inbound from Japan |
| Singapore (SG) | High | Singapore Tourism Board; key ASEAN hub; ATOP deployment target |
| South Korea (KR) | High | Korea Tourism Organization; large Japan-Korea travel corridor |
| France (FR) | Medium | Member state entry; Atout France registration; significant ski market |
| Germany (DE) | Medium | Member state entry; Reiserecht; major outbound market |
| Thailand (TH) | Medium | Tourism Authority of Thailand; large inbound market |
| New Zealand (NZ) | Low | Tourism New Zealand; adventure tourism regulatory model of interest |
| Canada (CA) | Low | TICO (Ontario) and provincial travel agent licensing |

Member state entries for EU will be added as separate entries that reference and
extend the EU baseline entry rather than duplicating it.

---

*Document status: Draft v0.1 — March 2026*  
*Next revision: v0.2 — full status for all four primary jurisdictions following*  
*regulatory body review engagement*  
*Maintainer: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
