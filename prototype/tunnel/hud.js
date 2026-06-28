// hud.js — HUD updates: clock, coordinates, FPS, velocity

const clockEl = document.getElementById('hud-clock');
const coordEl = document.getElementById('hud-coord');
const statusBarCoord = document.getElementById('statusbar-coord');
const fpsEl = document.getElementById('hud-fps');
const velEl = document.getElementById('hud-velocity');

// --- Live clock ---
function tickClock() {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss} UTC`;
}
setInterval(tickClock, 1000);
tickClock();

// --- FPS counter ---
let frames = 0;
let lastFpsTime = performance.now();
let currentFps = 60;

function tickFps() {
  frames++;
  const now = performance.now();
  if (now - lastFpsTime >= 500) {
    currentFps = Math.round((frames * 1000) / (now - lastFpsTime));
    lastFpsTime = now;
    frames = 0;
    if (fpsEl) fpsEl.textContent = currentFps;
  }
  requestAnimationFrame(tickFps);
}
requestAnimationFrame(tickFps);

// --- Scroll coordinate & velocity update (called from tunnel.js) ---
export function updateHud(cameraZ, velocity) {
  const z = Math.round(cameraZ);
  if (coordEl) coordEl.textContent = `Z: ${z}`;
  if (statusBarCoord) statusBarCoord.textContent = `SCROLL: Z ${z}`;
  if (velEl) velEl.textContent = `${Math.round(Math.abs(velocity))}`;
}
