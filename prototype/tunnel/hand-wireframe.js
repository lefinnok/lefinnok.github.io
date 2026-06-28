// hand-wireframe.js — Animated hand skeleton wireframe (HUD/Vault style)

// ── Hand landmark data (21 points, MediaPipe convention) ──
const OPEN_HAND = [
  {x:0.50,y:0.82,z:0}, {x:0.40,y:0.71,z:0.02}, {x:0.33,y:0.62,z:0.04}, {x:0.28,y:0.52,z:0.05}, {x:0.25,y:0.43,z:0.06},
  {x:0.42,y:0.55,z:0.01}, {x:0.40,y:0.41,z:0.03}, {x:0.39,y:0.30,z:0.04}, {x:0.38,y:0.20,z:0.05},
  {x:0.49,y:0.52,z:0}, {x:0.49,y:0.37,z:0.02}, {x:0.49,y:0.26,z:0.03}, {x:0.49,y:0.16,z:0.04},
  {x:0.56,y:0.55,z:-0.01}, {x:0.57,y:0.41,z:-0.02}, {x:0.58,y:0.31,z:-0.03}, {x:0.58,y:0.22,z:-0.04},
  {x:0.62,y:0.60,z:-0.02}, {x:0.64,y:0.50,z:-0.03}, {x:0.65,y:0.41,z:-0.04}, {x:0.66,y:0.34,z:-0.05},
];
const FIST = [
  {x:0.50,y:0.82,z:0}, {x:0.40,y:0.71,z:0.02}, {x:0.36,y:0.65,z:0.04}, {x:0.40,y:0.60,z:0.03}, {x:0.45,y:0.57,z:0.02},
  {x:0.42,y:0.56,z:0.01}, {x:0.43,y:0.53,z:0.03}, {x:0.46,y:0.56,z:0.02}, {x:0.48,y:0.60,z:0.01},
  {x:0.49,y:0.53,z:0}, {x:0.50,y:0.51,z:0.02}, {x:0.52,y:0.54,z:0.01}, {x:0.52,y:0.58,z:0},
  {x:0.56,y:0.56,z:-0.01}, {x:0.56,y:0.53,z:-0.02}, {x:0.56,y:0.56,z:-0.01}, {x:0.55,y:0.60,z:0},
  {x:0.62,y:0.60,z:-0.02}, {x:0.61,y:0.58,z:-0.03}, {x:0.60,y:0.62,z:-0.02}, {x:0.58,y:0.64,z:-0.01},
];
const POINTING = [
  {x:0.50,y:0.82,z:0}, {x:0.40,y:0.71,z:0.02}, {x:0.36,y:0.65,z:0.04}, {x:0.40,y:0.60,z:0.03}, {x:0.45,y:0.57,z:0.02},
  {x:0.42,y:0.55,z:0.01}, {x:0.40,y:0.41,z:0.03}, {x:0.39,y:0.30,z:0.04}, {x:0.38,y:0.20,z:0.05},
  {x:0.49,y:0.53,z:0}, {x:0.50,y:0.51,z:0.02}, {x:0.52,y:0.54,z:0.01}, {x:0.52,y:0.58,z:0},
  {x:0.56,y:0.56,z:-0.01}, {x:0.56,y:0.53,z:-0.02}, {x:0.56,y:0.56,z:-0.01}, {x:0.55,y:0.60,z:0},
  {x:0.62,y:0.60,z:-0.02}, {x:0.61,y:0.58,z:-0.03}, {x:0.60,y:0.62,z:-0.02}, {x:0.58,y:0.64,z:-0.01},
];
const PEACE = [
  {x:0.50,y:0.82,z:0}, {x:0.40,y:0.71,z:0.02}, {x:0.36,y:0.65,z:0.04}, {x:0.40,y:0.60,z:0.03}, {x:0.45,y:0.57,z:0.02},
  {x:0.42,y:0.55,z:0.01}, {x:0.39,y:0.41,z:0.03}, {x:0.37,y:0.30,z:0.04}, {x:0.35,y:0.20,z:0.05},
  {x:0.49,y:0.52,z:0}, {x:0.50,y:0.37,z:0.02}, {x:0.52,y:0.26,z:0.03}, {x:0.54,y:0.16,z:0.04},
  {x:0.56,y:0.56,z:-0.01}, {x:0.56,y:0.53,z:-0.02}, {x:0.56,y:0.56,z:-0.01}, {x:0.55,y:0.60,z:0},
  {x:0.62,y:0.60,z:-0.02}, {x:0.61,y:0.58,z:-0.03}, {x:0.60,y:0.62,z:-0.02}, {x:0.58,y:0.64,z:-0.01},
];

const POSES = [OPEN_HAND, FIST, POINTING, PEACE];
const POSE_LABELS = ['OPEN HAND', 'FIST', 'POINTING', 'PEACE'];
const HOLD_MS = 2000;
const TRANSITION_MS = 1200;

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

const ANALYSIS_EDGES = [
  [0,4],[0,8],[0,12],[0,16],[0,20],
  [4,8],[4,12],[4,16],[4,20],
  [8,12],[12,16],[16,20],
];

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

// ── Animation helpers ──
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpPose(from, to, t) {
  return from.map((f, i) => ({
    x: lerp(f.x, to[i].x, t),
    y: lerp(f.y, to[i].y, t),
    z: lerp(f.z, to[i].z, t),
  }));
}
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

// ── 3D projection ──
function project3D(landmarks, w, h, rotY, rotX) {
  const cx = 0.5, cy = 0.5;
  const fov = 2.0;
  return landmarks.map(p => {
    let x = (p.x - cx);
    let y = (p.y - cy);
    let z = p.z * 3;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const depth = fov / (fov + z2);
    return { x: (cx + x1 * depth) * w, y: (cy + y1 * depth) * h, z: z2, depth };
  });
}

// ── Mini L-bracket around a point (HUD targeting reticle) ──
function drawTargetBracket(ctx, x, y, size, color, alpha) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  const s = size;
  const g = s * 0.35; // gap from center
  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - s, y - g); ctx.lineTo(x - s, y - s); ctx.lineTo(x - g, y - s);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + g, y - s); ctx.lineTo(x + s, y - s); ctx.lineTo(x + s, y - g);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - s, y + g); ctx.lineTo(x - s, y + s); ctx.lineTo(x - g, y + s);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + g, y + s); ctx.lineTo(x + s, y + s); ctx.lineTo(x + s, y + g);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function createHandWireframe() {
  const canvas = document.createElement('canvas');
  const DPR = 2;
  const W = 800;   // 400 CSS px
  const H = 1000;  // 500 CSS px  (4:5 ratio preserved)
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const w = W / DPR;
  const h = H / DPR;

  const label = document.createElement('div');
  label.className = 'hand-label';
  label.innerHTML = `<span class="hand-label-dot"></span><span class="hand-label-text">${POSE_LABELS[0]}</span>`;

  const container = document.createElement('div');
  container.className = 'hand-wireframe-container';
  container.appendChild(canvas);
  container.appendChild(label);

  let animId = 0;
  let startTime = 0;
  let prevLandmarks = null;
  const velocities = Array.from({ length: 21 }, () => ({ vx: 0, vy: 0, vz: 0 }));

  const INSET = 12;
  const BLEN = 20;

  function draw(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const cycleLen = HOLD_MS + TRANSITION_MS;
    const loopTime = elapsed % (cycleLen * POSES.length);
    const poseIdx = Math.floor(loopTime / cycleLen) % POSES.length;
    const poseElapsed = loopTime % cycleLen;

    let baseLandmarks;
    if (poseElapsed < HOLD_MS) {
      baseLandmarks = POSES[poseIdx];
    } else {
      const nextIdx = (poseIdx + 1) % POSES.length;
      const t = easeOutBack(Math.min((poseElapsed - HOLD_MS) / TRANSITION_MS, 1));
      baseLandmarks = lerpPose(POSES[poseIdx], POSES[nextIdx], t);
    }

    const landmarks = baseLandmarks.map((target, i) => {
      if (!prevLandmarks) return target;
      const stiff = FINGERTIP_INDICES.includes(i) ? 0.08 : 0.14;
      const prev = prevLandmarks[i];
      const v = velocities[i];
      v.vx = (v.vx + (target.x - prev.x) * stiff) * 0.85;
      v.vy = (v.vy + (target.y - prev.y) * stiff) * 0.85;
      v.vz = (v.vz + (target.z - prev.z) * stiff) * 0.85;
      return { x: prev.x + v.vx, y: prev.y + v.vy, z: prev.z + v.vz };
    });
    prevLandmarks = landmarks;

    const labelText = label.querySelector('.hand-label-text');
    if (labelText) labelText.textContent = POSE_LABELS[poseIdx];

    const rotY = Math.sin(elapsed * 0.0005) * 0.4;
    const rotX = Math.sin(elapsed * 0.0003) * 0.15 - 0.1;
    const projected = project3D(landmarks, w, h, rotY, rotX);

    // ── DRAW ──
    ctx.clearRect(0, 0, w, h);

    // Subtle dot grid background (matches site's bg-grid feel)
    ctx.fillStyle = 'rgba(234, 234, 234, 0.04)';
    for (let gx = INSET + 16; gx < w - INSET; gx += 32) {
      for (let gy = INSET + 16; gy < h - INSET; gy += 32) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    // Corner L-brackets (HUD frame)
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1;
    const x0 = INSET, y0 = INSET, x1 = w - INSET, y1 = h - INSET;
    // TL
    ctx.beginPath(); ctx.moveTo(x0, y0 + BLEN); ctx.lineTo(x0, y0); ctx.lineTo(x0 + BLEN, y0); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(x1 - BLEN, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + BLEN); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(x0, y1 - BLEN); ctx.lineTo(x0, y1); ctx.lineTo(x0 + BLEN, y1); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(x1 - BLEN, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - BLEN); ctx.stroke();

    // HUD labels — top left
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('GESTURE // LIVE', INSET + 4, INSET + 6);

    // HUD labels — top right
    ctx.textAlign = 'right';
    ctx.fillText('NODES: 21', w - INSET - 4, INSET + 6);
    ctx.fillText('EDGES: ' + HAND_CONNECTIONS.length, w - INSET - 4, INSET + 18);

    // Analysis edges — dashed lines (spectral graph)
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(255, 90, 31, 0.12)';
    for (const [a, b] of ANALYSIS_EDGES) {
      ctx.beginPath();
      ctx.moveTo(projected[a].x, projected[a].y);
      ctx.lineTo(projected[b].x, projected[b].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Skeleton connections — sharp 1px lines
    ctx.lineCap = 'butt';
    ctx.lineWidth = 1;
    for (const [a, b] of HAND_CONNECTIONS) {
      const avgDepth = (projected[a].depth + projected[b].depth) / 2;
      ctx.strokeStyle = `rgba(234, 234, 234, ${0.12 + avgDepth * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(projected[a].x, projected[a].y);
      ctx.lineTo(projected[b].x, projected[b].y);
      ctx.stroke();
    }

    // Joints — small SQUARES (not circles) for HUD feel
    const pulse = 0.5 + Math.sin(elapsed * 0.003) * 0.25;
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const isFingertip = FINGERTIP_INDICES.includes(i);
      const isWrist = i === 0;

      if (isFingertip || isWrist) {
        // Targeting brackets around key joints
        const bracketSize = isWrist ? 10 : 8;
        drawTargetBracket(ctx, p.x, p.y, bracketSize, '#ff5a1f', pulse * 0.6);

        // Accent square (filled)
        const sq = isWrist ? 3 : 2.5;
        ctx.fillStyle = `rgba(255, 90, 31, ${0.6 + pulse * 0.3})`;
        ctx.fillRect(p.x - sq, p.y - sq, sq * 2, sq * 2);
      } else {
        // Regular joint — tiny square
        const sq = 1.5;
        ctx.fillStyle = `rgba(234, 234, 234, ${0.3 + p.depth * 0.15})`;
        ctx.fillRect(p.x - sq, p.y - sq, sq * 2, sq * 2);
      }
    }

    // Crosshair at hand center
    let handCX = 0, handCY = 0;
    for (const p of projected) { handCX += p.x; handCY += p.y; }
    handCX /= projected.length;
    handCY /= projected.length;
    const crossAlpha = 0.08 + Math.sin(elapsed * 0.001) * 0.03;
    ctx.strokeStyle = `rgba(234, 234, 234, ${crossAlpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(handCX - 16, handCY); ctx.lineTo(handCX - 5, handCY);
    ctx.moveTo(handCX + 5, handCY); ctx.lineTo(handCX + 16, handCY);
    ctx.moveTo(handCX, handCY - 16); ctx.lineTo(handCX, handCY - 5);
    ctx.moveTo(handCX, handCY + 5); ctx.lineTo(handCX, handCY + 16);
    ctx.stroke();

    // Bottom-left: pose index readout
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText(`POSE ${String(poseIdx + 1).padStart(2, '0')} / ${String(POSES.length).padStart(2, '0')}`, INSET + 4, y1 - 4);

    animId = requestAnimationFrame(draw);
  }

  return {
    element: container,
    start() { animId = requestAnimationFrame(draw); },
    stop() { cancelAnimationFrame(animId); },
  };
}
