// cursor.js — Custom crosshair cursor with hover grow

const cursor = document.getElementById('cursor');
const ring = cursor.querySelector('.cursor-ring');
const dot = cursor.querySelector('.cursor-dot');
const crosshair = cursor.querySelector('.cursor-crosshair');

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let visible = false;

// Smooth follow
function updateCursor() {
  currentX += (targetX - currentX) * 0.15;
  currentY += (targetY - currentY) * 0.15;
  cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
  requestAnimationFrame(updateCursor);
}

// Mouse move — update target
document.addEventListener('mousemove', (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
  if (!visible) {
    visible = true;
    cursor.style.opacity = '1';
  }
});

// Mouse leave window
document.addEventListener('mouseleave', () => {
  visible = false;
  cursor.style.opacity = '0';
});

// Grow on interactive elements
export function bindCursorHover(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '64px';
      ring.style.height = '64px';
      ring.style.borderColor = 'var(--accent)';
      crosshair.style.width = '72px';
      crosshair.style.height = '72px';
      crosshair.style.opacity = '0.7';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'var(--ink)';
      crosshair.style.width = '48px';
      crosshair.style.height = '48px';
      crosshair.style.opacity = '0.4';
    });
  });
}

// Initialize
cursor.style.opacity = '0';
updateCursor();
