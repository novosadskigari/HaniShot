/**
 * HaniShot - Full Page Scrolling Screenshot Helper
 * Scrolls the document step-by-step and captures viewport tiles.
 */

(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_FULL_PAGE_CAPTURE') {
      executeFullPageCapture()
        .then(result => sendResponse({ success: true, data: result }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }
  });

  async function executeFullPageCapture() {
    const origScrollX = window.scrollX;
    const origScrollY = window.scrollY;

    const body = document.body;
    const html = document.documentElement;

    const totalHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const pixelRatio = window.devicePixelRatio || 1;

    const numSteps = Math.ceil(totalHeight / viewportHeight);
    const tiles = [];

    // Temporarily hide scrollbar to avoid capturing it in tiles
    const origOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    // Show floating progress indicator
    const progressEl = createProgressIndicator();

    try {
      for (let i = 0; i < numSteps; i++) {
        const scrollToY = Math.min(i * viewportHeight, totalHeight - viewportHeight);
        window.scrollTo(0, scrollToY);

        updateProgress(progressEl, i + 1, numSteps);

        // Allow repaint and animation stabilization
        await new Promise(r => setTimeout(r, 200));

        // Request background to capture visible viewport
        const tileDataUrl = await requestViewportTile();

        tiles.push({
          dataUrl: tileDataUrl,
          scrollY: scrollToY,
          isLast: i === numSteps - 1,
          viewportHeight,
          viewportWidth
        });

        if (scrollToY + viewportHeight >= totalHeight) {
          break;
        }
      }
    } finally {
      // Cleanup UI
      if (progressEl && progressEl.parentNode) {
        progressEl.parentNode.removeChild(progressEl);
      }
      html.style.overflow = origOverflow;
      window.scrollTo(origScrollX, origScrollY);
    }

    return {
      tiles,
      totalHeight,
      totalWidth: viewportWidth,
      pixelRatio
    };
  }

  function requestViewportTile() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_VIEWPORT_TILE' }, response => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (response && response.dataUrl) {
          resolve(response.dataUrl);
        } else {
          reject(new Error('Failed to capture tile'));
        }
      });
    });
  }

  function createProgressIndicator() {
    const el = document.createElement('div');
    el.id = 'hanishot-scroll-progress';
    el.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      border: 1px solid #06b6d4;
      color: #f8fafc;
      padding: 12px 20px;
      border-radius: 10px;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    el.innerHTML = `
      <div style="width:14px;height:14px;border:2px solid #06b6d4;border-top-color:transparent;border-radius:50%;animation:hanishot-spin 0.8s linear infinite;"></div>
      <span id="hanishot-progress-text">Capturing full page... (0%)</span>
      <style>@keyframes hanishot-spin { to { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(el);
    return el;
  }

  function updateProgress(el, current, total) {
    if (!el) return;
    const pct = Math.round((current / total) * 100);
    const textSpan = el.querySelector('#hanishot-progress-text');
    if (textSpan) {
      textSpan.textContent = `Capturing full page... (${pct}%) [${current}/${total}]`;
    }
  }
})();
