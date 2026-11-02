/**
 * HaniShot - Popup Interaction Controller
 */

let currentSettings = {};
let pollTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initSettings();
  await checkUpdateBanner();
  setupUIEvents();
  checkCurrentRecordingStatus();

  // Poll status while popup is open
  pollTimer = setInterval(checkCurrentRecordingStatus, 1000);
});

async function checkUpdateBanner() {
  const data = await chrome.storage.local.get(['updateInfo']);
  if (data.updateInfo && data.updateInfo.updateAvailable) {
    const banner = document.getElementById('updateBanner');
    const title = document.getElementById('updateVersionTitle');
    const desc = document.getElementById('updateDesc');
    if (banner && title && desc) {
      title.textContent = `New update v${data.updateInfo.latestVersion} available!`;
      desc.innerHTML = `Current: v${data.updateInfo.localVersion} • Run <code>git pull</code>`;
      banner.style.display = 'flex';
    }
  }
}

window.addEventListener('unload', () => {
  clearInterval(pollTimer);
});

async function initSettings() {
  currentSettings = await chrome.storage.local.get({
    enableSplit: true,
    splitDurationMinutes: 30,
    defaultMic: true,
    defaultSystemAudio: true,
    countdownSeconds: '3'
  });

  document.getElementById('micToggle').checked = currentSettings.defaultMic;
  document.getElementById('sysAudioToggle').checked = currentSettings.defaultSystemAudio;
  document.getElementById('quickCountdown').value = currentSettings.countdownSeconds;

  const splitText = currentSettings.enableSplit
    ? `${currentSettings.splitDurationMinutes} min`
    : 'Disabled';
  document.getElementById('splitDurationDisplay').textContent = splitText;
  document.getElementById('recSplitLengthText').textContent = splitText;
}

function setupUIEvents() {
  // Tabs: Record Video vs Screenshot
  const tabBtnRecord = document.getElementById('tabBtnRecord');
  const tabBtnCapture = document.getElementById('tabBtnCapture');
  const panelRecord = document.getElementById('panelRecord');
  const panelCapture = document.getElementById('panelCapture');

  tabBtnRecord.addEventListener('click', () => {
    tabBtnRecord.classList.add('active');
    tabBtnCapture.classList.remove('active');
    panelRecord.classList.add('active');
    panelCapture.classList.remove('active');
  });

  tabBtnCapture.addEventListener('click', () => {
    tabBtnCapture.classList.add('active');
    tabBtnRecord.classList.remove('active');
    panelCapture.classList.add('active');
    panelRecord.classList.remove('active');
  });

  // Type selection cards
  const typeCards = document.querySelectorAll('.type-card');
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input');
      radio.checked = true;

      // Camera type hides system audio
      const sysRow = document.getElementById('sysAudioRow');
      if (radio.value === 'camera') {
        sysRow.style.opacity = '0.3';
        sysRow.style.pointerEvents = 'none';
      } else {
        sysRow.style.opacity = '1';
        sysRow.style.pointerEvents = 'auto';
      }
    });
  });

  // Mic toggle permission priming
  document.getElementById('micToggle').addEventListener('change', async (e) => {
    if (e.target.checked) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.warn('Microphone permission request failed on toggle:', err);
      }
    }
  });

  // Start Recording
  document.getElementById('startRecordBtn').addEventListener('click', async () => {
    const selectedType = document.querySelector('input[name="recordType"]:checked').value;
    const includeMic = document.getElementById('micToggle').checked;
    const includeSystemAudio = document.getElementById('sysAudioToggle').checked;
    const countdown = parseInt(document.getElementById('quickCountdown').value, 10);

    const startBtn = document.getElementById('startRecordBtn');
    startBtn.disabled = true;
    startBtn.textContent = 'Initializing...';

    // Prime microphone permission from visible user gesture in popup context
    if (includeMic) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (micErr) {
        console.warn('Microphone permission error in popup:', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          startBtn.disabled = false;
          startBtn.innerHTML = '<span class="record-dot"></span> Start Recording';
          alert('Microphone access was denied. Please allow microphone permission in Chrome for HaniShot to record audio.');
          return;
        }
      }
    }

    const config = {
      recordType: selectedType,
      includeMic,
      includeSystemAudio,
      countdown
    };

    chrome.runtime.sendMessage({
      type: 'INITIATE_RECORDING',
      data: config
    }, response => {
      if (response && response.success) {
        switchToRecordingView();
      } else {
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="record-dot"></span> Start Recording';
        if (response?.error) {
          alert('Failed to start recording: ' + response.error);
        }
      }
    });
  });

  // Active recording controls
  document.getElementById('recPauseBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CONTROL_TOGGLE_PAUSE' });
  });

  document.getElementById('recStopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CONTROL_STOP' });
    switchToIdleView();
  });

  document.getElementById('recDiscardBtn').addEventListener('click', () => {
    if (confirm('Discard recording without saving?')) {
      chrome.runtime.sendMessage({ type: 'CONTROL_DISCARD' });
      switchToIdleView();
    }
  });

  // Screenshot actions
  document.getElementById('btnCaptureVisible').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE' });
    window.close();
  });

  document.getElementById('btnCaptureArea').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_AREA_CROP' });
    window.close();
  });

  document.getElementById('btnCaptureFull').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_FULL_PAGE' });
    window.close();
  });
}

function checkCurrentRecordingStatus() {
  chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATUS' }, response => {
    if (chrome.runtime.lastError || !response) return;

    if (response.isRecording) {
      switchToRecordingView();
      updateTimerDisplay(response.elapsedSeconds);
      document.getElementById('recPartDisplay').textContent = `Part ${response.partIndex || 1}`;

      const pauseBtn = document.getElementById('recPauseBtn');
      if (response.isPaused) {
        pauseBtn.textContent = '▶️ Resume';
      } else {
        pauseBtn.textContent = '⏸️ Pause';
      }
    } else {
      switchToIdleView();
    }
  });
}

function switchToRecordingView() {
  document.getElementById('idleView').style.display = 'none';
  document.getElementById('recordingView').style.display = 'block';
}

function switchToIdleView() {
  document.getElementById('idleView').style.display = 'block';
  document.getElementById('recordingView').style.display = 'none';
  const startBtn = document.getElementById('startRecordBtn');
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.innerHTML = '<span class="record-dot"></span> Start Recording';
  }
}

function updateTimerDisplay(totalSeconds = 0) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;

  const timerEl = document.getElementById('recTimerDisplay');
  if (hours > 0) {
    timerEl.textContent = `${pad(hours)}:${pad(remMins)}:${pad(secs)}`;
  } else {
    timerEl.textContent = `${pad(remMins)}:${pad(secs)}`;
  }
}

function pad(n) {
  return String(n).padStart(2, '0');
}
