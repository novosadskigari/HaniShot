/**
 * HaniShot - Offscreen Recording Engine
 * Handles screen/tab capture, Web Audio mixing, MediaRecorder lifecycle,
 * and automated seamless video splitting (default: 30 minutes).
 */

import { saveMediaItem } from '../utils/db.js';

let mediaRecorder = null;
let recordedChunks = [];
let activeStream = null;
let micStream = null;
let audioContext = null;

let isRecording = false;
let isPaused = false;
let isSplitting = false;

let splitTimer = null;
let durationInterval = null;
let elapsedSeconds = 0;
let partIndex = 1;
let sessionStartTime = null;
let splitGroup = '';
let currentConfig = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  switch (message.type) {
    case 'START_RECORDING':
      startRecording(message.data)
        .then(() => sendResponse({ success: true }))
        .catch(err => {
          console.error('Offscreen recording error:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true;

    case 'PAUSE_RECORDING':
      pauseRecording();
      sendResponse({ success: true });
      break;

    case 'RESUME_RECORDING':
      resumeRecording();
      sendResponse({ success: true });
      break;

    case 'STOP_RECORDING':
      stopRecording()
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'DISCARD_RECORDING':
      discardRecording();
      sendResponse({ success: true });
      break;

    case 'GET_STATUS':
      sendResponse({
        isRecording,
        isPaused,
        elapsedSeconds,
        partIndex,
        splitGroup
      });
      break;
  }
});

async function startRecording(config) {
  currentConfig = config;
  partIndex = 1;
  elapsedSeconds = 0;
  recordedChunks = [];
  splitGroup = 'rec_' + Date.now();
  sessionStartTime = new Date();

  // 1. Resolve Video & Audio Constraints based on config
  const fps = parseInt(config.videoFps || '30', 10);
  let videoConstraints = {
    frameRate: { ideal: fps, max: 60 }
  };

  if (config.videoResolution === '1080p') {
    videoConstraints.width = { ideal: 1920 };
    videoConstraints.height = { ideal: 1080 };
  } else if (config.videoResolution === '720p') {
    videoConstraints.width = { ideal: 1280 };
    videoConstraints.height = { ideal: 720 };
  } else {
    // Native / Max up to 4K
    videoConstraints.width = { ideal: 3840 };
    videoConstraints.height = { ideal: 2160 };
  }

  // 2. Acquire Display or Tab Stream
  let stream = null;
  const wantSystemAudio = config.includeSystemAudio !== false;

  if (config.recordType === 'tab' && config.tabStreamId) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: wantSystemAudio ? {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: config.tabStreamId
        }
      } : false,
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: config.tabStreamId,
          maxFrameRate: fps
        }
      }
    });
  } else if (config.recordType === 'camera') {
    stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: config.includeMic ? true : false
    });
  } else {
    // Desktop / Entire Screen
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: videoConstraints,
      audio: wantSystemAudio
    });
  }

  // Handle when user clicks Chrome's native "Stop sharing" bar
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    if (isRecording) {
      stopRecording();
    }
  });

  // 3. Microphone Audio & Web Audio Mixing
  if (config.includeMic && config.recordType !== 'camera') {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: config.micDeviceId ? { deviceId: { exact: config.micDeviceId } } : true,
        video: false
      });
    } catch (e) {
      console.warn('Microphone capture failed, proceeding with screen audio only', e);
    }
  }

  // Mix streams if both system audio and mic are present
  const sysAudioTracks = stream.getAudioTracks();
  const micAudioTracks = micStream ? micStream.getAudioTracks() : [];

  if (sysAudioTracks.length > 0 && micAudioTracks.length > 0) {
    audioContext = new AudioContext();
    const mixedDest = audioContext.createMediaStreamDestination();

    const sysSource = audioContext.createMediaStreamSource(new MediaStream([sysAudioTracks[0]]));
    const micSource = audioContext.createMediaStreamSource(new MediaStream([micAudioTracks[0]]));

    sysSource.connect(mixedDest);
    micSource.connect(mixedDest);

    // If tab recording, keep audio playing for user
    if (config.recordType === 'tab') {
      sysSource.connect(audioContext.destination);
    }

    activeStream = new MediaStream([
      stream.getVideoTracks()[0],
      mixedDest.stream.getAudioTracks()[0]
    ]);
  } else if (micAudioTracks.length > 0 && sysAudioTracks.length === 0) {
    activeStream = new MediaStream([
      stream.getVideoTracks()[0],
      micAudioTracks[0]
    ]);
  } else {
    activeStream = stream;
  }

  // 4. Initialize MediaRecorder
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (config.videoFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (!MediaRecorder.isTypeSupported(mimeType)) {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
    } else {
      mimeType = 'video/webm';
    }
  }

  currentConfig.resolvedMimeType = mimeType;
  setupMediaRecorder(activeStream, mimeType);

  mediaRecorder.start(1000); // 1-second timeslices
  isRecording = true;
  isPaused = false;

  startLiveDurationTimer();
  scheduleAutoSplit();

  notifyStatus('STARTED');
}

function setupMediaRecorder(stream, mimeType) {
  mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000 // 8 Mbps for high fidelity
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    if (isSplitting) {
      await finalizeChunk(false);
      // Restart recorder for next chunk
      setupMediaRecorder(activeStream, currentConfig.resolvedMimeType);
      mediaRecorder.start(1000);
      partIndex++;
      isSplitting = false;
      scheduleAutoSplit();
      notifyStatus('CHUNK_SPLIT');
    } else {
      await finalizeChunk(true);
      cleanUpStreams();
      notifyStatus('STOPPED');
    }
  };
}

async function finalizeChunk(isFinal) {
  if (recordedChunks.length === 0) return;

  const mimeType = currentConfig.resolvedMimeType || 'video/webm';
  const blob = new Blob(recordedChunks, { type: mimeType });
  const currentPart = partIndex;
  recordedChunks = [];

  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
  const timestampStr = formatTimestamp(sessionStartTime || new Date());
  const filename = `HaniShot_${timestampStr}_Part${currentPart}.${ext}`;
  const chunkId = `${splitGroup}_p${currentPart}`;

  // Save chunk into IndexedDB
  const mediaItem = {
    id: chunkId,
    name: filename,
    type: 'video',
    blob: blob,
    mimeType: mimeType,
    size: blob.size,
    partIndex: currentPart,
    splitGroup: splitGroup,
    isFinal: isFinal,
    createdAt: Date.now()
  };

  try {
    await saveMediaItem(mediaItem);
  } catch (err) {
    console.error('Failed to save chunk to IndexedDB:', err);
  }

  // Notify service worker to trigger download or UI update
  chrome.runtime.sendMessage({
    type: 'CHUNK_READY',
    data: {
      id: chunkId,
      filename,
      size: blob.size,
      partIndex: currentPart,
      isFinal,
      autoDownload: currentConfig.autoDownloadVideo !== false
    }
  });
}

function scheduleAutoSplit() {
  clearTimeout(splitTimer);
  const enableSplit = currentConfig.enableSplit !== false;
  const splitMinutes = parseInt(currentConfig.splitDurationMinutes || '30', 10);

  if (!enableSplit || splitMinutes <= 0) return;

  const splitMs = splitMinutes * 60 * 1000;
  splitTimer = setTimeout(() => {
    if (isRecording && !isPaused && mediaRecorder && mediaRecorder.state === 'recording') {
      isSplitting = true;
      mediaRecorder.stop(); // Triggers onstop which creates chunk and resumes
    }
  }, splitMs);
}

function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    isPaused = true;
    notifyStatus('PAUSED');
  }
}

function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    isPaused = false;
    notifyStatus('RESUMED');
  }
}

async function stopRecording() {
  clearTimeout(splitTimer);
  clearInterval(durationInterval);
  isRecording = false;
  isPaused = false;
  isSplitting = false;

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  } else {
    cleanUpStreams();
    notifyStatus('STOPPED');
  }
}

function discardRecording() {
  clearTimeout(splitTimer);
  clearInterval(durationInterval);
  isRecording = false;
  isPaused = false;
  isSplitting = false;
  recordedChunks = [];

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.onstop = null;
    mediaRecorder.stop();
  }
  cleanUpStreams();
  notifyStatus('DISCARDED');
}

function cleanUpStreams() {
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
}

function startLiveDurationTimer() {
  clearInterval(durationInterval);
  durationInterval = setInterval(() => {
    if (isRecording && !isPaused) {
      elapsedSeconds++;
      chrome.runtime.sendMessage({
        type: 'RECORDING_TICK',
        data: {
          elapsedSeconds,
          partIndex,
          splitGroup
        }
      });
    }
  }, 1000);
}

function notifyStatus(state) {
  chrome.runtime.sendMessage({
    type: 'RECORDING_STATUS_CHANGE',
    data: {
      state,
      elapsedSeconds,
      partIndex,
      splitGroup
    }
  });
}

function formatTimestamp(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
