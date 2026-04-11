# @atp/security — Fletcher Embassy Pattern

*SDK Architecture Blueprint · Section 6*

[← Overview](index) · [Condition Expression Syntax →](condition-expression)

## 6. @atp/security — Fletcher Embassy Pattern

### 6.1 Problem Statement

An ATP agent operating under a valid ATP Mandate JWT encounters a
destination domain that does not natively evaluate Cedar policies.
Examples:

-   A legacy OTA running a proprietary authorisation system that accepts
    OAuth 2.0 bearer tokens with scope strings.

-   A GDS API that accepts HTTP Basic credentials or API keys.

-   A supplier system that uses OpenID Connect ID tokens for identity
    but has no Cedar policy evaluation capability.

The agent's Cedar mandate encodes what it is authorised to do in terms
the ATP runtime enforces. At the trust boundary, that authorisation must
not be silently discarded — but it also must not be blindly asserted
to a foreign domain that cannot verify it.

The Fletcher Embassy pattern addresses this by acting as a trust
boundary translator: it receives the ATP Mandate JWT, evaluates the
Cedar policy set in the ATP runtime, and produces a domain-specific
credential that represents the authorised capability subset in terms the
destination domain understands.

### 6.2 Design Constraints (Established in Session 6 Placeholder)

-   The Embassy MUST NOT create a bypass path around the Security
    Kernel. Embassy translation produces evidence of authorisation. The
    Security Kernel evaluates state transitions independently of Embassy
    output.

-   The booking_object_id binding remains inside the ATP runtime. The
    issued domain credential does NOT carry booking_object_id as an
    enforced claim. A non-normative atp_hint claim MAY be included for
    audit logging at the destination domain's discretion.

-   **Decision SEC-1 (CLOSED):** Option B — booking_object_id stays
    inside ATP. The Embassy issues a minimal capability token with
    scopes only. The Security Kernel enforces the booking_object_id
    constraint on all inbound state transitions regardless of what the
    foreign domain accepted. This preserves Security Kernel supremacy
    and avoids creating a spec surface that foreign domains will not
    implement.

-   The Embassy MUST evaluate the Cedar policy set before issuing any
    domain credential. It MUST NOT issue a credential for an action that
    the Cedar policy does not permit.

-   The Embassy is a component of @atp/security. It is not part of the
    ATP MCP Server tool surface. MCP tools do not invoke the Embassy;
    the Embassy is invoked by the ATP agent runtime when a cross-domain
    call is required.

### 6.3 FletcherEmbassy Interface

@atp/security exports the following TypeScript interface:

+-----------------------------------------------------------------------+
| // @atp/security — FletcherEmbassy interface                       |
|                                                                       |
| export interface EmbassyRequest {                                     |
|                                                                       |
| mandate: ATPMandateJWT; // The agent's full ATP Mandate JWT          |
|                                                                       |
| targetDomain: string; // Destination domain identifier (e.g.          |
| 'api.supplier.com')                                                 |
|                                                                       |
| requestedAction: ATPCedarAction; // The Cedar action the agent        |
| intends to perform                                                    |
|                                                                       |
| targetProtocol: EmbassyProtocol; // OAUTH2 \| OIDC \| API_KEY \|      |
| BASIC \| NONE                                                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| export interface EmbassyResponse {                                    |
|                                                                       |
| credential: EmbassyCredential; // The domain-specific credential      |
|                                                                       |
| grantedScopes: string\[\]; // Scopes or capabilities confirmed by     |
| Cedar evaluation                                                      |
|                                                                       |
| expiresAt: number; // Unix epoch — always \<= mandate exp           |
|                                                                       |
| atpHint?: ATPHintClaim; // Non-normative. booking_object_id for audit |
| logging only                                                          |
|                                                                       |
| evaluationLog: CedarEvaluationResult; // Cedar evaluation result for  |
| audit trail                                                           |
|                                                                       |
| }                                                                     |
|                                                                       |
| export interface FletcherEmbassy {                                    |
|                                                                       |
| translate(request: EmbassyRequest): Promise\<EmbassyResponse\>;       |
|                                                                       |
| supports(protocol: EmbassyProtocol): boolean;                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| export type EmbassyProtocol = 'OAUTH2' \| 'OIDC' \| 'API_KEY'   |
| \| 'BASIC' \| 'NONE';                                             |
|                                                                       |
| export interface IEmbassyProvider {                                   |
|                                                                       |
| getEmbassy(targetDomain: string): FletcherEmbassy;                    |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**Decision SEC-2 (CLOSED):** The EmbassyResponse always carries a
CedarEvaluationResult in evaluationLog. This makes the Embassy's
authorisation decision auditable independently of the destination
domain. The evaluation log is stored in the Booking Object event log as
a BookingObjectEvent of type EMBASSY_TRANSLATION.

### 6.4 OAuth 2.1 Scope Translation — Reference Implementation

The primary reference implementation of FletcherEmbassy translates Cedar
actions to OAuth 2.1 scope strings. The mapping is defined by the
operator at Embassy configuration time using a ScopeMap:

+-----------------------------------------------------------------------+
| // Operator-defined scope map — registered at Embassy               |
| initialisation                                                        |
|                                                                       |
| export interface ScopeMap {                                           |
|                                                                       |
| \[cedarAction: ATPCedarAction\]: string\[\]; // Cedar action → OAuth  |
| scope strings                                                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| // Example scope map for a legacy OTA integration                     |
|                                                                       |
| const otaScopeMap: ScopeMap = {                                       |
|                                                                       |
| 'ATPAction::"get_context_package"': \['booking:read'\],         |
|                                                                       |
| 'ATPAction::"update_pre_arrangement"': \['booking:write'\],     |
|                                                                       |
| 'ATPAction::"notify_traveller"': \['notification:send'\],       |
|                                                                       |
| 'ATPAction::"record_safety_check"': \['safety:write'\],         |
|                                                                       |
| };                                                                    |
|                                                                       |
| // The Embassy evaluates the Cedar policy against the requested       |
| action,                                                               |
|                                                                       |
| // then issues an OAuth access token with only the mapped scopes that |
|                                                                       |
| // Cedar permits. If Cedar denies, translate() throws                 |
| EmbassyDeniedError.                                                   |
+-----------------------------------------------------------------------+

The OAuth 2.1 scope translation reference implementation uses the
client_credentials grant. The Embassy acts as an OAuth client on behalf
of the ATP agent. The client credentials are held by the Embassy, not
the agent. The agent never holds foreign-domain credentials directly.

**Decision SEC-3 (CLOSED):** The Embassy, not the agent, holds all
foreign-domain credentials. This enforces the principle of minimal
credential surface: the ATP agent knows only its ATP Mandate JWT. The
Embassy is the single point of foreign-domain credential management for
all cross-domain interactions on a given Booking Object.

### 6.5 OIDC Trust Chain Verification

For domains that accept OpenID Connect ID tokens, the Embassy performs
trust chain verification before issuing. The Embassy verifies:

1.  The destination domain's OIDC discovery document is reachable and
    its issuer matches the registered domain entry.

2.  The audience (aud) claim in any issued ID token is scoped to the
    destination domain only. Tokens are never issued with a wildcard
    audience.

3.  Token lifetime is the minimum of: the mandate exp, the domain's
    maximum accepted token lifetime, and 3600 seconds (one hour hard
    cap).

### 6.6 Cedarling WASM Runtime

@atp/security embeds the Cedarling WASM runtime (Janssen Project,
Apache 2.0) as the Cedar policy evaluation engine. This is the same
engine used by @clawdreyhepburn/ovid-me, maintaining consistency across
the ecosystem.

**Decision SEC-4 (CLOSED):** @atp/security uses Cedarling WASM as the
Cedar policy evaluation engine for Embassy translation. A
string-matching fallback engine (identical in interface to the Cedarling
interface) is provided for environments where WASM is unavailable (e.g.
edge runtimes with WASM size restrictions). The fallback engine supports
the Cedar action namespace used by ATP but does not guarantee full Cedar
semantics. Operators using the fallback MUST document this in their
ATP-compatible certification submission.

### 6.7 Security Properties

  **Property**             **Guarantee**

  Cedar evaluation         Embassy MUST evaluate Cedar before issuing any
  precedes credential      credential. EmbassyDeniedError is thrown if
  issuance                 Cedar denies. No credential is issued for a
                           denied action under any circumstances.

  No booking_object_id in  The issued credential carries no
  issued credential        booking_object_id claim with enforcement
                           semantics. The Security Kernel enforces
                           object-instance binding on all inbound state
                           transitions.

  Credential lifetime      EmbassyResponse.expiresAt \<= mandate.exp. The
  bounded by mandate       Embassy cannot issue a credential that
                           outlives the mandate.

  Agent holds no foreign   All foreign-domain credentials are held by the
  credentials              Embassy. The agent holds only its ATP Mandate
                           JWT.

  All translations are     Every Embassy translation produces a
  logged                   BookingObjectEvent of type EMBASSY_TRANSLATION
                           in the Booking Object event log. This log is
                           append-only and Security Kernel-protected.

### 6.8 OQ-MCP-2 — Resolution

+-----------------------------------------------------------------------+
| **DECISION OQ-MCP-2 — RESOLVED (CLOSED)**                           |
|                                                                       |
| **Fletcher Embassy: @atp/security OTA trust boundary translation     |
| pattern for domains that do not speak Cedar.**                        |
|                                                                       |
| RESOLVED. The @atp/security package specifies the FletcherEmbassy    |
| interface, EmbassyRequest/EmbassyResponse types, OAuth 2.1 scope      |
| translation reference implementation, OIDC trust chain verification,  |
| and Cedarling WASM runtime. The booking_object_id binding remains     |
| inside the ATP runtime (Option B, SEC-1 CLOSED). Four decisions       |
| closed: SEC-1 through SEC-4. The Fletcher Embassy pattern is          |
| normative for all ATP agent cross-domain interactions with non-Cedar  |
| domains from v1.0.                                                    |
+-----------------------------------------------------------------------+
