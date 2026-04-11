# OpenAPI 3.1 REST Surface Contract

*Layer 4 Schema and SDK · Section 3*

[← @atp/core Types](index) · [OQ Resolutions →](resolutions)

## 3. OpenAPI 3.1 REST Surface Contract

### 3.1 Scope and Design Principles

The OpenAPI 3.1 specification is the normative contract for the Activity
Travel Protocol REST/Webhook surface (TechStack v2, Decision 5.1). It is
the primary integration path for Java microservice adopters at v1.0
(SDK-5, CLOSED) and the generation source for community client
libraries.

Design principles: (1) Every request and response body is typed against
a JSON Schema object derived from the @atp/core type surface. No
untyped or weakly typed endpoints. (2) All identifiers are branded
string types in the schema — format fields carry the brand name (e.g.
format: booking-object-id). (3) All state-mutating operations are
idempotent with a client-supplied idempotency key. (4) Error responses
use RFC 9457 Problem Details format.

### 3.2 Endpoint Catalogue

  -----------------------------------------------------------------------------------------------------------
  **Method**   **Path**                                    **Scope         **Description**
                                                           Required**      
  POST         /booking-objects                            BOOKING_WRITE   Create a new Booking Object in
                                                                           ENQUIRY state. Returns
                                                                           BookingObjectId.

  GET          /booking-objects/{id}                       BOOKING_READ    Retrieve full Booking Object by
                                                                           id. Role-scoped field masking
                                                                           applied.

  PATCH        /booking-objects/{id}/state                 BOOKING_WRITE   Trigger a state transition.
                                                                           Validated against Cedar mandate
                                                                           before Security Kernel.

  GET          /booking-objects/{id}/events                BOOKING_READ    Retrieve append-only
                                                                           StateTransitionEvent log for a
                                                                           Booking Object.

  POST         /booking-objects/{id}/collection            BOOKING_WRITE   Submit ActivityCollection data for
                                                                           a guest participant in PRE_JOURNEY
                                                                           phase.

  GET          /booking-objects/{id}/hem                   BOOKING_READ    Retrieve active HEM escalation
                                                                           record, if any.

  POST         /booking-objects/{id}/hem/resolve           ADMIN           Human operator resolves an active
                                                                           HEM escalation. Requires ADMIN
                                                                           scope.

  POST         /booking-objects/{id}/payment               PAYMENT_WRITE   Record a payment event against the
                                                                           PaymentObject.

  GET          /booking-objects/{id}/payment               PAYMENT_READ    Retrieve PaymentObject state.

  POST         /mandates                                   ADMIN           Issue an ATP Mandate JWT for an
                                                                           agent. Co-issued with OAuth 2.1
                                                                           access token.

  DELETE       /mandates/{mandate_id}                      ADMIN           Revoke an ATP Mandate JWT before
                                                                           expiry.

  GET          /registry/categories                        — (public)    List all Activity Category
                                                                           Registry entries. Supports
                                                                           ?status= filter.

  GET          /registry/categories/{category_id}          — (public)    Retrieve a single registry entry
                                                                           including schema URIs.

  GET          /registry/fragments                         — (public)    List all Fragment Library entries.

  GET          /registry/query                             — (public)    AI agent query interface. Accepts
                                                                           natural language category query,
                                                                           returns matching registry entries
                                                                           with field descriptions.

  POST         /webhooks/subscriptions                     BOOKING_READ    Subscribe to Booking Object state
                                                                           change webhooks.

  DELETE       /webhooks/subscriptions/{subscription_id}   BOOKING_READ    Unsubscribe from webhooks.
  -----------------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **DECISION L4-3**                                                     |
|                                                                       |
| The Activity Travel Protocol REST surface is specified as an OpenAPI  |
| 3.1 document published at activitytravel.pro/openapi.json (canonical) |
| and activitytravel.pro/openapi.yaml (human-readable). The OpenAPI     |
| document is the normative contract for REST surface adopters. JSON    |
| Schema objects for request/response bodies are co-published at        |
| activitytravel.pro/schemas/ and are the authoritative source for      |
| client library generation. All endpoints require OAuth 2.1 Bearer     |
| token authentication except /registry/\* endpoints, which are public. |
+-----------------------------------------------------------------------+

### 3.3 Error Response Format — RFC 9457

All error responses use RFC 9457 Problem Details. The type URI
identifies the specific error category. The Activity Travel Protocol
defines a set of error types at activitytravel.pro/errors/.

> // Example: Cedar mandate evaluation failure
>
> {
>
> "type": "https://activitytravel.pro/errors/mandate-scope-denied",
>
> "title": "Mandate scope denied",
>
> "status": 403,
>
> "detail": "Action BOOKING_WRITE on booking_object_id abc123 denied
> by Cedar policy set.",
>
> "instance": "/booking-objects/abc123/state",
>
> "booking_object_id": "abc123",
>
> "cedar_action": "atp::booking::write",
>
> "mandate_id": "mnd_xyz"
>
> }
