# Tool Catalogue

*ATP MCP Server Specification · Section 4*

[← Overview](index) · [NeMo & OAuth →](nemo-oauth)

## 4. Tool Catalogue

### 4.1 Design Principles

-   Scope alignment is the primary carving criterion. Each tool maps to
    > exactly one Cedar action.

-   Coarse over granular. Eight tools total. Each well-described for
    > correct one-shot LLM invocation.

-   Synchronous by default. atp_invoke_hem is the sole async tool (MCP
    > Tasks, EXPERIMENTAL).

### 4.2 Scope Normalisation

**Decision MCP-D4 (CLOSED):** Informal RefImpl scope names retired.
Normative names:

  JOURNEY_READ (retired)  CONTEXT_READ (normative)

  NOTIFY (retired)        NOTIFICATION_SEND (normative)

  PRE_ARRANGEMENT_WRITE   PRE_ARRANGEMENT_WRITE (unchanged)

  HEM_INVOKE              HEM_INVOKE (unchanged)

### 4.3 Tool Summary

**Decision MCP-D5 (CLOSED):** Eight tools: six operational, one
discovery, one administrative.

  **Tool**                           **Scope**               **Async**   **NeMo**      **Seasalt.AI /
                                                                                       Guest Agent**

  atp_get_context_package            CONTEXT_READ            No          No            Primary tool

  atp_notify_traveller               NOTIFICATION_SEND       No          Tone filter   Core

  atp_update_pre_arrangement         PRE_ARRANGEMENT_WRITE   No          No            Core

  atp_collect_pre_arrangement_data   PRE_ARRANGEMENT_WRITE   No          Elicitation   Core

  atp_invoke_hem                     HEM_INVOKE              Yes \*      Required      Escalation only

  atp_record_safety_check            SAFETY_WRITE            No          No            Supplier / admin

  atp_search_activities              BOOKING_READ            No          No            Discovery

  atp_get_booking_status             CONTEXT_READ            No          No            Polling

\* MCP Tasks — EXPERIMENTAL (spec 2025-11-25)

### 4.4 Tool Specifications

**Tool 1: atp_get_context_package**

  **Field**          **Value**

  Required scope     CONTEXT_READ

  Cedar action       ATPAction::"get_context_package"

  Booking state      Any post-CONFIRMATION state

  Async              No

  NeMo Guardrails    Not required

Retrieves the full Context Package for a Booking Object — confirmed
itinerary, participant list, seller contacts, pre-arrangement state,
meeting points, and event log summary. Primary read surface for any AI
agent operating on a confirmed booking.

**Input:** { booking_object_id: UUID v7, fields?: string\[\] }

**Output:** Full Context Package (or requested fields subset). Payment
fields require additional BOOKING_READ scope claim.

**Tool 2: atp_notify_traveller**

  **Field**          **Value**

  Required scope     NOTIFICATION_SEND

  Cedar action       ATPAction::"notify_traveller"

  Booking state      PRE_JOURNEY, JOURNEY, DISRUPTION_REVIEW

  Async              No

  NeMo Guardrails    Tone / content filter (Rail 2)

Sends a notification to one or more participants via a specified
channel. Records a NotificationEvent to the append-only event log.
Supports WHATSAPP, SMS, EMAIL. Messages are attributed to the ATP
runtime actor identity.

**Input:** { booking_object_id, recipient_participant_id, channel,
message_body, template_id? }

**Output:** { notification_id, status, event_log_entry_id }

**Tool 3: atp_update_pre_arrangement**

  **Field**          **Value**

  Required scope     PRE_ARRANGEMENT_WRITE

  Cedar action       ATPAction::"update_pre_arrangement"

  Booking state      PRE_JOURNEY only

  Async              No

  NeMo Guardrails    Not required

Updates a pre-arrangement field on a participant record. Fields include
dietary requirements, equipment measurements, skill assessments,
insurance references, accessibility requirements. Validated against
Activity Configuration Schema fragment definitions.

**Input:** { booking_object_id, participant_id, field_key, field_value,
source }

**Output:** { updated_field, previous_value, event_log_entry_id,
validation_result }

**Tool 4: atp_collect_pre_arrangement_data**

  **Field**          **Value**

  Required scope     PRE_ARRANGEMENT_WRITE

  Cedar action       ATPAction::"collect_pre_arrangement_data"

  Booking state      PRE_JOURNEY only

  Async              No

  NeMo Guardrails    Elicitation content filter

Returns the pre-arrangement data collection manifest — all fields
outstanding, required vs optional, and the Activity Configuration Schema
fragment governing each field. Paired tool with
atp_update_pre_arrangement. Uses MCP Elicitation for structured guest
input where the host supports it.

**Input:** { booking_object_id, filter: ALL \| OUTSTANDING \|
REQUIRED_OUTSTANDING }

**Output:** Array of { participant_id, field_key, field_label,
field_type, required, current_value, schema_fragment }

**Tool 5: atp_invoke_hem — ASYNC / EXPERIMENTAL**

  **Field**          **Value**

  Required scope     HEM_INVOKE

  Cedar action       ATPAction::"invoke_hem"

  Booking state      Any — HEM catalogue defines per-HEM preconditions

  Async              YES — MCP Tasks (EXPERIMENTAL, spec 2025-11-25)

  NeMo Guardrails    REQUIRED — Rail 1 (HEM Escalation)

Invokes a HEM (Human Escalation Mechanism) event against a Booking
Object. Returns a task_id immediately. Agent polls for completion.
Requires operator confirmation at CONFIRMATION Level \<= 1 (DR-v6-D5,
CLOSED) — enforced via MCP Elicitation before the HEM executes.

**HIGHEST-PRIVILEGE TOOL.** Cedar mandate MUST enumerate permitted
hem_id values explicitly. Wildcard HEM_INVOKE mandates are Security
Kernel-rejected (MCP-D6, CLOSED).

**Input:** { booking_object_id, hem_id, context: { trigger_reason,
agent_assessment, recommended_action? } }

**Immediate output:** { task_id, status: PENDING, confirmation_required:
true, elicitation_sent_to: operator }

**Poll output (confirmed):** { task_id, status: COMPLETE, hem_outcome,
decision_object_id, event_log_entries\[\] }

**Poll output (declined):** { task_id, status: DECLINED, declined_by:
operator, reason }

**Tool 6: atp_record_safety_check**

  **Field**          **Value**

  Required scope     SAFETY_WRITE

  Cedar action       ATPAction::"record_safety_check"

  Booking state      PRE_JOURNEY, JOURNEY

  Async              No

  NeMo Guardrails    Not required

**OQ-AS-5 RESOLVED (CLOSED).** Records a safety compliance check against
a participant or activity item. Satisfies SUPPLIER_VERIFIED
SafetyCompliance requirement. Becomes part of the immutable event log.
Recording a safety check never directly triggers a state transition.

**Input:** { booking_object_id, check_type, subject, outcome,
conditions?, checked_by, evidence_ref? }

**check_type values:** EQUIPMENT_FIT \| MEDICAL_CLEARANCE \|
AGE_VERIFICATION \| SKILL_ASSESSMENT \| WEATHER_GO_NOGO

**Output:** { safety_check_id, event_log_entry_id,
booking_object_status_unchanged: true }

**Tool 7: atp_search_activities (Discovery)**

  **Field**          **Value**

  Required scope     BOOKING_READ

  Cedar action       ATPAction::"search_activities"

  Booking state      Pre-booking — no Booking Object required

  Async              No

  NeMo Guardrails    Not required

Searches the Activity Configuration Schema registry for activities
matching specified criteria. Returns Capability Declarations. Includes
OCTO Bridge-sourced activities alongside ATP-native activities where the
OCTO Bridge adapter is configured.

**Input:** { location, category?, date_range, participants, filters? }

**Output:** Array of Capability Declarations with availability
indicators. Each includes activity_id, category, operator_id,
pricing_snapshot, availability_status, source (ATP_NATIVE \|
OCTO_BRIDGE).

**Tool 8: atp_get_booking_status (Administrative)**

  **Field**          **Value**

  Required scope     CONTEXT_READ

  Cedar action       ATPAction::"get_booking_status"

  Booking state      Any

  Async              No

  NeMo Guardrails    Not required

Lightweight status envelope — current state machine status, active
flags, pending HEM tasks, outstanding pre-arrangements count, and last
event timestamp. Used by monitoring agents and as a polling complement
to atp_invoke_hem task management.

**Input:** { booking_object_id: UUID v7 }

**Output:** { booking_object_id, state, active_flags\[\],
pending_hem_tasks\[\], outstanding_pre_arrangements_count,
last_event_timestamp }
