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

**Track pass** — Craft and Demos became black pages with dark chrome, Engineering stayed paper with no dark instruments, and the home live band split into a paper Engineering preview and an ink Craft preview. The UML demo moved to `/demos`.

**Single page** — The site collapsed to one scroll with anchor navigation, inline case studies, demos and project blocks, dates and context on every demo, background fades between paper and ink, a section rail, sticky section heads, scroll-drawn line art and lazy-mounted demos. Old routes redirect to anchors.

**Collapsible pass** — Case studies and project blocks collapsed to thumbnail rows with one-line descriptions; demos remain open; anchors open the target item.

**Systems and polish pass** — The demo stage paper edge was removed, diagrams moved to their own Systems section with a nav entry, and the scroll gained Lenis smoothing, ghost words, view-timeline titles and animated rules.

**Electronics pass** — Added the HKSTP intern medallion to Craft with a FreeCAD assembly viewer, KiCad and manufacturing detail, and the same record in the career catalog.

**Frame pass** — Interactive demos keep the paper frame; 3D work now sits in a technical model plinth with grid, corner marks, CAD label and dimensions.

**Plate pass** — Demo frames became light catalogue plates with numbered tabs and paper mats, while 3D work kept the dark technical plinth. Hydration mismatches from hash-open and pre-hydration track attributes were removed.

**Verification** — `npm run typecheck` PASS. `npm run build` PASS, prerendering `/`, `/engineering`, `/craft`, `/about`, `/contact`, `/projects`, the three case pages and five craft pages, then writing the SPA fallback and `404.html`. Manual visual checks at 1440px and 390px. Independent review returned no remaining critical or major issues after fixes for the duplicate H1, link names, duplicate Eccentricity page, redirect metadata and data-derived prerender slugs.

## [S1] Problem

The current site is a four-route project gallery. It carries eight projects, no experience section, no case studies, no CV download, and a bio that still describes the author as bridging hardware and software. The strongest current work is either absent or unreadable to a recruiter, Ocelli is presented as a headline project although it is a concept, and the site speaks to neither audience clearly.

The rebuild presents one builder through two tracks, Engineering and Craft, using public evidence only. Client engagements appear as role lines, never as case studies.

## [S2] Design

### S2.1 Routes and information architecture

The site is one page. `/` carries every section in one scroll:

| Anchor | Content |
|---|---|
| `#engineering` | Paper section: positioning, PDSS and GGJHK case studies inline, experience, capabilities, current role. |
| `#craft` | Ink section: Eccentricity, four demos inline (CPU, gesture, ML, CNN), project blocks, chronology. |
| `#systems` | Ink section: the two architecture diagrams, separated from the interactive demos. |
| `#demos` | Ink section: index of the interactive demos, the UML generator and the 3D gallery. |
| `#about` | Paper section: bio, facts, trajectory. |
| `#contact` | Paper section: email, LinkedIn, GitHub, CV. |

Navigation is anchor based. Any old URL (`/engineering`, `/craft`, `/demos/:slug`, `/engineering/case/:slug`, `/projects/...`) is handled by the catch-all route, which redirects to the matching anchor. There are no detail routes. Prerender is `/` only; the sitemap lists only `/`.

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

### S2.10 Track themes

The site is now themed by track, not by section.

- Engineering pages are paper: paper ground, ink type, light callout panels.
- Craft and the demos section are ink: black page, paper type, dark instruments, dark header, subnav and footer.
- The theme is set as `data-track` on the document element before paint by an inline script, then maintained by the layout, so there is no light flash on a dark page.
- The home page stays neutral but its live band is split: a paper Engineering panel and an ink Craft panel, each carrying a preview rather than one dark box on a light page.
- Engineering no longer embeds dark instruments. The UML demo lives at `/demos/uml-generator`, linked from Engineering; its callout and the diagram links stay on paper.

### S2.11 Dates and context

Every demo and project carries a year and a context line, rendered in the frame and the index. The UML generator, for example, is labelled 2025 with a note that iterative LLM diagramming was novel then and the interaction matters more than the generation now. Case studies carry their period; project blocks carry their year.

### S2.12 Scroll-driven decoration

- Section rail is a numbered chapter index on a continuous progress spine, with labels always visible and the active row marked in ember. It is driven by IntersectionObserver and reserves a 200px right margin on wide screens.
- Header switches to dark styling over ink sections, and the progress line tracks the whole page.
- Section heads stick flush under the 64px header while their section scrolls, with the same background colour so there is no visible seam.
- Line art draws on entry via `stroke-dashoffset` when it enters view.
- The whole page background interpolates between paper and ink across tall empty gaps between tracks, computed from scroll position. There are no gradient bands, so the colour changes continuously and never cuts across content.
- Demo blocks mount only when within 500px of the viewport, so a 20,000px page does not boot every instrument at once.

### S2.14 Systems and demo surfaces

- The two reference diagrams live in their own `#systems` section with a heading, ghost word and reference framing. They are not part of the demo rack.
- Demo stages use fixed ink and paper surfaces rather than the inverted page variables. The stage previously inherited `--ink` from the dark section and painted a paper border around every instrument.
- The demo index now lists the interactive demos and the 3D gallery; diagram cards link to Systems.

### S2.15 Scroll feel

- Lenis smooth scrolling, with a custom anchor handler that opens a collapsed case or project before scrolling to it.
- Oversized outlined ghost words in section heroes drift against the scroll.
- Section titles arrive with a view-timeline reveal; the section rule draws itself with a view timeline.
- Navigation underlines animate on hover and active state; thumbnails scale on hover; demo card arrows slide.
- Reduced-motion disables smooth scroll, ghost drift and title animation.

### S2.13 Collapsible long-form items

Case studies and project blocks are collapsed by default:

- A compact row with a thumbnail, title, one-line description and a meta line.
- A Read case or Open control expands the full body in place.
- Anchor links (`#case-pdss`, `#project-binmin`) open the matching item automatically.
- Demos are never collapsed. They stay open in Craft and Demos because they are the point of the page.

### S2.16 Electronics entry

The HKSTP intern gift is a Craft project entry:

- 2024, KiCad-designed and manufactured 63mm circular ESP32 board with a TLC59116 16-channel LED driver.
- FreeCAD-modelled chassis, 3D printed in resin and metal, plus a Flutter BLE controller for appreciation and clock screens.
- The project viewer supports STL directly and uses the full FreeCAD assembly export with a solid, double-sided material rather than the wireframe treatment used for stylised models.
- 3D work sits in a distinct `ModelFrame`: model label and format in a top bar, a gridded stage with corner registration marks and a vertical CAD label, and a footer with dimensions and rotation state. It is deliberately not the paper DemoFrame used for interactive demos.
- Collapsed row carries the one-line summary and tags; expanded body carries the technical detail and the rotating chassis.

### S2.17 Demo plate

The demo frame is now a light catalogue plate, deliberately unlike the dark model plinth:

- Cream paper card, numbered index tab, title, year and a pulsing LIVE marker.
- Description and dated context in the header, with a thin rule before the context.
- The screen sits inside a paper mat with a dark viewport, so the instrument reads as a plate rather than a dark panel.
- Footer carries the browser note on the left and the related link and Expand on the right.
- Models keep the dark `ModelFrame` with grid, corner marks, CAD label and dimensions.

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
- [x] T31: Demo plate — acceptance: demos use a light catalogue plate distinct from the model frame. (covers: S2.17)
- [x] T30: Model frame — acceptance: 3D work has a technical plinth frame distinct from demo frames. (covers: S2.16)
- [x] T29: Electronics entry — acceptance: the HKSTP medallion is a Craft project with CAD visual and manufacturing detail. (covers: S2.16)
- [x] T28: Chapter rail — acceptance: labels and numbers are always visible on a progress spine, with no dot constellation and no content overlap. (covers: S2.12)
- [x] T26: Systems section — acceptance: diagrams have their own section and nav item, separate from demos. (covers: S2.14)
- [x] T27: Smooth scroll and motion — acceptance: Lenis scrolling, anchor opening, ghost words and view-timeline titles work. (covers: S2.15)
- [x] T25: Collapsible case studies and projects — acceptance: compact rows expand in place and anchors open the target. (covers: S2.13)
- [x] T21: Single-page scroll — acceptance: one route carries every section and anchors navigate. (covers: S2.1)
- [x] T22: Demo dates and context — acceptance: every demo shows a year and a context line. (covers: S2.11)
- [x] T23: Scroll decoration — acceptance: rail, sticky heads, drawing line art and fades work during scroll. (covers: S2.12)
- [x] T24: Legacy redirects — acceptance: old URLs land on the matching anchor. (covers: S2.1)
- [x] T18: Track themes — acceptance: `/craft` and `/demos` render black, `/engineering` renders paper, header and footer follow the track. (covers: S2.10)
- [x] T19: Home preview split — acceptance: the live band has a paper Engineering panel and an ink Craft panel. (covers: S2.10)
- [x] T20: Engineering stays light — acceptance: no dark demo stage appears on `/engineering`; demos are linked to `/demos`. (covers: S2.10)
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
- 2026-11-09: Human review asked for black or white pages by track and updated home previews. Craft and Demos are now black, Engineering paper, and the home live band is split.
- 2026-11-09: Final structure review asked for one page, dates on demos, and scroll-driven decoration. The site is now a single scroll with anchors, inline detail, fades, a rail and lazy demos.
