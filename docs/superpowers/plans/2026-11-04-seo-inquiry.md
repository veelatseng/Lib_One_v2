# SEO and Static Inquiry Implementation Plan

> **For agentic workers:** Use verification-before-completion and a reviewer for the final patch. The user has approved implementation and PR creation; continue through validation and PR submission.

**Goal:** Implement the four confirmed Veela issues and the two SEO/AI content improvements while retaining a static site.

**Architecture:** Static HTML remains the delivered website. Small browser code prepares an Email draft and a copy fallback. Cloudflare asset redirect rules and a separate documented edge HTTPS rule consolidate URLs without assuming an undocumented backend.

**Tech Stack:** HTML, vanilla JavaScript, SCSS; Node built-in tests and static preview/build tools; Sass for CSS compilation only.

## Chunk 1: Implementation and review

- [x] Establish baseline: original `js/site.js` syntax and all 15 JSON-LD blocks parse.
- [x] Add failing `tests/site.test.mjs` covering canonical/sitemap/links/schema/inquiry/content invariants and `tests/contact.test.mjs` covering Email encoding, subject injection prevention and allowlisted product preselection.
- [x] Update 15 HTML pages, `js/data.js`, `js/site.js`; add `js/contact.js`; repair product introduction; add three selection/FAQ sections and homepage brand explanation.
- [x] Add `sitemap.xml`, `_redirects`, `deploy/cloudflare-https-redirect.json` and deployment instructions preserving existing rules; do not execute remote changes.
- [x] Add SCSS source, compile CSS, and provide `scripts/build.mjs` and `scripts/preview.mjs` without production dependencies.
- [x] Run all tests and build, verify output contains only public assets, exercise local routes and browser flows, review patch and correct findings.
- [ ] Recheck upstream main, create a dedicated remote branch and PR through the connected GitHub tools. Report actual PR URL and the hosting rule application requirement.

## Acceptance details

- 15 indexable canonical pages, 13 product inquiry links, exactly 13 product checkboxes; no `.html` destinations in served internal navigation.
- Semantic organization/brand references and absolute product/image identifiers; no invented offers/reviews.
- Three pilot products expose visible comparison and at least three answerable FAQs each.
- Valid inquiry prepares mail to the existing service address; untrusted text cannot alter the recipient or add subject headers; unknown product query values do not create controls or selections.
- Copy fallback preserves all values and never says that an Email was sent.
- Old page aliases redirect permanently; local preview retains 404 for nonexistent pages and does not publish repository internals.
- No production deployment, infrastructure mutation or real Email delivery is performed by PR creation.
