// tunnel.js — Core 3D tunnel engine

import { ARCHIVE_PROJECTS } from './data.js';
import { layout } from './layout.js';
import { updateHud } from './hud.js';
import { bindCursorHover } from './cursor.js';
import { openModal, isModalOpen, setModalCursorRebind } from './modal.js';
import { createHand3D } from './hand-3d.js';

// ─── CONSTANTS ─────────────────────────────────────────
const SPEED_MULTIPLIER = 0.9;
const TILT_STRENGTH = 3;      // degrees of world tilt from mouse
const STAR_COUNT = 180;
const STAR_SPREAD_X = 3000;   // px left/right
const STAR_SPREAD_Y = 2000;   // px up/down
const STAR_DEPTH = 16000;     // total Z depth for stars

// Magnetic snap — eases to nearest section when scrolling settles
const SNAP_VEL_THRESH = 0.8;
const SNAP_SETTLE = 250;              // ms of low velocity before snap triggers
const SNAP_MIN_DIST = 20;
const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

// ─── DOM REFERENCES ─────────────────────────────────────
const viewport = document.querySelector('.viewport');
const world = document.querySelector('.world');

// Size scroll proxy to layout depth
document.querySelector('.scroll-proxy').style.height =
  `${Math.ceil((layout.totalDepth + 2000) / SPEED_MULTIPLIER)}px`;

// ─── STATE ─────────────────────────────────────────────
let cameraZ = 0;
let velocity = 0;
let mouseNX = 0;  // normalized mouse X (-1 to 1)
let mouseNY = 0;  // normalized mouse Y (-1 to 1)
let tiltX = 0;    // current world tilt X (smoothed)
let tiltY = 0;    // current world tilt Y (smoothed)
let currentPerspective = 1000;
let snapTimer = null;
let isSnapping = false;
let wasStreaking = false;

// ─── LENIS SCROLL (document-level, scroll proxy gives height) ──
const lenis = new Lenis({
  lerp: 0.07,
  smoothWheel: true,
  wheelMultiplier: 1.2,
});

// ─── MOUSE TRACKING ─────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  mouseNX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── SNAP INTERRUPTION (user scrolls during snap) ───────
window.addEventListener('wheel', () => {
  if (isSnapping) isSnapping = false;
  if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
}, { passive: true });

// ─── BUILD THE TUNNEL CONTENT ───────────────────────────

// --- Hero Section (z=0) ---
function createHero(z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);
  el.innerHTML = `
    <div class="hero-title">
      <div class="bg-grid"></div>
      <div class="hero-hud-num left">
        ASSET ID<br/><b>TRN-0x0042</b><br/>LOW-LEVEL &middot; ISA &middot; 11T-FULL-ADDER
      </div>
      <div class="hero-hud-num right">
        MESH<br/><b>2,348 TRIS</b><br/>WIRE / SOLID BLEND
      </div>
      <div class="hero-hud-num bottom-left">
        FPS <b>60.0</b><br/>SHADER &middot; PBR + RIM<br/>RT &middot; WEBGL
      </div>
      <h1>
        L<span class="stroke">E</span>F<em>I</em>NNO<br/>
        <span class="stroke">K</span>W<span class="stroke">O</span>K
      </h1>
      <div class="hero-tagline">
        An archive of things I've built &mdash; from <em>8-bit transistor computers</em> to roguelikes, gesture pipelines, and handheld devices.
      </div>
      <div class="hero-meta">
        <span>PROJECTS &middot; <b>09</b></span>
        <span>DOMAINS &middot; <b>04</b></span>
        <span>YEARS ACTIVE &middot; <b>08</b></span>
      </div>
      <div class="hero-scroll-hint">SCROLL TO ENTER</div>
    </div>
  `;
  world.appendChild(el);
  return el;
}

// --- Floating zone label ---
function createZoneLabel(text, z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);
  el.innerHTML = `<div class="zone-label">${text}</div>`;
  world.appendChild(el);
  return el;
}

// --- Project card (standalone info panel, snap point) ---
function createCard(project, z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);

  const card = document.createElement('div');
  card.className = 'card';
  const tagsHtml = project.tags
    ? `<div class="card-tags">${project.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>`
    : '';
  card.innerHTML = `
    <div class="card-header">
      <span class="card-id">${project.id}</span>
      <div class="accent-dot"></div>
    </div>
    <h2 class="card-title">${project.title}</h2>
    <p class="card-blurb">${project.blurb}</p>
    ${tagsHtml}
    <div class="card-footer">
      <span>${project.year}</span>
      <span>${project.domain}</span>
    </div>
  `;
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(project);
  });

  el.appendChild(card);
  world.appendChild(el);
  return el;
}

// --- Project visual (separate 3D element, deeper in the section) ---
function createCardVisual(project, z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);

  if (project.id === '002') {
    const hand = createHand3D();
    hand.start();
    el.appendChild(hand.element);
  } else {
    const visual = document.createElement('div');
    visual.className = 'project-visual';
    visual.innerHTML = `
      <div class="visual-grid"></div>
      <div class="visual-meta">
        <span>${project.id}</span>
        <span>${project.domain}</span>
      </div>
      <div class="visual-center">
        <div class="visual-reticle"></div>
        <div class="visual-label">MEDIA // PENDING</div>
      </div>
    `;
    el.appendChild(visual);
  }

  world.appendChild(el);
  return el;
}

// --- Floating project title (decorative big text, deep background) ---
function createCardTitle(text, z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);
  el.innerHTML = `<div class="project-title-float">${text}</div>`;
  world.appendChild(el);
  return el;
}

// --- Archive panel ---
function createArchivePanel(z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);

  const rows = ARCHIVE_PROJECTS.map(p => `
    <div class="archive-row" data-interactive>
      <span class="archive-row-num">${p.id}</span>
      <span class="archive-row-title">${p.title}</span>
      <span class="archive-row-year">${p.year}</span>
      <span class="archive-row-domain">${p.domain}</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="archive-panel">
      <div class="archive-panel-title">THE ARCHIVE</div>
      <div class="archive-panel-sub">ADDITIONAL INDEXED ASSETS &middot; ${ARCHIVE_PROJECTS.length} ENTRIES</div>
      ${rows}
    </div>
  `;
  world.appendChild(el);
  return el;
}

// --- About panel ---
function createAboutPanel(z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);
  el.innerHTML = `
    <div class="about-panel">
      <div class="about-panel-title">AB<em>O</em>UT.</div>
      <div class="about-panel-sub">[ DOSSIER / PERSONAL ]</div>
      <div class="about-panel-body">
        <em>Lefinno Kwok</em> &mdash; creator, engineer, and builder of unusual things. Based in Hong Kong, working across the full stack from <em>transistor-level hardware</em> to <em>web applications</em> and <em>machine learning pipelines</em>. Interested in the intersection of art, technology, and education.
        <br/><br/>
        Currently building interactive learning tools, exploring LLM-backed design workflows, and maintaining a steam-powered roguelike. Previously built gesture recognition systems, drone vision frameworks, and handheld game consoles from scratch.
      </div>
      <div class="about-panel-stats">
        <div class="about-panel-stat">
          <b>09</b>
          PROJECTS
        </div>
        <div class="about-panel-stat">
          <b>08</b>
          YEARS ACTIVE
        </div>
        <div class="about-panel-stat">
          <b>04</b>
          DOMAINS
        </div>
      </div>
    </div>
  `;
  world.appendChild(el);
  return el;
}

// --- Contact panel ---
function createContactPanel(z) {
  const el = document.createElement('div');
  el.className = 'tunnel-item';
  el.dataset.z = String(z);
  el.innerHTML = `
    <div class="contact-panel">
      <div class="contact-title">TRANSMIT<br/><em>SIGNAL</em>.</div>
      <div class="contact-sub">AVAILABLE FOR COLLABORATION &middot; COMMISSIONS &middot; UNCONVENTIONAL PROJECTS</div>
      <div class="contact-links">
        <a href="https://github.com/lefinnok" target="_blank" rel="noopener" class="contact-link" data-interactive>GITHUB &rarr;</a>
        <a href="https://linktr.ee/lefinno" target="_blank" rel="noopener" class="contact-link" data-interactive>LINKTREE &rarr;</a>
        <a href="mailto:lefinnokwok@gmail.com" class="contact-link" data-interactive>EMAIL &rarr;</a>
      </div>
      <div class="contact-end">&mdash; END OF TRANSMISSION &mdash;</div>
    </div>
  `;
  world.appendChild(el);
  return el;
}

// --- Star particles (density scales with viewport) ---
const stars = [];
function createStars() {
  const viewScale = (window.innerWidth * window.innerHeight) / (1920 * 1080);
  const count = Math.round(STAR_COUNT * Math.max(0.5, viewScale));

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const x = (Math.random() - 0.5) * STAR_SPREAD_X;
    const y = (Math.random() - 0.5) * STAR_SPREAD_Y;
    const z = -Math.random() * STAR_DEPTH;
    const size = Math.random() * 2 + 1;
    const brightness = Math.random() * 0.5 + 0.2;
    const angle = Math.atan2(y, x) - Math.PI / 2;  // align scaleY with radial direction
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = brightness;
    stars.push({ el: star, x, y, z, baseW: size, baseH: size, brightness, angle });
    world.appendChild(star);
  }
}

// ─── BUILD FROM LAYOUT ──────────────────────────────────
for (const item of layout.items) {
  let el;
  switch (item.type) {
    case 'hero':        el = createHero(item.z); break;
    case 'label':       el = createZoneLabel(item.text, item.z); break;
    case 'card':        el = createCard(item.data, item.z); break;
    case 'card-visual': el = createCardVisual(item.data, item.z); break;
    case 'card-title':  el = createCardTitle(item.text, item.z); break;
    case 'archive':     el = createArchivePanel(item.z); break;
    case 'about':       el = createAboutPanel(item.z); break;
    case 'contact':     el = createContactPanel(item.z); break;
  }
  // Apply spatial composition from layout engine
  if (el) {
    el.dataset.x = String(item.x || 0);
    el.dataset.y = String(item.y || 0);
    el.dataset.rotY = String(item.rotY || 0);
    el.dataset.rotZ = String(item.rotZ || 0);
  }
}
createStars();

// Collect all tunnel items for opacity calculations
const allTunnelItems = document.querySelectorAll('.tunnel-item');

// ─── NAV LINK SCROLL TARGETS ────────────────────────────
const NAV_TARGETS = {
  'INDEX': layout.sectionSnaps.hero,
  'WORK': layout.sectionSnaps.work,
  'ABOUT': layout.sectionSnaps.about,
  'CONTACT': layout.sectionSnaps.contact,
};

document.querySelectorAll('.hud-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const label = link.textContent.trim();
    const targetZ = NAV_TARGETS[label];
    if (targetZ !== undefined) {
      // Compute the scroll position that maps to this camera Z
      const targetScroll = targetZ / SPEED_MULTIPLIER;
      lenis.scrollTo(targetScroll, { duration: 2.0 });
    }
    // Update active state
    document.querySelectorAll('.hud-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  });
});

// ─── BIND CURSOR HOVER ──────────────────────────────────
// Delay slightly so DOM is ready
requestAnimationFrame(() => {
  bindCursorHover('.card, .archive-row, .contact-link, .hud-nav a');
});

// Rebind cursor for dynamically created modal elements
setModalCursorRebind((selector) => {
  bindCursorHover(selector);
});

// ─── OPACITY + FOCUS BASED ON Z DISTANCE ──────────────────
// Returns { alpha, focus } where focus is 0-1 (1 = in sweet spot)
function computeVisibility(relZ) {
  // Base alpha: fade in from far, fade out when behind camera
  let alpha = 1;
  if (relZ < -3000) {
    alpha = 0;
  } else if (relZ < -2000) {
    alpha = (relZ + 3000) / 1000;
  }
  if (relZ > 200) {
    alpha = Math.max(0, 1 - (relZ - 200) / 500);
  }
  alpha = Math.max(0, Math.min(1, alpha));

  // Focus: 1.0 in sweet spot (-1000 to 100), ramp from -1400 to -1000
  // Wide enough to encompass full project composition (card + visual + title at dz -700)
  let focus = 0;
  if (relZ > -1400 && relZ < 200) {
    if (relZ < -1000) {
      focus = (relZ + 1400) / 400; // ramp up from -1400 to -1000
    } else if (relZ > 100) {
      focus = 1 - (relZ - 100) / 100; // ramp down from 100 to 200
    } else {
      focus = 1; // full focus in -1000 to 100
    }
  }
  focus = Math.max(0, Math.min(1, focus));

  return { alpha, focus };
}

// ─── MAGNETIC SNAP ──────────────────────────────────────
function findNearestSnap(camZ) {
  let nearest = layout.snapPoints[0];
  let minDist = Math.abs(camZ - nearest);
  for (const sp of layout.snapPoints) {
    const d = Math.abs(camZ - sp);
    if (d < minDist) { minDist = d; nearest = sp; }
  }
  return nearest;
}

function handleSnap() {
  if (isSnapping) return;

  if (Math.abs(velocity) > SNAP_VEL_THRESH) {
    if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
    return;
  }

  if (snapTimer) return;

  snapTimer = setTimeout(() => {
    snapTimer = null;
    const nearest = findNearestSnap(cameraZ);
    const dist = Math.abs(cameraZ - nearest);
    if (dist > SNAP_MIN_DIST) {
      isSnapping = true;
      // Duration scales with distance — short moves quick, long moves slow
      const duration = 0.6 + Math.min(dist / 2000, 1.0) * 0.8;
      lenis.scrollTo(nearest / SPEED_MULTIPLIER, {
        duration,
        easing: easeOutExpo,
        onComplete: () => { isSnapping = false; },
      });
    }
  }, SNAP_SETTLE);
}

// ─── MAIN ANIMATION LOOP ────────────────────────────────
function animate(time) {
  lenis.raf(time);

  // Read scroll
  const scroll = lenis.scroll || 0;
  velocity = lenis.velocity || 0;
  cameraZ = scroll * SPEED_MULTIPLIER;

  // Smooth mouse tilt
  tiltX += (mouseNY * -TILT_STRENGTH - tiltX) * 0.05;
  tiltY += (mouseNX * TILT_STRENGTH - tiltY) * 0.05;

  // Velocity perspective warp
  const targetPerspective = 1000 - Math.min(Math.abs(velocity) * 10, 600);
  currentPerspective += (targetPerspective - currentPerspective) * 0.1;
  viewport.style.perspective = `${currentPerspective}px`;

  // Update world transform
  world.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${cameraZ}px)`;

  // Update each tunnel item with focus mechanic + 3D spatial transforms
  allTunnelItems.forEach(item => {
    const itemZ = parseFloat(item.dataset.z || 0);
    const itemX = parseFloat(item.dataset.x || 0);
    const itemY = parseFloat(item.dataset.y || 0);
    const baseRotY = parseFloat(item.dataset.rotY || 0);
    const baseRotZ = parseFloat(item.dataset.rotZ || 0);
    const relZ = itemZ + cameraZ; // relative Z after camera offset

    const { alpha, focus } = computeVisibility(relZ);

    // Focused items: full brightness. Unfocused: dim to 40% of base alpha
    const dimmedAlpha = alpha * (0.4 + 0.6 * focus);
    item.style.opacity = dimmedAlpha;

    // Focused items scale up slightly for emphasis
    const scale = 1 + focus * 0.08;

    // Ease rotation toward camera when focused — items turn to face you
    const focusMul = 1 - focus * 0.6; // at full focus: 40% of base rotation
    const rotY = baseRotY * focusMul;
    const rotZ = baseRotZ * focusMul;

    // Full 3D transform: position + rotation + scale
    item.style.transform = `translate(-50%, -50%) translate3d(${itemX}px, ${itemY}px, ${itemZ}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;

    // Add/remove focused class for border glow
    if (focus > 0.5) {
      item.classList.add('focused');
    } else {
      item.classList.remove('focused');
    }

    // Toggle pointer events based on visibility
    if (dimmedAlpha < 0.1) {
      item.style.pointerEvents = 'none';
    } else {
      item.style.pointerEvents = 'auto';
    }
  });

  // Update stars — radial velocity streaks
  const absVel = Math.abs(velocity);
  const stretch = absVel > 0.5 ? 1 + Math.min(absVel * 0.4, 12) : 1;
  const isStreaking = stretch > 1.5;
  if (isStreaking !== wasStreaking) {
    world.classList.toggle('streaking', isStreaking);
    wasStreaking = isStreaking;
  }

  stars.forEach(star => {
    const relZ = star.z + cameraZ;
    const { alpha } = computeVisibility(relZ);
    star.el.style.opacity = Math.max(0, alpha * star.brightness);
    star.el.style.transform = `translate(-50%, -50%) translate3d(${star.x}px, ${star.y}px, ${star.z}px) rotate(${star.angle}rad) scaleY(${stretch})`;
  });

  // Update HUD
  updateHud(cameraZ, velocity);

  // Update active nav based on camera position
  updateActiveNav(cameraZ);

  // Snap to nearest section when scrolling settles
  handleSnap();

  requestAnimationFrame(animate);
}

// ─── NAV ACTIVE STATE TRACKING ──────────────────────────
const navLinks = document.querySelectorAll('.hud-nav a');
const S = layout.sectionSnaps;
const NAV_THRESHOLDS = {
  contact: (S.about + S.contact) / 2,
  about:   (S.archive + S.about) / 2,
  work:    (S.hero + S.work) / 2,
};

function updateActiveNav(camZ) {
  let activeLabel = 'INDEX';
  if (camZ >= NAV_THRESHOLDS.contact) activeLabel = 'CONTACT';
  else if (camZ >= NAV_THRESHOLDS.about) activeLabel = 'ABOUT';
  else if (camZ >= NAV_THRESHOLDS.work) activeLabel = 'WORK';

  navLinks.forEach(link => {
    const label = link.textContent.trim();
    if (label === activeLabel) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ─── START ──────────────────────────────────────────────
requestAnimationFrame(animate);
