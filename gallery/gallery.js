import { getAllMediaItems, deleteMediaItem, getStorageUsage } from '../utils/db.js';

let allItems = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  await loadGallery();
  setupFilterEvents();
});

async function loadGallery() {
  allItems = await getAllMediaItems();
  updateCounts();
  await updateStorageDisplay();
  renderGrid();
}

function updateCounts() {
  const videos = allItems.filter(i => i.type === 'video');
  const images = allItems.filter(i => i.type === 'image');

  document.getElementById('countAll').textContent = allItems.length;
  document.getElementById('countVideos').textContent = videos.length;
  document.getElementById('countImages').textContent = images.length;
}

async function updateStorageDisplay() {
  const usage = await getStorageUsage();
  document.getElementById('storageUsageDisplay').textContent = `${usage.usageMB} MB`;
}

function setupFilterEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderGrid();
    });
  });

  document.getElementById('refreshBtn').addEventListener('click', loadGallery);
}

function renderGrid() {
  const grid = document.getElementById('mediaGrid');
  const emptyState = document.getElementById('emptyState');

  // Clear existing cards
  const existingCards = grid.querySelectorAll('.media-card');
  existingCards.forEach(c => c.remove());

  const filtered = allItems.filter(item => {
    if (currentFilter === 'video') return item.type === 'video';
    if (currentFilter === 'image') return item.type === 'image';
    return true;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'media-card';

    const isVideo = item.type === 'video';
    const dateStr = new Date(item.createdAt).toLocaleString();
    const sizeStr = formatBytes(item.size);

    let mediaUrl = '';
    if (item.blob) {
      mediaUrl = URL.createObjectURL(item.blob);
    } else if (item.dataUrl) {
      mediaUrl = item.dataUrl;
    }

    card.innerHTML = `
      <div class="card-thumbnail-box" data-id="${item.id}">
        <span class="card-badge-type">${isVideo ? '🎥 Video' : '📸 Screenshot'}</span>
        ${item.partIndex ? `<span class="card-badge-part">Part ${item.partIndex}</span>` : ''}
        ${isVideo
          ? `<video class="card-thumbnail-video" src="${mediaUrl}#t=0.5" preload="metadata"></video>`
          : `<img class="card-thumbnail-img" src="${mediaUrl}" alt="${item.name}" loading="lazy">`
        }
      </div>
      <div class="card-body">
        <div class="card-title" title="${item.name}">${item.name}</div>
        <div class="card-meta">
          <span>${dateStr}</span>
          <span>${sizeStr}</span>
        </div>
        <div class="card-actions">
          <a href="../viewer/viewer.html?id=${item.id}" class="card-action-btn">🔍 View</a>
          <button type="button" class="card-action-btn btn-download" data-id="${item.id}">⬇️ Download</button>
          <button type="button" class="card-action-btn btn-delete" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `;

    // Click thumbnail to open viewer
    card.querySelector('.card-thumbnail-box').addEventListener('click', () => {
      window.location.href = `../viewer/viewer.html?id=${item.id}`;
    });

    // Download handler
    card.querySelector('.btn-download').addEventListener('click', (e) => {
      e.stopPropagation();
      downloadItem(item);
    });

    // Delete handler
    card.querySelector('.btn-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${item.name}" from local storage?`)) {
        await deleteMediaItem(item.id);
        await loadGallery();
      }
    });

    grid.appendChild(card);
  });
}

function downloadItem(item) {
  let url = '';
  if (item.blob) {
    url = URL.createObjectURL(item.blob);
  } else if (item.dataUrl) {
    url = item.dataUrl;
  }
  if (!url) return;

  const a = document.createElement('a');
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    if (item.blob) URL.revokeObjectURL(url);
  }, 100);
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
