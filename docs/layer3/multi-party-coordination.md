# Multi-Party Coordination

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 12 | March 2026

| Field | Value |
|---|---|
| **Depends on** | S3, S4, S5, S6, S7, S8, S9, S10, S11 |
| **Design rules** | DoC-1, DoC-2, DoC-3, DoC-4, CD-1, CD-2, SP-1 |

---

## 12.1 Scope and relationship to other sections

Sections 3 through 11 of this specification define the Activity Travel Protocol's behaviour for a single Booking Object moving through its state lifecycle and IN_JOURNEY phases. They establish state transitions, phase cycling, BOOKING_SUSPENDED behaviour, HEM invocation, disruption handling, AI agent participation, named protocol events, and timeout budgets. All of that machinery is written with a single supplier in mind, or with the Host Party acting as a single coordination point.

Section 12 extends the protocol to the multi-supplier case. When a Booking Object involves two or more Fulfilling Parties operating concurrently or in sequence — a guided trek with a transport supplier, a mountain accommodation supplier, and a guiding company, for example — additional protocol obligations arise that S3–S11 do not address. Specifically:

- Duty of Care passes between Fulfilling Parties at defined transfer points, and must be tracked and acknowledged at the protocol level.
- The Trust Chain must extend to cover direct inter-supplier coordination without compromising the Host Party's role as trust anchor.
- Activity Components within a phase may execute concurrently or in a declared dependency sequence, and the Security Kernel must be able to enforce synchronisation gates.
- Disruption events that affect one supplier may cascade to others, requiring coordination obligations beyond those defined in S8.
- AI agents operating under S9 authority scopes must be able to act within the multi-party coordination model.

This section does not redefine any machinery from S3–S11. It adds coordination obligations on top of that machinery. Cross-references to earlier sections are used throughout; readers should treat those sections as normative context for the rules defined here.

> **Scope boundary:** Section 12 covers protocol-level coordination obligations. It does not cover commercial agreements between Fulfilling Parties, SLA terms, or capability advertisement, which are Layer 2 concerns.

## 12.2 Multi-party booking model

A multi-party booking is a Booking Object that names two or more Fulfilling Parties, each responsible for one or more Activity Components. The Booking Object remains a single runtime entity with a single UUID; the multi-party structure is expressed entirely through Activity Component assignments, not through separate Booking Objects.

### 12.2.1 Party roles

The roles defined in Layer 1 apply without modification. In the multi-supplier context their operational implications are:

| Role | Multi-party obligations |
|---|---|
| **Host Party** | Trust anchor for the entire Booking Object. Issues Coordination Delegations. Leads HEM response when Duty of Care is ambiguous. Owns protocol-level TU state in multi-supplier phases. All phase transitions require Host Party Security Kernel gate enforcement. |
| **Fulfilling Party** | Responsible for one or more Activity Components. Must acknowledge Duty of Care transfers. May request Coordination Delegations. Must record all coordinated actions against the Booking Object within the timeout budget defined in S11. |
| **AI Agent** | Operates within S9 authority scopes. May request Coordination Delegations subject to the AGENT_COORDINATE scope and applicable human confirmation checkpoints. May not initiate Duty of Care transfers directly; must do so through the Host Party Security Kernel. |

### 12.2.2 Activity Component as the unit of supplier responsibility

Each Fulfilling Party's obligations in a multi-party booking are scoped to the Activity Components assigned to it. A Fulfilling Party has no protocol obligations for Activity Components assigned to other parties, except where a Synchronisation Point (see 12.5) requires acknowledgement across components, or where a Coordination Delegation (see 12.4) creates a temporary direct coordination relationship.

The Activity Component status model defined in S3 applies to each component independently. A Booking Object may have Activity Components in different statuses simultaneously; this is the normal operating state of a multi-party booking during an IN_JOURNEY phase.

---

## 12.3 Duty of care handoff protocol

Duty of Care (DoC) passes between Fulfilling Parties as the traveler moves from one supplier's sphere of responsibility to another. The transfer is a Security Kernel operation, as established in S4. This section specifies the protocol for executing that transfer in the multi-party context.

### 12.3.1 Transfer initiation

A Duty of Care transfer begins when the transferring Fulfilling Party records a DUTY_OF_CARE_TRANSFER_INITIATED event against the relevant Activity Component. This event must identify:

- The transferring Fulfilling Party (by Party Registry identifier).
- The receiving Fulfilling Party (by Party Registry identifier).
- The Activity Component or Components to which the transfer applies.
- The timestamp of initiation.

Recording DUTY_OF_CARE_TRANSFER_INITIATED is a Security Kernel operation. The transferring party must be authenticated and authorised at the time of recording. The event is appended to the Booking Object's append-only log and cannot be revoked.

### 12.3.2 Design rule DoC-1 — Mandatory acknowledgement

> **DoC-1:** A Duty of Care transfer is not complete until the receiving Fulfilling Party records a signed DUTY_OF_CARE_ACCEPTED event against the relevant Activity Component. The transferring party's DoC obligations do not terminate until that event is present in the Booking Object log.

The DUTY_OF_CARE_ACCEPTED event must be recorded by the receiving Fulfilling Party using its own Trust Chain key. A Host Party acting on behalf of a receiving party is not a valid substitute. The event must reference the corresponding DUTY_OF_CARE_TRANSFER_INITIATED event by log sequence number.

If the receiving party fails to record DUTY_OF_CARE_ACCEPTED within DOC_TRANSFER_ACK_TIMEOUT (PT15M — see S11), the Security Kernel initiates HEM escalation per the procedure in 12.3.4 below.

### 12.3.3 Design rule DoC-2 — Concurrent obligation window

> **DoC-2:** During the period between a DUTY_OF_CARE_TRANSFER_INITIATED event and a DUTY_OF_CARE_ACCEPTED event, both the transferring and receiving Fulfilling Parties carry concurrent Duty of Care obligations. The transferring party retains full DoC liability. The receiving party carries an operational duty to act as if DoC has transferred for the purpose of immediate traveler welfare decisions. This concurrent window terminates on recording of DUTY_OF_CARE_ACCEPTED or on HEM escalation per 12.3.4.

The concurrent obligation window reflects the operational reality that the traveler may have physically moved to the receiving party's premises before the protocol acknowledgement is recorded. During this window, neither party may treat the other as solely responsible for the traveler's welfare.

### 12.3.4 HEM escalation during DoC gap period

If an incident requiring HEM invocation occurs during the DoC-2 concurrent obligation window, the following procedure applies:

- Either the transferring Fulfilling Party or the receiving Fulfilling Party may record a HEM_INVOCATION_REQUESTED event. This is not limited to the transferring party.
- On receipt of HEM_INVOCATION_REQUESTED during an open DoC gap period, the Host Party Security Kernel determines the escalation owner. This determination is based on the nature of the incident and the current operational status of each party, and is recorded as a COORDINATION_OWNER_ASSIGNED event in the Booking Object log.
- The assigned coordination owner then proceeds with HEM invocation per S6. Both parties remain obligated to provide information and cooperation to the coordination owner until the gap period closes.
- If the Host Party itself is the source of the escalation (e.g. triggered by timeout), the Host Party Security Kernel assigns coordination ownership directly without waiting for a HEM_INVOCATION_REQUESTED event from either Fulfilling Party.

> **Design rationale:** Permitting either party to initiate during the gap period prevents deadlock in the scenario where the transferring party is operationally unreachable after the traveler has moved. The Host Party adjudication step ensures that escalation ownership is unambiguous before HEM proceeds.

---

## 12.4 Trust chain in multi-party context

The Trust Chain architecture defined in Layer 1 establishes bilateral trust relationships between the Host Party and each Fulfilling Party. In a multi-party booking, these relationships are hub-and-spoke: the Host Party is the trust anchor, and each Fulfilling Party's trust flows from its relationship with the Host Party, not from any relationship with other Fulfilling Parties.

This model is operationally correct at booking creation and during pre-journey phases. During IN_JOURNEY phases, however, situations arise where two Fulfilling Parties must coordinate directly — for example, when a transport supplier needs to communicate a delay to an accommodation supplier to avoid a missed check-in. Routing all such communication through the Host Party introduces latency and availability risk.

The Coordination Delegation mechanism addresses this without compromising the hub-and-spoke trust model.

### 12.4.1 Design rule CD-1 — Coordination Delegation as Verifiable Credential

> **CD-1:** A Coordination Delegation is a Verifiable Credential issued by the Host Party under its Trust Chain key, naming exactly two Fulfilling Parties as credential subjects, scoped to one or more Activity Components, and valid for a defined phase window or explicit expiry time, whichever is earlier. It is a first-class protocol artifact conforming to the W3C VC Data Model 2.0 as adopted in the Activity Travel Protocol Layer 1 standards. A Host Party requiring coordination among three or more Fulfilling Parties on a single Activity Component must issue separate bilateral Coordination Delegations for each required pair. A single delegation with more than two subjects is not permitted in v1.0.

### 12.4.2 Coordination Delegation schema

A Coordination Delegation credential must contain the following claims:

| Field | Type | Description |
|---|---|---|
| **issuer** | Party Registry ID | Host Party identifier. |
| **credentialSubjects** | Array[2] | Exactly two Fulfilling Party identifiers. Order has no protocol significance. |
| **componentScope** | Array[ActivityComponentID] | One or more Activity Component identifiers to which the delegation applies. |
| **phaseWindow** | IN_JOURNEY Phase | The IN_JOURNEY phase during which the delegation is valid. May not span phase boundaries. |
| **expiryTime** | ISO 8601 timestamp | Absolute expiry. Delegation expires at phaseWindow end or expiryTime, whichever is earlier. |
| **revocationEndpoint** | URI | Host Party endpoint for real-time revocation status checks. |
| **issuedAt** | ISO 8601 timestamp | Timestamp of issuance. |
| **proof** | VC 2.0 proof | Linked Data Proof signed with the Host Party's Trust Chain key. |

A Coordination Delegation may not be issued for a phase that has already completed. A delegation covering a future phase window is valid and may be pre-issued during the CONFIRMED booking state.

### 12.4.3 Design rule CD-2 — Delegation request and issuance

> **CD-2:** A Fulfilling Party may request a Coordination Delegation from the Host Party by recording a COORDINATION_DELEGATION_REQUESTED event. The Host Party must respond within CD_ISSUANCE_TIMEOUT (PT30M — see S11). If the Host Party does not respond within PT30M, the refusal is recorded and the requesting party may re-request.

The Host Party has sole authority to issue Coordination Delegations. A Fulfilling Party may not issue a Coordination Delegation on behalf of the Host Party. A Host Party may pre-emptively issue delegations without a request from the Fulfilling Parties.

### 12.4.4 Coordination Delegation usage

When two Fulfilling Parties hold a valid Coordination Delegation covering an Activity Component and a phase window, they may communicate directly about the scoped components during the valid phase. The delegation does not grant:

- Authority to modify the Booking Object (only the Host Party Security Kernel may record protocol events).
- Authority to make binding decisions affecting the traveler's booking without Host Party confirmation.
- Extended trust beyond the scope and phase window stated in the delegation.

### 12.4.5 Coordination Delegation phase boundary behaviour

A Coordination Delegation expires at the earlier of its phaseWindow boundary and its expiryTime. When the journey phase advances past the phaseWindow boundary, the delegation expires automatically — the Host Party does not need to explicitly revoke it.

A Coordination Delegation whose phaseWindow boundary is reached during a BOOKING_SUSPENDED period does not expire during the suspension. Consistent with the Coordination Delegation freeze rule stated in Section 5.3, the phaseWindow expiry is frozen during BOOKING_SUSPENDED and occurs on BOOKING_SUSPENDED exit. See Section 13 OQ-L3-7 for normative rationale.

---

## 12.5 Synchronisation points

A Synchronisation Point is a Kernel-enforced gate in a multi-party booking that requires one or more Activity Components to reach a defined status before the booking may advance. Synchronisation Points are declared in the Booking Object at creation or during the CONFIRMED state.

### 12.5.1 Design rule SP-1 — Security Kernel enforcement

> **SP-1:** The Security Kernel enforces Synchronisation Point gates. Activity Components not covered by a declared Synchronisation Point are concurrent by default — they proceed independently without waiting for other components.

Named Synchronisation Points must be declared explicitly. The absence of a Synchronisation Point declaration means the components proceed concurrently. Implementers must not infer synchronisation dependencies from operational context — all gates must be explicitly declared.

### 12.5.2 Synchronisation Point declaration

A Synchronisation Point declaration in the Booking Object specifies:

- A set of Activity Component identifiers that must reach a defined status before the gate passes.
- The required status for each component (FULFILLED, FULFILLING, or PENDING for pre-start synchronisation).
- The phase in which the gate is evaluated.
- The timeout (SYNCHRONISATION_TIMEOUT, PT30M default — see S11).

### 12.5.3 SYNCHRONISATION_TIMEOUT

If a Synchronisation Point gate has not passed within SYNCHRONISATION_TIMEOUT from the earliest component reaching the required status, the Kernel records SYNCHRONISATION_TIMEOUT_ELAPSED and invokes HEM with escalation_reason: SYNCHRONISATION_TIMEOUT. The human actor must determine whether to:

- Wait for the blocking component (extend gate).
- Proceed without the blocking component (treat as CANCELLED or FAILED).
- Cancel the affected portion of the booking.

---

## 12.6 Multi-party AI agent coordination

AI agents participating in multi-party bookings operate under the same S9 authority scope model as in single-supplier bookings, with the following additions.

### 12.6.1 AGENT_COORDINATE scope

Agents holding AGENT_COORDINATE scope may perform the following actions in addition to their base DT scope:

- Record DUTY_OF_CARE_TRANSFER_INITIATED (with human confirmation — the transfer itself is a Kernel operation).
- Record DUTY_OF_CARE_ACCEPTED (with human confirmation).
- Record COORDINATION_DELEGATION_REQUESTED (no confirmation required — this is a request, not an execution).
- Trigger a PENDING_SYNCHRONISATION release (no confirmation required — Kernel gate evaluation executes the release).

AGENT_COORDINATE scope does not elevate the agent's DT authority ceiling. An agent with CONFIGURATION_SUGGESTION + AGENT_COORDINATE scope may not perform DT-4 actions — the AGENT_COORDINATE extension applies to coordination mechanics only.

### 12.6.2 AGENT_ESCALATE scope

Agents holding AGENT_ESCALATE scope may record HEM_INVOCATION_REQUESTED during an open DoC gap period without human confirmation. This scope is narrow and intended for emergency escalation contexts only. An agent holding only AGENT_ESCALATE may not perform booking actions or coordination delegation requests.

### 12.6.3 Context Package assembly under Coordination Delegation

When an AI agent is invoked for an activity that falls under an active Coordination Delegation, the Context Package assembled at the ASSEMBLY POINT includes:

- The active Coordination Delegation credential (reference and scope).
- The Activity Components within the delegation's componentScope.
- Both Fulfilling Parties' context, limited to their respective component scopes.
- The standard TRAVELER_PII and location_disclosure_blocked rules apply — the delegation does not expand data access.

---

## 12.7 Multi-party disruption handling

Disruption events in multi-party bookings follow the S8 model. The following additions apply.

### 12.7.1 DISRUPTION_ADJACENT

When force majeure is declared for one Activity Component in a multi-party booking, other Activity Components served by different Fulfilling Parties may be classified as DISRUPTION_ADJACENT. DISRUPTION_ADJACENT indicates that the component is at risk due to logistical cascades from the primary disruption event, but is not itself the subject of a disruption declaration.

DISRUPTION_ADJACENT carries no Security Kernel timeout. Cascade assessment is Host Party responsibility without a protocol deadline. See Section 13 OQ-L3-6 for normative rationale.

### 12.7.2 Disruption notification cascade

When a DT-4 disruption declaration is confirmed (C1 window elapsed), the Kernel notifies all Fulfilling Parties with active Activity Components in the affected phase. Each notified party must acknowledge receipt via IPC channel within PT30M. Failure to acknowledge triggers PARTY_UNRESPONSIVE for that party.

### 12.7.3 Design rule DoC-3 — HEM during DoC gap

> **DoC-3:** When a disruption event occurs during a DoC-2 concurrent obligation window, the Host Party Security Kernel leads HEM invocation and assigns coordination ownership via the procedure in Section 12.3.4.

### 12.7.4 Design rule DoC-4 — TU chain ownership in multi-party context

> **DoC-4:** In a multi-party booking, the Fulfilling Party that was actively fulfilling a component when a TRAVELER_UNREACHABLE incident is declared owns the TU chain operationally — they lead the initial response and alt_contact attempt. The Host Party Security Kernel retains protocol-level ownership of the TU chain record. If the active Fulfilling Party becomes unreachable, the Host Party assumes both operational and protocol ownership.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 12 — March 2026*
