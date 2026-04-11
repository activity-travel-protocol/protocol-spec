# Fragment Library v1

*Activity Configuration Schema Design System · Section 3*

[← Overview](index) · [Starter Catalogue →](starter-catalogue)

## 3. Fragment Library v1

The Fragment Library contains 15 reusable sub-schemas. Each fragment is
versioned independently. Fragments are referenced by category schemas
using the \$uses syntax. A fragment may itself reference other fragments
(composition is transitive). Circular references are not permitted.

The following fragments constitute Fragment Library v1. Each entry
specifies: the fragment identifier, the schema layer(s) at which it
applies, the fields it defines, and the activity categories in the
Starter Catalogue that reference it.

**Fragment 1 — SeasonalAvailability**

Declares the operating season and daily schedule for an activity.
Referenced by all activities that are not available year-round or not
available at all hours.

Applies at: Capability layer.

  --------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  season_start               ISO8601Date       REQUIRED          First date of
                                                                 operating season
                                                                 (year-agnostic
                                                                 MM-DD). E.g.
                                                                 \--07-01 for July
                                                                 1.

  season_end                 ISO8601Date       REQUIRED          Last date of
                                                                 operating season
                                                                 (year-agnostic
                                                                 MM-DD). E.g.
                                                                 \--10-31 for
                                                                 October 31.

  operates_daily             boolean           REQUIRED          True if the
                                                                 activity runs
                                                                 every day within
                                                                 the season.

  operating_days             string\[\]        CONDITIONAL       when:
                                                                 operates_daily ==
                                                                 false. Days of
                                                                 week: MON TUE WED
                                                                 THU FRI SAT SUN.

  session_start_times        string\[\]        OPTIONAL          Array of HH:MM
                                                                 session start
                                                                 times. Empty if
                                                                 continuous (not
                                                                 session-based).

  session_duration           ISO8601Duration   OPTIONAL          Duration of one
                                                                 session. E.g.
                                                                 PT2H for 2 hours.

  advance_booking_required   ISO8601Duration   OPTIONAL          Minimum lead time
                                                                 required before
                                                                 session start.
                                                                 E.g. P1D for 24
                                                                 hours.

  same_day_booking           boolean           REQUIRED          True if same-day
                                                                 booking is
                                                                 accepted.
  --------------------------------------------------------------------------------

> *※ Ponyhouse: season_start \--07-01, season_end \--10-31,
> operates_daily true, same_day_booking true.*

**Fragment 2 — CapacityModel**

Declares the participant capacity constraints for an activity.
Referenced by all activity categories.

Applies at: Capability layer.

  -----------------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  min_participants           integer           REQUIRED          Minimum number of
                                                                 participants required for
                                                                 the activity to run.

  max_participants           integer           REQUIRED          Maximum number of
                                                                 participants the activity
                                                                 can accommodate in a
                                                                 single session.

  max_solo_bookings          integer           OPTIONAL          Maximum number of
                                                                 simultaneous solo
                                                                 bookings. Used where
                                                                 mixed-group activities
                                                                 require management.

  exclusive_use_available    boolean           REQUIRED          True if the entire
                                                                 activity (guide, venue,
                                                                 equipment) can be reserved
                                                                 exclusively.

  exclusive_use_min_spend    integer           OPTIONAL          Minimum spend in smallest
                                                                 currency unit to qualify
                                                                 for exclusive use.

  inventory_feed_supported   boolean           REQUIRED          True if the supplier
                                                                 exposes a real-time
                                                                 IInventoryFeed interface.
                                                                 False if availability is
                                                                 manually managed.

  inventory_feed_uri         URI               CONDITIONAL       when:
                                                                 inventory_feed_supported
                                                                 == true. Endpoint for the
                                                                 IInventoryFeed adapter.
  -----------------------------------------------------------------------------------------

> *※ 8 Peaks: inventory_feed_supported false for van and ski school.
> This is the gap that caused the premium tour availability problem.*

**Fragment 3 — AgeEligibility**

Declares the age restrictions and age-band definitions for an activity.
Overrides the default ATP age bands (INFANT 0--3, CHILD 4--12, ADULT
13+) when the activity has domain-specific age requirements.

Applies at: Capability layer.

  -------------------------------------------------------------------------------------
  **Field**                       **Type**          **Required**      **Notes**
  minimum_age_years               integer           OPTIONAL          Minimum age in
                                                                      years. If absent,
                                                                      no minimum
                                                                      applies.

  maximum_age_years               integer           OPTIONAL          Maximum age in
                                                                      years. If absent,
                                                                      no maximum
                                                                      applies.

  infant_max_age                  integer           OPTIONAL          Override ATP
                                                                      default (3). Age
                                                                      below which a
                                                                      participant is
                                                                      classified
                                                                      INFANT.

  child_max_age                   integer           OPTIONAL          Override ATP
                                                                      default (12). Age
                                                                      below which a
                                                                      participant is
                                                                      classified CHILD.

  unaccompanied_child_permitted   boolean           REQUIRED          True if children
                                                                      may participate
                                                                      without an adult
                                                                      in the same
                                                                      booking.

  minor_declaration_required      boolean           REQUIRED          True if a formal
                                                                      minor declaration
                                                                      must be on file
                                                                      for CHILD and
                                                                      INFANT
                                                                      participants.
  -------------------------------------------------------------------------------------

**Fragment 4 — GroupSizeConstraint**

Declares guide-to-participant ratios and group composition rules.
Referenced by activities where safety or quality requires controlled
group sizes.

Applies at: Capability layer.

  -----------------------------------------------------------------------------------------
  **Field**                           **Type**          **Required**      **Notes**
  guide_to_participant_ratio          string            OPTIONAL          Ratio expressed
                                                                          as 1:N. E.g.
                                                                          '1:8' means one
                                                                          guide per eight
                                                                          participants.

  max_group_size_per_guide            integer           OPTIONAL          Maximum
                                                                          participants per
                                                                          guide. Derived
                                                                          from ratio but
                                                                          stored explicitly
                                                                          for validation.

  mixed_skill_groups_permitted        boolean           REQUIRED          True if
                                                                          participants of
                                                                          different skill
                                                                          levels may be in
                                                                          the same group.

  requires_dedicated_children_guide   boolean           REQUIRED          True if CHILD
                                                                          participants
                                                                          require a guide
                                                                          separate from the
                                                                          adult group.

  group_composition_notes             string            OPTIONAL          Free text for
                                                                          group composition
                                                                          rules not
                                                                          expressible in
                                                                          structured
                                                                          fields. Included
                                                                          in AI agent
                                                                          context.
  -----------------------------------------------------------------------------------------

> *※ 8 Peaks ski school: requires_dedicated_children_guide true. Novice
> adult fallback uses resort staff at child slopes — a ResolutionChain
> option.*

**Fragment 5 — MeasurementRecord**

Defines the physical measurement fields required for equipment sizing.
Referenced by any activity that assigns physical equipment to
participants.

Applies at: Collection layer (per participant).

  -----------------------------------------------------------------------------
  **Field**               **Type**          **Required**      **Notes**
  height_cm               integer           OPTIONAL          Participant
                                                              height in
                                                              centimetres.

  weight_kg               number            OPTIONAL          Participant
                                                              weight in
                                                              kilograms.

  shoe_size_eu            integer           OPTIONAL          European shoe
                                                              size. Used for
                                                              boot assignment.

  shoe_size_us            number            OPTIONAL          US shoe size.
                                                              Converted to EU
                                                              for assignment if
                                                              shoe_size_eu
                                                              absent.

  head_circumference_cm   integer           OPTIONAL          Head
                                                              circumference in
                                                              centimetres. Used
                                                              for helmet
                                                              sizing.

  chest_cm                integer           OPTIONAL          Chest
                                                              circumference.
                                                              Used for wetsuit
                                                              and jacket
                                                              sizing.

  inseam_cm               integer           OPTIONAL          Inseam length.
                                                              Used for ski
                                                              trouser and
                                                              cycling short
                                                              sizing.

  hand_size               string            OPTIONAL          XS \| S \| M \| L
                                                              \| XL. Used for
                                                              glove sizing.
  -----------------------------------------------------------------------------

> *※ The EquipmentAssignment fragment (Fragment 6) declares which
> MeasurementRecord fields are REQUIRED for each gear type. Not all
> fields are needed for all equipment.*

**Fragment 6 — EquipmentAssignment**

Defines the equipment assignment record for a single participant in an
activity that provides physical equipment. References MeasurementRecord
for sizing inputs.

Applies at: Collection layer (per participant) and Configuration layer
(equipment category selection).

  ------------------------------------------------------------------------------
  **Field**                **Type**          **Required**      **Notes**
  gear_category            GearCategory      REQUIRED          Enumerated gear
                                                               type. See
                                                               GearCategory
                                                               registry values.

  gear_size_ref            string            OPTIONAL          Assigned size
                                                               reference
                                                               (populated by
                                                               supplier after
                                                               measurement
                                                               review).

  assigned_item_ref        string            OPTIONAL          Physical
                                                               inventory item
                                                               identifier
                                                               (populated by
                                                               supplier at
                                                               collection).

  collection_time          ISO8601DateTime   OPTIONAL          Scheduled
                                                               equipment
                                                               collection time.

  return_time              ISO8601DateTime   OPTIONAL          Scheduled
                                                               equipment return
                                                               time.

  collected_confirmed_at   ISO8601DateTime   OPTIONAL          Timestamp when
                                                               supplier
                                                               confirmed
                                                               equipment
                                                               collected.
                                                               Triggers
                                                               IEventLog entry.

  returned_confirmed_at    ISO8601DateTime   OPTIONAL          Timestamp when
                                                               supplier
                                                               confirmed
                                                               equipment
                                                               returned.

  damage_noted             boolean           OPTIONAL          True if damage
                                                               was noted at
                                                               return. Triggers
                                                               HEM invocation.
  ------------------------------------------------------------------------------

GearCategory registry values (v1): SKI_ALPINE \| SKI_SNOWBOARD \|
SKI_BOOTS \| SKI_HELMET \| SKI_POLES \| SKI_JACKET \| SKI_TROUSERS \|
SNOWBOARD_BOOTS \| SNOWBOARD_HELMET \| WETSUIT \| KAYAK_PADDLE \|
CYCLING_HELMET \| CYCLING_SHOES \| CLIMBING_HARNESS \|
HORSE_RIDING_HELMET \| FARM_BOOTS \| FARM_GLOVES

**Fragment 7 — SkillLevel**

Declares skill level assessment for activities where participant skill
determines grouping, equipment selection, or pricing. Can reference
Collection fields in PricingRule conditions.

Applies at: Collection layer (per participant).

  -----------------------------------------------------------------------------------
  **Field**                 **Type**          **Required**      **Notes**
  skill_domain              string            REQUIRED          The domain being
                                                                assessed. E.g.
                                                                SKIING, CYCLING,
                                                                KAYAKING,
                                                                HORSE_RIDING.

  self_assessed_level       SkillEnum         REQUIRED          NEVER \| BEGINNER \|
                                                                INTERMEDIATE \|
                                                                ADVANCED \| EXPERT.
                                                                Self-declared by
                                                                participant.

  last_practised            string            OPTIONAL          NEVER \| THIS_SEASON
                                                                \| WITHIN_1_YEAR \|
                                                                OVER_1_YEAR_AGO.

  instructor_requested      boolean           CONDITIONAL       when:
                                                                self_assessed_level
                                                                IN \[NEVER,
                                                                BEGINNER\]. True if
                                                                participant requests
                                                                instruction.

  supplier_assessed_level   SkillEnum         OPTIONAL          Supplier-assigned
                                                                level after on-site
                                                                assessment. Overrides
                                                                self_assessed_level
                                                                for grouping.
  -----------------------------------------------------------------------------------

> *※ Pricing rule: if self_assessed_level IN \[NEVER, BEGINNER\] AND
> instructor_requested == true, add INSTRUCTOR_FEE to pricing. This is
> the 8 Peaks ski school 8% kickback case.*

**Fragment 8 — SafetyCompliance**

Declares safety equipment and clothing requirements with enforcement
mode. The three modes (SOFT_ADVISORY, HARD_ACKNOWLEDGEMENT,
SUPPLIER_VERIFIED) were derived from the Tokyo Travel Forum case studies
and Ponyhouse operational practice.

Applies at: Capability layer (requirement declaration) and Collection
layer (acknowledgement capture).

  ----------------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  requirement_id             string            REQUIRED          Unique identifier for
                                                                 this safety requirement
                                                                 within the activity.

  description_en             string            REQUIRED          Plain English description
                                                                 of the requirement.
                                                                 Included in confirmation
                                                                 email and pre-arrangement
                                                                 form.

  description_ja             string            OPTIONAL          Japanese description.

  mode                       SafetyMode        REQUIRED          SOFT_ADVISORY \|
                                                                 HARD_ACKNOWLEDGEMENT \|
                                                                 SUPPLIER_VERIFIED.

  alternatives_provided      boolean           REQUIRED          True if the supplier
                                                                 provides compliant
                                                                 alternatives on-site
                                                                 (e.g. Ponyhouse provides
                                                                 boots and gloves).

  alternative_description    string            CONDITIONAL       when:
                                                                 alternatives_provided ==
                                                                 true. Description of what
                                                                 is provided.

  acknowledgement_text_en    string            CONDITIONAL       when: mode IN
                                                                 \[HARD_ACKNOWLEDGEMENT,
                                                                 SUPPLIER_VERIFIED\].
                                                                 Legal text the guest must
                                                                 accept.

  denial_of_service_policy   string            OPTIONAL          What happens if the guest
                                                                 is non-compliant on
                                                                 arrival. Included in
                                                                 confirmation email.

  supplier_check_required    boolean           CONDITIONAL       when: mode ==
                                                                 SUPPLIER_VERIFIED.
                                                                 Supplier staff must
                                                                 record compliance check
                                                                 via MCP Server tool.
  ----------------------------------------------------------------------------------------

SafetyMode definitions:

SOFT_ADVISORY — Recommendation only. No acknowledgement required.
Rendered as informational text in confirmation email and pre-arrangement
screen.

HARD_ACKNOWLEDGEMENT — Guest must provide a timestamped digital
acknowledgement before CONFIRMED state is reached. Acknowledgement is
stored as an IEventLog entry on the Booking Object. Supplier has legal
cover for denial of entry.

SUPPLIER_VERIFIED — Guest acknowledges digitally AND supplier staff
records a compliance check via the atp_record_safety_check MCP Server
tool before the activity starts. Failed check triggers HEM invocation.

**Fragment 9 — DietaryRequirement**

Captures dietary restrictions and allergies for activities that include
food or drink. Applies to farm experiences with tasting, culinary
classes, and accommodation dining.

Applies at: Collection layer (per participant).

  --------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  dietary_restrictions       string\[\]        OPTIONAL          Structured
                                                                 values:
                                                                 VEGETARIAN \|
                                                                 VEGAN \| HALAL \|
                                                                 KOSHER \|
                                                                 GLUTEN_FREE \|
                                                                 DAIRY_FREE \|
                                                                 NUT_FREE \|
                                                                 SHELLFISH_FREE.

  severe_allergies           string\[\]        OPTIONAL          Free text list of
                                                                 severe allergies
                                                                 requiring EpiPen
                                                                 or equivalent.
                                                                 Flagged to
                                                                 supplier at
                                                                 confirmation.

  additional_notes           string            OPTIONAL          Free text for
                                                                 requirements not
                                                                 covered by
                                                                 structured
                                                                 values.

  supplier_can_accommodate   boolean           OPTIONAL          Populated by
                                                                 supplier after
                                                                 reviewing dietary
                                                                 requirements.
                                                                 False triggers
                                                                 operator
                                                                 notification.
  --------------------------------------------------------------------------------

**Fragment 10 — MeetingPoint**

Declares where participants assemble for the activity. Supports GPS
coordinates, what3words, and free-text instructions. Referenced by all
guided and transport-inclusive activities.

Applies at: Capability layer (primary meeting point) and Configuration
layer (package-specific overrides).

  -----------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  name                       string            REQUIRED          Human-readable
                                                                 meeting point name.
                                                                 E.g. 'Chino Station
                                                                 East Exit'.

  address                    string            OPTIONAL          Street address.

  latitude                   number            OPTIONAL          WGS84 latitude.

  longitude                  number            OPTIONAL          WGS84 longitude.

  what3words                 string            OPTIONAL          what3words address.
                                                                 E.g.
                                                                 filled.count.soap.

  google_maps_uri            URI               OPTIONAL          Google Maps link.

  assembly_instructions_en   string            REQUIRED          Plain English
                                                                 instructions for
                                                                 finding and
                                                                 identifying the
                                                                 meeting point.

  assembly_instructions_ja   string            OPTIONAL          Japanese
                                                                 instructions.

  earliest_arrival           ISO8601Duration   OPTIONAL          How early
                                                                 participants should
                                                                 arrive before
                                                                 session start. E.g.
                                                                 PT15M.
  -----------------------------------------------------------------------------------

**Fragment 11 — GuideAllocation**

Declares guide availability and booking model. Referenced by guided
tours, farm experiences, cultural experiences, and ski instruction.

Applies at: Capability layer.

  -----------------------------------------------------------------------------------------------
  **Field**                         **Type**          **Required**      **Notes**
  guide_type                        string\[\]        REQUIRED          Guide categories
                                                                        available: INTERNAL_STAFF
                                                                        \| LICENSED_GUIDE \|
                                                                        INTERPRETER \| INSTRUCTOR
                                                                        \| VOLUNTEER.

  languages_available               LanguageTag\[\]   REQUIRED          Languages in which
                                                                        guiding is available.

  guide_booking_model               string            REQUIRED          INCLUDED \| ON_REQUEST \|
                                                                        SUB_SUPPLIER. INCLUDED:
                                                                        guide is always provided.
                                                                        ON_REQUEST: guest
                                                                        requests a guide at
                                                                        booking. SUB_SUPPLIER:
                                                                        guide comes from a
                                                                        separate entity (see
                                                                        SubSupplierDependency).

  guide_advance_booking_required    ISO8601Duration   CONDITIONAL       when: guide_booking_model
                                                                        == ON_REQUEST. Lead time
                                                                        needed to confirm guide
                                                                        availability.

  max_language_guide_participants   integer           OPTIONAL          Maximum participants per
                                                                        language guide session.
  -----------------------------------------------------------------------------------------------

**Fragment 12 — WeatherDependency**

Declares weather conditions that affect activity operation. Referenced
by outdoor activities where weather is a genuine operational dependency,
not merely a comfort consideration.

Applies at: Capability layer.

  ---------------------------------------------------------------------------------
  **Field**                 **Type**          **Required**      **Notes**
  weather_dependent         boolean           REQUIRED          True if adverse
                                                                weather can cancel
                                                                or modify the
                                                                activity.

  cancellation_conditions   string            CONDITIONAL       when:
                                                                weather_dependent
                                                                == true.
                                                                Description of
                                                                conditions
                                                                triggering
                                                                cancellation (e.g.
                                                                snow depth below
                                                                30cm, temperature
                                                                above 35°C).

  modification_conditions   string            OPTIONAL          Conditions that
                                                                modify but do not
                                                                cancel the activity
                                                                (e.g. shorter
                                                                route, indoor
                                                                alternative used).

  decision_lead_time        ISO8601Duration   CONDITIONAL       when:
                                                                weather_dependent
                                                                == true. How far in
                                                                advance the
                                                                go/no-go decision
                                                                is made. E.g.
                                                                PT12H.

  hem_event_code            string            CONDITIONAL       when:
                                                                weather_dependent
                                                                == true. HEM event
                                                                code to invoke on
                                                                cancellation. E.g.
                                                                HEM-07.

  fallback_option           string            OPTIONAL          Description of the
                                                                fallback experience
                                                                if the primary
                                                                activity is
                                                                cancelled.
  ---------------------------------------------------------------------------------

> *※ 8 Peaks: cancellation_conditions 'Snow depth at summit below 30cm
> or lift company suspension of operations'. hem_event_code HEM-07.
> This is what triggered the early-season end problem.*

**Fragment 13 — SubSupplierDependency**

Declares that this activity depends on confirmation from one or more
external suppliers. This is the most architecturally significant
fragment in Library v1. It formalises the multi-supplier coordination
problem identified at 8 Peaks and ubiquitous in complex travel.

Applies at: Capability layer (dependency declaration) and Configuration
layer (specific sub-supplier selection).

  ------------------------------------------------------------------------------------
  **Field**                **Type**               **Required**      **Notes**
  dependency_id            string                 REQUIRED          Unique identifier
                                                                    for this
                                                                    dependency within
                                                                    the activity.

  dependency_type          string                 REQUIRED          TRANSPORT \|
                                                                    INSTRUCTION \|
                                                                    EQUIPMENT \| VENUE
                                                                    \| GUIDE \|
                                                                    CATERING \| OTHER.

  sub_supplier_name        string                 REQUIRED          Name of the
                                                                    sub-supplier.

  sub_supplier_atp_id      UUID7                  OPTIONAL          ATP seller ID if
                                                                    sub-supplier is
                                                                    registered.
                                                                    Enables automated
                                                                    confirmation flow.

  blocking_mode            string                 REQUIRED          BLOCKING \|
                                                                    ADVISORY.
                                                                    BLOCKING: booking
                                                                    cannot reach
                                                                    CONFIRMED without
                                                                    sub-supplier
                                                                    confirmation.
                                                                    ADVISORY: booking
                                                                    proceeds,
                                                                    sub-supplier is
                                                                    best-effort.

  resolution_chain         FulfilmentOption\[\]   REQUIRED          Ordered list of
                                                                    fulfilment
                                                                    options. System
                                                                    attempts each in
                                                                    sequence until one
                                                                    resolves. See
                                                                    FulfilmentOption
                                                                    below.

  commission_rate_pct      number                 OPTIONAL          Commission
                                                                    percentage paid to
                                                                    primary activity
                                                                    supplier by
                                                                    sub-supplier on
                                                                    referral. E.g. 8
                                                                    for 8%.

  confirmation_lead_time   ISO8601Duration        OPTIONAL          Time needed to
                                                                    confirm
                                                                    sub-supplier
                                                                    availability. E.g.
                                                                    P2D.
  ------------------------------------------------------------------------------------

**FulfilmentOption (sub-schema of SubSupplierDependency)**

  ------------------------------------------------------------------------------
  **Field**                **Type**          **Required**      **Notes**
  option_rank              integer           REQUIRED          1-based rank.
                                                               System attempts
                                                               option 1 first,
                                                               then 2, then 3.

  description              string            REQUIRED          Plain English
                                                               description of
                                                               this fulfilment
                                                               option.

  service_level            string            REQUIRED          PRIMARY \|
                                                               EQUIVALENT \|
                                                               DOWNGRADE \|
                                                               FALLBACK. Informs
                                                               guest
                                                               notification.

  availability_condition   string            OPTIONAL          Condition under
                                                               which this option
                                                               is available.
                                                               E.g. 'Available
                                                               when pre-booked
                                                               minimum P3D in
                                                               advance'.

  requires_guest_consent   boolean           REQUIRED          True if using
                                                               this option
                                                               instead of option
                                                               1 requires guest
                                                               notification and
                                                               consent.

  automatic_escalation     boolean           REQUIRED          True if the
                                                               system may
                                                               attempt this
                                                               option
                                                               automatically
                                                               without operator
                                                               intervention.
  ------------------------------------------------------------------------------

> *※ 8 Peaks ski school ResolutionChain: Option 1 (PRIMARY) ---
> pre-booked ski school instructor, P3D lead time; Option 2 (EQUIVALENT)
> — same-day ski school call, no lead time, requires_guest_consent
> false; Option 3 (FALLBACK) — resort novice slope staff, always
> available, service_level DOWNGRADE, requires_guest_consent true.*

**Fragment 14 — PricingRule**

Declares conditional pricing logic that goes beyond age-band
multipliers. Enables pricing that depends on Collection schema field
values — for example, ski gear pricing that depends on participant
height rather than age band, or instructor fees triggered by skill
level.

Applies at: Capability layer.

  -----------------------------------------------------------------------
  **Field**         **Type**          **Required**      **Notes**
  rule_id           string            REQUIRED          Unique identifier
                                                        for this rule.

  rule_name         string            REQUIRED          Human-readable
                                                        name. E.g.
                                                        'Junior gear ---
                                                        adult size
                                                        surcharge'.

  condition         string            REQUIRED          Expression
                                                        referencing
                                                        Collection or
                                                        Configuration
                                                        fields. Uses ATP
                                                        expression syntax
                                                        (see below).

  price_effect      string            REQUIRED          SURCHARGE \|
                                                        DISCOUNT \|
                                                        OVERRIDE \|
                                                        FEE_ADD.

  amount            integer           CONDITIONAL       when:
                                                        price_effect IN
                                                        \[SURCHARGE,
                                                        DISCOUNT,
                                                        FEE_ADD\]. Amount
                                                        in smallest
                                                        currency unit.

  amount_pct        number            OPTIONAL          Percentage
                                                        adjustment. Used
                                                        instead of amount
                                                        for proportional
                                                        effects.

  per_participant   boolean           REQUIRED          True if the
                                                        effect applies
                                                        per participant
                                                        matching the
                                                        condition.

  display_name_en   string            REQUIRED          Label shown in
                                                        pricing
                                                        breakdown. E.g.
                                                        'Ski instructor
                                                        fee'.

  display_name_ja   string            OPTIONAL          Japanese label.
  -----------------------------------------------------------------------

ATP Condition Expression Syntax (v1): Field references use dot notation.
Comparisons: ==, !=, \>, \<, \>=, \<=. Boolean operators: AND, OR, NOT.
Set membership: IN \[val1, val2\]. Collection field reference prefix:
collection.participant.{field}. Example:

> collection.participant.skill_domain == SKIING
>
> AND collection.participant.self_assessed_level IN \[NEVER, BEGINNER\]
>
> AND collection.participant.instructor_requested == true
>
> *※ This condition expression triggers the INSTRUCTOR_FEE addition on
> the PricingSnapshot for each qualifying participant.*
>
> *※ Height-based gear sizing rule example:
> collection.participant.height_cm \>= 150 AND
> collection.participant.age_band == CHILD → SURCHARGE adult_gear_rate.
> This prevents under-pricing tall children who require adult
> equipment.*

**Fragment 15 — InventoryFeed**

Declares the real-time inventory interface for activities with managed
stock or scheduling systems. When inventory_feed_supported is true in
CapacityModel, this fragment provides the interface specification.

Applies at: Capability layer.

  ------------------------------------------------------------------------
  **Field**          **Type**          **Required**      **Notes**
  feed_type          string            REQUIRED          OCTO_V2 \|
                                                         ATP_NATIVE \|
                                                         ICAL \| MANUAL.
                                                         Determines the
                                                         adapter used by
                                                         the SDK.

  feed_uri           URI               CONDITIONAL       when: feed_type
                                                         IN \[OCTO_V2,
                                                         ATP_NATIVE\].
                                                         Endpoint URI.

  octo_supplier_id   string            CONDITIONAL       when: feed_type
                                                         == OCTO_V2. OCTO
                                                         supplier
                                                         identifier.

  poll_interval      ISO8601Duration   OPTIONAL          How frequently
                                                         the SDK should
                                                         poll for
                                                         availability
                                                         updates. E.g.
                                                         PT5M.

  supports_hold      boolean           REQUIRED          True if the feed
                                                         supports placing
                                                         a hold on
                                                         inventory during
                                                         booking flow.

  hold_duration      ISO8601Duration   CONDITIONAL       when:
                                                         supports_hold ==
                                                         true. Maximum
                                                         hold duration
                                                         before
                                                         auto-release.
                                                         E.g. PT15M.

  stale_threshold    ISO8601Duration   OPTIONAL          How old cached
                                                         availability data
                                                         may be before the
                                                         SDK must refresh.
                                                         E.g. PT1H.
  ------------------------------------------------------------------------

> *※ 8 Peaks: feed_type MANUAL, supports_hold false. This is the root
> cause of the van availability problem. The ATP SDK flags MANUAL feed
> suppliers with a AVAILABILITY_UNVERIFIED warning on the Booking
> Object. The operator must manually confirm availability before the
> booking reaches CONFIRMED.*
