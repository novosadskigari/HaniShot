/**
 * HaniShot - Floating In-Page Recording Controller
 * Appears during recording to give instant access to Pause, Resume, Stop, and Timer.
 */

(function () {
  if (document.getElementById('hanishot-floating-bar')) {
    return;
  }

  let bar = null;
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_FLOATING_BAR') {
      createFloatingBar(message.data);
    } else if (message.type === 'HIDE_FLOATING_BAR') {
      removeFloatingBar();
    } else if (message.type === 'UPDATE_FLOATING_TIMER') {
      updateTimer(message.data);
    }
  });

  function createFloatingBar(initialData = {}) {
    if (bar) return;

    bar = document.createElement('div');
    bar.id = 'hanishot-floating-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 30px;
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 2147483646;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      cursor: grab;
    `;

    bar.innerHTML = `
      <div id="hs-pulse-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; animation: hs-pulse 1.2s infinite;"></div>
      <span id="hs-timer-display" style="color: #f8fafc; font-weight: 700; font-size: 14px; font-variant-numeric: tabular-nums;">00:00</span>
      <span id="hs-part-display" style="background: rgba(6, 182, 212, 0.15); color: #38bdf8; font-size: 11px; padding: 2px 6px; border-radius: 10px; font-weight: 600;">Part 1</span>
      <div style="width: 1px; height: 18px; background: #334155;"></div>
      <button id="hs-btn-pause" title="Pause / Resume" style="background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 14px; padding: 4px; display: flex; align-items: center;">⏸️</button>
      <button id="hs-btn-stop" title="Stop & Save" style="background: #ef4444; border: none; border-radius: 50%; width: 26px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">⏹</button>
      <button id="hs-btn-discard" title="Discard" style="background: none; border: none; cursor: pointer; color: #64748b; font-size: 12px; padding: 4px;">✕</button>
      <style>
        @keyframes hs-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      </style>
    `;

    document.body.appendChild(bar);

    const pauseBtn = bar.querySelector('#hs-btn-pause');
    const stopBtn = bar.querySelector('#hs-btn-stop');
    const discardBtn = bar.querySelector('#hs-btn-discard');

    let isPaused = false;
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isPaused) {
        chrome.runtime.sendMessage({ type: 'CONTROL_PAUSE' });
        pauseBtn.textContent = '▶️';
        isPaused = true;
      } else {
        chrome.runtime.sendMessage({ type: 'CONTROL_RESUME' });
        pauseBtn.textContent = '⏸️';
        isPaused = false;
      }
    });

    stopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'CONTROL_STOP' });
      removeFloatingBar();
    });

    discardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Discard this recording without saving?')) {
        chrome.runtime.sendMessage({ type: 'CONTROL_DISCARD' });
        removeFloatingBar();
      }
    });

    // Dragging behavior
    bar.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      bar.style.cursor = 'grabbing';
      const rect = bar.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      bar.style.transform = 'none';
      bar.style.left = `${rect.left}px`;
      bar.style.top = `${rect.top}px`;
      bar.style.bottom = 'auto';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = Math.max(10, Math.min(window.innerWidth - bar.offsetWidth - 10, e.clientX - offsetX));
      const y = Math.max(10, Math.min(window.innerHeight - bar.offsetHeight - 10, e.clientY - offsetY));
      bar.style.left = `${x}px`;
      bar.style.top = `${y}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (bar) bar.style.cursor = 'grab';
      }
    });
  }

  function updateTimer(data) {
    if (!bar) return;
    const timerDisplay = bar.querySelector('#hs-timer-display');
    const partDisplay = bar.querySelector('#hs-part-display');

    if (timerDisplay && data.elapsedSeconds !== undefined) {
      const mins = Math.floor(data.elapsedSeconds / 60);
      const secs = data.elapsedSeconds % 60;
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;

      if (hours > 0) {
        timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      } else {
        timerDisplay.textContent = `${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }

    if (partDisplay && data.partIndex !== undefined) {
      partDisplay.textContent = `Part ${data.partIndex}`;
    }
  }

  function removeFloatingBar() {
    if (bar && bar.parentNode) {
      bar.parentNode.removeChild(bar);
      bar = null;
    }
  }
})();
