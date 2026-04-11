# OQ-AS-3 Resolution, Implementation Notes & Version History

*ATP Prompt Library · Sections 8–10*

[← Discovery Agent](discovery-agent)

## 8. OQ-AS-3 — OCTO Bridge Product Type Mapping (Partial)
>
## OQ-AS-3: PARTIALLY RESOLVED — CLOSED (partial)
>
> Question: Complete mapping between OCTO v2 product types and ATP
> Activity Category Registry.
>
> Resolution: Mapping table produced (Section 8.1). Sufficient for
> Discovery Agent persona
>
> template and Arc 4 blog posts. Full schema-level mapping
> (field-by-field) deferred to
>
> Track 3 Session 6 (Layer 4 Schema and SDK).
>
> Confidence levels: DIRECT (1:1 semantic match), APPROXIMATE (partial
> match), INDIRECT
>
> (OCTO type maps to ATP category with loss of specificity).

### 8.1 Mapping Table

The following table maps the OCTO v2 primary product type values to the
ATP Activity Category Registry starter catalogue. Where mapping
confidence is APPROXIMATE or INDIRECT, Discovery Agent results MUST flag
this to the consumer.

  **OCTO v2 product   **ATP Activity        **Confidence**
  type**              Category**            
  TOUR                CULTURAL_TOUR         DIRECT

  ACTIVITY            OUTDOOR_ADVENTURE     APPROXIMATE — OCTO ACTIVITY
                                            is broad; ATP has specific
                                            categories

  ATTRACTION          CULTURAL_TOUR         APPROXIMATE — map to most
                                            specific ATP category available

  TRANSFER            GROUND_TRANSPORT      DIRECT

  ACCOMMODATION       (out of scope)        INDIRECT — not in ATP
                                            Activity Category Registry v1
                                            scope

  SKI_PASS            SKI_ALPINE            DIRECT

  RENTAL              EQUIPMENT_RENTAL      DIRECT — add to ATP Category
                                            Registry as EQUIPMENT_RENTAL
                                            (OQ-AS-3 extension)

  DINING              CULINARY_EXPERIENCE   DIRECT

  SPA                 WELLNESS              APPROXIMATE — broader than
                                            spa

  EVENT               CULTURAL_EVENT        APPROXIMATE — OCTO EVENT
                                            includes sports events

  SPORT               OUTDOOR_ADVENTURE     APPROXIMATE — ATP
                                            distinguishes SKI_ALPINE,
                                            WATER_SPORTS separately

  CRUISE              WATER_TRANSPORT       APPROXIMATE — add
                                            WATER_TRANSPORT to registry
                                            (OQ-AS-3 extension)

  WATER_SPORTS        WATER_SPORTS          DIRECT — confirm as ATP
                                            category (current registry:
                                            OUTDOOR_ADVENTURE)

  FARM_EXPERIENCE     FARM_EXPERIENCE       DIRECT — MyAuberge Ponyhouse
                                            Farm reference category

  CULTURAL            CULTURAL_TOUR         DIRECT

  WORKSHOP            CULINARY_EXPERIENCE   APPROXIMATE — expand ATP
                                            registry for craft/workshop
                                            category

### 8.2 Session 6 Deferred Items

The following are deferred to Track 3 Session 6 (Layer 4 Schema and SDK)
for full specification:

-   Field-level mapping: OCTO v2 CapabilityDeclaration fields → ATP
    Activity Configuration Schema fragment fields.

-   EQUIPMENT_RENTAL category: confirm addition to ATP Activity Category
    Registry.

-   WATER_TRANSPORT category: confirm addition for cruise/boat charter.

-   Workshop/craft category: evaluate whether CULINARY_EXPERIENCE should
    be renamed or a separate WORKSHOP category added.

-   OCTO product type ACCOMMODATION: formal exclusion from ATP bridge
    scope (accommodation handled at Layer 1 Party Registry level, not
    Activity Category).

## 9. Implementation Notes for SDK Adopters

### 9.1 Loading Templates

Templates are distributed as Markdown files in the @atp/llms-tooling
npm package. The package exports a TypeScript helper API for loading and
composing templates:

> import { loadPersonaTemplate, renderWindleyContext,
> composeSystemPrompt }
>
> from '@atp/llms-tooling';
>
> // Load persona template (Block 1)
>
> const personaBlock = await loadPersonaTemplate('guest-agent', {
>
> OPERATOR_NAME: 'MyAuberge K.K.',
>
> NOTIFICATION_CHANNELS: 'WHATSAPP, LINE',
>
> GUEST_PREFERRED_LANGUAGE: 'ja',
>
> });
>
> // Generate Windley context (Block 2) from Cedar residual policy set
>
> const windleyBlock = renderWindleyContext(residualPolicySet, {
>
> BOOKING_OBJECT_ID: bookingObject.id,
>
> BOOKING_OBJECT_STATE: bookingObject.state,
>
> OPERATOR_NAME: 'MyAuberge K.K.',
>
> DEPLOYMENT_TIER: 'TIER_2',
>
> MANDATE_TTL_SECONDS: mandateTTL,
>
> });
>
> // Compose full system prompt (Blocks 1 + 2)
>
> const systemPrompt = composeSystemPrompt(personaBlock, windleyBlock);
>
> // Block 3 (conversation context) is appended by the runtime at
> inference time

### 9.2 Re-injection Pattern

When a re-query trigger fires (MCP-D14 — Booking Object state
transition), the runtime must re-generate Block 2 and re-inject it into
the agent's context. Block 1 (persona) does not change.

> // After atp_get_booking_status reveals a state transition:
>
> if (newState !== previousState) {
>
> // Re-run Cedar partial evaluation
>
> const newResidualPolicySet = await cedarling.partialEval(mandate,
> newState);
>
> // Re-render Windley context with new state
>
> const updatedWindleyBlock = renderWindleyContext(newResidualPolicySet,
> {
>
> \...baseContext,
>
> BOOKING_OBJECT_STATE: newState,
>
> });
>
> // Inject updated Block 2 into next inference call
>
> systemPrompt = composeSystemPrompt(personaBlock, updatedWindleyBlock);
>
> }

### 9.3 Tier Awareness

Templates reference {{DEPLOYMENT_TIER}} to enable tier-aware agent
behaviour. At Tier 1 (no NeMo Guardrails sidecar), the Windley Loop is
the sole pre-execution scope guard. The Guest Agent template's Rail 2
note ('NeMo Rail 2 applies at Tier 2/3') is resolved by the runtime
--- at Tier 1, the runtime should include an explicit note in Block 3
that the agent must apply tone discipline without Rail 2 assistance.

## 10. Version History

  1.0 — April   Initial release. Track 3 Session 5B. Five templates:
  2026            windley-context, guest-agent, operator-agent,
                  supplier-agent, discovery-agent. OQ-AS-3 partial
                  resolution (OCTO product type mapping table). Decisions
                  PL-D1 through PL-D6 closed.

*Activity Travel Protocol — Prompt Library v1.0 — April 2026*

*Activity Travel Protocol Foundation (in formation / 設立準備中) ---
Apache 2.0*
