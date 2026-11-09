---
feature: portfolio-rebuild
status: delivered
updated: 2026-11-09
source: feat/portfolio-v2
---

# Portfolio Rebuild

## Report

**What was built** — A static portfolio with a split chooser, two single-scroll tracks (Engineering and Craft), three public case studies (PDSS, GGJHK platform, Eccentricity), six craft project pages, About, Contact with a downloadable CV, legacy redirects, per-route meta with canonical and OG image, and a sitemap. Interactive demos stay on MUI and are mounted in a scoped dark theme inside the paper site.

**Second pass** — After review, demos were restored as first-class content, the header gained scroll state, progress and a mobile menu, each track gained a sticky subnav with scrollspy, the home page gained Live, Selected work and From craft bands, and the tracks now cross-link with a page transition.

**Demo pass** — Demos gained a paper frame with an ink stage, brand typography and ember accents; a `/demos` index and detail routes expose eight experiences, including the CNN visualiser and a 3D model gallery that were previously unreachable.

**Verification** — `npm run typecheck` PASS. `npm run build` PASS, prerendering `/`, `/engineering`, `/craft`, `/about`, `/contact`, `/projects`, the three case pages and five craft pages, then writing the SPA fallback and `404.html`. Manual visual checks at 1440px and 390px. Independent review returned no remaining critical or major issues after fixes for the duplicate H1, link names, duplicate Eccentricity page, redirect metadata and data-derived prerender slugs.

## [S1] Problem

The current site is a four-route project gallery. It carries eight projects, no experience section, no case studies, no CV download, and a bio that still describes the author as bridging hardware and software. The strongest current work is either absent or unreadable to a recruiter, Ocelli is presented as a headline project although it is a concept, and the site speaks to neither audience clearly.

The rebuild presents one builder through two tracks, Engineering and Craft, using public evidence only. Client engagements appear as role lines, never as case studies.

## [S2] Design

### S2.1 Routes and information architecture

| Route | Purpose |
|---|---|
| `/` | Chooser. Landscape: 50/50 vertical split, Engineering on paper left, Craft on ink right. Portrait: stacked, Engineering first. Each half has a glyph plate, one-line proposition, a work preview and an enter affordance. No numbers. |
| `/engineering` | Single scroll: positioning, current role, role timeline, two case study cards (PDSS, GGJHK), capability summary, CV call to action. |
| `/engineering/case/:slug` | Case study pages for PDSS and the GGJHK platform. |
| `/craft` | Single scroll: creative positioning, project chronology, Eccentricity feature, 8-bit computer and Binmin project cards, interactive demos. |
| `/craft/:slug` | Project pages for Eccentricity, 8-bit computer, Binmin and other public craft work. |
| `/about` | Bio, four-era trajectory, languages, contact links. |
| `/contact` | Email, LinkedIn, GitHub, CV download. |

Legacy `/projects` and `/projects/:slug` redirect to the nearest new route. `react-router.config.ts` prerender list includes every new static route; case and project slugs are generated from data.

### S2.2 Chooser behaviour

Both paths are visible before any click. The Engineering preview shows the current role and the engagement shape, without client detail. The Craft preview shows Eccentricity and its Steam state. Hover or focus raises one half and lowers the other slightly. Keyboard order is Engineering then Craft. On portrait each half is at least 54svh; on small screens each becomes a full-width card with a preview and a 44px target.

The centre seam is a hairline with a node at the top rule. It draws downward on load, then each half's line art strokes on. Reduced motion renders the static composition.

### S2.3 Visual system

Pathways, grotesk only. No serif, no metric strip, no full-bleed orange.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F2EFE9` | Engineering ground, cards, reading surfaces |
| `--paper-2` | `#F8F5F0` | Case-study surfaces |
| `--ink` | `#151412` | Craft ground, text on paper, line art |
| `--accent` | `#C2542D` | Rules, labels, seam, hover, diagram strokes |
| `--muted` | `#8B8579` | Metadata, secondary captions |

Type: Archivo 700 to 900 for display, uppercase with tight tracking; Inter for body at 15 to 18px; JetBrains Mono for labels at 10 to 11px uppercase with wide tracking. Hierarchy comes from scale and letterspacing, never from colour.

Structure: 1px rules, numbered sections, corner arrows, an index rail on wide screens, and asymmetric line-art diagrams that bleed off the edge. Ink line art on paper, paper line art on ink, accent for active strokes.

### S2.4 Proof and content model

Artefact-led. Every project leads with its strongest evidence: a demo, screenshot, diagram, code excerpt or test output. Numbers appear only as captions next to evidence, inside a case study, never as a standalone band and never on the chooser.

Case studies: PDSS, GGJHK platform, Eccentricity. Project pages: 8-bit computer, Binmin, gesture installation, selected prototypes. Client work (Deloitte engagement, Maxims, VR commission, Kowloon Medley) does not appear beyond the Deloitte role line. No client names, sectors, vendors, system names, screenshots or org data anywhere.

`app/data/` gains `roles.ts`, `caseStudies.ts` and a revised `projects.ts`. Each entry records `visibility: public`, and the NDA rule is encoded as a lintable convention: no client-identifying strings in `app/data`.

### S2.5 Motion

IntersectionObserver reveals, not a scroll hijack. SVG strokes draw on with `stroke-dashoffset`. Numbered sections count once. Connector paths animate between nodes. Ghost outline words parallax at a low factor. All content is visible without JavaScript and with reduced motion.

### S2.6 SEO and delivery

Port the uncommitted `phase0-credibility` work: `app/lib/meta.ts`, OG image, favicons, `robots.txt`, `sitemap.xml`, canonical and social tags per route. Static deploy stays GitHub Pages; `postbuild` keeps the 404 fallback. No SSR.

### S2.8 Second pass after review

The first delivered pass under-used the demo material and left navigation and cohesion weak. This pass adds:

- A scroll-aware header: condensed state after scrolling, a reading-progress line, and a mobile menu instead of hidden links.
- A sticky track subnav with scrollspy on Engineering and Craft.
- Demos as first-class content: CPU simulator, gesture recognition and ML playground on Craft; UML generator on Engineering; diagram panels in Capabilities; 3D model viewers on Craft project pages; CPU and gesture previews on the home page.
- A home page that continues below the chooser: Live demos, Selected work, From craft and a contact cross-link.
- Cross-links between tracks and a page transition on route change.

### S2.9 Demo system

Demos are promoted to a first-class system rather than black boxes inside paper pages.

- `DemoFrame`: paper frame with eyebrow, title, description, related link, expand control and an ink stage. Expand pins the demo to the viewport and Escape closes it.
- `demoTheme` now uses the site's type system and ember accent instead of cyan and Fira Code; hardcoded neon accents in the demos were replaced with ember, while semantic signal colours (green, red, violet, amber) remain.
- `/demos` is an index of eight entries: CPU simulator, gesture recognition, UML generator, ML playground, CNN visualiser, service architecture, hardware pipeline and a 3D model gallery.
- `/demos/:slug` mounts one demo per page with its own metadata; contextual embeds stay on Engineering and Craft.
- The ML playground's two tabs (digit recognition and 2D training) share one entry; the architecture and hardware explainers behind the demos remain inside their instruments.

### S2.7 Performance and accessibility

Demos stay lazy-loaded and mount only when visible. Fonts are self-hosted and subset. Targets: Lighthouse performance 90+ on both landings, no layout shift from fonts, 4.5:1 body contrast, visible focus rings, skip link, semantic heading order, keyboard-operable chooser.

## [S3] Out of scope

CMS, blog, authentication, newsletter, multilingual UI, redesign of demo internals, any backend beyond the existing Supabase proxy, client case studies, and any client-identifying content.

## Tasks

- [x] T11: Scroll-aware nav and mobile menu — acceptance: header condenses, progress line tracks scroll, mobile menu opens with links. (covers: S2.8)
- [x] T12: Track subnav with scrollspy — acceptance: anchors jump with sticky offset and the active section follows scroll. (covers: S2.8)
- [x] T13: Demos restored — acceptance: CPU, gesture, ML, UML, diagrams and 3D models render on the site. (covers: S2.8)
- [x] T15: Demo frame and brand tokens — acceptance: demos render inside a paper frame with an ink stage and ember accents; expand works. (covers: S2.9)
- [x] T16: Demo index and detail pages — acceptance: `/demos` lists eight entries and each detail page mounts its demo. (covers: S2.9)
- [x] T17: Missing demos restored — acceptance: CNN visualiser, model gallery and ML tabs are reachable. (covers: S2.9)
- [x] T14: Home and cross-track cohesion — acceptance: home has Live, work and craft bands; each track links to the other. (covers: S2.8)

- [x] T1: Style tiles, exploration — five directions built and reviewed; Pathways selected, Engineering/Craft names settled, serif and metric strip rejected. (covers: S2.3)
- [x] T2: Design tokens and theme foundation — acceptance: paper, ink, ember and type tokens exist as CSS variables and MUI theme values; no serif in the bundle. (depends: T1)
- [x] T3: Routes, prerender list and chooser — acceptance: `/` splits on landscape and stacks on portrait, both halves link correctly, keyboard order is Engineering then Craft, and no numbers appear. (depends: T2)
- [x] T4: Engineering landing — acceptance: positioning, current role, role timeline, two case study cards, capability summary and CV CTA render from data on one scroll. (depends: T2)
- [x] T5: Craft landing — acceptance: chronology, Eccentricity feature, project cards and demos render; demos mount only when in view. (depends: T2)
- [x] T6: Case study template and three case studies — acceptance: PDSS, GGJHK and Eccentricity pages are prerendered, artefact-led, with numbers only as captions. (depends: T3)
- [x] T7: About, contact and CV download — acceptance: bio reframed, trajectory renders, CV PDF downloads. (depends: T2)
- [x] T8: SEO, sitemap and redirects — acceptance: legacy `/projects` URLs land on new routes, sitemap lists prerendered pages, OG tags render on every route. (depends: T3)
- [x] T9: Motion and accessibility pass — acceptance: reduced motion disables animation, contrast and focus checks pass, Lighthouse targets met. (depends: T4, T5)
- [x] T10: Verification and review — acceptance: typecheck, production build and prerender output pass; no console errors; independent review complete. (depends: T6, T7, T8, T9)

## Journey log

- 2026-11-09: Four style directions plus a hybrid were built as throwaway tiles. The hybrid's serif was rejected as chaotic; the Work/Lab framing was rejected as implying creative work is a hobby. Tracks renamed Engineering/Craft. Metric strips were rejected as CV material; the site is artefact-led.
- 2026-11-09: Review found a duplicate H1 on the chooser and card-length accessible names. Replaced with a visually hidden H1, H2 per track and `aria-labelledby` links.
- 2026-11-09: `/craft/eccentricity` duplicated the case study. The project route now redirects to the case and is excluded from prerender.
- 2026-11-09: Legacy redirects gained `noindex` and a static meta refresh. Prerender slugs are now derived from data, and unmapped legacy slugs go home rather than to the wrong track.
- 2026-11-09: Contrast pass: ember darkened to `#B04724` on paper, `#D97757` on ink; muted text `#6E675C`; 44px button targets.
- 2026-11-09: Human review found that demos had been cut to two, the nav had no scroll behaviour and mobile links were hidden, and the interior pages lacked cohesion. Restored all demos, added scroll-aware nav and subnav, added home bands and cross-links.
- 2026-11-09: Second demo review found more demos in the codebase and no shared styling. Added DemoFrame, `/demos` index and detail routes, CNN and model gallery entries, and replaced neon accents with ember.
