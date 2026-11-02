document.addEventListener('DOMContentLoaded', async () => {
  const enableBtn = document.getElementById('enableBtn');
  const statusBox = document.getElementById('statusBox');

  async function checkExistingPermission() {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: 'microphone' });
        if (perm.state === 'granted') {
          showSuccess('Microphone permission is already granted! You can close this tab and start recording.');
          enableBtn.style.display = 'none';
          setTimeout(() => window.close(), 1200);
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  function showSuccess(msg) {
    statusBox.className = 'status-box success';
    statusBox.innerHTML = `✅ <strong>Success!</strong> ${msg}`;
  }

  function showError(msg) {
    statusBox.className = 'status-box error';
    statusBox.innerHTML = `⚠️ <strong>Permission Denied or Blocked:</strong> ${msg}<br><br><small>If you previously blocked access, click the lock/sliders icon in the address bar to reset permissions for this extension.</small>`;
  }

  async function requestMicrophone() {
    enableBtn.disabled = true;
    enableBtn.textContent = 'Requesting access...';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      showSuccess('Microphone access granted! Closing tab and returning to your screen...');
      enableBtn.style.display = 'none';

      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (err) {
      console.error('Microphone request failed:', err);
      enableBtn.disabled = false;
      enableBtn.textContent = '🔄 Try Again';
      showError(err.message || 'Microphone access was rejected.');
    }
  }

  enableBtn.addEventListener('click', requestMicrophone);

  const alreadyGranted = await checkExistingPermission();
  if (!alreadyGranted) {
    // Attempt automatic prompt if allowed by browser
    try {
      await requestMicrophone();
    } catch (_) {}
  }
});
