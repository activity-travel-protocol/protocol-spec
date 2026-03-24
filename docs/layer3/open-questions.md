# Open Questions Resolution

**Activity Travel Protocol — Layer 3 Workflow Specification**\
Working Draft | Section 13 | March 2026

| Field | Value |
|---|---|
| **Questions resolved** | OQ-L3-1, OQ-L3-2, OQ-L3-3, OQ-L3-5, OQ-L3-6, OQ-L3-7, OQ-SL-1 |
| **Gap noted** | OQ-L3-4 — not raised; gap is intentional |

---

## 13.1 Purpose and structure

During the drafting of Sections 1 through 12 of this specification, questions arose that could not be resolved within the section where they were identified without either exceeding that section's scope or making a decision that warranted separate treatment. Those questions were assigned identifiers in the OQ-L3 and OQ-SL series and deferred to this section.

This section resolves each open question with a formal disposition. Each disposition is one of three kinds:

- **CLOSED** — the question is resolved with a normative decision recorded here. The decision is binding on the Layer 3 specification and is referenced in S14 Design Rules Compliance Trace where applicable.
- **DEFERRED** — the question is explicitly placed outside the scope of this specification. The deferral records where the question belongs and what condition would reopen it.
- **TRANSFERRED** — the question has been resolved in another section of this specification and is recorded here for completeness. No new decision is made.

Questions are presented in identifier order. OQ-L3-4 was never raised during drafting; the gap in numbering is noted and intentional.

> **Reading note:** Dispositions marked CLOSED are normative. Dispositions marked DEFERRED or TRANSFERRED are informational records of prior decisions or scope boundaries. S14 traces all CLOSED dispositions against the Layer 3 design rules.

## 13.2 Master disposition table

| ID | Disposition | Origin | Summary |
|---|---|---|---|
| **OQ-L3-1** | TRANSFERRED | Pre-Layer 3 review | INQUIRY operates against static Capability Declarations. Closed in S1. Recorded here for completeness. |
| **OQ-L3-2** | DEFERRED | Project Brief S9 | MICE bookings deferred to a named Layer 3 extension specification. Out of scope for v1.0. |
| **OQ-L3-3** | DEFERRED | Project Brief S9 | A2A Protocol integration deferred to Layer 2. Layer 3 AI agent model is complete on MCP alone. |
| **OQ-L3-4** | — | Not raised | This identifier was not assigned during drafting. The gap is intentional and does not indicate an unresolved question. |
| **OQ-L3-5** | CLOSED | S12 — 12.4.1 | Coordination Delegation limited to exactly two parties in v1.0. Delegation chaining is the conformant workaround. Multi-party extension deferred to Layer 2. |
| **OQ-L3-6** | CLOSED | S12 — 12.7.1 | DISRUPTION_ADJACENT carries no named protocol timeout. Cascade assessment is Host Party responsibility without a Security Kernel deadline. |
| **OQ-L3-7** | CLOSED | S12 — 12.4.5 | Coordination Delegation phaseWindow expiry freezes during BOOKING_SUSPENDED, consistent with the general timeout freeze rule in S5. |
| **OQ-SL-1** | DEFERRED | Standards Landscape v1.0 | CAAM Trust Chain mapping deferred to a dedicated CAAM Bridge Specification. Trigger: stabilisation of draft-barney-caam beyond -00. |

## 13.3 Full resolution text

### 13.3.1 OQ-L3-1 — INQUIRY against static Capability Declarations

| | |
|---|---|
| **OQ-L3-1** | **TRANSFERRED** — Resolved in Section 1. Recorded here for completeness. |

**Question:** Should INQUIRY-phase processing operate against live availability data supplied by Fulfilling Parties in real time, or against static Capability Declarations registered at onboarding?

**Resolution:** INQUIRY operates against static Capability Declarations. Live availability querying is a Layer 2 concern and is explicitly out of scope for Layer 3.

Layer 3 requires only that a FEASIBILITY_CLEARED event is recorded per Activity Component before the Booking Object exits the INQUIRY state. The mechanism by which feasibility is assessed — whether against a static declaration or a live availability check — is an implementation decision. The protocol does not mandate live availability checks at Layer 3 and does not define their format or timing. That definition is a Layer 2 responsibility.

This resolution was reached during drafting of Section 1 and is normative in S1 Section 1.4. It is recorded here because it was the first formally numbered open question raised during Layer 3 preparation and its closure in S1 should be explicitly acknowledged.

> **Cross-reference:** S1 Section 1.4 — Two-axis model and INQUIRY scope. The FEASIBILITY_CLEARED event is defined in S3.

---

### 13.3.2 OQ-L3-2 — MICE scope

| | |
|---|---|
| **OQ-L3-2** | **DEFERRED** — MICE bookings are out of scope for Layer 3 v1.0. A named Layer 3 MICE Extension Specification will address them after v1.0 is complete. |

**Question:** Do Meetings, Incentives, Conferences, and Events bookings fall within the Activity Travel Protocol Layer 3 scope for v1.0, or should they be treated as a named extension?

**Background:** MICE bookings share structural characteristics with the activity bookings that Layer 3 is designed to handle: multi-supplier fulfillment, phased delivery, AI agent coordination, and cross-jurisdiction compliance. However, MICE introduces several concepts that do not map cleanly onto the core protocol model:

- **Group size scaling:** MICE bookings routinely involve 10 to 500 or more participants. The Activity Component model is designed around a traveler or small group as the primary subject. Participant roster management, rooming list handling, and group-level Duty of Care require extensions to the model.
- **Contract structures:** MICE contracts typically include minimum attendee guarantees, cancellation waterfalls, and F&B minimums that have no equivalent in individual activity booking. These require policy constructs beyond those defined in the ODRL-based policy engine.
- **Fulfillment topology:** A MICE event at a single venue may involve a venue hire agreement, embedded catering, AV provision, and accommodation — all from sub-suppliers of the venue. This creates a supplier hierarchy that the current Activity Component model does not represent.
- **Regulatory treatment:** Several jurisdictions treat MICE bookings under distinct regulatory frameworks — event licensing, venue liability caps, force majeure provisions specific to gatherings — that are not captured in the current jurisdiction compliance specifications.

**Resolution:** MICE bookings are out of scope for the Activity Travel Protocol Layer 3 v1.0 specification. The following disposition applies:

- The Layer 3 v1.0 specification makes no normative statements about MICE bookings. Implementations handling MICE bookings are not non-conformant by virtue of handling MICE; they are simply operating in territory the protocol does not yet address.
- A Layer 3 MICE Extension Specification will be defined after Layer 3 v1.0 reaches a stable published state. The extension will be designed as a strict superset of Layer 3. All Layer 3 normative rules will apply within the MICE Extension unless explicitly superseded.
- The MICE Extension Specification will address: participant roster management, group-level Duty of Care, MICE-specific cancellation policy constructs, supplier hierarchy within a venue, and MICE-relevant jurisdiction compliance entries.

> **Reopen condition:** This question may be reopened if a Founding Consortium member requires MICE support as a condition of joining, or if regulatory analysis reveals that a jurisdiction's compliance obligations cannot be met without MICE constructs in the core protocol.

---

### 13.3.3 OQ-L3-3 — A2A Protocol integration

| | |
|---|---|
| **OQ-L3-3** | **DEFERRED** — A2A Protocol integration is a Layer 2 concern. The Layer 3 AI agent model is complete and self-contained on MCP. Re-evaluate at Layer 2 Capability Catalogue design. |

**Question:** How does the Agent2Agent Protocol (A2A) interact with the Activity Travel Protocol's AI agent participation model as defined in Section 9, and does A2A need to be addressed in Layer 3?

**Background:** The Activity Travel Protocol Standards Landscape v1.0 positions A2A as MONITOR: re-evaluate at Layer 2. The question of whether A2A touches Layer 3 arises because Section 9 defines the AI agent participation model, including authority scopes, Context Package assembly, and Decision Object validation.

**Resolution:** A2A does not touch Layer 3. The Layer 3 AI agent participation model is complete and self-contained on the MCP server (atp-mcp) as the integration surface. An AI agent — regardless of whether it uses A2A for inter-agent communication externally — participates in Activity Travel Protocol workflows through the atp-mcp tool interface, operating within the authority scopes defined in S9.

A2A is relevant at Layer 2 in the following specific sense: Layer 2 will define how AI agents discover each other and advertise capabilities in the context of the Activity Travel Protocol. If A2A provides a standard mechanism for agent capability advertisement and task routing, it may be adopted at Layer 2 for that purpose. That adoption would not change the Layer 3 AI agent model.

- Layer 3 makes no normative statements about A2A.
- An AI agent using A2A for its own inter-agent communication is not non-conformant with the Activity Travel Protocol, provided it interacts with the protocol through the atp-mcp interface per S9.
- The A2A MONITOR position is maintained. Re-evaluation is triggered at Layer 2 design commencement, specifically when Layer 2 Capability Catalogue design begins.

> **Reopen condition:** Re-evaluate A2A at Layer 2 Capability Catalogue design commencement.

---

### 13.3.4 OQ-L3-4 — Not raised

This identifier was not assigned during drafting. The gap in the OQ-L3 numbering sequence is intentional. OQ-L3-4 does not represent an unresolved question — it was simply never raised. The numbering gap is preserved to maintain traceability with the drafting history of this specification.

---

### 13.3.5 OQ-L3-5 — Coordination Delegation subject count

| | |
|---|---|
| **OQ-L3-5** | **CLOSED** — Coordination Delegation is limited to exactly two Fulfilling Party subjects in v1.0. Delegation chaining is the conformant workaround for multi-party requirements exceeding two subjects. |

**Question:** Should a Coordination Delegation be permitted to name more than two Fulfilling Parties as credential subjects, to support scenarios where three or more suppliers must coordinate directly?

**Background:** During drafting of Section 12, it was noted that some multi-party scenarios involve three or more suppliers who may need to coordinate simultaneously. A guided mountain trek might involve a transport operator, a guiding company, and a mountain hut operator — all of whom need to communicate about timing and traveler status. A Coordination Delegation naming all three would simplify this.

**Resolution:** The two-subject limit is confirmed for v1.0. Rationale:

- **Trust model integrity:** The W3C VC 2.0 credential format supports multiple credential subjects, but the Activity Travel Protocol's hub-and-spoke trust model is designed for bilateral relationships. A three-party Coordination Delegation would require the Host Party to vouch for a three-way trust relationship, which introduces complexity in revocation and dispute resolution that the current Layer 1 trust model is not designed to handle.
- **Conformant workaround:** A Host Party requiring three-party coordination issues two separate bilateral Coordination Delegations: one between Party A and Party B, and one between Party B and Party C. This achieves the same coordination outcome through delegation chaining.
- **Scope:** Scenarios requiring native multi-party coordination beyond two subjects are anticipated to involve MICE-type bookings, which are deferred to the MICE Extension Specification.

The two-subject limit (design rule CD-1) is normative in Layer 3 v1.0.

> **Reopen condition:** If real-world implementation experience demonstrates that delegation chaining is operationally insufficient for common non-MICE multi-party scenarios, this question may be reopened in a Layer 3 amendment.

---

### 13.3.6 OQ-L3-6 — DISRUPTION_ADJACENT timeout

| | |
|---|---|
| **OQ-L3-6** | **CLOSED** — DISRUPTION_ADJACENT carries no named protocol timeout. Cascade assessment is Host Party responsibility without a Security Kernel deadline. |

**Question:** Should DISRUPTION_ADJACENT carry a named protocol timeout analogous to the PT1H DISRUPTION_REVIEW timeout, to ensure the Host Party performs cascade assessment within a defined window?

**Background:** When force majeure is declared for one Activity Component (partial scope), other Activity Components may be classified as DISRUPTION_ADJACENT. The question is whether the Host Party should be required to complete cascade assessment within a protocol-defined window, enforceable by the Kernel Scheduler.

**Resolution:** No named protocol timeout is assigned to DISRUPTION_ADJACENT. Rationale:

- **Operational heterogeneity:** Cascade assessment timelines vary enormously by booking type and disruption nature. A transport disruption affecting a day tour has a very different cascade window from a weather event affecting a multi-day trek. A fixed protocol timeout would either be too tight for complex cases or too loose to provide meaningful pressure in simple cases.
- **Host Party accountability:** The Host Party is the trust anchor and coordination owner. The obligation to perform cascade assessment is structural — it follows from the Host Party's role — not procedural. A Kernel-enforced deadline is not necessary when the Host Party's commercial and duty-of-care interests already compel timely assessment.
- **Kernel scope:** The Kernel Scheduler is designed to enforce timeouts where autonomous protocol action must occur or be blocked. DISRUPTION_ADJACENT assessment does not block any autonomous action — it is an informational classification that guides the Host Party's decision-making.

DISRUPTION_ADJACENT carries no Security Kernel timeout. This disposition is normative.

---

### 13.3.7 OQ-L3-7 — Coordination Delegation freeze during BOOKING_SUSPENDED

| | |
|---|---|
| **OQ-L3-7** | **CLOSED** — Coordination Delegation phaseWindow expiry freezes during BOOKING_SUSPENDED, consistent with the general timeout freeze rule in Section 5.3. |

**Question:** When a Booking Object enters BOOKING_SUSPENDED while a Coordination Delegation is active, does the delegation's phaseWindow expiry continue to advance, or is it frozen along with other timeout clocks?

**Background:** Section 5.3 establishes that all timeout clocks are frozen when BOOKING_SUSPENDED is active. The question is whether Coordination Delegation expiry is governed by this rule or whether it follows wall-clock time independently of the suspension.

**Resolution:** Coordination Delegation expiry is frozen during BOOKING_SUSPENDED, consistent with the general timeout freeze rule. Rationale:

- **Consistency:** The general timeout freeze rule exists to prevent the booking from reaching an inconsistent state while in suspension. If Coordination Delegation expiry were not frozen, a delegation could expire during suspension, leaving the resuming booking without a valid coordination mechanism for components that were previously delegated.
- **Delegation semantics:** A Coordination Delegation is scoped to a phaseWindow. BOOKING_SUSPENDED freezes the journey phase — the booking does not advance through phases while suspended. It would be semantically incoherent for the delegation's phase-scoped validity to expire while the phase itself is frozen.
- **Delegation chaining:** On BOOKING_SUSPENDED exit, the booking resumes at the preserved phase. Frozen delegations resume with their remaining validity intact. A delegation whose phaseWindow boundary would have been reached during the suspension period expires on BOOKING_SUSPENDED exit, not during the suspension.

The freeze rule for Coordination Delegations is normative in Section 5.3.

---

### 13.3.8 OQ-SL-1 — CAAM Trust Chain mapping

| | |
|---|---|
| **OQ-SL-1** | **DEFERRED** — CAAM Trust Chain ↔ act-claim mapping is deferred to a dedicated CAAM Bridge Specification. Trigger: stabilisation of draft-barney-caam beyond -00. |

**Question:** Should the mapping between the Activity Travel Protocol Trust Chain model and the CAAM (Consumer Attribute and Authentication Mechanisms) act-claim model be specified in a Layer 3 security appendix, or as a standalone bridge specification?

**Background:** The Activity Travel Protocol Standards Landscape v1.0 positions CAAM ([draft-barney-caam-00]) as BRIDGE. CAAM defines an act-claim model for identity assertions in multi-party contexts that has relevance to the Activity Travel Protocol's Trust Chain model. The question is where to define the mapping between the two.

**Resolution:** The CAAM Trust Chain mapping is deferred to a standalone CAAM Bridge Specification. Rationale:

- **Specification stability:** draft-barney-caam-00 is a very early internet draft. Normative dependency on a -00 draft in a published specification creates maintenance risk. The Activity Travel Protocol should not bind its Layer 3 specification to an internet draft that may change substantially before standardisation.
- **Scope separation:** The CAAM mapping is a bridge concern — it defines interoperability between the Activity Travel Protocol and an external identity framework. Bridge specifications are a separate document class in the Activity Travel Protocol documentation structure, distinct from layer specifications.
- **Trigger condition:** The CAAM Bridge Specification will be initiated when draft-barney-caam stabilises beyond -00 (i.e., when it reaches -01 or later with a relatively stable act-claim model).

The CAAM [BRIDGE] position in the Standards Landscape is maintained. Layer 3 makes no normative statements about CAAM.

> **Reopen condition:** Initiate CAAM Bridge Specification when draft-barney-caam stabilises beyond -00.

---

*Activity Travel Protocol — Layer 3 Workflow Specification — Working Draft — Section 13 — March 2026*
