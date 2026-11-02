/**
 * HaniShot - Interactive Area Crop Selection
 * Uses an SVG cutout mask for a clean, semi-transparent backdrop like Awesome Screenshot.
 * Eliminates GPU box-shadow rendering artifacts and solid color blocks.
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
    z-index: 2147483647;
    cursor: crosshair;
    user-select: none;
    overflow: hidden;
    background: transparent;
  `;

  // SVG Cutout Mask (standard, hardware-accelerated, zero-artifact transparent hole)
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.id = 'hanishot-crop-svg';
  svg.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;

  const maskPath = document.createElementNS(svgNS, 'path');
  maskPath.setAttribute('fill-rule', 'evenodd');
  maskPath.setAttribute('fill', 'rgba(0, 0, 0, 0.35)');
  svg.appendChild(maskPath);
  overlay.appendChild(svg);

  // Initial instruction banner like Awesome Screenshot
  const hintBanner = document.createElement('div');
  hintBanner.id = 'hanishot-crop-hint';
  hintBanner.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
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

  // The selection border rectangle (completely transparent inside, NO box-shadow)
  const selectionBox = document.createElement('div');
  selectionBox.id = 'hanishot-selection-box';
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px dashed #06b6d4;
    background: transparent;
    display: none;
    pointer-events: none;
  `;

  // Floating toolbar with frosted glass effect (never solid dark opaque)
  const toolbar = document.createElement('div');
  toolbar.id = 'hanishot-crop-toolbar';
  toolbar.style.cssText = `
    position: absolute;
    display: none;
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 6px 12px;
    gap: 8px;
    align-items: center;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    z-index: 2;
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
    background: rgba(255, 255, 255, 0.12);
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.1);
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

  // Set initial backdrop (full semi-transparent veil)
  function renderMask(left = 0, top = 0, width = 0, height = 0) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (width > 2 && height > 2) {
      // Outer rect + cutout inner rect via evenodd rule
      maskPath.setAttribute('d', `M 0 0 H ${W} V ${H} H 0 Z M ${left} ${top} V ${top + height} H ${left + width} V ${top} Z`);
    } else {
      // Full veil before dragging starts
      maskPath.setAttribute('d', `M 0 0 H ${W} V ${H} H 0 Z`);
    }
  }

  renderMask();

  function updateBox(x1, y1, x2, y2) {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    if (width > 3 || height > 3) {
      hintBanner.style.opacity = '0';
      hasSelection = true;
    }

    // Update SVG cutout hole
    renderMask(left, top, width, height);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.display = 'block';

    sizeBadge.textContent = `${Math.round(width)} × ${Math.round(height)} px`;

    // Position toolbar cleanly without occluding
    toolbar.style.display = 'flex';
    let tbTop = top + height + 8;
    if (tbTop + 46 > window.innerHeight) {
      tbTop = top - 44;
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

  window.addEventListener('resize', () => {
    if (hasSelection) {
      const rect = selectionBox.getBoundingClientRect();
      renderMask(rect.left, rect.top, rect.width, rect.height);
    } else {
      renderMask();
    }
  });
})();
