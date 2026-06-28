// layout.js — Constraint-based tunnel layout engine
//
// Each project is a constellation of 3D elements (card + visual + title),
// spread across its section of tunnel space. Not flat panels — discrete objects.

import { HERO_PROJECTS } from './data.js';

// ─── PER-PROJECT 3D COMPOSITIONS ─────────────────────────
// Each project defines positions for card, visual, and floating title.
// dx/dy: offset from center. dz: depth offset from card's z (visual/title only).
// rotY/rotZ: base rotation (eased toward camera when focused).
const PROJECT_COMPOSITIONS = [
  {
    // 001: 8-bit computer — card right, visual far left + deep, title behind
    card:   { dx: 280,  dy: -20,  rotY: -5,  rotZ: 0 },
    visual: { dx: -380, dy: 40,   dz: -400, rotY: 14,  rotZ: -2 },
    title:  { dx: -60,  dy: -280, dz: -650, rotY: 4,   rotZ: -2 },
  },
  {
    // 002: gesture recognition — card left, hand wireframe right + deep
    card:   { dx: -260, dy: 10,   rotY: 6,   rotZ: 0 },
    visual: { dx: 340,  dy: -30,  dz: -350, rotY: -12, rotZ: 1 },
    title:  { dx: 120,  dy: -260, dz: -550, rotY: -5,  rotZ: 2 },
  },
  {
    // 003: UML generator — card right, visual left + deeper
    card:   { dx: 300,  dy: -30,  rotY: -7,  rotZ: 0 },
    visual: { dx: -320, dy: 50,   dz: -450, rotY: 16,  rotZ: -1 },
    title:  { dx: -40,  dy: -300, dz: -700, rotY: 3,   rotZ: -1 },
  },
  {
    // 004: ML playground — card left, visual far right + deep, dramatic angle
    card:   { dx: -240, dy: 0,    rotY: 5,   rotZ: 0 },
    visual: { dx: 400,  dy: 20,   dz: -320, rotY: -18, rotZ: 2 },
    title:  { dx: 80,   dy: -270, dz: -580, rotY: -4,  rotZ: 1 },
  },
];

// Non-card section spatial offsets
const SECTION_SPATIAL = {
  archive: { x: -80,  y: 0, rotY: 5,  rotZ: 0 },
  about:   { x: 100,  y: 0, rotY: -6, rotZ: 0 },
  contact: { x: 0,    y: 0, rotY: 0,  rotZ: 0 },
};

// ─── CONSTRAINTS (single source of truth for spacing) ───
export const CONSTRAINTS = {
  snapOffset: 50,             // items rest this far in front of camera

  heroToWorkLabel: 1200,      // hero → "SELECTED WORK" label
  workLabelToCard: 800,       // label → first card
  cardGap: 2000,              // between project cards
  cardToArchiveLabel: 1000,   // last card → "ARCHIVE" label
  archiveLabelToPanel: 1000,  // label → archive panel
  panelGap: 2000,             // between panels (archive → about → contact)
};

// ─── SECTION DEFINITIONS ────────────────────────────────
const C = CONSTRAINTS;

const SECTIONS = [
  {
    id: 'hero',
    items: [{ type: 'hero' }],
  },
  {
    id: 'work',
    label: 'SELECTED WORK',
    labelGap: C.heroToWorkLabel,
    labelToContent: C.workLabelToCard,
    itemGap: C.cardGap,
    items: HERO_PROJECTS.map(p => ({ type: 'card', data: p })),
  },
  {
    id: 'archive',
    label: 'ARCHIVE',
    labelGap: C.cardToArchiveLabel,
    labelToContent: C.archiveLabelToPanel,
    items: [{ type: 'archive' }],
  },
  {
    id: 'about',
    gap: C.panelGap,
    items: [{ type: 'about' }],
  },
  {
    id: 'contact',
    gap: C.panelGap,
    items: [{ type: 'contact' }],
  },
];

// ─── COMPUTE ALL POSITIONS ──────────────────────────────
function compute() {
  const items = [];
  const snapPoints = [];
  const sectionSnaps = {};
  let z = 0;
  let isFirst = true;
  let cardIndex = 0;

  for (const sec of SECTIONS) {
    // Gap / label before section content
    if (sec.label) {
      if (!isFirst) z -= sec.labelGap;
      items.push({ type: 'label', text: sec.label, z, x: 0, y: 0, rotY: 0, rotZ: 0 });
      z -= sec.labelToContent;
    } else if (sec.gap && !isFirst) {
      z -= sec.gap;
    }

    const gap = sec.itemGap || 0;

    sec.items.forEach((item, i) => {
      if (i > 0) z -= gap;

      if (item.type === 'card') {
        const comp = PROJECT_COMPOSITIONS[cardIndex % PROJECT_COMPOSITIONS.length];

        // ── Card (primary — snap point)
        items.push({
          type: 'card', data: item.data, z, sectionId: sec.id,
          x: comp.card.dx, y: comp.card.dy,
          rotY: comp.card.rotY, rotZ: comp.card.rotZ || 0,
        });
        const snap = Math.abs(z) - C.snapOffset;
        snapPoints.push(snap);
        if (!sectionSnaps[sec.id]) sectionSnaps[sec.id] = snap;

        // ── Visual (separate 3D element, deeper, no snap)
        items.push({
          type: 'card-visual', data: item.data, sectionId: sec.id,
          z: z + (comp.visual.dz || 0),
          x: comp.visual.dx, y: comp.visual.dy,
          rotY: comp.visual.rotY, rotZ: comp.visual.rotZ || 0,
        });

        // ── Floating title (decorative, deep background, no snap)
        items.push({
          type: 'card-title', text: item.data.title, sectionId: sec.id,
          z: z + (comp.title.dz || 0),
          x: comp.title.dx, y: comp.title.dy,
          rotY: comp.title.rotY, rotZ: comp.title.rotZ || 0,
        });

        cardIndex++;
      } else {
        // Non-card items (archive, about, contact, hero)
        const spatial = SECTION_SPATIAL[sec.id] || {};
        items.push({
          ...item, z, sectionId: sec.id,
          x: spatial.x || 0, y: spatial.y || 0,
          rotY: spatial.rotY || 0, rotZ: spatial.rotZ || 0,
        });

        const snap = z === 0 ? 0 : Math.abs(z) - C.snapOffset;
        snapPoints.push(snap);
        if (!sectionSnaps[sec.id]) sectionSnaps[sec.id] = snap;
      }
    });

    isFirst = false;
  }

  return { items, snapPoints, sectionSnaps, totalDepth: Math.abs(z) };
}

export const layout = compute();
