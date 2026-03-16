# ATOP Protocol — Normative and Informative References

**Version:** 0.1  
**Date:** March 2026  
**Repository:** atop-protocol/atop-spec  
**Scope:** All ATOP specification documents  
**License:** Apache 2.0  

---

This document is the authoritative reference list for all ATOP specifications.
Each specification cites references using the tags defined here (e.g. [OIDFED],
[FAPI2], [RFC2119]). References are classified as **normative** — required for
conforming implementations — or **informative** — provided for context and background.

---

## Normative References

Conforming ATOP implementations MUST comply with all normative references cited
in the specification documents they implement.

---

**[OIDFED]**  
OpenID Foundation  
*OpenID Federation 1.0*  
Final Specification, March 2025  
https://openid.net/specs/openid-federation-1_0.html  
*Normative. The trust establishment mechanism for inter-organizational trust in ATOP.
ATOP Trust Chains at Layer 1 are OpenID Federation Trust Chains with ATOP-specific
Trust Marks and Entity Statement extensions.*

---

**[FAPI2SEC]**  
OpenID Foundation — Financial-grade API Working Group  
*FAPI 2.0 Security Profile*  
Final, December 2024  
https://openid.net/specs/fapi-2_0-security-profile.html  
*Normative. The API security profile governing how ATOP API calls are authenticated
and authorized between registered Parties. ATOP APIs MUST conform to FAPI 2.0
Security Profile.*

---

**[FAPI2MSG]**  
OpenID Foundation — Financial-grade API Working Group  
*FAPI 2.0 Message Signing*  
Final, December 2024  
https://openid.net/specs/fapi-2_0-message-signing.html  
*Normative. Defines how ATOP messages are signed and verified. Binding signatures
at CONFIRMATION state MUST conform to FAPI 2.0 Message Signing.*

---

**[VCDATA2]**  
W3C  
*Verifiable Credentials Data Model v2.0*  
W3C Recommendation, May 2024  
https://www.w3.org/TR/vc-data-model-2.0/  
*Normative. The data model for Assurance Level 4 credential references in the
ATOP Party Registry. W3C VCs with DIDs achieve the highest credential assurance
level in ATOP.*

---

**[DID]**  
W3C  
*Decentralized Identifiers (DIDs) v1.0*  
W3C Recommendation, July 2022  
https://www.w3.org/TR/did-core/  
*Normative. DID resolution is required for cryptographic verification of Assurance
Level 4 credentials and for OpenID Federation Entity Identifiers.*

---

**[JSONSCHEMA]**  
JSON Schema Organization  
*JSON Schema: A Media Type for Describing JSON Documents (Draft 2020-12)*  
Internet Draft, 2020  
https://json-schema.org/draft/2020-12/schema  
*Normative. All ATOP schemas are expressed in JSON Schema 2020-12. Normative
schema files are maintained at atop-protocol/atop-spec/schemas/.*

---

**[RFC2119]**  
Bradner, S.  
*Key words for use in RFCs to Indicate Requirement Levels*  
RFC 2119, March 1997  
https://www.rfc-editor.org/rfc/rfc2119  
*Normative. The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD,
SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in ATOP specifications are to be
interpreted as described in RFC 2119.*

---

**[RFC8174]**  
Leiba, B.  
*Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words*  
RFC 8174, May 2017  
https://www.rfc-editor.org/rfc/rfc8174  
*Normative. Clarifies that only uppercase instances of RFC 2119 key words carry
the defined meaning.*

---

**[RFC8414]**  
Jones, M., Sakimura, N., Bradley, J.  
*OAuth 2.0 Authorization Server Metadata*  
RFC 8414, June 2018  
https://www.rfc-editor.org/rfc/rfc8414  
*Normative. ATOP Party endpoints are published using OAuth 2.0 Authorization
Server Metadata format, extended for ATOP-specific fields.*

---

**[RFC9449]**  
Fett, D., Campbell, B., Bradley, J., Lodderstedt, T., Jones, M., Waite, D.  
*OAuth 2.0 Demonstrating Proof of Possession (DPoP)*  
RFC 9449, September 2023  
https://www.rfc-editor.org/rfc/rfc9449  
*Normative. DPoP is the proof-of-possession mechanism required by FAPI 2.0 and
used for binding ATOP API tokens to specific clients.*

---

**[OIDC]**  
Sakimura, N., Bradley, J., Jones, M., de Medeiros, B., Mortimore, C.  
*OpenID Connect Core 1.0*  
Final, November 2014  
https://openid.net/specs/openid-connect-core-1_0.html  
*Normative. OpenID Connect is the identity layer used for human Actor
authentication in ATOP (oauth2_oidc authentication method in Party Registry).*

---

**[ISO3166]**  
International Organization for Standardization  
*ISO 3166-1: Codes for the representation of names of countries and their
subdivisions — Part 1: Country codes*  
ISO 3166-1:2020  
https://www.iso.org/iso-3166-country-codes.html  
*Normative. All jurisdiction codes in ATOP use ISO 3166-1 alpha-2 format.*

---

**[ISO8601]**  
International Organization for Standardization  
*ISO 8601: Date and time — Representations for information interchange*  
ISO 8601-1:2019  
https://www.iso.org/iso-8601-date-and-time-format.html  
*Normative. All date and datetime fields in ATOP use ISO 8601 format. Datetime
fields use UTC with explicit timezone offset.*

---

**[SHA256]**  
NIST  
*Secure Hash Standard (SHS)*  
FIPS PUB 180-4, August 2015  
https://doi.org/10.6028/NIST.FIPS.180-4  
*Normative. SHA-256 is the required hash algorithm for document fingerprinting
in ATOP credential references.*

---

**[ES256]**  
Jones, M.  
*JSON Web Algorithms (JWA) — ES256*  
RFC 7518, May 2015  
https://www.rfc-editor.org/rfc/rfc7518  
*Normative. ES256 (ECDSA using P-256 and SHA-256) is the default signature
algorithm for ATOP message signing and AI Agent authorization verification.*

---

## Informative References

Informative references provide context, background, and the regulatory framework
within which ATOP operates. Implementations are not required to conform to
informative references, but understanding them is important for correct
implementation.

---

### Standards and Technical Specifications

**[OIDFTM]**  
OpenID Foundation  
*OpenID Federation — Trust Marks*  
Draft, 2025  
https://openid.net/specs/openid-federation-1_0.html#trust-marks  
*Informative. Trust Marks are the mechanism ATOP uses to assert role-specific
conformance within the OpenID Federation framework.*

**[EIDAS2]**  
European Union  
*eIDAS 2.0 — Regulation on electronic identification and trust services*  
EU Regulation 2024/1183, April 2024  
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1183  
*Informative. eIDAS 2.0 defines the EU digital identity framework. ATOP Assurance
Levels 3 and 4 align with eIDAS Levels of Assurance Substantial and High.*

**[ISO29115]**  
International Organization for Standardization  
*ISO/IEC 29115: Entity authentication assurance framework*  
ISO/IEC 29115:2013  
https://www.iso.org/standard/45138.html  
*Informative. ATOP Assurance Level 2 (document-attested) aligns with ISO/IEC
29115 Level of Assurance 2.*

**[STCW]**  
International Maritime Organization  
*International Convention on Standards of Training, Certification and Watchkeeping
for Seafarers (STCW), as amended*  
IMO, 1978 (amended 2010)  
https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Convention.aspx  
*Informative. STCW defines the international standard for maritime crew
certification referenced in ATOP maritime domain entries.*

**[HACCP]**  
Codex Alimentarius Commission  
*Hazard Analysis and Critical Control Point (HACCP) System and Guidelines
for its Application*  
CAC/RCP 1-1969, Rev. 4-2003  
https://www.fao.org/fao-who-codexalimentarius/  
*Informative. The international HACCP standard referenced in ATOP food safety
domain entries.*

**[IATA-NDC]**  
International Air Transport Association  
*New Distribution Capability (NDC) Standard*  
IATA Resolution 787, current version  
https://www.iata.org/en/programs/airline-distribution/ndc/  
*Informative. IATA NDC is the air distribution standard with which ATOP is
designed to be interoperable for air components of multi-modal travel packages.*

**[OPENTRAVEL]**  
OpenTravel Alliance  
*OpenTravel Specification*  
Current release  
https://opentravel.org/  
*Informative. OpenTravel defines XML message schemas for travel industry data
exchange. ATOP builds on OpenTravel concepts for activity and accommodation
capability declarations.*

---

### Regulatory References

**[JP-TAA]**  
Government of Japan  
*Travel Agency Act (旅行業法)*  
Act No. 239 of 1952, as amended 2018  
https://elaws.e-gov.go.jp/document?lawid=327AC0000000239  
*Informative. The primary Japanese regulatory framework for travel agency
licensing, referenced in ATOP Jurisdiction Entries (JP).*

**[JP-APPI]**  
Government of Japan  
*Act on the Protection of Personal Information (個人情報の保護に関する法律)*  
Act No. 57 of 2003, as amended 2022  
https://elaws.e-gov.go.jp/document?lawid=415AC0000000057  
*Informative. Japan's primary data protection law. Trust Chain retention
periods for Japanese transactions comply with APPI requirements.*

**[EU-PTD]**  
European Parliament and Council  
*Directive on package travel and linked travel arrangements (Package Travel
Directive)*  
Directive 2015/2302/EU, November 2015  
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32015L2302  
*Informative. The EU package travel consumer protection framework. Defines
packaging obligations and Linked Travel Arrangements referenced in ATOP
Jurisdiction Entries (EU).*

**[EU-GDPR]**  
European Parliament and Council  
*General Data Protection Regulation*  
Regulation 2016/679, April 2016  
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679  
*Informative. EU data protection regulation. ATOP Trust Chain archival and
Party Registry data handling must comply with GDPR for EU-jurisdiction transactions.*

**[EU-AIACT]**  
European Parliament and Council  
*Regulation on Artificial Intelligence (AI Act)*  
Regulation 2024/1689, June 2024  
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689  
*Informative. The EU AI regulatory framework. ATOP's Agentic Authorization
Framework is designed to be consistent with EU AI Act human oversight requirements
(Article 14) regardless of final risk classification for travel AI systems.*

**[GB-PTL]**  
UK Government  
*Package Travel and Linked Travel Arrangements Regulations 2018*  
SI 2018/634  
https://www.legislation.gov.uk/uksi/2018/634  
*Informative. UK package travel regulations (PTD retained post-Brexit).
Referenced in ATOP Jurisdiction Entries (GB).*

**[US-CA-SOT]**  
State of California  
*Sellers of Travel Law*  
California Business & Professions Code § 17550 et seq.  
https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=17550  
*Informative. California Seller of Travel registration requirement, the most
significant US state travel regulation referenced in ATOP Jurisdiction Entries (US).*

---

### Prior Art and Related Work

**[OIDF-EUDI]**  
OpenID Foundation  
*Interoperability Report: OpenID Federation at the European Digital Identity
Wallet Interoperability Event*  
March 2025  
https://openid.net/  
*Informative. Demonstrates OpenID Federation interoperability across European
identity ecosystems, validating the maturity of the federation mechanism ATOP
adopts.*

**[FAPI-ECOSYSTEMS]**  
OpenID Foundation — Financial-grade API Working Group  
*FAPI 2.0 Implementer's Guide: Real-World Ecosystems*  
2024  
https://openid.net/specs/fapi-2_0-security-profile.html  
*Informative. Documents real-world FAPI 2.0 deployments in Open Banking (UK,
Brazil, Australia), healthcare, and energy — validating the security profile
ATOP adopts for travel.*

---

*Document status: v0.1 — March 2026*  
*Maintained by: ATOP Protocol — github.com/atop-protocol*  
*License: Apache 2.0*  
*Updates: References are updated as new versions of cited standards are published.
Version increments follow ATOP semantic versioning rules.*
