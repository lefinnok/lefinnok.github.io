// modal.js — Detail modal overlay

const overlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
let isOpen = false;
let cursorRebindCallback = null;

export function setModalCursorRebind(fn) {
  cursorRebindCallback = fn;
}

export function openModal(project) {
  if (isOpen) return;
  isOpen = true;

  // Build content
  modalContent.innerHTML = `
    <button class="modal-close" aria-label="Close">[&times;]</button>
    <div class="modal-header">
      <span class="modal-id">${project.id}</span>
      <span class="modal-domain">${project.domain}</span>
    </div>
    <h2 class="modal-title">${project.title}</h2>
    <p class="modal-year">${project.year}</p>
    <div class="modal-media">
      <div class="modal-media-placeholder">
        <span>[ MEDIA ]</span>
      </div>
    </div>
    <p class="modal-detail">${project.detail || project.blurb}</p>
    <div class="modal-tags">
      ${(project.tags || []).map(t => `<span class="modal-tag">${t}</span>`).join('')}
    </div>
    <div class="modal-links">
      ${(project.links || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="modal-link">${l.label} &rarr;</a>`).join('')}
    </div>
    <div class="modal-end">
      <span>END OF RECORD // ${project.id}</span>
    </div>
  `;

  // Show
  overlay.classList.add('active');

  // Bind close button
  modalContent.querySelector('.modal-close').addEventListener('click', closeModal);

  // Rebind cursor hover for dynamic modal elements
  if (cursorRebindCallback) {
    cursorRebindCallback('.modal-close, .modal-link');
  }
}

export function closeModal() {
  if (!isOpen) return;
  isOpen = false;
  overlay.classList.remove('active');
}

// Click outside content to close
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    closeModal();
  }
});

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen) {
    closeModal();
  }
});

export function isModalOpen() {
  return isOpen;
}
