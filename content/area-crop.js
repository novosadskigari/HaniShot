/**
 * HaniShot - Interactive Area Crop Selection
 * Injects a clean draggable crop overlay onto the active web page.
 */

(function () {
  if (document.getElementById('hanishot-crop-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'hanishot-crop-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.45);
    z-index: 2147483647;
    cursor: crosshair;
    user-select: none;
  `;

  const selectionBox = document.createElement('div');
  selectionBox.id = 'hanishot-selection-box';
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px dashed #06b6d4;
    background: rgba(6, 182, 212, 0.1);
    display: none;
    pointer-events: none;
    box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.4);
  `;

  const toolbar = document.createElement('div');
  toolbar.id = 'hanishot-crop-toolbar';
  toolbar.style.cssText = `
    position: absolute;
    bottom: -48px;
    right: 0;
    display: none;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 6px 12px;
    gap: 8px;
    align-items: center;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    pointer-events: auto;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;

  const sizeBadge = document.createElement('span');
  sizeBadge.style.cssText = `
    color: #94a3b8;
    font-size: 12px;
    margin-right: 6px;
    font-weight: 500;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel (Esc)';
  cancelBtn.style.cssText = `
    background: #334155;
    color: #f8fafc;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  `;

  const captureBtn = document.createElement('button');
  captureBtn.textContent = 'Capture';
  captureBtn.style.cssText = `
    background: #06b6d4;
    color: #0f172a;
    border: none;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
  `;

  toolbar.appendChild(sizeBadge);
  toolbar.appendChild(cancelBtn);
  toolbar.appendChild(captureBtn);

  overlay.appendChild(selectionBox);
  overlay.appendChild(toolbar);
  document.body.appendChild(overlay);

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isSelecting = false;

  function updateBox(x1, y1, x2, y2) {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.display = 'block';

    sizeBadge.textContent = `${Math.round(width)} × ${Math.round(height)} px`;

    // Position toolbar
    toolbar.style.display = 'flex';
    let tbTop = top + height + 8;
    if (tbTop + 50 > window.innerHeight) {
      tbTop = top - 46;
    }
    toolbar.style.top = `${tbTop}px`;
    toolbar.style.left = `${Math.max(10, Math.min(left + width - toolbar.offsetWidth, window.innerWidth - 200))}px`;
  }

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === captureBtn || e.target === cancelBtn) return;
    startX = e.clientX;
    startY = e.clientY;
    isSelecting = true;
    toolbar.style.display = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    currentX = e.clientX;
    currentY = e.clientY;
    updateBox(startX, startY, currentX, currentY);
  });

  window.addEventListener('mouseup', () => {
    if (isSelecting) {
      isSelecting = false;
    }
  });

  function removeOverlay() {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  cancelBtn.addEventListener('click', removeOverlay);

  captureBtn.addEventListener('click', () => {
    const rect = selectionBox.getBoundingClientRect();
    if (rect.width < 5 || rect.height < 5) {
      removeOverlay();
      return;
    }

    const cropData = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      pixelRatio: window.devicePixelRatio || 1
    };

    removeOverlay();

    // Small delay to ensure overlay is gone from DOM before screenshot
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'CAPTURE_AREA_CONFIRMED',
        data: cropData
      });
    }, 50);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeOverlay();
    }
  });
})();
