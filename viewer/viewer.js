import { getMediaItem, saveMediaItem } from '../utils/db.js';

let currentMediaItem = null;
let canvas = null;
let ctx = null;
let baseImage = null;

let currentTool = 'select';
let strokeColor = '#ef4444';
let strokeWidth = 4;

let isDrawing = false;
let startX = 0;
let startY = 0;
let undoStack = [];

document.addEventListener('DOMContentLoaded', async () => {
  canvas = document.getElementById('mainCanvas');
  ctx = canvas.getContext('2d');

  setupToolbar();
  setupCanvasEvents();
  await loadTargetMedia();
});

async function loadTargetMedia() {
  const urlParams = new URLSearchParams(window.location.search);
  const mediaId = urlParams.get('id');

  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');

  if (mediaId) {
    // Retry up to 6 times (1.5s total) in case DB transaction is flushing
    for (let attempt = 0; attempt < 6; attempt++) {
      currentMediaItem = await getMediaItem(mediaId);
      if (currentMediaItem) break;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  // Fallback: check pending capture from storage
  if (!currentMediaItem) {
    const data = await chrome.storage.local.get(['pendingCapture']);
    if (data.pendingCapture) {
      currentMediaItem = data.pendingCapture;
      // Also persist to DB if not yet saved
      await saveMediaItem(currentMediaItem);
      await chrome.storage.local.remove(['pendingCapture']);
    }
  }

  if (loadingState) {
    loadingState.style.display = 'none';
  }

  if (!currentMediaItem) {
    document.getElementById('fileNameDisplay').textContent = 'No media loaded';
    if (errorState) {
      errorState.style.display = 'block';
    }
    return;
  }

  document.getElementById('fileNameDisplay').textContent = currentMediaItem.name || 'HaniShot Item';

  if (currentMediaItem.type === 'video') {
    displayVideo(currentMediaItem);
  } else {
    displayImage(currentMediaItem);
  }
}

function displayVideo(item) {
  document.getElementById('imageToolbar').style.display = 'none';
  document.getElementById('canvasWrapper').style.display = 'none';
  document.getElementById('videoWrapper').style.display = 'flex';
  document.getElementById('copyBtn').style.display = 'none';

  const video = document.getElementById('mainVideo');
  if (item.blob) {
    const url = URL.createObjectURL(item.blob);
    video.src = url;
  }

  document.getElementById('metaName').textContent = item.name;
  document.getElementById('metaSize').textContent = formatBytes(item.size);

  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.textContent = '⬇️ Download Video';
  downloadBtn.onclick = () => {
    downloadBlob(item.blob, item.name);
  };
}

function displayImage(item) {
  document.getElementById('imageToolbar').style.display = 'flex';
  document.getElementById('canvasWrapper').style.display = 'block';
  document.getElementById('videoWrapper').style.display = 'none';
  document.getElementById('copyBtn').style.display = 'inline-flex';

  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.textContent = '⬇️ Download';
  downloadBtn.onclick = downloadCanvas;
  document.getElementById('copyBtn').onclick = copyCanvasToClipboard;

  baseImage = new Image();
  baseImage.onload = () => {
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    ctx.drawImage(baseImage, 0, 0);
    saveUndoState();
  };

  if (item.dataUrl) {
    baseImage.src = item.dataUrl;
  } else if (item.blob) {
    baseImage.src = URL.createObjectURL(item.blob);
  }
}

function setupToolbar() {
  const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toolBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.getAttribute('data-tool');
      canvas.style.cursor = currentTool === 'select' ? 'default' : 'crosshair';
    });
  });

  document.getElementById('strokeColor').addEventListener('input', (e) => {
    strokeColor = e.target.value;
  });

  document.getElementById('strokeWidth').addEventListener('change', (e) => {
    strokeWidth = parseInt(e.target.value, 10);
  });

  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('clearBtn').addEventListener('click', clearAnnotations);
}

function saveUndoState() {
  if (undoStack.length >= 15) {
    undoStack.shift();
  }
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function undo() {
  if (undoStack.length > 1) {
    undoStack.pop(); // discard current
    const prevState = undoStack[undoStack.length - 1];
    ctx.putImageData(prevState, 0, 0);
  }
}

function clearAnnotations() {
  if (baseImage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0);
    saveUndoState();
  }
}

function setupCanvasEvents() {
  let tempSnapshot = null;

  canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'select') return;
    const pos = getCanvasPos(e);
    startX = pos.x;
    startY = pos.y;
    isDrawing = true;
    tempSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (currentTool === 'text') {
      const text = prompt('Enter annotation text:');
      if (text) {
        ctx.font = `bold ${strokeWidth * 6}px sans-serif`;
        ctx.fillStyle = strokeColor;
        ctx.fillText(text, startX, startY);
        saveUndoState();
      }
      isDrawing = false;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentTool === 'select') return;
    const pos = getCanvasPos(e);

    if (currentTool === 'pen') {
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = strokeColor;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      // Preview shape
      ctx.putImageData(tempSnapshot, 0, 0);
      drawShape(startX, startY, pos.x, pos.y);
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    const pos = getCanvasPos(e);

    if (currentTool === 'pen') {
      ctx.beginPath();
    } else if (currentTool !== 'select' && currentTool !== 'text') {
      ctx.putImageData(tempSnapshot, 0, 0);
      drawShape(startX, startY, pos.x, pos.y);
    }
    saveUndoState();
  });
}

function drawShape(x1, y1, x2, y2) {
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  if (currentTool === 'rect') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (currentTool === 'arrow') {
    drawArrow(x1, y1, x2, y2);
  } else if (currentTool === 'blur') {
    applyPixelate(x1, y1, x2, y2);
  }
}

function drawArrow(fromx, fromy, tox, toy) {
  const headlen = strokeWidth * 4;
  const angle = Math.atan2(toy - fromy, tox - fromx);

  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function applyPixelate(x1, y1, x2, y2) {
  const left = Math.round(Math.min(x1, x2));
  const top = Math.round(Math.min(y1, y2));
  const w = Math.round(Math.abs(x2 - x1));
  const h = Math.round(Math.abs(y2 - y1));

  if (w <= 0 || h <= 0) return;

  const sampleSize = 10;
  const imgData = ctx.getImageData(left, top, w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y += sampleSize) {
    for (let x = 0; x < w; x += sampleSize) {
      const p = (x + y * w) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];

      for (let n = 0; n < sampleSize && (y + n) < h; n++) {
        for (let m = 0; m < sampleSize && (x + m) < w; m++) {
          const idx = ((x + m) + (y + n) * w) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }
  ctx.putImageData(imgData, left, top);
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

async function copyCanvasToClipboard() {
  canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      const btn = document.getElementById('copyBtn');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = orig, 1800);
    } catch (err) {
      alert('Failed to copy to clipboard: ' + err.message);
    }
  }, 'image/png');
}

function downloadCanvas() {
  const filename = currentMediaItem?.name || `HaniShot_${Date.now()}.png`;
  canvas.toBlob((blob) => {
    downloadBlob(blob, filename);
  }, 'image/png');
}

function downloadBlob(blob, filename) {
  if (!blob) {
    alert('No media data to download.');
    return;
  }
  const url = URL.createObjectURL(blob);
  if (chrome.downloads && chrome.downloads.download) {
    chrome.downloads.download({
      url,
      filename: filename || 'HaniShot_media',
      saveAs: true
    }, () => {
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'HaniShot_media';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
