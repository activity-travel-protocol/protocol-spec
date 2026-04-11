# Starter Category Catalogue

*Activity Configuration Schema Design System · Section 4*

[← Fragment Library](fragment-library) · [UI Generation →](ui-generation)

## 4. Starter Category Catalogue

The Starter Catalogue defines six activity categories. Each entry is the
Foundation's reference implementation of the three-schema model for
that category. SDK consumers may use these schemas directly or extend
them via the Category Proposal process.

Categories are identified by a SCREAMING_SNAKE_CASE string registered in
the Activity Category Registry (Section 5). All category identifiers in
the Starter Catalogue are prefixed with no namespace — namespaced
identifiers (e.g. atp_community.WINE_TASTING) are used for
community-contributed categories not yet ratified by the Foundation.

**Category 1 — ACCOMMODATION_ROOM**

Covers all room-based accommodation: hotel rooms, inn rooms, villa
rooms, glamping units. This is the accommodation surface of the
MyAuberge reference implementation.

**Capability schema**

  -------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  SeasonalAvailability    \$uses                  Operating season and
                                                  check-in/check-out
                                                  windows.

  CapacityModel           \$uses                  Min/max occupancy.
                                                  exclusive_use_available
                                                  true for full-property
                                                  booking.

  AgeEligibility          \$uses                  Minimum age if any.
                                                  MyAuberge: no minimum.

  WeatherDependency       \$uses                  weather_dependent false
                                                  for indoor accommodation.

  MeetingPoint            \$uses                  Check-in location and
                                                  instructions.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------------------------------
  **Field**                      **Type**          **Required**      **Notes**
  room_type                      string            REQUIRED          TWIN \| DOUBLE \| SINGLE \|
                                                                     SUITE \| DORMITORY \| VILLA \|
                                                                     GLAMPING_UNIT.

  bed_configuration              string            OPTIONAL          Description of bed
                                                                     arrangement. E.g. 'Two single
                                                                     beds, convertible to king'.

  max_occupancy                  integer           REQUIRED          Maximum guests per room.

  en_suite_bathroom              boolean           REQUIRED          True if the room has a private
                                                                     bathroom.

  accessible                     boolean           REQUIRED          True if the room meets
                                                                     accessibility standards.

  exclusive_property_available   boolean           REQUIRED          True if the entire property
                                                                     can be booked exclusively
                                                                     regardless of partial room
                                                                     occupancy.

  exclusive_property_min_rooms   integer           CONDITIONAL       when:
                                                                     exclusive_property_available
                                                                     == true. Minimum rooms that
                                                                     must be booked for exclusive
                                                                     property rate.
  -------------------------------------------------------------------------------------------------

> *※ MyAuberge: room_type TWIN, max_occupancy 2,
> exclusive_property_available true, exclusive_property_min_rooms 1 (any
> booking size may request exclusive use). 5 rooms total.*

**Configuration schema**

  -------------------------------------------------------------------------------
  **Field**                 **Type**          **Required**      **Notes**
  check_in_date             ISO8601Date       REQUIRED          Guest check-in
                                                                date.

  check_out_date            ISO8601Date       REQUIRED          Guest check-out
                                                                date. Stored
                                                                explicitly ---
                                                                not derived from
                                                                nights count.

  room_count                integer           REQUIRED          Number of rooms
                                                                reserved.

  exclusive_use_requested   boolean           REQUIRED          True if guest has
                                                                requested
                                                                exclusive use of
                                                                the full
                                                                property.

  board_basis               string            REQUIRED          ROOM_ONLY \|
                                                                BED_BREAKFAST \|
                                                                HALF_BOARD \|
                                                                FULL_BOARD \|
                                                                ALL_INCLUSIVE.
  -------------------------------------------------------------------------------

**Collection schema (per participant)**

  -----------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  DietaryRequirement      \$uses per participant  Collected for all
                                                  participants when
                                                  board_basis includes
                                                  meals.

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------
  **Field**                    **Type**          **Required**      **Notes**
  pillow_preference            string            OPTIONAL          SOFT \| MEDIUM \|
                                                                   FIRM.

  accessibility_requirements   string            OPTIONAL          Free text
                                                                   accessibility
                                                                   needs.

  estimated_arrival_time       string            OPTIONAL          HH:MM estimated
                                                                   arrival. Used for
                                                                   check-in
                                                                   coordination.

  late_arrival                 boolean           OPTIONAL          True if arrival
                                                                   is expected after
                                                                   21:00.
  ----------------------------------------------------------------------------------

**Category 2 — FARM_EXPERIENCE**

Covers farm-based experiential activities: planting and harvesting
tutorials, produce picking, garden tours, farm volunteer work. The
reference implementation is Ponyhouse Farm, Chino, Nagano (Seller:
MyAuberge K.K., regulatory_class: HOTEL_OWN).

**Capability schema**

  -----------------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  SeasonalAvailability    \$uses                  season_start \--07-01, season_end
                                                  \--10-31, operates_daily true,
                                                  same_day_booking true.

  CapacityModel           \$uses                  min_participants 1,
                                                  max_participants 20,
                                                  inventory_feed_supported false
                                                  (Ponyhouse manually managed).

  AgeEligibility          \$uses                  minimum_age_years 4,
                                                  unaccompanied_child_permitted
                                                  false, minor_declaration_required
                                                  false.

  GroupSizeConstraint     \$uses                  guide_to_participant_ratio 1:10,
                                                  requires_dedicated_children_guide
                                                  false.

  GuideAllocation         \$uses                  guide_type \[INTERNAL_STAFF\],
                                                  languages_available \[ja, en\],
                                                  guide_booking_model INCLUDED.

  MeetingPoint            \$uses                  Ponyhouse Farm main gate. GPS
                                                  coordinates, Google Maps URI.

  SafetyCompliance        \$uses                  mode SOFT_ADVISORY,
                                                  alternatives_provided true (boots
                                                  and gloves provided on-site).

  WeatherDependency       \$uses                  weather_dependent true (heavy rain
                                                  cancels outdoor activities),
                                                  fallback_option 'indoor drying and
                                                  sorting session'.

  DietaryRequirement      \$uses                  Collected when activity includes
                                                  farm-to-table tasting component.
  -----------------------------------------------------------------------------------

  ---------------------------------------------------------------------------------
  **Field**                 **Type**          **Required**      **Notes**
  farm_activities_offered   string\[\]        REQUIRED          Subset of:
                                                                SEEDING_TUTORIAL \|
                                                                VEGETABLE_PICKING
                                                                \| GARDEN_TOUR \|
                                                                VOLUNTEER_WORK \|
                                                                TASTING.

  produce_type_current      string\[\]        OPTIONAL          Current season
                                                                produce available
                                                                for picking.
                                                                Updated by operator
                                                                monthly.

  on_site_shop              boolean           REQUIRED          True if a shop
                                                                selling farm
                                                                produce is on-site.
                                                                Shop purchase is
                                                                not included in
                                                                activity price.

  shop_note_en              string            CONDITIONAL       when: on_site_shop
                                                                == true. Note about
                                                                shop for guest
                                                                'A farm shop is
                                                                available on-site
                                                                — purchases are
                                                                at guest expense.'

  physical_difficulty       string            REQUIRED          LOW \| MODERATE \|
                                                                HIGH. Ponyhouse:
                                                                LOW.
  ---------------------------------------------------------------------------------

**Configuration schema**

  -----------------------------------------------------------------------------------
  **Field**             **Type**          **Required**      **Notes**
  selected_activities   string\[\]        REQUIRED          Activities selected from
                                                            farm_activities_offered
                                                            for this package.

  session_date          ISO8601Date       REQUIRED          Date of the farm
                                                            experience session.

  session_start_time    string            REQUIRED          HH:MM session start.

  includes_tasting      boolean           REQUIRED          True if a farm produce
                                                            tasting is included.
                                                            Triggers
                                                            DietaryRequirement
                                                            collection.
  -----------------------------------------------------------------------------------

**Collection schema (per participant)**

  --------------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  DietaryRequirement      \$uses per participant  when:
                                                  Configuration.includes_tasting
                                                  == true.

  --------------------------------------------------------------------------------

  ---------------------------------------------------------------------------------------------------
  **Field**                  **Type**          **Required**      **Notes**
  clothing_acknowledgement   boolean           CONDITIONAL       SafetyCompliance mode SOFT_ADVISORY
                                                                 no checkbox required. Field is

  accessibility_needs        string            OPTIONAL          Any mobility or accessibility
                                                                 requirements for the farm terrain.

  volunteer_consent          boolean           CONDITIONAL       when: VOLUNTEER_WORK in
                                                                 Configuration.selected_activities.
                                                                 Guest confirms they understand
                                                                 volunteer work is physical and
                                                                 unpaid.
  ---------------------------------------------------------------------------------------------------

**Category 3 — SKI_ALPINE**

Covers alpine (downhill) skiing activities including equipment rental,
lift access, and instruction. The reference implementation is 8 Peaks
Resort, Nagano. This is the complex case — it exposes the full range
of fragment capabilities including SubSupplierDependency with
ResolutionChain, InventoryFeed with MANUAL mode, PricingRule with
Collection field conditions, and WeatherDependency with seasonal
cancellation.

Regulatory class: LICENSED_TA_REQUIRED when sold as a package including
transport to/from resort. HOTEL_OWN when resort is selling directly to
guests already on-site.

**Capability schema**

  -----------------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  SeasonalAvailability    \$uses                  season_start \--12-01, season_end
                                                  \--03-31 (indicative — actual end
                                                  depends on snow conditions).
                                                  weather_dependent true.

  CapacityModel           \$uses                  inventory_feed_supported false (8
                                                  Peaks — MANUAL). Premium tour
                                                  van: separate CapacityModel
                                                  sub-instance, max_participants 8.

  AgeEligibility          \$uses                  minimum_age_years 4, child_max_age
                                                  12, minor_declaration_required
                                                  true.

  GroupSizeConstraint     \$uses                  guide_to_participant_ratio 1:8,
                                                  mixed_skill_groups_permitted false,
                                                  requires_dedicated_children_guide
                                                  true.

  MeasurementRecord       \$uses per participant  Fields: height_cm REQUIRED,
                                                  weight_kg REQUIRED, shoe_size_eu
                                                  REQUIRED, head_circumference_cm
                                                  OPTIONAL.

  EquipmentAssignment     \$uses per participant  GearCategory: SKI_ALPINE,
                                                  SKI_BOOTS, SKI_HELMET, SKI_POLES,
                                                  SKI_JACKET, SKI_TROUSERS.

  SkillLevel              \$uses per participant  skill_domain SKIING.
                                                  instructor_requested CONDITIONAL on
                                                  NEVER/BEGINNER.

  SafetyCompliance        \$uses                  Helmet: mode HARD_ACKNOWLEDGEMENT,
                                                  alternatives_provided true. Proper
                                                  ski jacket and trousers: mode
                                                  HARD_ACKNOWLEDGEMENT,
                                                  alternatives_provided true.

  MeetingPoint            \$uses                  8 Peaks base lodge. GPS,
                                                  what3words, earliest_arrival PT30M.

  GuideAllocation         \$uses                  guide_booking_model SUB_SUPPLIER
                                                  — triggers SubSupplierDependency
                                                  for ski school.

  WeatherDependency       \$uses                  cancellation_conditions 'Snow
                                                  depth at summit below 30cm or lift
                                                  company suspension',
                                                  decision_lead_time PT12H,
                                                  hem_event_code HEM-07,
                                                  fallback_option 'Full refund or
                                                  reschedule to next available date
                                                  within season'.

  InventoryFeed           \$uses                  feed_type MANUAL, supports_hold
                                                  false. SDK flags
                                                  AVAILABILITY_UNVERIFIED.

  SubSupplierDependency   \$uses                  Ski school instruction — see
                                                  ResolutionChain below.

  PricingRule             \$uses                  Adult-size gear surcharge for tall
                                                  children. Instructor fee for
                                                  NEVER/BEGINNER.
  -----------------------------------------------------------------------------------

**SubSupplierDependency — Ski School Instruction ResolutionChain**

  -------------------------------------------------------------------------------------
  **Option**   **Service    **Condition**   **Lead      **Guest     **Auto-escalate**
               Level**                      Time**      Consent**   
  1            PRIMARY      Pre-booking     P3D         Not         No — requires
                            request with                required    operator
                            minimum P3D                             confirmation
                            lead time. Ski                          
                            school confirms                         
                            priority slot.                          

  2            EQUIVALENT   Same-day or     PT4H        Not         Yes — automatic
                            short-notice                required    after P3D window
                            call to ski                             passes
                            school.                                 
                            Standard                                
                            availability,                           
                            not guaranteed.                         

  3            FALLBACK     Resort novice   None        REQUIRED    Yes — automatic
                            slope staff at              — guest   if ski school
                            beginner area.              must        unavailable
                            Always                      consent to  
                            available.                  downgrade   
                            Lower                                   
                            instruction                             
                            quality.                                
  -------------------------------------------------------------------------------------

**PricingRule — Ski Alpine (examples)**

  ------------------------------------------------------------------------------------------------
  **Rule**       **Condition**                       **Effect**     **Amount**     **Per
                                                                                   participant**
  Adult gear     collection.participant.age_band ==  SURCHARGE      ¥2,000         Yes
  surcharge      CHILD AND                                                         
                 collection.participant.height_cm                                  
                 \>= 150                                                           

  Instructor fee skill_level.self_assessed_level IN  FEE_ADD        ¥8,000         Yes
                 \[NEVER, BEGINNER\] AND                                           
                 skill_level.instructor_requested ==                               
                 true                                                              

  Helmet         collection.participant.own_helmet   DISCOUNT       ¥500           Yes
  discount —   == true                                                           
  own helmet                                                                       
  ------------------------------------------------------------------------------------------------

**Configuration schema**

  -----------------------------------------------------------------------------------------
  **Field**                   **Type**          **Required**      **Notes**
  ski_day_date                ISO8601Date       REQUIRED          Date of ski activity.

  lift_pass_tier              string            REQUIRED          HALF_DAY_AM \|
                                                                  HALF_DAY_PM \| FULL_DAY
                                                                  \| MULTI_DAY. Determines
                                                                  lift access duration.

  equipment_rental_included   boolean           REQUIRED          True if ski equipment
                                                                  rental is included in
                                                                  package price.

  premium_tour_van            boolean           REQUIRED          True if the premium
                                                                  transport van is
                                                                  requested. Triggers
                                                                  AVAILABILITY_UNVERIFIED
                                                                  flag until operator
                                                                  manually confirms.

  instruction_pre_booked      boolean           REQUIRED          True if ski instruction
                                                                  has been pre-requested.
                                                                  Triggers Option 1
                                                                  ResolutionChain attempt.
  -----------------------------------------------------------------------------------------

**Collection schema (per participant)**

  ------------------------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  MeasurementRecord       \$uses                  height_cm REQUIRED, weight_kg REQUIRED,
                                                  shoe_size_eu REQUIRED.

  SkillLevel              \$uses                  skill_domain SKIING, self_assessed_level
                                                  REQUIRED, last_practised REQUIRED.

  EquipmentAssignment     \$uses                  Gear list per participant based on
                                                  Configuration.equipment_rental_included.

  SafetyCompliance        \$uses                  Helmet and clothing HARD_ACKNOWLEDGEMENT
                                                  per participant.
  ------------------------------------------------------------------------------------------

  -------------------------------------------------------------------------------
  **Field**                 **Type**          **Required**      **Notes**
  own_helmet                boolean           REQUIRED          True if
                                                                participant is
                                                                bringing their
                                                                own helmet.
                                                                Triggers DISCOUNT
                                                                pricing rule.

  emergency_contact_name    string            REQUIRED          Name of emergency
                                                                contact person.

  emergency_contact_phone   PhoneNumber       REQUIRED          Emergency contact
                                                                phone number
                                                                including country
                                                                code.

  medical_conditions        string            OPTIONAL          Any medical
                                                                conditions
                                                                relevant to
                                                                physical outdoor
                                                                activity.
  -------------------------------------------------------------------------------

**Category 4 — CULTURAL_EXPERIENCE**

Covers structured cultural participation: taiko drumming, tea ceremony,
ikebana, zazen, traditional craft workshops, shrine and temple tours.
Generally performed by a licensed cultural practitioner.

**Capability schema**

  ----------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  SeasonalAvailability    \$uses                  Most cultural experiences
                                                  are year-round.
                                                  Session-based with fixed
                                                  start times.

  CapacityModel           \$uses                  min_participants typically
                                                  1--2, max_participants
                                                  typically 8--15.

  AgeEligibility          \$uses                  minimum_age_years varies by
                                                  activity. Tea ceremony: 6.
                                                  Taiko: 4.

  GroupSizeConstraint     \$uses                  guide_to_participant_ratio
                                                  1:8 typical.

  GuideAllocation         \$uses                  guide_type \[LICENSED_GUIDE,
                                                  INTERNAL_STAFF\].

  SafetyCompliance        \$uses                  Typically SOFT_ADVISORY
                                                  (footwear, appropriate
                                                  dress). Some physical
                                                  activities (taiko) may
                                                  require HARD_ACKNOWLEDGEMENT
                                                  for wrist/back conditions.

  MeetingPoint            \$uses                  Venue address and arrival
                                                  instructions.
  ----------------------------------------------------------------------------

  ---------------------------------------------------------------------------------
  **Field**                **Type**          **Required**      **Notes**
  cultural_category        string            REQUIRED          MUSIC \|
                                                               TEA_CEREMONY \|
                                                               FLOWER_ARRANGEMENT
                                                               \| MEDITATION \|
                                                               CRAFT \| TEMPLE_TOUR
                                                               \| MARTIAL_ARTS \|
                                                               PERFORMANCE.

  dress_code               string            OPTIONAL          Dress requirements.
                                                               E.g. 'Remove shoes
                                                               inside. Socks
                                                               required.'

  photography_permitted    boolean           REQUIRED          True if photography
                                                               is permitted during
                                                               the experience.

  noise_ordinance_window   string            OPTIONAL          HH:MM--HH:MM window
                                                               during which the
                                                               activity is
                                                               restricted due to
                                                               noise. Relevant for
                                                               taiko and percussion
                                                               experiences.
  ---------------------------------------------------------------------------------

**Category 5 — CULINARY_CLASS**

Covers cooking instruction and food preparation experiences: soba
making, ramen making, sushi making, mochi making, farm-to-table cooking.
Distinct from restaurant dining — participant actively prepares food.

**Capability schema**

  -----------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  SeasonalAvailability    \$uses                  Typically year-round.
                                                  Session-based.

  CapacityModel           \$uses                  max_participants
                                                  constrained by
                                                  workstation count.

  AgeEligibility          \$uses                  minimum_age_years
                                                  typically 6. Knife use
                                                  activities: 10.

  DietaryRequirement      \$uses                  REQUIRED — allergen
                                                  management is a safety
                                                  obligation.

  SafetyCompliance        \$uses                  Hygiene:
                                                  HARD_ACKNOWLEDGEMENT.
                                                  Knife safety:
                                                  HARD_ACKNOWLEDGEMENT
                                                  for activities
                                                  involving cutting.

  MeetingPoint            \$uses                  Kitchen or studio
                                                  address.
  -----------------------------------------------------------------------

  ---------------------------------------------------------------------------------------
  **Field**                      **Type**          **Required**      **Notes**
  cuisine_type                   string            REQUIRED          E.g. SOBA \| SUSHI
                                                                     \| RAMEN \| MOCHI \|
                                                                     FARM_TO_TABLE \|
                                                                     REGIONAL_JAPANESE.

  workstation_count              integer           REQUIRED          Number of individual
                                                                     workstations.
                                                                     Determines
                                                                     max_participants.

  participants_per_workstation   integer           REQUIRED          Participants sharing
                                                                     one workstation.
                                                                     E.g. 2 for paired
                                                                     soba making.

  includes_eating                boolean           REQUIRED          True if participants
                                                                     eat what they
                                                                     prepare. Triggers
                                                                     allergen collection.

  take_home_product              boolean           OPTIONAL          True if participants
                                                                     take their creation
                                                                     home.

  knife_use                      boolean           REQUIRED          True if the class
                                                                     involves knife use.
                                                                     Affects minimum age
                                                                     and SafetyCompliance
                                                                     mode.
  ---------------------------------------------------------------------------------------

**Category 6 — ENTRANCE_TICKET**

Covers admission to venues: museums, shrines, castles, hot springs,
theme parks, observation decks. Minimal pre-arrangement data required.
High-volume, low-complexity. Suitable for OTA distribution.

**Capability schema**

  --------------------------------------------------------------------------
  **Fragment**            **Mode**                **Purpose**
  SeasonalAvailability    \$uses                  Operating hours and days.
                                                  Most venues year-round.

  CapacityModel           \$uses                  inventory_feed_supported
                                                  often true via ticketing
                                                  API (Tiqets, KLOOK).

  AgeEligibility          \$uses                  Free entry ages, child
                                                  pricing thresholds.

  MeetingPoint            \$uses                  Venue entrance location.
  --------------------------------------------------------------------------

  ------------------------------------------------------------------------------
  **Field**              **Type**          **Required**      **Notes**
  venue_type             string            REQUIRED          MUSEUM \| SHRINE \|
                                                             TEMPLE \|
                                                             HOT_SPRING \|
                                                             CASTLE \|
                                                             THEME_PARK \|
                                                             OBSERVATION \|
                                                             GARDEN \|
                                                             SPORTS_VENUE.

  ticket_type            string            REQUIRED          GENERAL_ADMISSION
                                                             \| TIMED_ENTRY \|
                                                             SKIP_THE_LINE \|
                                                             VIP.

  mobile_ticket          boolean           REQUIRED          True if QR code
                                                             ticket is delivered
                                                             digitally. False if
                                                             physical ticket
                                                             must be collected.

  collection_point       string            CONDITIONAL       when: mobile_ticket
                                                             == false. Where to
                                                             collect physical
                                                             ticket.

  free_entry_max_age     integer           OPTIONAL          Maximum age for
                                                             free entry
                                                             (inclusive).

  child_ticket_max_age   integer           OPTIONAL          Maximum age for
                                                             child ticket
                                                             pricing
                                                             (inclusive).
  ------------------------------------------------------------------------------
