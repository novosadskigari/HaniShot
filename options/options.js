import { getStorageUsage, clearAllMedia } from '../utils/db.js';

const DEFAULT_SETTINGS = {
  enableSplit: true,
  splitDurationMinutes: 30, // Default 30 min per user requirement
  videoResolution: '1080p',
  videoFps: '30',
  videoFormat: 'webm',
  countdownSeconds: '3',
  defaultMic: true,
  defaultSystemAudio: true,
  screenshotFormat: 'png',
  autoOpenEditor: 'editor',
  autoDownloadVideo: true,
  autoUpdateEnabled: false
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await refreshStorageStats();
  await initUpdateSection();
  await initMicPermission();
  setupEventListeners();
});

async function initUpdateSection() {
  const version = chrome.runtime.getManifest().version;
  document.getElementById('currentVersionDisplay').textContent = `v${version}`;

  const data = await chrome.storage.local.get(['updateInfo']);
  if (data.updateInfo && data.updateInfo.updateAvailable) {
    showUpdateAlert(data.updateInfo);
  }
}

function showUpdateAlert(info) {
  const box = document.getElementById('updateAlertBox');
  const title = document.getElementById('alertTitle');
  const body = document.getElementById('alertBody');
  const link = document.getElementById('alertLink');

  if (box && title && body) {
    title.textContent = `New Version v${info.latestVersion} Available!`;
    body.innerHTML = `You are running v${info.localVersion}. To update, run <code>git pull</code> in your cloned folder, then reload the extension in <code>chrome://extensions</code>.`;
    if (info.repoUrl && link) {
      link.href = info.repoUrl;
    }
    box.style.display = 'flex';
  }
}

async function loadSettings() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);

  document.getElementById('enableSplit').checked = settings.enableSplit;
  document.getElementById('splitDurationMinutes').value = settings.splitDurationMinutes;
  document.getElementById('videoResolution').value = settings.videoResolution;
  document.getElementById('videoFps').value = settings.videoFps;
  document.getElementById('videoFormat').value = settings.videoFormat;
  document.getElementById('countdownSeconds').value = settings.countdownSeconds;
  document.getElementById('defaultMic').checked = settings.defaultMic;
  document.getElementById('defaultSystemAudio').checked = settings.defaultSystemAudio;
  document.getElementById('screenshotFormat').value = settings.screenshotFormat;
  document.getElementById('autoOpenEditor').value = settings.autoOpenEditor;
  document.getElementById('autoDownloadVideo').checked = settings.autoDownloadVideo;
  document.getElementById('autoUpdateEnabled').checked = !!settings.autoUpdateEnabled;

  toggleSplitInputs(settings.enableSplit);
  updateActivePreset(settings.splitDurationMinutes);
}

function toggleSplitInputs(enabled) {
  const container = document.getElementById('splitLengthContainer');
  if (enabled) {
    container.style.opacity = '1';
    container.style.pointerEvents = 'auto';
  } else {
    container.style.opacity = '0.4';
    container.style.pointerEvents = 'none';
  }
}

function updateActivePreset(minutes) {
  const buttons = document.querySelectorAll('.preset-btn');
  buttons.forEach(btn => {
    if (parseInt(btn.getAttribute('data-minutes'), 10) === parseInt(minutes, 10)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function setupEventListeners() {
  const enableSplit = document.getElementById('enableSplit');
  const splitInput = document.getElementById('splitDurationMinutes');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearAllStorageBtn');

  enableSplit.addEventListener('change', () => {
    toggleSplitInputs(enableSplit.checked);
    autoSave();
  });

  const defaultMicInput = document.getElementById('defaultMic');
  if (defaultMicInput) {
    defaultMicInput.addEventListener('change', async (e) => {
      if (e.target.checked) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        } catch (err) {
          console.warn('Microphone permission request failed in options:', err);
        }
      }
    });
  }

  splitInput.addEventListener('input', () => {
    const val = parseInt(splitInput.value, 10) || 30;
    updateActivePreset(val);
  });

  splitInput.addEventListener('change', autoSave);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.getAttribute('data-minutes'), 10);
      splitInput.value = minutes;
      updateActivePreset(minutes);
      autoSave();
    });
  });

  // Auto-save on select / toggle changes
  const autoSaveInputs = [
    'videoResolution', 'videoFps', 'videoFormat',
    'countdownSeconds', 'defaultMic', 'defaultSystemAudio',
    'screenshotFormat', 'autoOpenEditor', 'autoDownloadVideo',
    'autoUpdateEnabled'
  ];

  autoSaveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', autoSave);
    }
  });

  saveBtn.addEventListener('click', async () => {
    await saveSettings();
    showStatus('Settings saved successfully!');
  });

  const reloadBtn = document.getElementById('reloadExtensionBtn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      chrome.runtime.reload();
      setTimeout(() => window.location.reload(), 150);
    });
  }

  const checkUpdateBtn = document.getElementById('checkUpdateBtn');
  if (checkUpdateBtn) {
    checkUpdateBtn.addEventListener('click', () => {
      checkUpdateBtn.disabled = true;
      checkUpdateBtn.textContent = 'Checking...';

      chrome.runtime.sendMessage({ type: 'CHECK_FOR_UPDATES' }, (response) => {
        checkUpdateBtn.disabled = false;
        checkUpdateBtn.textContent = 'Check for Updates';

        if (response && response.hasUpdate) {
          showUpdateAlert(response.updateInfo);
        } else if (response && response.success) {
          const statusText = document.getElementById('updateStatusText');
          if (statusText) statusText.textContent = 'You have the latest version installed!';
          alert('You have the latest version of HaniShot installed.');
        } else {
          alert('Could not connect to GitHub. Check your internet connection.');
        }
      });
    });
  }

  clearBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all locally saved HaniShot videos and screenshots? Downloaded files on your disk will NOT be affected.')) {
      await clearAllMedia();
      await refreshStorageStats();
      showStatus('Local cache cleared.');
    }
  });
}

async function getFormSettings() {
  const splitVal = parseInt(document.getElementById('splitDurationMinutes').value, 10);
  return {
    enableSplit: document.getElementById('enableSplit').checked,
    splitDurationMinutes: Math.max(1, isNaN(splitVal) ? 30 : splitVal),
    videoResolution: document.getElementById('videoResolution').value,
    videoFps: document.getElementById('videoFps').value,
    videoFormat: document.getElementById('videoFormat').value,
    countdownSeconds: document.getElementById('countdownSeconds').value,
    defaultMic: document.getElementById('defaultMic').checked,
    defaultSystemAudio: document.getElementById('defaultSystemAudio').checked,
    screenshotFormat: document.getElementById('screenshotFormat').value,
    autoOpenEditor: document.getElementById('autoOpenEditor').value,
    autoDownloadVideo: document.getElementById('autoDownloadVideo').checked,
    autoUpdateEnabled: document.getElementById('autoUpdateEnabled').checked
  };
}

async function saveSettings() {
  const current = await getFormSettings();
  await chrome.storage.local.set(current);
}

let saveTimeout = null;
async function autoSave() {
  await saveSettings();
  clearTimeout(saveTimeout);
  showStatus('Saved');
  saveTimeout = setTimeout(() => {
    const status = document.getElementById('saveStatus');
    status.classList.remove('show');
  }, 2000);
}

function showStatus(msg) {
  const status = document.getElementById('saveStatus');
  status.textContent = msg;
  status.classList.add('show');
}

async function refreshStorageStats() {
  const stats = await getStorageUsage();
  document.getElementById('storageUsed').textContent = `${stats.usageMB} MB`;
}

async function initMicPermission() {
  const statusEl = document.getElementById('micPermStatusText');
  const grantBtn = document.getElementById('grantMicOptionBtn');
  if (!statusEl || !grantBtn) return;

  async function updateStatus() {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: 'microphone' });
        if (perm.state === 'granted') {
          statusEl.innerHTML = '<span style="color: #48bb78; font-weight: 600;">✅ Granted</span> - Microphone is ready for recordings.';
          grantBtn.style.display = 'none';
          return true;
        } else if (perm.state === 'denied') {
          statusEl.innerHTML = '<span style="color: #f56565; font-weight: 600;">❌ Blocked</span> - Blocked in browser settings. Click lock icon in address bar to unblock.';
          grantBtn.style.display = 'none';
          return false;
        }
      }
    } catch (_) {}
    statusEl.innerHTML = '<span style="color: #ecc94b; font-weight: 600;">⚠️ Not Granted</span> - Permission required to record audio.';
    grantBtn.style.display = 'inline-block';
    return false;
  }

  grantBtn.addEventListener('click', async () => {
    grantBtn.disabled = true;
    grantBtn.textContent = 'Requesting...';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      await updateStatus();
    } catch (err) {
      grantBtn.disabled = false;
      grantBtn.textContent = '🎙️ Grant Permission';
      alert('Microphone permission request failed: ' + err.message);
      await updateStatus();
    }
  });

  await updateStatus();
}
