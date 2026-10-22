/**
 * HaniShot - GitHub Automatic Update Checker
 * Checks GitHub repository for new releases / version updates.
 */

export const DEFAULT_REPO = 'niceworkdone/HaniShot';
export const GITHUB_RAW_VERSION_URL = 'https://raw.githubusercontent.com/niceworkdone/HaniShot/main/version.json';

export function compareVersions(remote, local) {
  const parse = v => v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const r = parse(remote);
  const l = parse(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const rv = r[i] || 0;
    const lv = l[i] || 0;
    if (rv > lv) return 1;
    if (rv < lv) return -1;
  }
  return 0;
}

export async function checkGitHubUpdate(isManual = false) {
  const localVersion = chrome.runtime.getManifest().version;

  try {
    const response = await fetch(`${GITHUB_RAW_VERSION_URL}?_t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      if (isManual) {
        return { success: false, error: `GitHub response status: ${response.status}` };
      }
      return { success: false };
    }

    const data = await response.json();
    const remoteVersion = data.version;
    const hasUpdate = compareVersions(remoteVersion, localVersion) > 0;

    const updateInfo = {
      updateAvailable: hasUpdate,
      localVersion,
      latestVersion: remoteVersion,
      releaseDate: data.releaseDate || '',
      changelog: data.changelog || '',
      repoUrl: data.repoUrl || `https://github.com/${DEFAULT_REPO}`,
      downloadUrl: data.downloadUrl || `https://github.com/${DEFAULTREPO}/archive/refs/heads/main.zip`,
      lastChecked: Date.now()
    };

    await chrome.storage.local.set({ updateInfo });

    // Update extension icon badge
    if (hasUpdate) {
      chrome.action.setBadgeText({ text: 'NEW' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
      chrome.action.setTitle({
        title: `HaniShot: Update v${remoteVersion} available! Click to view.`
      });
    } else {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({
        title: 'HaniShot Screen Recorder & Screenshot'
      });
    }

    return {
      success: true,
      hasUpdate,
      updateInfo
    };
  } catch (err) {
    console.warn('Update check failed (offline or repo not yet published):', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}
