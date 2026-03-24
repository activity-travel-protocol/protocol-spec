import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'Activity Travel Protocol',
  description: 'Open specification for activity travel booking interoperability',
  base: '/',
  themeConfig: {
    siteTitle: 'Activity Travel Protocol',
    nav: [
      { text: 'Specification', link: '/spec/architecture' },
      { text: 'Layer 2', link: '/layer2/' },
      { text: 'Layer 3', link: '/layer3/' },
      { text: 'Working Drafts', link: '/working-drafts/index' },
      { text: 'Standards Positions', link: '/positions/standards-landscape' },
      { text: 'Resources', items: [
        { text: 'References', link: '/spec/references' },
        { text: 'Charter', link: '/spec/CHARTER' },
        { text: 'GitHub', link: 'https://github.com/activity-travel-protocol/protocol-spec' }
      ]}
    ],
    sidebar: {
      '/spec/': [{ text: 'Specification', items: [
        { text: 'Architecture', link: '/spec/architecture' },
        { text: 'Trust Chain', link: '/spec/trust-chain' },
        { text: 'Party Registry', link: '/spec/party-registry' },
        { text: 'Party Policy Declarations', link: '/spec/party-policy-declarations' },
        { text: 'Jurisdiction Entries', link: '/spec/jurisdiction-entries' },
        { text: 'Jurisdiction Compliance', link: '/spec/jurisdiction-compliance-spec' },
        { text: 'Jurisdiction Discussion', link: '/spec/jurisdiction-discussion-paper' },
        { text: 'References', link: '/spec/references' },
        { text: 'Charter', link: '/spec/CHARTER' }
      ]}],
      '/layer2/': [{ text: 'Layer 2 — Discovery and Capability', items: [
        { text: 'S0 — Index and Introduction', link: '/layer2/layer2-s0' },
        { text: 'S1 — Purpose and Scope', link: '/layer2/layer2-s1' },
        { text: 'S2 — Normative References', link: '/layer2/layer2-s2' },
        { text: 'S3 — Capability Declaration', link: '/layer2/layer2-s3' },
        { text: 'S4 — Party Discovery', link: '/layer2/layer2-s4' },
        { text: 'S5 — Pre-Arrangement Protocol', link: '/layer2/layer2-s5' },
        { text: 'S6 — Pre-Arrangement Declaration', link: '/layer2/layer2-s6' },
        { text: 'S7 — Feasibility Check Operation', link: '/layer2/layer2-s7' },
        { text: 'S8 — Capability Catalogue', link: '/layer2/layer2-s8' },
        { text: 'S9 — Live Availability', link: '/layer2/layer2-s9' },
        { text: 'S10 — AI Agent Participation', link: '/layer2/layer2-s10' },
        { text: 'S11 — Multi-Party Discovery', link: '/layer2/layer2-s11' },
        { text: 'S12 — Design Rules Compliance', link: '/layer2/layer2-s12' },
        { text: 'Appendix A — Standards Bridge', link: '/layer2/layer2-appendix-a' }
      ]}],
      '/layer3/': [{ text: 'Layer 3 — Workflow', items: [
        { text: 'Overview', link: '/layer3/' },
        { text: '1 — Purpose and Scope', link: '/layer3/purpose-and-scope' },
        { text: '2 — Normative References', link: '/layer3/normative-references' },
        { text: '3 — Booking States', link: '/layer3/booking-states' },
        { text: '4 — Journey Phases', link: '/layer3/journey-phases' },
        { text: '5 — BOOKING_SUSPENDED', link: '/layer3/booking-suspended' },
        { text: '6 — HEM Catalogue', link: '/layer3/hem-invocation-catalogue' },
        { text: '7 — TRAVELER_UNREACHABLE', link: '/layer3/traveler-unreachable' },
        { text: '8 — Disruption Handling', link: '/layer3/disruption-handling' },
        { text: '9 — AI Agent Participation', link: '/layer3/ai-agent-participation' },
        { text: '10 — Named Protocol Events', link: '/layer3/named-protocol-events' },
        { text: '11 — Timeout Budget', link: '/layer3/timeout-budget' },
        { text: '12 — Multi-Party Coordination', link: '/layer3/multi-party-coordination' },
        { text: '13 — Open Questions', link: '/layer3/open-questions' },
        { text: '14 — Design Rules Compliance', link: '/layer3/design-rules-compliance' },
        { text: 'Appendix A — Decision Types', link: '/layer3/appendix-decision-types' },
        { text: 'Appendix B — State Transitions', link: '/layer3/appendix-state-transitions' },
        { text: 'Appendix C — BPMN Notation', link: '/layer3/appendix-bpmn-notation' }
      ]}],
      '/working-drafts/': [{ text: 'Working Drafts', items: [
        { text: 'Index', link: '/working-drafts/index' },
        { text: 'Pre-Layer 3 Review', link: '/working-drafts/pre-layer3-review' },
        { text: 'Security Architecture', link: '/working-drafts/security-architecture' },
        { text: 'Context Package', link: '/working-drafts/context-package' },
        { text: 'Context Package — Design Rationale', link: '/working-drafts/context-package-design' }
      ]}],
      '/positions/': [{ text: 'Standards Positions', items: [
        { text: 'Standards & Interoperability Map', link: '/positions/standards-landscape' }
      ]}]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/activity-travel-protocol/protocol-spec' }
    ],
    footer: {
      message: 'Activity Travel Protocol — Open Specification',
      copyright: 'Released under Creative Commons Attribution 4.0'
    },
    editLink: {
      pattern: 'https://github.com/activity-travel-protocol/protocol-spec/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
