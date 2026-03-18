import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'Activity Travel Protocol',
  description: 'Open specification for activity travel booking interoperability',
  base: '/',
  themeConfig: {
    siteTitle: 'Activity Travel Protocol',
    nav: [
      { text: 'Specification', link: '/spec/architecture' },
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
