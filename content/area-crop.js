/**
 * HaniShot - Interactive Area Crop Selection
 * Injects a clean draggable crop overlay onto the active web page with transparent mask.
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
    background: rgba(0, 0, 0, 0.15);
    z-index: 2147483647;
    cursor: crosshair;
    user-select: none;
    overflow: hidden;
  `;

  // Initial instruction banner like Awesome Screenshot
  const hintBanner = document.createElement('div');
  hintBanner.id = 'hanishot-crop-hint';
  hintBanner.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.88);
    color: #f8fafc;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    transition: opacity 0.2s ease;
  `;
  hintBanner.textContent = '✂️ Click and drag to select area • Press Esc to cancel';
  overlay.appendChild(hintBanner);

  const selectionBox = document.createElement('div');
  selectionBox.id = 'hanishot-selection-box';
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px dashed #06b6d4;
    background: transparent;
    display: none;
    pointer-events: none;
    box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.35);
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
    box-shadow: 0 6px 18px rgba(0,0,0,0.45);
    pointer-events: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const sizeBadge = document.createElement('span');
  sizeBadge.style.cssText = `
    color: #38bdf8;
    font-size: 12px;
    margin-right: 6px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
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
  captureBtn.textContent = '✓ Capture';
  captureBtn.style.cssText = `
    background: #06b6d4;
    color: #0f172a;
    border: none;
    padding: 5px 14px;
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
  let hasSelection = false;

  function updateBox(x1, y1, x2, y2) {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    if (width > 3 || height > 3) {
      hintBanner.style.opacity = '0';
      overlay.style.background = 'transparent';
      hasSelection = true;
    }

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
    if (tbTop < 8) tbTop = 8;
    toolbar.style.top = `${tbTop}px`;
    toolbar.style.left = `${Math.max(10, Math.min(left + width - toolbar.offsetWidth, window.innerWidth - 220))}px`;
  }

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === captureBtn || e.target === cancelBtn || toolbar.contains(e.target)) return;
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

  function confirmCapture() {
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
    }, 60);
  }

  cancelBtn.addEventListener('click', removeOverlay);
  captureBtn.addEventListener('click', confirmCapture);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeOverlay();
    } else if (e.key === 'Enter' && hasSelection) {
      confirmCapture();
    }
  });
})();
