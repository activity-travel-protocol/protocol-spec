# Appendix A — Standards Bridge: OpenTravel Alliance and IATA NDC

Activity Travel Protocol · Layer 2: Discovery and Capability  
v0.1 — March 2026  
Status: Working Draft

---

## A.1 Purpose and Scope

This appendix implements the BRIDGE standards position for the OpenTravel Alliance (OTA) message
families and the IATA New Distribution Capability (NDC) Offer/Order standard. It provides
bidirectional mapping tables between Activity Travel Protocol Layer 2 constructs — primarily the
Capability Declaration and Activity Configuration Schema — and the corresponding fields in each
external standard.

The BRIDGE position, defined in the Activity Travel Protocol Standards Positions and
Interoperability Map v1.1, means the protocol does not adopt these standards natively but defines
a documented translation layer that allows suppliers operating OTA or NDC systems to participate
in the protocol without replacing their existing infrastructure.

**Scope of this appendix:**

- OpenTravel Alliance: three message families — `OTA_TourActivityRQ/RS`,
  `OTA_HotelAvailRQ/RS`, and `OTA_VehicleAvailRateRQ/RS`
- IATA NDC: Offer/Order phase messages — AirShopping, OfferPrice, and OrderCreate (NDC 21.3
  and 24.1 schemas)
- Direction: bidirectional — inbound (OTA/NDC → Activity Travel Protocol) and outbound
  (Activity Travel Protocol → OTA/NDC)

**Out of scope:**

- IATA One Order post-creation messages (OrderChange, OrderCancel, OrderRetrieve) — these map
  to Layer 3 Booking Object state transitions and are deferred to the Layer 4 SDK conformance
  suite (deferred item DL2-4)
- CAAM Trust Chain act-claim mapping — deferred to the CAAM Bridge Specification
  (deferred item DL2-2, pending stabilisation of draft-barney-caam beyond -00)
- IATA ARDP — MONITOR position at Layer 2; re-evaluated at Layer 4
- Full conformance testing of bridge implementations — deferred to Layer 4 SDK conformance
  suite (DL2-4)

**Normative status:** The mapping tables in this appendix are informational guidance for bridge
implementers. They do not override the normative definitions in S3 (Capability Declaration
Schema) or S4 (Activity Configuration Schema). Where a conflict exists between a mapping table
entry and the normative schema, the normative schema prevails.

---

## A.2 BRIDGE Position Summary

| Standard | Version | Position | Rationale | Layer 2 Role |
|---|---|---|---|---|
| OpenTravel Alliance | OTA 2015A and later | BRIDGE | Widely deployed in activity and accommodation sectors; field semantics are compatible but schema structure differs materially from Capability Declarations | Mapping tables in §A.3 |
| IATA NDC (Offer/Order) | NDC 21.3 and NDC 24.1 | BRIDGE | Airline and transport sector standard; Offer/Order model maps to Capability Declaration + Feasibility Check boundary; schema is XML-based vs Activity Travel Protocol JSON | Mapping tables in §A.4 |

A supplier operating an OTA-compliant or NDC-compliant system may participate in the Activity
Travel Protocol by deploying a bridge adapter that performs the field-level translations defined
in this appendix. The adapter is the supplier's implementation responsibility. The protocol does
not ship a reference bridge adapter in v1.0; this is a Layer 4 SDK deliverable.

---

## A.3 OpenTravel Alliance Mapping

### A.3.1 OTA_TourActivityRQ / OTA_TourActivityRS

`OTA_TourActivityRQ/RS` is the primary OpenTravel message family for activity and experience
products. It covers availability queries and response structures for tours, activities, and
packaged experiences — the closest OTA equivalent to the Activity Travel Protocol's core use
case.

The inbound path covers two distinct operations: (a) a booking agent querying the Capability
Catalogue using fields from `OTA_TourActivityRQ` as filter criteria, and (b) a bridge adapter
registering or updating a Capability Declaration from fields in `OTA_TourActivityRS`. These are
separate operations and the field sources differ accordingly.

**Inbound mapping (a) — OTA_TourActivityRQ → Capability Catalogue query parameters**

| OTA Field | OTA Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Activity code | `TourActivity/BasicInfo/@TourActivityID` | `capabilityDeclarationId` (filter) | Used to retrieve a specific declaration by identifier. Bridge adapter resolves OTA string ID to UUID v7. |
| Activity category | `TourActivity/BasicInfo/TypeCode` | `activityCategory` (filter) | OTA TypeCode mapped to Activity Travel Protocol category taxonomy for catalogue filtering. See §A.5.2 for unmapped codes. |
| Operational location | `TourActivity/BasicInfo/Location/Address` | `operationalLocation` (filter) | Address or coordinates used as geographic filter against catalogue. |
| Minimum participants | `TourActivity/ParticipantCount/@MinimumParticipantCount` | `participantConstraints.minimum` (filter) | Integer. Used to filter declarations that support the required group size. |
| Duration | `TourActivity/Schedule/Duration` | `nominalDuration` (filter) | ISO 8601 duration. Used to filter by activity duration. |

**Inbound mapping (b) — OTA_TourActivityRS → Capability Declaration registration**

| OTA Field | OTA Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Activity code | `TourActivity/BasicInfo/@TourActivityID` | `capabilityDeclarationId` | Bridge adapter generates stable UUID v7 from OTA string ID and maintains the mapping. |
| Activity name | `TourActivity/BasicInfo/Name` | `activityName` | Direct string mapping. |
| Activity category | `TourActivity/BasicInfo/TypeCode` | `activityCategory` | OTA TypeCode mapped to Activity Travel Protocol category taxonomy. See §A.5.2 for unmapped codes. |
| Supplier party ID | `TourActivity/Supplier/@SupplierCode` | `supplierId` (Party Registry partyId) | Supplier must be registered in the Party Registry. OTA SupplierCode stored as supplier alias. |
| Operational location | `TourActivity/BasicInfo/Location/Address` | `operationalLocation.addressText` | Structured OTA address mapped to Activity Travel Protocol address object. |
| Geographic coordinates | `TourActivity/BasicInfo/Location/Position/@Latitude` / `@Longitude` | `operationalLocation.coordinates` | Direct mapping. |
| Supported languages | `TourActivity/BasicInfo/Languages/Language/@LanguageCode` | `supportedLanguages[]` | BCP 47 language codes. Direct mapping. |
| Minimum participants | `TourActivity/ParticipantCount/@MinimumParticipantCount` | `participantConstraints.minimum` | Integer. Direct mapping. |
| Maximum participants | `TourActivity/ParticipantCount/@MaximumParticipantCount` | `participantConstraints.maximum` | Integer. Direct mapping. |
| Duration | `TourActivity/Schedule/Duration` | `nominalDuration` | ISO 8601 duration. Direct mapping. |
| Pricing unit | `TourActivity/Pricing/@PricingType` | `pricingModel.unit` | OTA PricingType (PerPerson, PerGroup, etc.) maps to Activity Travel Protocol pricing unit enum. |
| Base price | `TourActivity/Pricing/Summary/@Amount` | `pricingModel.baseAmount` | Decimal. Currency from `@CurrencyCode`. |
| Currency | `TourActivity/Pricing/Summary/@CurrencyCode` | `pricingModel.currency` | ISO 4217. Direct mapping. |
| Cancellation policy | `TourActivity/PolicyInfo/CancelPolicy` | `cancellationPolicy` | OTA structured cancel policy mapped to Activity Travel Protocol cancellation policy object. Refund window and percentage fields map directly. |
| Age restrictions | `TourActivity/ParticipantInfo/Category/@QualifyingLocalType` | `participantConstraints.ageRestrictions[]` | OTA QualifyingLocalType (Adult, Child, etc.) with min/max age maps to Activity Travel Protocol age restriction array. |
| Accessibility | `TourActivity/Accessibility` | `accessibilityFeatures[]` | OTA Accessibility element mapped to Activity Travel Protocol accessibility feature array. |
| Validity start | `TourActivity/Schedule/ValidityPeriod/@Start` | `validityPeriod.start` | ISO 8601 date. RS field — carries the declared validity window for this offering. |
| Validity end | `TourActivity/Schedule/ValidityPeriod/@End` | `validityPeriod.end` | ISO 8601 date. RS field. If absent, bridge adapter applies configured default validity duration. |

**Outbound mapping — Capability Declaration → OTA_TourActivityRS**

| Activity Travel Protocol Field | OTA Field | OTA Path | Notes |
|---|---|---|---|
| `capabilityDeclarationId` | TourActivityID | `TourActivity/BasicInfo/@TourActivityID` | Bridge adapter maintains UUID → OTA ID reverse mapping. |
| `declarationVersion` | No direct OTA equivalent | — | Carried in bridge adapter metadata. Not present in OTA RS. |
| `validityPeriod` | ValidityPeriod | `TourActivity/Schedule/ValidityPeriod` | Start/end dates mapped directly. |
| `activityName` | Name | `TourActivity/BasicInfo/Name` | Direct. |
| `activityDescription` | Description | `TourActivity/BasicInfo/Description` | Direct. |
| `supplierId` | SupplierCode | `TourActivity/Supplier/@SupplierCode` | Bridge adapter maps Party Registry partyId to OTA SupplierCode. |
| `operationalLocation` | Location | `TourActivity/BasicInfo/Location` | Address and coordinates mapped to OTA location structure. |
| `pricingModel` | Pricing | `TourActivity/Pricing` | Unit, amount, and currency mapped. |
| `cancellationPolicy` | CancelPolicy | `TourActivity/PolicyInfo/CancelPolicy` | Refund window and percentage mapped. |
| `liveAvailabilityMode` | No direct OTA equivalent | — | Activity Travel Protocol-native field (added GN-L2-1). Not present in OTA RS. Bridge adapter omits or carries in extension element. |
| `delegationTopologyDeclaration` | No OTA equivalent | — | Activity Travel Protocol-native. Not transmitted in OTA RS. |
| `jurisdictionCoverage[]` | No direct OTA equivalent | — | Bridge adapter may carry in OTA extension element `TourActivity/TPA_Extensions`. |

---

### A.3.2 OTA_HotelAvailRQ / OTA_HotelAvailRS

`OTA_HotelAvailRQ/RS` covers accommodation availability. Within the Activity Travel Protocol,
accommodation is an Activity Component type (e.g. a multi-night stay as part of a guided
trekking package). The mapping below applies when an accommodation supplier registers a
Capability Declaration for a lodging component.

**Inbound mapping — OTA_HotelAvailRQ → Capability Declaration query**

| OTA Field | OTA Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Hotel code | `AvailRequestSegment/HotelSearchCriteria/Criterion/HotelRef/@HotelCode` | `capabilityDeclarationId` (alias) and `supplierId` (primary) | HotelCode is mandatory and unique per property. Bridge adapter maps HotelCode to both the Capability Declaration identifier alias and as the primary supplierId source. |
| Hotel name | `AvailRequestSegment/HotelSearchCriteria/Criterion/HotelRef/@HotelName` | `activityName` | Activity Travel Protocol uses activityName for all component types including accommodation. |
| Chain code | `AvailRequestSegment/HotelSearchCriteria/Criterion/HotelRef/@ChainCode` | `supplierId` (qualifier only) | Optional in OTA. Absent for independent properties. Stored as supplementary qualifier in Party Registry alongside HotelCode-derived supplierId. Must not be used as primary supplierId source. |
| Check-in date | `AvailRequestSegment/@Start` | `operationalWindow.checkIn` | ISO 8601 date. Mapped to accommodation-specific operational window field. |
| Check-out date | `AvailRequestSegment/@End` | `operationalWindow.checkOut` | ISO 8601 date. |
| Room count | `AvailRequestSegment/RoomStayCandidates/RoomStayCandidate/@Quantity` | `participantConstraints.roomCount` | Integer. |
| Adult count | `AvailRequestSegment/RoomStayCandidates/RoomStayCandidate/GuestCounts/GuestCount[@AgeQualifyingCode='10']/@Count` | `participantConstraints.adultCount` | AgeQualifyingCode 10 = Adult per OTA. |
| Child count | `AvailRequestSegment/RoomStayCandidates/RoomStayCandidate/GuestCounts/GuestCount[@AgeQualifyingCode='8']/@Count` | `participantConstraints.childCount` | AgeQualifyingCode 8 = Child per OTA. |
| Rate plan code | `AvailRequestSegment/RoomStayCandidates/RoomStayCandidate/@RatePlanCode` | `pricingModel.ratePlanCode` | Mapped to pricing model qualifier. |
| Meal plan | `OTA_HotelAvailRQ/RoomStayCandidates/RoomStayCandidate/RatePlanCandidates/RatePlanCandidate/@MealPlanCode` | `includedServices[].mealPlan` | OTA MealPlanCode (1=AllInclusive, 3=BreakfastIncluded, etc.) mapped to Activity Travel Protocol service inclusion. |

**Outbound mapping — Capability Declaration → OTA_HotelAvailRS (RoomStay)**

| Activity Travel Protocol Field | OTA Field | OTA Path | Notes |
|---|---|---|---|
| `activityName` | HotelName | `RoomStay/BasicPropertyInfo/@HotelName` | Direct. |
| `supplierId` | HotelCode | `RoomStay/BasicPropertyInfo/@HotelCode` | Bridge maps partyId to HotelCode. |
| `operationalLocation` | Address | `RoomStay/BasicPropertyInfo/Address` | Address fields mapped to OTA address structure. |
| `pricingModel.baseAmount` | AmountBeforeTax | `RoomStay/RoomRates/RoomRate/Rates/Rate/Base/@AmountBeforeTax` | Decimal. |
| `pricingModel.currency` | CurrencyCode | `RoomStay/RoomRates/RoomRate/Rates/Rate/Base/@CurrencyCode` | ISO 4217. |
| `cancellationPolicy` | CancelPenalty | `RoomStay/CancelPenalties/CancelPenalty` | Mapped to OTA cancel penalty structure. |
| `accessibilityFeatures[]` | HotelAmenity | `RoomStay/BasicPropertyInfo/HotelAmenity` | Accessibility features carried as amenity codes. |
| `validityPeriod` | No direct RS equivalent | — | Carried in `TPA_Extensions` if needed. |
| `liveAvailabilityMode` | No OTA equivalent | — | Activity Travel Protocol-native. Not in OTA RS. |

---

### A.3.3 OTA_VehicleAvailRateRQ / OTA_VehicleAvailRateRS

`OTA_VehicleAvailRateRQ/RS` covers ground transport availability and pricing. Within the
Activity Travel Protocol this applies to transport Activity Components — transfers, charter
vehicles, and scheduled ground transport segments within a multi-supplier itinerary.

**Inbound mapping — OTA_VehicleAvailRateRQ → Capability Declaration query**

| OTA Field | OTA Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Vehicle category | `VehAvailRQCore/@VehCategory` | `activityCategory` (transport subtype) | OTA VehCategory (1=Car, 2=Van, 5=Bus, etc.) mapped to Activity Travel Protocol transport category. |
| Vehicle class | `VehAvailRQCore/@ClassCode` | `vehicleSpecification.classCode` | Direct code mapping. |
| Pickup location | `VehAvailRQCore/PickUpLocation/@LocationCode` | `operationalLocation.pickupCode` | IATA airport code or OTA location code. |
| Dropoff location | `VehAvailRQCore/ReturnLocation/@LocationCode` | `operationalLocation.dropoffCode` | As above. |
| Pickup datetime | `VehAvailRQCore/@PickUpDateTime` | `operationalWindow.pickupDatetime` | ISO 8601 datetime. |
| Return datetime | `VehAvailRQCore/@ReturnDateTime` | `operationalWindow.returnDatetime` | ISO 8601 datetime. |
| Passenger count | `VehAvailRQCore/Passenger/@Quantity` | `participantConstraints.passengerCount` | Integer. |
| Supplier code | `VehAvailRQInfo/Vendor/@Code` | `supplierId` (Party Registry alias) | Bridge maps vendor code to partyId. |
| Rate qualifier | `VehAvailRQCore/RateQualifier/@RateQualifier` | `pricingModel.rateQualifier` | Mapped to pricing model qualifier field. |

**Outbound mapping — Capability Declaration → OTA_VehicleAvailRateRS**

| Activity Travel Protocol Field | OTA Field | OTA Path | Notes |
|---|---|---|---|
| `activityName` | VehMakeModel name | `VehVendorAvails/VehAvail/VehAvailCore/Vehicle/@VehMakeModel` | Mapped to vehicle description. |
| `supplierId` | VendorCode | `VehVendorAvails/@VendorCode` | Bridge maps partyId to vendor code. |
| `pricingModel.baseAmount` | EstimatedTotalAmount | `VehVendorAvails/VehAvail/VehAvailCore/TotalCharge/@EstimatedTotalAmount` | Decimal. |
| `pricingModel.currency` | CurrencyCode | `VehVendorAvails/VehAvail/VehAvailCore/TotalCharge/@CurrencyCode` | ISO 4217. |
| `cancellationPolicy` | PricedCoverage | `VehVendorAvails/VehAvail/VehAvailInfo/PricedEquips` | Cancel and coverage terms mapped to OTA equipment/coverage structure. |
| `participantConstraints.passengerCount` | PassengerQuantity | `VehVendorAvails/VehAvail/VehAvailCore/Vehicle/@PassengerQuantity` | Integer. |
| `operationalLocation` | LocationDetails | `VehVendorAvails/VehAvail/VehAvailInfo/LocationDetails` | Pickup/dropoff location codes and addresses. |
| `liveAvailabilityMode` | No OTA equivalent | — | Activity Travel Protocol-native. Not in OTA RS. Carried in `TPA_Extensions` if bridge requires it. |

---

### A.3.4 OpenTravel Bidirectional Bridge Notes

**Version and staleness.** OTA messages do not carry a Capability Declaration version
identifier or validity period. A bridge adapter operating inbound (OTA → Activity Travel
Protocol) must assign and maintain version identifiers for Capability Declarations derived from
OTA responses. The adapter is responsible for staleness detection: when an OTA RS differs
materially from the previously registered Capability Declaration, the adapter must publish a
`DECLARATION_SUPERSEDED` event (design rule L2-T-3-B) before registering the updated
declaration.

**Material change definition.** For OTA-sourced declarations, material change (design rule
L2-T-3-D) is triggered by any change to: offered services or rate codes, base price or pricing
model, operational location codes, participant constraints (min/max, age restrictions), or
cancellation penalty terms. Changes to contact information, vendor description text, or
`TPA_Extensions` content do not constitute material change.

**TPA_Extensions carriage.** Activity Travel Protocol fields with no OTA counterpart (see
§A.5.1) may be carried in `TPA_Extensions` elements in outbound OTA messages where the
receiving system supports extension processing. This is optional. The bridge adapter must not
fail if `TPA_Extensions` are ignored by the downstream OTA system.

**Feasibility Check interaction.** OTA availability responses are synchronous by design.
A bridge adapter translating an OTA RS into a `FEASIBILITY_CLEARED` event must verify that the
OTA response is not stale relative to the registered Capability Declaration version before
issuing the event (design rule L2-T-3-C). If the OTA RS post-dates the registered declaration
by more than the bridge adapter's configured staleness threshold, the adapter must trigger a
declaration update cycle before issuing `FEASIBILITY_CLEARED`.

---

## A.4 IATA NDC Mapping

NDC messages are XML-based and follow an Offer/Order lifecycle. The mapping below covers the
three messages in scope: AirShopping (capability/offer discovery), OfferPrice (offer
confirmation and pricing), and OrderCreate (order placement — the Booking Object creation
boundary).

NDC schemas referenced: NDC 21.3 (widely deployed) and NDC 24.1 (current generation). Field
paths are schema-version-agnostic where possible; version-specific divergences are noted.

### A.4.1 AirShopping

AirShopping is the NDC discovery message. `AirShoppingRQ` expresses a travel need; the
airline responds with `AirShoppingRS` containing a set of Offers. This maps to a Capability
Declaration query in the Activity Travel Protocol.

**Inbound mapping — AirShoppingRQ → Capability Declaration query**

| NDC Field | NDC Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Origin | `CoreQuery/OriginDestinations/OriginDestination/Origin/AirportCode` | `operationalLocation.originCode` | IATA airport code. Stored as origin in transport Activity Component. |
| Destination | `CoreQuery/OriginDestinations/OriginDestination/Destination/AirportCode` | `operationalLocation.destinationCode` | IATA airport code. |
| Departure date | `CoreQuery/OriginDestinations/OriginDestination/Departure/Date` | `operationalWindow.departureDate` | ISO 8601 date. |
| Cabin preference | `Preference/CabinPreferences/CabinType/Code` | `serviceClass.cabinCode` | NDC cabin codes (Y, W, C, F) mapped to Activity Travel Protocol service class. |
| Passenger type | `DataLists/PassengerList/Passenger/PTC` | `participantConstraints.passengerTypes[]` | NDC PTC (ADT, CHD, INF) mapped to Activity Travel Protocol participant type. |
| Passenger count | Count of `Passenger` elements | `participantConstraints.passengerCount` | Integer derived from passenger list. |
| Loyalty account | `DataLists/PassengerList/Passenger/LoyaltyProgramAccount` | `participantProfile.loyaltyAccount` | Program code and account number. Informational; not used in Feasibility Check. |
| Shopping response ID | `ShoppingResponseID` (RS) | Not mapped | NDC-internal correlation identifier. Bridge adapter retains for NDC session continuity. |

**Outbound mapping — Capability Declaration → AirShoppingRS (OfferItem)**

| Activity Travel Protocol Field | NDC Field | NDC Path | Notes |
|---|---|---|---|
| `capabilityDeclarationId` | OfferID | `Offers/Offer/@OfferID` | Bridge adapter generates NDC OfferID from declaration identifier. |
| `activityName` | OfferDescription | `Offers/Offer/OfferDescription` | Primary offer label. The NDC ServiceList is for ancillary components (baggage, meals, seat upgrades); activityName maps to the offer-level description, not the service list. |
| `supplierId` | Owner | `Offers/Offer/@Owner` | IATA airline code. Bridge maps partyId to airline code. |
| `pricingModel.baseAmount` | TotalAmount | `Offers/Offer/TotalPrice/DetailCurrencyPrice/Total` | Decimal. |
| `pricingModel.currency` | Code (currency) | `Offers/Offer/TotalPrice/DetailCurrencyPrice/Total/@Code` | ISO 4217. |
| `validityPeriod.end` | OfferExpiration | `Offers/Offer/@OfferExpiration` | Mapped to offer expiry datetime. NDC 24.1 adds explicit expiration field. |
| `cancellationPolicy` | PenaltyList | `DataLists/PenaltyList/Penalty` | Cancel penalty type and amounts mapped to NDC penalty structure. |
| `liveAvailabilityMode` | No NDC equivalent | — | Activity Travel Protocol-native. Not in AirShoppingRS. |
| `declarationVersion` | No NDC equivalent | — | Carried in bridge adapter metadata only. |

---

### A.4.2 OfferPrice

OfferPrice confirms the price and conditions for a selected Offer before OrderCreate.
It maps to the final stage of the Activity Travel Protocol Feasibility Check: the
`FEASIBILITY_CLEARED` event is issued after a successful OfferPrice response has confirmed
that the Offer remains valid and the price is locked.

**Inbound mapping — OfferPriceRQ → Feasibility Check input**

| NDC Field | NDC Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Offer reference | `Query/Offer/OfferRefID` | `capabilityDeclarationId` (resolved via bridge mapping) | Bridge adapter resolves NDC OfferRefID back to Capability Declaration identifier. |
| Selected offer item | `Query/Offer/OfferItemRefIDs/OfferItemRefID` | `selectedOfferItems[]` | Bridge adapter records selected items for Activity Configuration. |
| Passenger references | `DataLists/PassengerList/Passenger` | `participantConstraints` | As per AirShopping mapping. |
| Metadata `PriceClassRef` | `Query/Offer/PriceClassRef` | `pricingModel.priceClassRef` | NDC 24.1 field. Price class reference carried in Activity Configuration Schema output. |

**Outbound mapping — FEASIBILITY_CLEARED → OfferPriceRS (confirmation)**

| Activity Travel Protocol Field | NDC Field | NDC Path | Notes |
|---|---|---|---|
| `FEASIBILITY_CLEARED` event timestamp | PricedAt | `PricedOffer/@PricedAt` | ISO 8601 datetime of price confirmation. |
| `pricingModel.baseAmount` (confirmed) | TotalAmount | `PricedOffer/TotalPrice/DetailCurrencyPrice/Total` | Confirmed price at time of feasibility clearance. |
| `validityPeriod.end` (feasibility window expiry) | OfferExpiration | `PricedOffer/@OfferExpiration` | Feasibility window expiry maps to offer expiration. |
| `pricingModel.currency` | Code | `PricedOffer/TotalPrice/DetailCurrencyPrice/Total/@Code` | ISO 4217. |
| `cancellationPolicy` (confirmed) | Penalty | `DataLists/PenaltyList/Penalty` | Confirmed cancel conditions at time of pricing. |

**Feasibility window and OfferExpiration.** The NDC OfferExpiration is the airline's declared
validity window for the priced offer. The Activity Travel Protocol Feasibility Window (design
rule L2-T-1-A, minimum PT5M, default PT30M, maximum PT4H) must be set to the lesser of the
configured Feasibility Window duration and the NDC OfferExpiration timestamp. A bridge adapter
must not issue `FEASIBILITY_CLEARED` with a feasibility window that extends beyond the NDC
offer expiration.

---

### A.4.3 OrderCreate

OrderCreate is the NDC order placement message. It maps to the Booking Object creation event
in the Activity Travel Protocol — the normative MCP/A2A boundary defined in design rule
L2-T-2-A. When a bridge adapter translates an OrderCreate into an Activity Travel Protocol
booking initiation, the Booking Object is created and control transfers to Layer 3.

**Inbound mapping — OrderCreateRQ → Booking Object creation**

| NDC Field | NDC Path | Activity Travel Protocol Field | Notes |
|---|---|---|---|
| Order reference | Derived from `OrderCreateRS/Order/@OrderID` | `bookingObjectId` (external reference only) | Causal direction: bridge adapter creates the Booking Object first (generating UUID v7), then assigns an NDC OrderID alias derived from that UUID, then returns OrderCreateRS. The NDC OrderID is a downstream alias, not the source of bookingObjectId. Bridge adapter maintains UUID → OrderID mapping for round-trip fidelity. |
| Offer reference | `Query/Offer/OfferRefID` | `capabilityDeclarationId` (resolved) | Bridge resolves to Capability Declaration used for feasibility. |
| Passenger details | `DataLists/PassengerList/Passenger` | `travellerProfiles[]` | Name, PTC, document details mapped to Layer 3 traveller profile. |
| Contact | `DataLists/ContactList/ContactInformation` | `bookingContact` | Email and phone mapped to Layer 3 booking contact. |
| Payment | `Payments/Payment` | `paymentReference` | NDC payment method and amount recorded as Layer 3 payment reference. |
| Selected services | `Query/Offer/OfferItemRefIDs` | `activityComponents[]` | Each selected OfferItem maps to a fully-specified Activity Component entering Layer 3. |
| Ticket time limit | `Query/Offer/TimeLimits/PaymentTimeLimit/@DateTime` | Layer 3 timeout budget input | Mapped to Layer 3 S11 payment deadline. |

**Outbound mapping — Booking Object created → OrderCreateRS**

| Activity Travel Protocol Field | NDC Field | NDC Path | Notes |
|---|---|---|---|
| `bookingObjectId` (UUID v7) | OrderID | `Order/@OrderID` | Bridge adapter maintains UUID → NDC OrderID mapping. |
| Booking Object state (`PENDING_CONFIRMATION`) | OrderStatus | `Order/BookingReferences/BookingReference/@BookingEntity` | NDC OrderStatus mapped from Booking Object state. |
| `activityComponents[]` (confirmed) | OrderItem | `Order/OrderItems/OrderItem` | Each Activity Component maps to an NDC OrderItem. |
| `travellerProfiles[]` | Passenger | `Order/Passengers/Passenger` | Traveller details reflected back in order. |
| `paymentReference` | PaymentFunctions | `Order/PaymentFunctions` | Payment method and amount confirmed. |

**MCP/A2A boundary at OrderCreate.** OrderCreate is the message at which the A2A
inter-party agent phase ends and the Layer 3 MCP phase begins. A bridge adapter must:

1. Receive `OrderCreateRQ` (or equivalent booking initiation from the booking agent)
2. Verify that `FEASIBILITY_CLEARED` has been recorded for all Activity Components (design
   rule L2-T-5-B)
3. Verify that the Capability Declaration used for feasibility is still within its validity
   period (design rule L2-T-3-C)
4. Create the Booking Object via the Layer 3 MCP tool call
5. Store the NDC OrderID as an external reference on the Booking Object
6. Return `OrderCreateRS` to the NDC-speaking caller with the OrderID

A bridge adapter must not create a Booking Object before all required `FEASIBILITY_CLEARED`
events have been received. Partial feasibility (some Activity Components cleared, some timed
out) is governed by the REDUCE_SCOPE behaviour defined in S7; this applies equally to
NDC-sourced bookings.

---

### A.4.4 NDC Bidirectional Bridge Notes

**Schema version compatibility.** The mappings above are compatible with both NDC 21.3 and
NDC 24.1. NDC 24.1 introduces the `PriceClassRef` field (§A.4.2) and explicit
`OfferExpiration` on AirShoppingRS (§A.4.1); bridge adapters targeting NDC 21.3 systems must
handle these fields being absent. All other mapped fields are present in both schema versions.

**Declaration versioning for NDC sources.** NDC Offers do not carry a Capability Declaration
version identifier. A bridge adapter must treat each successful `OfferPriceRS` as a version
snapshot: the confirmed price and conditions at that moment constitute the declaration state
used for feasibility clearance. If the supplier's underlying Capability Declaration is updated
between AirShopping and OfferPrice, the bridge adapter must detect the discrepancy and request
a fresh AirShopping response before proceeding (design rule L2-T-3-C).

**Synchronous NDC and async Feasibility Check.** NDC is synchronous by design. The Activity
Travel Protocol Feasibility Check is asynchronous and event-driven (design decision PD-L2-1).
A bridge adapter resolves this mismatch as follows: the OfferPriceRS is treated as the
`FEASIBILITY_CLEARED` trigger event for the transport Activity Component. For multi-supplier
bookings where transport is one component among several, the NDC OfferPrice response provides
clearance for the transport component only; other components clear independently via their own
mechanisms. The INQUIRY state remains open until all components have cleared or the Feasibility
Window expires, consistent with design rule L2-T-1-C (partial feasibility behaviour).

**A2A graceful degradation.** An airline supplier operating only NDC (no A2A agent capability)
is reached via MCP tool calls against static Capability Declarations derived from AirShopping
responses (design rule L2-T-2-C). The bridge adapter registers the AirShopping-derived
Capability Declaration in the Capability Catalogue. The booking agent queries the catalogue via
MCP rather than via A2A. This is the conformant fallback path; its use does not make the
supplier non-conformant (design rule L2-T-2-D).

---

## A.5 Common Bridge Patterns

### A.5.1 Activity Travel Protocol Fields with No OTA/NDC Counterpart

The following Capability Declaration fields have no direct equivalent in any OTA or NDC message
in scope. Bridge adapter implementations must handle these fields by one of the three
strategies listed.

| Field | Defined In | Strategy Options |
|---|---|---|
| `declarationVersion` | S3 §3.2.1 | Bridge adapter assigns and manages. Not transmitted in OTA/NDC. |
| `validityPeriod` (Capability Declaration) | S3 §3.2.1 | Distinct from the Feasibility Window. For OTA-sourced declarations: derived from OTA RS timestamp plus a supplier-configured validity duration, capped by the S3-defined maximum validity period. For NDC-sourced declarations: derived from OfferPriceRS timestamp; NDC OfferExpiration is the upper bound. If OTA RS carries `ValidityPeriod` start/end fields (OTA_TourActivityRS), these are used directly. |
| `liveAvailabilityMode` | S3 §3.2.2 (GN-L2-1) | Bridge adapter sets based on OTA/NDC system capability. OTA systems: typically `SUPPLEMENTAL`. NDC systems: `SUPPLEMENTAL` (OfferPrice confirms live price and conditions). Carried in `TPA_Extensions` (OTA) or bridge metadata (NDC). |
| `liveAvailabilityDriverRef` | S3 §3.2.2 (GN-L2-1) | Bridge adapter populates from Resource Reference Registry if a live availability driver is configured for the OTA/NDC endpoint. |
| `delegationTopologyDeclaration` | S3 §3.4 | Registered separately in Party Registry. Not derivable from OTA/NDC messages. Supplier must provide directly. |
| `jurisdictionCoverage[]` | S3 §3.2.3 | Not present in OTA or NDC. Bridge adapter may carry in `TPA_Extensions` (OTA) or bridge metadata (NDC). Supplier must provide directly at registration time. |
| `requiresA2ANegotiation` | S6 §6.3.5 (GN-L2-2) | Bridge adapter sets `false` for all OTA/NDC-sourced Pre-Arrangement Declarations unless supplier explicitly registers A2A capability. |

### A.5.2 OTA/NDC Fields with No Capability Declaration Counterpart

The following OTA and NDC fields have no direct Activity Travel Protocol counterpart. They are
not discarded — they are stored as bridge adapter metadata and may be used for round-trip
fidelity when translating outbound.

| Field | Source | Disposition |
|---|---|---|
| OTA `TypeCode` values not in Activity Travel Protocol category taxonomy | OTA_TourActivityRQ | Stored as `extensionData.otaTypeCode` on Capability Declaration. Not used in protocol operations. |
| NDC `ShoppingResponseID` | AirShoppingRS | Retained by bridge adapter for NDC session correlation. Not stored on Capability Declaration. |
| NDC `ProgramCode` (loyalty) | AirShoppingRQ | Stored as `participantProfile` metadata. Not used in Feasibility Check or Booking Object creation. |
| OTA `RatePlanCode` beyond pricing model qualifier | OTA_HotelAvailRQ | Stored as `extensionData.otaRatePlanCode`. Not used in protocol operations. |
| NDC `TicketDocInfo` | OrderCreateRS | Stored as external reference on Booking Object. Not a Layer 2 concern. |
| OTA `TPA_Extensions` content | All OTA messages | Passed through to bridge adapter metadata. Not mapped to Capability Declaration fields. |

### A.5.3 Partial Feasibility and Declaration Staleness — Bridge Adapter Obligations

**Partial feasibility.** When a multi-supplier booking includes both OTA/NDC-sourced
components and native Activity Travel Protocol components, partial feasibility (design rule
L2-T-1-C, REDUCE_SCOPE behaviour in S7) applies across all components regardless of their
source. An OTA-sourced transport component that returns `FEASIBILITY_FAILED` with reason
`DECLARATION_STALE` is treated identically to a native component that times out: the booking
agent must decide whether to proceed with reduced scope or abort INQUIRY.

**Declaration staleness for bridge-sourced declarations.** Bridge adapters are responsible for
staleness detection on behalf of suppliers who do not natively publish `DECLARATION_SUPERSEDED`
events. The bridge adapter must:

1. Cache the field values of each registered Capability Declaration derived from an OTA/NDC
   response
2. On each subsequent OTA/NDC response for the same supplier/product, compare against the
   cached declaration
3. If a material change is detected (as defined in §A.3.4 for OTA and §A.4.4 for NDC), publish
   `DECLARATION_SUPERSEDED` with the old and new version identifiers before registering the
   updated declaration (design rule L2-T-3-B)
4. Issue `FEASIBILITY_FAILED` with reason `DECLARATION_STALE` if a Feasibility Check is in
   progress at the time of supersession (design rule L2-T-3-C)

---

## A.6 Conformance and Deferred Items

**Bridge adapter conformance.** A bridge adapter is conformant with this appendix if it
correctly implements the bidirectional field mappings in §A.3 and §A.4, manages declaration
versioning and staleness detection as specified in §A.5.3, and observes the MCP/A2A boundary
at OrderCreate as specified in §A.4.3.

**Conformance testing.** Full automated conformance testing of bridge adapter implementations
is deferred to the Layer 4 SDK conformance suite (deferred item DL2-4). This appendix provides
the normative mapping basis that the conformance suite will test against.

**IATA One Order (post-creation lifecycle).** OrderChange, OrderCancel, and OrderRetrieve map
to Layer 3 Booking Object state transitions (cancellation, modification, and status query
respectively). These mappings are out of scope for Layer 2. The Layer 4 SDK conformance suite
will define the One Order ↔ Layer 3 event mapping as part of the transport Activity Component
SDK package.

**OpenTravel Alliance collaboration.** The Activity Travel Protocol seeks observer status in
the OAI-Travel workgroup at v1.0. The mapping tables in this appendix are intended as a
starting point for a collaborative bridge specification maintained jointly with the OpenTravel
Alliance. Updates to OTA schema versions post-v1.0 will be tracked against these mappings.

**ARDP.** The ARDP standard is at MONITOR position at Layer 2. It will be re-evaluated at the
Layer 4 Capability Catalogue design stage. No ARDP mappings are defined in this appendix.

---

*Activity Travel Protocol — Layer 2 Appendix A v0.1 — March 2026*  
*MyAuberge K.K. — Apache 2.0*
