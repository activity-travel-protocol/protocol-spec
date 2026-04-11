# ATP Guest Agent & OCTO Bridge

*ATP MCP Server Specification · Sections 7–8*

[← NeMo & OAuth](nemo-oauth) · [Decisions →](decisions)

## 7. ATP Guest Agent — Normative Design

### 7.1 Purpose

**Decision MCP-D11 (CLOSED):** The Activity Travel Protocol MCP Server
specification defines no named commercial platform dependency. The
normative guest agent integration pattern is an ATP-native
conversational agent — a purpose-built MCP client using the ATP MCP
Server as its tool surface. WhatsApp delivery is via direct WhatsApp
Business API. LINE Messaging API for Japan market guests.

Any MCP-native conversational platform may implement this design and
interoperate with any ATP-compliant MCP Server. Platform vendors seeking
ATP compatibility should implement MCP client support and register via
the Foundation compatibility programme.

### 7.2 Reference Implementation

  **Field**          **Value**

  OSS reference app  REF-06
  ID                 

  Repository         atp-reference-apps/guest-agent

  Technology stack   TypeScript, LangChain.js or Vercel AI SDK,
                     @activity-travel-protocol/mcp-server client,
                     WhatsApp Business API, LINE Messaging API

  Deployment         Docker container — Tier 1 compatible (no NIM
                     sidecar required)

  Governance         atp-community label until first production
                     deployment; graduates to Foundation-endorsed on TSC
                     review

### 7.3 Mandate Profile

The ATP Guest Agent is registered as an OAuth 2.1 client with the
following authority scope profile. The mandate is bound to a single
Booking Object UUID at token issuance time.

  **Scope**               **Permitted**   **Rationale**

  CONTEXT_READ            YES             Primary read surface — loads itinerary,
                                          participant data

  NOTIFICATION_SEND       YES             Sends confirmations, reminders, updates to
                                          guest and operator

  PRE_ARRANGEMENT_WRITE   YES             Collects dietary, equipment, logistics data
                                          from guest

  HEM_INVOKE              YES —         Escalation only. Cedar mandate requires
                          restricted      explicit hem_id enumeration. Tier 1
                                          maximum: HEM-05, HEM-07, HEM-12

  SAFETY_WRITE            NO              Supplier / admin domain only

  BOOKING_READ            NO              Discovery — not required
                                          post-CONFIRMATION

  BOOKING_WRITE           NO              Booking modification — operator domain

  DISRUPTION_MANAGE       NO              Operator domain

### 7.4 Session Lifecycle

**Session initialisation — on booking CONFIRMATION**

The ATP runtime generates the initial Context Package and registers the
guest agent as an ASSEMBLY POINT participant on the Booking Object. The
agent authenticates via OAuth 2.1 Client Credentials and receives the
co-issued access token and ATP Mandate JWT bound to the Booking Object
UUID. Mandate expires at booking_departure_date + 24 hours.

**On each inbound WhatsApp / LINE message**

-   1\. WhatsApp Business API webhook delivers inbound message

-   2\. Agent calls atp_get_context_package — loads current itinerary,
    > participant state, event log tail

-   3\. Agent reconstructs conversation context from event log

-   4\. LLM reasons over: system prompt + context package + conversation
    > history + guest message

-   5\. LLM produces: response text and / or tool calls

-   6\. NeMo Guardrails (Tier 2/3) evaluates tool calls before execution

-   7\. Tool calls execute via ATP MCP Server

-   8\. Agent sends response via WhatsApp Business API / LINE Messaging
    > API

-   9\. All actions recorded to Booking Object event log

### 7.5 Guest Journey Script — MyAuberge Reference Pattern

The following interaction pattern is the normative reference for the
atp-reference-guest-agent implementation. Operators implement their own
guest journey scripts on top of the same tool surface.

  **Phase**     **Trigger**     **Agent Action**       **Tools Used**

  PRE_JOURNEY   Automated       Pre-arrival message:   atp_collect_pre_arrangement_data,
  T-48h         schedule        confirm itinerary,     atp_update_pre_arrangement,
                                collect train arrival  atp_notify_traveller
                                time, final dietary /  
                                programme updates      

  JOURNEY —   Booking state:  Pickup confirmation    atp_get_context_package,
  Arrival       JOURNEY         with operator contact  atp_notify_traveller
                                and property address   

  JOURNEY —   Inbound guest   Update arrival time,   atp_update_pre_arrangement,
  Train delay   message         notify operator. If    atp_notify_traveller,
                                delay \> 60 min:       atp_invoke_hem (if needed)
                                evaluate HEM-05        

  JOURNEY —   Inbound guest   Programme questions,   atp_notify_traveller,
  During stay   message         nearby                 atp_get_context_package
                                recommendations,       
                                special requests. All  
                                interactions logged    

  JOURNEY —   Booking state / Equipment collection   atp_get_context_package,
  Activity day  schedule        instructions and       atp_notify_traveller
                                meeting point details  
                                from Context Package   

  JOURNEY —   Operator        Record WEATHER_GO_NOGO atp_record_safety_check,
  Weather       direction       safety check. If       atp_invoke_hem
                                disruption: invoke     
                                HEM-07 with operator   
                                confirmation           

  COMPLETED — Booking state:  Checkout summary and   atp_notify_traveller
  Departure     COMPLETED       review request.        
                                Mandate expires within 
                                24 hours               

### 7.6 WhatsApp Business API and LINE Integration

-   **Inbound:** WhatsApp Business API webhook delivers messages to POST
    > /whatsapp/webhook. Signature verified against Meta app secret.

-   **Outbound:** Messages sent via Meta Graph API. All outbound
    > messages also sent via atp_notify_traveller — the ATP MCP Server
    > records the event to the Booking Object event log. WhatsApp
    > message ID stored alongside notification_id for delivery
    > correlation.

-   **Templates:** WhatsApp Business API requires pre-approved templates
    > for messages outside the 24-hour window. ATP Prompt Library
    > includes: pre-arrival confirmation (T-48h), pickup confirmation,
    > activity reminder, weather advisory, checkout summary.

-   **LINE channel:** For bookings where guest_preferred_channel ==
    > LINE, the agent uses the LINE Messaging API. Tool surface
    > identical — atp_notify_traveller accepts channel: LINE. LINE
    > adapter is a Tier 1 reference implementation target given Japan
    > market priority (GT-1).

## 8. OCTO Bridge — OQ-SDK-2 Resolution

### 8.1 OCTO Overview

OCTO (Open Connectivity for Tours, Activities, and Attractions) is an
open standard API specification for the in-destination experiences
sector, governed by OCTO Standards NP Inc. — a member-based
non-profit. The specification is open source and free to use. 130+
implementations worldwide.

OCTO is complementary to the Activity Travel Protocol. OCTO solves the
supplier-to-reseller distribution connectivity problem. The Activity
Travel Protocol adds a runtime intelligence layer — AI agent
participation, Booking Object lifecycle management, duty-of-care
tracking, and mandate-enforced authority scopes — on top of
OCTO-connected suppliers.

### 8.2 OCTO API Structure

**Core Endpoints — Required**

  **Endpoint**           **Method**   **ATP Bridge Mapping**

  Get Supplier           GET          Supplier identity → ATP operator_id

  Get Product List / Get GET          Products → ATP Activity Configuration
  Product                             Schema capability declarations

  Availability Calendar  POST         Date-range availability → ATP
                                      availability search response

  Availability Check     POST         availabilityId → ATP INQUIRY initiation

  Create Booking         POST         ON_HOLD reservation → ATP INQUIRY state

  Confirm Booking        POST         Confirmed booking → ATP CONFIRMED state

  Update Booking         PATCH        Modification → ATP pre-arrangement
                                      update

  Cancel Booking         POST         Cancellation → ATP CANCELLED state
                                      transition

  Get Booking / Get      GET          Status polling → ATP event log sync
  Booking List                        

**Optional Capabilities — ATP-Relevant**

  **Capability**     **ID**          **ATP Relevance**

  Pricing            pricing         Dynamic pricing → ATP pricing snapshot
                                     at CONFIRMATION

  Notifications      notifications   Supplier webhook → ATP Booking Object
                                     event log

  Content            content         Rich product content → ATP Activity
                                     Configuration Schema

  Pickups \[NEW Nov  pickups         Structured pickup → ATP meeting point
  2025\]                             and logistics fields (Chino Station
                                     pattern)

  Dropoffs \[NEW Nov dropoffs        End-of-tour return → ATP transportation
  2025\]                             coordination

### 8.3 OQ-SDK-2 Resolution — Bridge Ownership

**Decision MCP-D12 / OQ-SDK-2 RESOLVED (CLOSED):**

@atp/bridge-octo v1.0 is Foundation-scaffolded, community-maintained.
The Foundation publishes the bridge interface specification and the
IActivitySupplierBridge adapter contract (from SDK Architecture v2). The
reference implementation is built by the Foundation as part of the 8
Peaks prototype (OQ-RI-3).

Maintenance responsibility transfers to the first OCTO member
organisation that joins the Activity Travel Protocol Foundation as a
Founding Member or Community Member. Prior to that transfer, the bridge
carries the atp-community label: functional, tested against the OCTO
self-certification tool, but not Foundation-guaranteed.

  **Phase**     **Bridge Status**     **Governance**          **Trigger**

  v1.0 launch   atp-community         Foundation-scaffolded   8 Peaks prototype
                                                              complete (OQ-RI-3)

  First OCTO    Foundation-endorsed   TSC review + production Founding Member or
  member joins                        use evidence            Community Member joins
  Foundation                                                  

  v1.1+         Foundation SDK        Foundation-maintained   Graduation confirmed by
                catalogue                                     TSC

### 8.4 Strategic Positioning

**The Activity Travel Protocol does not compete with OCTO.** OCTO gets
suppliers connected; the Activity Travel Protocol gives those
connections a runtime intelligence layer. An OCTO Bridge integration
gives the Activity Travel Protocol access to the full 130+ OCTO operator
ecosystem on day one. 8 Peaks resort, if using any OCTO-compliant
booking platform, connects through the bridge with days of effort, not
months.

OCTO currently defines no AI agent participation model, no mandate
model, and no booking lifecycle runtime intelligence. These are the
Activity Travel Protocol's differentiators within the OCTO ecosystem.
