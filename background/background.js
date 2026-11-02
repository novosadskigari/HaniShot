/**
 * HaniShot - Background Service Worker (Manifest V3)
 * Coordinates offscreen recording, screenshot stitching, downloads, and commands.
 */

import { saveMediaItem, getMediaItem } from '../utils/db.js';
import { checkGitHubUpdate } from '../utils/updater.js';

let isRecordingActive = false;
let isPaused = false;
let activeRecordingState = {
  elapsedSeconds: 0,
  partIndex: 1,
  splitGroup: ''
};
let recordingTabId = null;

// Initialize context menus and default storage
chrome.runtime.onInstalled.addListener(() => {
  // Setup periodic GitHub update checks (every 6 hours)
  chrome.alarms.create('check_github_updates', {
    delayInMinutes: 1,
    periodInMinutes: 360
  });
  checkGitHubUpdate();

  chrome.contextMenus.create({
    id: 'hanishot-root',
    title: 'HaniShot',
    contexts: ['page', 'selection', 'image']
  });

  chrome.contextMenus.create({
    id: 'hanishot-capture-visible',
    parentId: 'hanishot-root',
    title: 'Capture Visible Page',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'hanishot-capture-area',
    parentId: 'hanishot-root',
    title: 'Capture Selected Area',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'hanishot-capture-full',
    parentId: 'hanishot-root',
    title: 'Capture Full Page',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'hanishot-capture-visible') {
    captureVisibleTab();
  } else if (info.menuItemId === 'hanishot-capture-area') {
    triggerAreaCrop(tab?.id);
  } else if (info.menuItemId === 'hanishot-capture-full') {
    triggerFullPageCapture(tab?.id);
  }
});

// Alarms handler for background update checking
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check_github_updates') {
    checkGitHubUpdate();
  }
});

// Notification click handler
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'hanishot-crx-update') {
    chrome.runtime.reload();
  } else if (notificationId === 'hanishot-github-update' || notificationId.startsWith('hanishot-')) {
    chrome.tabs.create({ url: 'https://github.com/novosadskigari/HaniShot' });
  }
});

// Automatic runtime update handler
chrome.runtime.onUpdateAvailable.addListener(async (details) => {
  const { autoUpdateEnabled = false } = await chrome.storage.local.get({ autoUpdateEnabled: false });
  if (autoUpdateEnabled) {
    chrome.runtime.reload();
  } else {
    chrome.notifications.create('hanishot-crx-update', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: 'HaniShot Update Available',
      message: `Version ${details.version} is ready to install. Click here to restart extension.`,
      priority: 2
    });
  }
});

// Keyboard commands handler
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (command === 'capture-visible') {
      captureVisibleTab();
    } else if (command === 'capture-area') {
      triggerAreaCrop(tabId);
    } else if (command === 'capture-full') {
      triggerFullPageCapture(tabId);
    } else if (command === 'toggle-record') {
      if (isRecordingActive) {
        controlStop();
      } else {
        initiateRecording({ recordType: 'desktop' });
      }
    }
  });
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CHECK_FOR_UPDATES':
      checkGitHubUpdate(true)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'INITIATE_RECORDING':
      initiateRecording(message.data)
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'GET_RECORDING_STATUS':
      sendResponse({
        isRecording: isRecordingActive,
        isPaused,
        ...activeRecordingState
      });
      break;

    case 'CONTROL_PAUSE':
    case 'CONTROL_RESUME':
    case 'CONTROL_TOGGLE_PAUSE':
      toggleRecordingPause();
      sendResponse({ success: true });
      break;

    case 'CONTROL_STOP':
      controlStop()
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'CONTROL_DISCARD':
      controlDiscard();
      sendResponse({ success: true });
      break;

    case 'RECORDING_TICK':
      activeRecordingState = {
        elapsedSeconds: message.data.elapsedSeconds,
        partIndex: message.data.partIndex,
        splitGroup: message.data.splitGroup
      };
      broadcastToTab(recordingTabId, {
        type: 'UPDATE_FLOATING_TIMER',
        data: activeRecordingState
      });
      break;

    case 'RECORDING_STATUS_CHANGE':
      handleRecordingStatusChange(message.data);
      break;

    case 'CHUNK_READY':
      handleChunkReady(message.data);
      break;

    case 'CAPTURE_VISIBLE':
      captureVisibleTab();
      sendResponse({ success: true });
      break;

    case 'TRIGGER_AREA_CROP':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        triggerAreaCrop(tabs[0]?.id);
      });
      sendResponse({ success: true });
      break;

    case 'CAPTURE_AREA_CONFIRMED':
      handleAreaCropConfirmed(message.data, sender?.tab);
      break;

    case 'TRIGGER_FULL_PAGE':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        triggerFullPageCapture(tabs[0]?.id);
      });
      sendResponse({ success: true });
      break;

    case 'CAPTURE_VIEWPORT_TILE':
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, dataUrl => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ dataUrl });
        }
      });
      return true;
  }
});

// --- RECORDING WORKFLOW ---

async function initiateRecording(userConfig = {}) {
  const settings = await chrome.storage.local.get({
    enableSplit: true,
    splitDurationMinutes: 30, // Default 30 min
    videoResolution: '1080p',
    videoFps: '30',
    videoFormat: 'webm',
    autoDownloadVideo: true
  });

  const mergedConfig = { ...settings, ...userConfig };

  // If Tab recording, get streamId
  if (mergedConfig.recordType === 'tab') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found for recording');
    recordingTabId = tab.id;
    mergedConfig.tabStreamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) recordingTabId = tab.id;
  }

  // Ensure offscreen document exists
  await ensureOffscreenDocument();

  // Send start command to offscreen recorder
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'START_RECORDING',
      data: mergedConfig
    }, response => {
      if (response && response.success) {
        isRecordingActive = true;
        isPaused = false;
        // Inject floating controller into the recording tab
        if (recordingTabId) {
          chrome.scripting.executeScript({
            target: { tabId: recordingTabId },
            files: ['content/floating-bar.js']
          }).then(() => {
            broadcastToTab(recordingTabId, { type: 'SHOW_FLOATING_BAR' });
          }).catch(() => {/* tab may not allow content scripts (e.g. chrome://) */});
        }
        resolve();
      } else {
        reject(new Error(response?.error || 'Failed to start offscreen recorder'));
      }
    });
  });
}

function toggleRecordingPause() {
  if (!isRecordingActive) return;
  const command = isPaused ? 'RESUME_RECORDING' : 'PAUSE_RECORDING';
  chrome.runtime.sendMessage({ target: 'offscreen', type: command });
  isPaused = !isPaused;
}

async function controlStop() {
  if (!isRecordingActive) return;
  broadcastToTab(recordingTabId, { type: 'HIDE_FLOATING_BAR' });
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'STOP_RECORDING' });
  isRecordingActive = false;
  isPaused = false;
}

function controlDiscard() {
  if (!isRecordingActive) return;
  broadcastToTab(recordingTabId, { type: 'HIDE_FLOATING_BAR' });
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'DISCARD_RECORDING' });
  isRecordingActive = false;
  isPaused = false;
  closeOffscreenDocument();
}

function handleRecordingStatusChange(data) {
  if (data.state === 'STOPPED' || data.state === 'DISCARDED') {
    isRecordingActive = false;
    isPaused = false;
    broadcastToTab(recordingTabId, { type: 'HIDE_FLOATING_BAR' });
    // Allow offscreen context sufficient time to flush IndexedDB writes and downloads
    setTimeout(() => {
      closeOffscreenDocument();
    }, 2500);
  }
}

async function handleChunkReady(chunkData) {
  // If this was the final chunk of recording session, open Viewer to preview and save
  if (chunkData.isFinal) {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`viewer/viewer.html?id=${chunkData.id}`)
    });
  }
}

// --- OFFSCREEN DOCUMENT LIFECYCLE ---

async function ensureOffscreenDocument() {
  const hasDoc = await chrome.offscreen.hasDocument();
  if (!hasDoc) {
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: ['USER_MEDIA', 'DISPLAY_MEDIA'],
      justification: 'HaniShot screen, tab, and audio recording'
    });
  }
}

async function closeOffscreenDocument() {
  const hasDoc = await chrome.offscreen.hasDocument();
  if (hasDoc) {
    await chrome.offscreen.closeDocument();
  }
}

// --- SCREENSHOT WORKFLOW ---

async function captureVisibleTab() {
  const settings = await chrome.storage.local.get({
    screenshotFormat: 'png',
    autoOpenEditor: 'editor'
  });

  const format = settings.screenshotFormat === 'jpeg' ? 'jpeg' : 'png';

  chrome.tabs.captureVisibleTab(null, { format }, async (dataUrl) => {
    if (chrome.runtime.lastError || !dataUrl) {
      console.error('Visible capture failed:', chrome.runtime.lastError);
      return;
    }

    const timestamp = formatTimestamp(new Date());
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const filename = `HaniShot_Screenshot_${timestamp}.${ext}`;
    const id = `img_${Date.now()}`;

    // Convert dataUrl to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const mediaItem = {
      id,
      name: filename,
      type: 'image',
      dataUrl,
      blob,
      size: blob.size,
      createdAt: Date.now()
    };

    await saveMediaItem(mediaItem);

    if (settings.autoOpenEditor === 'download') {
      triggerDirectDownload(dataUrl, filename);
    } else if (settings.autoOpenEditor === 'both') {
      triggerDirectDownload(dataUrl, filename);
      chrome.tabs.create({ url: chrome.runtime.getURL(`viewer/viewer.html?id=${id}`) });
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL(`viewer/viewer.html?id=${id}`) });
    }
  });
}

function triggerAreaCrop(tabId) {
  if (!tabId) return;
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/area-crop.js']
  });
}

async function handleAreaCropConfirmed(cropRect, tab) {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, async (dataUrl) => {
    if (!dataUrl) return;

    // Use OffscreenCanvas to crop the region
    const imgResponse = await fetch(dataUrl);
    const imgBlob = await imgResponse.blob();
    const imageBitmap = await createImageBitmap(imgBlob);

    const pr = cropRect.pixelRatio || 1;
    const sx = Math.round(cropRect.x * pr);
    const sy = Math.round(cropRect.y * pr);
    const sw = Math.round(cropRect.width * pr);
    const sh = Math.round(cropRect.height * pr);

    const canvas = new OffscreenCanvas(sw, sh);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, sx, sy, sw, sh, 0, 0, sw, sh);

    const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
    const reader = new FileReader();
    reader.readAsDataURL(croppedBlob);
    reader.onloadend = async () => {
      const croppedDataUrl = reader.result;
      const timestamp = formatTimestamp(new Date());
      const filename = `HaniShot_Crop_${timestamp}.png`;
      const id = `crop_${Date.now()}`;

      const mediaItem = {
        id,
        name: filename,
        type: 'image',
        dataUrl: croppedDataUrl,
        blob: croppedBlob,
        size: croppedBlob.size,
        createdAt: Date.now()
      };

      await saveMediaItem(mediaItem);
      chrome.tabs.create({ url: chrome.runtime.getURL(`viewer/viewer.html?id=${id}`) });
    };
  });
}

async function triggerFullPageCapture(tabId) {
  if (!tabId) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/fullpage-scroll.js']
    });

    chrome.tabs.sendMessage(tabId, { type: 'START_FULL_PAGE_CAPTURE' }, async (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        console.error('Full page capture failed:', chrome.runtime.lastError || response?.error);
        return;
      }

      const { tiles, totalHeight, totalWidth, pixelRatio } = response.data;
      if (!tiles || tiles.length === 0) return;

      const fullW = Math.round(totalWidth * pixelRatio);
      const fullH = Math.round(totalHeight * pixelRatio);

      const canvas = new OffscreenCanvas(fullW, fullH);
      const ctx = canvas.getContext('2d');

      for (const tile of tiles) {
        const resp = await fetch(tile.dataUrl);
        const b = await resp.blob();
        const bmp = await createImageBitmap(b);

        const dy = Math.round(tile.scrollY * pixelRatio);
        ctx.drawImage(bmp, 0, dy);
      }

      const fullBlob = await canvas.convertToBlob({ type: 'image/png' });
      const reader = new FileReader();
      reader.readAsDataURL(fullBlob);
      reader.onloadend = async () => {
        const stitchedDataUrl = reader.result;
        const timestamp = formatTimestamp(new Date());
        const filename = `HaniShot_FullPage_${timestamp}.png`;
        const id = `full_${Date.now()}`;

        const mediaItem = {
          id,
          name: filename,
          type: 'image',
          dataUrl: stitchedDataUrl,
          blob: fullBlob,
          size: fullBlob.size,
          createdAt: Date.now()
        };

        await saveMediaItem(mediaItem);
        chrome.tabs.create({ url: chrome.runtime.getURL(`viewer/viewer.html?id=${id}`) });
      };
    });
  } catch (err) {
    console.error('Failed to execute full page script:', err);
  }
}

function triggerDirectDownload(url, filename) {
  chrome.downloads.download({
    url,
    filename,
    saveAs: false
  });
}

function broadcastToTab(tabId, message) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, message, () => {
    // Ignore error if tab doesn't have listener
    if (chrome.runtime.lastError) {}
  });
}

function formatTimestamp(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
