# UI Generation Contract

*Activity Configuration Schema Design System · Section 5*

[← Starter Catalogue](starter-catalogue) · [Category Registry →](registry)

## 5. UI Generation Contract

### 5.1 Purpose

The UI Generation Contract specifies how an Activity Travel Protocol SDK
consumer renders a pre-arrangement form from a Collection schema without
writing custom UI code. The contract is the bridge between the schema
definition and the guest-facing interface — on the
booking.myauberge.jp frontend, in a travel agent admin console, or in an
AI agent's prompt.

### 5.2 Form Element Mapping

Each field type in the Collection schema maps to a canonical form
element. The SDK provides a @atp/ui package that implements these
elements in React. Third-party frontend implementations must produce
equivalent UI behaviour.

  ----------------------------------------------------------------------------------
  **Schema type**     **Form element**  **Validation**    **Notes**
  boolean             Checkbox with     Must be true      SafetyCompliance
  (acknowledgement)   legal text        before CONFIRMED  HARD_ACKNOWLEDGEMENT and
                                                          volunteer_consent. Text
                                                          from
                                                          acknowledgement_text_en.

  string (enum)       Radio group or    Must match enum   SkillLevel, gear_category,
                      select            values            dietary_restrictions.

  string\[\]          Checkbox group    Zero or more      dietary_restrictions
  (multi-enum)                          valid enum values multi-select.

  integer             Numeric input     Min/max from      height_cm, weight_kg. Unit
  (measurement)       with unit label   schema. Integer   displayed as suffix.
                                        only.             

  number              Numeric input     Decimal permitted shoe_size_us.

  string (free text)  Textarea          Max 500 chars     medical_conditions,
                                        unless specified  additional_notes.

  PhoneNumber         Phone input with  E.164 format      emergency_contact_phone.
                      country code      validation        
                      selector                            

  ISO8601DateTime     Date + time       Must be future    collection_time,
                      picker            datetime          estimated_arrival_time.

  boolean             Read-only notice  No input required SOFT_ADVISORY
  (informational)     block                               SafetyCompliance ---
                                                          rendered as styled notice,
                                                          not form field.
  ----------------------------------------------------------------------------------

### 5.3 Conditional Display Rules

Collection schema fields marked CONDITIONAL carry a when clause. The UI
renders these fields only when the condition evaluates to true based on
current form state. The evaluation runs client-side in real time as the
user completes the form.

Condition evaluation order: REQUIRED fields are rendered first and must
be completed before CONDITIONAL fields that depend on them are
evaluated. The form does not permit submission until all
currently-visible REQUIRED and CONDITIONAL fields are completed.

Example — Ski Alpine form rendering sequence:

> 1\. Render: age_band (REQUIRED — determines which subsequent fields
> apply)
>
> 2\. Render: height_cm, weight_kg, shoe_size_eu (REQUIRED)
>
> 3\. Render: skill_domain auto-set to SKIING
>
> 4\. Render: self_assessed_level (REQUIRED)
>
> 5\. Evaluate: self_assessed_level IN \[NEVER, BEGINNER\] → show
> instructor_requested (CONDITIONAL)
>
> 6\. Render: own_helmet (REQUIRED)
>
> 7\. Render: helmet SafetyCompliance HARD_ACKNOWLEDGEMENT checkbox
> (REQUIRED)
>
> 8\. Render: emergency_contact_name, emergency_contact_phone (REQUIRED)
>
> 9\. Render: medical_conditions (OPTIONAL — always shown but not
> required)
>
> 10\. Evaluate: age_band == CHILD AND height_cm \>= 150 → apply
> adult_gear_surcharge PricingRule → update pricing display

### 5.4 SafetyCompliance Rendering

The three SafetyCompliance modes produce different UI elements:

SOFT_ADVISORY: Rendered as a styled notice block (yellow background,
info icon) in the confirmation email and the pre-arrangement screen. No
form field. No blocking of booking progression.

HARD_ACKNOWLEDGEMENT: Rendered as a checkbox with the full
acknowledgement_text_en as the label. The checkbox must be checked
before the form can be submitted. The timestamp and participant identity
are recorded in the Booking Object IEventLog as a SAFETY_ACKNOWLEDGED
event.

SUPPLIER_VERIFIED: Rendered identically to HARD_ACKNOWLEDGEMENT on the
guest side. Additionally, the operator admin console shows a pending
SAFETY_CHECK_REQUIRED indicator for the booking on the day of the
activity. The supplier staff uses the atp_record_safety_check MCP Server
tool to record the check. If not recorded within 30 minutes of session
start, the system issues an operator alert.

### 5.5 Per-Participant Form Structure

When a Collection schema applies per participant (the majority of
cases), the form renders one section per participant. The LEAD_TRAVELLER
section is rendered first and is always expanded. Additional participant
sections are collapsed by default and expand when the user selects them.

Participant sections are labelled by given_name if provided, otherwise
by role and index (e.g. 'Adult 2', 'Child 1'). The AI agent, when
collecting pre-arrangement data via WhatsApp, follows the same
participant ordering and labels sections consistently across messages to
avoid confusion.

### 5.6 ResolutionChain Guest Communication

When a SubSupplierDependency with a ResolutionChain is active on a
booking, the guest communication follows these rules:

Option 1 (PRIMARY): No special communication required. The booking
proceeds normally.

Escalation to Option 2 (EQUIVALENT): If automatic_escalation is true,
the system escalates silently and sends a neutral notification ('Your
ski instruction has been confirmed'). If automatic_escalation is false,
the operator is notified and must manually trigger escalation.

Escalation to Option 3 (FALLBACK) when requires_guest_consent is true:
The system sends a consent request to the guest via WhatsApp (Seasalt.AI
agent) explaining the downgrade, the alternative, and requesting
explicit consent. The guest's response is recorded in the IEventLog. If
no response is received within the decision_lead_time, the system
escalates the pending decision to the operator.
