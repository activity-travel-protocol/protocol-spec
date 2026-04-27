# S6 Pre-Arrangement Declarations

**Activity Travel Protocol — Layer 2 Capability and Discovery Specification**
**Section 6: Pre-Arrangement Declarations**
**Status: WORKING DRAFT — March 2026**

---

## 6.1 Purpose

A Pre-Arrangement Declaration is a pre-negotiated term established between two or more protocol parties before a booking begins. It expresses standing authorisations, constraints, or conditions that would otherwise require real-time negotiation during an active booking workflow.

Pre-Arrangement Declarations are Layer 2 artifacts. They are defined and registered before any Booking Object is created. Once registered, they are evaluated by the Layer 3 Security Kernel as Party Operational policy at every relevant state transition — they are not bypasses of the Security Kernel, they are inputs to it.

This section defines:

- The Pre-Arrangement Declaration schema (satisfying design rule L2-T-4-C).
- The set of state transitions that a Pre-Arrangement Declaration may pre-authorise.
- The conditions under which a Pre-Arrangement Declaration expires.
- The jurisdiction constraints that limit its applicability.
- The registration lifecycle and event model.
- The interaction model with the Layer 3 Security Kernel.

---

## 6.2 Relationship to the Security Kernel

Design rule L2-T-4-B is the governing constraint for this entire section: Pre-Arrangement Declarations MUST NOT be construed as bypasses of the Security Kernel.

The Layer 3 Security Kernel executes the following sequence at every state transition:

1. Authenticate the requesting party.
2. Authorise the operation against the party's registered roles.
3. Evaluate Cedar policy across all four policy tiers in order: Protocol, Jurisdiction, Party Operational, Party Preference.
4. Validate the Trust Chain.
5. Validate AI agent scope (if an AI agent is the requesting principal).

A Pre-Arrangement Declaration operates at step 3, Party Operational tier. It is registered as a Cedar policy fragment and evaluated by Cedarling WASM in sequence with Protocol-tier and Jurisdiction-tier policy. Protocol-tier and Jurisdiction-tier policy may override a Pre-Arrangement Declaration; Party Preference policy may not override it.

The effect of a Pre-Arrangement Declaration is to satisfy, in advance, a condition that would otherwise require real-time supplier confirmation during step 3. The Security Kernel still executes all five steps. The transition is still authenticated, authorised, Trust Chain validated, and agent-scope validated. The Pre-Arrangement Declaration changes the outcome of Cedar evaluation for a specific condition — it does not remove Cedar evaluation.

Note: the four-tier policy evaluation order (Protocol, Jurisdiction, Party Operational, Party Preference) is normatively defined in the Layer 1 Party Policy Declarations Specification (party-policy-declarations.md). This section applies that order; it does not redefine it.

---

## 6.3 Pre-Arrangement Declaration Schema

### 6.3.1 Required Fields

| Field | Type | Constraints |
|---|---|---|
| `preArrangementId` | string | Globally unique. URI format. Issued by the Party Registry on registration. |
| `declaringPartyId` | string | The `partyId` of the party making this declaration. MUST match the authenticated party at registration time. |
| `counterpartyIds` | string array | One or more `partyId` values identifying the parties for whom this declaration is operative. MUST contain at least one entry. Each entry MUST resolve to a registered, active party in the Layer 1 Party Registry. |
| `schemaVersion` | string | Version of the Pre-Arrangement Declaration Schema this entry conforms to. |
| `declarationType` | enum | One of: `TRANSITION_PRE_AUTH`, `CONDITION_PRE_SATISFY`, `CONSTRAINT`. See §6.4. |
| `scope` | object | Defines the scope of application. See §6.3.2. |
| `validFrom` | ISO 8601 datetime | Inclusive lower bound of validity period. |
| `validUntil` | ISO 8601 datetime | Exclusive upper bound. MUST be after `validFrom`. MUST NOT exceed `validFrom` + P1Y. |
| `cedarPolicy` | string | The Cedar policy expression governing this declaration. MUST be syntactically valid Cedar conforming to the protocol's Cedar policy profile (see §6.3.4). Validated at registration time by Cedarling WASM. |
| `counterpartyAcceptanceRequired` | boolean | If `true`, the declaration is held in `PENDING_ACCEPTANCE` status until all `counterpartyIds` have acknowledged it; it is not operative until fully accepted. If `false`, the declaration is operative immediately on successful registration. MUST be `true` for `TRANSITION_PRE_AUTH` and `CONDITION_PRE_SATISFY` declarations. MAY be `false` for `CONSTRAINT` declarations. |

### 6.3.2 Scope Object

The `scope` object constrains which bookings and transitions this declaration applies to:

| Field | Type | Constraints |
|---|---|---|
| `jurisdictions` | string array | ISO 3166-1 alpha-2 codes. If present, the declaration is operative only for bookings whose primary jurisdiction is in this list. If absent, the declaration applies across all jurisdictions. |
| `activityCategories` | string array | If present, the declaration applies only to Activity Components of the listed categories. If absent, applies to all activity categories. |
| `transitions` | string array | For `TRANSITION_PRE_AUTH` declarations: the specific Layer 3 Booking Object state transitions this declaration pre-authorises. MUST reference valid transitions from the Layer 3 state machine. Required when `declarationType` is `TRANSITION_PRE_AUTH`; omitted otherwise. |
| `conditions` | string array | For `CONDITION_PRE_SATISFY` declarations: the specific Cedar policy conditions this declaration pre-satisfies. MUST reference named Protocol-tier conditions from the normative condition list defined in the Layer 1 Party Policy Declarations Specification. Jurisdiction-tier conditions MUST NOT appear here. Required when `declarationType` is `CONDITION_PRE_SATISFY`; omitted otherwise. |
| `bookingObjectIds` | string array | If present, the declaration is operative only for the listed Booking Object identifiers. See §6.3.3 for constraints on use. |

### 6.3.3 Use of bookingObjectIds

The `scope.bookingObjectIds` field supports declarations negotiated for a specific booking rather than as a standing arrangement. Its use is subject to the following constraints, which reconcile it with the pre-booking registration requirement of L2-T-4-D:

- A `bookingObjectId` listed in this field MUST identify a Booking Object that exists at registration time or that the declaring and counterparties have pre-agreed using an externally coordinated identifier prior to Booking Object creation.
- If a `bookingObjectId` is listed and the referenced Booking Object does not yet exist, the declaration is registered in `PENDING_BOOKING` status. It becomes operative when the Booking Object is created with the matching identifier. It MUST NOT be evaluated by the Security Kernel while in `PENDING_BOOKING` status.
- The Booking Object MUST be in a pre-INQUIRY state when the declaration first becomes operative. A declaration that first becomes operative after the Booking Object has entered INQUIRY is invalid and MUST be rejected by the Security Kernel consistent with L2-T-4-D.

This is an advanced use case. In the common case, Pre-Arrangement Declarations are standing arrangements with no `bookingObjectIds` restriction.

### 6.3.4 Cedar Policy Reference

The `cedarPolicy` field MUST conform to the Activity Travel Protocol Cedar policy profile. The normative list of actions and conditions available within Pre-Arrangement Declarations is defined in the Layer 1 Party Policy Declarations Specification (party-policy-declarations.md). Implementations MUST NOT use Cedar constructs outside the protocol profile. The Registry MUST reject registrations whose `cedarPolicy` references out-of-profile actions or conditions, in addition to rejecting syntactically invalid Cedar.

### 6.3.5 Optional Fields

| Field | Type | Description |
|---|---|---|
| `expiryCondition` | object | A time-independent expiry trigger. See §6.5.2. |
| `jurisdictionConstraints` | object | Additional per-jurisdiction restrictions. See §6.6. |
| `renewalPolicy` | enum | One of: `MANUAL`, `AUTO_RENEW`. Default: `MANUAL`. See §6.5.3. |
| `requiresA2ANegotiation` | boolean | If `true`, configuration negotiation for bookings that rely on this Pre-Arrangement Declaration MUST be conducted via A2A inter-party agent communication. The MCP fallback path for `configuration_negotiation` is not permitted when this field is `true`. Default: `false`. See S8 §8.5.3 (graceful degradation) and DR-L2-2-D. |
| `tags` | string array | Operator-defined classification tags. No protocol semantics. |
| `humanReadableSummary` | string | Plain-language description. No normative effect. |

---

## 6.4 Declaration Types

### 6.4.1 TRANSITION_PRE_AUTH

A `TRANSITION_PRE_AUTH` declaration grants one or more `counterpartyIds` standing authorisation to trigger specific Layer 3 Booking Object state transitions without requiring real-time confirmation from the `declaringPartyId` at transition time.

The set of transitions that may be pre-authorised is constrained to those where real-time counterparty confirmation is ordinarily required. Transitions that are unilateral by protocol definition (i.e., triggered by the requesting party under their own authority without requiring confirmation from another party) are not subject to pre-authorisation and MUST be rejected in `scope.transitions` at registration.

`counterpartyAcceptanceRequired` MUST be `true` for all `TRANSITION_PRE_AUTH` declarations.

**Example use case:** A tour operator (Fulfilling Party) pre-authorises a specific OTA (Booking Party) to trigger `CONFIRMED → BOOKING_SUSPENDED` transitions for bookings within a defined activity category, up to a specified frequency, without requiring the tour operator to respond to a real-time confirmation request on each occasion.

### 6.4.2 CONDITION_PRE_SATISFY

A `CONDITION_PRE_SATISFY` declaration asserts, in advance, that a named Protocol-tier Cedar policy condition is satisfied for the specified counterparties and scope. The Security Kernel's Cedar evaluation treats this declaration as a pre-supplied input fact for the named condition.

`CONDITION_PRE_SATISFY` declarations MUST NOT reference Jurisdiction-tier conditions. Jurisdiction-tier conditions are evaluated at transition time against the published Jurisdiction Entry and are not subject to pre-satisfaction (DR-L2-6-A).

`counterpartyAcceptanceRequired` MUST be `true` for all `CONDITION_PRE_SATISFY` declarations.

**Example use case:** A Fulfilling Party pre-satisfies the `supplier_cancellation_policy_acknowledged` Protocol-tier condition for a specific Booking Party, asserting that the counterparty has acknowledged the supplier's cancellation terms offline. The Security Kernel evaluates this declaration as a standing acknowledgement fact during relevant Cedar evaluations.

### 6.4.3 CONSTRAINT

A `CONSTRAINT` declaration imposes a restriction on what the counterparty may do within the declared scope, rather than expanding what they may do. Constraints are expressed as Cedar `forbid` rules that cause Cedar evaluation to return DENY for the specified condition.

`counterpartyAcceptanceRequired` MAY be `false` for `CONSTRAINT` declarations; the declaring party may impose constraints on a counterparty without requiring their acknowledgement, subject to any Jurisdiction-tier requirements that mandate prior consent for constraint imposition.

**Example use case:** A Fulfilling Party declares that a specific Booking Party MUST NOT trigger `CONFIRMED → AMENDMENT_IN_PROGRESS` transitions for bookings involving a specified activity category during a defined validity period (e.g., during peak season when the operator's amendment handling is suspended).

---

## 6.5 Expiry

### 6.5.1 Time-Based Expiry

Every Pre-Arrangement Declaration expires at `validUntil`. At expiry, the Party Registry moves the declaration to `EXPIRED` status and emits `PRE_ARRANGEMENT_EXPIRED`. An expired declaration MUST NOT be accepted as a valid input by the Security Kernel's Cedar evaluation.

Design rule L2-T-4-D states: a Pre-Arrangement Declaration asserted for the first time during an active booking is not valid and MUST be rejected by the Security Kernel. The `validFrom` of a Pre-Arrangement Declaration MUST therefore precede the creation of any Booking Object that relies on it (or the declaration must be in `PENDING_BOOKING` status with a pre-agreed identifier, per §6.3.3).

### 6.5.2 Condition-Based Expiry

A Pre-Arrangement Declaration MAY carry an `expiryCondition` object specifying a protocol event that causes the declaration to expire before `validUntil`. The `expiryCondition` contains:

| Field | Type | Constraints |
|---|---|---|
| `eventType` | string | A named Activity Travel Protocol event. When this event is observed on the event bus for a booking within scope, the declaration expires for that booking. |
| `scope` | enum | One of: `GLOBAL` (expire for all bookings on this event), `PER_BOOKING` (expire only for the booking that generated the event). Default: `PER_BOOKING`. |

**Example:** A `TRANSITION_PRE_AUTH` declaration with `expiryCondition.eventType: BOOKING_CONFIRMED` and `expiryCondition.scope: PER_BOOKING` — the pre-authorisation lapses per-booking once confirmation is reached, ensuring it is operative only during the pre-confirmation phase.

### 6.5.3 Renewal

Declarations with `renewalPolicy: MANUAL` require the declaring party to submit an explicit renewal before `validUntil`. Renewal resets `validFrom` to the current time and sets a new `validUntil`, subject to the P1Y maximum constraint. All other fields are carried forward unless explicitly updated in the renewal request.

Declarations with `renewalPolicy: AUTO_RENEW` are automatically renewed by the Party Registry for one further period (same duration as the original validity window, subject to P1Y maximum) if no explicit deregistration has been submitted within 7 days of `validUntil`. The Party Registry emits `PRE_ARRANGEMENT_AUTO_RENEWED` on automatic renewal.

**AUTO_RENEW consecutive renewal limit:** A declaration may be auto-renewed at most once without manual re-attestation. After one automatic renewal, the declaration MUST be manually renewed by the declaring party before the next `validUntil`. The Party Registry MUST emit `PRE_ARRANGEMENT_MANUAL_RENEWAL_REQUIRED` at least 30 days before the `validUntil` of a declaration that has already been auto-renewed once, to notify the declaring party that auto-renewal will not apply again. A declaration that reaches `validUntil` after one auto-renewal without manual renewal is expired and MUST NOT be further auto-renewed.

---

## 6.6 Jurisdiction Constraints

The `scope.jurisdictions` field filters which bookings the declaration applies to by primary booking jurisdiction. The optional `jurisdictionConstraints` object provides additional per-jurisdiction restrictions:

| Field | Type | Description |
|---|---|---|
| `excludedTransitions` | map (jurisdiction → string array) | Transitions listed in `scope.transitions` that are excluded for specific jurisdictions. Allows a declaration to pre-authorise a transition in most jurisdictions while carving out those where local law requires real-time confirmation. |
| `requiresJurisdictionEntry` | boolean | If `true`, the Security Kernel MUST confirm that the booking's primary jurisdiction has a published Jurisdiction Entry before accepting this declaration as operative. Default: `false`. |
| `conditionalOnJurisdictionVersion` | map (jurisdiction → string) | If present, the declaration is operative for a jurisdiction only if the published Jurisdiction Entry version is ≥ the specified version. Supports declarations that depend on jurisdiction policy not yet published in all regions. |

Jurisdiction-tier Cedar policy always takes precedence over Pre-Arrangement Declarations (DR-L2-6-E). A `jurisdictionConstraints` configuration that purports to expand jurisdiction-tier policy is inoperative; the published Jurisdiction Entry governs in all cases of conflict.

---

## 6.7 Registration Lifecycle

### 6.7.1 Registration Request

A declaring party submits a registration request to the Party Registry. The Registry validates in the following sequence:

1. **Authentication.** The submitting party MUST be authenticated via the Layer 1 Security Kernel. `declaringPartyId` MUST match the authenticated party identity.

2. **Schema validation.** The candidate entry MUST conform to the schema defined in §6.3. Any field constraint violation causes immediate rejection with no partial state persisted.

3. **Counterparty existence check.** Each `counterpartyId` MUST resolve to a registered, active party in the Layer 1 Party Registry.

4. **Transition validity check.** For `TRANSITION_PRE_AUTH` declarations, each entry in `scope.transitions` MUST be a valid transition in the Layer 3 Booking Object state machine. Transitions that are unilateral by protocol definition MUST be rejected.

5. **Condition validity check.** For `CONDITION_PRE_SATISFY` declarations, each entry in `scope.conditions` MUST appear in the normative Protocol-tier condition list defined in the Layer 1 Party Policy Declarations Specification. Any entry referencing a Jurisdiction-tier condition MUST be rejected.

6. **Cedar policy validation.** The `cedarPolicy` expression MUST be syntactically valid Cedar conforming to the protocol Cedar policy profile (§6.3.4). The Registry validates it via Cedarling WASM at registration time. If validation fails or the expression uses out-of-profile constructs, the registration is rejected.

7. **Validity period sanity.** `validFrom` MUST be ≤ current time + 24 hours. `validUntil` MUST be > current time and MUST NOT exceed `validFrom` + P1Y.

On success, the Registry assigns a `preArrangementId` and returns the complete registered entry. If `counterpartyAcceptanceRequired` is `true`, the declaration is set to `PENDING_ACCEPTANCE` status and is not operative until all counterparties acknowledge.

### 6.7.2 Counterparty Acceptance

When `counterpartyAcceptanceRequired` is `true`, each listed counterparty MUST submit an acceptance acknowledgement to the Party Registry before the declaration becomes operative. The Registry tracks acceptance state per counterparty. The declaration transitions from `PENDING_ACCEPTANCE` to `ACTIVE` when all counterparties have accepted. If any counterparty rejects the declaration, it transitions to `REJECTED` and is not operative.

A counterparty acknowledgement window of 30 days from `validFrom` is the default. If not all counterparties have responded within this window, the declaration transitions to `ACCEPTANCE_TIMEOUT` and is not operative. The declaring party may resubmit.

### 6.7.3 Registration Events

| Event | Trigger | Payload notes |
|---|---|---|
| `PRE_ARRANGEMENT_REGISTERED` | Successful registration. If `counterpartyAcceptanceRequired`, status is `PENDING_ACCEPTANCE`. | |
| `PRE_ARRANGEMENT_ACCEPTED` | A counterparty has submitted acceptance. | Includes `acceptingPartyId`. |
| `PRE_ARRANGEMENT_ACTIVE` | All counterparties have accepted; declaration is now operative. | |
| `PRE_ARRANGEMENT_REJECTED` | A counterparty has rejected the declaration. | Includes `rejectingPartyId`. |
| `PRE_ARRANGEMENT_ACCEPTANCE_TIMEOUT` | Acceptance window elapsed without full acceptance. | |
| `PRE_ARRANGEMENT_UPDATED` | A registered declaration is amended (optional fields or `validUntil` extended within P1Y bound). | |
| `PRE_ARRANGEMENT_DEREGISTERED` | The declaring party explicitly deregisters before `validUntil`. | |
| `PRE_ARRANGEMENT_EXPIRED` | Declaration has passed `validUntil` without renewal. | |
| `PRE_ARRANGEMENT_AUTO_RENEWED` | Party Registry has automatically renewed a declaration with `renewalPolicy: AUTO_RENEW`. | |
| `PRE_ARRANGEMENT_MANUAL_RENEWAL_REQUIRED` | Emitted ≥ 30 days before `validUntil` of a declaration that has already been auto-renewed once and cannot be auto-renewed again. | |
| `PRE_ARRANGEMENT_CONDITION_EXPIRED` | A condition-based expiry has been triggered for a specific booking. | Includes `bookingObjectId` in payload. This is the only event in the model that carries a `bookingObjectId`. |

All events MUST include `preArrangementId`, `declaringPartyId`, `counterpartyIds`, and `declarationType` in their payload.

---

## 6.8 Interaction with the Feasibility Check

The Feasibility Check Operation (S7) MUST, as part of its per-Activity-Component evaluation, confirm that all Pre-Arrangement Declarations cited in or implied by the Activity Component's Capability Declaration are registered, in `ACTIVE` status, and applicable to the booking's jurisdiction at the time the feasibility result is emitted.

If a Pre-Arrangement Declaration is cited by a Capability Declaration but is found to be expired, deregistered, `REJECTED`, or `ACCEPTANCE_TIMEOUT` at Feasibility Check emission time, the Feasibility Check MUST emit `FEASIBILITY_FAILED` for the affected Activity Component. The rationale is that the Capability Declaration was authored under the assumption that a valid pre-arrangement exists; if that assumption no longer holds, the Activity Component cannot proceed.

If a Pre-Arrangement Declaration cited by an Activity Component has a `validUntil` within 7 days of the Feasibility Check emission time, the Feasibility Check MUST include a `PRE_ARRANGEMENT_EXPIRY_WARNING` in its response payload, identifying the `preArrangementId` and the days remaining. This threshold (7 days) is a normative choice: it provides sufficient notice for the declaring party to renew before an in-flight booking is disrupted by mid-booking declaration expiry. It does not cause `FEASIBILITY_FAILED`; it is a warning only.

---

## 6.9 Design Rules

The following design rules govern Pre-Arrangement Declarations. Rules L2-T-4-A through L2-T-4-D are reproduced from the Pre-Layer 2 Review for traceability. They are traced in S12 (Design Rules Compliance Trace).

**L2-T-4-A:** Pre-Arrangement Declarations are Layer 2 artifacts that are expressed as Party Policy Declarations in the Layer 1 Party Registry. They take effect through the Layer 3 Security Kernel's Cedar evaluation at the Party Operational policy tier.

**L2-T-4-B:** Pre-Arrangement Declarations MUST NOT be construed as bypasses of the Security Kernel. Every state transition that relies on a Pre-Arrangement Declaration still goes through the full Security Kernel execution order: authenticate, authorise, Cedar evaluation (including Pre-Arrangement), Trust Chain validation, AI agent scope validation.

**L2-T-4-C:** Layer 2 defines the schema for Pre-Arrangement Declarations, including the state transitions they may pre-authorise, the conditions under which they expire, and the jurisdiction constraints that limit their applicability. This section is the normative definition satisfying L2-T-4-C.

**L2-T-4-D:** Pre-Arrangement Declarations MUST be registered in the Party Registry before the booking begins. A Pre-Arrangement Declaration asserted for the first time during an active booking is not valid and MUST be rejected by the Security Kernel.

**DR-L2-6-A:** A `CONDITION_PRE_SATISFY` declaration MUST NOT pre-satisfy Jurisdiction-tier Cedar policy conditions. Only Protocol-tier named conditions are eligible for pre-satisfaction. Jurisdiction-tier conditions are evaluated at transition time against the published Jurisdiction Entry.

**DR-L2-6-B:** For `TRANSITION_PRE_AUTH` declarations, only transitions where real-time counterparty confirmation is ordinarily required may be listed in `scope.transitions`. Transitions that are unilateral by protocol definition MUST be rejected at registration.

**DR-L2-6-C:** `validUntil` MUST NOT exceed `validFrom` + P1Y. Registrations and renewals that would set `validUntil` beyond this bound MUST be rejected.

**DR-L2-6-D:** The Feasibility Check MUST confirm that all Pre-Arrangement Declarations cited in or implied by an Activity Component's Capability Declaration are in `ACTIVE` status at emission time. A declaration in any other status (`EXPIRED`, `DEREGISTERED`, `REJECTED`, `ACCEPTANCE_TIMEOUT`) that is cited by a Capability Declaration MUST cause `FEASIBILITY_FAILED` for the affected Activity Component.

**DR-L2-6-E:** Jurisdiction-tier Cedar policy takes precedence over Pre-Arrangement Declarations. A `jurisdictionConstraints` configuration that purports to expand jurisdiction-tier policy is inoperative; the published Jurisdiction Entry governs in all cases of conflict.

**DR-L2-6-F:** A declaration with `renewalPolicy: AUTO_RENEW` may be auto-renewed at most once without manual re-attestation. The Party Registry MUST emit `PRE_ARRANGEMENT_MANUAL_RENEWAL_REQUIRED` at least 30 days before the `validUntil` of any declaration that has exhausted its auto-renewal allowance.

**DR-L2-6-G:** `counterpartyAcceptanceRequired` MUST be `true` for all `TRANSITION_PRE_AUTH` and `CONDITION_PRE_SATISFY` declarations. A registration of either type with `counterpartyAcceptanceRequired: false` MUST be rejected.

---

*End of Section 6*
