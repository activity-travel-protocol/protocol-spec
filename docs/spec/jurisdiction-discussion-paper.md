# Global Travel Regulation and the Challenge of Jurisdiction: A Discussion Paper

**Document type:** Discussion Paper / White Paper  
**Version:** 0.1 (Draft)  
**Date:** March 2026  
**Prepared by:** ATOP Protocol — Activity and Travel Orchestration Protocol  
**Repository:** atop-protocol/atop-spec  
**Related documents:** Jurisdiction Compliance Registry Specification v0.2,
Jurisdiction Entries v0.1  

---

## A Note on This Document

This paper is addressed simultaneously to two audiences: government regulators and
industry participants. Both need to understand the same problem from different angles.

To regulators: this paper describes where existing consumer protection frameworks are
failing travelers — and why those failures are about to get significantly worse as AI
agents reshape the booking experience. It proposes ATOP as infrastructure that extends
the reach of your existing regulatory intent into new business models and new
technologies.

To industry participants: this paper describes the compliance complexity that global
OTAs, tour operators, and accommodation providers navigate daily — often without the
tools to navigate it correctly — and why AI-assisted booking makes that complexity
simultaneously more important and harder to manage manually.

The analysis is evidence-based. The intent is constructive. ATOP's goal is not to
work around travel regulation but to make it work in a world the regulations were not
designed for.

---

## Table of Contents

1. [The Problem: Where the Regulatory Framework Is Failing Travelers](#1-the-problem)
2. [The Structural Cause: Jurisdictions Were Designed for a Different World](#2-the-structural-cause)
3. [The AI Accelerant: Why the Gap Is Growing Faster Than It Can Be Closed Manually](#3-the-ai-accelerant)
4. [Cross-Jurisdiction Comparison: How the Four Primary Frameworks Compare](#4-cross-jurisdiction-comparison)
5. [Where Global Operators Find It Hardest: Technology and Operational Challenges](#5-where-global-operators-find-it-hardest)
6. [The Cross-Border Problem: When Three Jurisdictions Apply Simultaneously](#6-the-cross-border-problem)
7. [What ATOP Provides: Closing the Gap Without Replacing Regulation](#7-what-atop-provides)
8. [A Path Forward: Recommendations for Regulatory Engagement](#8-a-path-forward)

---

## 1. The Problem: Where the Regulatory Framework Is Failing Travelers

Travel regulation exists for a clear purpose: to protect consumers who are far from
home, who have paid money in advance, and who have limited recourse if something goes
wrong. That purpose is as valid today as it was when the first travel agency licensing
laws were written.

But the framework is failing — in specific, concrete, documented ways.

### 1.1 The Insolvent Operator Problem

When a travel company collapses, customers lose money. The regulatory frameworks in
all major jurisdictions have mechanisms to address this — insolvency protection bonds,
trust accounts, ATOL certificates. These mechanisms work when they apply.

The problem is coverage gaps. The growth of online booking has created a landscape
where customers book multi-supplier trips assembled across multiple platforms, none of
which may individually cross the threshold that triggers insolvency protection.

**A concrete example:** A traveler books accommodation through a hotel website, an
activity through a local operator's booking page, and ground transport through a
ride-hailing app. Each transaction is below any individual threshold. The traveler has
no insolvency protection on any component. If any provider fails, the traveler has no
recourse beyond a credit card chargeback — which itself depends on the payment method
used and the jurisdiction of the card issuer.

This is not a theoretical risk. Travel company insolvencies increased significantly
after COVID and continue at elevated rates. The customers most exposed are those
assembling trips across multiple platforms — which is increasingly how modern travelers
book.

### 1.2 The Duty of Care Gap

When a traveler is harmed — stranded by a disruption, injured during an activity,
left without accommodation due to an overbooking — someone has a duty of care
obligation. But in a multi-supplier booking assembled outside a licensed package
framework, who that someone is may be genuinely unclear.

The tour operator who holds the license? They may not have been in the booking chain
at all. The platform who facilitated the booking? Most platforms disclaim liability
explicitly in their terms. The individual suppliers? Each claims responsibility for
their component only.

In Japan, the Middle East airspace crisis of early 2026 left thousands of Japanese
outbound travelers in precisely this situation. Multiple airlines rerouted or cancelled
flights. Hotels held reservations that could no longer be reached. Activity bookings
were stranded in place. No single party had a clear, enforceable duty of care
obligation across the whole journey. Response was ad hoc, manual, and slow.

ATOP was designed with this exact scenario in mind. The Duty of Care Declaration — a
required component of every ATOP Trust Chain — explicitly names which party holds
primary duty of care at each phase of the journey, before the journey begins.

### 1.3 The Disclosure Failure

Before a traveler commits to a purchase, they are legally entitled to specific
information in every major jurisdiction: who they are contracting with, what the
cancellation terms are, what protections are in place if the seller becomes insolvent,
how to complain if something goes wrong.

In practice, these disclosures are frequently incomplete, buried in terms and conditions
that no consumer reads, or simply absent when booking is fragmented across multiple
platforms.

Research by consumer protection authorities in the EU (2023 CPC Network sweep) and the
UK (CMA 2022 investigation) found that a significant proportion of online travel
bookings fail to provide required pre-contractual information in the legally mandated
form. The problem is structural: the tools that generate these disclosures were built
for single-supplier bookings and do not compose across multiple suppliers in a
multi-component itinerary.

### 1.4 The Licensing Arbitrage Problem

Travel agency licensing laws were written before global digital platforms existed.
The result is a form of regulatory arbitrage: a platform headquartered in a jurisdiction
with minimal licensing requirements — or in a jurisdiction where the regulatory
interpretation of "travel agency business" is narrow — can sell packages to customers
in jurisdictions with comprehensive consumer protection frameworks without being subject
to those frameworks.

This is not theoretical. Major OTAs have structured their legal entities specifically
to minimize travel agency licensing exposure. The regulatory burden falls on compliant
local operators who hold licenses and maintain bonds, while unlicensed global platforms
compete in the same market without equivalent consumer protection obligations.

---

## 2. The Structural Cause: Jurisdictions Were Designed for a Different World

The consumer protection failures described in Section 1 are not the result of bad
regulatory intent. They are the result of regulatory frameworks designed for a world
that no longer exists — and the frameworks have not kept pace.

### 2.1 The World Travel Regulation Was Designed For

Travel regulation was designed for a world where:
- A traveler walked into a travel agency on a high street
- The travel agent assembled the trip, held the customer's money, and was accountable
  for the whole experience
- The agency held a license, maintained a bond, and was subject to regular inspection
- If something went wrong, there was a single identifiable party to hold responsible

Every major travel regulatory framework — Japan's Travel Agency Act, the EU Package
Travel Directive, the UK ATOL scheme, the US Seller of Travel statutes — was designed
around this model. The regulations are coherent and the consumer protections are strong
within this model.

### 2.2 The World Travel Now Operates In

Today's travel commerce looks nothing like this model:

- A traveler researches on one platform, compares prices on another, books accommodation
  directly through a hotel website, activities through a local operator's app, and
  transport through a ride-sharing service
- No single party holds all of the money or has full visibility of the itinerary
- AI assistants increasingly assemble itinerary options and initiate bookings
- The "travel agent" may be an algorithm running in a data center in a different
  jurisdiction from any party in the transaction

The regulatory frameworks have been amended and extended to partially address this
reality — the EU's introduction of Linked Travel Arrangements in the 2015 PTD is one
example. But the amendments remain reactive, partial, and always several years behind
the technology.

### 2.3 The National Boundary Problem

Travel is inherently cross-border, but regulation is inherently national. When a
Japanese tourist books a ski trip in France through a US OTA, three distinct regulatory
frameworks potentially apply:

- Japanese consumer protection law (the customer's home jurisdiction)
- French travel and activity regulations (the consumption jurisdiction)
- US law governing the OTA's operation (the platform's home jurisdiction)

These frameworks may have conflicting requirements, different definitions of what
constitutes a package, different thresholds for insolvency protection, and different
disclosure requirements. No existing mechanism coordinates between them. The customer
navigates — or more often, does not navigate — the resulting complexity alone.

---

## 3. The AI Accelerant: Why the Gap Is Growing Faster Than It Can Be Closed Manually

The regulatory gap described in Sections 1 and 2 is not new. Industry has managed it
imperfectly for years through manual compliance processes, legal teams, and
jurisdictional entity structuring. The advent of AI agents in travel is about to make
manual management impossible.

### 3.1 The Speed Problem

An AI travel agent can search, configure, negotiate, and initiate bookings across
multiple suppliers in seconds. Manual compliance review takes days. When an AI agent
assembles a multi-supplier itinerary for a customer, there is no moment in the workflow
where a human compliance professional can evaluate whether the configuration is
compliant in all applicable jurisdictions before the customer commits.

Without machine-readable compliance infrastructure, AI-assisted booking will
systematically operate outside compliance frameworks — not through malicious intent,
but through the structural impossibility of manual review at AI speed.

### 3.2 The Accountability Problem

When a human travel agent books a trip that turns out to be non-compliant, there is a
clear accountability chain: the agent, their employer, the license they hold. When an
AI agent books a trip that is non-compliant, the accountability chain is genuinely
unclear.

Is it the platform that deploys the AI? The customer who authorized it? The supplier
who accepted the booking? The LLM provider whose model generated the booking
recommendation? In the absence of a clear declaration framework for AI agent
authorization — with explicit scope, limits, and accountability assignment — courts
and regulators will face years of uncertainty.

ATOP's Agentic Authorization Framework addresses this directly. Every AI agent acting
in an ATOP transaction acts under a signed Authorization Declaration from a registered
Party. The Party is accountable. The agent's scope is declared. The human confirmation
checkpoints are specified. This is not a theoretical future state — it is the framework
operating now.

### 3.3 The Regulatory Status of AI Agents in Travel: A Gap in All Jurisdictions

As of March 2026, no jurisdiction has definitively addressed AI agents in travel
agency regulation. The following table summarizes the current state:

| Jurisdiction | AI Regulation Framework | Travel-Specific AI Rules | ATOP Relevance |
|---|---|---|---|
| JP | AI governance discussion ongoing; JTA AI working group active | None issued | JP-AI-AGENT-001 sandbox flag active |
| EU | EU AI Act in force; Article 6 high-risk classification under review | None yet issued | EU AI Act compliance mapped in ATOP agent authorization schema |
| UK | Principles-based AI governance (DSIT framework 2023); no sector rules | None issued | UK sandbox flag pending |
| US | FTC guidance only; no binding federal AI law; state laws emerging | None issued | US sandbox flag pending |

This table represents an extraordinary opportunity. The first framework to define
clearly how AI agents should behave in travel transactions — with legal accountability,
declared scope, and consumer protection built in — will shape how every jurisdiction
develops its rules. ATOP's Agentic Authorization Framework exists today. It can be
that framework.

---

## 4. Cross-Jurisdiction Comparison: How the Four Primary Frameworks Compare

This section compares the travel regulatory frameworks of Japan, the European Union,
the United Kingdom, and the United States across the dimensions most relevant to
ATOP's compliance model. All four jurisdictions are given equal treatment.

### 4.1 Licensing Framework Comparison

| Dimension | Japan (JP) | European Union (EU) | United Kingdom (GB) | United States (US) |
|---|---|---|---|---|
| **Primary statute** | Travel Agency Act (旅行業法) 1952, revised 2018 | Package Travel Directive 2015/2302/EU | Package Travel Regulations 2018 (SI 2018/634) | No federal law; state Seller of Travel statutes |
| **Primary regulator** | Japan Tourism Agency (JTA) / MLIT | European Commission DG GROW; member state bodies | Competition and Markets Authority (CMA); CAA for ATOL | State Attorneys General; FTC (federal, non-binding) |
| **License classes** | Class 1 (全国), Class 2 (domestic + inbound), Class 3 (regional) | Organizer registration (member state level) | Package organizer registration; ATOL for flight-inclusive | Seller of Travel registration (California, Florida, Hawaii, Iowa, Nevada, Washington, others) |
| **Who must be licensed** | Any party selling a "package" or arranging travel for compensation | Any party "organizing" a package as defined by PTD | Same as EU (UK retained and amended PTD) | Any party selling travel in regulated states regardless of seller location |
| **Hotel packaging restriction** | Hotels cannot package off-premise activities without Class 3 license or split-seller configuration | Hotels may sell linked services subject to LTA rules if below "package" threshold | Same as EU | Varies by state; generally lower threshold for hotel activity bundling |
| **AI agent licensing status** | Not addressed | Not addressed; EU AI Act does not classify travel AI as high-risk by default | Not addressed | Not addressed |

### 4.2 Consumer Protection Comparison

| Dimension | Japan (JP) | European Union (EU) | United Kingdom (GB) | United States (US) |
|---|---|---|---|---|
| **Insolvency protection required?** | Yes — business bond (営業保証金) for Class 1 and 2 | Yes — mandatory for package organizers; full payment value + repatriation | Yes — package organizers; ATOL covers flight-inclusive | No federal requirement; varies by state |
| **Minimum insolvency coverage** | Class 1: ¥7M base; Class 2: ¥1.1M base | 100% of customer payments + repatriation costs | Same as EU for packages; ATOL: full ticket value | California: TCRC participation or equivalent |
| **Liability insurance required?** | Yes — compensation insurance mandatory for licensed agents | Yes — liability for performance of package | Yes — same as EU | No federal requirement |
| **Written contract required?** | Yes — for transactions ≥ ¥10,000 | Yes — standard information set pre-contract and at confirmation | Yes — same as EU | Varies by state |
| **Cancellation fee regulation** | Article 16 standard schedule limits cancellation fees | Maximum fees defined; pro-rated by proximity to departure | Same as EU | No federal regulation; contract terms govern |
| **Right of transfer** | Not explicitly regulated | Yes — customer may transfer booking to another person | Yes — same as EU | No |

### 4.3 Packaging Definition Comparison

This is the most practically important comparison for ATOP, because the definition of
"package" determines when the comprehensive consumer protection obligations apply.

| Dimension | Japan (JP) | European Union (EU) | United Kingdom (GB) | United States (US) |
|---|---|---|---|---|
| **Package defined as** | Combination of transport + accommodation or other services at inclusive price, pre-planned | Two or more types of travel service combined for same trip at inclusive/total price, over 24h or overnight | Same as EU | No unified definition; "vacation package" used loosely |
| **Minimum components** | 2 (transport + accommodation, or transport + other) | 2 of: transport, accommodation, car rental, other tourist services | Same as EU | N/A |
| **Single seller required?** | Yes for package obligations to apply | Yes — but LTA rules apply even with click-through from one platform to another | Same as EU | N/A |
| **Duration threshold** | Not explicit; overnight stay generally implies package | Over 24 hours OR includes overnight stay | Same as EU | N/A |
| **Linked Travel Arrangement (LTA) concept?** | Not defined in Japanese law — key gap | Yes — Article 3(5) PTD; lower obligations than full package | Yes — retained in UK regulations | No |
| **Split-seller exemption** | Yes — 手配旅行 (arranged travel) provides compliant path | Yes — separate contracts with separate sellers may avoid package threshold | Same as EU | Generally yes — separate billing avoids package definition |

### 4.4 Key Differences That Create Compliance Complexity for Global Operators

The following differences create the most operational friction for operators working
across all four jurisdictions simultaneously:

**1. The LTA gap in Japan.** The EU and UK define Linked Travel Arrangements — a
category that catches digital platforms facilitating connected bookings even when no
formal package exists. Japan has no equivalent. A booking configuration that is clearly
regulated as an LTA in the EU may face complete regulatory uncertainty in Japan.
For a global OTA operating in both markets, this requires different booking flows,
different disclosure languages, and different compliance checks for the same underlying
product.

**2. The US state patchwork.** A global OTA must track 7+ state Seller of Travel
regimes in the US, each with slightly different registration requirements, bond amounts,
and covered transaction types. An OTA that is compliant in California may unknowingly
be non-compliant in Washington. No harmonized federal framework exists to simplify this.

**3. The hotel packaging restriction divergence.** In Japan, a hotel cannot package
off-premise activities without a travel agency license or split-seller configuration —
a significant operational constraint. In the EU, the same hotel can generally bundle
nearby activities as part of a Linked Travel Arrangement without a full package
organizer license. In the UK, the same EU framework applies. In the US, no equivalent
restriction exists in most states. A hotel group operating across all four jurisdictions
must maintain four different booking and compliance approaches for the same product type.

**4. AI agent undefined everywhere.** No jurisdiction has clarity on whether an AI
agent initiating a booking on a customer's behalf constitutes conducting travel agency
business. This is not a minor edge case — it is the primary direction travel booking
is moving. Every operator deploying AI booking tools is operating in a gray zone in
every jurisdiction.

### 4.5 Regulatory Sandbox Flags Active Across Jurisdictions

The following sandbox flags are currently active in the Jurisdiction Entries. Each
represents a documented gray zone where compliant businesses need clarity:

| Flag ID | Jurisdiction | Category | Description | Reform Status |
|---|---|---|---|---|
| `JP-TRAVEL-LAW-SPLIT-SELLER` | JP | licensing | Hotel activity packaging without Travel Agency License | JTA DX working group ongoing |
| `JP-AI-AGENT-001` | JP | ai_agent | AI agent booking initiation — unclear if constitutes travel agency business | JTA AI working group ongoing |
| `EU-PTD-HOTEL-ACTIVITY` | EU | packaging | Hotel activity facilitation — LTA boundary unclear | No formal reform pending |
| `EU-AI-ACT-TRAVEL` | EU | ai_agent | EU AI Act application to travel AI agents | Under review |
| `GB-AI-AGENT-001` | GB | ai_agent | UK AI governance framework has no travel-specific rules | DSIT principles-based only |
| `US-SOT-AI-AGENT` | US | ai_agent | AI agents in travel — no state Seller of Travel law addresses | No pending reform |

---

## 5. Where Global Operators Find It Hardest: Technology and Operational Challenges

### 5.1 Technology Challenges

**The compliance data problem.** Global OTAs maintain compliance data in internal
legal databases, spreadsheets, and legal memos — formats that cannot be read by
booking systems or AI agents. When a new market is entered or a regulation changes,
compliance teams update internal documents. Booking system teams interpret those
documents and implement code changes. The lag between regulatory change and system
implementation is measured in months.

ATOP's Jurisdiction Compliance Registry makes compliance data machine-readable for
the first time. A booking system can query the Registry at transaction time, get a
current compliance check result, and adapt the booking flow in real time.

**The multi-jurisdiction logic problem.** A global OTA selling a trip from Japan to
France for a Japanese customer through a US platform faces compliance logic that
branches across three jurisdictions simultaneously. Building and maintaining this
logic in bespoke code for every platform is expensive, error-prone, and fragile.
Every time any of the three jurisdictions changes a rule, the code must be updated.

ATOP externalizes this logic into the Registry. The booking system asks "is this
compliant?" and receives an answer. The complex multi-jurisdiction evaluation happens
once, in the Registry, and is available to all implementations.

**The disclosure generation problem.** Every jurisdiction requires different disclosures
in different formats at different moments in the booking flow. Generating compliant
disclosures across all jurisdictions, for all product types, in the customer's language,
at the right moment in the workflow, is a non-trivial technical problem that every OTA
solves separately and expensively.

ATOP maps disclosure requirements to workflow states. The disclosure content is defined
in the Registry. Implementations know which disclosures to generate, when, and in what
form.

**The AI agent guardrail problem.** As OTAs deploy AI agents to assist with or automate
booking, they need programmatic guardrails that prevent agents from taking actions that
would be non-compliant or that exceed their authorization. Without a formal authorization
framework, these guardrails are implemented ad hoc in each platform.

ATOP's Agentic Authorization Framework provides a formal, verifiable authorization
structure. The agent's permitted scope is declared, signed, and verifiable by
counterparties. Guardrails are enforced at the protocol level, not in bespoke code.

### 5.2 Operational Challenges

**The staff training problem.** Compliance in multi-jurisdiction travel requires staff
who understand the regulatory requirements in each market. This knowledge is expensive
to develop, difficult to keep current, and not scalable. When a new market is entered,
compliance training lags behind commercial launch.

**The supplier verification problem.** An OTA listing suppliers from multiple countries
must verify that each supplier holds the credentials required in their jurisdiction.
Verifying a Japanese hotel's accommodation license, an EU diving operator's maritime
certificate, and a US ski resort's safety inspection requires knowledge of three
different credential systems, three different verification processes, and three different
validity periods. Most OTAs rely on supplier self-declaration — the lowest assurance
level.

ATOP's Party Registry, with its structured credential reference system and four
assurance levels, provides a common framework for supplier credential verification
across all jurisdictions.

**The crisis response problem.** When a major disruption occurs — Middle East airspace
closure, natural disaster, political unrest — operators need to identify all affected
bookings and coordinate response across multiple suppliers simultaneously. This is
currently done manually: phone calls, email chains, WhatsApp messages. There is no
protocol-level mechanism for propagating a disruption declaration to all affected
parties.

ATOP's Disruption Events mechanism, with registered government advisory sources and
machine-readable disruption declarations, provides exactly this.

---

## 6. The Cross-Border Problem: When Three Jurisdictions Apply Simultaneously

The hardest compliance problem in global travel is not understanding any single
jurisdiction's rules. It is understanding which rules apply when multiple jurisdictions
touch a single transaction.

### 6.1 Jurisdiction Conflict Scenarios

**Scenario A: Japanese tourist, French ski resort, booked through US OTA**

- Japanese consumer protection law applies (customer's home jurisdiction, APPI data
  protection requirements)
- French travel and activity law applies (consumption jurisdiction, French tourism code)
- US law applies to the OTA's operation (platform jurisdiction; California SOT
  registration likely required)
- EU Package Travel Directive may apply if the OTA has EU operations or if the booking
  is characterized as an EU-facilitated package

Which insolvency protection applies? Japanese law requires the OTA to hold a travel
agency bond. French law has its own package organizer requirements. US law has no
federal insolvency protection requirement. In the absence of a clear framework, the
answer is likely: none are met, and the customer has no protection.

**Scenario B: Chinese tourist, Japanese activity operator, booked through Singaporean OTA**

- Chinese consumer law does not typically impose extraterritorial obligations on
  foreign sellers, but PIPL data protection does apply to Chinese resident data
- Japanese Travel Agency Act applies to any party selling travel services in Japan
- Singaporean Travel Agents Act applies to the OTA
- The OTA may or may not hold a Japanese travel agency license

Which party holds duty of care if the activity results in injury? The Japanese operator
has limited liability under their operator's license. The Singaporean OTA disclaimed
liability in their terms. The customer is in Japan, far from home, with no clear
recourse in any jurisdiction.

**Scenario C: European tourist, multi-country tour, AI agent booking**

- EU Package Travel Directive may apply to the whole itinerary if organized by a single
  EU-based entity
- Each destination country's regulations apply to individual activity operators
- The AI agent's legal status in each jurisdiction is undefined
- The customer authorized the AI agent under a framework that exists in no jurisdiction's
  law

### 6.2 ATOP's Cross-Border Resolution Model

ATOP does not resolve jurisdiction conflicts — that is a matter for law and treaties.
What ATOP does is make the conflicts visible, declare which jurisdiction's rules are
being applied to each component of the transaction, and record that declaration in the
Trust Chain.

The Compliance Check operation evaluates both the sale jurisdiction and the consumption
jurisdiction simultaneously. Where requirements conflict, the more protective rule
applies by default (following the PTD's approach). Where the conflict cannot be
automatically resolved, the transaction is flagged for human review before CONFIRMATION.

The Trust Chain records:
- Which jurisdiction entry version was used for the compliance check
- Which requirements were evaluated and whether they were met
- Which sandbox flags were active
- Which disclosures were made and when

This creates a complete, auditable record that any regulator in any jurisdiction can
examine to understand how compliance was evaluated for a specific transaction.

---

## 7. What ATOP Provides: Closing the Gap Without Replacing Regulation

ATOP is not a regulatory body and does not seek to be one. It is infrastructure —
protocol-level machinery that makes existing regulatory requirements machine-readable,
makes compliance visible at transaction time, and makes the accountability chain
explicit for all parties including AI agents.

### 7.1 The Three Things ATOP Provides

**Machine-readable compliance data.** The Jurisdiction Compliance Registry translates
regulatory requirements into structured data that booking systems and AI agents can
query in real time. When a regulatory requirement changes, the Registry is updated and
all ATOP-conformant systems automatically incorporate the change.

**A common accountability framework.** The Party Registry, Trust Chain, and Duty of
Care Declaration provide a single framework for declaring who is responsible for what
in a multi-party transaction — across jurisdictions, across business models, and
across the human-AI boundary.

**An evidence base for regulatory reform.** Every Regulatory Sandbox Flag invocation
contributes to an aggregate dataset. This dataset shows precisely where existing
regulations create friction for legitimate business without improving consumer
protection. ATOP provides this data as a public good, available to any regulator
seeking evidence for reform.

### 7.2 What ATOP Asks of Regulators

ATOP asks three things of regulatory bodies:

**Participate in jurisdiction entry co-maintenance.** A co-maintained entry — reviewed
and endorsed by the primary regulatory body — transforms ATOP's compliance declarations
from best-interpretation to authoritative. This does not require regulatory bodies to
endorse ATOP as a platform; it requires only that they review and confirm the accuracy
of their own regulatory requirements as described in the entry.

**Engage with the Sandbox Flag evidence.** The aggregate data generated by Sandbox Flag
invocations is evidence of regulatory friction. ATOP makes this data available to
regulatory bodies. We ask that it be used — as input to reform discussions, working
group deliberations, and legislative review processes.

**Consider ATOP's AI agent framework in AI policy development.** No jurisdiction yet
has travel-specific AI agent rules. ATOP's Agentic Authorization Framework is the
only existing operational framework for AI agent accountability in travel transactions.
We invite regulatory bodies to examine it as a reference model for policy development.

---

## 8. A Path Forward: Recommendations for Regulatory Engagement

### For Japan (JTA / MLIT)

The most urgent priority for Japan is clarity on two points: the hotel activity
packaging configuration (the split-seller gray zone), and AI agent booking initiation.
Both are addressed by current ATOP sandbox flags. JTA's DX working group is the
natural forum for this engagement.

**Recommended actions:**
1. Co-maintain the JP jurisdiction entry — review and endorse ATOP's description of
   Japanese travel law requirements
2. Issue guidance on hotel activity packaging in a digital split-seller configuration
   (resolving `JP-TRAVEL-LAW-SPLIT-SELLER`)
3. Include ATOP's AI agent authorization framework in the JTA AI working group's
   reference materials

### For the European Union (EC / DG GROW)

The EU has the most sophisticated package travel consumer protection framework in the
world. The challenge is extending it to digital platforms, AI agents, and cross-border
configurations the 2015 PTD did not anticipate.

**Recommended actions:**
1. Examine ATOP's Linked Travel Arrangement handling as a model for machine-readable
   LTA detection
2. Consider ATOP's agent authorization schema in the EU AI Act secondary regulation
   process for Article 6 high-risk classification review
3. Engage with ATOP's cross-border jurisdiction resolution model in the context of
   the PTD's 2026 review

### For the United Kingdom (CMA / CAA)

The UK has an opportunity post-Brexit to develop travel regulation that goes beyond EU
PTD — incorporating digital commerce realities and AI accountability from the start
rather than amending an existing framework.

**Recommended actions:**
1. Engage with ATOP's AI agent framework in the DSIT AI governance consultation
2. Examine whether the ATOL scheme can be extended to cover AI-assisted booking
   configurations through ATOP's authorization framework
3. Consider ATOP's sandbox flag mechanism as a model for the CMA's consumer protection
   regulatory sandbox initiative

### For the United States (FTC / State Attorneys General)

The US has an opportunity to develop federal travel consumer protection standards —
building on state Seller of Travel regimes — that address cross-border digital commerce
and AI agents coherently.

**Recommended actions:**
1. Engage with ATOP as a model for what federal travel consumer protection
   infrastructure could look like
2. Use ATOP's cross-jurisdiction comparison data in the FTC's ongoing digital commerce
   consumer protection work
3. Consider whether ATOP's Party Registry and credential verification model could
   reduce the compliance burden of multi-state Seller of Travel registration

---

*Document status: Draft v0.1 — March 2026*  
*This document is a discussion paper and does not constitute legal advice.*  
*Prepared by: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*
