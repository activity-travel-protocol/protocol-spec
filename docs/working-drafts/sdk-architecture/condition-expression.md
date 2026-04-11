# ATP Condition Expression Syntax v1

*SDK Architecture Blueprint · Section 7 · OQ-AS-1 Resolution*

[← Fletcher Embassy](security-fletcher) · [Category Registry →](category-registry)

## 7. ATP Condition Expression Syntax v1 — Full Grammar (OQ-AS-1)

### 7.1 Background

The ATP Condition Expression Syntax is used in the PricingRule fragment
(Fragment 14) to express conditions that reference Collection and
Configuration schema fields. Session 3.5 defined the v1 syntax
informally with worked examples. OQ-AS-1 deferred the full grammar and
parser specification to Session 7.

The syntax is intentionally narrow. It is not a general-purpose
expression language. It is constrained to the field reference and
comparison cases required by the Activity Configuration Schema Starter
Catalogue. This constraint is a deliberate design decision: AI agents
must be able to evaluate conditions reliably without ambiguity, and the
grammar must be implementable by a simple recursive-descent parser.

### 7.2 Grammar (EBNF)

+-----------------------------------------------------------------------+
| (\* ATP Condition Expression Syntax v1 — EBNF \*)                   |
|                                                                       |
| expression ::= or_expr ;                                              |
|                                                                       |
| or_expr ::= and_expr ( 'OR' and_expr )\* ;                          |
|                                                                       |
| and_expr ::= not_expr ( 'AND' not_expr )\* ;                        |
|                                                                       |
| not_expr ::= 'NOT' not_expr \| comparison ;                         |
|                                                                       |
| comparison ::= field_ref operator literal                             |
|                                                                       |
| \| field_ref 'IN' '\[' literal_list '\]' ;                      |
|                                                                       |
| field_ref ::= segment ( '.' segment )\* ;                           |
|                                                                       |
| segment ::= identifier \| 'participant' \| 'collection' ;         |
|                                                                       |
| identifier ::= \[a-zA-Z\_\]\[a-zA-Z0-9\_\]\* ;                        |
|                                                                       |
| operator ::= '==' \| '!=' \| '\>' \| '\<' \| '\>=' \|       |
| '\<=' ;                                                             |
|                                                                       |
| literal ::= string_literal \| number_literal \| boolean_literal \|    |
| enum_literal ;                                                        |
|                                                                       |
| string_literal ::= '"' \[\^"\]\* '"' ;                         |
|                                                                       |
| number_literal ::= '-'? \[0-9\]+ ( '.' \[0-9\]+ )? ;              |
|                                                                       |
| boolean_literal ::= 'true' \| 'false' ;                           |
|                                                                       |
| enum_literal ::= identifier ; (\* uppercase by convention \*)         |
|                                                                       |
| literal_list ::= literal ( ',' literal )\* ;                        |
|                                                                       |
| (\* Whitespace is insignificant and ignored between tokens. \*)       |
|                                                                       |
| (\* Keywords: AND OR NOT IN true false — case-sensitive, uppercase. |
| \*)                                                                   |
+-----------------------------------------------------------------------+

**Decision CES-1 (CLOSED):** The ATP Condition Expression Syntax v1
grammar is as specified above. The grammar is normative for all
PricingRule condition fields in the Activity Configuration Schema. The
parser MUST reject any expression that does not conform to this grammar.

### 7.3 Field Reference Semantics

Field references use dot notation to navigate the schema hierarchy. The
following prefixes are defined:

  **Prefix**                       **Resolves to**

  collection.participant.{field}   Each participant in the booking Collection. When
                                   evaluated against a multi-participant
                                   collection, the condition is true if ANY
                                   participant satisfies it (existential
                                   quantification).

  collection.{field}               Top-level Collection fields (e.g.
                                   collection.group_size).

  configuration.{field}            Configuration-layer fields for the activity.

  capability.{field}               Capability-layer fields (read-only in pricing
                                   context).

Absent fields evaluate to null. A comparison with a null field always
evaluates to false. Parsers MUST NOT throw on absent fields — they
MUST evaluate the condition as false.

### 7.4 Worked Examples

Ski instructor fee trigger (from Starter Catalogue SKI_ALPINE):

+-----------------------------------------------------------------------+
| collection.participant.skill_domain == SKIING                         |
|                                                                       |
| AND collection.participant.self_assessed_level IN \[NEVER, BEGINNER\] |
|                                                                       |
| AND collection.participant.instructor_requested == true               |
+-----------------------------------------------------------------------+

Tall child adult-gear surcharge:

+-----------------------------------------------------------------------+
| collection.participant.height_cm \>= 150                              |
|                                                                       |
| AND collection.participant.age_band == CHILD                          |
+-----------------------------------------------------------------------+

Group size minimum for private tour:

  -----------------------------------------------------------------------
  collection.group_size \< configuration.min_private_group_size

  -----------------------------------------------------------------------

These examples cover all comparison and IN-list cases in the Starter
Catalogue. The grammar is sufficient for all v1.0 PricingRule cases.
OQ-AS-1 is resolved.

### 7.5 Parser Specification

The @atp/core package exports a reference parser:

+-----------------------------------------------------------------------+
| // @atp/core — Condition Expression parser                         |
|                                                                       |
| export function parseConditionExpression(source: string):             |
| ConditionExpression;                                                  |
|                                                                       |
| export function evaluateConditionExpression(                          |
|                                                                       |
| expr: ConditionExpression,                                            |
|                                                                       |
| context: ConditionEvaluationContext                                   |
|                                                                       |
| ): boolean;                                                           |
|                                                                       |
| export interface ConditionEvaluationContext {                         |
|                                                                       |
| collection: CollectionRecord;                                         |
|                                                                       |
| configuration: ConfigurationRecord;                                   |
|                                                                       |
| capability: CapabilityRecord;                                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| // Thrown by parseConditionExpression on grammar violation            |
|                                                                       |
| export class ConditionExpressionParseError extends ATPError {         |
|                                                                       |
| source: string; // Original expression string                         |
|                                                                       |
| position: number; // Character position of error                      |
|                                                                       |
| expected: string; // What the parser expected                         |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**Decision CES-2 (CLOSED):** The Condition Expression parser is part of
@atp/core (zero external dependencies). It is a recursive-descent
parser. The parser is the normative reference implementation. Any
ATP-compatible implementation that evaluates PricingRule conditions MUST
produce results identical to this parser for all conforming expressions.

**Decision CES-3 (CLOSED):** The Condition Expression Syntax is
versioned independently of the protocol. The v1 grammar is frozen at
publication. New operators or field reference patterns require a v2
grammar. The @atp/core parser exports a version string
("atp-ces/1.0") that implementations MUST include in interop test
results.

### 7.6 OQ-AS-1 — Resolution

+-----------------------------------------------------------------------+
| **DECISION OQ-AS-1 — RESOLVED (CLOSED)**                            |
|                                                                       |
| **ATP Condition Expression Syntax v1 — full grammar and parser      |
| specification.**                                                      |
|                                                                       |
| RESOLVED. The full EBNF grammar is specified in Section 7.2. Field    |
| reference semantics are specified in Section 7.3. The reference       |
| parser is exported from @atp/core as parseConditionExpression and    |
| evaluateConditionExpression. Three decisions closed: CES-1 through    |
| CES-3. The v1 grammar is sufficient for all Starter Catalogue         |
| PricingRule cases.                                                    |
+-----------------------------------------------------------------------+
