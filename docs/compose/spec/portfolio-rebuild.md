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

**Frame pass** — Demos became dark screen cards with numbered tabs and full-bleed viewports, while 3D work kept the darker gridded plinth. Hydration mismatches from hash-open and pre-hydration track attributes were removed.

**Architecture pass** — UML now explains the pipeline before the live demo and requires a user-supplied key; Systems leads with a general workflow and presents the diagrams as two artifacts.

**Frame refinement** — Thumbnail frames were reduced to clean paper/dark borders, with a single arc, diagonal and triangle sitting outside and behind them. **Content pass** — Thumbnail mounts were lightened, event roles and PDSS model IDs were corrected, Craft was reframed around fun and usefulness, and the T-shaped model was added to Capabilities. **Ornament pass** — Thumbnail mounts gained thin geometric decoration; project actions and demo distribution were committed in the preceding pass. **Structure pass** — Demos were distributed into Engineering, Craft and Systems, the standalone Demos chapter was removed, and project actions are visible on collapsed rows. **Positioning pass** — The portfolio now leads with generalist breadth and specialist depth, with a six-part capability map and no oversized glyph. All 3D models are bounding-box centred and pulled back, with regenerated thumbnails. Case study rows also received framed, purpose-drawn diagrams.

**Verification** — `npm run typecheck` PASS. `npm run build` PASS, prerendering `/`, `/engineering`, `/craft`, `/about`, `/contact`, `/projects`, the three case pages and five craft pages, then writing the SPA fallback and `404.html`. Manual visual checks at 1440px and 390px. Independent review returned no remaining critical or major issues after fixes for the duplicate H1, link names, duplicate Eccentricity page, redirect metadata and data-derived prerender slugs.

## [S1] Problem

The current site is a four-route project gallery. It carries eight projects, no experience section, no case studies, no CV download, and a bio that still describes the author as bridging hardware and software. The strongest current work is either absent or unreadable to a recruiter, Ocelli is presented as a headline project although it is a concept, and the site speaks to neither audience clearly.

The rebuild presents one builder through two tracks, Engineering and Craft, using public evidence only. Client engagements appear as role lines, never as case studies.

## [S2] Design

### S2.1 Routes and information architecture

The site is one page. `/` carries every section in one scroll:

| Anchor | Content |
|---|---|
| `#engineering` | Paper section: positioning, PDSS and GGJHK cases, experience, capabilities, current role, and a dark instrument bench with the CPU, ML playground, CNN visualiser and UML generator. |
| `#craft` | Ink section: Eccentricity, the gesture installation demo, project blocks, chronology. |
| `#systems` | Ink section: general workflow and the two artifact diagrams. |
| `#about` | Paper section: generalist positioning, facts, trajectory. |
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

- Section rail is a numbered chapter index on a continuous progress spine, with labels always visible and the active row marked in ember. It is driven by IntersectionObserver, reserves a 246px right margin and only appears at 1320px and above.
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

### S2.24 Demo distribution

There is no standalone Demos chapter. Demos live with the discipline they belong to:

- Engineering instruments: CPU simulator, ML playground, CNN visualiser and UML generator (with its architecture walkthrough) in a dark inset bench inside Engineering.
- Craft instrument: gesture recognition installation.
- System artifacts: service architecture and hardware pipeline in Systems.

### S2.25 Project actions

Project rows expose their actions while collapsed: demo, play, report and model. The expand control is a separate button, so links are not nested inside the row toggle. Demo anchors point at the relocated instruments.

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

The demo frame is a dark screen card, deliberately unlike the solid model plinth:

- Warm-black card with a radial ember falloff, a faint 44px grid that fades behind the screen, and an inset shadow. The outline is reduced to a single border and a slim accent rule beside the index, with no corner marks.
- Description and dated context in the header, with a thin rule before the context.
- The screen is full-bleed inside the card, with no paper mat, so the instrument reads as a display rather than a framed print.
- Footer carries the browser note on the left and the related link and Expand on the right.
- Models keep the darker `ModelFrame` with a gridded stage, corner marks, CAD label and dimensions. The distinction is structural: flat screen card versus technical plinth.

### S2.18 UML architecture and bring-your-own-key

- The shared free-model proxy is retired. Setup no longer offers free models; it requires an OpenAI-compatible endpoint, an API key and a model id, with OpenRouter as the default endpoint and `openai/gpt-4o-mini` as the default model.
- Requests go directly from the browser to the configured endpoint. PlantUML's public renderer only sees encoded diagram source.
- The pipeline is explained on the page before the live demo: input, prompt, model, parse, encode, render, with a trust-boundary note and the exact output contract.
- The internal How It Works walkthrough remains available inside the demo.

### S2.19 Workflow before artefacts

The Systems section now leads with a generalized five-step workflow: Frame, Model, Build the narrow path, Verify, Operate and hand over. The two diagrams are presented afterwards as **Artifacts** from that path, explicitly described as examples rather than a taxonomy of the work.

### S2.20 Model thumbnails

Collapsed project rows now use stills rendered from the same 3D models as the expanded `ModelFrame`:

- Seven 480x300 PNGs in `public/thumbs`, captured from the live viewer with per-model camera zoom.
- Thumbnails sit in a framed 210x144 plate with the model frame's radial falloff, a faint 26px grid and an inset edge, separated from the copy by 32px.
- The saved images are static by default, so the list does not mount WebGL for every row.
- Hovering or focusing a row swaps that thumbnail for a live rotating viewer, one context at a time. Expanding a row opens the full model plinth.
- The generic `LineArt` variant remains as a fallback when a project has no model thumbnail.

### S2.21 Positioning

The portfolio is positioned around **generalist with a specialization**, not AI engineer:

- Engineering hero: "Broad by default. Deep where it matters."
- Copy names product, software, hardware and research, with AI and ML as the specialization rather than the identity.
- Six capability blocks: product and delivery, software, AI and ML, systems and infrastructure, hardware and interaction, research and communication. Each carries a Range, Depth or Specialization tag.
- The oversized connector glyph was removed; the section is text and grid, not decoration.
- About and meta copy use the same framing. Audit language is limited to the PDSS case study rather than used as the personal brand.

### S2.22 3D framing

- Loaded models are centred on their bounding box before rotation, and the camera now calls `lookAt(0,0,0)`.
- Camera distance is pulled back 14%, so models sit inside the frame rather than against its edges.
- Thumbnail stills were re-rendered with lower per-model zoom and checked for margin.
- The live hover preview uses the same centred viewer.

### S2.23 Case thumbnails

Case study rows use a dedicated small diagram rather than scaling the full 800px figure down:

- `CaseThumb` redraws the pipeline and role map at 320x210 with larger labels and fewer details.
- The diagram sits on a paper inset inside a dark framed plate with the same radial falloff, faint grid and inset edge as the model thumbnails.
- The large `CaseFigure` remains for the expanded case study, where its detail is legible.

### S2.26 Thumbnail ornament

Model and case thumbnails use a clean 210x140 frame:

- Case thumbnails use a light paper frame; project thumbnails use a thin dark frame. The frame itself carries no internal pattern.
- Geometry sits outside the frame, behind it: one thin ember arc, one diagonal rule and one small triangle at the lower-left. The overlay is not clipped and can cross into the page background.
- Text and actions sit above the decoration (z-index), so the geometry never covers copy.

### S2.27 T-shaped engineering framing

Capabilities opens with a small T diagram: the bar is product, software, hardware and research; the stem is AI/ML and systems. Two short notes explain that the bar is range and the stem is depth, without using the AWS phrasing as a slogan.

### S2.28 Case accuracy

- GGJHK now matches the current spec: eight roles, nine workspaces (admin, scan, desk, queue, stage, mc, me, judge, visitor). The role map is a two-column workspace bus rather than a radial chart.
- PDSS evaluation labels name the recorded backends: google/gemini-2.0-flash-001, openai/gpt-4o-mini-2024-07-18, deepseek/deepseek-chat (V3), anthropic/claude-3.5-haiku, moonshotai/kimi-k2.5.

### S2.29 Craft framing

Craft leads with "Fun to use. Useful when it counts." and frames the work as games, tools and physical objects judged on enjoyment and usefulness.

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
- [x] T46: Case accuracy — acceptance: event roles and PDSS model IDs match the recorded sources. (covers: S2.28)
- [x] T45: Craft framing — acceptance: Craft leads with fun and usefulness. (covers: S2.29)
- [x] T44: T-shaped framing — acceptance: Engineering uses the T concretely for range and depth. (covers: S2.27)
- [x] T47: Thumbnail geometry — acceptance: clean frames with minimal geometry outside and behind the box, never over content. (covers: S2.26)
- [x] T43: Thumbnail ornament — acceptance: thumbnail frames carry visible thin geometric decoration without covering the content. (covers: S2.26)
- [x] T42: Demo distribution — acceptance: no standalone Demos section; instruments sit in Engineering, gesture in Craft, diagrams in Systems. (covers: S2.24)
- [x] T41: Visible project actions — acceptance: project links are available without expanding. (covers: S2.25)
- [x] T39: Framed case thumbnails — acceptance: case diagrams are legible in the list and sit in a framed plate. (covers: S2.23)
- [x] T38: Generalist positioning — acceptance: hero, capabilities, about and meta avoid AI-engineer framing and audit emphasis. (covers: S2.21)
- [x] T37: Centred 3D models — acceptance: all models are centred and have margin in stills and live frames. (covers: S2.22)
- [x] T36: Framed model thumbnails — acceptance: 3D thumbnails carry the depth treatment and clear the copy. (covers: S2.20)
- [x] T35: Live project previews — acceptance: hover/focus swaps a still for one live model. (covers: S2.20)
- [x] T34: Model thumbnails — acceptance: project rows show stills of their actual models. (covers: S2.20)
- [x] T33: UML architecture and key-only setup — acceptance: no free proxy path, architecture visible before the demo. (covers: S2.18)
- [x] T32: Generalized workflow — acceptance: Systems leads with workflow and frames diagrams as artifacts. (covers: S2.19)
- [x] T31: Demo frame — acceptance: demos use a dark screen card distinct from the model plinth, with no white plate. (covers: S2.17)
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
