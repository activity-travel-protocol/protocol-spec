# Activity Category Registry — Community Namespace Governance

*SDK Architecture Blueprint · Section 8 · OQ-AS-4 Resolution*

[← Condition Expression Syntax](condition-expression) · [Decisions →](decisions)

**8. Activity Category Registry — Community Namespace Governance
(OQ-AS-4)**

### 8.1 Background

The Activity Category Registry uses namespaces to distinguish
Foundation-ratified categories (no prefix, e.g. SKI_ALPINE) from
community-contributed categories that have not yet been ratified
(namespace prefix, e.g. atp_community.WINE_TASTING). OQ-AS-4 asked: who
may claim a namespace, and how are collisions resolved? This is required
before the registry accepts community submissions.

### 8.2 Namespace Definitions

  **Namespace**      **Description**

  (none)             Foundation namespace. Ratified categories only.
                     TSC-controlled. No community submissions may use
                     this namespace.

  atp_community      Community staging namespace. Any registered
                     submitter may propose a category here. Categories in
                     this namespace are experimental. They may be
                     renamed, modified, or removed before ratification.

  atp\_{org}         Organisation namespace. Claimed by a registered
                     Foundation member or a registered community
                     organisation. Categories here are maintained by the
                     claiming organisation. They are not subject to TSC
                     modification without the organisation's consent.

  atp_local          Locale/region namespace. Used for categories with
                     strong jurisdictional specificity (e.g.
                     atp_local.ONSEN_DAY_USE for Japan hot-spring
                     bathing). Claimed by region, not by organisation.

### 8.3 Namespace Claiming Rules

**Decision NS-1 (CLOSED):** The atp_community namespace is open. Any
GitHub account that has submitted a signed CLA (ATP_CLA_v1.md) may
submit categories to atp_community. No namespace claiming process is
required for atp_community. This is the default pathway for new
submissions.

**Decision NS-2 (CLOSED):** Organisation namespaces (atp\_{org}) are
claimed by submitting a Namespace Claim to the Foundation TSC as a
GitHub issue on the protocol-spec repository. The claim must include:
the organisation name, the proposed namespace string (atp\_{org} where
{org} is a short lowercase identifier), a contact person, and a
statement of the categories the organisation intends to submit. The TSC
approves namespace claims within 30 days. Approved namespaces are
published in the registry manifest at
activitytravel.pro/registry/namespaces.json.

**Decision NS-3 (CLOSED):** Collision resolution rules: (a) Within
atp_community: first-submitted PR has priority. If two PRs propose the
same category_id, the earlier PR has right of way; the later submitter
must rename or withdraw. (b) Between atp_community and a claimed org
namespace: the org namespace holder may claim any atp_community category
by submitting a migration PR. The original submitter is notified and has
14 days to object. TSC arbitrates objections. (c) Between two claimed
org namespaces: collisions are impossible by definition, as each org
namespace is unique. (d) Promotion to Foundation namespace: on
ratification, the TSC assigns the canonical unprefixed category_id. The
atp_community or atp\_{org} alias MUST redirect to the canonical id and
MAY be retired after a 12-month deprecation period.

### 8.4 Registry Manifest

The registry manifest at activitytravel.pro/registry/namespaces.json
declares all claimed namespaces:

+-----------------------------------------------------------------------+
| {                                                                     |
|                                                                       |
| "version": "1.0",                                                 |
|                                                                       |
| "foundation_namespace": "",                                       |
|                                                                       |
| "community_namespace": "atp_community",                           |
|                                                                       |
| "claimed_namespaces": \[                                            |
|                                                                       |
| {                                                                     |
|                                                                       |
| "namespace": "atp_myauberge",                                     |
|                                                                       |
| "organisation": "MyAuberge K.K.",                                 |
|                                                                       |
| "contact": "tom@myauberge.jp",                                    |
|                                                                       |
| "claimed_at": "2026-04-01",                                       |
|                                                                       |
| "status": "ACTIVE"                                                |
|                                                                       |
| }                                                                     |
|                                                                       |
| \],                                                                   |
|                                                                       |
| "locale_namespaces": \[                                             |
|                                                                       |
| { "namespace": "atp_local", "regions": \["JP", "ALL"\] }    |
|                                                                       |
| \]                                                                    |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

### 8.5 OQ-AS-4 — Resolution

+-----------------------------------------------------------------------+
| **DECISION OQ-AS-4 — RESOLVED (CLOSED)**                            |
|                                                                       |
| **Community namespace governance for Activity Category Registry.**    |
|                                                                       |
| RESOLVED. Four namespace types defined (Foundation, atp_community,    |
| atp\_{org}, atp_local). Three decisions closed: NS-1 (atp_community   |
| open to any CLA signatory), NS-2 (org namespace claiming process via  |
| TSC GitHub issue), NS-3 (collision resolution rules for all namespace |
| interaction scenarios). Registry manifest spec published. The         |
| registry may now accept community submissions.                        |
+-----------------------------------------------------------------------+

## 9. Open Questions (SDK Architecture)

  OQ-MCP-2   Fletcher Embassy:              RESOLVED —  Session 7.
             @atp/security OTA trust       CLOSED        SEC-1--SEC-4.
             boundary translation pattern.                

  OQ-AS-1    ATP Condition Expression       RESOLVED —  Session 7.
             Syntax v1 full grammar and     CLOSED        CES-1--CES-3.
             parser specification.                        

  OQ-AS-4    Community namespace governance RESOLVED —  Session 7.
             for Activity Category          CLOSED        NS-1--NS-3.
             Registry.                                    

  OQ-AS-2    HarvestCalendar fragment:      OPEN          Foundation TSC
             defer to Fragment Library v2?                

  OQ-RI-3    8 Peaks OCTO Bridge: does 8    OPEN          Tom Sato / 8 Peaks
             Peaks have IT capability to                  
             self-serve the OCTO API?                     
